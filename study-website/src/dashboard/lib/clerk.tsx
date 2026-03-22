import { ClerkProvider, useAuth as useClerkAuthOriginal, useUser as useClerkUserOriginal, useClerk, SignIn, SignUp, UserButton, SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut } from '@clerk/clerk-react';
import { type ReactNode } from 'react';

// Clerk publishable key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
    if (!CLERK_PUBLISHABLE_KEY) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900 p-8">
                <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border-t-4 border-amber-500">
                    <h1 className="text-2xl font-bold text-white mb-4">⚠️ Configuration Missing</h1>
                    <p className="text-slate-300 mb-6 font-medium">
                        Dashboard: Your <b>Clerk Publishable Key</b> is missing from <code>.env</code>. 
                    </p>
                    <div className="bg-slate-900 p-4 rounded-lg font-mono text-xs text-slate-500">
                        VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
                    </div>
                </div>
            </div>
        );
    }
    return (
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            {children}
        </ClerkProvider>
    );
}

// Custom hooks that wrap Clerk's originals
export function useAuth() {
    return useClerkAuthOriginal();
}

export function useUser() {
    return useClerkUserOriginal();
}

export function SignedIn({ children }: { children: ReactNode }) {
    return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

export function SignedOut({ children }: { children: ReactNode }) {
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
