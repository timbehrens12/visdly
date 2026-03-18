import React from 'react';
import { useAuth } from '../lib/clerk';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const websiteLoginUrl = `${import.meta.env.VITE_WEBSITE_URL || 'http://localhost:5173'}/login`;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    // Redirect to marketing site login
    window.location.href = websiteLoginUrl;
    return null;
  }

  return <>{children}</>;
}
