'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fixedPrompts, dynamicPrompts, getRandomPrompt } from '@/lib/prompts';
import { Prompt } from '@/types';

export default function WritePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [dynamicContent, setDynamicContent] = useState<{ title: string; description: string; imageUrl?: string } | null>(null);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    // Find prompt or generate dynamic content
    if (dynamicPrompts[id]) {
      // Dynamic prompt - need to generate content
      setDynamicContent({
        title: dynamicPrompts[id].title,
        description: dynamicPrompts[id].description
      });
      setTimeLeft(dynamicPrompts[id].timeLimit * 60);
      generateDynamicPrompt(id);
    } else {
      // Fixed prompt
      const found = fixedPrompts.find(p => p.id === id || p.category === id);
      if (found) {
        setPrompt(found);
        setTimeLeft(found.timeLimit * 60);
      } else {
        // Random from category if category specified
        const random = getRandomPrompt(id === 'basic' || id === 'emotion' || id === 'work' || id === 'abduction' ? id : undefined);
        if (random) {
          setPrompt(random);
          setTimeLeft(random.timeLimit * 60);
        }
      }
    }
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const generateDynamicPrompt = async (type: string) => {
    setIsGenerating(true);
    try {
      const { generateAbductionPhenomenon, generateSynapseWords, generateMetaphorConcept, generateAbductionLens } = await import('@/lib/ai');

      if (type === 'abduction') {
        const phenomenon = await generateAbductionPhenomenon();
        setDynamicContent({
          title: 'アブダクション道場',
          description: phenomenon
        });
      } else if (type === 'synapse') {
        const words = await generateSynapseWords();
        setDynamicContent({
          title: 'Synapse Match',
          description: `「${words.word1}」と「${words.word2}」の共通点を10個見つけてください`
        });
      } else if (type === 'metaphor') {
        const concept = await generateMetaphorConcept();
        setDynamicContent({
          title: 'Metaphor Maker',
          description: `「${concept}」をバカでもわかる例え話で説明してください`
        });
      } else if (type === 'abduction-lens') {
        const result = await generateAbductionLens();
        setDynamicContent({
          title: 'Abduction Lens',
          description: result.description,
          imageUrl: result.imageUrl
        });
      }
    } catch (error) {
      console.error('Failed to generate dynamic prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStart = () => {
    setIsTimerRunning(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);

    // Save to localStorage
    const entries = JSON.parse(localStorage.getItem('verbalize_entries') || '[]');
    const newEntry = {
      id: Date.now().toString(),
      promptId: id,
      promptTitle: prompt?.title || dynamicContent?.title || '',
      category: prompt?.category || id,
      content,
      tags,
      createdAt: new Date().toISOString(),
    };
    entries.push(newEntry);
    localStorage.setItem('verbalize_entries', JSON.stringify(entries));

    // Update streak
    const lastEntry = entries[entries.length - 2];
    const lastDate = lastEntry ? new Date(lastEntry.createdAt) : null;
    const today = new Date();
    let streak = parseInt(localStorage.getItem('verbalize_streak') || '0', 10);

    if (lastDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.toDateString() === today.toDateString()) {
        // Same day - don't increment
      } else if (lastDate.toDateString() === yesterday.toDateString()) {
        streak += 1;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    localStorage.setItem('verbalize_streak', streak.toString());
    localStorage.setItem('verbalize_total', entries.length.toString());

    // Redirect to feedback
    router.push(`/write/feedback?entryId=${newEntry.id}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">お題を生成中...</p>
        </div>
      </div>
    );
  }

  const displayTitle = prompt?.title || dynamicContent?.title || '言語化トレーニング';
  const displayDescription = prompt?.description || dynamicContent?.description || '';

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
          <h1 className="text-xl font-semibold">言語化トレーニング</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Timer */}
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            {!isTimerRunning && timeLeft > 0 && (
              <Button onClick={handleStart}>
                <Sparkles className="mr-2 h-4 w-4" />
                スタート
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Prompt Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{displayTitle}</CardTitle>
            <CardDescription>以下のお題について言語化してください</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{displayDescription}</p>
            {dynamicContent?.imageUrl && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <img src={dynamicContent.imageUrl} alt="Abduction Lens" className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <label className="block text-sm font-medium mb-2">回答</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ここにあなたの回答を書いてください..."
              className="min-h-[300px] resize-none text-base"
            />
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <label className="block text-sm font-medium mb-2">タグ（任意）</label>
            <div className="flex gap-2 mb-3">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="タグを入力してEnter"
                className="flex-1"
              />
              <Button onClick={handleAddTag}>追加</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()} size="lg" className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              提出する
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
