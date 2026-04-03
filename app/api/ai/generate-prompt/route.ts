import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

type PromptType =
  | 'abduction'
  | 'synapse'
  | 'metaphor'
  | 'abduction-lens'
  | 'whysos'
  | 'sowhat'
  | '5w1h'
  | 'prep'
  | 'fogcatcher'
  | 'analogy'
  | 'metaphor-coach';

type StepDef = { step: number; label: string; placeholder: string };

type GeneratedResult = {
  phenomenon?: string;
  word1?: string;
  word2?: string;
  concept?: string;
  description?: string;
  imageUrl?: string;
  question?: string;
  prompts?: string[];
  steps?: StepDef[];
};

const apiKey = process.env.GOOGLE_AI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const textModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' }) : null;
const imageModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' }) : null;

function extractJsonObject(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean);
}

function toStepArray(v: unknown): StepDef[] {
  if (!Array.isArray(v)) return [];
  const out: StepDef[] = [];
  v.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;
    const obj = item as Record<string, unknown>;
    const label = typeof obj.label === 'string' ? obj.label : `Step ${idx + 1}`;
    const placeholder = typeof obj.placeholder === 'string' ? obj.placeholder : 'ここに記入';
    const step = typeof obj.step === 'number' ? obj.step : idx + 1;
    out.push({ step, label, placeholder });
  });
  return out;
}

async function askText(prompt: string): Promise<string> {
  if (!textModel) return '';
  try {
    const res = await textModel.generateContent(prompt);
    return res.response.text().trim();
  } catch {
    return '';
  }
}

async function generateAbduction(): Promise<GeneratedResult> {
  const fallback: GeneratedResult = {
    phenomenon: '真夜中の会議室。誰もいないのに、朝には議事録だけが更新されている。',
  };
  if (!textModel) return fallback;

  const text = await askText(
    '奇妙で仮説が複数立つ現象を1つ。日本語で1-2文。現象のみ。'
  );
  return { phenomenon: text || fallback.phenomenon };
}

async function generateSynapse(): Promise<GeneratedResult> {
  const fallback: GeneratedResult = { word1: '雨', word2: '契約書' };
  if (!textModel) return fallback;

  const text = await askText(
    '無関係な日本語名詞2語を「語1|語2」の形式で1行のみ出力。'
  );
  const parts = text.split('|').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { word1: parts[0], word2: parts[1] };

  const quote = text.match(/「([^」]+)」.*「([^」]+)」/);
  if (quote) return { word1: quote[1], word2: quote[2] };
  return fallback;
}

async function generateMetaphor(): Promise<GeneratedResult> {
  const fallback: GeneratedResult = { concept: '生成AIのエージェント化' };
  if (!textModel) return fallback;
  const text = await askText('比喩で説明しがいのある抽象概念を日本語で1つだけ。');
  return { concept: text || fallback.concept };
}

async function generateAbductionLens(): Promise<GeneratedResult> {
  const fallbackDescription = '終電後のホーム。誰もいないのに、ベンチだけが濡れている。';
  let description = fallbackDescription;
  let imageUrl = 'https://picsum.photos/seed/abduction-lens/1200/800?grayscale';

  if (textModel) {
    const text = await askText('不気味で推理余地のある決定的瞬間を1-2文で描写。描写のみ。');
    if (text) description = text;
  }

  if (imageModel) {
    try {
      const imgRes = await imageModel.generateContent(
        `次の描写をフォトリアルに画像化。文字は入れない。\n${description}`
      );
      const candidate = imgRes.response.candidates?.[0];
      const partWithInline = candidate?.content?.parts?.find((p) => 'inlineData' in p);
      const inlineData = (partWithInline as { inlineData?: { mimeType?: string; data?: string } } | undefined)
        ?.inlineData;
      if (inlineData?.data && inlineData?.mimeType) {
        imageUrl = `data:${inlineData.mimeType};base64,${inlineData.data}`;
      }
    } catch {
      // keep fallback image URL
    }
  }

  return { description, imageUrl };
}

async function generateListPrompt(
  instruction: string,
  fallbackPrompts: string[],
  fallbackSteps: StepDef[]
): Promise<GeneratedResult> {
  if (!textModel) {
    return { prompts: fallbackPrompts, steps: fallbackSteps };
  }

  const text = await askText(
    `${instruction}\nJSON形式で {"prompts":["..."],"steps":[{"step":1,"label":"...","placeholder":"..."}]} のみ出力。`
  );
  const parsed = extractJsonObject(text);
  const prompts = toStringArray(parsed?.prompts).slice(0, 3);
  const steps = toStepArray(parsed?.steps);
  return {
    prompts: prompts.length > 0 ? prompts : fallbackPrompts,
    steps: steps.length > 0 ? steps : fallbackSteps,
  };
}

async function generateAnalogy(): Promise<GeneratedResult> {
  const fallbackPrompts = ['オンボーディングの遅さ|料理の仕込み'];
  const fallbackSteps: StepDef[] = [
    { step: 1, label: '課題の分解', placeholder: '課題を3要素に分解してください' },
    { step: 2, label: '大テーマの原理', placeholder: '大テーマ側の成功原理を挙げてください' },
    { step: 3, label: '対応づけ', placeholder: '要素どうしを対応づけてください' },
    { step: 4, label: '転用案', placeholder: '具体的に試せる案を2つ書いてください' },
    { step: 5, label: '検証方法', placeholder: '効果検証の指標を決めてください' },
  ];
  return generateListPrompt(
    'アナロジートレーニング用に「課題|大テーマ」を1つ生成。例: 採用改善|営業パイプライン。',
    fallbackPrompts,
    fallbackSteps
  );
}

async function generateMetaphorCoach(): Promise<GeneratedResult> {
  const fallbackPrompts = ['信頼'];
  const fallbackSteps: StepDef[] = [
    { step: 1, label: '核となる意味', placeholder: 'この概念の本質を一文で定義' },
    { step: 2, label: '感覚の抽出', placeholder: '感触・温度・動きなどの感覚語を列挙' },
    { step: 3, label: '候補比喩', placeholder: '比喩候補を3つ書く' },
    { step: 4, label: '絞り込み', placeholder: '最も伝わる1つを選ぶ理由を書く' },
    { step: 5, label: '仕上げ', placeholder: '20-40字で比喩表現を完成させる' },
  ];
  return generateListPrompt(
    'メタファーコーチ用に単語テーマを1つ生成し、5ステップ練習を作成。',
    fallbackPrompts,
    fallbackSteps
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { type?: string };
    const type = (body.type || '') as PromptType;

    let result: GeneratedResult;
    switch (type) {
      case 'abduction':
        result = await generateAbduction();
        break;
      case 'synapse':
        result = await generateSynapse();
        break;
      case 'metaphor':
        result = await generateMetaphor();
        break;
      case 'abduction-lens':
        result = await generateAbductionLens();
        break;
      case 'whysos':
        result = await generateListPrompt(
          '「なぜなぜ分析」向けに深掘りしやすい課題を3つ生成。',
          ['会議が長引く理由', 'タスク見積もりが甘くなる原因', '先延ばししてしまう背景'],
          [
            { step: 1, label: '1回目「なぜ？」', placeholder: '表面的な原因を書く' },
            { step: 2, label: '2回目「なぜ？」', placeholder: '一段深い原因を書く' },
            { step: 3, label: '3回目「なぜ？」', placeholder: '構造的な原因を書く' },
            { step: 4, label: '4回目「なぜ？」', placeholder: '行動レベルの原因を書く' },
            { step: 5, label: '5回目「なぜ？」', placeholder: '根本原因を一文でまとめる' },
          ]
        );
        break;
      case 'sowhat':
        result = await generateListPrompt(
          '「So What」向けに抽象化しやすい事実・現象を3つ生成。',
          ['新機能の利用率が伸びない', '離職率が四半期で増えた', '顧客レビューが二極化している'],
          [
            { step: 1, label: '1回目「つまり何？」', placeholder: '直接的な意味を書く' },
            { step: 2, label: '2回目「つまり何？」', placeholder: '一段抽象化した意味を書く' },
            { step: 3, label: '3回目「つまり何？」', placeholder: 'パターンとしての示唆を書く' },
            { step: 4, label: '4回目「つまり何？」', placeholder: '意思決定への影響を書く' },
            { step: 5, label: '5回目「つまり何？」', placeholder: '行動指針を一文で書く' },
          ]
        );
        break;
      case '5w1h':
        result = await generateListPrompt(
          '5W1H整理が必要な長文ケースを1つ生成。',
          ['昨日の障害対応ログが長文化し、誰が何をしたか追えなくなっている。'],
          [
            { step: 1, label: 'When（いつ）', placeholder: 'いつ起きたか' },
            { step: 2, label: 'Where（どこ）', placeholder: 'どこで起きたか' },
            { step: 3, label: 'Who（誰）', placeholder: '誰が関与したか' },
            { step: 4, label: 'What（何）', placeholder: '何が起きたか' },
            { step: 5, label: 'Why（なぜ）', placeholder: 'なぜ起きたか' },
            { step: 6, label: 'How（どうやって）', placeholder: 'どう対処したか/するか' },
          ]
        );
        break;
      case 'prep':
        result = await generateListPrompt(
          'PREP法で説明しがいのある主張テーマを3つ生成。',
          ['リモートワークは生産性を上げるか', '新人育成にAIは有効か', '会議は30分で十分か'],
          [
            { step: 1, label: 'Point（結論）', placeholder: '主張を先に書く' },
            { step: 2, label: 'Reason（理由）', placeholder: '理由を書く' },
            { step: 3, label: 'Example（具体例）', placeholder: '具体例を書く' },
            { step: 4, label: 'Point（再結論）', placeholder: '結論を締める' },
          ]
        );
        break;
      case 'fogcatcher':
        result = await generateListPrompt(
          '内省しやすい抽象テーマを3つ生成。',
          ['最近の違和感', '決断を先延ばししていること', '本当は大事にしたい価値観'],
          []
        );
        result.question = '以下から書き出したいテーマを選択してください。';
        break;
      case 'analogy':
        result = await generateAnalogy();
        break;
      case 'metaphor-coach':
        result = await generateMetaphorCoach();
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}
