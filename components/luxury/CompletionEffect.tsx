'use client';

import { useEffect, useState } from 'react';

interface CompletionEffectProps {
  onComplete?: () => void;
}

interface CelebrationParticle {
  id: number;
  rotation: number;
  scale: number;
  emoji: string;
  distance: number;
}

export function CompletionEffect({ onComplete }: CompletionEffectProps) {
  const [particles, setParticles] = useState<CelebrationParticle[]>([]);

  useEffect(() => {
    const particlesTimer = setTimeout(() => {
      const emojis = ['✨', '🌟', '⭐', '💫', '🎉', '🏆', '📚', '🎨', '💡'];
      const newParticles: CelebrationParticle[] = [];

      for (let i = 0; i < 30; i += 1) {
        newParticles.push({
          id: i,
          rotation: Math.random() * 360,
          scale: Math.random() * 0.5 + 0.5,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          distance: 150 + Math.random() * 100,
        });
      }
      setParticles(newParticles);
    }, 0);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(particlesTimer);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background opacity-0 animate-fadeOut" />

      {/* Central success icon */}
      <div className="relative z-10 animate-scaleIn">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
          <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-center mt-6">
          <h2 className="text-3xl font-serif font-bold text-foreground">素晴らしい！</h2>
          <p className="text-muted-foreground mt-2">トレーニングを完了しました</p>
        </div>
      </div>

      {/* Floating particles */}
      {particles.map((particle) => {
        const angle = (particle.id / 30) * 2 * Math.PI;

        return (
          <div
            key={particle.id}
            className="absolute text-4xl"
            style={{
              left: `calc(50% + ${Math.cos(angle) * particle.distance}px)`,
              top: `calc(50% + ${Math.sin(angle) * particle.distance}px)`,
              animation: `celebrate 2s ease-out forwards`,
              animationDelay: `${particle.id * 50}ms`,
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            }}
          >
            {particle.emoji}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes celebrate {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translate(var(--tx, 0), var(--ty, -100px)) rotate(180deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 0), var(--ty, -200px)) rotate(360deg) scale(0);
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeOut {
          0% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
