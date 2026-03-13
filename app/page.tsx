'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Clock, Lightbulb, User, ArrowRight, Flame, BookOpen, Zap, FileText, Heart, HelpCircle, Sparkles, Leaf, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDailyPrompt } from '@/lib/prompts';
import { Prompt } from '@/types';
import { FloatingParticles } from '@/components/luxury/FloatingParticles';

export default function HomePage() {
  const [streak, setStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [todayPrompt, setTodayPrompt] = useState<Prompt | null>(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userRank, setUserRank] = useState('言語化のアプレンティス');
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    const savedStreak = localStorage.getItem('verbalize_streak');
    const savedTotal = localStorage.getItem('verbalize_total');
    if (savedStreak) setStreak(parseInt(savedStreak, 10));
    if (savedTotal) setTotalEntries(parseInt(savedTotal, 10));

    const level = Math.floor(totalEntries / 10) + 1;
    setUserLevel(level);

    const ranks = [
      '言語化のアプレンティス',
      '言葉の職人',
      '思考の彫刻家',
      '言語の錬金術師',
      '意味の建築家',
      '知性の詩人',
      '真のマスター'
    ];
    setUserRank(ranks[Math.min(level - 1, ranks.length - 1)]);

    setTodayPrompt(getDailyPrompt());

    // Show greeting animation
    setTimeout(() => setShowGreeting(true), 500);
  }, [totalEntries]);

  const trainingCategories = [
    {
      id: 'instant',
      title: '瞬発力トレーニング',
      icon: Zap,
      color: 'bg-amber-100 text-amber-700',
      hover: 'hover:bg-amber-50 hover:border-amber-300 hover:shadow-lg hover:-translate-y-0.5'
    },
    {
      id: 'logic',
      title: 'ロジック構築',
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-700',
      hover: 'hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5'
    },
    {
      id: 'expression',
      title: '表現力向上',
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-700',
      hover: 'hover:bg-purple-50 hover:border-purple-300 hover:shadow-lg hover:-translate-y-0.5'
    },
    {
      id: 'summary',
      title: '要約スキル',
      icon: FileText,
      color: 'bg-green-100 text-green-700',
      hover: 'hover:bg-green-50 hover:border-green-300 hover:shadow-lg hover:-translate-y-0.5'
    },
    {
      id: 'emotion',
      title: '感情分析',
      icon: Heart,
      color: 'bg-rose-100 text-rose-700',
      hover: 'hover:bg-rose-50 hover:border-rose-300 hover:shadow-lg hover:-translate-y-0.5'
    },
    {
      id: 'empathy',
      title: '共感力トレーニング',
      icon: HelpCircle,
      color: 'bg-teal-100 text-teal-700',
      hover: 'hover:bg-teal-50 hover:border-teal-300 hover:shadow-lg hover:-translate-y-0.5'
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
                Zero-Second Training
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                思考の刹那を、言葉に。
              </p>
            </div>

            {/* User Panel */}
            <div className="vintage-card px-5 py-3 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300">
              <div>
                <p className="text-sm text-muted-foreground">GOLIATH_USER</p>
                <p className="font-semibold">LV.{userLevel} · {userRank}</p>
              </div>
              <div className="vintage-icon-container primary relative">
                <User className="w-5 h-5 text-background" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Today's Task */}
        <div className={`vintage-card p-6 lg:p-8 mb-8 relative overflow-hidden ${showGreeting ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="vintage-icon-container accent animate-pulse">
                <Lightbulb className="w-5 h-5 text-background" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Today's Task</p>
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

            <Link href={todayPrompt ? `/write/${todayPrompt.id}` : '/write/basic'}>
              <Button className="vintage-button-primary w-full lg:w-auto min-w-[200px] group">
                トレーニングを開始
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
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

        {/* Training Categories */}
        <div className={`mb-8 ${showGreeting ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <h3 className="text-lg font-serif font-semibold mb-4 text-muted-foreground">
            トレーニングカテゴリー
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {trainingCategories.map((category, index) => (
              <Link key={category.id} href={`/write/${category.id}`}>
                <button className={`
                  w-full vintage-card p-4 flex items-center gap-3 transition-all duration-300
                  ${category.hover}
                `} style={{ animationDelay: `${0.4 + index * 0.05}s` }}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color} transition-transform duration-300 hover:scale-110`}>
                    <category.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm">{category.title}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className={`vintage-card p-6 text-center animate-slide-up ${showGreeting ? '' : 'opacity-0'}`} style={{ animationDelay: '0.7s' }}>
          <Sparkles className="w-6 h-6 text-accent mx-auto mb-4 animate-pulse" />
          <p className="font-serif text-lg text-foreground italic">
            "言葉は思考を形にする魔法。あなたの中に眠る魔法使いを、今目覚めさせましょう。"
          </p>
          <p className="text-sm text-muted-foreground mt-3">— Verbalize</p>
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
          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">Quick Actions</p>
          <div className="space-y-2">
            <Link href="/write/basic">
              <Button variant="outline" className="w-full justify-start text-sm group">
                <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                基本トレーニング
              </Button>
            </Link>
            <Link href="/write/abduction">
              <Button variant="outline" className="w-full justify-start text-sm group">
                <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                仮説思考
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
    </div>
  );
}
