import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Crown, Zap, ShieldCheck } from 'lucide-react';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLANS = [
    {
        name: 'Cram',
        price: '5.99',
        period: '/wk',
        desc: 'Perfect for crunch time',
        features: ['Unlimited AI Tutoring', 'Full Transcriptions', 'All Study Modes', 'Priority Support'],
        color: 'sky',
        popular: false
    },
    {
        name: 'Ace',
        price: '14.99',
        period: '/mo',
        desc: 'Best for consistent study',
        features: ['Unlimited AI Tutoring', 'Full Transcriptions', 'All Study Modes', 'Priority Support', 'Exclusive Pro Badges'],
        color: 'brand-primary',
        popular: true
    }
];

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-background border border-border rounded-[3rem] shadow-2xl overflow-hidden"
                    >
                        {/* Dot Pattern Background */}
                        <div
                            className="absolute inset-0 z-0 pointer-events-none opacity-[0.2]"
                            style={{
                                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                                backgroundSize: '24px 24px',
                            }}
                        />

                        {/* Top Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface transition-all z-20 text-foreground-muted hover:text-foreground"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative z-10 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-widest mb-4">
                                    <Crown className="w-3 h-3" />
                                    <span>Premium Access</span>
                                </div>
                                <h2 className="text-4xl font-black text-foreground mb-4 tracking-tight">Level Up Your Studies</h2>
                                <p className="text-foreground-secondary text-lg font-medium max-w-xl mx-auto">
                                    Unlock the full power of AI-powered learning and dominate your exams.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                {PLANS.map((plan) => (
                                    <div
                                        key={plan.name}
                                        className={`relative p-8 rounded-[2.5rem] border transition-all ${
                                            plan.popular 
                                            ? 'bg-surface border-brand-primary shadow-2xl shadow-brand-primary/10' 
                                            : 'bg-background border-border hover:border-foreground/10'
                                        }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1 bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                                                Most Popular
                                            </div>
                                        )}

                                        <div className="mb-8">
                                            <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                                            <p className="text-sm font-medium text-foreground-secondary mb-4">{plan.desc}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black">${plan.price}</span>
                                                <span className="text-foreground-muted font-bold">{plan.period}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            {plan.features.map(f => (
                                                <div key={f} className="flex items-start gap-3">
                                                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-brand-primary/20 text-brand-primary' : 'bg-surface-active text-foreground-muted'}`}>
                                                        <Check className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm font-bold text-foreground-secondary">{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button className={`w-full py-4 rounded-2xl font-black transition-all ${
                                            plan.popular 
                                            ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]' 
                                            : 'bg-surface text-foreground border border-border hover:bg-surface-hover'
                                        }`}>
                                            Start Free Trial
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center">
                                <p className="text-xs font-bold text-foreground-muted uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Secure Payment 256-bit SSL
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
