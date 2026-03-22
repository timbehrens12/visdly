import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { useClerkSession } from '../lib/clerk';

// ================================
// Types
// ================================

export interface Card {
    id: string; // Changed to string (UUID) for Supabase consistency
    front: string;
    back: string;
    image?: string;
    starred?: boolean;
    createdAt: string;
}

export interface Deck {
    id: string;
    title: string;
    description?: string;
    cards: Card[];
    folderId?: string | null;
    color: string;
    createdAt: string;
    updatedAt: string;
    lastStudied?: string;
    isDeleted?: boolean;
    deletedAt?: string;
}

export interface Folder {
    id: string; // Changed to string (UUID)
    name: string;
    color: string;
    createdAt: string;
}

interface DecksContextType {
    // Data
    decks: Deck[];
    recentDecks: Deck[];
    folders: Folder[];
    activeDeckId: string | null;
    activeDeck: Deck | null;
    isLoading: boolean;

    // Deck CRUD
    createDeck: (title: string, description?: string, cards?: Omit<Card, 'id' | 'createdAt'>[]) => Promise<string>;
    updateDeck: (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>) => Promise<void>;
    deleteDeck: (id: string) => Promise<void>;
    restoreDeck: (id: string) => Promise<void>;
    permanentlyDeleteDeck: (id: string) => Promise<void>;
    duplicateDeck: (id: string) => Promise<string | null>;
    setActiveDeck: (id: string | null) => void;

    // Card operations on active deck
    addCard: (card: Omit<Card, 'id' | 'createdAt'>) => Promise<void>;
    updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
    deleteCard: (cardId: string) => Promise<void>;
    setCards: (cards: Card[]) => Promise<void>;
    updateDeckTitle: (title: string) => Promise<void>;

    // Folder CRUD
    createFolder: (name: string, color: string) => Promise<string>;
    updateFolder: (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => Promise<void>;
    deleteFolder: (id: string) => Promise<void>;
    moveDeckToFolder: (deckId: string, folderId: string | null) => Promise<void>;

    // Utility
    getDecksInFolder: (folderId: string | null) => Deck[];
    getActiveDecks: () => Deck[];
    getDeletedDecks: () => Deck[];
    getDeckById: (id: string) => Deck | undefined;

    // Import/Export
    importDeck: (deckData: Partial<Deck>) => Promise<string>;
    exportDeck: (id: string) => string | null;
}

// ================================
// Storage Keys
// ================================

const DECKS_STORAGE_KEY = 'viszmo_decks';
const FOLDERS_STORAGE_KEY = 'viszmo_folders';
const ACTIVE_DECK_KEY = 'viszmo_active_deck';

// ================================
// Default Data
// ================================

// Default data removed due to unused variable error.

const generateId = () => `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ================================
// Context
// ================================

const DecksContext = createContext<DecksContextType | undefined>(undefined);

export function DecksProvider({ children }: { children: ReactNode }) {
    const { isSignedIn, getToken } = useClerkSession();
    const [isLoading, setIsLoading] = useState(true);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

    // Initial Load - from localStorage first, then Cloud if signed in
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            
            // 1. Load from local first as buffer
            const localDecks = localStorage.getItem(DECKS_STORAGE_KEY);
            const localFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
            const localActiveId = localStorage.getItem(ACTIVE_DECK_KEY);

            if (localDecks) setDecks(JSON.parse(localDecks));
            if (localFolders) setFolders(JSON.parse(localFolders));
            if (localActiveId) setActiveDeckId(localActiveId);

            // 2. If signed in, fetch from Cloud and sync
            if (isSignedIn) {
                try {
                    const token = await getToken({ template: 'supabase' });
                    const client = getSupabaseClient(token || undefined);

                    // Fetch folders
                    const { data: cloudFolders } = await client.from('folders').select('*');
                    if (cloudFolders) setFolders(cloudFolders as Folder[]);

                    // Fetch decks WITH their cards
                    const { data: cloudDecks } = await client
                        .from('decks')
                        .select(`
                            *,
                            cards (*)
                        `);
                    
                    if (cloudDecks) {
                        const formattedDecks = cloudDecks.map((d: any) => ({
                            ...d,
                            folderId: d.folder_id, // Map snake_case to camelCase
                            cards: d.cards || []
                        }));
                        setDecks(formattedDecks as Deck[]);
                    }
                } catch (error) {
                    console.error('Failed to fetch cloud data:', error);
                }
            }
            
            setIsLoading(false);
        };

        loadInitialData();
    }, [isSignedIn]);

    // Persist to localStorage for offline/faster load
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
            localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
            if (activeDeckId) localStorage.setItem(ACTIVE_DECK_KEY, activeDeckId);
        }
    }, [decks, folders, activeDeckId, isLoading]);

    // Computed: active deck object
    const activeDeck = activeDeckId
        ? decks.find(d => d.id === activeDeckId && !d.isDeleted) || null
        : decks.find(d => !d.isDeleted) || null;

    // Computed: recent decks (top 3 by lastStudied)
    const recentDecks = [...decks]
        .filter(d => !d.isDeleted && d.lastStudied)
        .sort((a, b) => new Date(b.lastStudied!).getTime() - new Date(a.lastStudied!).getTime())
        .slice(0, 3);

    // ================================
    // Helper: Execute with Sync
    // ================================
    
    // Abstracted cloud sync helper
    const cloudRequest = async (operation: (client: any) => Promise<any>) => {
        if (!isSignedIn) return null;
        const token = await getToken({ template: 'supabase' });
        const client = getSupabaseClient(token || undefined);
        return operation(client);
    };

    // ================================
    // Deck Operations
    // ================================

    const createDeck = async (title: string, description?: string, cards?: Omit<Card, 'id' | 'createdAt'>[]): Promise<string> => {
        const newLocalId = generateId();
        const now = new Date().toISOString();

        const newDeck: Deck = {
            id: newLocalId,
            title: title || 'Untitled Deck',
            description,
            cards: [], // Cards handled separately in cloud
            color: 'bg-brand-primary',
            createdAt: now,
            updatedAt: now,
        };

        // Update local state immediately
        setDecks(prev => [...prev, newDeck]);
        setActiveDeckId(newLocalId);

        // Sync to cloud if signed in
        if (isSignedIn) {
            const result = await cloudRequest((client) => 
                client.from('decks').insert({
                    title: newDeck.title,
                    description: newDeck.description,
                    color: newDeck.color,
                }).select().single()
            );

            if (result?.data) {
                // Swap local ID with real cloud ID
                setDecks(prev => prev.map(d => d.id === newLocalId ? { ...d, id: result.data.id } : d));
                setActiveDeckId(result.data.id);
                
                // If cards were provided, insert them too
                if (cards && cards.length > 0) {
                    await cloudRequest((client) => 
                        client.from('cards').insert(cards.map(c => ({ ...c, deck_id: result.data.id })))
                    );
                    // Re-fetch deck to get card IDs
                    const { data: updatedCards } = await (await getSupabaseClient(await getToken() || undefined))
                        .from('cards').select('*').eq('deck_id', result.data.id);
                    if (updatedCards) {
                        setDecks(prev => prev.map(d => d.id === result.data.id ? { ...d, cards: updatedCards } : d));
                    }
                }
                return result.data.id;
            }
        }

        return newLocalId;
    };

    const updateDeck = async (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>) => {
        setDecks(prev => prev.map(deck =>
            deck.id === id
                ? { ...deck, ...updates, updatedAt: new Date().toISOString() }
                : deck
        ));

        if (isSignedIn && !id.startsWith('local_')) {
            await cloudRequest((client) => 
                client.from('decks').update({
                    title: updates.title,
                    description: updates.description,
                    color: updates.color,
                    folder_id: updates.folderId,
                    updated_at: new Date().toISOString()
                }).eq('id', id)
            );
        }
    };

    const deleteDeck = async (id: string) => {
        setDecks(prev => prev.map(deck =>
            deck.id === id
                ? { ...deck, isDeleted: true, deletedAt: new Date().toISOString() }
                : deck
        ));

        if (isSignedIn && !id.startsWith('local_')) {
            await cloudRequest((client) => 
                client.from('decks').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', id)
            );
        }
    };

    const restoreDeck = async (id: string) => {
        setDecks(prev => prev.map(deck =>
            deck.id === id
                ? { ...deck, isDeleted: false, deletedAt: undefined }
                : deck
        ));

        if (isSignedIn && !id.startsWith('local_')) {
            await cloudRequest((client) => 
                client.from('decks').update({ is_deleted: false, deleted_at: null }).eq('id', id)
            );
        }
    };

    const permanentlyDeleteDeck = async (id: string) => {
        setDecks(prev => prev.filter(deck => deck.id !== id));

        if (isSignedIn && !id.startsWith('local_')) {
            await cloudRequest((client) => client.from('decks').delete().eq('id', id));
        }
    };

    const duplicateDeck = async (id: string): Promise<string | null> => {
        const original = decks.find(d => d.id === id);
        if (!original) return null;
        return createDeck(`${original.title} (Copy)`, original.description, original.cards);
    };

    const setActiveDeck = (id: string | null) => {
        setActiveDeckId(id);
    };

    // ================================
    // Card Operations (on active deck)
    // ================================

    const addCard = async (card: Omit<Card, 'id' | 'createdAt'>) => {
        if (!activeDeck) return;
        const localId = generateId();

        setDecks(prev => prev.map(deck => {
            if (deck.id !== activeDeck.id) return deck;
            return {
                ...deck,
                cards: [...deck.cards, { ...card, id: localId, createdAt: new Date().toISOString() }],
                updatedAt: new Date().toISOString()
            };
        }));

        if (isSignedIn && !activeDeck.id.startsWith('local_')) {
            const result = await cloudRequest((client) => 
                client.from('cards').insert({
                    deck_id: activeDeck.id,
                    front: card.front,
                    back: card.back,
                    image: card.image,
                    starred: card.starred
                }).select().single()
            );
            if (result?.data) {
                setDecks(prev => prev.map(d => d.id === activeDeck.id ? {
                    ...d,
                    cards: d.cards.map(c => c.id === localId ? result.data : c)
                } : d));
            }
        }
    };

    const updateCard = async (cardId: string, updates: Partial<Card>) => {
        if (!activeDeck) return;

        setDecks(prev => prev.map(deck => {
            if (deck.id !== activeDeck.id) return deck;
            return {
                ...deck,
                cards: deck.cards.map(c => c.id === cardId ? { ...c, ...updates } : c),
                updatedAt: new Date().toISOString()
            };
        }));

        if (isSignedIn && !cardId.startsWith('local_')) {
            await cloudRequest((client) => 
                client.from('cards').update({
                    front: updates.front,
                    back: updates.back,
                    starred: updates.starred,
                    image: updates.image,
                }).eq('id', cardId)
            );
        }
    };

    const deleteCard = async (cardId: string) => {
        if (!activeDeck) return;

        setDecks(prev => prev.map(deck => {
            if (deck.id !== activeDeck.id) return deck;
            return {
                ...deck,
                cards: deck.cards.filter(c => c.id !== cardId),
                updatedAt: new Date().toISOString()
            };
        }));

        if (isSignedIn && !cardId.startsWith('local_')) {
            await cloudRequest((client) => client.from('cards').delete().eq('id', cardId));
        }
    };

    const setCards = async (cards: Card[]) => {
        if (!activeDeck) return;
        setDecks(prev => prev.map(deck => deck.id === activeDeck.id ? { ...deck, cards } : deck));
        // Note: Batch card sync would depend on specific implementation needs
    };

    const updateDeckTitle = async (title: string) => {
        if (!activeDeck) return;
        await updateDeck(activeDeck.id, { title });
    };

    // ================================
    // Folder Operations
    // ================================

    const createFolder = async (name: string, color: string): Promise<string> => {
        const localId = generateId();
        const newFolder: Folder = {
            id: localId,
            name,
            color,
            createdAt: new Date().toISOString()
        };
        setFolders(prev => [...prev, newFolder]);

        if (isSignedIn) {
            const result = await cloudRequest((client) => 
                client.from('folders').insert({ name, color }).select().single()
            );
            if (result?.data) {
                setFolders(prev => prev.map(f => f.id === localId ? result.data : f));
                return result.data.id;
            }
        }
        return localId;
    };

    const updateFolder = async (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => {
        setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));

        if (isSignedIn && !id.startsWith('local_')) {
            await cloudRequest((client) => 
                client.from('folders').update({ name: updates.name, color: updates.color }).eq('id', id)
            );
        }
    };

    const deleteFolder = async (id: string) => {
        setFolders(prev => prev.filter(f => f.id !== id));
        setDecks(prev => prev.map(deck => deck.folderId === id ? { ...deck, folderId: null } : deck));

        if (isSignedIn && !id.startsWith('local_')) {
            await cloudRequest((client) => client.from('folders').delete().eq('id', id));
        }
    };

    const moveDeckToFolder = async (deckId: string, folderId: string | null) => {
        await updateDeck(deckId, { folderId });
    };

    // ================================
    // Utility Functions
    // ================================

    const getDecksInFolder = (folderId: string | null): Deck[] => {
        return decks.filter(d => d.folderId === folderId && !d.isDeleted);
    };

    const getActiveDecks = (): Deck[] => {
        return decks.filter(d => !d.isDeleted);
    };

    const getDeletedDecks = (): Deck[] => {
        return decks.filter(d => d.isDeleted);
    };

    const getDeckById = (id: string): Deck | undefined => {
        return decks.find(d => d.id === id);
    };

    // ================================
    // Import/Export
    // ================================

    const importDeck = async (deckData: Partial<Deck>): Promise<string> => {
        return createDeck(deckData.title || 'Imported Deck', deckData.description, deckData.cards);
    };

    const exportDeck = (id: string): string | null => {
        const deck = decks.find(d => d.id === id);
        if (!deck) return null;
        return JSON.stringify({ ...deck, exportedAt: new Date().toISOString() });
    };

    return (
        <DecksContext.Provider value={{
            decks,
            recentDecks,
            folders,
            activeDeckId,
            activeDeck,
            isLoading,
            createDeck,
            updateDeck,
            deleteDeck,
            restoreDeck,
            permanentlyDeleteDeck,
            duplicateDeck,
            setActiveDeck,
            addCard,
            updateCard,
            deleteCard,
            setCards,
            updateDeckTitle,
            createFolder,
            updateFolder,
            deleteFolder,
            moveDeckToFolder,
            getDecksInFolder,
            getActiveDecks,
            getDeletedDecks,
            getDeckById,
            importDeck,
            exportDeck
        }}>
            {children}
        </DecksContext.Provider>
    );
}

export function useDecks() {
    const context = useContext(DecksContext);
    if (context === undefined) {
        throw new Error('useDecks must be used within a DecksProvider');
    }
    return context;
}
