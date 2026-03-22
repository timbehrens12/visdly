import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useClerkSession } from '../../lib/clerk';

export interface Transcript {
    id: string;
    profile_id: string;
    title: string;
    content: string;
    duration: string;
    source: 'browser' | 'overlay';
    created_at: string;
}

interface TranscriptsContextType {
    transcripts: Transcript[];
    isLoading: boolean;
    saveTranscript: (transcript: Omit<Transcript, 'id' | 'profile_id' | 'created_at'>) => Promise<Transcript>;
    deleteTranscript: (id: string) => Promise<void>;
    refreshTranscripts: () => Promise<void>;
}

const TranscriptsContext = createContext<TranscriptsContextType | undefined>(undefined);

export const TranscriptsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userId, isSignedIn } = useClerkSession();
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTranscripts = useCallback(async () => {
        if (!userId) return;
        
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('transcripts')
                .select('*')
                .eq('profile_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTranscripts(data || []);
        } catch (err) {
            console.error('Error fetching transcripts:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isSignedIn && userId) {
            fetchTranscripts();
        } else {
            setTranscripts([]);
            setIsLoading(false);
        }
    }, [isSignedIn, userId, fetchTranscripts]);

    const saveTranscript = async (newTranscript: Omit<Transcript, 'id' | 'profile_id' | 'created_at'>) => {
        if (!userId) throw new Error('User not authenticated');

        const transcriptToSave = {
            ...newTranscript,
            profile_id: userId
        };

        try {
            const { data, error } = await supabase
                .from('transcripts')
                .insert([transcriptToSave])
                .select()
                .single();

            if (error) throw error;
            setTranscripts(prev => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Error saving transcript:', err);
            throw err;
        }
    };

    const deleteTranscript = async (id: string) => {
        if (!userId) return;
        try {
            const { error } = await supabase
                .from('transcripts')
                .delete()
                .eq('id', id)
                .eq('profile_id', userId);

            if (error) throw error;
            setTranscripts(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Error deleting transcript:', err);
            throw err;
        }
    };

    const refreshTranscripts = async () => {
        await fetchTranscripts();
    };

    return (
        <TranscriptsContext.Provider value={{ transcripts, isLoading, saveTranscript, deleteTranscript, refreshTranscripts }}>
            {children}
        </TranscriptsContext.Provider>
    );
};

export const useTranscripts = () => {
    const context = useContext(TranscriptsContext);
    if (context === undefined) {
        throw new Error('useTranscripts must be used within a TranscriptsProvider');
    }
    return context;
};
