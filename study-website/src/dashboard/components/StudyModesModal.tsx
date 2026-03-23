import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudyModesModalProps {
    isOpen: boolean;
    onClose: () => void;
    deckTitle: string;
}

export const StudyModesModal: React.FC<StudyModesModalProps> = ({ isOpen, onClose, deckTitle }) => {
    const navigate = useNavigate();

    const modes = [
        { 
            name: 'Learn', 
            image: '/dashimages/guide.png.png', 
            path: '/learn', 
            description: 'Adaptive learning path based on your mastery.',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        { 
            name: 'Flashcards', 
            image: '/dashimages/flashcard.png.png', 
            path: '/flashcards', 
            description: 'Classic active recall with spaced repetition.',
            color: 'text-brand-primary',
            bgColor: 'bg-brand-primary/10'
        },
        { 
            name: 'Rapid Fire', 
            image: '/dashimages/puzzle.png.png', 
            path: '/quiz', 
            description: 'Fast-paced multiple choice under pressure.',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10'
        },
        { 
            name: 'Matching', 
            image: '/dashimages/puzzle.png.png', 
            path: '/match', 
            description: 'Connect related terms and concepts fast.',
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10'
        },
        { 
            name: 'Written', 
            image: '/dashimages/writing.png.png', 
            path: '/written', 
            description: 'Type out answers to master terminology.',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
        },
        { 
            name: 'Speaking Drill', 
            image: '/dashimages/speech.png.png', 
            path: '/speaking', 
            description: 'Practice explaining concepts out loud.',
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10'
        },
        { 
            name: 'Practice Test', 
            image: '/dashimages/test.png.png', 
            path: '/test', 
            description: 'Full simulation of your upcoming exam.',
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10'
        },
    ];

    const handleSelectMode = (path: string) => {
        // Since the deck is already set as active in the parent, we just navigate
        navigate(path);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-surface border border-border rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">How would you like to study?</h2>
                                <p className="text-foreground-secondary mt-1 font-medium">Selected: <span className="text-brand-primary">{deckTitle}</span></p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-surface-active rounded-full transition-colors text-foreground-muted hover:text-foreground"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modes Grid */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {modes.map((mode) => (
                                    <button
                                        key={mode.name}
                                        onClick={() => handleSelectMode(mode.path)}
                                        className="flex items-start gap-4 p-4 rounded-3xl border border-border hover:border-brand-primary hover:bg-surface-hover transition-all text-left group"
                                    >
                                        <div className={`w-12 h-12 shrink-0 rounded-2xl ${mode.bgColor} flex items-center justify-center transition-colors overflow-hidden`}>
                                            {mode.image ? (
                                                <img src={mode.image} className="w-8 h-8 object-contain" alt="" />
                                            ) : (
                                                <span className={mode.color}>
                                                    {(() => {
                                                        const Icon = (mode as any).icon;
                                                        return Icon ? <Icon className="w-6 h-6" /> : null;
                                                    })()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-foreground text-lg">{mode.name}</h3>
                                                <ArrowRight className="w-4 h-4 text-foreground-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                            </div>
                                            <p className="text-foreground-secondary text-sm font-medium mt-0.5 leading-relaxed">
                                                {mode.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-surface-active/50 flex justify-center">
                            <p className="text-xs text-foreground-muted font-bold uppercase tracking-widest text-center">
                                Choose a mode to begin your session
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
