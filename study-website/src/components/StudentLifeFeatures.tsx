import { useState } from 'react';
import { motion } from 'framer-motion';





// Video Modal Component
const VideoModal = ({ src, onClose }: { src: string; onClose: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                layoutId={`video-${src}`}
                className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 z-10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <video
                    className="w-full h-full object-contain"
                    src={src}
                    autoPlay
                    loop
                    controls
                    playsInline
                />
            </motion.div>
        </motion.div>
    );
};

export const StudentLifeFeatures = () => {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    return (
        <section className="py-24 md:py-32 bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-[#0ea5e9]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
                <div className="mb-16 md:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-left"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                            Build better study habits <br />
                            <span className="text-[#0ea5e9]">with visdly AI</span>
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                            visdly enhances every part of your academic journey, from lectures to exams.
                        </p>
                    </motion.div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">





                    {/* CARD 2: The Study Hub */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="group relative rounded-[2rem] bg-[#fdfbf7] border border-slate-200 overflow-hidden flex flex-col transition-all duration-500"
                    >
                        {/* Video Container */}
                        <div
                            className="relative pt-6 px-3 pb-0 z-10 cursor-pointer"
                            onClick={() => setSelectedVideo('/demoVids/Study Mode Demo.mp4')}
                        >
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-500 ease-out">
                                <div className="absolute inset-0 bg-slate-900/5 transition-colors z-10 pointer-events-none" />
                                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-300">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                                        <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <video
                                    className="w-full h-full object-cover transform transition-transform duration-700"
                                    src="/demoVids/Study Mode Demo.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            </div>
                        </div>

                        <div className="p-8 relative z-0">
                            {/* Paper Lines Background for Text Area */}
                            <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
                                    backgroundSize: '100% 100%'
                                }}
                            />

                            <div className="relative z-10">
                                <div className="trusted-pill-wrap mb-4 scale-90 origin-left">
                                    <div className="trusted-pill-shadow"></div>
                                    <div className="trusted-pill">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                                        <span className="text-violet-600 text-[10px] font-bold uppercase tracking-widest leading-none">Sidekick Hub</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Auto-Pilot Guides</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    Upload any PDF, link, or text. visdly instantly creates summaries, flashcards, quizzes, and test prep materials.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CARD 3: Live Transcription */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="group relative rounded-[2rem] bg-[#fdfbf7] border border-slate-200 overflow-hidden flex flex-col transition-all duration-500"
                    >
                        {/* Video Container */}
                        <div
                            className="relative pt-6 px-3 pb-0 z-10 cursor-pointer"
                            onClick={() => setSelectedVideo('/demoVids/Transcription AI Demo.mp4')}
                        >
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-500 ease-out">
                                <div className="absolute inset-0 bg-slate-900/5 transition-colors z-10 pointer-events-none" />
                                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-300">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                                        <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <video
                                    className="w-full h-full object-cover transform transition-transform duration-700"
                                    src="/demoVids/Transcription AI Demo.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            </div>
                        </div>

                        <div className="p-8 relative z-0">
                            {/* Paper Lines Background for Text Area */}
                            <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
                                    backgroundSize: '100% 100%'
                                }}
                            />

                            <div className="relative z-10">
                                <div className="trusted-pill-wrap mb-4 scale-90 origin-left">
                                    <div className="trusted-pill-shadow"></div>
                                    <div className="trusted-pill">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                        <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest leading-none">Transcription</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Record & Chat</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    Transcribe lectures and videos in real-time. Ask the AI questions about the transcript instantly.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Video Modal */}
            {selectedVideo && <VideoModal src={selectedVideo} onClose={() => setSelectedVideo(null)} />}
        </section>
    );
};
