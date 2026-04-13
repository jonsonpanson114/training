'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Lightbulb, Sparkles, Loader2, BookOpen, Star, Trophy, Award, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FloatingParticles } from '@/components/luxury/FloatingParticles';
import { ScoreRing } from '@/components/luxury/ScoreRing';
import { CompletionEffect } from '@/components/luxury/CompletionEffect';
import { calculateExpGain } from '@/lib/gamification';
import { ThinkingBuddy } from '@/components/luxury/ThinkingBuddy';
import { suggestNextStep } from '@/lib/engagement';

interface Entry {
  id: string;
  promptId: string;
  promptTitle: string;
  category: string;
  content: string;
  tags: string[];
  createdAt: string;
}
function FeedbackContent({ entryId }: { entryId: string | null }) {
  const router = useRouter();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [feedback, setFeedback] = useState<{
    score: number;
    feedback: string;
    suggestions: string[];
    followupQuestion?: string;
    exampleAnswer?: string;
  } | null>(null);
  const [expGained, setExpGained] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    async function loadEntry() {
      if (entryId) {
        setIsLoading(true);
        try {
          const userId = localStorage.getItem('verbalize_user_id');
          if (!userId) throw new Error('User ID is missing');
          const response = await fetch(`/api/records?entryId=${entryId}&userId=${userId}`);
          if (!response.ok) throw new Error('Failed to fetch entry');
          const data = await response.json();
          
          const mappedEntry: Entry = {
            id: data.id,
            promptId: data.prompt_id || '',
            promptTitle: data.prompt_title || '言語化トレーニング',
            category: data.category || 'general',
            content: data.content,
            tags: data.tags || [],
            createdAt: data.created_at,
          };
          
          setEntry(mappedEntry);
          generateFeedback(mappedEntry);
        } catch (error) {
          console.error('Failed to load entry:', error);
          // Fallback to localStorage if API fails
          const entries = JSON.parse(localStorage.getItem('verbalize_entries') || '[]');
          const found = entries.find((e: Entry) => e.id === entryId);
          if (found) {
            setEntry(found);
            generateFeedback(found);
          } else {
            setIsLoading(false);
          }
        }
      }
    }
    loadEntry();
  }, [entryId]);

  useEffect(() => {
    if (feedback) {
      setShowCompletion(true);
      const timer = setTimeout(() => {
        setShowCompletion(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const generateFeedback = async (entry: Entry) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: entry.content,
          promptTitle: entry.promptTitle
        }),
      });

      if (!response.ok) throw new Error('Failed to generate feedback');

      const result = await response.json();
      setFeedback(result);
      setExpGained(calculateExpGain(entry.content, result.score));
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      setFeedback({
        score: 75,
        feedback: '素晴らしい回答です！あなたの思考が明確に伝わってきました。',
        suggestions: [
          '具体的な数字や事例をさらに盛り込むと、より説得力が増します',
          '対比構造を使うことで、ポイントがより際立ちます',
          '読み手を意識した表現を意識してみましょう'
        ],
        exampleAnswer: 'お手本となる回答例をここに表示します。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/');
  };

  const handleDeepDive = () => {
    if (feedback?.followupQuestion && entry) {
      const theme = feedback.followupQuestion;
      // Navigate back to the same training type but with a pre-filled theme
      // We'll pass it via localStorage or query param
      localStorage.setItem('verbalize_custom_theme', theme);
      router.push(`/write/${entry.promptId}`);
    }
  };

  const nextStepSuggestion = suggestNextStep({
    score: feedback?.score,
    suggestions: feedback?.suggestions,
    category: entry?.category,
  });

  if (isLoading || !entry) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FloatingParticles />
        <div className="vintage-card p-12 text-center z-10">
          <div className="vintage-icon-container primary mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-background animate-spin" />
          </div>
          <p className="text-xl font-serif font-semibold mb-2">フィードバックを生成中...</p>
          <p className="text-muted-foreground">少々お待ちください</p>
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return <CompletionEffect />;
  }

  return (
    <>
      {/* Header Section with Score */}
      <div className="vintage-card p-8 mb-6 text-center animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-serif font-semibold text-foreground">あなたの成果</h2>
        </div>

        {/* Score Ring */}
        <div className="flex justify-center mb-6 relative">
          <ScoreRing score={feedback?.score || 75} size={240} strokeWidth={14} />
          {expGained > 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in fade-in zoom-in duration-1000 delay-500">
               <span className="text-4xl font-serif font-bold text-accent">{feedback?.score || 75}</span>
               <div className="mt-12 bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-bold border border-accent/30">
                 +{expGained} EXP
               </div>
            </div>
          )}
        </div>

        {/* Score Label */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 ${
                star <= Math.ceil((feedback?.score || 75) / 20)
                  ? 'fill-accent text-accent'
                  : 'text-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-muted-foreground">
          {feedback?.score && feedback.score >= 90 ? '卓越した言語化スキル！' :
           feedback?.score && feedback.score >= 80 ? '素晴らしい表現力！' :
           feedback?.score && feedback.score >= 70 ? '良好な言語化能力です' :
           '成長の余地があります'}
        </p>
      </div>

      {/* Feedback Card */}
      <div className="vintage-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="vintage-icon-container accent shrink-0">
            <Lightbulb className="w-5 h-5 text-background" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-2">フィードバック</h3>
            <p className="text-foreground/80 leading-relaxed">{feedback?.feedback}</p>
          </div>
        </div>
      </div>

      {/* Suggestions Card */}
      {feedback?.suggestions && feedback.suggestions.length > 0 && (
        <div className="vintage-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="vintage-icon-container primary shrink-0">
              <Sparkles className="w-5 h-5 text-background" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-foreground mb-2">成長のためのヒント</h3>
            </div>
          </div>
          <ul className="space-y-4">
            {feedback.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="vintage-icon-container shrink-0">
                  <span className="text-sm font-semibold text-primary">{index + 1}</span>
                </div>
                <p className="text-foreground/80 leading-relaxed pt-1">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Example Answer Card */}
      {feedback?.exampleAnswer && (
        <div className="vintage-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.22s' }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="vintage-icon-container accent shrink-0">
              <BookOpen className="w-5 h-5 text-background" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-foreground mb-2">陣内コーチのお手本</h3>
            </div>
          </div>
          <div className="bg-accent/5 p-4 rounded-xl border border-accent/20">
            <p className="text-foreground/90 font-serif leading-relaxed italic whitespace-pre-wrap">
              「{feedback.exampleAnswer}」
            </p>
          </div>
        </div>
      )}
      
      {/* Follow-up Question Card */}
      {feedback?.followupQuestion && (
        <div className="vintage-card p-6 mb-6 animate-slide-up bg-accent/5 border-accent/20 border-2" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-lg">
              <MessageSquare className="w-5 h-5 text-background" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-accent mb-2">思考の深掘り：AIからの問いかけ</h3>
              <p className="text-foreground leading-relaxed italic text-lg font-medium">
                「{feedback.followupQuestion}」
              </p>
            </div>
          </div>
          <Button 
            onClick={handleDeepDive}
            variant="outline" 
            className="w-full border-accent/50 hover:bg-accent/10 hover:border-accent text-accent font-bold h-12"
          >
            この問いに答えて思考を深める
          </Button>
        </div>
      )}

      <div className="vintage-card p-6 mb-6 animate-slide-up bg-primary/5 border-primary/20 border-2" style={{ animationDelay: '0.28s' }}>
        <div className="flex items-start gap-3">
          <div className="vintage-icon-container primary shrink-0">
            <TrendingUp className="w-5 h-5 text-background" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-2">次の一歩（AI提案）</h3>
            <p className="text-foreground/80 leading-relaxed">{nextStepSuggestion}</p>
          </div>
        </div>
      </div>

      {/* Entry Summary */}
      <div className="vintage-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="vintage-icon-container shrink-0">
            <BookOpen className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif font-semibold text-foreground mb-2">あなたの回答</h3>
            <p className="text-sm text-muted-foreground mb-4">{entry.promptTitle}</p>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap bg-input p-4 rounded-xl">
              {entry.content}
            </p>
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {entry.tags.map((tag) => (
                  <Badge key={tag} className="px-3 py-1 rounded-full bg-muted text-foreground">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Badge */}
      <div className="vintage-card p-6 mb-6 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="vintage-icon-container accent mx-auto mb-4">
          <Award className="w-8 h-8 text-background" />
        </div>
        <p className="font-serif font-semibold text-foreground mb-1">おめでとうございます！</p>
        <p className="text-sm text-muted-foreground">
          トレーニングを完了しました
        </p>
      </div>

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        size="lg"
        className="vintage-button-primary w-full h-14 text-base animate-slide-up"
        style={{ animationDelay: '0.5s' }}
      >
        <TrendingUp className="mr-2 h-5 w-5" />
        次のお題に進む
      </Button>

      <ThinkingBuddy 
        mode="feedback" 
        feedbackScore={feedback?.score} 
        content={entry.content} 
      />
    </>
  );
}

export default function FeedbackPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const totalEntries = mounted ? parseInt(localStorage.getItem('verbalize_total') || '0', 10) : 0;
  const streak = mounted ? parseInt(localStorage.getItem('verbalize_streak') || '0', 10) : 0;

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
              <h1 className="text-2xl font-serif font-semibold text-foreground">フィードバック</h1>
              <p className="text-sm text-muted-foreground">あなたの言語化スキルの分析結果</p>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto w-full">
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="vintage-icon-container primary">
                <Loader2 className="w-8 h-8 text-background animate-spin" />
              </div>
            </div>
          }>
            <FeedbackSearchParamsWrapper />
          </Suspense>
        </main>
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-border bg-card/50 z-10">
        <div className="vintage-card p-6 mb-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">今日の成果</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="vintage-icon-container">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">累計記録</p>
                <p className="font-semibold text-foreground">
                  {mounted ? totalEntries : 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="vintage-icon-container">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">連続記録</p>
                <p className="font-semibold text-foreground">
                  {mounted ? `${streak}日` : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="vintage-card p-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">言語化のヒント</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>毎日続けることで思考が明確になります</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>他人の意見を聞いて視野を広げましょう</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>自分の回答を見返すことで成長を感じられます</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function FeedbackSearchParamsWrapper() {
  const searchParams = useSearchParams();
  const entryId = searchParams.get('entryId');
  return <FeedbackContent entryId={entryId} />;
}
