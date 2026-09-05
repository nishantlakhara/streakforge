import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlanner } from '../context/PlannerContext';
import { format, parseISO } from 'date-fns';
import { 
    ChevronLeft, CheckCircle2, Droplets, Moon, 
    Utensils, Zap, Star, Coffee, Stethoscope, Plane, Dumbbell,
    Settings2, Target, Calendar as CalendarIcon, Lock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { isFutureDate } from '../utils/dateUtils';

const DAY_TYPE_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
    training: { icon: Dumbbell, color: 'text-blue-600 bg-blue-50 border-blue-100', label: 'Active Day' },
    rest: { icon: Coffee, color: 'text-green-600 bg-green-50 border-green-100', label: 'Rest Day' },
    sick: { icon: Stethoscope, color: 'text-red-600 bg-red-50 border-red-100', label: 'Sick Day' },
    travel: { icon: Plane, color: 'text-orange-600 bg-orange-50 border-orange-100', label: 'Travel' }
};

const DailyPlanner: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { 
    records,
    getRecord, activeProfile, calculateRecordCompletion, 
    toggleItem, toggleDrill, updateHydration, updateSleep, assignTemplateToDates 
  } = usePlanner();

  const isFuture = useMemo(() => isFutureDate(date!), [date]);
  const record = useMemo(() => getRecord(date!), [date, getRecord, records]);
  const displayDate = useMemo(() => parseISO(date!), [date]);
  const completion = useMemo(() => calculateRecordCompletion(record), [record, calculateRecordCompletion]);

  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const templateName = useMemo(() => {
    if (!record.templateId || !activeProfile) return null;
    return activeProfile.templates?.find(t => t.id === record.templateId)?.name;
  }, [record.templateId, activeProfile]);

  const handleQuickAssign = async () => {
    if (selectedTemplate && date) {
        await assignTemplateToDates(selectedTemplate === 'CLEAR' ? '' : selectedTemplate, [date]);
        setIsAssigning(false);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!activeProfile) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                <Zap size={40} />
            </div>
            <div>
                <h3 className="font-black text-slate-900">No Profile Selected</h3>
                <p className="text-sm text-slate-400">Please select a profile to log your day.</p>
            </div>
        </div>
    );
  }

  const hasDrills = record.drills && record.drills.length > 0;

  return (
    <motion.div 
        className="space-y-6 pb-6"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.1 }}
    >
      <header className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ChevronLeft size={24} className="text-slate-600" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-slate-900 leading-tight truncate">{format(displayDate, 'MMM do')}</h1>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest leading-none">{format(displayDate, 'EEEE')}</p>
            {templateName && (
                <>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">{templateName}</p>
                </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Dialog open={isAssigning} onOpenChange={(open) => { setIsAssigning(open); if (open) setSelectedTemplate(record.templateId || 'CLEAR'); }}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600">
                        <Settings2 size={20} />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90%] rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="font-black italic uppercase text-blue-600">Set Day Plan</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-xs font-bold text-slate-400">Choose a template to apply to {format(displayDate, 'MMMM do')}:</p>
                        <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
                            <SelectTrigger className="w-full h-12 rounded-2xl border-slate-100 font-bold bg-slate-50">
                                <SelectValue placeholder="Select template..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CLEAR">(Default / Static)</SelectItem>
                                {(activeProfile?.templates || []).map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button 
                            className="w-full h-12 rounded-2xl bg-blue-600 font-black uppercase tracking-widest text-white"
                            onClick={handleQuickAssign}
                            disabled={!selectedTemplate}
                        >
                            Apply Plan
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${DAY_TYPE_CONFIG[record.type || 'training']?.color || 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                {React.createElement(DAY_TYPE_CONFIG[record.type || 'training']?.icon || Dumbbell, { size: 20 })}
            </div>
            {isFuture ? (
                <div className="px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 flex flex-col items-center justify-center min-w-[60px]">
                    <span className="text-[8px] font-black uppercase leading-none text-blue-400">Status</span>
                    <span className="text-xs font-black leading-none text-blue-600 mt-0.5">Planned</span>
                </div>
            ) : (
                <div className={`px-3 py-1.5 rounded-full border flex flex-col items-center justify-center min-w-[60px] transition-colors ${completion >= 90 ? 'bg-green-500 border-green-600 shadow-lg shadow-green-100' : completion >= 60 ? 'bg-amber-400 border-amber-500 shadow-lg shadow-amber-100' : completion > 0 ? 'bg-red-500 border-red-600 shadow-lg shadow-red-100' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`text-[8px] font-black uppercase leading-none ${completion > 0 ? 'text-white/80' : 'text-slate-400'}`}>Done</span>
                    <span className={`text-sm font-black leading-none ${completion > 0 ? 'text-white' : 'text-slate-400'}`}>{Math.round(completion)}%</span>
                </div>
            )}
        </div>
      </header>

      {/* Progress Bar (Today / Past Dates) */}
      {!isFuture && (
        <motion.div variants={sectionVariants} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap size={12} className={completion >= 90 ? 'text-green-500' : completion >= 60 ? 'text-amber-500' : completion > 0 ? 'text-red-500' : 'text-slate-300'} fill="currentColor" />
                    Daily Progress
                </span>
                <span className={`font-black ${completion >= 90 ? 'text-green-600' : completion >= 60 ? 'text-amber-600' : completion > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {Math.round(completion)}% Completed
                </span>
            </div>
            <Progress 
                value={completion} 
                className="h-2.5 bg-slate-100" 
                indicatorClassName={
                    completion >= 90 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                    completion >= 60 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' :
                    completion > 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                    'bg-slate-300'
                }
            />
        </motion.div>
      )}

      {/* Future Planning Mode Banner */}
      {isFuture && (
        <motion.div 
            variants={sectionVariants} 
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-4 flex items-center gap-3.5 shadow-sm"
        >
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
                <CalendarIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wide">Planning Mode</p>
                    <Badge variant="outline" className="text-[9px] font-black uppercase border-blue-200 bg-white text-blue-600 py-0">Upcoming</Badge>
                </div>
                <p className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                    You can configure this day's template with the plan button above. Checklists & logging unlock on {format(displayDate, 'MMMM do')}.
                </p>
            </div>
        </motion.div>
      )}

      {/* Routine Section */}
      <motion.section variants={sectionVariants} className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={14} className="text-yellow-500" fill="currentColor" /> Daily Routine
            </h3>
        </div>
        <Card className="border-none shadow-md overflow-hidden rounded-3xl">
            <CardContent className="p-0">
                {(record.tasks || []).map((task) => (
                    <motion.div 
                        key={task.id} 
                        whileTap={!isFuture ? { backgroundColor: "rgba(241, 245, 249, 1)" } : undefined}
                        className={`flex items-center justify-between p-4 border-b border-slate-50 last:border-0 transition-colors ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer'} ${task.completed ? 'bg-green-50/30' : 'bg-white'}`}
                        onClick={!isFuture ? () => toggleItem(date!, 'tasks', task.id) : undefined}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${task.completed ? 'bg-green-500 border-green-500 scale-110 shadow-lg shadow-green-200' : isFuture ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200'}`}>
                                {task.completed && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <span className={`text-sm font-bold tracking-tight ${task.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                                {task.label}
                            </span>
                        </div>
                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-tighter ${task.completed ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                            {task.category}
                        </Badge>
                    </motion.div>
                ))}
            </CardContent>
        </Card>
      </motion.section>

      {/* Nutrition Section */}
      <motion.section variants={sectionVariants} className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Utensils size={14} className="text-green-500" /> Meals & Nutrition
            </h3>
        </div>
        <Card className="border-none shadow-md overflow-hidden rounded-3xl">
            <CardContent className="p-0">
                {/* Group by category dynamically */}
                {Array.from(new Set((record.nutrition || []).map(n => n.category))).map((meal) => (
                    <div key={meal} className="p-4 border-b border-slate-50 last:border-0 bg-white">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">{meal}</p>
                        <div className="grid grid-cols-1 gap-2">
                            {(record.nutrition || []).filter(n => n.category === meal).map(item => (
                                <motion.div 
                                    key={item.id} 
                                    whileTap={!isFuture ? { scale: 0.98 } : undefined}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer'} ${item.completed ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}
                                    onClick={!isFuture ? () => toggleItem(date!, 'nutrition', item.id) : undefined}
                                >
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${item.completed ? 'bg-green-500 rotate-0 shadow-lg shadow-green-100' : 'bg-white border-2 border-slate-200 rotate-45'}`}>
                                        {item.completed && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                    <span className={`text-xs font-bold tracking-tight ${item.completed ? 'text-green-700' : 'text-slate-600'}`}>
                                        {item.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      </motion.section>

      {/* Goals / Training Targets Section — only shown if drills defined */}
      {hasDrills && (
        <motion.section variants={sectionVariants} className="space-y-3">
          <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Target size={14} className="text-indigo-500" /> Goals & Targets
              </h3>
              <span className="text-[10px] font-black text-slate-400">
                {(record.drills || []).filter(d => d.completed).length}/{(record.drills || []).length}
              </span>
          </div>
          <Card className="border-none shadow-md overflow-hidden rounded-3xl">
              <CardContent className="p-0">
                  {(record.drills || []).map((drill, index) => (
                      <motion.div
                          key={index}
                          whileTap={!isFuture ? { backgroundColor: "rgba(241, 245, 249, 1)" } : undefined}
                          className={`flex items-center justify-between p-4 border-b border-slate-50 last:border-0 transition-colors ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer'} ${drill.completed ? 'bg-indigo-50/30' : 'bg-white'}`}
                          onClick={!isFuture ? () => toggleDrill(date!, index) : undefined}
                      >
                          <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${drill.completed ? 'bg-indigo-500 border-indigo-500 scale-110 shadow-lg shadow-indigo-200' : isFuture ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200'}`}>
                                  {drill.completed && <CheckCircle2 size={16} className="text-white" />}
                              </div>
                              <span className={`text-sm font-bold tracking-tight ${drill.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                                  {drill.label}
                              </span>
                          </div>
                          <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-tighter ${drill.completed ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                              Target
                          </Badge>
                      </motion.div>
                  ))}
              </CardContent>
          </Card>
        </motion.section>
      )}

      {/* Hydration Section */}
      <motion.section variants={sectionVariants} className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Droplets size={14} className="text-blue-500" fill="currentColor" /> Hydration
            </h3>
            <span className="text-xs font-black text-blue-600">{(record.hydration?.glasses || 0)}/10</span>
        </div>
        <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6">
                <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <motion.button
                            key={i}
                            disabled={isFuture}
                            whileTap={!isFuture ? { scale: 0.9, rotate: 10 } : undefined}
                            onClick={!isFuture ? () => updateHydration(date!, i) : undefined}
                            className={`aspect-square rounded-2xl transition-all flex items-center justify-center relative overflow-hidden ${isFuture ? 'cursor-not-allowed opacity-60' : ''} ${i <= (record.hydration?.glasses || 0) ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-50 border border-slate-100'}`}
                        >
                            <Droplets 
                                size={20} 
                                className={`${i <= (record.hydration?.glasses || 0) ? 'text-white' : 'text-slate-200'}`} 
                                fill={i <= (record.hydration?.glasses || 0) ? 'white' : 'transparent'} 
                            />
                            {i <= (record.hydration?.glasses || 0) && (
                                <motion.div 
                                    initial={{ y: 20 }}
                                    animate={{ y: 0 }}
                                    className="absolute inset-0 bg-white/20 pointer-events-none"
                                />
                            )}
                        </motion.button>
                    ))}
                </div>
            </CardContent>
        </Card>
      </motion.section>

      {/* Sleep Section */}
      <motion.section variants={sectionVariants} className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Moon size={14} className="text-indigo-600" fill="currentColor" /> Recovery (Sleep)
            </h3>
        </div>
        <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Lights Out</label>
                        <Input 
                            type="time" 
                            disabled={isFuture}
                            className={`bg-slate-50 border-none rounded-2xl h-12 font-bold focus-visible:ring-indigo-500 ${isFuture ? 'cursor-not-allowed opacity-60' : ''}`}
                            value={record.sleep?.bedTime || ''} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSleep(date!, 'bedTime', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Wake Up</label>
                        <Input 
                            type="time" 
                            disabled={isFuture}
                            className={`bg-slate-50 border-none rounded-2xl h-12 font-bold focus-visible:ring-indigo-500 ${isFuture ? 'cursor-not-allowed opacity-60' : ''}`}
                            value={record.sleep?.wakeTime || ''} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSleep(date!, 'wakeTime', e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Hours</label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                disabled={isFuture}
                                className={`bg-slate-50 border-none rounded-2xl h-12 font-bold pr-10 focus-visible:ring-indigo-500 ${isFuture ? 'cursor-not-allowed opacity-60' : ''}`}
                                value={record.sleep?.hours || ''} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSleep(date!, 'hours', parseFloat(e.target.value))}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">hrs</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sleep Score</label>
                        <Select 
                            disabled={isFuture}
                            value={record.sleep?.score || 'needs-improvement'} 
                            onValueChange={(v: string) => updateSleep(date!, 'score', v)}
                        >
                            <SelectTrigger className={`bg-slate-50 border-none rounded-2xl h-12 font-bold focus-visible:ring-indigo-500 ${isFuture ? 'cursor-not-allowed opacity-60' : ''}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-xl">
                                <SelectItem value="excellent">Excellent 💎</SelectItem>
                                <SelectItem value="good">Good ✨</SelectItem>
                                <SelectItem value="needs-improvement">Needs Work 🔋</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  );
};

export default DailyPlanner;
