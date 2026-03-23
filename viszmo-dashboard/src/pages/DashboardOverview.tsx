import { motion } from 'framer-motion';

export function DashboardOverview() {
  return (
    <div className="h-screen w-full flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-24 rounded-[3rem] text-center"
      >
        <span className="badge-premium mb-6">Phase 1</span>
        <h1 className="text-7xl font-black gradient-text mb-4">NEW DASHBOARD</h1>
        <p className="text-foreground-secondary text-xl font-bold uppercase tracking-widest">
          Construction in progress
        </p>
      </motion.div>
    </div>
  );
}
