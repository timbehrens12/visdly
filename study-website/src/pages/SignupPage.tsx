import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const SignupPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { session }, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;
            
            // Redirect to dashboard page after signup
            const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5174';
            if (session && dashboardUrl.includes('localhost')) {
                // Pass session to dashboard for cross-port login during dev
                window.location.href = `${dashboardUrl}#access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=signup`;
            } else {
                window.location.href = dashboardUrl;
            }
        } catch (err: any) {
            if (err.message?.includes('Email not confirmed')) {
                setError('Account created! Please verify your email before logging in.');
            } else {
                setError(err.message || 'An error occurred during signup');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5174'}`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || `Could not sign in with ${provider}`);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ffffff] font-sans text-slate-900 selection:bg-[#0ea5e9]/10 flex flex-col">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute inset-0 bg-[#ffffff]" />
                <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{
                        backgroundImage: `linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0ea5e9]/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[100px]" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[440px]"
                >
                    <div className="flex flex-col items-center mb-10">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create your account</h1>
                        <p className="text-slate-500 font-medium text-center">
                            Start your journey with your new AI study sidekick.
                        </p>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-2xl shadow-slate-200/50">
                        {/* Social Logins */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white border-2 border-slate-50 hover:border-slate-100 hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </button>
                            <button
                                onClick={() => handleSocialLogin('apple')}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white border-2 border-slate-50 hover:border-slate-100 hover:bg-slate-50 transition-all font-bold text-slate-700 text-sm"
                            >
                                <svg className="w-5 h-5 fill-slate-900" viewBox="0 0 30 30">
                                    <path d="M25.565,9.785c-0.123,0.077-3.051,1.702-3.051,5.305c0.138,4.109,3.695,5.55,3.756,5.55 c-0.061,0.077-0.537,1.963-1.947,3.94C23.204,26.283,21.962,28,20.076,28c-1.794,0-2.438-1.135-4.508-1.135 c-2.223,0-2.852,1.135-4.554,1.135c-1.886,0-3.22-1.809-4.4-3.496c-1.533-2.208-2.836-5.673-2.882-9 c-0.031-1.763,0.307-3.496,1.165-4.968c1.211-2.055,3.373-3.45,5.734-3.496c1.809-0.061,3.419,1.242,4.523,1.242 c1.058,0,3.036-1.242,5.274-1.242C21.394,7.041,23.97,7.332,25.565,9.785z M15.001,6.688c-0.322-1.61,0.567-3.22,1.395-4.247 c1.058-1.242,2.729-2.085,4.17-2.085c0.092,1.61-0.491,3.189-1.533,4.339C18.098,5.937,16.488,6.872,15.001,6.688z"></path>
                                </svg>
                                Apple
                            </button>
                        </div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-100"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-4 text-slate-400 font-black tracking-widest">or continue with</span>
                            </div>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-5">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0ea5e9] transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0ea5e9] transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all outline-none"
                                        placeholder="name@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0ea5e9] transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 pl-11 pr-12 text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="btn-wrapper w-full">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn w-full !rounded-2xl !py-4"
                                    >
                                        <span className="btn-text">{loading ? 'Creating Account...' : 'Continue'}</span>
                                        {!loading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                            <p className="text-center text-sm text-slate-500 font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#0ea5e9] font-bold hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed px-8">
                        By creating an account, you agree to our{' '}
                        <Link to="/terms" className="text-slate-500 font-bold hover:underline">Terms of Service</Link> and{' '}
                        <Link to="/privacy" className="text-slate-500 font-bold hover:underline">Privacy Policy</Link>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
