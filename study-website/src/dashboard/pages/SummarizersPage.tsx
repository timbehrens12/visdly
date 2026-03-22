import { useProfile } from '../../contexts/ProfileContext';
import { usePaywall } from '../contexts/PaywallContext';
import { FileText, CheckCircle } from 'lucide-react';
import { FadeInUp } from '../components/ui/MotionWrapper';

export default function SummarizersPage() {
    const { profile } = useProfile();
    const { openPaywall } = usePaywall();
    const isPro = profile?.plan === 'pro';
    if (!isPro) {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-background relative overflow-hidden">
                {/* Dot Pattern Background */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none opacity-[0.3] dark:opacity-[0.1]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                        color: 'var(--color-foreground-muted)'
                    }}
                />

                <FadeInUp className="max-w-2xl w-full relative z-10">
                    <div className="bg-surface border border-dashed border-border rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white dark:bg-zinc-900 shadow-xl border border-border rounded-3xl flex items-center justify-center mb-8">
                                <FileText className="w-10 h-10 text-brand-primary" />
                            </div>
                            
                            <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight">AI Summarizers</h2>
                            <p className="text-foreground-secondary text-lg font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                                Instantly convert long readings, recorded lectures, and YouTube videos into concise, actionable study guides.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10 text-left">
                                {[
                                    "YouTube Transcript Magic",
                                    "PDF-to-Flashcard Flow",
                                    "Lecture Key Takeaways",
                                    "Smart Reading Outlines"
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-3 text-sm font-bold text-foreground-secondary bg-background/50 p-4 rounded-2xl border border-border/50">
                                        <CheckCircle className="w-4 h-4 text-brand-primary shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                            onClick={openPaywall}
                            className="bg-brand-primary text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Upgrade to Pro
                        </button>
                        </div>
                    </div>
                </FadeInUp>
            </div>
        );
    }

    return (
        <div className="h-full relative overflow-hidden bg-background">
            {/* Dot Pattern Background - School Aesthetic (Exact match with Chat) */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.3] dark:opacity-[0.1]"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    color: 'var(--color-foreground-muted)'
                }}
            />

            <main className="flex-1 relative z-10 p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <header className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground/90">AI Summarizers</h1>
                        <p className="text-foreground-secondary text-lg font-medium">Transform your long documents and lectures into concise insights.</p>
                    </header>

                    {/* Placeholder for content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-48 rounded-3xl border-2 border-dashed border-border flex items-center justify-center bg-surface/50 backdrop-blur-sm">
                                <span className="text-foreground-muted font-medium">Feature coming soon</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
