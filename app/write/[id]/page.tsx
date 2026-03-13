'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, Sparkles, BookOpen, Lightbulb, Pen, X, List, Target, ChevronRight, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fixedPrompts, dynamicPrompts, getRandomPrompt } from '@/lib/prompts';
import { Prompt } from '@/types';
import { FloatingParticles } from '@/components/luxury/FloatingParticles';
import { LuxuryTimer } from '@/components/luxury/LuxuryTimer';
import { LuxuryInputArea } from '@/components/luxury/LuxuryInputArea';

interface StepInput {
  step: number;
  answer: string;
}

export default function WritePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [dynamicContent, setDynamicContent] = useState<{
    title: string;
    description: string;
    imageUrl?: string;
    question?: string;
    steps?: Array<{ step: number; label: string; placeholder: string }>;
  } | null>(null);
  const [stepInputs, setStepInputs] = useState<StepInput[]>([]);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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

  // Initialize step inputs when steps are available
  useEffect(() => {
    if (dynamicContent?.steps) {
      setStepInputs(dynamicContent.steps.map(step => ({ step: step.step, answer: '' })));
      setCurrentStep(0);
    }
  }, [dynamicContent?.steps]);

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
          description: result.question,
          steps: result.steps
        });
      } else if (type === 'sowhat' && result.question) {
        setDynamicContent({
          title: 'So What?（つまり何？）',
          description: result.question,
          steps: result.steps
        });
      } else if (type === '5w1h' && result.question) {
        setDynamicContent({
          title: '5W1H 展開',
          description: result.question,
          steps: result.steps
        });
      } else if (type === 'prep' && result.question) {
        setDynamicContent({
          title: 'PREP法',
          description: result.question,
          steps: result.steps
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

  const handleStart = () => {
    setIsTimerRunning(true);
  };

  const handleReset = () => {
    setTimeLeft(totalTime);
    setIsTimerRunning(false);
    if (dynamicContent?.steps) {
      setStepInputs(dynamicContent.steps.map(step => ({ step: step.step, answer: '' })));
      setCurrentStep(0);
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

  const handleStepInput = (stepIndex: number, value: string) => {
    const updated = [...stepInputs];
    updated[stepIndex].answer = value;
    setStepInputs(updated);
  };

  const handleNextStep = () => {
    if (currentStep < stepInputs.length - 1) {
      setCurrentStep(currentStep + 1);
    }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Combine content from step inputs
  useEffect(() => {
    if (stepInputs.length > 0) {
      const combined = stepInputs.map(si => si.answer).join('\n\n');
      setContent(combined);
    }
  }, [stepInputs]);

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
  const displayDescription = dynamicContent?.question || dynamicContent?.description || '';

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <FloatingParticles />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 lg:p-8 overflow-auto z-10">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-4">
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
          onStart={handleStart}
          onPause={() => setIsTimerRunning(false)}
          onReset={handleReset}
        />

        {/* Prompt Card */}
        <div className="vintage-card p-6 lg:p-8 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="vintage-icon-container accent shrink-0">
              <Lightbulb className="w-5 h-5 text-background" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-serif font-semibold text-foreground mb-2">{displayTitle}</h2>
              <p className="text-foreground/80 leading-relaxed">{displayDescription}</p>
            </div>
          </div>
          {dynamicContent?.imageUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-border">
              <img src={dynamicContent.imageUrl} alt="Abduction Lens" className="w-full" />
            </div>
          )}

          {/* Step-by-step inputs for specific training types */}
          {dynamicContent?.steps && dynamicContent.steps.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <List className="w-5 h-5 text-primary" />
                  <h3 className="font-serif font-semibold text-foreground">
                    ステップ別トレーニング
                  </h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentStep + 1} / {stepInputs.length}
                </div>
              </div>

              <div className="space-y-6">
                {dynamicContent.steps.map((step, index) => (
                  <div
                    key={step.step}
                    className={`
                      p-4 rounded-xl border transition-all duration-300
                      ${index === currentStep
                        ? 'border-accent bg-accent/5 shadow-md'
                        : 'border-border bg-input opacity-60'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`vintage-icon-container shrink-0 ${index === currentStep ? 'primary' : ''}`}>
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {step.label}
                        </label>
                        <textarea
                          value={stepInputs[index]?.answer || ''}
                          onChange={(e) => handleStepInput(index, e.target.value)}
                          placeholder={step.placeholder}
                          rows={3}
                          disabled={index > currentStep}
                          className={`
                            w-full px-4 py-3 rounded-xl border text-base leading-relaxed resize-none
                            ${index === currentStep
                              ? 'border-accent bg-card focus:border-accent'
                              : 'border-border bg-input'
                            }
                            disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent/30
                          `}
                        />
                      </div>
                    </div>

                    {index === currentStep && stepInputs[index]?.answer && (
                      <div className="flex justify-end mt-3">
                        <Button
                          onClick={handleNextStep}
                          disabled={!stepInputs[index]?.answer}
                          className="vintage-button-primary flex items-center gap-2"
                        >
                          次へ進む
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {currentStep === stepInputs.length - 1 && stepInputs[stepInputs.length - 1]?.answer && (
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    リセットしてやり直す
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area (for regular prompts or fogcatcher) */}
        {!dynamicContent?.steps && (
          <LuxuryInputArea
            value={content}
            onChange={setContent}
            placeholder={dynamicContent?.description || prompt?.description || "ここにあなたの回答を書いてください..."}
          />
        )}

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
              <span>数字や事例を交えると伝わりやすくなります</span>
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
              <span className="text-muted-foreground">ステップ</span>
              <span className={`font-semibold ${dynamicContent?.steps ? 'text-primary' : 'text-muted-foreground'}`}>
                {dynamicContent?.steps ? `${currentStep + 1} / ${stepInputs.length}` : '-'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
