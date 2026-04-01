'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Clock, Lightbulb, User, ArrowRight, Flame, BookOpen, Zap, FileText, Heart, HelpCircle, Sparkles, Leaf, CheckCircle, Brain, Search, Target, List, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDailyPrompt } from '@/lib/prompts';
import { Prompt } from '@/types';
import { FloatingParticles } from '@/components/luxury/FloatingParticles';

import { calculateLevel, getRankName } from '@/lib/gamification';
import { ThinkingBuddy } from '@/components/luxury/ThinkingBuddy';
import { ActivityCalendar } from '@/components/luxury/ActivityCalendar';
import {
  getAvailableFreeze,
  getTodayAndYesterdayComparison,
  getTodayKey,
  getTodayMiniPrompt,
  type DailyBadge,
  type EntryLike,
} from '@/lib/engagement';
import { loadReminderSettings, scheduleSessionReminders, sendMissedReminderOnOpen } from '@/lib/reminders';

export default function HomePage() {
  const [streak] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('verbalize_streak') || '0', 10);
  });
  const [totalEntries] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('verbalize_total') || '0', 10);
  });
  const [totalExp] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const savedTotal = parseInt(localStorage.getItem('verbalize_total') || '0', 10);
    const savedExp = localStorage.getItem('verbalize_exp');
    return savedExp ? parseInt(savedExp, 10) : savedTotal * 30;
  });
  const [todayPrompt] = useState<Prompt | null>(() => getDailyPrompt());
  const userLevel = calculateLevel(totalExp);
  const userRank = getRankName(userLevel);
  const [showGreeting, setShowGreeting] = useState(false);
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);
  const [todayMiniPrompt] = useState(() => getTodayMiniPrompt());
  const [todayDone] = useState(() => {
    if (typeof window === 'undefined') return false;
    const entries = JSON.parse(localStorage.getItem('verbalize_entries') || '[]') as EntryLike[];
    const todayKey = getTodayKey();
    return entries.some((e) => typeof e.createdAt === 'string' && e.createdAt.startsWith(todayKey));
  });
  const [freezeCount] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return getAvailableFreeze();
  });
  const [todayBadge] = useState<DailyBadge | null>(() => {
    if (typeof window === 'undefined') return null;
    const todayKey = getTodayKey();
    const badgeRaw = localStorage.getItem(`verbalize_badge_${todayKey}`);
    if (!badgeRaw) return null;
    try {
      return JSON.parse(badgeRaw) as DailyBadge;
    } catch {
      return null;
    }
  });
  const [compare] = useState(() => {
    if (typeof window === 'undefined') {
      return { charDelta: 0, sentenceDelta: 0, specificityDelta: 0 };
    }
    const entries = JSON.parse(localStorage.getItem('verbalize_entries') || '[]') as EntryLike[];
    const snapshot = getTodayAndYesterdayComparison(entries);
    return {
      charDelta: snapshot.todayChars - snapshot.yesterdayChars,
      sentenceDelta: snapshot.todaySentences - snapshot.yesterdaySentences,
      specificityDelta: snapshot.todaySpecificity - snapshot.yesterdaySpecificity,
    };
  });

  useEffect(() => {
    const fetchActivity = async () => {
      const userId = localStorage.getItem('verbalize_user_id');
      if (userId) {
        try {
          const res = await fetch(`/api/records/summary?userId=${userId}`);
          const data = await res.json();
          if (data.summary) setActivityData(data.summary);
        } catch (err) {
          console.error('Failed to fetch activity:', err);
        }
      }
    };
    fetchActivity();
    const settings = loadReminderSettings();
    sendMissedReminderOnOpen(settings, todayDone);
    const cleanup = scheduleSessionReminders(settings, todayDone);
    return cleanup;
  }, [todayDone]);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const trainingCategories = [
    // Basic Training
    {
      id: 'basic',
      title: '基本トレーニング',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-700',
      hover: 'hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: '30問'
    },
    // AI-Generated Training (The Important Ones!)
    {
      id: 'synapse',
      title: 'Synapse Match',
      icon: Infinity,
      color: 'bg-purple-100 text-purple-700',
      hover: 'hover:bg-purple-50 hover:border-purple-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: 'AI生成',
      highlighted: true
    },
    {
      id: 'metaphor',
      title: 'Metaphor Maker',
      icon: Sparkles,
      color: 'bg-pink-100 text-pink-700',
      hover: 'hover:bg-pink-50 hover:border-pink-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: 'AI生成',
      highlighted: true
    },
    {
      id: 'abduction',
      title: 'アブダクション道場',
      icon: Search,
      color: 'bg-indigo-100 text-indigo-700',
      hover: 'hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: '3つの仮説 / 未知への考察',
    },
    {
      id: 'abduction-lens',
      title: 'Abduction Lens',
      icon: Search,
      color: 'bg-indigo-100 text-indigo-700',
      hover: 'hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: '観察・仮説・根拠 / 視覚の深掘り',
      highlighted: true
    },
    // Thinking Training
    {
      id: 'whysos',
      title: 'Why So',
      icon: Lightbulb,
      color: 'bg-orange-100 text-orange-700',
      hover: 'hover:bg-orange-50 hover:border-orange-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: '5回'
    },
    {
      id: 'sowhat',
      title: 'So What?',
      icon: Target,
      color: 'bg-red-100 text-red-700',
      hover: 'hover:bg-red-50 hover:border-red-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: '思考整理'
    },
    {
      id: '5w1h',
      title: '5W1H',
      icon: List,
      color: 'bg-teal-100 text-teal-700',
      hover: 'hover:bg-teal-50 hover:border-teal-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: '6要素'
    },
    {
      id: 'prep',
      title: 'PREP法',
      icon: Brain,
      color: 'bg-cyan-100 text-cyan-700',
      hover: 'hover:bg-cyan-50 hover:border-cyan-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: '伝え方'
    },
    // Other Categories
    {
      id: 'emotion',
      title: '感情分析',
      icon: Heart,
      color: 'bg-rose-100 text-rose-700',
      hover: 'hover:bg-rose-50 hover:border-rose-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: '10問'
    },
    {
      id: 'work',
      title: 'ビジネストレーニング',
      icon: FileText,
      color: 'bg-green-100 text-green-700',
      hover: 'hover:bg-green-50 hover:border-green-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: '10問'
    },
    {
      id: 'fogcatcher',
      title: 'Fog Catcher',
      icon: HelpCircle,
      color: 'bg-violet-100 text-violet-700',
      hover: 'hover:bg-violet-50 hover:border-violet-300 hover:shadow-lg hover:-translate-y-0.5',
      badge: 'フリーライト'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row relative">
      <FloatingParticles />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 lg:p-8 overflow-auto z-10">
        {/* Header */}
        <header className={`mb-8 ${showGreeting ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="flex items-start justify-between">
            <div>
              {/* Decorative Header Element */}
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-24 h-6 animate-pulse" viewBox="0 0 100 24" fill="none">
                  <path d="M10 12 Q 25 4, 40 12 T 70 12 T 90 12" stroke="#8B7355" strokeWidth="1.5" fill="none"/>
                </svg>
                <Leaf className="w-4 h-4 text-primary animate-bounce" style={{ animationDelay: '0s' }} />
                <Leaf className="w-3 h-3 text-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                <Leaf className="w-4 h-4 text-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
              <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground tracking-tight">
                零秒言語化トレーニング
              </h1>
              <p className="text-accent font-bold mt-1 tracking-widest text-xs uppercase">Powered by Abduction Lens</p>
              <p className="text-muted-foreground mt-2 text-lg">
                決定的な一瞬を捉え、仮説を紡ぎ出せ。
              </p>
            </div>

            {/* User Panel */}
            <div className="vintage-card px-5 py-3 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300">
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">GOLIATH_USER</p>
                  <p className="text-[10px] font-bold text-accent">LV.{userLevel}</p>
                </div>
                <p className="font-serif font-semibold text-sm mb-2">{userRank}</p>
                {/* EXP Bar */}
                <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-1000" 
                    style={{ width: `${(totalExp % 100)}%` }}
                  />
                </div>
              </div>
              <div className="vintage-icon-container primary relative">
                <User className="w-5 h-5 text-background" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Quests Section */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 ${showGreeting ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.05s' }}>
          <div className="lg:col-span-2">
            {/* Today's Task (Existing) */}
            <div className="vintage-card p-6 lg:p-8 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="vintage-icon-container accent animate-pulse">
                    <Lightbulb className="w-5 h-5 text-background" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Today&apos;s Task</p>
                    <h2 className="text-xl font-serif font-semibold">
                      {todayPrompt?.title || 'Fog Catcher'}
                    </h2>
                  </div>
                </div>
                <div className="bg-input rounded-xl p-5 mb-6 border border-border/50 hover:border-primary/50 transition-colors duration-300">
                  <p className="text-sm text-muted-foreground mb-2">お題：</p>
                  <p className="text-lg leading-relaxed">
                    {todayPrompt?.description || '人生における「無駄」の定義を言語化せよ。'}
                  </p>
                </div>
                <div className="bg-accent/5 rounded-xl p-4 mb-6 border border-accent/20">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">3分デイリー</p>
                    {todayDone ? (
                      <span className="text-[10px] font-bold text-success">完了済み</span>
                    ) : (
                      <span className="text-[10px] font-bold text-accent">未達成</span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{todayMiniPrompt}</p>
                  <Link href="/write/basic?mode=quick&daily=1">
                    <Button variant="outline" className="mt-3 w-full lg:w-auto border-accent/40">
                      今日の1問を3分でやる
                    </Button>
                  </Link>
                </div>
                <Link href={todayPrompt ? `/write/${todayPrompt.id}` : '/write/basic'}>
                  <Button className="vintage-button-primary w-full lg:w-auto min-w-[200px] group">
                    トレーニングを開始
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

            {/* Daily Quests */}
            <div className="vintage-card p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-serif font-semibold">Daily Quests</h3>
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${totalEntries > 0 ? 'bg-success border-success' : 'border-muted-foreground'}`}>
                    {totalEntries > 0 && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm flex-1">1回トレーニング完了</span>
                  <span className="text-[10px] font-bold text-accent">+20 EXP</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${freezeCount > 0 ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                    {freezeCount > 0 && <Sparkles className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm flex-1">ストリークお守り（週1）</span>
                  <span className="text-[10px] font-bold text-accent">{freezeCount} 回</span>
                </div>
                {todayBadge && (
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/30">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Today Badge</p>
                    <p className="text-sm font-semibold text-foreground">{todayBadge.title}</p>
                    <p className="text-xs text-muted-foreground">{todayBadge.description}</p>
                  </div>
                )}
                {/* Calendar Integrated Here */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <ActivityCalendar data={activityData} />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 text-center italic">クエスト達成で追加ボーナス獲得</p>
            </div>
          </div>

        {/* Quick Stats */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ${showGreeting ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="vintage-card p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="vintage-icon-container">
                <Flame className="w-5 h-5 text-warning animate-pulse" />
              </div>
              <span className="text-sm text-muted-foreground">連続記録</span>
            </div>
            <p className="text-3xl font-serif font-semibold">{streak}<span className="text-base ml-1">日</span></p>
          </div>

          <div className="vintage-card p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="vintage-icon-container">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">累計記録</span>
            </div>
            <p className="text-3xl font-serif font-semibold">{totalEntries}</p>
          </div>

          <div className="vintage-card p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="vintage-icon-container">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <span className="text-sm text-muted-foreground">レベル</span>
            </div>
            <p className="text-3xl font-serif font-semibold">{userLevel}</p>
          </div>

          <div className="vintage-card p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="vintage-icon-container">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">所要時間</span>
            </div>
            <p className="text-3xl font-serif font-semibold">5-10<span className="text-base ml-1">分</span></p>
          </div>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 ${showGreeting ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.25s' }}>
          <div className="vintage-card p-4">
            <p className="text-xs text-muted-foreground mb-1">昨日比 文字数</p>
            <p className="text-2xl font-serif font-semibold">{compare.charDelta >= 0 ? '+' : ''}{compare.charDelta}</p>
          </div>
          <div className="vintage-card p-4">
            <p className="text-xs text-muted-foreground mb-1">昨日比 文数</p>
            <p className="text-2xl font-serif font-semibold">{compare.sentenceDelta >= 0 ? '+' : ''}{compare.sentenceDelta}</p>
          </div>
          <div className="vintage-card p-4">
            <p className="text-xs text-muted-foreground mb-1">具体性スコア差</p>
            <p className="text-2xl font-serif font-semibold">{compare.specificityDelta >= 0 ? '+' : ''}{compare.specificityDelta}</p>
          </div>
        </div>

        {/* Training Categories */}
        <div className={`mb-8 ${showGreeting ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-serif font-semibold text-muted-foreground">
              トレーニングカテゴリー
            </h3>
            {/* AI Generated Badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">
              <Sparkles className="w-3 h-3" />
              <span>AI生成</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trainingCategories.map((category, index) => (
              <Link key={category.id} href={`/write/${category.id}`}>
                <button className={`
                  w-full vintage-card p-4 flex items-center gap-3 transition-all duration-300 relative
                  ${category.hover}
                  ${category.highlighted ? 'border-accent border-2 bg-accent/5' : ''}
                `} style={{ animationDelay: `${0.4 + index * 0.05}s` }}>
                  {category.highlighted && (
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.color} transition-transform duration-300 hover:scale-110 shadow-sm`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-sm block">{category.title}</span>
                    {category.badge && (
                      <span className="text-xs text-muted-foreground block mt-0.5">{category.badge}</span>
                    )}
                  </div>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className={`vintage-card p-6 text-center animate-slide-up ${showGreeting ? '' : 'opacity-0'}`} style={{ animationDelay: '0.7s' }}>
          <Sparkles className="w-6 h-6 text-accent mx-auto mb-4 animate-pulse" />
          <p className="font-serif text-lg text-foreground italic">
            &quot;言葉は思考を捉えるレンズ。見慣れた景色から、未知の真実を透過させ、焼き付けろ。&quot;
          </p>
          <p className="text-sm text-muted-foreground mt-3">— Abduction Lens</p>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-border bg-card/50 z-10">
        <nav className="space-y-2">
          <Link href="/">
            <button className="vintage-sidebar-item active w-full">
              <Home className="w-5 h-5" />
              <span className="font-medium">HOME</span>
            </button>
          </Link>

          <Link href="/history">
            <button className="vintage-sidebar-item w-full">
              <Clock className="w-5 h-5" />
              <span className="font-medium">HISTORY</span>
            </button>
          </Link>

          <Link href="/tips">
            <button className="vintage-sidebar-item w-full">
              <Lightbulb className="w-5 h-5" />
              <span className="font-medium">TIPS</span>
            </button>
          </Link>

          <Link href="/profile">
            <button className="vintage-sidebar-item w-full">
              <User className="w-5 h-5" />
              <span className="font-medium">PROFILE</span>
            </button>
          </Link>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Quick Actions</p>
            <Sparkles className="w-3 h-3 text-accent" />
          </div>
          <div className="space-y-2">
            {/* AI Generated - Highlighted */}
            <Link href="/write/abduction">
              <Button variant="outline" className="w-full justify-start text-sm group border-accent/50 bg-accent/5">
                <Sparkles className="w-4 h-4 mr-2 text-accent" />
                アブダクション道場
              </Button>
            </Link>
            <Link href="/write/basic?mode=quick">
              <Button variant="outline" className="w-full justify-start text-sm group">
                <Zap className="w-4 h-4 mr-2" />
                3分モード
              </Button>
            </Link>
            <Link href="/write/basic?mode=deep">
              <Button variant="outline" className="w-full justify-start text-sm group">
                <Brain className="w-4 h-4 mr-2" />
                深掘りモード
              </Button>
            </Link>
            <Link href="/write/emotion?mode=reflect">
              <Button variant="outline" className="w-full justify-start text-sm group">
                <Heart className="w-4 h-4 mr-2" />
                感情整理モード
              </Button>
            </Link>
            <Link href="/write/synapse">
              <Button variant="outline" className="w-full justify-start text-sm group border-accent/50 bg-accent/5">
                <Sparkles className="w-4 h-4 mr-2 text-accent" />
                Synapse Match
              </Button>
            </Link>
            <Link href="/write/metaphor">
              <Button variant="outline" className="w-full justify-start text-sm group border-accent/50 bg-accent/5">
                <Sparkles className="w-4 h-4 mr-2 text-accent" />
                Metaphor Maker
              </Button>
            </Link>
            {/* Other */}
            <Link href="/write/basic">
              <Button variant="outline" className="w-full justify-start text-sm group">
                <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                基本トレーニング
              </Button>
            </Link>
            <Link href="/write/emotion">
              <Button variant="outline" className="w-full justify-start text-sm group">
                <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                感情分析
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      <ThinkingBuddy mode="home" userRank={userRank} />
    </div>
  );
}
