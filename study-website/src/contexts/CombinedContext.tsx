import { type ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { OSProvider } from './OSContext';
import { ClerkAuthProvider } from '../lib/clerk';

interface CombinedProviderProps {
    children: ReactNode;
}

export function CombinedProvider({ children }: CombinedProviderProps) {
    return (
        <ThemeProvider>
            <OSProvider>
                <ClerkAuthProvider>
                    {children}
                </ClerkAuthProvider>
            </OSProvider>
        </ThemeProvider>
    );
}
