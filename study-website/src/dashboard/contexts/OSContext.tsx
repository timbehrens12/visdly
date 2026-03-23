import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type OSContextType = {
    isMac: boolean;
    toggleOS: () => void;
};

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider = ({ children }: { children: ReactNode }) => {
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        // Initial check for Mac
        if (navigator.userAgent.indexOf('Mac OS X') !== -1) {
            setIsMac(true);
        }
    }, []);

    const toggleOS = () => setIsMac(prev => !prev);

    return (
        <OSContext.Provider value={{ isMac, toggleOS }}>
            {children}
        </OSContext.Provider>
    );
};

export const useOS = () => {
    const context = useContext(OSContext);
    if (context === undefined) {
        throw new Error('useOS must be used within an OSProvider');
    }
    return context;
};
