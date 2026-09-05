import React, { useMemo, useRef } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Download, Upload, Trash2, TrendingUp, Droplets, Info, Award, Zap } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';

const Stats: React.FC = () => {
  const { records, getStats, exportData, importData, activeProfile } = usePlanner();
  const stats = getStats();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeProfile) {
      return (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                  <TrendingUp size={40} />
              </div>
              <div>
                  <h3 className="font-black text-slate-900">No Profile Selected</h3>
                  <p className="text-sm text-slate-400">Please register or select a profile to view stats.</p>
              </div>
          </div>
      );
  }

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const record = records[dateStr];
      
      let completion = 0;
      if (record) {
        const total = record.tasks.length + record.nutrition.length;
        const done = record.tasks.filter(t => t.completed).length + record.nutrition.filter(n => n.completed).length;
        completion = total > 0 ? (done / total) * 100 : 0;
      }
      
      data.push({
        name: format(date, 'EEE'),
        completion: Math.round(completion),
        hydration: record?.hydration.glasses || 0
      });
    }
    return data;
  }, [records]);

  const handleExport = async () => {
    const json = await exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streakforge-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const json = event.target?.result as string;
      try {
        await importData(json);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
        className="space-y-6 pb-6"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.1 }}
    >
      <header className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Performance</p>
            <h1 className="text-xl font-black text-slate-900">Training Insights</h1>
        </div>
        <div className="bg-blue-50 p-2 rounded-2xl">
            <TrendingUp size={24} className="text-blue-600" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={sectionVariants}>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none shadow-lg shadow-green-100 rounded-3xl overflow-hidden">
                <CardContent className="pt-6 pb-6 text-center text-white relative">
                    <Zap size={40} className="absolute -top-2 -right-2 opacity-10" fill="white" />
                    <p className="text-3xl font-black mb-1">{stats.perfectDays}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Perfect Days</p>
                </CardContent>
            </Card>
        </motion.div>
        <motion.div variants={sectionVariants}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none shadow-lg shadow-blue-100 rounded-3xl overflow-hidden">
                <CardContent className="pt-6 pb-6 text-center text-white relative">
                    <Award size={40} className="absolute -top-2 -right-2 opacity-10" fill="white" />
                    <p className="text-3xl font-black mb-1">{Object.keys(records).length}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Logs</p>
                </CardContent>
            </Card>
        </motion.div>
      </div>

      <motion.div variants={sectionVariants}>
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} className="text-blue-400" /> Completion Trend
                </h3>
            </div>
            <CardContent className="h-56 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fontWeight: 900, fill: '#94a3b8' }}
                        />
                        <YAxis hide domain={[0, 105]} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            itemStyle={{ fontWeight: 900, fontSize: '12px', color: '#2563eb' }}
                            labelStyle={{ fontWeight: 900, fontSize: '10px', color: '#64748b', marginBottom: '4px' }}
                            formatter={(value) => [`${value}%`, 'Done']}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="completion" 
                            stroke="#2563eb" 
                            strokeWidth={4} 
                            dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                            activeDot={{ r: 7, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={sectionVariants}>
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Droplets size={14} className="text-blue-200" fill="white" /> Water Intake
                </h3>
            </div>
            <CardContent className="h-56 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fontWeight: 900, fill: '#94a3b8' }}
                        />
                        <YAxis hide domain={[0, 11]} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            itemStyle={{ fontWeight: 900, fontSize: '12px', color: '#3b82f6' }}
                            labelStyle={{ fontWeight: 900, fontSize: '10px', color: '#64748b', marginBottom: '4px' }}
                            formatter={(value) => [`${value} glasses`, 'Hydration']}
                        />
                        <Bar dataKey="hydration" radius={[8, 8, 8, 8]} barSize={24}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.hydration >= 8 ? '#3b82f6' : '#bfdbfe'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={sectionVariants} className="space-y-4">
        <div className="flex items-center gap-2 px-1">
            <Info size={14} className="text-slate-400" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vault & Data</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="justify-start gap-4 h-16 rounded-3xl border-slate-100 shadow-sm bg-white hover:bg-slate-50 transition-all active:scale-95" onClick={handleExport}>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Download size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                    <p className="text-sm font-black text-slate-900">Export Backup</p>
                    <p className="text-[10px] font-bold text-slate-400">Save your journey as JSON</p>
                </div>
            </Button>
            
            <Button variant="outline" className="justify-start gap-4 h-16 rounded-3xl border-slate-100 shadow-sm bg-white hover:bg-slate-50 transition-all active:scale-95" onClick={() => fileInputRef.current?.click()}>
                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
                    <Upload size={20} className="text-green-600" />
                </div>
                <div className="text-left">
                    <p className="text-sm font-black text-slate-900">Import Backup</p>
                    <p className="text-[10px] font-bold text-slate-400">Restore your progress</p>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleImport}
                />
            </Button>

            <Button variant="outline" className="justify-start gap-4 h-16 rounded-3xl border-red-50 bg-red-50/30 hover:bg-red-50 text-red-600 border-none shadow-sm transition-all active:scale-95" onClick={() => {
                if (confirm('DANGER: This will delete ALL your training history. Are you absolutely sure?')) {
                    localStorage.removeItem('parth-skating-planner-v1');
                    window.location.reload();
                }
            }}>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center">
                    <Trash2 size={20} />
                </div>
                <div className="text-left">
                    <p className="text-sm font-black">Reset Factory</p>
                    <p className="text-[10px] font-bold text-red-400">Permanently wipe all data</p>
                </div>
            </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Stats;
