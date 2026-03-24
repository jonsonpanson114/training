'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDurationSec: number;
  animationDelaySec: number;
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 20; i += 1) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          animationDurationSec: 20 + Math.random() * 10,
          animationDelaySec: Math.random() * 5,
        });
      }
      setParticles(newParticles);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: 'radial-gradient(circle, #8B7355 0%, transparent 70%)',
            opacity: particle.opacity,
            animation: `float ${particle.animationDurationSec}s ease-in-out infinite`,
            animationDelay: `${particle.animationDelaySec}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -20px) rotate(90deg);
          }
          50% {
            transform: translate(-10px, 10px) rotate(180deg);
          }
          75% {
            transform: translate(-20px, -10px) rotate(270deg);
          }
        }
      `}</style>
    </div>
  );
}
