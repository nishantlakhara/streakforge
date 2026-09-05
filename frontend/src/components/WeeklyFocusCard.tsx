import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Star } from 'lucide-react';

export interface WeeklyFocus {
  week: number;
  title: string;
  description: string;
  drills: string[];
}

interface WeeklyFocusCardProps {
  focus: WeeklyFocus;
}

const WeeklyFocusCard: React.FC<WeeklyFocusCardProps> = ({ focus }) => {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Star size={80} className="text-white" />
      </div>
      <CardContent className="pt-6 pb-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <Badge className="bg-blue-600 hover:bg-blue-600 text-[10px] font-black uppercase tracking-widest px-2 py-1">Week {focus.week}</Badge>
          <h3 className="text-white text-xl font-black tracking-tight">{focus.title}</h3>
        </div>
        <p className="text-slate-400 text-sm mb-6 font-medium leading-relaxed italic border-l-2 border-blue-600 pl-3">{focus.description}</p>
        <div className="grid grid-cols-1 gap-2">
          {focus.drills.map((drill: string, i: number) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-200 bg-white/5 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center">
                <CheckCircle2 size={14} className="text-blue-500" />
              </div>
              <span className="font-bold tracking-tight">{drill}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyFocusCard;
