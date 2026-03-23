import { type ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { OSProvider } from './OSContext';
import { ClerkAuthProvider } from '../lib/clerk';
import { ProfileProvider } from './ProfileContext';

interface CombinedProviderProps {
    children: ReactNode;
}

export function CombinedProvider({ children }: CombinedProviderProps) {
    return (
        <ThemeProvider>
            <OSProvider>
                <ClerkAuthProvider>
                    <ProfileProvider>
                        {children}
                    </ProfileProvider>
                </ClerkAuthProvider>
            </OSProvider>
        </ThemeProvider>
    );
}
