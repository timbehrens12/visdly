import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { SetPasswordModal } from '../components/SetPasswordModal';

export const AccountPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading || !user) {
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
                    {/* Account Information Section */}
                    <div className="p-8 md:p-12">
                        <h2 className="text-3xl font-black text-slate-900 mb-10">Account Settings</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Email Address</label>
                                <div className="text-lg font-bold text-slate-900 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 italic">{user?.email}</div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Full Name</label>
                                <div className="text-lg font-bold text-slate-900 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">{user?.user_metadata?.full_name || 'Student'}</div>
                            </div>
                        </div>

                        {/* Password Status */}
                        <div className="flex items-center gap-3 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                                <Lock size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-emerald-900">Security Check</div>
                                <div className="text-sm text-emerald-600 font-medium">Your account is fully protected with encrypted authentication.</div>
                            </div>
                        </div>

                        {/* Set Password Button */}
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-slate-900/10"
                        >
                            <Lock className="w-4 h-4" />
                            Update Password
                        </button>
                        <p className="text-xs text-slate-400 mt-4 font-medium px-1">
                            Regularly changing your password helps keep your study data even more secure.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100"></div>

                    {/* Connected Accounts Section */}
                    <div className="p-8 md:p-12">
                        <h2 className="text-xl font-black text-slate-900 mb-8">Login Providers</h2>

                        <div className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-[1.25rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 text-lg">Google Account</div>
                                    <div className="text-sm text-slate-500 font-medium">Synced via OAuth 2.0</div>
                                </div>
                            </div>
                            <div className="px-5 py-2 bg-emerald-100/50 border border-emerald-200 rounded-xl">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Billing History Section */}
                    <div className="p-8 md:p-12 bg-slate-50/30">
                        <h2 className="text-xl font-black text-slate-900 mb-8">Billing & Subscription</h2>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Lock size={32} />
                            </div>
                            <div className="font-black text-slate-900 text-xl mb-2">Free Version</div>
                            <div className="text-slate-500 font-medium mb-8">You are currently using visdly Free. Upgrade to unlock all limits.</div>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="px-10 py-4 bg-[#0ea5e9] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#0ea5e9]/20 hover:scale-[1.05] transition-transform"
                            >
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <SetPasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
        </div>
    );
};
