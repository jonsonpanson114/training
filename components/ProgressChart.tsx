'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface Entry {
  id: string;
  promptId: string;
  promptTitle: string;
  category: string;
  content: string;
  tags: string[];
  createdAt: string;
}

interface ProgressChartProps {
  entries: Entry[];
}

const categoryColors: Record<string, string> = {
  basic: '#3b82f6',
  emotion: '#a855f7',
  work: '#22c55e',
  abduction: '#f97316',
  synapse: '#ec4899',
  metaphor: '#eab308',
  fogcatcher: '#06b6d4',
  whysos: '#ef4444',
  sowhat: '#6366f1',
  '5w1h': '#14b8a6',
  prep: '#f59e0b',
  'abduction-lens': '#f43f5e',
};

const categoryNames: Record<string, string> = {
  basic: '基本編',
  emotion: '思考・感情編',
  work: '仕事・ビジネス編',
  abduction: 'アブダクション道場',
  synapse: 'Synapse Match',
  metaphor: 'Metaphor Maker',
  fogcatcher: 'Fog Catcher',
  whysos: 'Why So',
  sowhat: 'So What?',
  '5w1h': '5W1H',
  prep: 'PREP法',
  'abduction-lens': 'Abduction Lens',
};

export function ProgressChart({ entries }: ProgressChartProps) {
  // Daily count chart
  const dailyData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    return days.map(day => {
      const dayStr = format(day, 'MM/dd');
      const count = entries.filter(e => {
        const entryDate = new Date(e.createdAt);
        return format(entryDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      }).length;

      return {
        date: dayStr,
        count,
      };
    });
  }, [entries]);

  // Category distribution chart
  const categoryData = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    entries.forEach(e => {
      categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({
        category: categoryNames[category] || category,
        count,
        color: categoryColors[category] || '#888',
      }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  // Weekly data
  const weeklyData = useMemo(() => {
    const today = new Date();
    const sevenWeeksAgo = subDays(today, 42);
    const weeks: Record<string, number> = {};

    // Group by week
    entries.forEach(e => {
      const date = new Date(e.createdAt);
      if (date < sevenWeeksAgo) return;

      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = format(weekStart, 'MM/dd');

      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    });

    // Get last 7 weeks
    const weekKeys = Object.keys(weeks).sort().slice(-7);
    return weekKeys.map(week => ({
      week,
      count: weeks[week] || 0,
    }));
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>まだ記録がありません。トレーニングを始めましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Daily Count Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">過去30日間の記録数</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#71717a" />
              <YAxis tick={{ fontSize: 12 }} stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  borderColor: '#27272a',
                  color: '#fafafa',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#fafafa' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">週間トレンド（過去7週間）</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#71717a" />
              <YAxis tick={{ fontSize: 12 }} stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  borderColor: '#27272a',
                  color: '#fafafa',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#fafafa' }}
              />
              <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">カテゴリー別分布（件数）</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#e4e4e7" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#71717a" />
                <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 11 }} stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#27272a',
                    color: '#fafafa',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#fafafa' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">カテゴリー別割合</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#27272a',
                    color: '#fafafa',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#fafafa' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
          <div className="text-2xl font-bold">{entries.length}</div>
          <div className="text-sm text-muted-foreground">総記録数</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
          <div className="text-2xl font-bold">
            {dailyData.reduce((sum, day) => sum + day.count, 0)}
          </div>
          <div className="text-sm text-muted-foreground">過去30日</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
          <div className="text-2xl font-bold">
            {weeklyData.reduce((sum, week) => sum + week.count, 0)}
          </div>
          <div className="text-sm text-muted-foreground">過去7週間</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
          <div className="text-2xl font-bold">{categoryData.length}</div>
          <div className="text-sm text-muted-foreground">カテゴリー数</div>
        </div>
      </div>
    </div>
  );
}
