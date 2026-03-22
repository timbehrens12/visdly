import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { ReferralModal } from './ReferralModal';
import { SubscriptionModal } from './SubscriptionModal';
import { ProSubscriptionModal } from './ProSubscriptionModal';

type BillingCycle = 'monthly' | 'annual';
type PricingTab = 'subscriptions' | 'credits';

const AnimatedPrice = ({ value }: { value: number }) => {
    const count = useMotionValue(value);
    const rounded = useTransform(count, (latest) => latest.toFixed(2));

    useEffect(() => {
        const controls = animate(count, value, { duration: 0.5, ease: "circOut" });
        return () => controls.stop();
    }, [value, count]);

    return <motion.span>{rounded}</motion.span>;
};

export const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [activeTab, setActiveTab] = useState<PricingTab>('subscriptions');
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
    const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
    const [isYearlyModalOpen, setIsYearlyModalOpen] = useState(false);

    const subscriptionPlans = [
        {
            id: 'weekly',
            name: 'Cram',
            price: 5.99,
            period: '/wk',
            features: [
                'Perfect for crunch time',
                'Unlimited AI messages',
                'Full Lecture Transcription',
                'All Dashboard Features',
                'Priority Support',
            ],
            cta: 'Subscribe',
            popular: false,
            color: 'sky',
            showOn: 'monthly'
        },
        {
            id: 'monthly',
            name: 'Ace',
            price: 14.99,
            period: '/mo',
            features: [
                'Best for consistent study',
                'Unlimited AI messages',
                'Full Lecture Transcription',
                'All Dashboard Features',
                'Priority Support',
            ],
            cta: 'Subscribe',
            popular: true,
            color: 'violet',
            showOn: 'monthly'
        },
        {
            id: 'yearly',
            name: 'Ace',
            price: 99.99,
            period: '/yr',
            label: 'Save over 40%',
            features: [
                'Best value for students',
                'Unlimited AI messages',
                'Full Lecture Transcription',
                'All Dashboard Features',
                'Priority Support',
            ],
            cta: 'Subscribe',
            popular: true,
            color: 'violet',
            showOn: 'annual'
        }
    ];

    const comparisonFeatures: { name: string; val: string | boolean }[] = [
        { name: 'AI messages per day', val: 'Unlimited' },
        { name: 'Meeting notetaking', val: 'Unlimited' },
        { name: 'Priority Support', val: true },
        { name: 'Lecture Transcription', val: true },
        { name: 'Study Dashboard', val: true },
        { name: 'Custom Keybinds', val: true }
    ];

    return (
        <section id="pricing" className="pb-24 md:pb-32 px-4 relative z-10 overflow-hidden bg-transparent">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-6"
                >
                    <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 flex items-center justify-center gap-1 flex-wrap text-center">
                        <span>Start</span>
                        <img
                            src="/teamlogos/pricinglogo.png"
                            alt="Viszmo"
                            className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto object-contain drop-shadow-lg"
                        />
                        <span>for <span className="text-[#0ea5e9]">free.</span></span>
                    </h2>
                    <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto px-2">
                        The AI study sidekick that lives where you learn. Master every subject with instant transcription, perfect notes, and a dashboard built for top-tier results.
                    </p>
                </motion.div>

                <div className="flex justify-center mb-8">
                    <div className="bg-slate-100/80 p-1 inline-grid grid-cols-2 relative rounded-full border border-slate-200 w-full max-w-[300px] sm:min-w-[300px]">
                        <motion.div
                            className="absolute top-1 bottom-1 glass-element rounded-full shadow-sm z-0"
                            initial={false}
                            animate={{
                                left: activeTab === 'subscriptions' ? 4 : '50%',
                                width: 'calc(50% - 4px)'
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className={`relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors ${activeTab === 'subscriptions' ? 'text-slate-900' : 'text-slate-50'}`}
                        >
                            Subscriptions
                        </button>
                        <button
                            onClick={() => setActiveTab('credits')}
                            className={`relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors ${activeTab === 'credits' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Free Access
                        </button>
                    </div>
                </div>

                {activeTab === 'subscriptions' && (
                    <div className="flex justify-center mb-8 -mt-2">
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
                            <button
                                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                                className="w-12 h-6 bg-slate-200 rounded-full relative transition-colors focus:outline-none"
                            >
                                <motion.div
                                    className="absolute top-1 left-1 w-4 h-4 bg-slate-900 rounded-full shadow-sm"
                                    animate={{ x: billingCycle === 'annual' ? 24 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                            <span className={`text-sm font-semibold ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-400'}`}>Yearly <span className="text-[#0ea5e9] text-xs ml-1">(Save over 40%)</span></span>
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {activeTab !== 'credits' ? (
                        <motion.div
                            key="plans"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-6xl mx-auto"
                        >
                            <div className={`grid grid-cols-1 gap-6 mb-8 ${billingCycle === 'monthly' ? 'md:grid-cols-2 max-w-4xl' : 'max-w-md'} mx-auto`}>
                                {subscriptionPlans
                                    .filter(plan => plan.showOn === billingCycle)
                                    .map((plan, index) => (
                                        <motion.div
                                            key={plan.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }}
                                            className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                                        >
                                            {plan.popular && (
                                                <div className="absolute top-0 right-0 bg-[#0ea5e9] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                                                    POPULAR
                                                </div>
                                            )}
                                            <div className="mb-6">
                                                <div className="mb-4">
                                                    <div className={`group inline-block ${plan.color === 'sky' ? 'bg-[#0ea5e9] shadow-sky-500/20' : 'bg-[#8b5cf6] shadow-violet-500/20'} -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105`}>
                                                        <h3 className="text-lg font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                                                            {plan.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-baseline gap-1 mb-2">
                                                    <span className="text-5xl font-bold text-slate-900 tracking-tight">
                                                        $<AnimatedPrice value={plan.price} />
                                                    </span>
                                                    <span className="text-slate-500 font-medium">
                                                        {plan.period}
                                                    </span>
                                                </div>
                                                {plan.showOn === 'annual' && plan.label && (
                                                    <p className="text-xs text-emerald-600 font-medium bg-emerald-50 inline-block px-2 py-1 rounded-md">
                                                        {plan.label} <span className="opacity-60 mx-1">•</span> Save big
                                                    </p>
                                                )}
                                                <p className="text-slate-500 mt-4 text-sm font-medium">
                                                    {plan.name === 'Ace' ? (
                                                        <span className="shimmer-purple-text font-black">Everything, unlimited, no compromises.</span>
                                                    ) : (
                                                        'All essential features.'
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mb-6 btn-wrapper w-full">
                                                <button
                                                    onClick={() => {
                                                        if (plan.id === 'weekly') setIsWeeklyModalOpen(true);
                                                        else if (plan.id === 'monthly') setIsMonthlyModalOpen(true);
                                                        else setIsYearlyModalOpen(true);
                                                    }}
                                                    className={`btn btn-black w-full ${plan.color === 'violet' ? 'btn-all-nighter' : ''}`}
                                                >
                                                    <span className="btn-text">{plan.cta}</span>
                                                </button>
                                            </div>

                                            <div className="space-y-4 flex-grow">
                                                {plan.features.map((feature, i) => (
                                                    <div key={i} className="flex items-start gap-3">
                                                        <Check className="w-5 h-5 text-[#0ea5e9] shrink-0" />
                                                        <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>

                            <div className="text-center max-w-3xl mx-auto mb-16 pt-32">
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                    className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight"
                                >
                                    Detailed <span className="text-[#0ea5e9]">Comparison.</span>
                                </motion.h2>
                                <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed px-2">
                                    Everything you need to know about our study plans.
                                </p>
                            </div>

                            <div className="mt-8">
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full border-collapse table-fixed">
                                        <thead>
                                            <tr>
                                                <th className="w-1/4 pb-8"></th>
                                                {subscriptionPlans
                                                    .filter(p => p.showOn === billingCycle)
                                                    .map((plan) => {
                                                        const highlightColor = plan.color === 'sky' ? 'bg-[#0ea5e9] shadow-sky-500/20' : 'bg-[#8b5cf6] shadow-violet-500/20';

                                                        return (
                                                            <th key={plan.id} className="pb-8 px-4 text-left align-top">
                                                                <div className="flex flex-col h-full items-start">
                                                                    <div className="mb-3">
                                                                        <div className={`group inline-block ${highlightColor} -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105`}>
                                                                            <h3 className="text-sm font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                                                                                {plan.name}
                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mb-6">
                                                                        <span className="text-slate-500 text-sm font-medium">
                                                                            $<AnimatedPrice value={plan.price} />{' '}
                                                                            {plan.period}
                                                                        </span>
                                                                    </div>

                                                                    <div className="btn-wrapper w-full max-w-[180px]">
                                                                        <button
                                                                            onClick={() => {
                                                                                if (plan.id === 'weekly') setIsWeeklyModalOpen(true);
                                                                                else if (plan.id === 'monthly') setIsMonthlyModalOpen(true);
                                                                                else setIsYearlyModalOpen(true);
                                                                            }}
                                                                            className={`btn btn-black w-full flex items-center justify-center gap-2 h-11 transition-all duration-300 ${plan.color === 'violet' ? 'btn-all-nighter shadow-violet-500/10 hover:shadow-violet-500/20' : 'shadow-sky-500/10 hover:shadow-sky-500/20'}`}
                                                                        >
                                                                            <span className="btn-text text-[13px] font-bold tracking-wide">{plan.cta}</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </th>
                                                        );
                                                    })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colSpan={1} className="py-8">
                                                    <h4 className="text-xl font-bold text-slate-900">Features</h4>
                                                </td>
                                                <td colSpan={3} className="py-8"></td>
                                            </tr>
                                            {comparisonFeatures.map((feature, idx) => (
                                                <tr key={idx} className="border-t border-slate-100 transition-colors">
                                                    <td className="py-5 text-slate-900 font-bold text-base">
                                                        {feature.name}
                                                    </td>
                                                    {subscriptionPlans
                                                        .filter(p => p.showOn === billingCycle)
                                                        .map((plan) => (
                                                            <td key={plan.id} className="py-5 px-4 text-slate-500 text-base font-medium">
                                                                {typeof feature.val === 'boolean' ? (
                                                                    feature.val ? <Check className="w-5 h-5 text-[#0ea5e9]" /> : <X className="w-5 h-5 text-slate-300" />
                                                                ) : (
                                                                    feature.val
                                                                )}
                                                            </td>
                                                        ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="md:hidden space-y-6">
                                    <h4 className="text-xl font-bold text-slate-900 mb-4">Features</h4>
                                    {subscriptionPlans
                                        .filter(p => p.showOn === billingCycle)
                                        .map((plan) => {
                                            const highlightColor = plan.color === 'sky' ? 'bg-[#0ea5e9]' : 'bg-[#8b5cf6]';
                                            return (
                                                <div key={plan.id} className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <div className={`group inline-block ${highlightColor} -skew-x-12 px-4 py-1.5 shadow-md transform`}>
                                                            <h3 className="text-xs font-black text-white uppercase tracking-wider transform skew-x-12 whitespace-nowrap">
                                                                {plan.name}
                                                            </h3>
                                                        </div>
                                                        <span className="text-slate-500 text-sm font-medium">
                                                            $<AnimatedPrice value={plan.price} />{' '}
                                                            {plan.period}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {comparisonFeatures.map((f, i) => (
                                                            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100/50 last:border-0">
                                                                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">{f.name}</span>
                                                                <div className="text-sm font-bold text-slate-700">
                                                                    {typeof f.val === 'boolean' ? (
                                                                        f.val ? <Check className="w-4 h-4 text-[#0ea5e9]" /> : <X className="w-4 h-4 text-slate-300" />
                                                                    ) : (
                                                                        f.val
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="credits"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="group relative rounded-[2.5rem] bg-gradient-to-br from-[#0ea5e9] via-blue-600 to-indigo-700 border border-white/20 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1">
                                <div className="p-12 relative z-0 flex flex-col items-center text-center">
                                    <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
                                        style={{
                                            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #ffffff 27px, #ffffff 28px)',
                                            backgroundSize: '100% 100%'
                                        }}
                                    />

                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-white/20 transition-colors duration-500"></div>

                                    <div className="relative z-10 w-full flex flex-col items-center">
                                        <div className="mb-10">
                                            <div className="group inline-block bg-white -skew-x-12 px-8 py-2.5 shadow-lg shadow-black/10 transform transition-all duration-300 hover:skew-x-0 hover:scale-105">
                                                <h3 className="text-2xl font-black text-[#0ea5e9] uppercase tracking-wide transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 flex items-center gap-2">
                                                    <Sparkles className="w-6 h-6 fill-[#0ea5e9]" />
                                                    Free Access
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="mb-12">
                                            <h3 className="text-4xl font-black mb-4 text-white tracking-tight">Spread the word.</h3>
                                            <p className="text-blue-50 text-xl leading-relaxed max-w-[320px] mx-auto font-medium opacity-90">
                                                Invite a friend and <span className="font-bold text-white underline decoration-blue-300 decoration-2 underline-offset-4">unlock extra daily messages</span> for yourself.
                                            </p>
                                        </div>

                                        <div className="w-full max-w-sm">
                                            <button
                                                onClick={() => setIsReferralModalOpen(true)}
                                                className="w-full bg-white text-[#0ea5e9] text-lg font-black py-5 rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-blue-400/20 hover:-translate-y-1 active:translate-y-0"
                                            >
                                                Invite Friends Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <ReferralModal isOpen={isReferralModalOpen} onClose={() => setIsReferralModalOpen(false)} />
            <SubscriptionModal isOpen={isWeeklyModalOpen} onClose={() => setIsWeeklyModalOpen(false)} />
            <ProSubscriptionModal isOpen={isMonthlyModalOpen || isYearlyModalOpen} onClose={() => {
                setIsMonthlyModalOpen(false);
                setIsYearlyModalOpen(false);
            }} />
        </section >
    );
};
