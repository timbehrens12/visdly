import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { useClerkSession } from '../lib/clerk';

interface Profile {
    id: string;
    onboarding_completed: boolean;
    onboarding_data?: any;
    full_name?: string;
    avatar_url?: string;
    plan: 'free' | 'pro';
    overlay_uses: number;
    updated_at: string;
}

interface ProfileContextType {
    profile: Profile | null;
    isLoading: boolean;
    error: any;
    refreshProfile: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<void>;
    incrementOverlayUses: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userId, userEmail, userName, userImageUrl, isSignedIn, getToken } = useClerkSession();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchProfile = useCallback(async (clerkId: string) => {
        try {
            const token = await getToken({ template: 'supabase' });
            const client = getSupabaseClient(token || undefined);

            const { data, error: fetchError } = await client
                .from('profiles')
                .select('*')
                .eq('id', clerkId)
                .single();

            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    // Profile doesn't exist, create it
                    const { data: newProfile, error: createError } = await client
                        .from('profiles')
                        .insert([
                            {
                                id: clerkId,
                                email: userEmail,
                                full_name: userName,
                                avatar_url: userImageUrl,
                                onboarding_completed: false,
                                plan: 'free',
                                overlay_uses: 0,
                                updated_at: new Date().toISOString()
                            }
                        ])
                        .select()
                        .single();

                    if (createError) throw createError;
                    setProfile(newProfile);
                } else {
                    throw fetchError;
                }
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Error in profile sync:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [userEmail, userName, userImageUrl]);

    useEffect(() => {
        if (isSignedIn && userId) {
            fetchProfile(userId);
        } else if (!isSignedIn) {
            setProfile(null);
            setIsLoading(false);
        }
    }, [isSignedIn, userId, fetchProfile]);

    const refreshProfile = async () => {
        if (userId) {
            setIsLoading(true);
            await fetchProfile(userId);
        }
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!userId) return;
        
        try {
            const token = await getToken({ template: 'supabase' });
            const client = getSupabaseClient(token || undefined);

            const { error: updateError } = await client
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) throw updateError;
            await refreshProfile();
        } catch (err) {
            console.error('Error updating profile:', err);
            throw err;
        }
    };

    const incrementOverlayUses = async () => {
        if (!userId || !profile) return;
        await updateProfile({ overlay_uses: (profile.overlay_uses || 0) + 1 });
    };

    return (
        <ProfileContext.Provider value={{ profile, isLoading, error, refreshProfile, updateProfile, incrementOverlayUses }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};
