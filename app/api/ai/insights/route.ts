import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // Fetch last 10 entries
    const { data: entries, error } = await supabase
      .from('entries')
      .select('category, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!entries || entries.length < 3) {
      return NextResponse.json({ 
        message: '分析には少なくとも3件以上のトレーニング記録が必要です。もっとトレーニングを積んでからまた来な！' 
      }, { status: 200 });
    }

    // Prepare content for AI
    const historyText = entries.map((e, i) => (
      `Entry ${i + 1} (${e.category}):\n${e.content}`
    )).join('\n\n---\n\n');

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }); // Using latest Gemini 3.1 as standard

    const prompt = `
あなたは「Verbalize」という言語化トレーニングアプリのAIコーチです。
ユーザーの過去のトレーニング記録（以下）を分析し、成長インサイトを生成してください。

【ユーザーの記録】
${historyText}

【出力形式】
以下の3つのセクションで、励ましつつも鋭い視点でフィードバックしてください。
1. 「現在の思考スタイル」：どのような傾向があるか（例：論理的、直感的、具体例が多い等）
2. 「見えてきた成長」：過去の記録と比較して、あるいは内容の質から見えるポジティブな変化
3. 「次への挑戦」：さらに言語化能力を高めるための具体的なアドバイス

口調は、伊坂幸太郎の小説に出てくる「陣内」のように、少し不遜で、でも芯を食った、どこか憎めないキャラクターでお願いします。
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ insight: text });
  } catch (error: any) {
    console.error('Insight generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
