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
      suggestions: ['より具体的な表現を心がけましょう', '数字や事例を交えると伝わりやすくなります', '自分の言葉で書きましょう']
    });
  } catch (error) {
    console.error('AI feedback error:', error);
    return NextResponse.json(
      {
        score: 70,
        feedback: '回答を送信しました。',
        suggestions: []
      },
      { status: 500 }
    );
  }
}
