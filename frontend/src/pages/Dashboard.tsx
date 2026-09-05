import React, { useMemo } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Flame, Quote, Trophy, Star, Award, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MOTIVATIONAL_QUOTES } from '../constants';
import { getTodayStr } from '../utils/dateUtils';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { getStats, getRecord, activeProfile, calculateRecordCompletion } = usePlanner();
  const stats = getStats();
  const today = new Date();

  const randomQuote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }, []);

  const todayRecord = getRecord(getTodayStr());
  const todayCompletion = useMemo(() => {
    return Math.round(calculateRecordCompletion(todayRecord));
  }, [todayRecord, calculateRecordCompletion]);

  const progressStatus = useMemo(() => {
    if (todayCompletion >= 90) {
      return {
        barColor: 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]',
        badgeBg: 'bg-green-400/25 text-white border-green-300/50',
        badgeLabel: 'Elite (90%+)',
        starColor: 'text-green-300'
      };
    }
    if (todayCompletion >= 60) {
      return {
        barColor: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]',
        badgeBg: 'bg-amber-400/25 text-white border-amber-300/50',
        badgeLabel: 'Good (60-89%)',
        starColor: 'text-amber-300'
      };
    }
    if (todayCompletion > 0) {
      return {
        barColor: 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]',
        badgeBg: 'bg-red-400/25 text-white border-red-300/50',
        badgeLabel: 'Average (<60%)',
        starColor: 'text-red-300'
      };
    }
    return {
      barColor: 'bg-white/30',
      badgeBg: 'bg-white/10 text-blue-100 border-white/20',
      badgeLabel: 'Not Started',
      starColor: 'text-blue-200'
    };
  }, [todayCompletion]);

  const achievement = useMemo(() => {
    const streakLevel = Math.max(stats.currentStreak, stats.longestStreak);
    if (streakLevel >= 90) return { label: 'Legend', icon: '🏆', color: 'bg-indigo-500', textColor: 'text-indigo-900' };
    if (streakLevel >= 30) return { label: 'On Fire', icon: '🥇', color: 'bg-amber-400', textColor: 'text-amber-900' };
    if (streakLevel >= 15) return { label: 'Consistent', icon: '🥈', color: 'bg-slate-300', textColor: 'text-slate-900' };
    if (streakLevel >= 7) return { label: '7 Day Streak', icon: '🔥', color: 'bg-orange-400', textColor: 'text-orange-900' };
    return { label: 'Rising Star', icon: '✨', color: 'bg-blue-400', textColor: 'text-blue-900' };
  }, [stats.currentStreak, stats.longestStreak]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (!activeProfile) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-24 h-24 bg-blue-50 rounded-[40px] flex items-center justify-center text-blue-600 shadow-xl shadow-blue-100/50">
                <Trophy size={48} />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 leading-tight">Welcome to StreakForge!</h3>
                <p className="text-sm font-medium text-slate-400 max-w-[240px]">Create your profile to start building powerful daily habits.</p>
            </div>
            <Button 
                asChild
                className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 px-8 font-black uppercase tracking-widest shadow-lg shadow-blue-200"
            >
                <Link to="/profiles">Get Started</Link>
            </Button>
        </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 pb-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <header className="flex justify-between items-end">
        <div>
          <motion.h2 variants={itemVariants} className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{format(today, 'EEEE, MMMM do')}</motion.h2>
          <motion.h1 variants={itemVariants} className="text-3xl font-black text-slate-900 leading-tight">Go, {activeProfile?.name || 'Champion'}!</motion.h1>
        </div>
        <motion.div variants={itemVariants} className="flex flex-col items-end">
            <div className="bg-orange-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-orange-200 shadow-sm">
                <Flame size={16} className="text-orange-600" fill="currentColor" /> 
                <span className="text-sm font-black text-orange-600">{stats.currentStreak}</span>
            </div>
        </motion.div>
      </header>

      {/* Main Progress Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <TrendingUp size={120} />
            </div>
            <CardContent className="pt-8 pb-8 relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Today's Progress</p>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border backdrop-blur-sm ${progressStatus.badgeBg}`}>
                                {progressStatus.badgeLabel}
                            </span>
                        </div>
                        <h3 className="text-5xl font-black tracking-tighter">{todayCompletion}%</h3>
                    </div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                        <TrendingUp className="text-white" size={32} />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-blue-200">
                        <span>Completion</span>
                        <span className="text-white font-black">{todayCompletion}/100</span>
                    </div>
                    <Progress value={todayCompletion} className="h-3 bg-white/20" indicatorClassName={progressStatus.barColor} />
                </div>
                <p className="text-blue-100 text-xs mt-6 font-medium flex items-center gap-2">
                    {todayCompletion === 100 ? (
                        <><Star size={14} className="text-green-300" fill="currentColor" /> Perfect day! You crushed it.</>
                    ) : todayCompletion >= 90 ? (
                        <><Star size={14} className="text-green-300" fill="currentColor" /> Elite performance today!</>
                    ) : (
                        <><Star size={14} className={progressStatus.starColor} /> Complete {100 - todayCompletion}% more today!</>
                    )}
                </p>
            </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md bg-white">
                <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <CalendarIcon size={20} className="text-blue-600" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Monthly</p>
                    <p className="text-2xl font-black text-slate-900">{Math.round(stats.monthlyCompletion)}%</p>
                </CardContent>
            </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
            <Card className="border-none shadow-md bg-white">
                <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                        <Flame size={20} className="text-orange-600" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Best Streak</p>
                    <p className="text-2xl font-black text-slate-900">{stats.longestStreak}</p>
                </CardContent>
            </Card>
        </motion.div>
      </div>

      {/* Achievement Banner */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className={`${achievement.color} border-none shadow-lg overflow-hidden`}>
            <CardContent className="pt-5 pb-5 flex items-center gap-5">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm">
                    {achievement.icon}
                </div>
                <div>
                    <p className={`text-[10px] ${achievement.textColor} font-black uppercase tracking-widest opacity-70`}>Achievement Unlocked</p>
                    <h3 className={`text-xl font-black ${achievement.textColor} tracking-tight`}>{achievement.label}</h3>
                </div>
                <div className="ml-auto opacity-20">
                    <Trophy size={40} className={achievement.textColor} />
                </div>
            </CardContent>
        </Card>
      </motion.div>

      {/* Motivation Section */}
      <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
        <Quote size={20} className="text-blue-100 absolute top-4 right-4" />
        <p className="text-slate-700 font-bold text-lg leading-relaxed relative z-10">
            "{randomQuote}"
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
