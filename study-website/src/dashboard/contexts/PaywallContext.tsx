import React, { createContext, useContext, useState, useEffect } from 'react';
import { PaywallModal } from '../components/PaywallModal';

interface PaywallContextType {
    isPaywallOpen: boolean;
    openPaywall: () => void;
    closePaywall: () => void;
    trialGamesCount: number;
    recordTrialGame: () => void;
    isTrialAvailable: boolean;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

const TRIAL_LIMIT = 2;

export const PaywallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [trialGamesCount, setTrialGamesCount] = useState<number>(() => {
        const saved = localStorage.getItem('studylayer_trial_games_played');
        return saved ? parseInt(saved, 10) : 0;
    });

    useEffect(() => {
        localStorage.setItem('studylayer_trial_games_played', trialGamesCount.toString());
    }, [trialGamesCount]);

    const openPaywall = () => setIsPaywallOpen(true);
    const closePaywall = () => setIsPaywallOpen(false);
    
    const recordTrialGame = () => {
        setTrialGamesCount(prev => prev + 1);
    };

    const isTrialAvailable = trialGamesCount < TRIAL_LIMIT;

    return (
        <PaywallContext.Provider value={{ 
            isPaywallOpen, 
            openPaywall, 
            closePaywall, 
            trialGamesCount, 
            recordTrialGame,
            isTrialAvailable
        }}>
            {children}
            <PaywallModal isOpen={isPaywallOpen} onClose={closePaywall} />
        </PaywallContext.Provider>
    );
};

export const usePaywall = () => {
    const context = useContext(PaywallContext);
    if (context === undefined) {
        throw new Error('usePaywall must be used within a PaywallProvider');
    }
    return context;
};
