'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, size = 200, strokeWidth = 12 }: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const circumference = 2 * Math.PI * ((size - strokeWidth) / 2);
  const progress = circumference - (score / 100) * circumference;

  useEffect(() => {
    let current = 0;
    const increment = score / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        current = score;
        clearInterval(timer);
      }
      setDisplayScore(Math.round(current));
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="none"
          stroke="#E8E3D8"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B7355" />
            <stop offset="50%" stopColor="#C9A96E" />
            <stop offset="100%" stopColor="#8B7355" />
          </linearGradient>
        </defs>
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-serif font-bold text-foreground">
          {displayScore}
        </span>
        <span className="text-sm text-muted-foreground mt-1">/ 100</span>
      </div>
    </div>
  );
}
