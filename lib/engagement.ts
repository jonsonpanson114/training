export interface EntryLike {
  id: string;
  category: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface DailyBadge {
  id: string;
  title: string;
  description: string;
}

export interface CompareSnapshot {
  todayChars: number;
  yesterdayChars: number;
  todaySentences: number;
  yesterdaySentences: number;
  todaySpecificity: number;
  yesterdaySpecificity: number;
}

export interface WeeklyReport {
  entries: number;
  activeDays: number;
  avgChars: number;
  topCategory: string;
  strengths: string;
  challenge: string;
  nextAction: string;
}

const DAILY_PROMPTS = [
  '今日の出来事を「事実」と「解釈」に分けて3行で書く',
  'いま感じているモヤモヤを、原因と感情に分けて言語化する',
  '最近の小さな失敗を「学び」に変換して1分でまとめる',
  '誰かに伝えたいことをPREPで4文にする',
  '今日の判断を1つ選び、「なぜ？」を3回掘る',
  '抽象語を1つ選び、具体例を2つ添えて説明する',
  '今日うれしかったことを、行動と感情で書き分ける',
];

const BADGES: DailyBadge[] = [
  { id: 'starter', title: 'First Step', description: '今日の1本を完了' },
  { id: 'concise', title: 'Concise Mind', description: '150字以内で要点を整理' },
  { id: 'deep', title: 'Deep Diver', description: '400字以上で深掘り' },
  { id: 'tagger', title: 'Tag Master', description: 'タグを2個以上活用' },
  { id: 'hard', title: 'Hard Runner', description: 'ハードモードを完走' },
  { id: 'evidence', title: 'Evidence Hunter', description: '数字や根拠語を豊富に使用' },
  { id: 'structured', title: 'Structured Thinker', description: '文を積み上げて論点を展開' },
];

const SPECIFICITY_HINTS = ['例えば', '具体', '実際', 'たとえば', '数値', '原因', '結果', '根拠', 'つまり'];

export function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getTodayMiniPrompt(date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
  return DAILY_PROMPTS[Math.abs(dayIndex) % DAILY_PROMPTS.length];
}

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(/[。.!?！？\n]+/).filter(Boolean);
  return parts.length;
}

export function calcSpecificityScore(text: string): number {
  if (!text.trim()) return 0;
  const numberHits = (text.match(/[0-9０-９]/g) || []).length;
  const quoteHits = (text.match(/[「」『』"']/g) || []).length;
  const hintHits = SPECIFICITY_HINTS.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
  return numberHits + quoteHits + hintHits;
}

export function getTodayAndYesterdayComparison(entries: EntryLike[], now = new Date()): CompareSnapshot {
  const todayKey = getTodayKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getTodayKey(yesterday);

  const todayText = entries
    .filter((e) => e.createdAt.startsWith(todayKey))
    .map((e) => e.content)
    .join('\n');
  const yesterdayText = entries
    .filter((e) => e.createdAt.startsWith(yesterdayKey))
    .map((e) => e.content)
    .join('\n');

  return {
    todayChars: todayText.length,
    yesterdayChars: yesterdayText.length,
    todaySentences: countSentences(todayText),
    yesterdaySentences: countSentences(yesterdayText),
    todaySpecificity: calcSpecificityScore(todayText),
    yesterdaySpecificity: calcSpecificityScore(yesterdayText),
  };
}

export function decideDailyBadge(input: {
  content: string;
  tags: string[];
  isHardMode: boolean;
  imageUrl?: string | null;
  contextText?: string | null;
}): DailyBadge {
  if (input.isHardMode) return BADGES[4];
  if (calcSpecificityScore(input.content) >= 6) return BADGES[5];
  if (countSentences(input.content) >= 6) return BADGES[6];
  if (input.tags.length >= 2) return BADGES[3];
  if (input.content.length >= 400) return BADGES[2];
  if (input.content.length <= 150) return BADGES[1];
  return BADGES[0];
}

export function getWeekKey(date = new Date()): string {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const day = current.getDay() || 7;
  current.setDate(current.getDate() + 4 - day);
  const yearStart = new Date(current.getFullYear(), 0, 1);
  const week = Math.ceil((((current.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${current.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function getAvailableFreeze(now = new Date()): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem('verbalize_freeze_state');
  const currentWeek = getWeekKey(now);

  if (!raw) return 1;
  try {
    const parsed = JSON.parse(raw) as { weekKey: string; used: boolean };
    if (parsed.weekKey !== currentWeek) return 1;
    return parsed.used ? 0 : 1;
  } catch {
    return 1;
  }
}

export function markFreezeUsed(now = new Date()): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    'verbalize_freeze_state',
    JSON.stringify({ weekKey: getWeekKey(now), used: true })
  );
}

export function generateWeeklyReport(entries: EntryLike[], now = new Date()): WeeklyReport {
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const weekly = entries.filter((e) => {
    const d = new Date(e.createdAt);
    return d >= start && d <= now;
  });

  const activeDaySet = new Set(weekly.map((e) => e.createdAt.slice(0, 10)));
  const avgChars = weekly.length === 0 ? 0 : Math.round(weekly.reduce((sum, e) => sum + e.content.length, 0) / weekly.length);
  const categoryCounts: Record<string, number> = {};
  weekly.forEach((e) => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'なし';

  const strengths =
    weekly.length >= 5
      ? '継続力が高く、習慣化が進んでいます。'
      : avgChars >= 250
        ? '1回ごとの深さがあり、思考を丁寧に展開できています。'
        : '短時間でも着手できており、再開力が高いです。';

  const challenge =
    activeDaySet.size <= 2
      ? '実施日が偏り気味です。短時間モードで日数を増やす余地があります。'
      : calcSpecificityScore(weekly.map((e) => e.content).join('\n')) < 12
        ? '具体語・根拠の追加で、説得力をさらに伸ばせます。'
        : '次は構成（導入→根拠→結論）を意識すると伸びます。';

  const nextAction =
    topCategory === 'なし'
      ? '明日は3分モードで1本だけ書いて再起動しましょう。'
      : `来週は「${topCategory}」を2回、他カテゴリを1回入れてバランスを取りましょう。`;

  return {
    entries: weekly.length,
    activeDays: activeDaySet.size,
    avgChars,
    topCategory,
    strengths,
    challenge,
    nextAction,
  };
}

export function suggestNextStep(input: {
  score?: number;
  suggestions?: string[];
  category?: string;
}): string {
  if ((input.score || 0) >= 85) {
    return '次回は「逆の立場」から同じテーマを3文で再構成してみましょう。';
  }
  if ((input.score || 0) >= 70) {
    return '次回は具体例を1つ追加し、結論を先頭1文で明示してみましょう。';
  }
  if (input.suggestions && input.suggestions.length > 0) {
    return `次回は「${input.suggestions[0]}」だけに絞って練習しましょう。`;
  }
  if (input.category) {
    return `次回は「${input.category}」をもう1本、3分モードで継続してみましょう。`;
  }
  return '次回は3分モードで1本だけ書いて、まず継続を優先しましょう。';
}
