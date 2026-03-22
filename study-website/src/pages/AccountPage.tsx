import { Lock, Mail, User as UserIcon, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerkSession } from '../lib/clerk';
import { Navbar } from '../components/Navbar';

export const AccountPage = () => {
    const { isSignedIn, isLoading, userEmail, userName, userImageUrl } = useClerkSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isSignedIn) {
            navigate('/login');
        }
    }, [isSignedIn, isLoading, navigate]);

    if (isLoading || !isSignedIn) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto pt-32 pb-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden"
                >
                    {/* Header Section with Avatar */}
                    <div className="p-8 md:p-12 bg-gradient-to-br from-[#0ea5e9]/5 to-indigo-500/5 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                                    <img src={userImageUrl || '/dashimages/icons/effects.png'} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full"></div>
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-black text-slate-900 mb-2">{userName || 'Student'}</h1>
                                <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
                                    <Mail size={16} />
                                    {userEmail}
                                </p>
                            </div>
                            <div className="md:ml-auto">
                                <div className="px-5 py-2 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-sm text-xs font-black text-slate-400 uppercase tracking-widest">
                                    Basic Plan
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Information Section */}
                    <div className="p-8 md:p-12">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <UserIcon className="text-[#0ea5e9]" size={24} />
                            Profile Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                <div className="text-lg font-bold text-slate-900 bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 flex items-center gap-3">
                                    <Mail size={18} className="text-slate-300" />
                                    <span>{userEmail}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                <div className="text-lg font-bold text-slate-900 bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 flex items-center gap-3">
                                    <UserIcon size={18} className="text-slate-300" />
                                    <span>{userName || 'Not set'}</span>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Billing Section */}
                    <div className="p-8 md:p-12 bg-slate-50/50">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <CreditCard className="text-[#0ea5e9]" size={24} />
                            Billing & Subscription
                        </h2>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Lock size={32} />
                            </div>
                            <div className="font-black text-slate-900 text-2xl mb-2">Viszmo Free</div>
                            <div className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">You're currently using the limited free version. Upgrade to unlock all study modes.</div>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="px-12 py-5 bg-[#0ea5e9] text-white rounded-[2rem] font-black text-sm shadow-xl shadow-[#0ea5e9]/20 hover:scale-[1.05] transition-transform flex items-center gap-3 mx-auto"
                            >
                                <CreditCard size={18} />
                                Upgrade Your Plan
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
