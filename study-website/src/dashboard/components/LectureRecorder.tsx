import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2, Save, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import { useTranscripts } from '../contexts/TranscriptsContext';
import { usePaywall } from '../contexts/PaywallContext'; // Added import for usePaywall

export const LectureRecorder: React.FC = () => {
    const { profile } = useProfile();
    const { saveTranscript } = useTranscripts();
    const { openPaywall } = usePaywall(); // Added usePaywall hook
    const isPro = profile?.plan === 'pro';
    
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (isRecording && !isPaused) {
            timerRef.current = window.setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording, isPaused]);

    const startRecording = async () => {
        if (!isPro) return; // Locked for free users
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            setTranscript('');

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
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            recognitionRef.current?.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    };

    const togglePause = () => {
        if (mediaRecorderRef.current) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                recognitionRef.current?.start();
            } else {
                mediaRecorderRef.current.pause();
                recognitionRef.current?.stop();
            }
            setIsPaused(!isPaused);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSaveTranscript = async () => {
        if (!transcript.trim()) {
            alert('No transcript to save.');
            return;
        }

        setIsTranscribing(true);
        try {
            await saveTranscript({
                title: `Lecture - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
                content: transcript,
                duration: formatTime(recordingTime),
                source: 'browser'
            });
            
            alert('Transcript saved to your history!');
            // Reset state
            setAudioUrl(null);
            setRecordingTime(0);
            setTranscript('');
        } catch (err) {
            console.error('Error saving transcript:', err);
            alert('Failed to save transcript. Please try again.');
        } finally {
            setIsTranscribing(false);
        }
    };

    if (!isPro) {
        return (
            <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white shadow-sm border border-border rounded-2xl flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-brand-primary" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-foreground mb-3">Pro Transcription</h3>
                    <p className="text-foreground-secondary max-w-sm mx-auto mb-8">
                        Unlock browser-based lecture recording, instant transcriptions, and AI study guides with our Pro plan.
                    </p>
                    
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        <div className="flex items-center gap-3 text-sm font-medium text-foreground-secondary bg-background/50 p-3 rounded-xl border border-border">
                            <CheckCircle className="w-4 h-4 text-brand-primary shrink-0" />
                            <span>Unlimited Lecture Recording</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-foreground-secondary bg-background/50 p-3 rounded-xl border border-border">
                            <CheckCircle className="w-4 h-4 text-brand-primary shrink-0" />
                            <span>AI-Powered Notes Generation</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-foreground-secondary bg-background/50 p-3 rounded-xl border border-border">
                            <CheckCircle className="w-4 h-4 text-brand-primary shrink-0" />
                            <span>Sync with Mobile & Desktop App</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={openPaywall}
                        className="mt-10 px-8 py-3.5 bg-brand-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-brand-primary/20"
                    >
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-2xl font-mono font-bold text-foreground">{formatTime(recordingTime)}</span>
                </div>
                {isRecording && (
                    <span className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">
                        Recording...
                    </span>
                )}
            </div>

            <div className="flex flex-col items-center gap-8">
                <div className="flex items-center gap-6">
                    {!isRecording && !audioUrl ? (
                        <button
                            onClick={startRecording}
                            className="w-24 h-24 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
                        >
                            <Mic className="w-10 h-10" />
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            {isRecording && (
                                <>
                                    <button
                                        onClick={togglePause}
                                        className="w-16 h-16 bg-background-elevated text-foreground rounded-full flex items-center justify-center border border-border hover:bg-surface transition-all"
                                    >
                                        {isPaused ? <Play className="w-8 h-8 ml-1" /> : <Pause className="w-8 h-8" />}
                                    </button>
                                    <button
                                        onClick={stopRecording}
                                        className="w-24 h-24 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
                                    >
                                        <Square className="w-10 h-10" />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {(isRecording || transcript) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full space-y-2"
                    >
                        <label className="text-[10px] font-black text-foreground-disabled uppercase tracking-widest">Live Transcript</label>
                        <div className="w-full bg-background/50 border border-border rounded-2xl p-6 min-h-[160px] max-h-[300px] overflow-y-auto text-sm font-medium leading-relaxed text-foreground/80">
                            {transcript || (
                                <span className="text-foreground-muted italic">
                                    {isRecording ? 'Listening for speech...' : 'No transcript generated.'}
                                </span>
                            )}
                        </div>
                    </motion.div>
                )}

                {audioUrl && !isRecording && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full flex flex-col gap-6"
                    >
                        <div className="bg-background/50 rounded-2xl p-6 border border-border">
                            <audio src={audioUrl} controls className="w-full h-12" />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setAudioUrl(null);
                                    setRecordingTime(0);
                                    setTranscript('');
                                }}
                                className="flex-1 px-4 py-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear
                            </button>
                            <button
                                onClick={handleSaveTranscript}
                                disabled={isTranscribing}
                                className="flex-[2] px-4 py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/10 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isTranscribing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isTranscribing ? 'Saving...' : 'Transcribe & Save'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-4 pt-6 border-t border-border">
                <p className="text-xs text-foreground-secondary text-center">
                    Microphone is being used for high-fidelity audio capture. Your transcript will be generated once you save.
                </p>
            </div>
        </div>
    );
};
