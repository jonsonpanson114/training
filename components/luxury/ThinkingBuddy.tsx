'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, X, ChevronRight, User } from 'lucide-react';

interface ThinkingBuddyProps {
  mode?: 'home' | 'feedback' | 'write';
  userRank?: string;
  feedbackScore?: number;
  content?: string;
}

export function ThinkingBuddy({ mode = 'home', userRank, feedbackScore, content }: ThinkingBuddyProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Determine message based on mode and stats
    let msg = '';
    if (mode === 'home') {
      msg = `よう、${userRank || '新入り'}。今日も適当に思考を散らかしに来たのか？ 言葉にできないモヤモヤ、俺が一緒にぶっ壊してやるよ。`;
    } else if (mode === 'feedback') {
      if (feedbackScore && feedbackScore >= 80) {
        msg = `ほう、やるじゃないか。${feedbackScore}点か。お前の言葉には、少しずつ『魂』が宿り始めてる気がするぜ。悪くない。`;
      } else if (feedbackScore && feedbackScore >= 60) {
        msg = `${feedbackScore}点か。まあ、及第点だな。だがお前、まだ何か隠してるだろ？ もっと深いところまで潜ってみろよ。`;
      } else {
        msg = `${feedbackScore || 0}点だ。正直に言って、今のままじゃ話にならない。嘆く暇があったら、次のお題で俺を驚かせてみろ。`;
      }
    } else if (mode === 'write') {
      msg = `焦んな。格好つけて複雑なことを言おうとするなよ。思考の源泉から溢れる言葉を、そのままぶちまければいいんだ。`;
    }

    setMessage(msg);
    // Show after a short delay
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [mode, userRank, feedbackScore]);

  if (!isVisible) return null;

  return (
    <div className={`
      fixed bottom-6 right-6 z-50 transition-all duration-500 transform
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
      ${isMinimized ? 'w-14 h-14' : 'max-w-xs md:max-w-sm w-full'}
    `}>
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full bg-accent text-background flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-pulse"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      ) : (
        <div className="vintage-card p-4 md:p-6 shadow-2xl border-2 border-accent/20 bg-background/95 backdrop-blur-md relative overflow-hidden group">
          {/* Decorative Background */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors" />
          
          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg relative">
                <Sparkles className="w-6 h-6 text-background" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-background rounded-full" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-accent uppercase tracking-widest">Thinking Buddy</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Active</span>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed italic">
                「{message}」
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
             <button 
               onClick={() => setIsMinimized(true)}
               className="text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-1"
             >
               閉じる <ChevronRight className="w-2 h-2" />
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
