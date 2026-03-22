import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SignIn } from '../lib/clerk';

export const LoginPage = () => {
    // Port 5174 is where your dashboard is running
    const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5174';

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

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[440px] flex flex-col items-center"
                >
                    <div className="flex flex-col items-center mb-6 md:mb-10">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome back</h1>
                        <p className="text-slate-500 font-medium text-center">
                            Sign in to access your study materials and AI help.
                        </p>
                    </div>

                    <div className="w-full flex justify-center scale-[0.9] sm:scale-100 origin-center transition-transform">
                        <SignIn 
                            signUpUrl="/signup" 
                            afterSignInUrl={dashboardUrl}
                            fallbackRedirectUrl={dashboardUrl}
                        />
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 w-full text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-[#0ea5e9] font-bold hover:underline">
                                Create one
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
