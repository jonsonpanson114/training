'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Award, Flame, BookOpen, Target, Trophy, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FloatingParticles } from '@/components/luxury/FloatingParticles';
import { ScoreRing } from '@/components/luxury/ScoreRing';
import { InsightChart } from '@/components/luxury/InsightChart';
import { ChartLine, PieChart as PieIcon, BarChart3, Loader2 } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  target: number;
}

const achievements: Achievement[] = [
  {
    id: 'first-entry',
    title: '第一歩',
    description: '最初の記録を作成する',
    icon: BookOpen,
    unlocked: false,
    progress: 0,
    target: 1
  },
  {
    id: 'ten-entries',
    title: '言葉の初心者',
    description: '10回の記録を達成する',
    icon: Target,
    unlocked: false,
    progress: 0,
    target: 10
  },
  {
    id: 'streak-3',
    title: '3日連続',
    description: '3日連続でトレーニングする',
    icon: Flame,
    unlocked: false,
    progress: 0,
    target: 3
  },
  {
    id: 'streak-7',
    title: '1週間連続',
    description: '7日連続でトレーニングする',
    icon: Award,
    unlocked: false,
    progress: 0,
    target: 7
  },
  {
    id: 'streak-30',
    title: '1ヶ月連続',
    description: '30日連続でトレーニングする',
    icon: Trophy,
    unlocked: false,
    progress: 0,
    target: 30
  },
  {
    id: 'hundred-entries',
    title: '言葉の達人',
    description: '100回の記録を達成する',
    icon: Trophy,
    unlocked: false,
    progress: 0,
    target: 100
  }
];

const ranks = [
  { level: 1, title: '思考の迷い子', color: '#8B7355' },
  { level: 5, title: '言葉を拾いし者', color: '#A89175' },
  { level: 10, title: '概念のストライカー', color: '#C9A96E' },
  { level: 20, title: '論理の解体屋', color: '#D4AF37' },
  { level: 50, title: '抽象のギャンブラー', color: '#E8C547' },
  { level: 100, title: '知性のデストロイヤー', color: '#FFD700' },
  { level: 200, title: '沈黙が似合う男', color: '#FFEA00' }
];

export default function ProfilePage() {
  const [userName, setUserName] = useState('GOLIATH_USER');
  const [totalEntries, setTotalEntries] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [userRank, setUserRank] = useState('思考の迷い子');
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(achievements);
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<{
    trend: any[];
    categories: any[];
    activity: any[];
  }>({ trend: [], categories: [], activity: [] });
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const savedName = localStorage.getItem('verbalize_username');
    if (savedName) setUserName(savedName);

    const savedId = localStorage.getItem('verbalize_user_id') || '';
    setUserId(savedId);

    const savedTotal = parseInt(localStorage.getItem('verbalize_total') || '0', 10);
    const savedStreak = parseInt(localStorage.getItem('verbalize_streak') || '0', 10);

    setTotalEntries(savedTotal);
    setStreak(savedStreak);

    const level = Math.floor(savedTotal / 10) + 1;
    setUserLevel(level);

    const currentRank = [...ranks].reverse().find(r => level >= r.level) || ranks[0];
    setUserRank(currentRank.title);

    // Update achievements
    const updatedAchievements = achievements.map(ach => {
      let progress = 0;
      if (ach.id === 'first-entry') progress = savedTotal >= 1 ? 1 : 0;
      else if (ach.id === 'ten-entries') progress = Math.min(savedTotal, 10);
      else if (ach.id === 'hundred-entries') progress = Math.min(savedTotal, 100);
      else if (ach.id === 'streak-3') progress = Math.min(savedStreak, 3);
      else if (ach.id === 'streak-7') progress = Math.min(savedStreak, 7);
      else if (ach.id === 'streak-30') progress = Math.min(savedStreak, 30);

      return {
        ...ach,
        progress,
        unlocked: progress >= ach.target
      };
    });

    setUserAchievements(updatedAchievements);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userId) {
      loadChartData();
    }
  }, [userId]);

  const loadChartData = async () => {
    setIsLoadingCharts(true);
    try {
      const response = await fetch(`/api/records?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch records');
      const data = await response.json();

      if (data && data.length > 0) {
        // Process Trend Data (Last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const trend = last7Days.map(date => {
          const count = data.filter((e: any) => e.created_at.startsWith(date)).length;
          return { name: date.slice(5), count };
        });

        // Process Categories Data
        const categoryCounts: Record<string, number> = {};
        const categoryNames: Record<string, string> = {
          whysos: 'Why So', sowhat: 'So What?', '5w1h': '5W1H',
          prep: 'PREP', fogcatcher: 'FogCatcher', abduction: 'Abduction',
          synapse: 'Synapse', metaphor: 'Metaphor'
        };

        data.forEach((e: any) => {
          const name = categoryNames[e.category] || e.category;
          categoryCounts[name] = (categoryCounts[name] || 0) + 1;
        });

        const categories = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

        // Process Weekly Activity
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const activity = days.map((name, i) => {
          const count = data.filter((e: any) => new Date(e.created_at).getDay() === i).length;
          return { name, count };
        });

        setChartData({ trend, categories, activity });
      }
    } catch (err) {
      console.error('Chart data error:', err);
    } finally {
      setIsLoadingCharts(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setUserName(newName);
    localStorage.setItem('verbalize_username', newName);
  };

  const currentRankIndex = ranks.findIndex(r => r.title === userRank);
  const safeRankIndex = currentRankIndex === -1 ? 0 : currentRankIndex;
  
  const nextRank = ranks[safeRankIndex + 1];
  const levelProgress = nextRank 
    ? ((totalEntries - ranks[safeRankIndex].level) / (nextRank.level - ranks[safeRankIndex].level)) * 100
    : 100;

  const unlockedCount = userAchievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <FloatingParticles />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 lg:p-8 overflow-auto z-10">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-foreground">プロフィール</h1>
              <p className="text-sm text-muted-foreground">あなたの成長の軌跡</p>
            </div>
          </div>
        </header>

        {/* Profile Card */}
        <div className={`vintage-card p-8 mb-6 relative overflow-hidden ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <User className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-full flex items-center justify-center border-4 border-background">
                <span className="text-sm font-bold text-background">{userLevel}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <Input
                value={userName}
                onChange={handleNameChange}
                className="text-2xl font-serif font-bold text-foreground bg-transparent border-0 p-0 focus:ring-0 mb-2"
              />
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
                <div className="vintage-icon-container primary">
                  <Award className="w-5 h-5 text-background" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">現在のランク</p>
                  <p className="font-serif font-semibold text-foreground text-lg">{userRank}</p>
                </div>
              </div>

              {/* Progress to next rank */}
              {nextRank && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">次のランク: {nextRank.title}</span>
                    <span className="text-primary">{totalEntries} / {nextRank.level}</span>
                  </div>
                  <div className="h-2 bg-input rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${Math.min(levelProgress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          <div className="vintage-card p-5 text-center">
            <div className="vintage-icon-container mx-auto mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-serif font-semibold text-foreground">{totalEntries}</p>
            <p className="text-sm text-muted-foreground">総記録数</p>
          </div>

          <div className="vintage-card p-5 text-center">
            <div className="vintage-icon-container mx-auto mb-3">
              <Flame className="w-5 h-5 text-warning" />
            </div>
            <p className="text-3xl font-serif font-semibold text-foreground">{streak}</p>
            <p className="text-sm text-muted-foreground">連続記録</p>
          </div>

          <div className="vintage-card p-5 text-center">
            <div className="vintage-icon-container mx-auto mb-3">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-serif font-semibold text-foreground">{unlockedCount}</p>
            <p className="text-sm text-muted-foreground">実績解除</p>
          </div>

          <div className="vintage-card p-5 text-center">
            <div className="vintage-icon-container mx-auto mb-3">
              <Target className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-serif font-semibold text-foreground">{userLevel}</p>
            <p className="text-sm text-muted-foreground">レベル</p>
          </div>
        </div>
        {/* Insights Section */}
        <div className={`grid md:grid-cols-2 gap-6 mb-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.15s' }}>
          <div className="vintage-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="vintage-icon-container">
                <ChartLine className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-foreground">トレーニング頻度</h3>
            </div>
            {isLoadingCharts ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              </div>
            ) : (
              <InsightChart data={chartData.trend} type="line" dataKey="count" />
            )}
          </div>

          <div className="vintage-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="vintage-icon-container">
                <PieIcon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-serif font-semibold text-foreground">カテゴリー分布</h3>
            </div>
            {isLoadingCharts ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              </div>
            ) : (
              <InsightChart data={chartData.categories} type="pie" dataKey="value" nameKey="name" />
            )}
          </div>

          <div className="vintage-card p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="vintage-icon-container">
                <BarChart3 className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-serif font-semibold text-foreground">曜日別アクティビティ</h3>
            </div>
            {isLoadingCharts ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              </div>
            ) : (
              <InsightChart data={chartData.activity} type="bar" dataKey="count" />
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className={`vintage-card p-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="vintage-icon-container accent">
              <Trophy className="w-5 h-5 text-background" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-foreground">実績</h3>
              <p className="text-xs text-muted-foreground">{unlockedCount} / {achievements.length} 解除</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAchievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  achievement.unlocked
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-muted/50 border-border opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`vintage-icon-container ${achievement.unlocked ? 'primary' : ''}`}>
                    <achievement.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  </div>
                </div>
                {!achievement.unlocked && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">進捗</span>
                      <span className="text-primary">{achievement.progress} / {achievement.target}</span>
                    </div>
                    <div className="h-1.5 bg-input rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rank Progress */}
        <div className={`vintage-card p-6 mt-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <h3 className="font-serif font-semibold text-foreground mb-4">ランク一覧</h3>
          <div className="space-y-2">
            {ranks.map((rank, index) => (
              <div
                key={rank.title}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  rank.title === userRank
                    ? 'bg-primary/20 border border-primary/30'
                    : levelProgress >= 100 && index > currentRankIndex
                    ? 'bg-muted/30'
                    : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  rank.title === userRank ? 'bg-primary text-background' : 'bg-input text-muted-foreground'
                }`}>
                  {rank.level}
                </div>
                <span className={`font-medium ${rank.title === userRank ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {rank.title}
                </span>
                {rank.title === userRank && (
                  <span className="ml-auto text-xs bg-primary text-background px-2 py-0.5 rounded-full">
                    現在
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-border bg-card/50 z-10">
        <div className="vintage-card p-6 mb-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">設定</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm">
              <Settings className="w-4 h-4 mr-2" />
              アプリ設定
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm text-danger hover:bg-danger/10">
              <LogOut className="w-4 h-4 mr-2" />
              データをリセット
            </Button>
          </div>
        </div>

        <div className="vintage-card p-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">次の目標</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>次のランク: {nextRank?.title || 'マスター'}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>連続記録: {streak}日目</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>未解除の実績: {achievements.length - unlockedCount}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
