import React from 'react';
import { useClerkSession } from '../../lib/clerk';
import { useProfile } from '../../contexts/ProfileContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isSignedIn } = useClerkSession();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'http://localhost:5173';
  const websiteLoginUrl = `${websiteUrl}/login`;
  const websiteOnboardingUrl = `${websiteUrl}/onboarding`;

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Redirect to marketing site login
    window.location.href = websiteLoginUrl;
    return null;
  }

  // Check if onboarding is completed
  if (profile && !profile.onboarding_completed) {
    // Redirect to website onboarding if not completed
    window.location.href = websiteOnboardingUrl;
    return null;
  }

  return <>{children}</>;
}
