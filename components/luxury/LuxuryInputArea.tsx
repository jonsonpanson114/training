'use client';

import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Pen } from 'lucide-react';

interface LuxuryInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function LuxuryInputArea({ value, onChange, placeholder, maxLength = 2000 }: LuxuryInputAreaProps) {
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    if (e.target.value.length > 0 && !showSparkle) {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1000);
    }
  };

  const progress = (charCount / maxLength) * 100;

  return (
    <div className="vintage-card p-0 overflow-hidden relative">
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-primary/30 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-primary/30 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-card to-muted/30">
        <div className="flex items-center gap-3">
          <div className={`vintage-icon-container transition-all duration-300 ${isFocused ? 'primary' : ''}`}>
            <Pen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-foreground">回答を入力</h3>
            <p className="text-xs text-muted-foreground">思考を言語化しましょう</p>
          </div>
        </div>
        {showSparkle && (
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
        )}
      </div>

      {/* Input area */}
      <div className="p-6">
        <Textarea
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || "ここにあなたの回答を書いてください..."}
          className="min-h-[350px] resize-none text-base leading-relaxed border-0 bg-transparent p-0 focus:ring-0"
        />

        {/* Character count and progress */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 mr-6">
            <div className="h-1.5 bg-input rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progress > 90 ? 'bg-danger' : progress > 70 ? 'bg-warning' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {charCount} / {maxLength}
          </p>
        </div>

        {/* Progress label */}
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">
            {charCount === 0 && 'まだ何も入力されていません'}
            {charCount > 0 && charCount < 100 && 'もっと書きましょう！'}
            {charCount >= 100 && charCount < 300 && '素晴らしい！続けてください'}
            {charCount >= 300 && '素晴らしい思考です！'}
          </p>
        </div>
      </div>
    </div>
  );
}
