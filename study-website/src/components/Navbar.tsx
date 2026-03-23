import { useState } from 'react';
import { Menu, X as XIcon, ChevronDown } from 'lucide-react';
import { useOS } from '../contexts/OSContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { useClerkSession } from '../lib/clerk';
import { useNavigate } from 'react-router-dom';
import { MobileAppModal } from './MobileAppModal';

interface NavbarProps {
    onOpenModal?: () => void;
}

export const Navbar = ({ onOpenModal = () => { } }: NavbarProps) => {
    const navigate = useNavigate();
    const { isSignedIn, userName, signOut } = useClerkSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showExploreMenu, setShowExploreMenu] = useState(false);
    const { isMac } = useOS();
    const [showSupportMenu, setShowSupportMenu] = useState(false);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

    // Reset support menu when profile menu closes
    if (!showProfileMenu && showSupportMenu) {
        setShowSupportMenu(false);
    }

    const handleSignIn = () => {
        navigate('/login');
    };

    const handleSignOut = async () => {
        await signOut();
        setShowProfileMenu(false);
        navigate('/');
    };

    const dashboardUrl = '/dashboard';

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-4 md:pt-6 px-4">
            <div className="glass-navbar w-[95%] md:w-full max-w-7xl mx-auto flex md:grid md:grid-cols-3 gap-8 items-center justify-between px-6 md:px-10 py-3 md:py-4 rounded-full">
                <a href="/" className="flex items-center justify-center transition-all hover:opacity-80 relative z-10 justify-self-start py-1">
                    <div className="[filter:brightness(0)_saturate(100%)_invert(58%)_sepia(89%)_saturate(1583%)_hue-rotate(169deg)_brightness(98%)_contrast(93%)]">
                        <Logo size={28} variant="full" />
                    </div>
                </a>
                <div className="hidden md:flex items-center gap-5 text-sm font-medium text-[#0ea5e9] relative z-10 justify-self-center">
                    <button onClick={() => setIsMobileModalOpen(true)} className="hover:opacity-80 transition-opacity whitespace-nowrap">Download App</button>
                    <div className="relative group/explore">
                        <button
                            onClick={() => setShowExploreMenu(!showExploreMenu)}
                            onMouseEnter={() => setShowExploreMenu(true)}
                            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                        >
                            <span>Explore</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showExploreMenu ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {(showExploreMenu) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    onMouseLeave={() => setShowExploreMenu(false)}
                                    className="absolute top-full left-0 mt-2 w-48 glass-element rounded-2xl p-2 z-50 border border-white/20 shadow-xl"
                                >
                                    <div className="flex flex-col gap-1">
                                        <a href="/how-it-works" className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-all">
                                            How it Works
                                        </a>
                                        <a href="/help" className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-all">
                                            Help Center
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <a href="/pricing" className="hover:opacity-80 transition-opacity">Pricing</a>
                </div>

                <div className="hidden md:flex items-center gap-6 relative z-10 justify-self-end">

                    {isSignedIn ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-1.5 text-sm font-medium text-[#0ea5e9] hover:opacity-80 transition-opacity"
                            >
                                <span>{userName || 'Account'}</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                                        animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                                        className="absolute top-full left-1/2 mt-2 w-36 glass-element rounded-2xl overflow-visible"
                                    >

                                        <div className="p-2">
                                            <a href="/account" className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-colors">
                                                My Account
                                            </a>
                                            <a 
                                                href={dashboardUrl} 
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-colors"
                                            >
                                                Dashboard
                                            </a>


                                            <div className="relative group/support">
                                                <button
                                                    onMouseEnter={() => setShowSupportMenu(true)}
                                                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-colors"
                                                >
                                                    <span>Support</span>
                                                    <ChevronDown className="-rotate-90 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                </button>

                                                <AnimatePresence>
                                                    {showSupportMenu && (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 10 }}
                                                            onMouseLeave={() => setShowSupportMenu(false)}
                                                            className="absolute left-full top-0 ml-2 w-40 glass-element rounded-2xl p-2 border border-white/20 shadow-xl"
                                                        >
                                                            <div className="flex flex-col gap-1">
                                                                <a href="/help" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-colors">
                                                                    Help Center
                                                                </a>
                                                                <a href="/how-it-works" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-colors">
                                                                    Setup Guide
                                                                </a>
                                                                <a href="/help" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-colors">
                                                                    FAQ
                                                                </a>
                                                                <a href="/contact" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-colors">
                                                                    Contact Us
                                                                </a>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="h-px bg-white/50 my-1" />
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50/80 rounded-xl transition-colors"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button
                            onClick={handleSignIn}
                            className="text-sm font-medium text-[#0ea5e9] hover:opacity-80 transition-opacity"
                        >
                            Log In
                        </button>
                    )}

                    <div className="btn-wrapper">
                        <button onClick={onOpenModal} className="btn btn-sm">
                            <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 30 30" fill="currentColor">
                                <path d="M4 4H14V14H4zM16 4H26V14H16zM4 16H14V26H4zM16 16H26V26H16z"></path>
                            </svg>
                            <span className="btn-text">Get for {isMac ? 'Mac' : 'Windows'}</span>
                        </button>
                    </div>

                    <button
                        className="md:hidden text-slate-900"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <XIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-full left-0 right-0 glass-navbar mt-2 mx-4 rounded-3xl overflow-hidden shadow-2xl z-[90]"
                    >
                        <div className="p-6 space-y-4">
                            <a href="/how-it-works" className="block text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">How it Works</a>
                            <button 
                                onClick={() => {
                                    setIsMobileModalOpen(true);
                                    setIsMobileMenuOpen(false);
                                }} 
                                className="w-full text-left block text-lg font-bold text-slate-900 border-b border-slate-100 pb-2"
                            >
                                Download App
                            </button>
                            <a href="/pricing" className="block text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Pricing</a>
                            <a href="/help" className="block text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Help Center</a>
                            <a href="/contact" className="block text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Contact</a>

                            <div className="pt-4 flex flex-col gap-4">
                                {isSignedIn ? (
                                    <>
                                        <a 
                                            href={dashboardUrl} 
                                            className="text-center font-bold text-slate-900"
                                        >
                                            Dashboard
                                        </a>
                                        <a href="/account" className="text-center font-bold text-slate-900">My Account</a>
                                        <button
                                            onClick={handleSignOut}
                                            className="text-center font-bold text-red-600"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleSignIn}
                                        className="text-center font-bold text-[#0ea5e9]"
                                    >
                                        Log In
                                    </button>
                                )}

                                <div className="btn-wrapper w-full mt-4">
                                    <button onClick={onOpenModal} className="btn w-full">
                                        <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 30 30" fill="currentColor">
                                            <path d="M4 4H14V14H4zM16 4H26V14H16zM4 16H14V26H4zM16 16H26V26H16z"></path>
                                        </svg>
                                        <span className="btn-text">Get for {isMac ? 'Mac' : 'Windows'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <MobileAppModal isOpen={isMobileModalOpen} onClose={() => setIsMobileModalOpen(false)} />
        </nav>
    );
};
