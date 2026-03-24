'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityCalendarProps {
  data: { date: string; count: number }[];
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ data }) => {
  // Simple 4-week or 30-day view for minimalism
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toISOString().split('T')[0];
    const activity = data.find(item => item.date === dateStr);
    return {
      date: dateStr,
      count: activity?.count || 0,
      dayName: d.toLocaleDateString('ja-JP', { weekday: 'short' }),
      isToday: d.toDateString() === new Date().toDateString()
    };
  });

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-muted/30';
    if (count === 1) return 'bg-accent/40';
    if (count === 2) return 'bg-accent/70';
    return 'bg-accent border border-accent-foreground/20 shadow-[0_0_8px_rgba(var(--accent),0.5)]';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Thought Activity (Last 28 Days)
        </h4>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => (
          <TooltipProvider key={day.date}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    aspect-square rounded-sm transition-all duration-500 
                    ${getIntensityClass(day.count)}
                    ${day.isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                    hover:scale-110 hover:z-10 cursor-default
                  `}
                  style={{ animationDelay: `${i * 0.02}s` }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="vintage-card px-2 py-1 text-[10px]">
                <p className="font-bold">{day.date} ({day.dayName})</p>
                <p>{day.count} トレーニング</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      <div className="flex justify-between mt-3 text-[9px] text-muted-foreground uppercase tracking-tighter">
        <span>{days[0].date}</span>
        <span>Today</span>
      </div>
    </div>
  );
};
