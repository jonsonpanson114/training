'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, Sparkles, BookOpen, Lightbulb, Pen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fixedPrompts, dynamicPrompts, getRandomPrompt } from '@/lib/prompts';
import { Prompt } from '@/types';
import { FloatingParticles } from '@/components/luxury/FloatingParticles';
import { LuxuryTimer } from '@/components/luxury/LuxuryTimer';
import { LuxuryInputArea } from '@/components/luxury/LuxuryInputArea';

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
  const [totalTime, setTotalTime] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (dynamicPrompts[id]) {
      setDynamicContent({
        title: dynamicPrompts[id].title,
        description: dynamicPrompts[id].description
      });
      const timeLimit = dynamicPrompts[id].timeLimit * 60;
      setTimeLeft(timeLimit);
      setTotalTime(timeLimit);
      generateDynamicPrompt(id);
    } else {
      const found = fixedPrompts.find(p => p.id === id || p.category === id);
      if (found) {
        setPrompt(found);
        const timeLimit = found.timeLimit * 60;
        setTimeLeft(timeLimit);
        setTotalTime(timeLimit);
      } else {
        const random = getRandomPrompt(id === 'basic' || id === 'emotion' || id === 'work' || id === 'abduction' ? id : undefined);
        if (random) {
          setPrompt(random);
          const timeLimit = random.timeLimit * 60;
          setTimeLeft(timeLimit);
          setTotalTime(timeLimit);
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
      const response = await fetch('/api/ai/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) throw new Error('Failed to generate prompt');

      const result = await response.json();

      if (type === 'abduction' && result.phenomenon) {
        setDynamicContent({
          title: 'アブダクション道場',
          description: result.phenomenon
        });
      } else if (type === 'synapse' && result.word1 && result.word2) {
        setDynamicContent({
          title: 'Synapse Match',
          description: `「${result.word1}」と「${result.word2}」の共通点を10個見つけてください`
        });
      } else if (type === 'metaphor' && result.concept) {
        setDynamicContent({
          title: 'Metaphor Maker',
          description: `「${result.concept}」をバカでもわかる例え話で説明してください`
        });
      } else if (type === 'abduction-lens' && result.description) {
        setDynamicContent({
          title: 'Abduction Lens',
          description: result.description,
          imageUrl: result.imageUrl
        });
      } else if (type === 'whysos' && result.question) {
        setDynamicContent({
          title: 'Why So（なぜなぜ分析）',
          description: result.question
        });
      } else if (type === 'sowhat' && result.question) {
        setDynamicContent({
          title: 'So What?（つまり何？）',
          description: result.question
        });
      } else if (type === '5w1h' && result.question) {
        setDynamicContent({
          title: '5W1H 展開',
          description: result.question
        });
      } else if (type === 'prep' && result.question) {
        setDynamicContent({
          title: 'PREP法',
          description: result.question
        });
      } else if (type === 'fogcatcher' && result.question) {
        setDynamicContent({
          title: 'Fog Catcher（思考の霧払い）',
          description: result.question
        });
      }
    } catch (error) {
      console.error('Failed to generate dynamic prompt:', error);
    } finally {
      setIsGenerating(false);
    }
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

    router.push(`/write/feedback?entryId=${newEntry.id}`);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FloatingParticles />
        <div className="vintage-card p-12 text-center z-10">
          <div className="vintage-icon-container primary mx-auto mb-6 animate-bounce">
            <Sparkles className="w-8 h-8 text-background" />
          </div>
          <p className="text-xl font-serif font-semibold mb-2">お題を生成中...</p>
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

  const displayTitle = prompt?.title || dynamicContent?.title || '言語化トレーニング';
  const displayDescription = prompt?.description || dynamicContent?.description || '';

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <FloatingParticles />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 lg:p-8 overflow-auto z-10">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="icon" className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-semibold text-foreground">言語化トレーニング</h1>
              <p className="text-sm text-muted-foreground">思考を言葉に変える旅</p>
            </div>
          </div>
        </header>

        {/* Timer */}
        <LuxuryTimer
          timeLeft={timeLeft}
          totalTime={totalTime}
          onStart={() => setIsTimerRunning(true)}
          onPause={() => setIsTimerRunning(false)}
          onReset={() => {
            setTimeLeft(totalTime);
            setIsTimerRunning(false);
          }}
        />

        {/* Prompt Card */}
        <div className="vintage-card p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-4 mb-4">
            <div className="vintage-icon-container accent shrink-0">
              <Lightbulb className="w-5 h-5 text-background" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-2">{displayTitle}</h2>
              <p className="text-foreground/80 leading-relaxed">{displayDescription}</p>
            </div>
          </div>
          {dynamicContent?.imageUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-border">
              <img src={dynamicContent.imageUrl} alt="Abduction Lens" className="w-full" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <LuxuryInputArea
          value={content}
          onChange={setContent}
          placeholder="あなたの思考を自由に書き出してください..."
        />

        {/* Tags */}
        <div className="vintage-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground">タグ（任意）</h3>
          </div>
          <div className="flex gap-2 mb-4">
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
              <Badge
                key={tag}
                className="px-3 py-1.5 rounded-full bg-muted text-foreground hover:bg-danger hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag}
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          size="lg"
          className="vintage-button-primary w-full h-14 text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              回答を提出する
            </>
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-border bg-card/50 z-10">
        <div className="vintage-card p-6 mb-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">コツ</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>抽象的な概念を具体的な言葉に変える</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>自分の経験やエピソードを交える</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>数字や事例で説得力を増す</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <span>簡潔に、でも十分に伝える</span>
            </li>
          </ul>
        </div>

        <div className="vintage-card p-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">現在の状況</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">文字数</span>
              <span className="font-semibold">{content.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">タグ</span>
              <span className="font-semibold">{tags.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">進捗</span>
              <span className={`font-semibold ${content.length > 100 ? 'text-primary' : 'text-muted-foreground'}`}>
                {content.length > 100 ? '進行中' : '未着手'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
