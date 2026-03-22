import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Clock, FileText, Sparkles, Layers, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { useDecks, type Deck } from '../contexts/DecksContext';
import { useStudyProgress } from '../contexts/StudyProgressContext';
import { useClerkSession } from '../../lib/clerk';
import { CreateModal } from '../components/CreateModal';
import { CreateFolderModal } from '../components/CreateFolderModal';

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

interface RecentDeckCardProps {
    deck: Deck;
    stats: { averageMastery: number };
    handleDeckClick: (id: string) => void;
    formatLastStudied: (date?: string) => string;
}

const RecentDeckCard = ({ deck, stats, handleDeckClick, formatLastStudied }: RecentDeckCardProps) => (
    <motion.div
        variants={staggerItem}
        onClick={() => handleDeckClick(deck.id)}
        className="group bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all cursor-pointer rounded-[2rem] p-6 relative overflow-hidden flex flex-col h-full"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${deck.color?.startsWith('bg-') ? deck.color : 'bg-brand-primary'}/10 ${deck.color?.startsWith('bg-') ? deck.color.replace('bg-', 'text-') : 'text-brand-primary'} group-hover:scale-110 transition-transform`}>
                <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-background-elevated flex items-center justify-center text-[10px] font-bold text-foreground-muted">
                        {i === 3 ? '+' : ''}
                    </div>
                ))}
            </div>
        </div>

        <h3 className="font-bold text-foreground text-lg mb-2 group-hover:text-brand-primary transition-colors line-clamp-1">
            {deck.title}
        </h3>

        <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-foreground-secondary">{deck.cards.length} cards</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-foreground-muted" />
                <span className="text-xs font-medium text-foreground-muted">{formatLastStudied(deck.lastStudied)}</span>
            </div>
        </div>

        <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground-muted">
                <span>Mastery</span>
                <span>{stats.averageMastery}%</span>
            </div>
            <div className="h-2 bg-background-elevated rounded-full overflow-hidden border border-border">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.averageMastery}%` }}
                    className="h-full bg-brand-primary"
                />
            </div>
        </div>
    </motion.div>
);

export default function DashboardPage() {
    const { userName } = useClerkSession();
    const {
        createFolder,
        recentDecks
    } = useDecks();

    const { getDeckStats, getStreak } = useStudyProgress();
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

    const formatLastStudied = (date?: string) => {
        if (!date) return 'Never studied';
        const d = new Date(date);
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const handleDeckClick = (deckId: string) => {
        navigate(`/edit-deck/${deckId}`);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 lg:py-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                        Welcome back, <span className="text-brand-primary">{userName?.split(' ')[0] || 'Scholar'}</span>!
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    {/* Minimal Streak Badge */}
                    <div className="flex items-center gap-2 pr-4 border-r border-border">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                        <span className="text-sm font-black text-foreground">{getStreak()} day streak</span>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-premium px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all border border-white/10"
                        title="Create New"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">New Deck</span>
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
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {recentDecks.map((d) => {
                            const stats = getDeckStats(d.id, d.cards.map(c => c.id));
                            return (
                                <RecentDeckCard
                                    key={d.id}
                                    deck={d}
                                    stats={stats}
                                    handleDeckClick={handleDeckClick}
                                    formatLastStudied={formatLastStudied}
                                />
                            );
                        })}
                    </motion.div>
                </FadeInUp>
            )}

            {/* Create Section */}
            <FadeInUp delay={0.3} className="mb-12">
                <h2 className="text-xl font-bold text-foreground mb-6">Create</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Upload Card */}
                    <div
                        onClick={() => navigate('/generate/upload')}
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
                        onClick={() => navigate('/generate/text')}
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
