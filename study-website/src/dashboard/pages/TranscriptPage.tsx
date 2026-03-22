import { useState } from 'react';
import { FadeInUp } from '../components/ui/MotionWrapper';
import { Search, FileText, Download, Clock, ExternalLink, Trash2, Calendar, ArrowLeft, Mic } from 'lucide-react';
import { useTranscripts } from '../contexts/TranscriptsContext';
import { LectureRecorder } from '../components/LectureRecorder';

export default function TranscriptPage() {
    const { transcripts, deleteTranscript, isLoading } = useTranscripts();
    const [view, setView] = useState<'list' | 'record'>('list');
    const [showCTA, setShowCTA] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const handleDownloadClick = () => {
        // Here you would trigger the actual download
        setShowCTA(false);
    };

    const filteredTranscripts = transcripts.filter(t => 
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <FadeInUp>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        {view === 'record' && (
                            <button 
                                onClick={() => setView('list')}
                                className="p-2 -ml-2 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                {view === 'list' ? 'Transcripts' : 'New Recording'}
                            </h1>
                            <p className="text-foreground-secondary mt-1 max-w-2xl text-sm md:text-base">
                                {view === 'list' 
                                    ? 'View and analyze your saved lecture transcripts from the browser and study-overlay.' 
                                    : 'Record and auto-transcribe your lecture live in the browser.'
                                }
                            </p>
                        </div>
                    </div>

                    {view === 'list' && (
                        <button 
                            onClick={() => setView('record')}
                            className="btn-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/10"
                        >
                            <Mic className="w-4 h-4" />
                            <span>New Recording</span>
                        </button>
                    )}
                </div>

                {view === 'record' ? (
                    <div className="max-w-2xl mx-auto py-8">
                        <LectureRecorder />
                    </div>
                ) : (
                    <>
                        {/* Search & Actions */}
                        {transcripts.length > 0 && (
                            <div className="flex justify-end mb-8">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search transcripts..."
                                        className="pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-brand-primary min-w-[300px]"
                                    />
                                </div>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : transcripts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredTranscripts.map((transcript) => (
                                    <div 
                                        key={transcript.id}
                                        className="bg-surface border border-border rounded-2xl p-6 hover:border-brand-primary/50 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-foreground text-lg group-hover:text-brand-primary transition-colors">
                                                        {transcript.title || 'Untitled Lecture'}
                                                    </h3>
                                                    {transcript.source === 'overlay' && (
                                                        <span className="text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-md">
                                                            Overlay
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground-secondary">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4 opacity-50" />
                                                        <span>{new Date(transcript.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4 opacity-50" />
                                                        <span>{transcript.duration || '00:00'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 line-clamp-1 max-w-sm">
                                                        <FileText className="w-4 h-4 opacity-50 shrink-0" />
                                                        <span className="opacity-70">{transcript.content.substring(0, 100)}...</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => {/* View detail logic */}}
                                                    className="p-2.5 text-foreground-secondary hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this transcript?')) {
                                                            deleteTranscript(transcript.id);
                                                        }
                                                    }}
                                                    className="p-2.5 text-foreground-secondary hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {filteredTranscripts.length === 0 && (
                                    <div className="h-[200px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-3xl">
                                        <p className="text-foreground-secondary font-medium">No transcripts found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="bg-surface rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm border border-border min-h-[400px]">
                                <div className="w-20 h-20 bg-background-elevated rounded-2xl flex items-center justify-center mb-6">
                                    <FileText className="w-10 h-10 text-foreground-muted" />
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-3">
                                    {showCTA ? 'No transcripts yet' : 'Waiting for activity...'}
                                </h3>

                                <p className="text-foreground-secondary max-w-md mb-10 leading-relaxed font-medium">
                                    {showCTA 
                                        ? 'Use the desktop app or start a new recording to transcribe your lectures.' 
                                        : 'Connect your study-overlay to start collecting transcripts automatically.'
                                    }
                                </p>

                                {showCTA && (
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <button 
                                            onClick={handleDownloadClick}
                                            className="flex items-center gap-2.5 bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-primary/10"
                                        >
                                            <span>Download Desktop App</span>
                                            <Download className="w-4 h-4" />
                                        </button>
                                        
                                        <button 
                                            onClick={() => setView('record')}
                                            className="flex items-center gap-2 text-foreground-secondary hover:text-brand-primary font-bold transition-all px-4 py-2"
                                        >
                                            <span>Start Browser Recording</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </FadeInUp>
        </div>
    );
}
