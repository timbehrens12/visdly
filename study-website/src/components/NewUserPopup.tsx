import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PartyPopper } from 'lucide-react';

interface NewUserPopupProps {
    forceOpen?: boolean; // For testing/demos
}

export const NewUserPopup = ({ forceOpen = false }: NewUserPopupProps) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check local storage


        // Slight delay for better UX
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, [forceOpen]);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('viszmo_new_user_popup_seen', 'true');
    };

    const handleClaim = () => {
        console.log("Claim free credits clicked");
        handleClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                        className="relative w-full max-w-[400px] bg-[#fdfbf7] rounded-[32px] overflow-hidden border border-slate-200"
                        style={{
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 0 20px 60px -10px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        {/* Paper Lines Texture */}
                        <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
                                backgroundSize: '100% 100%'
                            }}
                        />

                        {/* Decorative background gradients */}
                        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-sky-50/50 to-transparent pointer-events-none" />
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-400/10 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-400/10 blur-[80px] rounded-full pointer-events-none" />

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center pt-10 pb-6 px-6 relative z-10 text-center">

                            {/* Logo container */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="mb-6 relative"
                            >
                                <div className="w-[88px] h-[88px] bg-white rounded-[28px] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)] flex items-center justify-center relative z-10">
                                    <img
                                        src="/favicon-32x32.png.png"
                                        alt="Viszmo"
                                        className="w-11 h-11 object-contain"
                                    />
                                    {/* Inner shine */}
                                    <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-transparent via-transparent to-white/80 pointer-events-none" />
                                </div>
                                {/* Glow behind logo */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#0ea5e9]/20 blur-2xl rounded-full" />
                            </motion.div>

                            {/* Headings */}
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-[28px] font-[800] text-slate-900 leading-[1.1] mb-3 tracking-tight font-display">
                                    Ready to ace<br />
                                    your grades?
                                </h2>

                                <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
                                    Join thousands of students using Viszmo.<br />
                                    Sign up today and get <span className="font-bold text-[#0ea5e9] bg-sky-50 px-1 rounded">Bonus Messages</span> instantly!
                                </p>
                            </motion.div>

                            {/* Main Action Button - Enhanced */}
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="w-full flex justify-center"
                            >
                                <div className="btn-wrapper w-full relative">
                                    <button
                                        onClick={handleClaim}
                                        className="btn w-full !rounded-2xl !py-4"
                                    >
                                        <PartyPopper size={20} className="text-white mr-2.5" />
                                        <span className="btn-text">GET FREE ACCESS</span>
                                    </button>
                                </div>
                            </motion.div>

                            {/* Secondary Action */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={handleClose}
                                className="mt-5 text-[12px] font-bold text-slate-400 hover:text-slate-600 tracking-wider uppercase py-2 transition-colors mb-4"
                            >
                                Not now, I'm just looking
                            </motion.button>
                        </div>

                        {/* Footer Separator Line */}
                        <div className="w-full h-px bg-slate-100/80 mx-auto max-w-[85%]" />

                        {/* Footer Section */}
                        <div className="bg-transparent p-5 text-center">
                            <p className="text-[10px] font-bold text-[#0ea5e9] tracking-widest uppercase opacity-90">
                                Referred by a friend? Use their link for bonus messages!
                            </p>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
