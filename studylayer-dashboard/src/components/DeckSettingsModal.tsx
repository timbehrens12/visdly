import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pipette } from 'lucide-react';

interface DeckSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentColor: string;
    onSave: (newName: string, newColor: string) => void;
    type: 'deck' | 'folder';
}

const PRESET_COLORS = [
    { name: 'Purple', class: 'bg-purple-500', hex: '#a855f7' },
    { name: 'Blue', class: 'bg-blue-500', hex: '#3b82f6' },
    { name: 'Emerald', class: 'bg-emerald-500', hex: '#10b981' },
    { name: 'Orange', class: 'bg-orange-500', hex: '#f97316' },
    { name: 'Rose', class: 'bg-rose-500', hex: '#f43f5e' },
    { name: 'Amber', class: 'bg-amber-500', hex: '#f59e0b' },
    { name: 'Indigo', class: 'bg-indigo-500', hex: '#6366f1' },
    { name: 'Slate', class: 'bg-slate-500', hex: '#64748b' },
    { name: 'Brand', class: 'bg-brand-primary', hex: '#6366f1' }, // Default
];

export function DeckSettingsModal({ isOpen, onClose, currentName, currentColor, onSave, type }: DeckSettingsModalProps) {
    const [name, setName] = useState(currentName);
    const [color, setColor] = useState(currentColor);
    const [showCustomColor, setShowCustomColor] = useState(!currentColor.startsWith('bg-'));
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(currentName);
            setColor(currentColor);
            setShowCustomColor(!currentColor.startsWith('bg-'));
        }
    }, [isOpen, currentName, currentColor]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim(), color);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-md bg-white dark:bg-[#18181b] rounded-2xl border border-black/5 dark:border-white/10 shadow-xl overflow-hidden relative z-10 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                {type === 'deck' ? 'Deck' : 'Folder'} Settings
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={`${type === 'deck' ? 'Deck' : 'Folder'} Name`}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {PRESET_COLORS.map((preset) => (
                                        <button
                                            key={preset.class}
                                            type="button"
                                            onClick={() => {
                                                setColor(preset.class);
                                                setShowCustomColor(false);
                                            }}
                                            className={`w-8 h-8 rounded-full transition-all ${preset.class} ${color === preset.class && !showCustomColor
                                                ? 'ring-2 ring-offset-2 ring-brand-primary dark:ring-offset-[#18181b] scale-110'
                                                : 'hover:scale-110'
                                                }`}
                                            title={preset.name}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomColor(true)}
                                        className={`w-8 h-8 rounded-full transition-all flex items-center justify-center border border-zinc-200 dark:border-zinc-800 ${showCustomColor
                                            ? 'ring-2 ring-offset-2 ring-brand-primary dark:ring-offset-[#18181b] scale-110 bg-zinc-100 dark:bg-zinc-800'
                                            : 'hover:scale-110 bg-zinc-50 dark:bg-zinc-900/50'
                                            }`}
                                        title="Custom Color"
                                    >
                                        <Pipette className={`w-3.5 h-3.5 ${showCustomColor ? 'text-brand-primary' : 'text-zinc-500'}`} />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showCustomColor && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-3 pt-2 overflow-hidden"
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-1 relative">
                                                    <div
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md border border-black/10"
                                                        style={{ backgroundColor: color.startsWith('bg-') ? '#6366f1' : color }}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={color.startsWith('bg-') ? '' : color}
                                                        onChange={(e) => setColor(e.target.value)}
                                                        placeholder="#000000"
                                                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-brand-primary transition-all font-mono"
                                                    />
                                                </div>
                                                <input
                                                    type="color"
                                                    value={color.startsWith('bg-') ? '#6366f1' : color}
                                                    onChange={(e) => setColor(e.target.value)}
                                                    className="w-10 h-9 p-1 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!name.trim() || (name.trim() === currentName && color === currentColor)}
                                    className="px-6 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-sm hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
