'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, Trash2, BarChart3, List, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FloatingParticles } from '@/components/luxury/FloatingParticles';

interface Entry {
  id: string;
  promptId: string;
  promptTitle: string;
  category: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  basic: 'bg-blue-100 text-blue-800',
  emotion: 'bg-purple-100 text-purple-800',
  work: 'bg-green-100 text-green-800',
  abduction: 'bg-orange-100 text-orange-800',
  synapse: 'bg-pink-100 text-pink-800',
  metaphor: 'bg-yellow-100 text-yellow-800',
  fogcatcher: 'bg-cyan-100 text-cyan-800',
  whysos: 'bg-red-100 text-red-800',
  sowhat: 'bg-indigo-100 text-indigo-800',
  '5w1h': 'bg-teal-100 text-teal-800',
  prep: 'bg-amber-100 text-amber-800',
  'abduction-lens': 'bg-rose-100 text-rose-800',
};

const categoryNames: Record<string, string> = {
  basic: '基本編',
  emotion: '思考・感情編',
  work: '仕事・ビジネス編',
  abduction: 'アブダクション道場',
  synapse: 'Synapse Match',
  metaphor: 'Metaphor Maker',
  fogcatcher: 'Fog Catcher',
  whysos: 'Why So',
  sowhat: 'So What?',
  '5w1h': '5W1H',
  prep: 'PREP法',
  'abduction-lens': 'Abduction Lens',
};

type ViewMode = 'list';

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadEntries();
    setMounted(true);
  }, []);

  useEffect(() => {
    let filtered = entries;

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.promptTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(e => e.tags.includes(selectedTag));
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredEntries(filtered);
  }, [entries, searchTerm, selectedTag]);

  const loadEntries = () => {
    const saved = localStorage.getItem('verbalize_entries');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed);
      setFilteredEntries(parsed);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('この記録を削除しますか？')) {
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem('verbalize_entries', JSON.stringify(updated));
      localStorage.setItem('verbalize_total', updated.length.toString());
    }
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    entries.forEach(e => e.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <h1 className="text-2xl font-serif font-semibold text-foreground">履歴</h1>
              <p className="text-sm text-muted-foreground">あなたの言語化の記録</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">{entries.length}件の記録</span>
            </div>
            {getAllTags().length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">{getAllTags().length}個のタグ</span>
              </div>
            )}
          </div>
        </header>

        {/* Search */}
        <div className={`vintage-card p-4 mb-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="記録を検索..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Tag Filter */}
        {getAllTags().length > 0 && (
          <div className={`vintage-card p-4 mb-6 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">タグで絞り込み</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                className={`px-3 py-1.5 rounded-full cursor-pointer transition-all ${
                  selectedTag === ''
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/20'
                }`}
                onClick={() => setSelectedTag('')}
              >
                すべて
              </Badge>
              {getAllTags().map(tag => (
                <Badge
                  key={tag}
                  className={`px-3 py-1.5 rounded-full cursor-pointer transition-all ${
                    selectedTag === tag
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/20'
                  }`}
                  onClick={() => setSelectedTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className={`vintage-card p-12 text-center ${mounted ? 'animate-slide-up' : 'opacity-0'}`}>
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-serif text-xl mb-2">
              {entries.length === 0 ? 'まだ記録がありません' : '見つかりません'}
            </p>
            <p className="text-muted-foreground mb-6">
              {entries.length === 0
                ? 'トレーニングを始めて、最初の記録を作りましょう！'
                : '他の検索条件を試してみてください'}
            </p>
            {entries.length === 0 && (
              <Link href="/">
                <Button className="vintage-button-primary">
                  トレーニングを開始
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className={`space-y-4 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            {filteredEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="vintage-card p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`px-3 py-1 rounded-full ${categoryColors[entry.category] || 'bg-muted'}`}>
                        {categoryNames[entry.category] || entry.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-serif font-semibold text-lg text-foreground">{entry.promptTitle}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.id)}
                    className="text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                  {entry.content}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5 rounded-full">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-border bg-card/50 z-10">
        <div className="vintage-card p-6 mb-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">統計</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">総記録数</p>
              <p className="text-2xl font-serif font-semibold text-primary">{entries.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">タグ数</p>
              <p className="text-2xl font-serif font-semibold text-primary">{getAllTags().length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">カテゴリー</p>
              <p className="text-2xl font-serif font-semibold text-primary">
                {new Set(entries.map(e => e.category)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="vintage-card p-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">コツ</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>過去の回答を見直すと成長が感じられます</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>タグを活用して記録を整理しましょう</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>検索機能で過去のインスピレーションを</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
