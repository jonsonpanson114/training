'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, TrendingUp, Lightbulb, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { generateVerbalizationFeedback } from '@/lib/ai';

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
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (entryId) {
      // Load entry from localStorage
      const entries = JSON.parse(localStorage.getItem('verbalize_entries') || '[]');
      const found = entries.find((e: Entry) => e.id === entryId);
      if (found) {
        setEntry(found);
        generateFeedback(found);
      } else {
        setIsLoading(false);
      }
    }
  }, [entryId]);

  useEffect(() => {
    if (feedback) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const generateFeedback = async (entry: Entry) => {
    setIsLoading(true);
    try {
      const result = await generateVerbalizationFeedback(entry.content, entry.promptTitle);
      setFeedback(result);
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      setFeedback({
        score: 70,
        feedback: '回答を送信しました。継続してトレーニングすることで上達します。',
        suggestions: ['より具体的な表現を心がけましょう', '数字や事例を交えると伝わりやすくなります']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/');
  };

  if (isLoading || !entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">フィードバックを生成中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success Animation */}
      {showConfetti && (
        <div className="text-center mb-8 animate-bounce">
          <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
          <p className="text-2xl font-bold mt-4 text-green-600 dark:text-green-400">完了！</p>
        </div>
      )}

      {/* Score Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            スコア
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{feedback?.score || 70}</div>
            <div className="text-muted-foreground">/ 100点</div>
            <Progress value={feedback?.score || 70} className="mt-4" />
          </div>
        </CardContent>
      </Card>

      {/* Feedback Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            フィードバック
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed">{feedback?.feedback}</p>
        </CardContent>
      </Card>

      {/* Suggestions Card */}
      {feedback?.suggestions && feedback.suggestions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              改善の提案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Entry Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>あなたの回答</CardTitle>
          <CardDescription>{entry.promptTitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <Button onClick={handleContinue} size="lg" className="w-full">
        次のお題に進む
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </>
  );
}

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">フィードバック</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <FeedbackSearchParamsWrapper />
        </Suspense>
      </main>
    </div>
  );
}

function FeedbackSearchParamsWrapper() {
  const searchParams = useSearchParams();
  const entryId = searchParams.get('entryId');
  return <FeedbackContent entryId={entryId} />;
}
