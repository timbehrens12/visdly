import { ClerkProvider, useAuth as useClerkAuthOriginal, useUser as useClerkUserOriginal, useClerk, SignIn, SignUp, UserButton, SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut } from '@clerk/clerk-react';
import { type ReactNode, useState, useEffect } from 'react';

// Clerk publishable key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if we are in bypass mode (saved in localStorage)
const isBypassed = typeof window !== 'undefined' && localStorage.getItem('CLERK_BYPASS') === 'true';

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
    const [bypass, setBypass] = useState(isBypassed);

    const toggleBypass = () => {
        const newState = !bypass;
        setBypass(newState);
        localStorage.setItem('CLERK_BYPASS', newState.toString());
        window.location.reload(); // Reload to apply changes across hooks
    };

    // If no key is provided, don't wrap in ClerkProvider to avoid crash
    if (!CLERK_PUBLISHABLE_KEY) {
        return (
            <div className="relative min-h-screen">
                {children}
                <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
                    <div className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold border-2 border-amber-600 animate-pulse">
                        ⚠️ Clerk Key Missing (Check .env.local)
                    </div>
                    <button 
                        onClick={toggleBypass}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold transition-colors"
                    >
                        {bypass ? '🛑 Disable Bypass' : '⚡ Skip/Bypass Clerk'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            {children}
            {/* Still show bypass in dev if key exists but user is lazy */}
            <div className="fixed bottom-4 left-4 z-[9999]">
                 <button 
                    onClick={toggleBypass}
                    className="opacity-20 hover:opacity-100 bg-slate-800 text-white px-2 py-1 rounded text-[10px] transition-all"
                >
                    {bypass ? 'Bypass Active' : 'Dev Bypass'}
                </button>
            </div>
        </ClerkProvider>
    );
}

// Mock auth state for when Clerk is bypassed or missing
const MOCK_AUTH = {
    isLoaded: true,
    isSignedIn: true, // Force true if bypassed
    userId: 'user_2NNE7Y9nqN2ZKy9nqN2ZKy9nqN2',
    sessionId: 'sess_default',
    actor: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    getToken: async () => 'mock_token',
    signOut: async () => {
        localStorage.removeItem('CLERK_BYPASS');
        window.location.reload();
    },
};

const MOCK_USER = {
    isLoaded: true,
    isSignedIn: true,
    user: {
        id: 'user_2NNE7Y9nqN2ZKy9nqN2ZKy9nqN2',
        primaryEmailAddress: { emailAddress: 'dev@visnly.ai' },
        fullName: 'Developer Admin',
        firstName: 'Developer',
        lastName: 'Admin',
        imageUrl: 'https://img.clerk.com/preview.png',
    },
};

// Custom hooks that handle the missing ClerkProvider or Bypass case
export function useAuth() {
    if (isBypassed || !CLERK_PUBLISHABLE_KEY) {
        return { ...MOCK_AUTH, isSignedIn: isBypassed } as any;
    }
    return useClerkAuthOriginal();
}

export function useUser() {
    if (isBypassed || !CLERK_PUBLISHABLE_KEY) {
        return { ...MOCK_USER, isSignedIn: isBypassed, user: isBypassed ? MOCK_USER.user : null } as any;
    }
    return useClerkUserOriginal();
}

export function SignedIn({ children }: { children: ReactNode }) {
    if (isBypassed) return <>{children}</>;
    if (!CLERK_PUBLISHABLE_KEY) return null;
    return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

export function SignedOut({ children }: { children: ReactNode }) {
    if (isBypassed) return null;
    if (!CLERK_PUBLISHABLE_KEY) return <>{children}</>;
    return <ClerkSignedOut>{children}</ClerkSignedOut>;
}

// Re-export other Clerk hooks and components
export { useClerk, SignIn, SignUp, UserButton };

// Helper hook for our specific app needs
export function useClerkSession() {
    const { isLoaded, isSignedIn, userId, signOut, getToken } = useAuth();
    const { user } = useUser();

    return {
        isLoading: !isLoaded,
        isSignedIn: isSignedIn ?? false,
        userId: userId ?? null,
        userEmail: user?.primaryEmailAddress?.emailAddress ?? null,
        userName: user?.fullName ?? user?.firstName ?? null,
        userImageUrl: user?.imageUrl ?? null,
        signOut,
        getToken,
    };
}
