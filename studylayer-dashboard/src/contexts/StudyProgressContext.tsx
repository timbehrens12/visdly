import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { useClerkSession } from '../lib/clerk';

// ============================================
// TYPES
// ============================================

// Simple 3-level rating system
export type CardRating = 'still-learning' | 'somewhat' | 'know';

export interface CardProgress {
    cardId: string; // Changed to string
    deckId: string;
    // Spaced repetition values
    easeFactor: number;      // Multiplier for intervals (starts at 2.5)
    interval: number;        // Current interval in days
    repetitions: number;     // Number of successful reviews
    // Timestamps
    lastReviewed: string;    // ISO date string
    nextReview: string;      // ISO date string
    // Card status
    status: 'new' | 'learning' | 'reviewing' | 'mastered';
    // Stats
    timesStudied: number;
    timesCorrect: number;    // "Know" count
    timesSomewhat: number;   // "Somewhat" count
    timesWrong: number;      // "Still Learning" count
}

export interface StudySession {
    id: string;
    deckId: string;
    startTime: string;
    endTime?: string;
    cardsStudied: number;
    correctCount: number;
    somewhatCount: number;
    wrongCount: number;
}

export interface DeckStats {
    totalCards: number;
    newCards: number;
    learningCards: number;
    reviewingCards: number;
    masteredCards: number;
    dueToday: number;
    averageMastery: number;  // 0-100
}

export interface DailyStats {
    date: string;
    cardsStudied: number;
    timeSpentMinutes: number;
    correctCount: number;
    somewhatCount: number;
    wrongCount: number;
}

// ============================================
// CONTEXT
// ============================================

interface StudyProgressContextType {
    // Card progress
    cardProgress: Record<string, CardProgress>;
    updateCardProgress: (deckId: string, cardId: string, rating: CardRating) => Promise<void>;
    getCardProgress: (deckId: string, cardId: string) => CardProgress | null;
    resetCardProgress: (deckId: string, cardId: string) => void;
    resetDeckProgress: (deckId: string) => void;

    // Due cards
    getDueCards: (deckId: string, cardIds: string[]) => string[];
    getNewCards: (deckId: string, cardIds: string[]) => string[];
    getLearningCards: (deckId: string, cardIds: string[]) => string[];

    // Deck stats
    getDeckStats: (deckId: string, cardIds: string[]) => DeckStats;

    // Sessions
    sessions: StudySession[];
    startSession: (deckId: string) => Promise<string>;
    endSession: (sessionId: string) => Promise<void>;
    recordCardResult: (sessionId: string, rating: CardRating) => void;

    // Daily stats
    dailyStats: DailyStats[];
    getTodaysStats: () => DailyStats;
    getWeeklyStats: () => DailyStats[];
    getStreak: () => number;

    // Overall stats
    getTotalCardsStudied: () => number;
    getTotalStudyTime: () => number;
}

const StudyProgressContext = createContext<StudyProgressContextType | undefined>(undefined);

// ============================================
// SPACED REPETITION ALGORITHM (Simplified SM-2)
// ============================================

function calculateNextReview(
    currentProgress: CardProgress | null,
    rating: CardRating
): { interval: number; easeFactor: number; repetitions: number; status: CardProgress['status'] } {
    // Default values for new cards
    let interval = 0;
    let easeFactor = 2.5;
    let repetitions = 0;
    let status: CardProgress['status'] = 'new';

    if (currentProgress) {
        interval = currentProgress.interval;
        easeFactor = currentProgress.easeFactor;
        repetitions = currentProgress.repetitions;
    }

    switch (rating) {
        case 'still-learning':
            repetitions = 0;
            interval = 0;
            easeFactor = Math.max(1.3, easeFactor - 0.3);
            status = 'learning';
            break;

        case 'somewhat':
            if (repetitions === 0) {
                interval = 1;
            } else {
                interval = Math.ceil(interval * 1.2);
            }
            repetitions += 1;
            easeFactor = Math.max(1.3, easeFactor - 0.1);
            status = repetitions >= 2 ? 'reviewing' : 'learning';
            break;

        case 'know':
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 3;
            } else if (repetitions === 2) {
                interval = 7;
            } else {
                interval = Math.ceil(interval * easeFactor);
            }
            repetitions += 1;
            easeFactor = Math.min(3.0, easeFactor + 0.1);

            if (repetitions >= 5 && interval > 21) {
                status = 'mastered';
            } else if (repetitions >= 2) {
                status = 'reviewing';
            } else {
                status = 'learning';
            }
            break;
    }

    return { interval, easeFactor, repetitions, status };
}

// ============================================
// PROVIDER
// ============================================

export function StudyProgressProvider({ children }: { children: ReactNode }) {
    const { isSignedIn, getToken } = useClerkSession();
    const [cardProgress, setCardProgress] = useState<Record<string, CardProgress>>({});
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadProgress = async () => {
            setIsLoading(true);
            
            // 1. Local fallback
            const localProgress = localStorage.getItem('studylayer_card_progress');
            const localSessions = localStorage.getItem('studylayer_sessions');
            const localStats = localStorage.getItem('studylayer_daily_stats');

            if (localProgress) setCardProgress(JSON.parse(localProgress));
            if (localSessions) setSessions(JSON.parse(localSessions));
            if (localStats) setDailyStats(JSON.parse(localStats));

            // 2. Cloud fetch
            if (isSignedIn) {
                try {
                    const token = await getToken({ template: 'supabase' });
                    const client = getSupabaseClient(token || undefined);

                    const { data: cloudProgress } = await client.from('study_progress').select('*');
                    if (cloudProgress) {
                        const progressMap: Record<string, CardProgress> = {};
                        cloudProgress.forEach((p: any) => {
                            progressMap[`${p.deck_id}_${p.card_id}`] = {
                                cardId: p.card_id,
                                deckId: p.deck_id,
                                easeFactor: p.ease_factor,
                                interval: p.interval,
                                repetitions: p.repetitions,
                                status: p.status,
                                lastReviewed: p.last_reviewed,
                                nextReview: p.next_review,
                                timesStudied: p.times_studied,
                                timesCorrect: p.times_correct,
                                timesSomewhat: p.times_somewhat,
                                timesWrong: p.times_wrong
                            } as CardProgress;
                        });
                        setCardProgress(progressMap);
                    }

                    const { data: cloudSessions } = await client.from('study_sessions').select('*').limit(50).order('start_time', { ascending: false });
                    if (cloudSessions) {
                        setSessions(cloudSessions.map((s: any) => ({
                            id: s.id,
                            deckId: s.deck_id,
                            startTime: s.start_time,
                            endTime: s.end_time,
                            cardsStudied: s.cards_studied,
                            correctCount: s.correct_count,
                            somewhatCount: s.somewhat_count,
                            wrongCount: s.wrong_count
                        })));
                    }
                } catch (e) {
                    console.error('Failed to sync study progress with cloud:', e);
                }
            }
            setIsLoading(false);
        };

        loadProgress();
    }, [isSignedIn]);

    // Persist to local
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('studylayer_card_progress', JSON.stringify(cardProgress));
            localStorage.setItem('studylayer_sessions', JSON.stringify(sessions));
            localStorage.setItem('studylayer_daily_stats', JSON.stringify(dailyStats));
        }
    }, [cardProgress, sessions, dailyStats, isLoading]);

    const getProgressKey = (deckId: string, cardId: string) => `${deckId}_${cardId}`;

    // ========== CARD PROGRESS ==========

    const updateCardProgress = async (deckId: string, cardId: string, rating: CardRating) => {
        const key = getProgressKey(deckId, cardId);
        const current = cardProgress[key] || null;
        const { interval, easeFactor, repetitions, status } = calculateNextReview(current, rating);

        const now = new Date();
        const nextReview = new Date(now);
        nextReview.setDate(nextReview.getDate() + interval);

        const updated: CardProgress = {
            cardId,
            deckId,
            easeFactor,
            interval,
            repetitions,
            lastReviewed: now.toISOString(),
            nextReview: nextReview.toISOString(),
            status,
            timesStudied: (current?.timesStudied || 0) + 1,
            timesCorrect: (current?.timesCorrect || 0) + (rating === 'know' ? 1 : 0),
            timesSomewhat: (current?.timesSomewhat || 0) + (rating === 'somewhat' ? 1 : 0),
            timesWrong: (current?.timesWrong || 0) + (rating === 'still-learning' ? 1 : 0),
        };

        setCardProgress(prev => ({ ...prev, [key]: updated }));
        updateDailyStats(rating);

        if (isSignedIn && !cardId.startsWith('local_')) {
            try {
                const token = await getToken();
                const client = getSupabaseClient(token || undefined);
                await client.from('study_progress').upsert({
                    card_id: cardId,
                    deck_id: deckId,
                    ease_factor: easeFactor,
                    interval: interval,
                    repetitions: repetitions,
                    status: status,
                    last_reviewed: updated.lastReviewed,
                    next_review: updated.nextReview,
                    times_studied: updated.timesStudied,
                    times_correct: updated.timesCorrect,
                    times_somewhat: updated.timesSomewhat,
                    times_wrong: updated.timesWrong,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,card_id' });
            } catch (e) {
                console.error('Failed to sync card progress to cloud:', e);
            }
        }
    };

    const getCardProgress = (deckId: string, cardId: string): CardProgress | null => {
        return cardProgress[getProgressKey(deckId, cardId)] || null;
    };

    const resetCardProgress = (deckId: string, cardId: string) => {
        const key = getProgressKey(deckId, cardId);
        setCardProgress(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
        // Note: Cloud delete would happen here
    };

    const resetDeckProgress = (deckId: string) => {
        setCardProgress(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
                if (key.startsWith(`${deckId}_`)) delete updated[key];
            });
            return updated;
        });
    };

    // ========== DUE CARDS ==========

    const getDueCards = (deckId: string, cardIds: string[]): string[] => {
        const now = new Date();
        return cardIds.filter(cardId => {
            const progress = getCardProgress(deckId, cardId);
            if (!progress) return false;
            return new Date(progress.nextReview) <= now;
        });
    };

    const getNewCards = (deckId: string, cardIds: string[]): string[] => {
        return cardIds.filter(cardId => {
            const progress = getCardProgress(deckId, cardId);
            return !progress || progress.status === 'new';
        });
    };

    const getLearningCards = (deckId: string, cardIds: string[]): string[] => {
        return cardIds.filter(cardId => {
            const progress = getCardProgress(deckId, cardId);
            return progress?.status === 'learning';
        });
    };

    // ========== DECK STATS ==========

    const getDeckStats = (deckId: string, cardIds: string[]): DeckStats => {
        const now = new Date();
        let newCards = 0;
        let learningCards = 0;
        let reviewingCards = 0;
        let masteredCards = 0;
        let dueToday = 0;
        let totalMastery = 0;

        cardIds.forEach(cardId => {
            const progress = getCardProgress(deckId, cardId);
            if (!progress) {
                newCards++;
                return;
            }
            switch (progress.status) {
                case 'new': newCards++; break;
                case 'learning': learningCards++; totalMastery += 25; break;
                case 'reviewing': reviewingCards++; totalMastery += 60; break;
                case 'mastered': masteredCards++; totalMastery += 100; break;
            }
            if (new Date(progress.nextReview) <= now) dueToday++;
        });

        const averageMastery = cardIds.length > 0 ? Math.round(totalMastery / cardIds.length) : 0;

        return {
            totalCards: cardIds.length,
            newCards,
            learningCards,
            reviewingCards,
            masteredCards,
            dueToday,
            averageMastery
        };
    };

    // ========== SESSIONS ==========

    const startSession = async (deckId: string): Promise<string> => {
        const localId = `session_${Date.now()}`;
        const session: StudySession = {
            id: localId,
            deckId,
            startTime: new Date().toISOString(),
            cardsStudied: 0,
            correctCount: 0,
            somewhatCount: 0,
            wrongCount: 0
        };
        setSessions(prev => [session, ...prev]);

        if (isSignedIn && !deckId.startsWith('local_')) {
            try {
                const token = await getToken();
                const client = getSupabaseClient(token || undefined);
                const { data } = await client.from('study_sessions').insert({
                    deck_id: deckId,
                    start_time: session.startTime
                }).select().single();
                if (data) {
                    setSessions(prev => prev.map(s => s.id === localId ? { ...s, id: data.id } : s));
                    return data.id;
                }
            } catch (e) {
                console.error('Failed to start cloud session:', e);
            }
        }
        return localId;
    };

    const endSession = async (sessionId: string) => {
        const endTime = new Date().toISOString();
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, endTime } : s));

        if (isSignedIn && !sessionId.startsWith('session_')) {
            try {
                const s = sessions.find(sess => sess.id === sessionId);
                if (s) {
                    const token = await getToken();
                    const client = getSupabaseClient(token || undefined);
                    await client.from('study_sessions').update({
                        end_time: endTime,
                        cards_studied: s.cardsStudied,
                        correct_count: s.correctCount,
                        somewhat_count: s.somewhatCount,
                        wrong_count: s.wrongCount
                    }).eq('id', sessionId);
                }
            } catch (e) {
                console.error('Failed to end cloud session:', e);
            }
        }
    };

    const recordCardResult = (sessionId: string, rating: CardRating) => {
        setSessions(prev => prev.map(s => {
            if (s.id !== sessionId) return s;
            return {
                ...s,
                cardsStudied: s.cardsStudied + 1,
                correctCount: s.correctCount + (rating === 'know' ? 1 : 0),
                somewhatCount: s.somewhatCount + (rating === 'somewhat' ? 1 : 0),
                wrongCount: s.wrongCount + (rating === 'still-learning' ? 1 : 0),
            };
        }));
    };

    // ========== DAILY STATS ==========

    const getTodayKey = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    const updateDailyStats = (rating: CardRating) => {
        const today = getTodayKey();
        setDailyStats(prev => {
            const existing = prev.find(d => d.date === today);
            if (existing) {
                return prev.map(d => d.date === today ? {
                    ...d,
                    cardsStudied: d.cardsStudied + 1,
                    correctCount: d.correctCount + (rating === 'know' ? 1 : 0),
                    somewhatCount: d.somewhatCount + (rating === 'somewhat' ? 1 : 0),
                    wrongCount: d.wrongCount + (rating === 'still-learning' ? 1 : 0),
                } : d);
            } else {
                return [...prev, { date: today, cardsStudied: 1, timeSpentMinutes: 0,
                    correctCount: rating === 'know' ? 1 : 0, somewhatCount: rating === 'somewhat' ? 1 : 0,
                    wrongCount: rating === 'still-learning' ? 1 : 0 }];
            }
        });
    };

    const getTodaysStats = (): DailyStats => {
        const today = getTodayKey();
        return dailyStats.find(d => d.date === today) || { date: today, cardsStudied: 0, timeSpentMinutes: 0,
            correctCount: 0, somewhatCount: 0, wrongCount: 0 };
    };

    const getWeeklyStats = (): DailyStats[] => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        return dailyStats.filter(d => new Date(d.date) >= weekAgo);
    };

    const getStreak = useCallback((): number => {
        if (dailyStats.length === 0) return 0;

        // Use local date strings for consistent date handling
        const today = new Date().toLocaleDateString('en-CA');
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toLocaleDateString('en-CA');

        // Check if there's any study data for today or yesterday
        const hasStudiedToday = dailyStats.some(s => s.date === today && s.cardsStudied > 0);
        const hasStudiedYesterday = dailyStats.some(s => s.date === yesterday && s.cardsStudied > 0);

        if (!hasStudiedToday && !hasStudiedYesterday) return 0;

        let streak = 0;
        let tempDate = new Date(hasStudiedToday ? today : yesterday);

        while (true) {
            const dateStr = tempDate.toLocaleDateString('en-CA');
            const found = dailyStats.find(s => s.date === dateStr && s.cardsStudied > 0);
            
            if (found) {
                streak++;
                tempDate.setDate(tempDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }, [dailyStats]);

    const getTotalCardsStudied = () => dailyStats.reduce((sum, d) => sum + d.cardsStudied, 0);
    const getTotalStudyTime = () => dailyStats.reduce((sum, d) => sum + d.timeSpentMinutes, 0);

    return (
        <StudyProgressContext.Provider value={{
            cardProgress, updateCardProgress, getCardProgress, resetCardProgress, resetDeckProgress,
            getDueCards, getNewCards, getLearningCards, getDeckStats, sessions, startSession,
            endSession, recordCardResult, dailyStats, getTodaysStats, getWeeklyStats, getStreak,
            getTotalCardsStudied, getTotalStudyTime
        }}>
            {children}
        </StudyProgressContext.Provider>
    );
}

export function useStudyProgress() {
    const context = useContext(StudyProgressContext);
    if (context === undefined) throw new Error('useStudyProgress must be used within a StudyProgressProvider');
    return context;
}
