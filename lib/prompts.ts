import { Prompt } from '@/types';

// Fixed prompts (30 total)
export const fixedPrompts: Prompt[] = [
  // 🎯 基本編 (10)
  {
    id: 'basic-1',
    category: 'basic',
    type: 'fixed',
    title: '「いい」禁止の自己紹介',
    description: '「いい人です」など「いい」を使わず、自分を3文で表現（3分）',
    timeLimit: 3,
    order: 1
  },
  {
    id: 'basic-2',
    category: 'basic',
    type: 'fixed',
    title: '「忙しい」分解',
    description: '「最近忙しい」を、何にどれくらい忙しいのか3つに分解（5分）',
    timeLimit: 5,
    order: 2
  },
  {
    id: 'basic-3',
    category: 'basic',
    type: 'fixed',
    title: '「楽しい」の5要素',
    description: '昨日「楽しかったこと」を、場所・人・こと・理由・感情で整理（5分）',
    timeLimit: 5,
    order: 3
  },
  {
    id: 'basic-4',
    category: 'basic',
    type: 'fixed',
    title: '「なんとなく」解体',
    description: '最近「なんとなく」したことを書き、無意識の判断基準を探る（5分）',
    timeLimit: 5,
    order: 4
  },
  {
    id: 'basic-5',
    category: 'basic',
    type: 'fixed',
    title: '形容詞排除の描写',
    description: '「美しい」「素晴らしい」を使わず、今の景色を描写（3分）',
    timeLimit: 3,
    order: 5
  },
  {
    id: 'basic-6',
    category: 'basic',
    type: 'fixed',
    title: '3点主義',
    description: '「最近の悩み」を必ず3つのポイントで書く（5分）',
    timeLimit: 5,
    order: 6
  },
  {
    id: 'basic-7',
    category: 'basic',
    type: 'fixed',
    title: '「面白い」具体化',
    description: '最近見た「面白い動画/記事」を、どの点が面白かったか具体的に（5分）',
    timeLimit: 5,
    order: 7
  },
  {
    id: 'basic-8',
    category: 'basic',
    type: 'fixed',
    title: '「つまらない」理由',
    description: '最近「つまらなかったこと」を、なぜそう感じたか深掘り（5分）',
    timeLimit: 5,
    order: 8
  },
  {
    id: 'basic-9',
    category: 'basic',
    type: 'fixed',
    title: '数字を使う',
    description: '今日の1日を、できるだけ数字を使って表現（3分）',
    timeLimit: 3,
    order: 9
  },
  {
    id: 'basic-10',
    category: 'basic',
    type: 'fixed',
    title: '比喩で表現',
    description: '「自分の性格」を、身近なもので例えて説明（5分）',
    timeLimit: 5,
    order: 10
  },

  // 🧠 思考・感情編 (10)
  {
    id: 'emotion-1',
    category: 'emotion',
    type: 'fixed',
    title: 'イライラの3レベル',
    description: '最近イライラしたこと（レベル1：表面的 → レベル2：感情 → レベル3：根本）（5分）',
    timeLimit: 5,
    order: 11
  },
  {
    id: 'emotion-2',
    category: 'emotion',
    type: 'fixed',
    title: '嬉しさの3要素',
    description: '最近嬉しかったことを「誰が・何を・どう感じた」で整理（3分）',
    timeLimit: 3,
    order: 12
  },
  {
    id: 'emotion-3',
    category: 'emotion',
    type: 'fixed',
    title: '不安の正体',
    description: '今不安に思っていることと、その不安が何に由来するか（5分）',
    timeLimit: 5,
    order: 13
  },
  {
    id: 'emotion-4',
    category: 'emotion',
    type: 'fixed',
    title: '後悔と言語化',
    description: '後悔していることを、どうすればよかったか過去形で（5分）',
    timeLimit: 5,
    order: 14
  },
  {
    id: 'emotion-5',
    category: 'emotion',
    type: 'fixed',
    title: '感謝の言語化',
    description: '感謝したい人と、何をしてくれたか、どう感じたか（5分）',
    timeLimit: 5,
    order: 15
  },
  {
    id: 'emotion-6',
    category: 'emotion',
    type: 'fixed',
    title: '今のモチベーション',
    description: '今の仕事のモチベーション状態と、その理由（3分）',
    timeLimit: 3,
    order: 16
  },
  {
    id: 'emotion-7',
    category: 'emotion',
    type: 'fixed',
    title: '今のエネルギー',
    description: '今のエネルギー状態（高・中・低）と、何が影響しているか（3分）',
    timeLimit: 3,
    order: 17
  },
  {
    id: 'emotion-8',
    category: 'emotion',
    type: 'fixed',
    title: '「やりたいこと」言語化',
    description: '今やりたいこと3つと、なぜやりたいか（5分）',
    timeLimit: 5,
    order: 18
  },
  {
    id: 'emotion-9',
    category: 'emotion',
    type: 'fixed',
    title: '「やりたくないこと」言語化',
    description: '今やりたくないこと3つと、なぜか（5分）',
    timeLimit: 5,
    order: 19
  },
  {
    id: 'emotion-10',
    category: 'emotion',
    type: 'fixed',
    title: '理想の自分',
    description: '1年後の理想の自分と、今から始めるべきこと（5分）',
    timeLimit: 5,
    order: 20
  },

  // 💼 仕事・ビジネス編 (10)
  {
    id: 'work-1',
    category: 'work',
    type: 'fixed',
    title: '今日の3つの目標',
    description: '今日終わらせるべき3つのタスクと優先順位（3分）',
    timeLimit: 3,
    order: 21
  },
  {
    id: 'work-2',
    category: 'work',
    type: 'fixed',
    title: '昨日の振り返り',
    description: '昨日達成できたことと、改善点（5分）',
    timeLimit: 5,
    order: 22
  },
  {
    id: 'work-3',
    category: 'work',
    type: 'fixed',
    title: '今の課題',
    description: '現在直面している仕事の課題と、背景・現状・解決案（5分）',
    timeLimit: 5,
    order: 23
  },
  {
    id: 'work-4',
    category: 'work',
    type: 'fixed',
    title: '自分の強み',
    description: '自分の強み3つと、それぞれの具体エピソード（5分）',
    timeLimit: 5,
    order: 24
  },
  {
    id: 'work-5',
    category: 'work',
    type: 'fixed',
    title: '1分自己紹介',
    description: '自分を1分で説明（職歴・強み・趣味）（3分）',
    timeLimit: 3,
    order: 25
  },
  {
    id: 'work-6',
    category: 'work',
    type: 'fixed',
    title: 'プレゼンテーションの要約',
    description: '今度説明したいことを、結論・理由・具体例で（5分）',
    timeLimit: 5,
    order: 26
  },
  {
    id: 'work-7',
    category: 'work',
    type: 'fixed',
    title: 'メールの言語化',
    description: '送りたいメールの内容を、相手にすぐわかるように（3分）',
    timeLimit: 3,
    order: 27
  },
  {
    id: 'work-8',
    category: 'work',
    type: 'fixed',
    title: '会議の発言',
    description: '次の会議で発言したいことと、その背景（5分）',
    timeLimit: 5,
    order: 28
  },
  {
    id: 'work-9',
    category: 'work',
    type: 'fixed',
    title: '上司に伝えたいこと',
    description: '上司に相談したいことと、希望するアクション（5分）',
    timeLimit: 5,
    order: 29
  },
  {
    id: 'work-10',
    category: 'work',
    type: 'fixed',
    title: '今日の学び',
    description: '今日新しく学んだこと1つと、どう活かせるか（3分）',
    timeLimit: 3,
    order: 30
  }
];

// Dynamic prompt configurations
export const dynamicPrompts: Record<string, { title: string; description: string; timeLimit: number }> = {
  abduction: {
    title: 'アブダクション道場',
    description: '奇妙な現象に対して、考えられる仮説を3つ挙げ、それぞれの根拠を説明',
    timeLimit: 7
  },
  synapse: {
    title: 'Synapse Match',
    description: '無関係な2つの言葉から、共通点を2分以内で10個ひねり出す',
    timeLimit: 3
  },
  metaphor: {
    title: 'Metaphor Maker',
    description: '難しい概念を、バカでもわかるたとえ話で説明',
    timeLimit: 5
  },
  fogcatcher: {
    title: 'Fog Catcher（思考の霧払い）',
    description: '頭の中にあるグチャグチャな悩みや考えをそのまま書き出すフリーライティング（3分）',
    timeLimit: 3
  },
  whysos: {
    title: 'Why So（なぜなぜ分析）',
    description: '一つの課題に対して「なぜ？」を5回突きつけて根本原因を探る',
    timeLimit: 5
  },
  sowhat: {
    title: 'So What?（つまり何？）',
    description: '事実に対して「つまりどういうこと？」と問い、抽象度の階段を登る',
    timeLimit: 5
  },
  '5w1h': {
    title: '5W1H 展開',
    description: '情報を6つの要素に整理して、具体的なアクションプランに落とし込む',
    timeLimit: 5
  },
  prep: {
    title: 'PREP法',
    description: '意見を「結論・理由・具体例・結論」で構成',
    timeLimit: 5
  },
  'abduction-lens': {
    title: 'Abduction Lens',
    description: '「決定的瞬間」のシーンに対し、[観察事実]・[仮説]・[根拠]を記述',
    timeLimit: 7
  },
  analogy: {
    title: 'Analogy Training（アナロジートレーニング）',
    description: '異なる領域のパターンを借りて、問題解決のヒントを見つける',
    timeLimit: 7
  },
  'metaphor-coach': {
    title: 'Metaphor Coach（メタファーコーチ）',
    description: '5ステップで比喩表現を作る力を鍛える',
    timeLimit: 10
  }
};

// Get random prompt from category
export function getRandomPrompt(category?: string): Prompt {
  let filtered = fixedPrompts;
  if (category && category !== 'dynamic') {
    filtered = fixedPrompts.filter(p => p.category === category);
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// Get daily prompt based on date
export function getDailyPrompt(): Prompt {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % fixedPrompts.length;
  return fixedPrompts[index];
}
