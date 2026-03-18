import { useAuth } from './contexts/AuthContext';
import { OnboardingModal } from './components/OnboardingModal';

export const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, profile, refreshProfile } = useAuth();

    // Show onboarding if logged in but not completed
    const showOnboarding = user && profile && !profile.onboarding_completed;

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
};
