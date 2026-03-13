'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles, Trophy, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PremiumHeader() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { label: 'ダッシュボード', href: '/' },
    { label: '履歴', href: '/history' },
    { label: '統計', href: '/history' },
    { label: '設定', href: '/' },
  ];

  return (
    <div className="elegant-header">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Elegant background decoration */}
        <div className="absolute -right-20 top-20 opacity-30">
          <div className="w-64 h-64 border-2 border-gold-dark/30 rounded-full opacity-40" />
        </div>
        <div className="absolute -right-40 top-40 opacity-20">
          <div className="w-48 h-48 border-2 border-gold-light/20 rounded-full opacity-30" />
        </div>
        <div className="absolute -left-20 top-60 opacity-10">
          <div className="w-32 h-32 border-2 border-gold-light/10 rounded-full opacity-20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center gap-8">
            {/* Premium Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="premium-icon">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight gold-text">
                Verbalize
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
                  ダッシュボード
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
                  履歴
                </Button>
              </Link>
            </nav>
          </div>

          {/* Right: User Menu and Stats */}
          <div className="flex items-center gap-4">
            {/* Streak Display */}
            <div className="flex items-center gap-2 px-4 py-2 premium-badge">
              <Trophy className="h-5 w-5 text-gold-dark" />
              <div className="flex flex-col">
                <span className="text-sm text-gold-dark/60">連続記録</span>
                <span className="text-xl font-bold text-gold-dark">3日</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="text-foreground/60 hover:text-foreground"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-0.5 rounded-full bg-foreground/10" />
                  <span className="text-sm">設定</span>
                </div>
              </Button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-foreground/10 shadow-lg rounded-lg py-2 z-50">
                  {menuItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors rounded-md"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
