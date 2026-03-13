'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
  basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  emotion: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  work: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  abduction: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  synapse: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  metaphor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  fogcatcher: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  whysos: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  sowhat: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  '5w1h': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  prep: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'abduction-lens': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
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

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    let filtered = entries;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.promptTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(e => e.tags.includes(selectedTag));
    }

    // Sort by date descending
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

      // Update total count
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">履歴</h1>
          <div className="ml-auto text-sm text-muted-foreground">
            {entries.length}件の記録
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="検索..."
            className="max-w-md"
          />
        </div>

        {/* Tag Filter */}
        {getAllTags().length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedTag === '' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTag('')}
              >
                すべて
              </Badge>
              {getAllTags().map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {entries.length === 0
                  ? 'まだ記録がありません。トレーニングを始めましょう！'
                  : '検索条件に一致する記録がありません。'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={categoryColors[entry.category] || 'bg-gray-100 text-gray-800'}>
                          {categoryNames[entry.category] || entry.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{entry.promptTitle}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {entry.content}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
