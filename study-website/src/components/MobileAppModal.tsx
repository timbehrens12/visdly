import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface MobileAppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileAppModal = ({ isOpen, onClose }: MobileAppModalProps) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                            className="w-full max-w-[440px] bg-white rounded-[40px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] overflow-hidden relative p-12 flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-8 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-10 mt-2">
                                <h2 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Get the mobile app</h2>
                                <p className="text-[#64748b] font-medium text-[17px]">App available on iOS</p>
                            </div>

                            {/* QR Code Container */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="w-64 h-64 bg-white p-2 rounded-3xl mb-10 flex items-center justify-center"
                            >
                                <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                                    <img 
                                        src="/mobile-app-qr.png" 
                                        alt="QR Code" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </motion.div>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-[#64748b] font-medium text-[17px]"
                            >
                                Point your phone's camera at the QR code
                            </motion.p>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
