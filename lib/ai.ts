import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY || '';

// Text generation using Gemini 3.1 Flash Lite
const genAI = new GoogleGenerativeAI(apiKey);

// Text model for prompts and feedback
export const textModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-lite-preview',
});

// Image model for Abduction Lens
export const imageModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-image-preview',
});

// === Dynamic Prompt Generation ===

/**
 * Generate a mysterious phenomenon for Abduction Dojo
 */
export async function generateAbductionPhenomenon(): Promise<string> {
  const prompt = `奇妙で不可解な現象を1つ生成してください。
以下の条件を守ってください：
- 一見すると論理的ではない現象であること
- 複数の仮説が考えられる余地があること
- ミステリアスで好奇心をそそるものであること
- 日本語で1〜2文で表現すること

例：
「オフィスの全員がサングラスをかけてキーボードを猛烈に叩いているが、PCの電源はすべて落ちている」
「コンビニのレジ前に長蛇の列ができているが、店員はおらず、商品棚は空っぽである」

現象のみを出力してください。`;

  const result = await textModel.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Generate an unrelated word pair for Synapse Match
 */
export async function generateSynapseWords(): Promise<{ word1: string; word2: string }> {
  const prompt = `全く関係ない2つの単語をペアで生成してください。
以下の条件を守ってください：
- 2つの単語の間に明らかな共通点がないこと
- 日常的な単語であること
- 名詞であること
- 日本語で2文字〜5文字程度であること

出力形式：「単語1」「単語2」

例：
「コーヒー」「雲」
「AI」「夕食」

ペアのみを出力してください。`;

  const result = await textModel.generateContent(prompt);
  const text = result.response.text().trim();
  const matches = text.match(/「([^」]+)」「([^」]+)」/);
  if (matches) {
    return { word1: matches[1], word2: matches[2] };
  }
  // Fallback parsing
  const words = text.split(/[「\n]/).filter(w => w && w !== '」').map(w => w.replace(/」/g, '').trim());
  if (words.length >= 2) {
    return { word1: words[0], word2: words[1] };
  }
  // Ultimate fallback
  return { word1: 'コーヒー', word2: '雲' };
}

/**
 * Generate a complex concept for Metaphor Maker
 */
export async function generateMetaphorConcept(): Promise<string> {
  const concepts = [
    'ブロックチェーン', 'メンタルヘルス', '量子コンピュータ', 'クラウドコンピューティング',
    '人工知能', '機械学習', 'ビッグデータ', 'シナジー効果', 'パラダイムシフト',
    'サステナビリティ', 'デジタルトランスフォーメーション', 'サンドイッチ理論',
    'バリュープロポジション', 'カスタマージャーニー', 'リーンスタートアップ',
    'アジャイル開発', 'クリティカルシンキング', 'クリエイティブ・ディストラクション',
    'トランザクションコスト', 'ネットワーク効果', 'エコシステム'
  ];
  return concepts[Math.floor(Math.random() * concepts.length)];
}

/**
 * Generate a decisive moment scene description and image for Abduction Lens
 */
export async function generateAbductionLens(): Promise<{ description: string; imageUrl?: string }> {
  // Generate scene description
  const prompt = `決定的瞬間のシーンを描写してください。
以下の条件を守ってください：
- 何かが起こりそうな、あるいは何かが起こった直後の不気味なシーンであること
- 1〜2文で簡潔に描写すること
- 観察事実と推測の余地があること

例：
「公園のベンチに置き去られた高級なハンドバッグ。周囲には誰もおらず、風が強く吹き抜けている」
「深夜のオフィスビルの32階窓辺。誰もいないはずの部屋で、椅子がゆっくりと回転している」

シーンのみを出力してください。`;

  const result = await textModel.generateContent(prompt);
  const description = result.response.text().trim();

  // Generate image
  try {
    const imagePrompt = `Photorealistic scene: ${description}. Cinematic lighting, mysterious atmosphere, high detail, 4K quality.`;
    const imageResult = await imageModel.generateContent([
      { text: imagePrompt }
    ]);

    const imageData = imageResult.response.candidates?.[0]?.content?.parts?.[0];
    if (imageData && 'inlineData' in imageData) {
      const base64Data = imageData.inlineData?.data;
      if (base64Data) {
        // Convert base64 to data URL
        const mimeType = imageData.inlineData?.mimeType || 'image/png';
        return {
          description,
          imageUrl: `data:${mimeType};base64,${base64Data}`
        };
      }
    }
  } catch (error) {
    console.error('Image generation failed:', error);
  }

  return { description };
}

// === AI Feedback Generation ===

/**
 * Generate feedback for verbalization entries
 */
export async function generateVerbalizationFeedback(content: string, promptTitle: string): Promise<{
  score: number;
  feedback: string;
  suggestions: string[];
}> {
  const prompt = `以下の言語化トレーニングの回答を評価してください。

【お題】${promptTitle}

【回答】
${content}

以下の形式でJSONで出力してください：
{
  "score": 0-100の整数点数（具体性、明確さ、深さを総合評価）,
  "feedback": 全体のフィードバック（日本語、50-100文字程度）,
  "suggestions": ["改善案1", "改善案2", "改善案3"]（具体的な改善提案、各30-50文字程度）
}

JSONのみを出力してください。`;

  const result = await textModel.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
  }

  // Fallback
  return {
    score: 70,
    feedback: '回答を送信しました。継続してトレーニングすることで上達します。',
    suggestions: ['より具体的な表現を心がけましょう', '数字や事例を交えると伝わりやすくなります', '自分の言葉で書きましょう']
  };
}

/**
 * Evaluate abduction entry
 */
export async function evaluateAbductionEntry(
  phenomenon: string,
  observations: string[],
  hypotheses: Array<{ hypothesis: string; reasoning: string }>
): Promise<{
  logic: number;
  creativity: number;
  persuasiveness: number;
  total: number;
  feedback: string;
}> {
  const prompt = `以下のアブダクション（仮説思考）の回答を採点してください。

【奇妙な現象】
${phenomenon}

【観察事実】
${observations.map((o, i) => `${i + 1}. ${o}`).join('\n')}

【仮説と根拠】
${hypotheses.map((h, i) => `${i + 1}. 仮説: ${h.hypothesis}\n   根拠: ${h.reasoning}`).join('\n\n')}

以下の形式でJSONで出力してください：
{
  "logic": 0-100の整数点数（論理性の評価）,
  "creativity": 0-100の整数点数（独創性の評価）,
  "persuasiveness": 0-100の整数点数（説得力の評価）,
  "total": 3項目の平均点（整数）,
  "feedback": 全体のフィードバック（日本語、80-150文字程度）
}

JSONのみを出力してください。`;

  const result = await textModel.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
  }

  // Fallback
  return {
    logic: 70,
    creativity: 70,
    persuasiveness: 70,
    total: 70,
    feedback: '仮説を立てる力を伸ばしています。観察事実から論理的に推論する練習を続けましょう。'
  };
}

/**
 * Extract keywords from Fog Catcher entry
 */
export async function extractKeywords(content: string): Promise<{
  keywords: string[];
  themes: string[];
}> {
  const prompt = `以下のフリーライティングから重要なキーワードとテーマを抽出してください。

【テキスト】
${content}

以下の形式でJSONで出力してください：
{
  "keywords": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"]（重要な単語5つ）,
  "themes": ["テーマ1", "テーマ2", "テーマ3"]（内容のテーマ3つ）
}

JSONのみを出力してください。`;

  const result = await textModel.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
  }

  // Fallback
  return {
    keywords: ['思考', '感情', '行動', '価値観', '未来'],
    themes: ['自己分析', '目標設定', '感情整理']
  };
}

/**
 * Evaluate Synapse Match connections
 */
export async function evaluateSynapseConnections(
  word1: string,
  word2: string,
  connections: string[]
): Promise<{
  score: number;
  feedback: string;
}> {
  const prompt = `以下のシナプスマッチの回答を評価してください。

【言葉のペア】
${word1} と ${word2}

【共通点】
${connections.map((c, i) => `${i + 1}. ${c}`).join('\n')}

以下の形式でJSONで出力してください：
{
  "score": 0-100の整数点数（共通点の質と量を評価、10個出せていれば高得点）,
  "feedback": 全体のフィードバック（日本語、50-100文字程度）
}

JSONのみを出力してください。`;

  const result = await textModel.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
  }

  // Fallback
  return {
    score: Math.min(connections.length * 10, 100),
    feedback: `${connections.length}個の共通点を見つけました！ユニークな視点で考え続けましょう。`
  };
}

/**
 * Evaluate Metaphor Maker entry
 */
export async function evaluateMetaphorEntry(
  concept: string,
  metaphor: string
): Promise<{
  clarity: number;
  appropriateness: number;
  total: number;
  feedback: string;
}> {
  const prompt = `以下の例え話（メタファー）を評価してください。

【概念】
${concept}

【例え話】
${metaphor}

以下の形式でJSONで出力してください：
{
  "clarity": 0-100の整数点数（わかりやすさの評価）,
  "appropriateness": 0-100の整数点数（適切さの評価）,
  "total": 2項目の平均点（整数）,
  "feedback": 全体のフィードバック（日本語、80-120文字程度）
}

JSONのみを出力してください。`;

  const result = await textModel.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
  }

  // Fallback
  return {
    clarity: 75,
    appropriateness: 75,
    total: 75,
    feedback: 'わかりやすい例え話です。より身近な例えを交えると、伝わりやすくなります。'
  };
}
