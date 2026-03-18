import { useRef, useEffect } from 'react';
import {
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecks } from '../contexts/DecksContext';

interface CreateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateModal({ isOpen, onClose }: CreateModalProps) {
    const navigate = useNavigate();
    const { createDeck, setActiveDeck } = useDecks();
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Close on Escape
    useEffect(() => {
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleCreateManual = () => {
        const newDeckId = createDeck('Untitled Deck');
        setActiveDeck(newDeckId);
        onClose();
        navigate(`/edit-deck/${newDeckId}`);
    };

    const generateOptions = [
        {
            title: 'Upload',
            description: 'Upload notes, papers and PDFs.',
            image: '/dashimages/icons/upload.png',
            badge: 'Popular',
            bgColor: 'bg-blue-500/10',
            onClick: () => { navigate('/generate?method=upload'); onClose(); }
        },
        {
            title: 'Record',
            description: 'Record a lecture or upload an audio file.',
            image: '/dashimages/icons/voice.png',
            bgColor: 'bg-purple-500/10',
            onClick: () => { navigate('/generate?method=record'); onClose(); }
        },
        {
            title: 'Import',
            description: 'Import existing questions from a file.',
            image: '/dashimages/icons/folder.png',
            bgColor: 'bg-amber-500/10',
            onClick: () => { navigate('/generate?method=subject'); onClose(); }
        },
        {
            title: 'Text',
            description: 'Type out or paste your notes.',
            image: '/dashimages/icons/book.png',
            bgColor: 'bg-zinc-500/10',
            onClick: () => { navigate('/generate?method=text'); onClose(); }
        },
        {
            title: 'Subject',
            description: 'Enter a topic you want to study.',
            image: '/dashimages/icons/vocab.png',
            bgColor: 'bg-pink-500/10',
            onClick: () => { navigate('/generate?method=subject'); onClose(); }
        },
        {
            title: 'Link',
            description: 'Enter a link to generate from.',
            image: '/dashimages/icons/link.png.png',
            bgColor: 'bg-emerald-500/10',
            onClick: () => { navigate('/generate?method=link'); onClose(); }
        },
        {
            title: 'YouTube Link',
            description: 'Enter a YouTube URL to generate from.',
            image: '/dashimages/icons/youtube.png',
            bgColor: 'bg-red-500/10',
            onClick: () => { navigate('/generate?method=youtube'); onClose(); }
        },
        {
            title: 'Anki',
            description: 'Import flashcards from Anki.',
            image: '/dashimages/icons/effects.png',
            bgColor: 'bg-sky-500/10',
            onClick: () => { navigate('/generate?method=anki'); onClose(); }
        },
        {
            title: 'Quizlet Set',
            description: 'Import flashcards from a Quizlet set.',
            image: '/dashimages/icons/quizlet.png',
            bgColor: 'bg-indigo-500/10',
            onClick: () => { navigate('/generate?method=quizlet'); onClose(); }
        },
        {
            title: 'Manual',
            description: 'Manually create questions.',
            image: '/dashimages/icons/manual.png',
            bgColor: 'bg-rose-500/10',
            onClick: handleCreateManual
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-4xl bg-surface rounded-[2rem] border border-border shadow-2xl overflow-hidden relative z-10 flex flex-col p-8 md:p-12 items-center"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-bold text-foreground mb-3">Generate</h2>
                            <p className="text-foreground-secondary text-lg">Start by choosing your input method below:</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                            {generateOptions.map((option, idx) => (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={option.onClick}
                                    className="group flex items-center gap-4 p-5 bg-background border border-border rounded-2xl text-left hover:bg-surface-hover hover:border-border-strong transition-all active:scale-[0.98]"
                                >
                                    <div className={`w-12 h-12 rounded-xl ${(option as any).bgColor} flex items-center justify-center shrink-0`}>
                                        {(option as any).image ? (
                                            <img src={(option as any).image} className="w-8 h-8 object-contain" alt="" />
                                        ) : (
                                            <span className={(option as any).color}>
                                                {(() => {
                                                    const Icon = (option as any).icon;
                                                    return Icon ? <Icon className="w-6 h-6" /> : null;
                                                })()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors">
                                                {option.title}
                                            </span>
                                            {option.badge && (
                                                <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider">
                                                    {option.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-foreground-secondary text-sm font-medium leading-tight line-clamp-1">
                                            {option.description}
                                        </p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
