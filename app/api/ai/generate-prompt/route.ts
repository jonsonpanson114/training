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
  goal?: string;
  guide?: string;
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
  const text = await askText("「なぜそんなことが起きたのか？」と推論したくなる、日常のちょっとした違和感やユーモラスな謎を1つ。日本語で。語尾は『〜の真相を暴いてください。』で締めること。※殺人、死体、幽霊、ホラー要素は一切禁止。例：『誰もいないはずの会議室に、毎朝10時ぴったりに熱々のブラックコーヒーが1杯だけ置かれている現象の真相を暴いてください。』。現象のみ出力。");
  return { 
    phenomenon: text || fallback.phenomenon,
    goal: "正解のない問いに対し、わずかな手がかりから「筋の通った物語」を構築する力を鍛える。",
    guide: "【聞かれていること】：その事象の裏にある「真相」。\n【答えるべきこと】：1.観察、2.飛躍した仮説、3.根拠（なぜそう言えるか）。\n【具体的な行動】：科学的な正解はいらねえ、俺を唸らせる「もっともらしい大ボラ」を3分で3つ書き出せ！",
    steps: [
      { step: 1, label: "❶ 観察事実（何が起きたか）", placeholder: "例：ブランコが揺れているが、風は全く吹いていない。" },
      { step: 2, label: "❷ 飛躍的仮説（実はこういうことか？）", placeholder: "例：実は透明人間の子供が、昼休み限定で遊びに来ている。" },
      { step: 3, label: "❸ 推論の連結（なぜそう言えるか）", placeholder: "例：ブランコの揺れ方が、子供が楽しそうに漕ぐリズムそのものだからだ。" }
    ]
  };
}

async function generateSynapse(): Promise<GeneratedResult> {
  const fallback: GeneratedResult = { word1: "ピアノ", word2: "潜水艦" };
  if (!textModel) return fallback;
  const text = await askText("全く無関係な日本語の名詞2つを「語1|語2」の形式で1行のみ出力。例: 鉛筆|ブラックホール");
  const parts = text.split("|").map(s => s.trim()).filter(Boolean);
  return { 
    word1: parts[0] || fallback.word1, 
    word2: parts[1] || fallback.word2,
    goal: "遠く離れた概念を結びつけることで、脳の連合野を刺激し、新しいアイデアの種を見つける。",
    guide: "見た目、音、歴史、用途。何でもいいから「共通点という名の橋」を強引に架けてみろ。"
  };
}

async function generateMetaphor(): Promise<GeneratedResult> {
  const fallback: GeneratedResult = { concept: "ダークマター" };
  if (!textModel) return fallback;
  const text = await askText("比喩で説明しがいのある、少し難解で抽象的な概念を日本語で1つ。概念名のみ。");
  return { 
    concept: text || fallback.concept,
    goal: "物事の本質を抜き出し、身近なイメージに変換する能力を鍛える。",
    guide: "専門用語を一切使うな。小学生がその映像を思い浮かべて「ああ、そういうことか！」と言わせたら勝ちだ。"
  };
}

async function generateAbductionLens(): Promise<GeneratedResult> {
  const fallbackDescription = "豪雨のバス停。ベンチには誰もおらず、新品のウェディングドレスだけが濡れたまま放置されている。";
  let description = fallbackDescription;
  let imageUrl = "https://picsum.photos/seed/abduction/1200/800";

  if (textModel) {
    const text = await askText("日常風景の中で起きた、ちょっと奇妙でユーモラスな『推論したくなる決定的瞬間』の描写を1-2文で作成せよ。※殺人、流血、死体、幽霊、ホラー要素は絶対に禁止（例：道端に片方だけの赤い靴が等間隔で10メートル並んでいる、など）。描写のみ出力。");
    if (text) description = text;
  }

  if (imageModel) {
    try {
      const imgRes = await imageModel.generateContent(`Create a cinematic, high-quality slightly quirky and realistic photo based on this scene. No text in image. No horror, no blood, no ghosts, no violence. Scene: ${description}`);
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
    goal: "視覚情報から「目に見えない背景」を推論し、根拠を持って説明する力を多角的に鍛える。",
    guide: "【聞かれていること】：このおかしな画像が撮影される「5分前」に何があったのか？\n【答えるべきこと】：まずは画像に写っている「素っ頓狂な事実」を拾い上げる。次に「実はこういう理由だ」という大ボラを吹き、最後に「画像に写る〇〇がその証拠だ」とこじつける。\n【具体的な行動】：「道端に片方の赤い靴がある、だから犯人はサンタだ！」くらい強引でいい。名探偵になりきって理由をでっち上げろ！",
    steps: [
      { step: 1, label: "❶ 観察事実", placeholder: "画像に写っている事実（例：赤いハイヒールが片方だけベンチに置かれている）" },
      { step: 2, label: "❷ 名探偵の大ボラ", placeholder: "このシーンの裏に潜む真実（例：スパイが任務中に慌てて変装を解いたからだ）" },
      { step: 3, label: "❸ 解決のロジック", placeholder: "なぜそう言えるか（例：ヒールが綺麗に揃えられているのは、追われながらも訓練された証拠だからだ）" }
    ]
  };
}

async function generateListPrompt(
  instruction: string,
  fallbackPrompts: string[],
  fallbackSteps: StepDef[],
  goal: string,
  guide: string
): Promise<GeneratedResult> {
  if (!textModel) return { prompts: fallbackPrompts, steps: fallbackSteps, description: fallbackPrompts[0], goal, guide };
  const prompt = `${instruction}\nJSON形式で必ず出力: {"prompts":["..."],"steps":[{"step":1,"label":"...","placeholder":"..."}]}`;
  const text = await askText(prompt);
  const parsed = extractJsonObject(text);
  const prompts = toStringArray(parsed?.prompts).slice(0, 3);
  const steps = toStepArray(parsed?.steps);
  return {
    prompts: prompts.length > 0 ? prompts : fallbackPrompts,
    steps: steps.length > 0 ? steps : fallbackSteps,
    description: prompts[0] || fallbackPrompts[0],
    goal,
    guide,
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
        ], "内部の構造的問題を特定する批判的思考力を磨く。", "「やる気がない」は理由じゃねえ。逃げずに、自分やシステムの欠陥を掘り起こせ。"); break;
      case "sowhat":
        result = await generateListPrompt("「So What」向け事実を3つ。", ["スマホ利用増", "円安", "AI普及"], [
          { step: 1, label: "つまり？(1)", placeholder: "直接的意味" },
          { step: 2, label: "つまり？(2)", placeholder: "影響" },
          { step: 3, label: "つまり？(3)", placeholder: "示唆" },
          { step: 4, label: "つまり？(4)", placeholder: "展望" },
          { step: 5, label: "つまり？(5)", placeholder: "本質" }
        ], "事実から示唆を引き出し、自分なりの法則を見出す。", "事実の先にある、あんただけの「教訓」を掴み取れ。"); break;
      case "5w1h":
        result = await generateListPrompt("整理が必要なトラブルを1つ。", ["新企画の遅延"], [
          { step: 1, label: "When", placeholder: "いつ" },
          { step: 2, label: "Where", placeholder: "どこ" },
          { step: 3, label: "Who", placeholder: "誰" },
          { step: 4, label: "What", placeholder: "何" },
          { step: 5, label: "Why", placeholder: "なぜ" },
          { step: 6, label: "How", placeholder: "どうやって" }
        ], "思考の漏れをなくし、情報を多角的に整理する。", "具体性が増せば増すほど、あんたの行動の解像度は上がる。"); break;
      case "prep":
        result = await generateListPrompt("PREP法で話すべき主張を3つ。", ["早起きは正義", "読書は必要"], [
          { step: 1, label: "Point", placeholder: "結論" },
          { step: 2, label: "Reason", placeholder: "理由" },
          { step: 3, label: "Example", placeholder: "具体例" },
          { step: 4, label: "Point", placeholder: "再定義" }
        ], "短時間で要点を伝え、説得力を持たせる型を身につける。", "結論で挟み込め。それが相手の脳に主張を刻み込むコツだ。"); break;
      case "analogy":
        result = await generateListPrompt("「課題|大テーマ」を3つ。例: 離職防止|水漏れ修理", ["採用|オーディション"], [
          { step: 1, label: "分解", placeholder: "要素を抽出せよ" },
          { step: 2, label: "法則", placeholder: "成功法則を書け" },
          { step: 3, label: "転用", placeholder: "具体的なアクションは？" }
        ], "他分野の仕組みを自分の課題に応用する力を鍛える。", "構造を借りてこい。スパイスの調合は才能の組み合わせかもしれねえ。"); break;
      case "metaphor-coach":
        result = await generateListPrompt("比喩にしがいのある概念を3つ。", ["信頼", "時間"], [
          { step: 1, label: "特徴", placeholder: "解剖しろ" },
          { step: 2, label: "連想", placeholder: "飛躍させろ" },
          { step: 3, label: "トーン", placeholder: "空気感を決めろ" },
          { step: 4, label: "接合", placeholder: "一旦比喩にしろ" },
          { step: 5, label: "完成", placeholder: "研ぎ澄ませよ" }
        ], "芸術的なプロセスを経て、言語の鋭さを研ぎ澄ます。", "一歩ずつ、概念の核に近づけ。最後に俺を驚かせてみろ。"); break;
      case "fogcatcher":
        result = await generateListPrompt("内省テーマを3つ。", ["モヤモヤ"], [], "思考の渋滞を解消し、真意を可視化する。", "文法も誤字も無視しろ。頭の中のゴミを全部ぶちまけるつもりで書け。");
        result.question = "書き出したいテーマを選択してください";
        break;
      default: return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}