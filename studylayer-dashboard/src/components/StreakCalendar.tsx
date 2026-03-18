import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { useStudyProgress } from '../contexts/StudyProgressContext';

interface StreakCalendarProps {
    isExpanded?: boolean;
    setIsExpanded?: (isExpanded: boolean) => void;
}

export function StreakCalendar({ isExpanded: controlledIsExpanded, setIsExpanded: controlledSetIsExpanded }: StreakCalendarProps) {
    const { dailyStats } = useStudyProgress();
    const [localIsExpanded, setLocalIsExpanded] = useState(false);

    const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : localIsExpanded;
    const setIsExpanded = controlledSetIsExpanded !== undefined ? controlledSetIsExpanded : setLocalIsExpanded;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Data for the strip (Week View)
    const weekDays = useMemo(() => {
        const curr = new Date();
        const first = curr.getDate() - curr.getDay() + 1; // First day is Monday
        const days = [];
        for (let i = 0; i < 7; i++) {
            const next = new Date(curr.setDate(first + i));
            days.push(new Date(next));
        }
        return days;
    }, []);

    // Data for the full view (Month View)
    const monthDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

        return { days, padding, year, month };
    }, [currentDate]);

    const studiedDates = useMemo(() => {
        return new Set(dailyStats.filter(s => s.cardsStudied > 0).map(s => s.date));
    }, [dailyStats]);

    const getDayKey = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const getDayKeyFromParts = (day: number, month: number, year: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSelected = (day: number, month: number, year: number) => {
        return day === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear();
    };

    const formatDate = (date: Date) => {
        return {
            weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
            day: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        };
    };

    const isSelectedStudied = studiedDates.has(getDayKey(selectedDate));

    return (
        <>
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <motion.div
                        key="compact"
                        layoutId="calendar-container"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-surface/50 backdrop-blur-md border border-border rounded-3xl p-6 w-full cursor-pointer hover:bg-surface/70 transition-colors group"
                        onClick={() => setIsExpanded(true)}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <motion.h3 layoutId="calendar-title" className="text-xl font-bold text-foreground">
                                {formatDate(new Date()).full}
                            </motion.h3>
                            <div className="flex items-center gap-2 text-foreground-muted group-hover:text-foreground transition-colors">
                                <span className="text-sm font-medium">View Full Calendar</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-4">
                            {weekDays.map((date, i) => {
                                const formatted = formatDate(date);
                                const isCurrent = isToday(date);
                                const dateKey = getDayKey(date);
                                const hasStudied = studiedDates.has(dateKey);

                                return (
                                    <div
                                        key={i}
                                        className={`
                                            relative flex flex-col items-start p-4 rounded-2xl border transition-all duration-300
                                            ${isCurrent
                                                ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(var(--brand-primary),0.15)]'
                                                : 'bg-surface border-transparent hover:border-border'
                                            }
                                        `}
                                    >
                                        <span className={`text-sm font-medium mb-1 ${isCurrent ? 'text-brand-primary' : 'text-foreground-secondary'}`}>
                                            {formatted.weekday}
                                        </span>
                                        <span className={`text-lg font-bold ${isCurrent ? 'text-foreground' : 'text-foreground-muted'}`}>
                                            {formatted.month} {formatted.day}
                                        </span>

                                        {hasStudied && (
                                            <div className="absolute top-4 right-4 flex gap-1">
                                                <div className="text-emerald-500">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                                <div className="text-orange-500">
                                                    <Flame className="w-4 h-4 fill-current" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <AnimatePresence>
                {isExpanded && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsExpanded(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-2xl bg-white dark:bg-[#18181b] rounded-2xl border border-black/5 dark:border-white/10 shadow-xl overflow-hidden relative z-10 p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                                        <Flame className="w-8 h-8 text-orange-500 fill-current" />
                                        Study Streak
                                    </h2>
                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                                        Check your progress and keep the momentum alive
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-2 -mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setCurrentDate(new Date(monthDays.year, monthDays.month - 1))}
                                        className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full text-zinc-500 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 min-w-[160px] text-center">
                                        {new Date(monthDays.year, monthDays.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button
                                        onClick={() => setCurrentDate(new Date(monthDays.year, monthDays.month + 1))}
                                        className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full text-zinc-500 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex flex-col items-end">
                                        <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-wider">Days Studied</span>
                                        <span className="text-zinc-900 dark:text-zinc-100 font-bold">{studiedDates.size}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-3 mb-4 text-center">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{d}</div>
                                ))}
                            </div>

                            <div className="relative overflow-hidden min-h-[280px]">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.div
                                        key={`${monthDays.year}-${monthDays.month}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-7 gap-3"
                                    >
                                        {monthDays.padding.map(i => <div key={`pad-${i}`} />)}
                                        {monthDays.days.map(day => {
                                            const dateKey = getDayKeyFromParts(day, monthDays.month, monthDays.year);
                                            const isStudied = studiedDates.has(dateKey);
                                            const today = new Date();
                                            const isCurrent = day === today.getDate() && monthDays.month === today.getMonth() && monthDays.year === today.getFullYear();
                                            const isDaySelected = isSelected(day, monthDays.month, monthDays.year);

                                            return (
                                                <div
                                                    key={day}
                                                    onClick={() => setSelectedDate(new Date(monthDays.year, monthDays.month, day))}
                                                    className={`
                                                        aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer group
                                                        ${isDaySelected
                                                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 scale-105 z-20'
                                                            : isStudied
                                                                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                                                : 'bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-brand-primary/50'
                                                        }
                                                    `}
                                                >
                                                    <span className={`text-base font-bold mb-0.5`}>
                                                        {day}
                                                    </span>

                                                    {isStudied && !isDaySelected && (
                                                        <Flame className="w-3 h-3 fill-current opacity-80" />
                                                    )}

                                                    {isCurrent && !isDaySelected && !isStudied && (
                                                        <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-brand-primary" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="mt-10 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Activity for</p>
                                    <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h4>
                                </div>

                                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isSelectedStudied ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'}`}>
                                    {isSelectedStudied ? (
                                        <>
                                            <Flame className="w-5 h-5 fill-current" />
                                            <div className="leading-tight">
                                                <span className="block text-sm font-bold">Goal Completed</span>
                                                <span className="text-[10px] opacity-80 uppercase font-black">Streak Active</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-5 h-5 flex items-center justify-center text-lg">💤</div>
                                            <div className="leading-tight">
                                                <span className="block text-sm font-bold">No Activity</span>
                                                <span className="text-[10px] opacity-80 uppercase font-black">Rest Day</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
