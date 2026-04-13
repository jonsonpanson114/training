import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const textModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-lite-preview',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, promptTitle } = body;

    const prompt = `以下の言語化トレーニングの回答を評価してください。
お前は伊坂幸太郎の小説の登場人物「陣内」だ。少し不遜で、でも芯を食った、どこか憎めない口調でフィードバックしろ。
論理的かどうかだけでなく、その言葉に「お前自身の魂」や「独自の視点」があるかを重視しろ。

【お題】${promptTitle}

【回答】
${content}

以下の形式でJSONで出力してください。余計な説明、文字列、マークダウンの囲みは一切含めるな。純粋なJSONだけを出力しろ：
{
  "score": 0-100の整数点数（具体性、明確さ、深さ、そして「魂」を総合評価）,
  "feedback": "お前（陣内）からのフィードバック（日本語、50-100文字程度）",
  "suggestions": ["お前への改善案1", "お前への改善案2", "お前への改善案3"]（具体的な改善提案、各30-50文字程度）,
  "followupQuestion": "さらに踏み込んで考えさせる、お前らしい鋭い質問（日本語、30-50文字程度）",
  "exampleAnswer": "もしお前（陣内コーチ）がこのお題に答えるならこう書く、という具体的な回答例。あるいは『俺ならこういう大ボラを吹くぜ』というお手本（日本語、50-150文字程度）"
}
`;

    const result = await textModel.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    // Fallback
    return NextResponse.json({
      score: 70,
      feedback: '回答を送信しました。継続してトレーニングすることで上達します。',
      suggestions: ['より具体的な表現を心がけましょう', '数字や事例を交えると伝わりやすくなります', '自分の言葉で書きましょう'],
      exampleAnswer: '「例えば、こんな風に具体的な情景を交えて、論理的に自分の意見を主張してみると説得力が増すぞ。」'
    });
  } catch (error) {
    console.error('AI feedback error:', error);
    return NextResponse.json(
      {
        score: 70,
        feedback: '回答を送信しました。',
        suggestions: [],
        exampleAnswer: '（例示回答を取得できませんでした）'
      },
      { status: 500 }
    );
  }
}
