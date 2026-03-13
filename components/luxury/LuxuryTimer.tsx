'use client';

import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface LuxuryTimerProps {
  timeLeft: number;
  totalTime: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function LuxuryTimer({ timeLeft, totalTime, onStart, onPause, onReset }: LuxuryTimerProps) {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setIsRunning(timeLeft < totalTime && timeLeft > 0);
  }, [timeLeft, totalTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="vintage-card p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="timer-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#timer-pattern)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Timer display */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-input rounded-2xl">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-4xl font-serif font-bold text-foreground tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-input rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          {timeLeft > 0 && (
            <>
              {!isRunning ? (
                <button
                  onClick={() => {
                    onStart();
                    setIsRunning(true);
                  }}
                  className="vintage-button-primary flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  スタート
                </button>
              ) : (
                <button
                  onClick={() => {
                    onPause();
                    setIsRunning(false);
                  }}
                  className="vintage-button-secondary flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  一時停止
                </button>
              )}
            </>
          )}

          <button
            onClick={() => {
              onReset();
              setIsRunning(false);
            }}
            className="vintage-button-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            リセット
          </button>
        </div>

        {/* Time remaining label */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            残り時間: {formatTime(timeLeft)}
          </p>
        </div>
      </div>
    </div>
  );
}
