import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, 
    Link as LinkIcon, 
    Type, 
    Youtube, 
    Mic, 
    Book, 
    ArrowRight,
    Search,
    ChevronLeft,
    Import,
    StickyNote,
    Square,
    CheckCircle2,
    AlertCircle,
    FileText,
    Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDecks } from '../contexts/DecksContext';
import {
    generateFromText,
    generateFromSubject,
    generateFromURL,
    generateFromYouTube,
    generateFromQuizlet,
    generateFromTranscript,
    generateFromFileText,
    parseCSV,
    type GeneratedCard,
} from '../lib/generateCards';

type GenerationMethod = 'upload' | 'link' | 'text' | 'youtube' | 'record' | 'subject' | 'anki' | 'quizlet' | 'import';

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
    { id: 'upload', icon: Upload, image: '/dashimages/icons/upload.png', title: 'Documents', description: 'Upload PDFs, PPTs, Docx or Images', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { id: 'youtube', icon: Youtube, image: '/dashimages/icons/youtube.png', title: 'YouTube', description: 'Generate from video transcripts', color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { id: 'link', icon: LinkIcon, image: '/dashimages/icons/link.png.png', title: 'URL Link', description: 'Input any article or webpage URL', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    { id: 'text', icon: Type, image: '/dashimages/icons/size.png', title: 'Notes/Text', description: 'Paste your notes or any long text', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { id: 'record', icon: Mic, image: '/dashimages/icons/voice.png', title: 'Audio/Voice', description: 'Record lecture or upload MP3/WAV', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { id: 'subject', icon: Book, image: '/dashimages/icons/book.png', title: 'Subject/Topic', description: 'Enter a topic to generate from scratch', color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
    { id: 'import', icon: Import, image: '/dashimages/icons/inbox.png', title: 'Import', description: 'Import existing flashcards (.csv)', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { id: 'anki', icon: Import, image: '/dashimages/icons/effects.png', title: 'Anki Import', description: 'Import .apkg or .csv file from Anki', color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
    { id: 'quizlet', icon: StickyNote, image: '/dashimages/icons/quizlet.png', title: 'Quizlet', description: 'Import from Quizlet set URL', color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
];

type Stage = 'input' | 'generating' | 'done' | 'error';

const statusMessages = [
    'Reading your content...',
    'Identifying key concepts...',
    'Crafting questions...',
    'Generating answers...',
    'Polishing your deck...',
];

const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const staggerItem = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function GeneratePage() {
    const navigate = useNavigate();
    const { method: currentMethodId } = useParams<{ method: string }>();
    const { createDeck } = useDecks();

    const currentMethod = METHODS.find(m => m.id === currentMethodId) || METHODS[0];

    // Form state
    const [inputValue, setInputValue] = useState('');
    const [deckTitle, setDeckTitle] = useState('');
    const [droppedFile, setDroppedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);

    // Processing state
    const [stage, setStage] = useState<Stage>('input');
    const [statusMsgIdx, setStatusMsgIdx] = useState(0);
    const [error, setError] = useState<string>('');
    const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingTimerRef = useRef<any>(null);
    const recognitionRef = useRef<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Rotate status messages during generation
    useEffect(() => {
        if (stage !== 'generating') return;
        const interval = setInterval(() => {
            setStatusMsgIdx(i => (i + 1) % statusMessages.length);
        }, 2200);
        return () => clearInterval(interval);
    }, [stage]);

    // ─── Recording Logic ──────────────────────────────────────
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(t => t.stop());
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);

            // Web Speech API for live transcript
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.onresult = (e: any) => {
                    let full = '';
                    for (let i = 0; i < e.results.length; i++) {
                        full += e.results[i][0].transcript + ' ';
                    }
                    setTranscript(full.trim());
                };
                recognition.start();
                recognitionRef.current = recognition;
            }
        } catch (err) {
            setError('Microphone access denied. Please allow microphone access and try again.');
        }
    }, []);

    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
        recognitionRef.current?.stop();
        clearInterval(recordingTimerRef.current!);
        setIsRecording(false);
    }, []);

    // ─── File Drop / Upload ───────────────────────────────────
    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) setDroppedFile(file);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setDroppedFile(file);
    }, []);

    const readFileAsText = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file.'));
            reader.readAsText(file);
        });
    };

    // ─── Generate ─────────────────────────────────────────────
    const handleGenerate = async () => {
        setStage('generating');
        setError('');
        setStatusMsgIdx(0);

        try {
            let cards: GeneratedCard[] = [];
            let suggestedTitle = '';
            const method = currentMethodId as GenerationMethod;

            if (method === 'text') {
                if (!inputValue.trim() || inputValue.trim().split(' ').length < 20) {
                    throw new Error('Please paste at least 20 words of content.');
                }
                const res = await generateFromText(inputValue);
                cards = res.cards;
                suggestedTitle = res.title;

            } else if (method === 'subject') {
                if (!inputValue.trim()) throw new Error('Please enter a subject or topic.');
                const res = await generateFromSubject(inputValue.trim());
                cards = res.cards;
                suggestedTitle = res.title;

            } else if (method === 'link') {
                if (!inputValue.trim()) throw new Error('Please paste a valid URL.');
                const res = await generateFromURL(inputValue.trim());
                cards = res.cards;
                suggestedTitle = res.title;

            } else if (method === 'youtube') {
                if (!inputValue.trim()) throw new Error('Please paste a YouTube URL.');
                const res = await generateFromYouTube(inputValue.trim());
                cards = res.cards;
                suggestedTitle = res.title;

            } else if (method === 'quizlet') {
                if (!inputValue.trim()) throw new Error('Please paste a Quizlet URL.');
                const res = await generateFromQuizlet(inputValue.trim());
                cards = res.cards;
                suggestedTitle = res.title;

            } else if (method === 'upload') {
                if (!droppedFile) throw new Error('Please upload a file first.');
                const text = await readFileAsText(droppedFile);
                const res = await generateFromFileText(text);
                cards = res.cards;
                suggestedTitle = res.title;

            } else if (method === 'import' || method === 'anki') {
                if (!droppedFile) throw new Error('Please upload a CSV file first.');
                const text = await readFileAsText(droppedFile);
                cards = parseCSV(text);
                if (cards.length === 0) throw new Error('No valid cards found. Please ensure your CSV has two columns: Question, Answer.');
                suggestedTitle = droppedFile.name.split('.')[0] || 'Imported Deck';

            } else if (method === 'record') {
                if (!transcript && !audioBlob) throw new Error('Please record or upload audio first.');
                if (transcript) {
                    const res = await generateFromTranscript(transcript);
                    cards = res.cards;
                    suggestedTitle = res.title;
                } else {
                    throw new Error('No transcript available. Please allow microphone access and try again.');
                }
            }

            if (cards.length === 0) {
                throw new Error('No flashcards were generated. Please try with different content.');
            }

            // Cap at 150 (already done in generateCards lib, but safe here too)
            const finalCards = cards.slice(0, 150);
            setGeneratedCards(finalCards);

            const title = deckTitle.trim() || suggestedTitle || inputValue.trim().slice(0, 40) || currentMethod.title;
            const deckId = await createDeck(title, undefined, finalCards);
            setStage('done');

            // Navigate after a brief success moment
            setTimeout(() => navigate(`/edit-deck/${deckId}`), 1800);

        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
            setStage('error');
        }
    };

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // ─── Render ───────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-20 pb-16 px-6">
            <div className="w-full max-w-4xl">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-foreground-muted hover:text-foreground mb-10 text-sm font-bold group transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>

                <AnimatePresence mode="wait">
                    {/* Generating State */}
                    {stage === 'generating' && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center text-center pt-16 gap-8"
                        >
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 border-4 border-brand-primary/20 rounded-full" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 border-4 border-transparent border-t-brand-primary rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-7 h-7 text-brand-primary animate-spin" style={{ animationDuration: '2s' }} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black mb-2 tracking-tight">Generating your deck</h2>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={statusMsgIdx}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className="text-foreground-secondary text-sm font-medium"
                                    >
                                        {statusMessages[statusMsgIdx]}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}

                    {/* Success State */}
                    {stage === 'done' && (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center pt-16 gap-6"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center"
                            >
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-black mb-1 tracking-tight">Deck Created!</h2>
                                <p className="text-foreground-secondary text-sm">{generatedCards.length} cards · Redirecting...</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Error State */}
                    {stage === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center text-center pt-16 gap-6"
                        >
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black mb-2">Something went wrong</h2>
                                <p className="text-foreground-secondary text-sm max-w-sm mx-auto">{error}</p>
                            </div>
                            <button
                                onClick={() => setStage('input')}
                                className="px-6 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface-hover transition-all"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    )}

                    {/* Input State */}
                    {stage === 'input' && (
                        <motion.div
                            key="input"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                            className="space-y-6"
                        >
                            {/* Header */}
                            <motion.div variants={staggerItem} className="flex items-center gap-4 mb-2">
                                <div className={`w-12 h-12 rounded-2xl ${currentMethod.bgColor} flex items-center justify-center shadow-sm shrink-0`}>
                                    {currentMethod.image
                                        ? <img src={currentMethod.image} className="w-7 h-7 object-contain" alt="" />
                                        : (() => { const Icon = currentMethod.icon; return <Icon className={`w-6 h-6 ${currentMethod.color}`} />; })()
                                    }
                                </div>
                                <div>
                                    <h1 className="text-xl font-black tracking-tight">{currentMethod.title}</h1>
                                    <p className="text-foreground-secondary text-xs font-medium">{currentMethod.description}</p>
                                </div>
                            </motion.div>

                            {/* Deck Title */}
                            <motion.div variants={staggerItem} className="space-y-1.5">
                                <label className="text-[10px] font-black text-foreground-disabled uppercase tracking-widest">Deck Name (optional)</label>
                                <input
                                    type="text"
                                    placeholder="My Study Deck"
                                    value={deckTitle}
                                    onChange={e => setDeckTitle(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-brand-primary transition-all"
                                />
                            </motion.div>

                            {/* ── URL Input (Link/YouTube/Quizlet) ────── */}
                            {(currentMethodId === 'link' || currentMethodId === 'youtube' || currentMethodId === 'quizlet') && (
                                <motion.div variants={staggerItem} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-foreground-disabled uppercase tracking-widest">
                                        {currentMethodId === 'youtube' ? 'YouTube URL' : currentMethodId === 'quizlet' ? 'Quizlet Set URL' : 'Webpage URL'}
                                    </label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-disabled pointer-events-none" />
                                        <input
                                            type="url"
                                            autoFocus
                                            placeholder={
                                                currentMethodId === 'youtube' ? 'https://youtube.com/watch?v=...'
                                                : currentMethodId === 'quizlet' ? 'https://quizlet.com/...'
                                                : 'https://example.com/article'
                                            }
                                            value={inputValue}
                                            onChange={e => setInputValue(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-brand-primary transition-all"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Text Input ────── */}
                            {currentMethodId === 'text' && (
                                <motion.div variants={staggerItem} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-foreground-disabled uppercase tracking-widest">Paste your notes or text</label>
                                    <textarea
                                        autoFocus
                                        placeholder="Paste your notes, textbook excerpts, or any study content here. The more detail you provide, the better the flashcards."
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        className="w-full bg-background border border-border rounded-2xl p-5 text-sm font-medium focus:outline-none focus:border-brand-primary transition-all resize-none min-h-[280px] leading-relaxed"
                                    />
                                    <p className="text-[10px] text-foreground-disabled text-right">{inputValue.trim().split(/\s+/).filter(Boolean).length} words</p>
                                </motion.div>
                            )}

                            {/* ── Subject Input ────── */}
                            {currentMethodId === 'subject' && (
                                <motion.div variants={staggerItem} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-foreground-disabled uppercase tracking-widest">Subject or Topic</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-disabled pointer-events-none" />
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="e.g. The French Revolution, Python decorators, Cell division..."
                                            value={inputValue}
                                            onChange={e => setInputValue(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-brand-primary transition-all"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* ── File Upload (Documents / Import / Anki) ────── */}
                            {(currentMethodId === 'upload' || currentMethodId === 'import' || currentMethodId === 'anki') && (
                                <motion.div variants={staggerItem} className="space-y-1.5">
                                    <label className="text-[10px] font-black text-foreground-disabled uppercase tracking-widest">
                                        {currentMethodId === 'anki' || currentMethodId === 'import' ? 'Upload CSV File' : 'Upload Document'}
                                    </label>
                                    <div
                                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleFileDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-brand-primary bg-brand-primary/5' : 'border-border hover:border-border-strong hover:bg-surface-hover'}`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            accept={
                                                currentMethodId === 'anki' || currentMethodId === 'import'
                                                    ? '.csv,.tsv,.txt'
                                                    : '.pdf,.pptx,.docx,.txt,.md,.csv,.png,.jpg,.jpeg'
                                            }
                                            onChange={handleFileSelect}
                                        />
                                        {droppedFile ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-brand-primary" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-sm text-foreground">{droppedFile.name}</p>
                                                    <p className="text-xs text-foreground-secondary">{(droppedFile.size / 1024).toFixed(1)} KB · Click to change</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto">
                                                    <Upload className="w-5 h-5 text-foreground-disabled" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">Drop file or click to browse</p>
                                                    <p className="text-xs text-foreground-secondary mt-0.5">
                                                        {currentMethodId === 'anki' || currentMethodId === 'import'
                                                            ? 'CSV with columns: Question, Answer'
                                                            : 'PDF, PPTX, DOCX, TXT, Images'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {(currentMethodId === 'import' || currentMethodId === 'anki') && (
                                        <p className="text-[10px] text-foreground-disabled mt-1">
                                            CSV format: one card per line, columns separated by comma — <code className="bg-surface px-1 rounded">Question,Answer</code>
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            {/* ── Record / Audio ────── */}
                            {currentMethodId === 'record' && (
                                <motion.div variants={staggerItem} className="space-y-4">
                                    {/* Recorder */}
                                    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center gap-5">
                                        <div className="relative">
                                            {isRecording && (
                                                <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                                            )}
                                            <button
                                                onClick={isRecording ? stopRecording : startRecording}
                                                className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${isRecording ? 'bg-red-500 text-white' : 'bg-surface-hover border border-border text-foreground-secondary'}`}
                                            >
                                                {isRecording ? <Square className="w-6 h-6 fill-white" /> : <Mic className="w-6 h-6" />}
                                            </button>
                                        </div>
                                        <div className="text-center">
                                            {isRecording ? (
                                                <p className="text-sm font-black text-red-500">{formatTime(recordingTime)} · Recording...</p>
                                            ) : audioBlob ? (
                                                <p className="text-sm font-bold text-emerald-500">Recording captured · {formatTime(recordingTime)}</p>
                                            ) : (
                                                <p className="text-sm font-medium text-foreground-secondary">Tap to start recording your lecture</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Live transcript */}
                                    {(isRecording || transcript) && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-foreground-disabled uppercase tracking-widest">Live Transcript</label>
                                            <textarea
                                                value={transcript}
                                                onChange={e => setTranscript(e.target.value)}
                                                placeholder="Your speech will appear here..."
                                                className="w-full bg-background border border-border rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-brand-primary transition-all resize-none min-h-[140px] leading-relaxed"
                                            />
                                            <p className="text-[10px] text-foreground-disabled">You can edit the transcript before generating.</p>
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <div className="flex items-center gap-4 text-foreground-disabled">
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">or upload audio</span>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>

                                    {/* Audio file upload */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border border-dashed border-border rounded-xl p-5 flex items-center gap-3 cursor-pointer hover:bg-surface-hover transition-all"
                                    >
                                        <input ref={fileInputRef} type="file" accept=".mp3,.wav,.m4a,.ogg,.webm" className="hidden" onChange={handleFileSelect} />
                                        <Upload className="w-4 h-4 text-foreground-disabled" />
                                        <span className="text-sm font-medium text-foreground-secondary">
                                            {droppedFile ? droppedFile.name : 'Upload MP3, WAV, M4A...'}
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── Generate Button ────── */}
                            <motion.div variants={staggerItem} className="pt-2 flex justify-end">
                                <button
                                    onClick={handleGenerate}
                                    className="px-8 py-3.5 btn-premium text-white font-black rounded-2xl flex items-center gap-2.5 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-wider relative overflow-hidden"
                                >
                                    Generate Deck
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
