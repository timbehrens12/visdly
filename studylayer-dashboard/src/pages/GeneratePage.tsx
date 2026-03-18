import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, 
    Link as LinkIcon, 
    Type, 
    Youtube, 
    Mic, 
    Book, 
    Sparkles, 
    ArrowRight,
    Search,
    ChevronRight,
    Import,
    StickyNote
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { useDecks } from '../contexts/DecksContext';

type GenerationMethod = 'upload' | 'link' | 'text' | 'youtube' | 'record' | 'subject' | 'anki' | 'quizlet';

interface MethodConfig {
    id: GenerationMethod;
    icon: any;
    image?: string;
    title: string;
    description: string;
    color: string;
    bgColor: string;
}

const METHODS: MethodConfig[] = [
    {
        id: 'upload',
        icon: Upload,
        image: '/dashimages/icons/upload.png',
        title: 'Documents',
        description: 'Upload PDFs, PPTs, Docx or Images',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'youtube',
        icon: Youtube,
        image: '/dashimages/icons/youtube.png',
        title: 'YouTube',
        description: 'Generate from video transcripts',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10'
    },
    {
        id: 'link',
        icon: LinkIcon,
        image: '/dashimages/icons/link.png.png',
        title: 'URL Link',
        description: 'Input any article or webpage URL',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    },
    {
        id: 'text',
        icon: Type,
        image: '/dashimages/icons/book.png',
        title: 'Notes/Text',
        description: 'Paste your notes or any long text',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10'
    },
    {
        id: 'record',
        icon: Mic,
        image: '/dashimages/icons/voice.png',
        title: 'Audio/Voice',
        description: 'Record lecture or upload MP3/WAV',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    },
    {
        id: 'subject',
        icon: Book,
        image: '/dashimages/icons/vocab.png',
        title: 'Subject/Topic',
        description: 'Enter a topic to generate from scratch',
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10'
    },
    {
        id: 'anki',
        icon: Import,
        image: '/dashimages/icons/effects.png',
        title: 'Anki Import',
        description: 'Import .apkg file from Anki',
        color: 'text-sky-500',
        bgColor: 'bg-sky-500/10'
    },
    {
        id: 'quizlet',
        icon: StickyNote,
        image: '/dashimages/icons/quizlet.png',
        title: 'Quizlet',
        description: 'Import from Quizlet set URL',
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10'
    }
];

export default function GeneratePage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { createDeck } = useDecks();

    const currentMethodId = searchParams.get('method') as GenerationMethod || 'upload';
    const currentMethod = METHODS.find(m => m.id === currentMethodId) || METHODS[0];

    // Form states
    const [inputValue, setInputValue] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleMethodSelect = (id: GenerationMethod) => {
        setSearchParams({ method: id });
        setInputValue('');
    };

    const handleGenerate = async () => {
        if (!inputValue && currentMethodId !== 'upload' && currentMethodId !== 'record' && currentMethodId !== 'anki') return;

        setIsGenerating(true);
        // Mock generation progress
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                // Create deck after "generation"
                const deckId = createDeck(`Generated: ${inputValue.slice(0, 20) || currentMethod.title}`);
                navigate(`/edit-deck/${deckId}`);
            }
            setProgress(p);
        }, 300);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-background text-foreground">
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Sidebar: Method Selection */}
                <div className="w-full lg:w-80 shrink-0">
                    <FadeInUp>
                        <h1 className="text-3xl font-black mb-6 tracking-tight">Generate</h1>
                        <div className="space-y-2">
                            {METHODS.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => handleMethodSelect(method.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                        currentMethodId === method.id 
                                        ? 'bg-surface border-brand-primary shadow-lg shadow-brand-primary/10' 
                                        : 'bg-transparent border-transparent hover:bg-surface/50 text-foreground-muted hover:text-foreground'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl ${method.bgColor} flex items-center justify-center ${method.color} shrink-0`}>
                                        {method.image ? (
                                            <img src={method.image} className="w-6 h-6 object-contain" alt="" />
                                        ) : (
                                            (() => {
                                                const Icon = method.icon;
                                                return <Icon className="w-5 h-5" />;
                                            })()
                                        )}
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <p className="font-bold text-sm truncate">{method.title}</p>
                                        <p className="text-[10px] opacity-60 font-medium truncate">{method.description}</p>
                                    </div>
                                    {currentMethodId === method.id && (
                                        <ChevronRight className="w-4 h-4 ml-auto text-brand-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </FadeInUp>
                </div>

                {/* Right Side: Configuration Area */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentMethodId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-sm min-h-[500px] flex flex-col"
                        >
                            {isGenerating ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 mb-6 relative">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-4 border-brand-primary/20 border-t-brand-primary rounded-full"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-brand-primary" />
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-black mb-2">Generating Flashcards...</h2>
                                    <p className="text-foreground-secondary mb-8 font-medium">Sit tight, our AI is reading your material.</p>
                                    
                                    <div className="w-full max-w-md h-3 bg-surface-active rounded-full overflow-hidden border border-border">
                                        <motion.div 
                                            className="h-full bg-brand-primary shadow-[0_0_15px_rgba(var(--brand-primary),0.5)]"
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="mt-4 font-black text-brand-primary">{Math.round(progress)}%</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-10 flex items-start justify-between">
                                        <div>
                                            <div className={`w-16 h-16 rounded-2xl ${currentMethod.bgColor} flex items-center justify-center ${currentMethod.color} mb-4`}>
                                                {currentMethod.image ? (
                                                    <img src={currentMethod.image} className="w-10 h-10 object-contain" alt="" />
                                                ) : (
                                                    (() => {
                                                        const Icon = currentMethod.icon;
                                                        return <Icon className="w-8 h-8" />;
                                                    })()
                                                )}
                                            </div>
                                            <h2 className="text-3xl font-black mb-2">{currentMethod.title}</h2>
                                            <p className="text-foreground-secondary text-lg font-medium">{currentMethod.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-full">AI Enhanced</span>
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full">Pro Feature</span>
                                        </div>
                                    </div>

                                    {/* Input Fields based on method */}
                                    <div className="flex-1 space-y-6">
                                        {(currentMethodId === 'link' || currentMethodId === 'youtube' || currentMethodId === 'quizlet') && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-foreground uppercase tracking-widest ml-1">Paste URL</label>
                                                <input
                                                    type="url"
                                                    placeholder="https://..."
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    className="w-full bg-background border border-border rounded-2xl p-4 md:p-6 text-lg focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all"
                                                />
                                            </div>
                                        )}

                                        {currentMethodId === 'text' && (
                                            <div className="space-y-2 flex-1 flex flex-col">
                                                <label className="text-sm font-black text-foreground uppercase tracking-widest ml-1">Your Notes</label>
                                                <textarea
                                                    placeholder="Paste your content here (min 50 words recommended for best results)..."
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    className="w-full bg-background border border-border rounded-2xl p-6 text-lg focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all resize-none flex-1 min-h-[250px]"
                                                />
                                            </div>
                                        )}

                                        {currentMethodId === 'subject' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-foreground uppercase tracking-widest ml-1">Topic</label>
                                                <div className="relative">
                                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground-muted" />
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Molecular Biology, WWII, Python Programming..."
                                                        value={inputValue}
                                                        onChange={(e) => setInputValue(e.target.value)}
                                                        className="w-full bg-background border border-border rounded-2xl p-6 pl-14 text-lg focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {(currentMethodId === 'upload' || currentMethodId === 'anki') && (
                                            <div 
                                                className="flex-1 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-12 text-center group hover:border-brand-primary hover:bg-brand-primary/5 transition-all cursor-pointer"
                                                onClick={() => {/* Trigger file input */}}
                                            >
                                                <div className="w-20 h-20 rounded-full bg-surface group-hover:bg-brand-primary/10 flex items-center justify-center mb-6 transition-colors shadow-sm">
                                                    <Upload className="w-10 h-10 text-foreground-muted group-hover:text-brand-primary transition-colors" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">Drag & Drop File</h3>
                                                <p className="text-foreground-secondary font-medium max-w-xs">{currentMethodId === 'anki' ? 'Upload .apkg or .csv files' : 'Supports PDF, Docx, PPTX and high-res Images'}</p>
                                                <button className="mt-8 px-8 py-3 bg-foreground text-background font-black rounded-xl hover:scale-105 transition-all text-sm">Browse Files</button>
                                            </div>
                                        )}

                                        {currentMethodId === 'record' && (
                                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="w-32 h-32 rounded-full bg-red-500/10 flex items-center justify-center mb-8 relative group"
                                                >
                                                    <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-0 group-hover:scale-110 transition-transform duration-500"></div>
                                                    <Mic className="w-12 h-12 text-red-500 relative z-10" />
                                                </motion.button>
                                                <h3 className="text-2xl font-black mb-2">Record Lecture</h3>
                                                <p className="text-foreground-secondary font-medium mb-8 max-w-sm">We'll transcribe your lecture live and convert it into structured flashcards.</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-px w-12 bg-border"></div>
                                                    <span className="text-[10px] font-black text-foreground-muted uppercase tracking-widest">OR</span>
                                                    <div className="h-px w-12 bg-border"></div>
                                                </div>
                                                <button className="mt-8 px-8 py-3 border border-border hover:bg-surface rounded-xl transition-all font-bold text-sm">Upload Audio File</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer / Generate Button */}
                                    <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-2">
                                                    {[1,2,3].map(i => (
                                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-surface bg-brand-primary/20 flex items-center justify-center">
                                                            <Sparkles className="w-3 h-3 text-brand-primary shrink-0" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold text-foreground-secondary tracking-tight">4,209 students generated this week</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <button 
                                                onClick={() => navigate(-1)}
                                                className="px-6 py-4 font-bold text-foreground-muted hover:text-foreground transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleGenerate}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-12 py-4 bg-brand-primary text-white font-black rounded-[1.25rem] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] hover:shadow-brand-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                                            >
                                                <span>Generate Deck</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
