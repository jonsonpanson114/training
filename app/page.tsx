'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Flame, Target, Brain, Lightbulb, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDailyPrompt } from '@/lib/prompts';
import { Prompt } from '@/types';

export default function HomePage() {
  const [streak, setStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [todayPrompt, setTodayPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    // Load from localStorage (client-side only)
    const savedStreak = localStorage.getItem('verbalize_streak');
    const savedTotal = localStorage.getItem('verbalize_total');
    if (savedStreak) setStreak(parseInt(savedStreak, 10));
    if (savedTotal) setTotalEntries(parseInt(savedTotal, 10));

    // Set today's prompt
    setTodayPrompt(getDailyPrompt());
  }, []);

  const categories = [
    { id: 'basic', name: '基本編', icon: Target, description: '抽象を具体にする', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: 'emotion', name: '思考・感情編', icon: Brain, description: '感情と言語化', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    { id: 'work', name: '仕事・ビジネス編', icon: Calendar, description: '実践的な言語化', color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { id: 'abduction', name: '仮説思考編', icon: Lightbulb, description: 'アブダクション道場', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Verbalize</h1>
          <nav className="flex gap-4">
            <Link href="/history">
              <Button variant="ghost" size="sm">履歴</Button>
            </Link>
            <Link href="/tips">
              <Button variant="ghost" size="sm">Tips</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-3xl font-bold">{streak}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">連続記録日数</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">{totalEntries}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">累計記録数</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span className="text-3xl font-bold">5-10</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">分で完結</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Prompt */}
        {todayPrompt && (
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">今日のお題</CardTitle>
                  <CardDescription>毎日日替わりで出題されます</CardDescription>
                </div>
                <Link href={`/write/${todayPrompt.id}`}>
                  <Button size="lg">
                    スタート
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">{todayPrompt.title}</h3>
              <p className="text-muted-foreground">{todayPrompt.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Training Categories */}
        <h2 className="text-2xl font-bold mb-4">トレーニングカテゴリー</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/write/${category.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Special Trainings */}
        <h2 className="text-2xl font-bold mb-4">高度なトレーニング</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/write/synapse">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Synapse Match</h3>
                <p className="text-sm text-muted-foreground">無関係な2つの言葉から共通点を10個見つける</p>
                <p className="text-xs text-muted-foreground mt-2">2分</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/write/metaphor">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Metaphor Maker</h3>
                <p className="text-sm text-muted-foreground">難しい概念をバカでもわかる例え話で説明</p>
                <p className="text-xs text-muted-foreground mt-2">5分</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/write/fogcatcher">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Fog Catcher</h3>
                <p className="text-sm text-muted-foreground">思考の霧払い：フリーライティング</p>
                <p className="text-xs text-muted-foreground mt-2">3分</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/write/abduction-lens">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Abduction Lens</h3>
                <p className="text-sm text-muted-foreground">決定的瞬間の観察と推論</p>
                <p className="text-xs text-muted-foreground mt-2">7分</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/write/whysos">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Why So</h3>
                <p className="text-sm text-muted-foreground">なぜなぜ分析で根本原因を探る</p>
                <p className="text-xs text-muted-foreground mt-2">5分</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/write/sowhat">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">So What?</h3>
                <p className="text-sm text-muted-foreground">つまり何？で情報を価値に変える</p>
                <p className="text-xs text-muted-foreground mt-2">5分</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Verbalize - 言語化トレーニングアプリ</p>
        </div>
      </footer>
    </div>
  );
}
