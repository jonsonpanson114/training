'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Target, Brain, Lightbulb, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDailyPrompt } from '@/lib/prompts';
import { Prompt } from '@/types';

export default function HomePage() {
  const [streak, setStreak] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [todayPrompt, setTodayPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    const savedStreak = localStorage.getItem('verbalize_streak');
    const savedTotal = localStorage.getItem('verbalize_total');
    if (savedStreak) setStreak(parseInt(savedStreak, 10));
    if (savedTotal) setTotalEntries(parseInt(savedTotal, 10));
    setTodayPrompt(getDailyPrompt());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold tracking-tight">Verbalize</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="shadow-lg">
            <CardContent className="p-6 flex items-center justify-center">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <span className="text-4xl font-bold">{streak}</span>
                <span className="text-sm text-muted-foreground">連続記録日数</span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <span className="text-4xl font-bold">{totalEntries}</span>
                <span className="text-sm text-muted-foreground">累計記録数</span>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6 flex items-center justify-center">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <span className="text-4xl font-bold">5-10</span>
                <span className="text-sm text-muted-foreground">分で完結</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Prompt */}
        {todayPrompt && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="h-6 w-6 text-amber-500" />
                <CardTitle className="text-xl">今日のお題</CardTitle>
                <CardDescription>毎日日替わりで出題されます</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">{todayPrompt.title}</p>
              <p className="text-muted-foreground">{todayPrompt.description}</p>
              <Link href={`/write/${todayPrompt.id}`}>
                <Button className="w-full">
                  スタート
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Training Categories */}
        <h2 className="text-2xl font-bold mb-6 text-center tracking-wide">トレーニングカテゴリー</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/write/basic">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 mb-4 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-600">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-center text-white">基本編</h3>
                <p className="text-center text-white/90">抽象を具体にする</p>
                <div className="mt-4 flex justify-center">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/write/emotion">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 mb-4 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-600">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-center text-white">思考・感情編</h3>
                <p className="text-center text-white/90">感情と言語化</p>
                <div className="mt-4 flex justify-center">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/write/work">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 mb-4 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-600">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-center text-white">仕事・ビジネス編</h3>
                <p className="text-center text-white/90">実践的な言語化</p>
                <div className="mt-4 flex justify-center">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/write/abduction">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 mb-4 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-600">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-center text-white">仮説思考編</h3>
                <p className="text-center text-white/90">アブダクション道場</p>
                <div className="mt-4 flex justify-center">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Start */}
        <div className="mt-8">
          <Card className="shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-lg mb-4">クイックスタート</p>
              <Link href={todayPrompt ? `/write/${todayPrompt.id}` : `/write/basic`}>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-700 w-full max-w-md">
                  {todayPrompt ? '今日のお題に挑戦' : 'トレーニングを始める'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="border-t mt-12 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Verbalize - 言語化トレーニングアプリ</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
