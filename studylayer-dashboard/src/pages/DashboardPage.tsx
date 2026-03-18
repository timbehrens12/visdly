import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Sparkles, Flame, Sun, Moon, Bell, Layers, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { CreateModal } from '../components/CreateModal';
import { CreateFolderModal } from '../components/CreateFolderModal';
import { RecentDeckCard } from '../components/ui/RecentDeckCard';
import { useDecks } from '../contexts/DecksContext';
import { useTheme } from '../contexts/ThemeContext';
import { useClerkSession } from '../lib/clerk';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { userName, signOut } = useClerkSession();
    const {
        createFolder,
        getActiveDecks,
        setActiveDeck
    } = useDecks();
    const { resolvedTheme, toggleTheme } = useTheme();
    const { getStreak, getDeckStats } = useStudyProgress();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isStreakMenuOpen, setIsStreakMenuOpen] = useState(false);

    const displayName = userName || "Kortez";
    const streak = getStreak();

    // Get recent decks
    const activeDecks = getActiveDecks();
    // const totalCards = activeDecks.reduce((sum, deck) => sum + deck.cards.length, 0); // Unused for now

    const recentDecks = activeDecks
        .sort((a, b) => {
            const dateA = new Date(a.lastStudied || a.createdAt).getTime();
            const dateB = new Date(b.lastStudied || b.createdAt).getTime();
            return dateB - dateA;
        })
        .slice(0, 4); // Increased to 4 to fit grid better on responsive

    const handleDeckClick = (deckId: string) => {
        setActiveDeck(deckId);
        navigate('/flashcards');
    };

    const formatLastStudied = (lastStudied?: string) => {
        if (!lastStudied) return 'Never';
        const date = new Date(lastStudied);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen" onClick={() => {
            setIsNotificationOpen(false);
            setIsStreakMenuOpen(false);
        }}>
            {/* Header Row */}
            <div className="flex items-center justify-between mb-12">
                <FadeInUp>
                    <h1 className="text-3xl font-bold text-foreground">
                        Welcome, {username}
                    </h1>
                </FadeInUp>

                {/* Mini Utility Container */}
                <div className="flex items-center gap-2 p-1.5 bg-surface/50 backdrop-blur-md border border-border rounded-2xl shadow-sm relative z-20">
                    {/* Theme Toggle */}
                    <motion.button
                        whileHover={{ backgroundColor: 'rgba(var(--brand-primary), 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-foreground-muted hover:text-foreground transition-colors"
                        title="Toggle Theme"
                    >
                        {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.button>

                    {/* Notifications */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ backgroundColor: 'rgba(var(--brand-primary), 0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsNotificationOpen(!isNotificationOpen);
                                setIsStreakMenuOpen(false);
                            }}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-foreground-muted hover:text-foreground transition-colors relative ${isNotificationOpen ? 'bg-brand-primary/10 text-brand-primary' : ''}`}
                            title="Notifications"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                        </motion.button>

                        <AnimatePresence>
                            {isNotificationOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-3 w-96 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between p-5 border-b border-border bg-surface-hover/50">
                                        <span className="font-bold text-foreground text-sm">Notifications</span>
                                        <button
                                            onClick={() => setIsNotificationOpen(false)}
                                            className="text-[10px] bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 px-2 py-0.5 rounded-full font-bold transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {/* Notification Item 1 */}
                                        <div className="p-5 border-b border-border hover:bg-surface-hover transition-colors cursor-pointer flex gap-4 group">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-foreground font-semibold leading-tight mb-1">New Deck Added</p>
                                                <p className="text-xs text-foreground-secondary font-medium">"Biology 101" is ready for study.</p>
                                                <p className="text-[10px] text-foreground-muted mt-2 font-semibold">2 min ago</p>
                                            </div>
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                                        </div>

                                        {/* Notification Item 2 */}
                                        <div className="p-5 border-b border-border hover:bg-surface-hover transition-colors cursor-pointer flex gap-4 group">
                                            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <Flame className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-foreground font-semibold leading-tight mb-1">Streak Saved!</p>
                                                <p className="text-xs text-foreground-secondary font-medium">You reached your daily goal.</p>
                                                <p className="text-[10px] text-foreground-muted mt-2 font-semibold">5 hours ago</p>
                                            </div>
                                        </div>

                                        {/* Empty State / End of list */}
                                        <div className="p-4 text-center">
                                            <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest">No more notifications</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-px h-6 bg-border" />

                    {/* Streak Counter */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsStreakMenuOpen(!isStreakMenuOpen);
                                setIsNotificationOpen(false);
                            }}
                            className={`h-10 px-3 flex items-center gap-2 rounded-xl bg-orange-500/10 text-orange-500 font-bold text-sm min-w-[3rem] justify-center hover:bg-orange-500/20 transition-colors ${isStreakMenuOpen ? 'ring-2 ring-orange-500/20' : ''}`}
                            title="Streak"
                        >
                            <Flame className="w-4 h-4 fill-current" />
                            <span>{streak}</span>
                        </motion.button>

                        <AnimatePresence>
                            {isStreakMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-3 w-72 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden p-6 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="w-16 h-16 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center mb-4 relative">
                                        <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"></div>
                                        <Flame className="w-8 h-8 text-orange-500 relative z-10 fill-current" />
                                    </div>

                                    <h3 className="text-2xl font-black text-white mb-1">{streak} Days</h3>
                                    <p className="text-zinc-500 text-sm font-medium mb-6">You're getting smarter every day!</p>

                                    {/* Week Visualization */}
                                    <div className="flex justify-between items-center mb-6 px-1">
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2">
                                                <span className="text-[10px] font-bold text-zinc-600">{day}</span>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 3 ? 'bg-orange-500 text-black' : 'bg-white/5 text-zinc-600'}`}>
                                                    {i < 3 && "✓"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => {
                                            setIsStreakMenuOpen(false);
                                            // Handle whatever "Continue Streak" means, maybe just close or go to study
                                        }}
                                        className="w-full py-2.5 rounded-xl bg-orange-500 text-black font-bold text-sm hover:bg-orange-400 transition-colors"
                                    >
                                        Continue Streak
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-px h-6 bg-border" />

                    {/* Quick Add Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsCreateModalOpen(true);
                            setIsNotificationOpen(false);
                            setIsStreakMenuOpen(false);
                        }}
                        className="flex items-center justify-center w-10 h-10 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90 transition-all border border-white/10"
                        title="Create New"
                    >
                        <Plus className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>


            {/* Recent Decks Section */}
            {recentDecks.length > 0 && (
                <FadeInUp delay={0.1} className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground">Pick up where you left off</h2>
                        <button
                            onClick={() => navigate('/decks')}
                            className="text-sm font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentDecks.map((d, index) => {
                            const stats = getDeckStats(d.id, d.cards.length);
                            return (
                                <RecentDeckCard
                                    key={d.id}
                                    deck={d}
                                    stats={stats}
                                    delay={(index) * 0.05}
                                    handleDeckClick={handleDeckClick}
                                    formatLastStudied={formatLastStudied}
                                />
                            );
                        })}
                    </div>
                </FadeInUp>
            )}

            {/* Create Section */}
            <FadeInUp delay={0.3} className="mb-12">
                <h2 className="text-xl font-bold text-foreground mb-6">Create</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Upload Card */}
                    <div
                        onClick={() => navigate('/generate?method=upload')}
                        className="bg-surface border border-border relative overflow-hidden group hover:border-border-strong transition-all cursor-pointer rounded-[2rem] p-6 h-full hover:bg-surface-hover"
                    >
                        <div className="mb-4 p-3 bg-purple-500/10 text-purple-500 rounded-2xl w-fit">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-foreground text-base mb-1">
                            Upload a PDF, PPT, Video, or Audio
                        </h3>
                        <p className="text-sm text-foreground-secondary leading-relaxed font-medium">
                            Get flashcards or notes instantly.
                        </p>
                    </div>

                    {/* Manual Flashcards Card */}
                    <div
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-surface border border-border relative overflow-hidden group hover:border-border-strong transition-all cursor-pointer rounded-[2rem] p-6 hover:bg-surface-hover h-full"
                    >
                        <div className="mb-4 p-3 bg-orange-500/10 text-orange-500 rounded-2xl w-fit">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-foreground text-base mb-1">
                            Create flashcards manually
                        </h3>
                        <p className="text-sm text-foreground-secondary leading-relaxed font-medium">
                            Create flashcards without AI for free.
                        </p>
                    </div>

                    {/* Manual Notes Card */}
                    <div
                        onClick={() => navigate('/generate?method=text')}
                        className="bg-surface border border-border relative overflow-hidden group hover:border-border-strong transition-all cursor-pointer rounded-[2rem] p-6 hover:bg-surface-hover h-full"
                    >
                        <div className="mb-4 p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-foreground text-base mb-1">
                            Create notes manually
                        </h3>
                        <p className="text-sm text-foreground-secondary leading-relaxed font-medium">
                            Create notes without AI for free.
                        </p>
                    </div>

                </div>
            </FadeInUp>
            {/* Modals */}
            <CreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                onCreate={(name, color) => createFolder(name, color)}
            />
        </div>
    );
}
