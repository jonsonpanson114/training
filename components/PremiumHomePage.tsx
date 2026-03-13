'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Target, Brain, Lightbulb, BookOpen, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDailyPrompt } from '@/lib/prompts';
import { Prompt } from '@/types';

export default function PremiumHomePage() {
  const [streak, setStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [todayPrompt, setTodayPrompt] = useState<Prompt | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedStreak = localStorage.getItem('verbalize_streak');
    const savedTotal = localStorage.getItem('verbalize_total');
    if (savedStreak) setStreak(parseInt(savedStreak, 10));
    if (savedTotal) setTotalEntries(parseInt(savedTotal, 10));
    setTodayPrompt(getDailyPrompt());
    setIsLoaded(true);
  }, []);

  const categories = [
    {
      id: 'basic',
      name: '基本編',
      icon: Target,
      description: '抽象を具体にする',
      color: 'from-blue-400 to-blue-600',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: 'emotion',
      name: '思考・感情編',
      icon: Brain,
      description: '感情と言語化',
      color: 'from-purple-400 to-purple-600',
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      id: 'work',
      name: '仕事・ビジネス編',
      icon: BookOpen,
      description: '実践的な言語化',
      color: 'from-green-400 to-green-600',
      gradient: 'from-green-400 to-green-600'
    },
    {
      id: 'abduction',
      name: '仮説思考編',
      icon: Lightbulb,
      description: 'アブダクション道場',
      color: 'from-amber-400 to-amber-600',
      gradient: 'from-amber-400 to-amber-600'
    },
  ];

  const advancedTrainings = [
    {
      id: 'synapse',
      title: 'Synapse Match',
      description: '無関係な2つの言葉から共通点を10個見つける',
      timeLimit: '2分',
      icon: 'Sparkles'
    },
    {
      id: 'metaphor',
      title: 'Metaphor Maker',
      description: '難しい概念をバカでもわかる例え話で説明',
      timeLimit: '5分',
      icon: 'Lightbulb'
    },
    {
      id: 'fogcatcher',
      title: 'Fog Catcher',
      description: '思考の霧払い：フリーライティング',
      timeLimit: '3分',
      icon: 'Clock'
    },
    {
      id: 'abduction-lens',
      title: 'Abduction Lens',
      description: '決定的瞬間の観察と推論',
      timeLimit: '7分',
      icon: 'CheckCircle'
    },
    {
      id: 'whysos',
      title: 'Why So',
      description: 'なぜなぜ分析で根本原因を探る',
      timeLimit: '5分',
      icon: 'TrendingUp'
    },
    {
      id: 'sowhat',
      title: 'So What?',
      description: 'つまり何？で情報を価値に変える',
      timeLimit: '5分',
      icon: 'BookOpen'
    },
  ];

  return (
    <div className="min-h-screen textured-surface">
      {/* Premium Header */}
      <div className="elegant-header">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <Flame className="h-8 w-8 text-orange-500 premium-icon" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight gold-text">
                  Verbalize
                </h1>
                <p className="text-sm text-muted-foreground/80">
                  思考を言葉に変える力
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/history">
                <Button variant="ghost" size="sm" className="text-foreground/70">
                  履歴
                </Button>
              </Link>
              <Link href="/tips">
                <Button variant="ghost" size="sm" className="text-foreground/70">
                  ガイド
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Section with Elegant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Streak Card */}
          <div className="premium-card">
            <div className="p-8 relative">
              <div className="premium-icon mb-6">
                <Flame className="h-12 w-12 text-gold-dark" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-muted-foreground">{streak}</h3>
                <p className="text-sm text-muted-foreground/60">連続記録日数</p>
                <div className="mt-4 h-1 bg-gold/20 rounded-full max-w-xs mx-auto" />
              </div>
            </div>
          </div>

          {/* Total Entries Card */}
          <div className="premium-card">
            <div className="p-8 relative">
              <div className="premium-icon mb-6">
                <CheckCircle className="h-12 w-12 text-gold-dark" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-muted-foreground">{totalEntries}</h3>
                <p className="text-sm text-muted-foreground/60">累計記録数</p>
                <div className="mt-4 h-1 bg-gold/20 rounded-full max-w-xs mx-auto" />
              </div>
            </div>
          </div>

          {/* Completion Rate Card */}
          <div className="premium-card">
            <div className="p-8 relative">
              <div className="premium-icon mb-6">
                <Trophy className="h-12 w-12 text-gold-dark" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-muted-foreground">
                  {totalEntries > 0 ? Math.round((streak / totalEntries) * 100) : 0}%
                </h3>
                <p className="text-sm text-muted-foreground/60">継続率</p>
                <div className="mt-4 h-1 bg-gold/20 rounded-full max-w-xs mx-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Prompt Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 flex-1 border-gold-dark/30" />
            </div>
            <h2 className="text-2xl font-bold text-center tracking-wide">
              今日のお題
            </h2>
          </div>

          {todayPrompt && (
            <div className="premium-card mb-8">
              <div className="p-8 relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="premium-icon mb-4">
                      <Clock className="h-8 w-8 text-gold-dark" />
                    </div>
                    <span className="text-sm text-muted-foreground/70">
                      {todayPrompt.timeLimit}分
                    </span>
                  </div>
                  <span className="text-xs text-gold-dark/60 px-3 py-1 border border-gold-dark/20 rounded-full">
                    {categories.find(c => c.id === todayPrompt.category)?.name || '基本編'}
                  </span>
                </div>

                <CardTitle className="text-2xl mb-4">{todayPrompt.title}</CardTitle>
                <CardDescription className="text-base">{todayPrompt.description}</CardDescription>
              </div>

              <Link href={`/write/${todayPrompt.id}`}>
                <Button className="premium-btn w-full">
                  スタート
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Training Categories */}
        <h2 className="text-2xl font-bold mb-8 text-center tracking-wide">
          基本トレーニング
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {categories.map((category) => (
            <Link key={category.id} href={`/write/${category.id}`} className="group">
              <div className="premium-card hover:-translate-y-1 transition-all duration-300">
                <div className="p-8">
                  <div className="premium-icon mb-4 group-hover:scale-110 transition-transform">
                    <category.icon className="h-8 w-8 text-gold-dark group-hover:scale-110" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground/70 mb-4">{category.description}</p>
                    <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-white ${category.gradient}`}>
                      トレーニングを開始
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Advanced Trainings */}
        <h2 className="text-2xl font-bold mb-8 text-center tracking-wide">
          高度なトレーニング
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {advancedTrainings.map((training) => (
            <Link key={training.id} href={`/write/${training.id}`} className="group">
              <div className="premium-card hover:-translate-y-1 transition-all duration-300">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-4xl font-bold gold-text`}>{training.icon}</span>
                      <span className="text-sm text-muted-foreground/60 px-3 py-1 border border-gold-dark/30 rounded-full">
                        {training.timeLimit}
                      </span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{training.title}</h3>
                  <p className="text-sm text-muted-foreground/70">{training.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Start Section */}
        <div className="premium-card mb-12">
          <div className="p-8 text-center">
            <div className="premium-icon mb-6 mx-auto">
              <Sparkles className="h-12 w-12 text-gold-dark" />
            </div>
            <h3 className="text-xl font-semibold mb-2">クイックスタート</h3>
            <p className="text-sm text-muted-foreground/70 mb-4">
              思考のトレーニングを今すぐ始めましょう
            </p>
            <Link href={`/write/${todayPrompt?.id || 'basic'}`}>
              <Button className="premium-btn w-full max-w-md mx-auto">
                今日のお題に挑戦
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Inspiration Quote */}
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground/60">
            <div className="divider" />
            <p className="italic">
              「言葉は思考の境界だ」
            </p>
            <div className="divider" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/10 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground/60">
            © 2026 Verbalize - 思考を言葉に変える力
          </p>
        </div>
      </footer>

      <style jsx>{`
        .textured-surface {
          background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface) 100%),
          min-height: 100vh;
        }

        .premium-icon {
          background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
        }

        .gold-text {
          background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          text-shadow: 0 -1px rgba(0,0,0,0.2);
        }

        .text-muted-foreground\\/60 {
          color: rgba(var(--color-foreground), 0.6);
        }

        .text-muted-foreground\\/70 {
          color: rgba(var(--color-foreground), 0.7);
        }

        .divider {
          width: 80px;
          height: 1px;
          background: var(--color-border);
          opacity: 0.3;
        }

        @media (min-width: 768px) {
          .premium-card::before {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
