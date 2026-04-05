import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

const apiKey = process.env.GOOGLE_AI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const textModel = genAI ? genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }) : null;
const imageModel = genAI ? genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" }) : null;

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
  return v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
}

function toStepArray(v: unknown): StepDef[] {
  if (!Array.isArray(v)) return [];
  const out: StepDef[] = [];
  v.forEach((item, idx) => {
    if (!item || typeof item !== "object") return;
    const obj = item as Record<string, unknown>;
    const label = typeof obj.label === "string" ? obj.label : `Step ${idx + 1}`;
    const placeholder = typeof obj.placeholder === "string" ? obj.placeholder : "ここに記入";
    const step = typeof obj.step === "number" ? obj.step : idx + 1;
    out.push({ step, label, placeholder });
  });
  return out;
}

async function askText(prompt: string): Promise<string> {
  if (!textModel) return "";
  try {
    const res = await textModel.generateContent(prompt);
    return res.response.text().trim();
  } catch {
    return "";
  }
}

async function generateAbduction(): Promise<GeneratedResult> {
  const fallback: GeneratedResult = {
    phenomenon: "真夜中のオフィス。誰もいないフロアで、すべてのシュレッダーが同時に動き出した。",
  };
  if (!textModel) return fallback;
  const text = await askText("奇妙で不可解な、仮説を立て甲斐のある現象を1つ。日本語で1-2文。現象のみ出力。");
  return { phenomenon: text || fallback.phenomenon };
}

async function generateSynapse(): Promise<GeneratedResult> {
  const fallback: GeneratedResult = { word1: "ピアノ", word2: "潜水艦" };
  if (!textModel) return fallback;
  const text = await askText("全く無関係な日本語の名詞2つを「語1|語2」の形式で1行のみ出力。例: 鉛筆|ブラックホール");
  const parts = text.split("|").map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { word1: parts[0], word2: parts[1] };
  return fallback;
}

async function generateMetaphor(): Promise<GeneratedResult> {
  const fallback: GeneratedResult = { concept: "ダークマター" };
  if (!textModel) return fallback;
  const text = await askText("比喩で説明しがいのある、少し難解で抽象的な概念を日本語で1つ。概念名のみ。");
  return { concept: text || fallback.concept };
}

async function generateAbductionLens(): Promise<GeneratedResult> {
  const fallbackDescription = "豪雨のバス停。ベンチには誰もおらず、新品のウェディングドレスだけが濡れたまま放置されている。";
  let description = fallbackDescription;
  let imageUrl = "https://picsum.photos/seed/abduction/1200/800";

  if (textModel) {
    const text = await askText("不気味でドラマチックな、推理の余地がある『決定的瞬間の描写』を1-2文で作成せよ。描写のみ出力。");
    if (text) description = text;
  }

  if (imageModel) {
    try {
      const imgRes = await imageModel.generateContent(`Create a cinematic, high-quality mysterious photo based on this scene. No text in image. Scene: ${description}`);
      const cand = imgRes.response.candidates?.[0];
      const part = cand?.content?.parts?.find(p => "inlineData" in p);
      const data = (part as any)?.inlineData;
      if (data?.data && data?.mimeType) {
        imageUrl = `data:${data.mimeType};base64,${data.data}`;
      }
    } catch {}
  }

  return {
    description,
    imageUrl,
    steps: [
      { step: 1, label: "❶ 観察事実", placeholder: "目に見える事実を書き出せ" },
      { step: 2, label: "❷ 飛躍的仮説", placeholder: "裏で何が起きていたのか？" },
      { step: 3, label: "❸ 推論の連結", placeholder: "なぜそう思ったのか？" }
    ]
  };
}

async function generateListPrompt(
  instruction: string,
  fallbackPrompts: string[],
  fallbackSteps: StepDef[]
): Promise<GeneratedResult> {
  if (!textModel) return { prompts: fallbackPrompts, steps: fallbackSteps, description: fallbackPrompts[0] };
  const prompt = `${instruction}\nJSON形式で必ず出力: {"prompts":["..."],"steps":[{"step":1,"label":"...","placeholder":"..."}]}`;
  const text = await askText(prompt);
  const parsed = extractJsonObject(text);
  const prompts = toStringArray(parsed?.prompts).slice(0, 3);
  const steps = toStepArray(parsed?.steps);
  return {
    prompts: prompts.length > 0 ? prompts : fallbackPrompts,
    steps: steps.length > 0 ? steps : fallbackSteps,
    description: prompts[0] || fallbackPrompts[0],
    question: "トレーニングのお題を選択してください"
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { type?: string };
    const type = (body.type || "") as PromptType;
    let result: GeneratedResult;

    switch (type) {
      case "abduction": result = await generateAbduction(); break;
      case "synapse": result = await generateSynapse(); break;
      case "metaphor": result = await generateMetaphor(); break;
      case "abduction-lens": result = await generateAbductionLens(); break;
      case "whysos":
        result = await generateListPrompt("「なぜなぜ分析」向け課題を3つ。", ["会議が長い", "やる気が出ない", "ミスが多い"], [
          { step: 1, label: "なぜ？(1)", placeholder: "直接的な原因" },
          { step: 2, label: "なぜ？(2)", placeholder: "背景" },
          { step: 3, label: "なぜ？(3)", placeholder: "構造" },
          { step: 4, label: "なぜ？(4)", placeholder: "深層" },
          { step: 5, label: "なぜ？(5)", placeholder: "根本原因" }
        ]); break;
      case "sowhat":
        result = await generateListPrompt("「So What」向け事実を3つ。", ["スマホ利用増", "円安", "AI普及"], [
          { step: 1, label: "つまり？(1)", placeholder: "直接的意味" },
          { step: 2, label: "つまり？(2)", placeholder: "影響" },
          { step: 3, label: "つまり？(3)", placeholder: "示唆" },
          { step: 4, label: "つまり？(4)", placeholder: "展望" },
          { step: 5, label: "つまり？(5)", placeholder: "本質" }
        ]); break;
      case "5w1h":
        result = await generateListPrompt("整理が必要なトラブルを1つ。", ["新企画の遅延"], [
          { step: 1, label: "When", placeholder: "いつ" },
          { step: 2, label: "Where", placeholder: "どこ" },
          { step: 3, label: "Who", placeholder: "誰" },
          { step: 4, label: "What", placeholder: "何" },
          { step: 5, label: "Why", placeholder: "なぜ" },
          { step: 6, label: "How", placeholder: "どうやって" }
        ]); break;
      case "prep":
        result = await generateListPrompt("PREP法で話すべき主張を3つ。", ["早起きは正義", "読書は必要"], [
          { step: 1, label: "Point", placeholder: "結論" },
          { step: 2, label: "Reason", placeholder: "理由" },
          { step: 3, label: "Example", placeholder: "具体例" },
          { step: 4, label: "Point", placeholder: "再定義" }
        ]); break;
      case "analogy":
        result = await generateListPrompt("「課題|大テーマ」を3つ。例: 離職防止|水漏れ修理", ["採用|オーディション"], [
          { step: 1, label: "分解", placeholder: "要素を抽出せよ" },
          { step: 2, label: "法則", placeholder: "成功法則を書け" },
          { step: 3, label: "転用", placeholder: "具体的なアクションは？" }
        ]); break;
      case "metaphor-coach":
        result = await generateListPrompt("比喩にしがいのある概念を3つ。", ["信頼", "時間"], [
          { step: 1, label: "特徴", placeholder: "解剖しろ" },
          { step: 2, label: "連想", placeholder: "飛躍させろ" },
          { step: 3, label: "トーン", placeholder: "空気感を決めろ" },
          { step: 4, label: "接合", placeholder: "一旦比喩にしろ" },
          { step: 5, label: "完成", placeholder: "研ぎ澄ませよ" }
        ]); break;
      case "fogcatcher":
        result = await generateListPrompt("内省テーマを3つ。", ["モヤモヤ"], []);
        result.question = "書き出したいテーマを選択してください";
        break;
      default: return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}