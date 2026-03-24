'use client';

import Link from 'next/link';
import { ArrowLeft, Lightbulb, Target, Brain, BookOpen, Zap, Sparkles, Award, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingParticles } from '@/components/luxury/FloatingParticles';

const tips = [
  {
    icon: Target,
    title: '「いい」を避ける',
    description: '「いい人」「いい感じ」などの「いい」は具体的ではありません。代わりに「親切」「穏やか」「心地よい」など、より具体的な言葉を使いましょう。',
    category: '基本'
  },
  {
    icon: Brain,
    title: '5W1Hを意識する',
    description: 'Who（誰）、What（何）、When（いつ）、Where（どこ）、Why（なぜ）、How（どうやって）を意識すると、具体的な文章になります。',
    category: '基本'
  },
  {
    icon: BookOpen,
    title: '比喩を使う',
    description: '難しい概念を身近なものに例えると、相手に伝わりやすくなります。「データのバックアップ」を「デジタル版の時間旅行」と例えるなど。',
    category: '発想力'
  },
  {
    icon: Zap,
    title: 'なぜを5回繰り返す',
    description: '問題の表面だけでなく、根本原因を探るために「なぜ？」を5回繰り返します。そうすることで、より深い洞察が得られます。',
    category: '思考整理'
  },
  {
    icon: Lightbulb,
    title: '数字を使う',
    description: '「たくさん」ではなく「30分」「3回」「80%」など、数字を使うと具体的になります。',
    category: '基本'
  },
  {
    icon: Target,
    title: '感情を言語化する',
    description: '「イライラした」だけでなく、「期待していた結果が得られず、納得がいかなかった」など、感情の理由も表現しましょう。',
    category: '感情'
  },
  {
    icon: Brain,
    title: 'PREP法を使う',
    description: '意見を伝えるときは「結論(Point)→理由(Reason)→具体例(Example)→結論(Point)」の順序で構成すると、わかりやすくなります。',
    category: '伝え方'
  },
  {
    icon: Zap,
    title: '抽象度を変える',
    description: '「つまり何？」と問うことで、情報を価値あるメッセージに変換できます。現象→事実→解釈→教訓の順序で思考を深めましょう。',
    category: '思考整理'
  },
  {
    icon: Lightbulb,
    title: '観察と推論を分ける',
    description: '「見えたこと」と「考えたこと」を明確に分けることで、思考のクオリティが上がります。',
    category: '仮説思考'
  },
  {
    icon: BookOpen,
    title: 'シンプルに書く',
    description: '難しい言葉や専門用語を避け、誰にでもわかる言葉で書くように心がけましょう。',
    category: '伝え方'
  }
];

const categoryColors: Record<string, string> = {
  基本: 'bg-blue-100 text-blue-800',
  発想力: 'bg-purple-100 text-purple-800',
  思考整理: 'bg-green-100 text-green-800',
  感情: 'bg-orange-100 text-orange-800',
  伝え方: 'bg-pink-100 text-pink-800',
  仮説思考: 'bg-yellow-100 text-yellow-800',
};

const categoryIcons: Record<string, LucideIcon> = {
  基本: Target,
  発想力: Sparkles,
  思考整理: Brain,
  感情: Lightbulb,
  伝え方: BookOpen,
  仮説思考: Zap,
};

export default function TipsPage() {
  const categories = ['基本', '発想力', '思考整理', '感情', '伝え方', '仮説思考'];

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
              <h1 className="text-2xl font-serif font-semibold text-foreground">言語化のコツ</h1>
              <p className="text-sm text-muted-foreground">思考を言葉に変えるスキルを身につける</p>
            </div>
          </div>
        </header>

        {/* What is Verbalize */}
        <div className="vintage-card p-8 mb-8 relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="vintage-icon-container accent">
                <Sparkles className="w-6 h-6 text-background" />
              </div>
              <h2 className="text-2xl font-serif font-semibold text-foreground">言語化とは？</h2>
            </div>
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              言語化とは、頭の中にある曖昧な思考や感情を、具体的な言葉で表現することです。
              このトレーニングを続けることで、以下の効果が期待できます。
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                '思考が整理され、判断力が向上する',
                '他者とのコミュニケーションがスムーズになる',
                '自分の感情や価値観が明確になる',
                '文章力やプレゼンテーション能力が上がる',
                '問題解決能力が向上する'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips by Category */}
        {categories.map((category, catIndex) => {
          const categoryTips = tips.filter(t => t.category === category);
          if (categoryTips.length === 0) return null;

          const CategoryIcon = categoryIcons[category];

          return (
            <div key={category} className="mb-8 animate-slide-up" style={{ animationDelay: `${catIndex * 0.1}s` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`vintage-icon-container ${categoryColors[category]}`}>
                  <CategoryIcon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground">{category}</h3>
              </div>
              <div className="space-y-3">
                {categoryTips.map((tip, index) => (
                  <div
                    key={index}
                    className="vintage-card p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`vintage-icon-container shrink-0 ${categoryColors[category]}`}>
                        <tip.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-serif font-semibold text-foreground mb-2">{tip.title}</h4>
                        <p className="text-sm text-foreground/70 leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Consistency Card */}
        <div className="vintage-card p-8 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="vintage-icon-container accent mx-auto mb-4">
            <Award className="w-8 h-8 text-background" />
          </div>
          <h3 className="font-serif font-semibold text-xl text-foreground mb-3">継続が鍵です</h3>
          <p className="text-foreground/70 leading-relaxed mb-6">
            言語化は筋トレと同じで、毎日少しずつ続けることで効果が現れます。
            1日5分〜10分のトレーニングを習慣にしましょう。連続記録日数を増やすことが目標の一つです！
          </p>
          <Link href="/">
            <Button className="vintage-button-primary">
              今すぐトレーニングを開始
            </Button>
          </Link>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-border bg-card/50 z-10">
        {/* Quick Navigation */}
        <div className="vintage-card p-6 mb-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">カテゴリー</h3>
          <nav className="space-y-2">
            {categories.map((category) => {
              const CategoryIcon = categoryIcons[category];
              return (
                <a
                  key={category}
                  href={`#category-${category}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-card hover:text-foreground transition-all duration-200"
                >
                  <CategoryIcon className="w-4 h-4" />
                  <span className="text-sm">{category}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Stats */}
        <div className="vintage-card p-6 mb-6">
          <h3 className="font-serif font-semibold mb-4 text-foreground">統計</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">総コツ数</p>
              <p className="text-2xl font-serif font-semibold text-primary">{tips.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">カテゴリー</p>
              <p className="text-2xl font-serif font-semibold text-primary">{categories.length}</p>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="vintage-card p-6">
          <Sparkles className="w-6 h-6 text-accent mx-auto mb-4" />
          <p className="font-serif text-sm text-foreground/80 italic text-center leading-relaxed">
            「言葉は、思考を可視化する鏡です。鏡を磨き続けることで、自分の思考がより明確に見えてきます。」
          </p>
        </div>
      </aside>
    </div>
  );
}
