'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Send, Loader2, Sparkles, BookOpen, Lightbulb, X, List, Target, ChevronRight, Check, RefreshCw, Plus, Flame, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fixedPrompts, dynamicPrompts, getRandomPrompt } from '@/lib/prompts';
import { Prompt } from '@/types';
import { FloatingParticles } from '@/components/luxury/FloatingParticles';
import { LuxuryTimer } from '@/components/luxury/LuxuryTimer';
import { LuxuryInputArea } from '@/components/luxury/LuxuryInputArea';
import { calculateExpGain } from '@/lib/gamification';
import { ThinkingBuddy } from '@/components/luxury/ThinkingBuddy';
import { decideDailyBadge, getAvailableFreeze, getTodayKey, getTodayMiniPrompt, markFreezeUsed } from '@/lib/engagement';

interface StepInput {
  step: number;
  answer: string;
}

export default function WritePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const isDailyMode = searchParams.get('daily') === '1';

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [dynamicContent, setDynamicContent] = useState<{
    title: string;
    description: string;
    imageUrl?: string;
    question?: string;
    prompts?: string[];
    steps?: Array<{ step: number; label: string; placeholder: string }>;
    goal?: string;
    guide?: string;
  } | null>(null);
  const [stepInputs, setStepInputs] = useState<StepInput[]>([]);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(300);
  const [baseTimeSeconds, setBaseTimeSeconds] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [isHardMode, setIsHardMode] = useState(false);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [hardModeError, setHardModeError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [trainingMode, setTrainingMode] = useState<'standard' | 'quick' | 'deep' | 'reflect'>('standard');
  const [currentStep, setCurrentStep] = useState(0);
  const [isCustomTheme, setIsCustomTheme] = useState(false);
  const [customTheme, setCustomTheme] = useState('');
  const [showThemeInput, setShowThemeInput] = useState(false);
  const [stepFeedbacks, setStepFeedbacks] = useState<string[]>([]);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  useEffect(() => {
    let savedId = localStorage.getItem('verbalize_user_id');
    if (!savedId || savedId.startsWith('user_')) {
      savedId = crypto.randomUUID?.() || '00000000-0000-0000-0000-000000000000';
      localStorage.setItem('verbalize_user_id', savedId);
    }
    setUserId(savedId);
  }, []);

  const getModeAdjustedTime = (baseSeconds: number, mode: 'standard' | 'quick' | 'deep' | 'reflect') => {
    if (mode === 'quick') return 180;
    if (mode === 'deep') return Math.max(baseSeconds, 900);
    if (mode === 'reflect') return Math.max(baseSeconds, 420);
    return baseSeconds;
  };

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'quick' || modeParam === 'deep' || modeParam === 'reflect') {
      setTrainingMode(modeParam);
      return;
    }
    setTrainingMode('standard');
  }, [searchParams]);

  useEffect(() => {
    const deepDiveTheme = localStorage.getItem('verbalize_custom_theme');
    if (deepDiveTheme && id) {
      setCustomTheme(deepDiveTheme);
      setIsCustomTheme(true);
      setDynamicContent(prev => prev ? { ...prev, question: deepDiveTheme } : { 
        title: dynamicPrompts[id]?.title || '深掘りトレーニング',
        description: deepDiveTheme,
        question: deepDiveTheme 
      });
      localStorage.removeItem('verbalize_custom_theme');
    }
  }, [id]);

  useEffect(() => {
    if (dynamicPrompts[id]) {
      setDynamicContent({
        title: dynamicPrompts[id].title,
        description: dynamicPrompts[id].description
      });
      const timeLimit = dynamicPrompts[id].timeLimit * 60;
      setBaseTimeSeconds(timeLimit);
      generateDynamicPrompt(id);
    } else {
      const found = fixedPrompts.find(p => p.id === id || p.category === id);
      if (found) {
        setPrompt(found);
        const timeLimit = found.timeLimit * 60;
        setBaseTimeSeconds(timeLimit);
      } else {
        const random = getRandomPrompt(id === 'basic' || id === 'emotion' || id === 'work' || id === 'abduction' ? id : undefined);
        if (random) {
          setPrompt(random);
          const timeLimit = random.timeLimit * 60;
          setBaseTimeSeconds(timeLimit);
        }
      }
    }
  }, [id]);

  const generateBannedWords = () => {
    const commonBanned = [
      'こと', 'もの', 'とても', 'すごく', '楽しい', '面白い', '思う', '感じ', '自分', '私', 
      'やっぱり', '本当', '重要', '大切', '必要', 'ため', '理由', '結果', 'つまり', 'そして'
    ];
    const shuffled = [...commonBanned].sort(() => 0.5 - Math.random());
    setBannedWords(shuffled.slice(0, 3));
  };

  useEffect(() => {
    if (isHardMode) {
      generateBannedWords();
      setTimeLeft(60);
      setTotalTime(60);
    } else {
      setBannedWords([]);
      const limit = getModeAdjustedTime(baseTimeSeconds, trainingMode);
      setTimeLeft(limit);
      setTotalTime(limit);
    }
    setIsTimerRunning(false);
  }, [isHardMode, baseTimeSeconds, trainingMode]);

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
    if (dynamicContent?.steps && dynamicContent.steps.length > 0) {
      setStepInputs(dynamicContent.steps.map(step => ({ step: step.step, answer: '' })));
      setCurrentStep(0);
    }
  }, [dynamicContent?.steps, dynamicContent?.question]);

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
      console.log('API response received:', result);

      if (type === 'abduction') {
        setDynamicContent({
          title: 'アブダクション道場',
          description: result.phenomenon || '奇妙な現象に対して、考えられる仮説を3つ挙げてください',
          goal: result.goal,
          guide: result.guide
        });
      } else if (type === 'synapse') {
        setDynamicContent({
          title: 'Synapse Match',
          description: `${result.word1 || 'コーヒー'}と${result.word2 || '雲'}の共通点を10個見つけてください`,
          goal: result.goal,
          guide: result.guide
        });
      } else if (type === 'metaphor') {
        setDynamicContent({
          title: 'Metaphor Maker',
          description: `${result.concept || 'ブロックチェーン'}をバカでもわかる例え話で説明してください`,
          goal: result.goal,
          guide: result.guide
        });
      } else if (type === 'abduction-lens') {
        setDynamicContent({
          title: 'Abduction Lens',
          description: result.description || '決定的瞬間のシーンに対して、観察事実と仮説を記述してください',
          imageUrl: result.imageUrl,
          goal: result.goal,
          guide: result.guide
        });
      } else if (type === 'whysos') {
        setDynamicContent({
          title: 'Why So（なぜなぜ分析）',
          description: result.question || '以下から深掘りしたい課題を選択してください。',
          prompts: result.prompts,
          goal: result.goal,
          guide: result.guide,
          steps: result.steps || [
            { step: 1, label: '1回目「なぜ？」', placeholder: '1つ目の原因を考えてください（20〜40文字）' },
            { step: 2, label: '2回目「なぜ？」', placeholder: 'さらに深く掘り下げてください（20〜40文字）' },
            { step: 3, label: '3回目「なぜ？」', placeholder: '根本原因に近づけてください（20〜40文字）' },
            { step: 4, label: '4回目「なぜ？」', placeholder: 'もっと深く掘り下げてください（20〜40文字）' },
            { step: 5, label: '5回目「なぜ？」', placeholder: '根本原因を明確にしてください（20〜40文字）' }
          ]
        });
      } else if (type === 'sowhat') {
        setDynamicContent({
          title: 'So What?（つまり何？）',
          description: result.question || '以下から抽象化したいテーマを選択してください。',
          prompts: result.prompts,
          goal: result.goal,
          guide: result.guide,
          steps: result.steps || [
            { step: 1, label: '1回目「つまり何？」', placeholder: 'この事実から意味や影響を考えてください（20〜40文字）' },
            { step: 2, label: '2回目「つまり何？」', placeholder: 'さらに深い意味を探ってください（20〜40文字）' },
            { step: 3, label: '3回目「つまり何？」', placeholder: '抽象度を上げて考えてください（20〜40文字）' },
            { step: 4, label: '4回目「つまり何？」', placeholder: '行動可能な教訓を考えてください（20〜40文字）' },
            { step: 5, label: '5回目「つまり何？」', placeholder: '本質的な洞察をまとめてください（20〜40文字）' }
          ]
        });
      } else if (type === '5w1h') {
        setDynamicContent({
          title: '5W1H 展開',
          description: result.question || '以下から整理したいテーマを選択してください。',
          prompts: result.prompts,
          goal: result.goal,
          guide: result.guide,
          steps: result.steps || [
            { step: 1, label: 'When（いつ）', placeholder: 'いつ起こりましたか？（10〜20文字）' },
            { step: 2, label: 'Where（どこ）', placeholder: 'どこで起こりましたか？（10〜20文字）' },
            { step: 3, label: 'Who（誰）', placeholder: '誰が関わっていましたか？（10〜20文字）' },
            { step: 4, label: 'What（何）', placeholder: '何が起こりましたか？（10〜20文字）' },
            { step: 5, label: 'Why（なぜ）', placeholder: 'なぜ起こりましたか？（10〜20文字）' },
            { step: 6, label: 'How（どのように）', placeholder: 'どのように解決・対応しますか？（10〜20文字）' }
          ]
        });
      } else if (type === 'prep') {
        setDynamicContent({
          title: 'PREP法',
          description: result.question || '以下から伝えたいテーマを選択してください。',
          prompts: result.prompts,
          goal: result.goal,
          guide: result.guide,
          steps: result.steps || [
            { step: 1, label: 'Point（結論）', placeholder: '主張を述べてください（20〜40文字）' },
            { step: 2, label: 'Reason（理由）', placeholder: 'その理由を説明してください（20〜40文字）' },
            { step: 3, label: 'Example（具体例）', placeholder: '具体例を挙げてください（20〜40文字）' },
            { step: 4, label: 'Point（結論）', placeholder: '主張を再確認してください（20〜40文字）' }
          ]
        });
      } else if (type === 'analogy') {
        const [challenge, bigTheme] = (result.prompts?.[0] || 'チームの生産性|マラソン').split('|');
        setDynamicContent({
          title: 'アナロジートレーニング',
          description: `【課題】：${challenge} \n 【大テーマ】：${bigTheme}`,
          prompts: result.prompts,
          steps: result.steps,
          goal: result.goal,
          guide: result.guide
        });
      } else if (type === 'metaphor-coach') {
        setDynamicContent({
          title: 'メタファーコーチ',
          description: result.prompts?.[0] || '愛',
          prompts: result.prompts,
          steps: result.steps,
          goal: result.goal,
          guide: result.guide
        });
      } else if (type === 'fogcatcher') {
        setDynamicContent({
          title: 'Fog Catcher（思考の霧払い）',
          description: result.question || '以下から書き出したいテーマを選択してください。',
          prompts: result.prompts,
          goal: result.goal,
          guide: result.guide,
          question: result.question
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

  const handleSubmit = async () => {
    if (!content.trim()) return;

    // Hard Mode Validation
    if (isHardMode) {
      const foundBanned = bannedWords.filter(word => content.includes(word));
      if (foundBanned.length > 0) {
        setHardModeError(`NGワードが含まれています: ${foundBanned.join(', ')}`);
        return;
      }
    }
    setHardModeError(null);

    setIsSubmitting(true);
    const tempId = `local_${Date.now()}`;
    let finalEntryId = tempId;
    let createdAt = new Date().toISOString();

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          promptId: id,
          promptTitle: prompt?.title || dynamicContent?.title || '',
          category: prompt?.category || id,
          content,
          tags,
          imageUrl: dynamicContent?.imageUrl || null,
          contextText: dynamicContent?.description || prompt?.description || null,
        }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        finalEntryId = newEntry.id;
        createdAt = newEntry.created_at;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('クラウド保存（Supabase）が未設定または失敗しました。ローカル保存へフォールバックします。詳細:', errorData);
      }
    } catch (error) {
      console.error('Submission error, falling back to local storage:', error);
    }

    try {
      const expGain = calculateExpGain(content);
      const currentExp = parseInt(localStorage.getItem('verbalize_exp') || '0', 10);
      localStorage.setItem('verbalize_exp', (currentExp + expGain).toString());

      const entries = JSON.parse(localStorage.getItem('verbalize_entries') || '[]');
      const newEntryObject = {
        id: finalEntryId,
        promptId: id,
        promptTitle: prompt?.title || dynamicContent?.title || '',
        category: prompt?.category || id,
        content,
        tags,
        imageUrl: dynamicContent?.imageUrl || null,
        contextText: dynamicContent?.description || prompt?.description || null,
        createdAt: createdAt,
        isOffline: finalEntryId.startsWith('local_')
      };
      
      entries.push(newEntryObject);
      localStorage.setItem('verbalize_entries', JSON.stringify(entries));

      const lastEntry = entries[entries.length - 2];
      const lastDate = lastEntry ? new Date(lastEntry.createdAt) : null;
      const today = new Date();
      const currentStreak = parseInt(localStorage.getItem('verbalize_streak') || '0', 10);
      let streak = currentStreak;

      if (lastDate) {
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastStart = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const diffDays = Math.round((todayStart.getTime() - lastStart.getTime()) / 86400000);

        if (diffDays === 1) {
          streak = currentStreak + 1;
        } else if (diffDays === 2 && getAvailableFreeze(today) > 0) {
          streak = currentStreak + 1;
          markFreezeUsed(today);
        } else if (diffDays > 1) {
          streak = 1;
        }
      } else {
        streak = 1;
      }

      const badge = decideDailyBadge({
        content,
        tags,
        imageUrl: dynamicContent?.imageUrl || null,
        contextText: dynamicContent?.description || prompt?.description || null,
        isHardMode,
      });
      localStorage.setItem(`verbalize_badge_${getTodayKey(today)}`, JSON.stringify(badge));
      if (isDailyMode) {
        localStorage.setItem(`verbalize_daily_completed_${getTodayKey(today)}`, '1');
      }

      localStorage.setItem('verbalize_streak', streak.toString());
      localStorage.setItem('verbalize_total', entries.length.toString());

      router.push(`/write/feedback?entryId=${finalEntryId}`);
    } catch (error) {
      console.error('Final submission processing error:', error);
      alert('記録の処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegeneratePrompt = async () => {
    if (dynamicPrompts[id]) {
      setIsCustomTheme(false);
      setCustomTheme('');
      setDynamicContent(prev => prev ? { ...prev, question: undefined } : null);
      await generateDynamicPrompt(id);
    }
  };

  const handleSelectChallenge = (prompt: string) => {
    setDynamicContent(prev => prev ? { 
      ...prev, 
      question: prompt,
      description: prompt 
    } : null);
  };

  const handleUseCustomTheme = () => {
    if (customTheme.trim()) {
      setDynamicContent(prev => prev ? { ...prev, question: customTheme } : null);
      setIsCustomTheme(true);
      setShowThemeInput(false);
    }
  };

  const handleResetToAIGenerated = () => {
    setIsCustomTheme(false);
    handleRegeneratePrompt();
  };

  const handleStepInput = (stepIndex: number, value: string) => {
    const updated = [...stepInputs];
    updated[stepIndex].answer = value;
    setStepInputs(updated);
  };

  const handleNextStep = async () => {
    if (currentStep < (dynamicContent?.steps?.length || 0) - 1) {
      if (id === 'analogy' || id === 'metaphor-coach') {
        setIsFeedbackLoading(true);
        try {
          const response = await fetch('/api/ai/step-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: id,
              currentStep: currentStep + 1,
              content: stepInputs[currentStep].answer,
              previousSteps: stepInputs.slice(0, currentStep),
              theme: dynamicContent?.question || dynamicContent?.description
            }),
          });
          if (response.ok) {
            const data = await response.json();
            const newFeedbacks = [...stepFeedbacks];
            newFeedbacks[currentStep] = data.feedback;
            setStepFeedbacks(newFeedbacks);
          }
        } catch (error) {
          console.error('Failed to get step feedback:', error);
        } finally {
          setIsFeedbackLoading(false);
        }
      }
      setCurrentStep(currentStep + 1);
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
  const displayDescription = isDailyMode
    ? getTodayMiniPrompt()
    : dynamicContent?.question || dynamicContent?.description || '';

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <FloatingParticles />

      <div className="flex-1 flex flex-col p-4 lg:p-8 overflow-auto z-10">
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
            <div className="hidden lg:flex items-center gap-2 ml-4">
              <Button variant={trainingMode === 'quick' ? 'default' : 'outline'} size="sm" onClick={() => setTrainingMode('quick')}>3分</Button>
              <Button variant={trainingMode === 'deep' ? 'default' : 'outline'} size="sm" onClick={() => setTrainingMode('deep')}>深掘り</Button>
              <Button variant={trainingMode === 'reflect' ? 'default' : 'outline'} size="sm" onClick={() => setTrainingMode('reflect')}>感情整理</Button>
            </div>
            <div className="ml-auto">
              <Button
                variant={isHardMode ? "default" : "outline"}
                className={`transition-all duration-500 rounded-xl px-4 flex items-center gap-2 ${isHardMode ? 'bg-danger text-white hover:bg-danger/90 animate-pulse border-danger' : 'border-danger/30 text-danger/70 hover:bg-danger/5'}`}
                onClick={() => setIsHardMode(!isHardMode)}
              >
                <Flame className={`w-4 h-4 ${isHardMode ? 'animate-bounce' : ''}`} />
                <span className="font-bold text-xs tracking-widest">{isHardMode ? 'HARD MODE ACTIVE' : 'HARD MODE'}</span>
              </Button>
            </div>
          </div>
        </header>

        <LuxuryTimer
          timeLeft={timeLeft}
          totalTime={totalTime}
          onStart={handleStart}
          onPause={() => setIsTimerRunning(false)}
          onReset={handleReset}
        />

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

          {(dynamicContent?.goal || dynamicPrompts[id]?.goal) && (
            <div className="mb-6 p-5 bg-accent/5 border border-accent/20 rounded-2xl animate-in fade-in slide-in-from-left duration-700">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-widest">何を聞かれているか（トレーニングの狙い）</span>
              </div>
              <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                {dynamicContent?.goal || dynamicPrompts[id]?.goal}
              </p>
            </div>
          )}

          {(dynamicContent?.guide || dynamicPrompts[id]?.guide) && (
            <div className="mb-6 p-5 bg-primary/5 border border-primary/20 rounded-2xl animate-in fade-in slide-in-from-right duration-700 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
               <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">具体的に何をするか（陣内コーチの極意）</span>
              </div>
              <div className="text-sm text-foreground/90 font-serif leading-relaxed whitespace-pre-wrap">
                {dynamicContent?.guide || dynamicPrompts[id]?.guide}
              </div>
            </div>
          )}
          {dynamicContent?.imageUrl && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-border">
              <Image
                src={dynamicContent.imageUrl}
                alt="Abduction Lens"
                width={1200}
                height={800}
                className="w-full h-auto"
                unoptimized
              />
            </div>
          )}

          {dynamicContent?.prompts && dynamicContent.prompts.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                トレーニングのお題を選択してください：
              </p>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                {dynamicContent.prompts.map((p, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectChallenge(p)}
                    className={`
                      relative p-5 rounded-2xl border-2 text-left transition-all duration-300 group
                      ${dynamicContent.question === p
                        ? 'border-accent bg-accent/10 shadow-lg scale-[1.02] z-10'
                        : 'border-border bg-input hover:border-accent/40 hover:bg-accent/5 hover:shadow-md'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                        ${dynamicContent.question === p ? 'bg-accent text-background' : 'bg-muted text-muted-foreground group-hover:bg-accent/20 group-hover:text-accent'}
                      `}>
                        {index + 1}
                      </div>
                      {dynamicContent.question === p && (
                        <div className="bg-accent rounded-full p-1 animate-in zoom-in duration-300">
                          <Check className="w-4 h-4 text-background" />
                        </div>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed font-medium ${dynamicContent.question === p ? 'text-foreground' : 'text-foreground/80'}`}>
                      {p}
                    </p>
                    {dynamicContent.question === p && (
                      <div className="absolute -bottom-2 -right-2 bg-accent text-background text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                        SELECTED
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {dynamicPrompts[id] && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleRegeneratePrompt}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-accent/50 hover:border-accent hover:bg-accent/10"
                >
                  <RefreshCw className="w-4 h-4" />
                  新しいお題を生成
                </Button>
                {['whysos', 'sowhat', '5w1h', 'prep', 'fogcatcher'].includes(id) && (
                  <>
                    <Button
                      onClick={() => setShowThemeInput(!showThemeInput)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      自分のテーマを使う
                    </Button>
                    {isCustomTheme && (
                      <Button
                        onClick={handleResetToAIGenerated}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        AIお題に戻る
                      </Button>
                    )}
                  </>
                )}
              </div>

              {showThemeInput && ['whysos', 'sowhat', '5w1h', 'prep', 'fogcatcher'].includes(id) && (
                <div className="mt-4 p-4 bg-input rounded-xl border border-border">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    自分のテーマ（議題）を入力
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={customTheme}
                      onChange={(e) => setCustomTheme(e.target.value)}
                      placeholder="例：最近気になっていること、悩み、議論したいテーマなど"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleUseCustomTheme}
                      disabled={!customTheme.trim()}
                      className="vintage-button-primary"
                    >
                      適用
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {dynamicContent?.steps && dynamicContent.steps.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <List className="w-5 h-5 text-primary" />
                  <h3 className="font-serif font-semibold text-foreground">ステップ別トレーニング</h3>
                </div>
                <div className="text-sm text-muted-foreground">{currentStep + 1} / {stepInputs.length}</div>
              </div>
              <div className="space-y-6">
                {dynamicContent.steps.map((step, index) => (
                  <div
                    key={step.step}
                    className={`p-4 rounded-xl border transition-all duration-300 ${index === currentStep ? 'border-accent bg-accent/5 shadow-md' : 'border-border bg-input opacity-60'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`vintage-icon-container shrink-0 ${index === currentStep ? 'primary' : ''}`}>
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-2">{step.label}</label>
                        <textarea
                          value={stepInputs[index]?.answer || ''}
                          onChange={(e) => handleStepInput(index, e.target.value)}
                          placeholder={step.placeholder}
                          rows={3}
                          disabled={index > currentStep}
                          className={`w-full px-4 py-3 rounded-xl border text-base leading-relaxed resize-none ${index === currentStep ? 'border-accent bg-card focus:border-accent' : 'border-border bg-input'} disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent/30`}
                        />
                      </div>
                    </div>
                    {stepFeedbacks[index] && (
                      <div className="mt-4 p-5 bg-primary/5 border border-primary/20 rounded-xl animate-in slide-in-from-left duration-500 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-primary mt-1 shrink-0" />
                          <div className="text-sm font-serif leading-relaxed text-foreground/90 whitespace-pre-wrap">
                            {stepFeedbacks[index]}
                          </div>
                        </div>
                      </div>
                    )}
                    {index === currentStep && stepInputs[index]?.answer && (
                      <div className="flex justify-end mt-3">
                        <Button 
                          onClick={handleNextStep} 
                          disabled={!stepInputs[index]?.answer || isFeedbackLoading} 
                          className="vintage-button-primary flex items-center gap-2 group relative overflow-hidden"
                        >
                          {isFeedbackLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span className="relative z-10">次へ進む</span>
                              <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isHardMode && (
          <div className="vintage-card p-4 border-danger/30 bg-danger/5 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="vintage-icon-container danger shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-danger uppercase tracking-wider mb-2">Hard Mode Restrictions</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-danger/10 text-danger px-2 py-1 rounded border border-danger/20 font-semibold">⏰ タイムリミット: 60秒</span>
                  {bannedWords.map(word => (
                    <span key={word} className="text-xs bg-danger/10 text-danger px-2 py-1 rounded border border-danger/20 font-bold">🚫 NG: {word}</span>
                  ))}
                </div>
                {hardModeError && <p className="text-xs text-danger mt-3 font-bold animate-pulse">{hardModeError}</p>}
              </div>
            </div>
          </div>
        )}

        {!dynamicContent?.steps && (
          <LuxuryInputArea
            value={content}
            onChange={setContent}
            placeholder={dynamicContent?.description || prompt?.description || "ここにあなたの回答を書いてください..."}
          />
        )}

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

      <aside className="w-full lg:w-72 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-border bg-card/50 z-10">
        <div className="vintage-card p-6 mb-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">コツ</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary">1.</span><span>抽象的な概念を具体的な言葉に変える</span></li>
            <li className="flex items-start gap-2"><span className="text-primary">2.</span><span>自分の経験やエピソードを交える</span></li>
            <li className="flex items-start gap-2"><span className="text-primary">3.</span><span>数字や事例を交えると伝わりやすくなります</span></li>
            <li className="flex items-start gap-2"><span className="text-primary">4.</span><span>簡潔に、でも十分に伝える</span></li>
          </ul>
        </div>
        <div className="vintage-card p-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">現在の状況</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">文字数</span><span className="font-semibold">{content.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">タグ</span><span className="font-semibold">{tags.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ステップ</span><span className={`font-semibold ${dynamicContent?.steps ? 'text-primary' : 'text-muted-foreground'}`}>{dynamicContent?.steps ? `${currentStep + 1} / ${stepInputs.length}` : '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">モード</span><span className="font-semibold capitalize">{trainingMode}</span></div>
          </div>
        </div>
      </aside>
      <ThinkingBuddy mode="write" />
    </div>
  );
}
