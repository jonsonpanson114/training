'use client';

import Link from 'next/link';
import { ArrowLeft, Lightbulb, Target, Brain, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  基本: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  発想力: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  思考整理: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  感情: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  伝え方: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  仮説思考: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function TipsPage() {
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
          <h1 className="text-xl font-semibold">言語化のコツ</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle className="text-2xl">言語化とは？</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              言語化とは、頭の中にある曖昧な思考や感情を、具体的な言葉で表現することです。
              このトレーニングを続けることで、以下の効果が期待できます。
            </p>
            <ul className="mt-4 space-y-2">
              <li>• 思考が整理され、判断力が向上する</li>
              <li>• 他者とのコミュニケーションがスムーズになる</li>
              <li>• 自分の感情や価値観が明確になる</li>
              <li>• 文章力やプレゼンテーション能力が上がる</li>
              <li>• 問題解決能力が向上する</li>
            </ul>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4">言語化のコツ</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${categoryColors[tip.category] || 'bg-gray-100'}`}>
                    <tip.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[tip.category] || 'bg-gray-100'}`}>
                      {tip.category}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Zap className="h-8 w-8 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">継続が鍵です</h3>
                <p className="text-sm text-muted-foreground">
                  言語化は筋トレと同じで、毎日少しずつ続けることで効果が現れます。
                  1日5分〜10分のトレーニングを習慣にしましょう。連続記録日数を増やすことが目標の一つです！
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
