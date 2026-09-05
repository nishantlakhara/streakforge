import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanner } from '../context/PlannerContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Zap, Coffee, Stethoscope, Plane, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { DayType } from '../types';
import { isFutureDate } from '../utils/dateUtils';

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { records, activeProfile, getRecord, calculateRecordCompletion, loading } = usePlanner();
  const [viewDate, setViewDate] = React.useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    return eachDayOfInterval({ start, end });
  }, [viewDate]);



  const last7DaysProgress = useMemo(() => {
    const progress = [];
    for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dStr = format(d, 'yyyy-MM-dd');
        const record = getRecord(dStr);
        progress.push({
            day: format(d, 'EE').charAt(0),
            completion: calculateRecordCompletion(record),
            isToday: isSameDay(d, new Date())
        });
    }
    return progress;
  }, [getRecord, calculateRecordCompletion, records]);

  const getDayStatus = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = records[dateStr];
    const isFuture = isFutureDate(date);
    
    // Check for assigned template/schedule
    const templateId = activeProfile?.schedule?.[dateStr];
    const template = activeProfile?.templates?.find(t => t.id === templateId);
    const hasAssignedTemplate = !!templateId && !!template;
    const effectiveType: DayType = record?.type || template?.type || 'training';

    // If there is an active record with progress (only for past & today)
    if (record && !isFuture) {
      const completion = calculateRecordCompletion(record);
      if (completion >= 90) return { color: 'bg-green-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.4)]', label: 'Elite' };
      if (completion >= 60) return { color: 'bg-amber-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.4)]', label: 'Good' };
      if (completion > 0) return { color: 'bg-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.4)]', label: 'Average' };
    }

    // Planned day types (scheduled or logged with 0% progress, or upcoming future days)
    if (effectiveType === 'sick') return { color: 'bg-red-50 text-red-600 border-2 border-red-100', label: 'Sick', icon: Stethoscope };
    if (effectiveType === 'rest') return { color: 'bg-green-50 text-green-600 border-2 border-green-100', label: 'Rest', icon: Coffee };
    if (effectiveType === 'travel') return { color: 'bg-orange-50 text-orange-600 border-2 border-orange-100', label: 'Travel', icon: Plane };

    // If an active training template is scheduled
    if (hasAssignedTemplate && effectiveType === 'training') {
      return { color: 'bg-blue-50 text-blue-600 border-2 border-blue-100', label: 'Training', icon: Dumbbell };
    }

    return { color: 'bg-slate-50 text-slate-300', label: 'Empty' };
  }, [records, calculateRecordCompletion, activeProfile]);

  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

  if (!activeProfile) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                <CalendarIcon size={40} />
            </div>
            <div>
                <h3 className="font-black text-slate-900">No Profile Selected</h3>
                <p className="text-sm text-slate-400">Create or select a profile to view the log.</p>
            </div>
        </div>
    );
  }

  if (loading) {
      return (
          <div className="flex items-center justify-center py-40">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
      );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-4"
    >


      {/* 2. Progress Bar for Every Day (Last 7 Days) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={14} className="text-yellow-500" fill="currentColor" /> Daily Progress Log
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Last 7 Days</span>
        </div>
        <Card className="border-none shadow-md rounded-3xl bg-white overflow-hidden">
            <CardContent className="p-4">
                <div className="flex justify-between items-end gap-2 h-16">
                    {last7DaysProgress.map((p, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-slate-50 rounded-full h-10 relative overflow-hidden flex items-end">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${p.completion}%` }}
                                    className={`w-full rounded-full transition-colors ${p.completion >= 90 ? 'bg-green-500' : p.completion >= 60 ? 'bg-amber-400' : p.completion > 0 ? 'bg-red-500' : 'bg-slate-200'}`}
                                />
                            </div>
                            <span className={`text-[10px] font-black ${p.isToday ? 'text-blue-600' : 'text-slate-400'}`}>{p.day}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </section>

      {/* 3. The Calendar Log */}
      <section className="space-y-3">
        <header className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{format(viewDate, 'MMMM yyyy')}</h1>
            </div>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-full hover:bg-slate-50 h-8 w-8">
                    <ChevronLeft size={18} className="text-slate-600" />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full hover:bg-slate-50 h-8 w-8">
                    <ChevronRight size={18} className="text-slate-600" />
                </Button>
            </div>
        </header>

        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
            <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-3 mb-4">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={`header-${idx}`} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-3">
                    {Array.from({ length: days[0].getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {days.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isToday = isSameDay(day, new Date());
                        const isFuture = isFutureDate(day);
                        const status = getDayStatus(day);
                        const record = records[dateStr];
                        const completion = (record && !isFuture) ? calculateRecordCompletion(record) : 0;
                        const hasRecord = !!record && !isFuture;
                        
                        return (
                            <motion.button
                                key={dateStr}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => navigate(`/day/${dateStr}`)}
                                className={`
                                    aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-black transition-all relative overflow-hidden
                                    ${status.color}
                                    ${isToday ? 'ring-2 ring-blue-600 ring-offset-2 scale-105' : ''}
                                `}
                            >
                                <span className={status.icon ? 'text-[10px] opacity-40 absolute top-1 left-1' : ''}>
                                    {format(day, 'd')}
                                </span>
                                {status.icon && React.createElement(status.icon, { size: 20, className: "mt-1" })}
                                {isToday && (
                                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border border-white" />
                                )}
                                {hasRecord && !status.icon && (
                                    <div className="absolute bottom-1.5 left-2 right-2 h-1 bg-white/30 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={false}
                                            animate={{ width: `${completion}%` }}
                                            className="h-full bg-white"
                                        />
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
            <Info size={14} className="text-slate-400" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Legend</h3>
        </div>
        <div className="flex flex-wrap gap-2">
            <div className="bg-white px-3 py-2 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">Elite (90%+)</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">Good (60-90%)</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">Average (&lt;60%)</span>
            </div>
        </div>
      </section>
    </motion.div>
  );
};

export default CalendarPage;
