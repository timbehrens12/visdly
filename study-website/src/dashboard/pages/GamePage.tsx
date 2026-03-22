import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Settings,
    ChevronDown,
    Zap,
    Puzzle,
    PenTool,
    Mic,
    ClipboardCheck,
    Layers,
    BrainCircuit,
    Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { useDecks } from '../contexts/DecksContext';
import { useStudyProgress } from '../contexts/StudyProgressContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import { usePaywall } from '../contexts/PaywallContext';
import { SettingsModal } from '../components/SettingsModal';
import { CreateModal } from '../components/CreateModal';
import { FlashcardGame } from '../components/FlashcardGame';
import { RapidFireQuiz } from '../components/RapidFireQuiz';
import { MatchGame } from '../components/MatchGame';
import { WrittenGame } from '../components/WrittenGame';
import { SpeakingGame } from '../components/SpeakingGame';
import { TestGame } from '../components/TestGame';
import { LearnMode } from '../components/learn-mode/LearnMode';
import { FadeInUp } from '../components/ui/MotionWrapper';

const GAME_MODES = [
    { name: 'Flashcards', icon: Layers, image: '/dashimages/flashcard.png.png', color: 'text-blue-400', path: '/flashcards', isLocked: false },
    { name: 'Learn', icon: BrainCircuit, image: '/dashimages/guide.png.png', color: 'text-brand-primary', path: '/learn', isLocked: false },
    { name: 'Rapid Fire', icon: Zap, image: '/dashimages/hotdeal.png.png', color: 'text-yellow-400', path: '/quiz', isLocked: false },
    { name: 'Matching', icon: Puzzle, image: '/dashimages/puzzle.png.png', color: 'text-green-400', path: '/match', isLocked: false },
    { name: 'Written', icon: PenTool, image: '/dashimages/writing.png.png', color: 'text-purple-400', path: '/written', isLocked: false },
    { name: 'Speaking Drill', icon: Mic, image: '/dashimages/speech.png.png', color: 'text-red-400', path: '/speaking', isLocked: true },
    { name: 'Practice Test', icon: ClipboardCheck, image: '/dashimages/test.png.png', color: 'text-orange-400', path: '/test', isLocked: true },
];

const CONTENT: Record<string, { title: string; description: string; buttonText: string }> = {
    'Flashcards': {
        title: "Ready to review?",
        description: "Go through your flashcards one by one. Flip them to see the answer and rate your memory.",
        buttonText: "Start Session"
    },
    'Learn': {
        title: "Ready to master?",
        description: "An adaptive 3-round course that teaches you concepts using AI-powered explanations and multiple question types.",
        buttonText: "Start Learning"
    },
    'Rapid Fire': {
        title: "Ready to quiz?",
        description: "Answer questions at a rapid pace to test your quick recall abilities.",
        buttonText: "Start Quiz"
    },
    'Matching': {
        title: "Ready to play?",
        description: "Match all the terms with their definitions as fast as you can. Avoid wrong matches, they add extra time!",
        buttonText: "Start Game"
    },
    'Written': {
        title: "Ready to write?",
        description: "Type the answers to test your full recall of the material without hints.",
        buttonText: "Start Writing"
    },
    'Speaking Drill': {
        title: "Ready to speak?",
        description: "Practice your pronunciation and verbal recall by speaking the answers aloud.",
        buttonText: "Start Speaking"
    },
    'Practice Test': {
        title: "Ready for the exam?",
        description: "Simulate a real exam environment with timed questions and no immediate feedback.",
        buttonText: "Start Test"
    }
};


const DEFAULT_SETTINGS = {
    enableTimer: false,
    cardLimit: 9999,
    soundEffects: false,
    studyDirection: 'term-def',
    subMode: 'basic',
    questionFocus: 'term',
    choiceCount: 4,
    timer: 15,
    matchDepth: '2-way',
    decaySpeed: 'normal',
    gravityLoop: false,
    gravitySpeed: 'normal',
    gravityLives: 3,
    scenarioMix: 30,
    explosionFX: false,
    memoryMode: false,
    similarityThreshold: 85,
    instantFeedback: false,
    autoSanitize: false,
    autoAdvance: false,
    testLength: 20,
    sourceLogic: 'all',
    allowBacktracking: false,
    answerFormat: 'both',
    autoAudio: false,
    shuffle: false,
    smartSort: false,
    favoritesOnly: false,
    includeTF: false,
    includeMCQ: false,
    includeWritten: false,
    includeCase: false,
    includeMatching: false,
    showStreakFx: true
};

interface GamePageProps {
    initialModeName: string;
}

export default function GamePage({ initialModeName }: GamePageProps) {
    const navigate = useNavigate();
    const { setHideSidebar } = useSidebar();
    const { activeDeck } = useDecks();
    const { getDueCards, getDeckStats } = useStudyProgress();
    const { profile } = useProfile();
    const { openPaywall, trialGamesCount, recordTrialGame, isTrialAvailable } = usePaywall();
    const { resolvedTheme } = useTheme();
    const isPro = profile?.plan === 'pro';

    // Mode determination
    const currentMode = GAME_MODES.find(m => m.name === initialModeName) || GAME_MODES[0];
    const isLockedMode = currentMode.isLocked;
    const canUseTrial = isLockedMode && isTrialAvailable && !isPro;
    const isLockedForUser = isLockedMode && !isPro && !canUseTrial;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [gameSettings, setGameSettings] = useState(DEFAULT_SETTINGS);
    const [gameStarted, setGameStarted] = useState(false);
    const [reviewDueOnly, setReviewDueOnly] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeckDropdownOpen, setIsDeckDropdownOpen] = useState(false);
    const [jumpToCardIndex, setJumpToCardIndex] = useState<number | null>(null);

    // Use activeDeck or empty fallback
    const deck = activeDeck || { id: 'none', title: 'No Deck Selected', cards: [], color: 'bg-gray-500' };

    useEffect(() => {
        setHideSidebar(gameStarted);
        return () => setHideSidebar(false);
    }, [gameStarted, setHideSidebar]);

    // Reset game state when mode changes
    useEffect(() => {
        setGameStarted(false);

        // Auto-enable timer for Rapid Fire
        if (currentMode.name === 'Rapid Fire') {
            setGameSettings(prev => ({ ...prev, enableTimer: true }));
        }
    }, [currentMode.name]);

    const handleStartClick = () => {
        if (isLockedForUser) {
            openPaywall();
            return;
        }
        
        // Record trial use if applicable
        if (isLockedMode && !isPro && isTrialAvailable) {
            recordTrialGame();
        }
        
        setGameStarted(true);
    };

    const processedCards = useMemo(() => {
        if (!deck || !deck.cards) return [];
        let cards = [...deck.cards];

        // 1. Filter by Favorites
        if (gameSettings.favoritesOnly) {
            cards = cards.filter(c => c.starred);
        }

        // 2. Filter by Review Status
        if (reviewDueOnly) {
            const dueIds = getDueCards(activeDeck?.id || '', deck.cards.map(c => c.id));
            cards = cards.filter(c => dueIds.includes(c.id));
        }


        // 4. Map to Game Format
        let mappedCards = cards.map(c => ({
            ...c,
            term: c.front,
            definition: c.back,
            id: c.id,
            case: '' // Future proofing
        }));

        // 3. Smart Sort (for Flashcards mode) - Prioritize frequently missed cards
        if (currentMode.name === 'Flashcards' && gameSettings.smartSort) {
            try {
                const learningStats = JSON.parse(localStorage.getItem('studylayer_learning_stats') || '{}');
                mappedCards = mappedCards.sort((a, b) => {
                    const aLearning = learningStats[a.id]?.learningCount || 0;
                    const bLearning = learningStats[b.id]?.learningCount || 0;
                    return bLearning - aLearning; // Higher learning count = more priority
                });
            } catch (e) {
                console.warn('Failed to load learning stats for Smart Sort');
            }
        }

        // 4. Shuffle (if applicable, but not for Smart Sort mode)
        const shouldShuffle = (gameSettings.shuffle && !(currentMode.name === 'Flashcards' && gameSettings.smartSort)) ||
            ['Rapid Fire', 'Matching', 'Gravity', 'Written'].includes(currentMode.name);

        if (shouldShuffle) {
            mappedCards = mappedCards.sort(() => Math.random() - 0.5);
        }

        // 5. Limits
        let limit = gameSettings.cardLimit || deck.cards.length;

        // Special Limit for Speaking Drill
        if (currentMode.name === 'Speaking Drill') {
            limit = Math.min(limit, 30);
        }

        return mappedCards.slice(0, limit);
    }, [deck.cards, gameSettings, reviewDueOnly, currentMode.name, activeDeck?.id]);

    const renderGame = () => {
        if (isLockedForUser) return null;

        const cards = processedCards;

        if (cards.length === 0) {
            // Check if reason is EMPTY DECK vs FILTER
            if (deck.cards.length === 0) {
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-foreground">
                        <h2 className="text-2xl font-bold mb-2">This deck is empty</h2>
                        <p className="text-foreground-secondary mb-6 max-w-sm">
                            You need to add some cards before you can start studying with {currentMode.name}.
                        </p>
                        <div className="btn-wrapper">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className={`btn-custom px-8 py-3 ${resolvedTheme === 'dark' ? 'btn-white' : 'btn-black'}`}
                            >
                                <span className="btn-text">Create Flashcards</span>
                            </button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <p className="text-xl font-bold mb-4">No cards found matching your criteria.</p>
                    <button
                        onClick={() => setGameSettings({ ...gameSettings, favoritesOnly: false })}
                        className="text-brand-primary underline"
                    >
                        Clear Filters
                    </button>
                </div>
            );
        }

        if (currentMode.name === 'Flashcards') {
            return (
                <FlashcardGame
                    settings={gameSettings}
                    cards={cards}
                    isStarredMode={gameSettings.favoritesOnly}
                    onToggleStarred={(val) => setGameSettings({ ...gameSettings, favoritesOnly: val })}
                    jumpToCardIndex={jumpToCardIndex}
                    onJumped={() => setJumpToCardIndex(null)}
                />
            );
        }
        if (currentMode.name === 'Learn') {
            return (
                <LearnMode
                    cards={cards}
                    settings={{
                        autoPlayAudio: true,
                        explanationStyle: 'eli5',
                        testMode: true
                    }}
                    onComplete={() => setGameStarted(false)}
                    onExit={() => setGameStarted(false)}
                />
            );
        }
        if (currentMode.name === 'Rapid Fire') {
            return <RapidFireQuiz settings={gameSettings} cards={cards} />;
        }
        if (currentMode.name === 'Matching') {
            return <MatchGame settings={gameSettings as any} cards={cards} />;
        }
        if (currentMode.name === 'Written') {
            return <WrittenGame settings={gameSettings as any} cards={cards} />;
        }
        if (currentMode.name === 'Speaking Drill') {
            return <SpeakingGame settings={gameSettings as any} cards={cards} />;
        }
        if (currentMode.name === 'Practice Test') {
            return <TestGame settings={gameSettings as any} cards={cards} />;
        }
        return null;
    };

    const content = CONTENT[currentMode.name];

    return (
        <div className="h-screen overflow-hidden bg-background text-foreground flex flex-col" onClick={() => {
            setIsDropdownOpen(false);
            setIsDeckDropdownOpen(false);
        }}>
            {/* Header */}
            <header className="h-16 px-8 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                {/* Left: Module Dropdown */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen((prev) => !prev);
                        }}
                        className="flex items-center gap-2 cursor-pointer text-foreground hover:text-foreground-secondary transition-colors font-bold text-sm"
                    >
                        <img src={currentMode.image} alt={currentMode.name} className="w-5 h-5 object-contain" />
                        <span>{currentMode.name}</span>
                        {isLockedForUser && <Lock className="w-3 h-3 text-brand-primary" />}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, filter: "blur(8px)", x: -20, y: -20 }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, filter: "blur(8px)", x: -20, y: -20 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-[#18181b] border border-black/5 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden p-1.5 origin-top-left"
                            >
                                <div className="space-y-0.5">
                                    {GAME_MODES.map((mode) => (
                                        <button
                                            key={mode.name}
                                            onClick={() => {
                                                navigate(mode.path);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentMode.name === mode.name ? 'bg-brand-primary/10 text-brand-primary' : 'text-foreground hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                                        >
                                            <div className="relative">
                                                <img src={mode.image} alt={mode.name} className={`w-5 h-5 object-contain ${mode.isLocked && !isPro ? 'opacity-40 grayscale' : ''}`} />
                                                {mode.isLocked && !isPro && <Lock className="absolute -top-1 -right-1 w-2.5 h-2.5 text-brand-primary" />}
                                            </div>
                                            <span>{mode.name}</span>
                                            {currentMode.name === mode.name && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                                            )}
                                        </button>
                                    ))}

                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1.5 mx-1"></div>

                                    <Link
                                        to="/"
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <span>Back to Dashboard</span>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Center: Title & Deck Switcher */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDeckDropdownOpen(!isDeckDropdownOpen);
                                setIsDropdownOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-surface-hover transition-all group"
                        >
                            <h1 className="font-bold text-base text-foreground tracking-tight group-hover:text-brand-primary transition-colors">{deck.title}</h1>
                            <ChevronDown className={`w-4 h-4 text-foreground-muted group-hover:text-brand-primary transition-all duration-300 ${isDeckDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                    {currentMode.name === 'Flashcards' && activeDeck && (
                        <button
                            onClick={() => setReviewDueOnly(!reviewDueOnly)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${reviewDueOnly
                                ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                                : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover border border-transparent'
                                }`}
                        >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${reviewDueOnly ? 'bg-brand-primary text-white' : 'bg-surface-active text-foreground-muted'}`}>
                                {(() => {
                                    const stats = getDeckStats(activeDeck.id, activeDeck.cards.map(c => c.id));
                                    return (stats.dueToday || 0) + (stats.newCards || 0);
                                })()}
                            </span>
                            <span className="hidden sm:inline">Review Due</span>
                        </button>
                    )}
                    {!isLockedForUser && currentMode.name !== 'Learn' && (
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    )}
                    <Link
                        to="/"
                        className="w-10 h-10 flex items-center justify-center rounded-full text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
                    >
                        <X className="w-6 h-6" />
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            {gameStarted || (currentMode.name === 'Flashcards' && !isLockedForUser) ? (
                <main className={`flex-1 w-full bg-background relative flex flex-col min-h-0 ${['Matching', 'Gravity', 'Canvas'].includes(currentMode.name) ? 'overflow-hidden' : 'overflow-y-auto'} ${!['Flashcards', 'Matching', 'Practice Test', 'Speaking Drill', 'Canvas'].includes(currentMode.name) ? 'items-center justify-center' : ''}`}>
                    {renderGame()}
                </main>
            ) : (
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full">
                    {isLockedForUser ? (
                        <FadeInUp className="flex flex-col items-center">
                            <div className="w-32 h-32 bg-brand-primary/10 rounded-3xl flex items-center justify-center mb-8">
                                <Lock className="w-12 h-12 text-brand-primary" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Pro Feature</h2>
                            <p className="text-foreground-secondary mb-10 max-w-md">
                                {currentMode.name} is one of our advanced AI-powered study modes. Upgrade to Pro to unlock unlimited access and reach mastery faster.
                            </p>
                             <button 
                                onClick={openPaywall}
                                className="px-10 py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all"
                            >
                                Upgrade to Pro
                            </button>
                        </FadeInUp>
                    ) : (
                        <div className="w-full flex flex-col items-center">
                            <FadeInUp delay={0.1}>
                                <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full"></div>
                                    <img
                                        src={currentMode.image}
                                        alt={currentMode.name}
                                        className="relative z-10 w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </FadeInUp>

                            <FadeInUp delay={0.2}>
                                <div className="flex flex-col items-center gap-2 mb-4">
                                    {!isPro && isLockedMode && isTrialAvailable && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-xs font-black text-brand-primary uppercase tracking-widest mb-2"
                                        >
                                            <Zap className="w-3.5 h-3.5 fill-brand-primary" />
                                            Trial: {2 - trialGamesCount} games left
                                        </motion.div>
                                    )}
                                    <h2 className="text-3xl font-black">{content.title}</h2>
                                </div>
                            </FadeInUp>

                            <FadeInUp delay={0.3}>
                                <p className="text-foreground-secondary mb-10 max-w-md leading-relaxed">
                                    {content.description}
                                </p>
                            </FadeInUp>

                            <FadeInUp delay={0.4} className="w-full max-w-md">
                                <div className="btn-wrapper mb-4 w-full">
                                    <button
                                        onClick={handleStartClick}
                                        className={`btn-custom w-full h-14 rounded-full text-lg shadow-xl ${resolvedTheme === 'dark' ? 'btn-white' : 'btn-black'}`}
                                    >
                                        <span className="btn-text">{content.buttonText}</span>
                                    </button>
                                </div>
                            </FadeInUp>
                        </div>
                    )}
                </main>
            )}

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                mode={currentMode.name}
                description={content.description}
                currentSettings={gameSettings}
                onSave={(s) => setGameSettings(s as any)}
                maxCards={deck.cards.length}
            />
            <CreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
