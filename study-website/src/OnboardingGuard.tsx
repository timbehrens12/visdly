import { useProfile } from './contexts/ProfileContext';
import { useClerkSession } from './lib/clerk';
import { OnboardingModal } from './components/OnboardingModal';
import { type ReactNode } from 'react';

interface OnboardingGuardProps {
    children: ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
    const { isSignedIn } = useClerkSession();
    const { profile, refreshProfile, isLoading } = useProfile();

    // Show onboarding if logged in but not completed
    const showOnboarding = isSignedIn && profile && !profile.onboarding_completed;

    if (isLoading) {
        return null; // Or a subtle loading spinner
    }

    return (
        <>
            {children}
            {showOnboarding && (
                <OnboardingModal 
                    isOpen={true} 
                    onComplete={() => refreshProfile()} 
                />
            )}
        </>
    );
}
