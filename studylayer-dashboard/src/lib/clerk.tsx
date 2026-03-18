import { ClerkProvider, useAuth as useClerkAuthOriginal, useUser as useClerkUserOriginal, useClerk, SignIn, SignUp, UserButton, SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut } from '@clerk/clerk-react';
import { type ReactNode, useState } from 'react';

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
        window.location.reload(); 
    };

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
            {/* Show bypass button in bottom left in dev */}
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

const MOCK_AUTH = {
    isLoaded: true,
    isSignedIn: true, 
    userId: 'user_dev_001',
    sessionId: 'sess_dev_001',
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
        id: 'user_dev_001',
        primaryEmailAddress: { emailAddress: 'dev@visnly.ai' },
        fullName: 'Dev Admin',
        firstName: 'Dev',
        lastName: 'Admin',
        imageUrl: 'https://img.clerk.com/preview.png',
    },
};

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

export { useClerk, SignIn, SignUp, UserButton };

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
