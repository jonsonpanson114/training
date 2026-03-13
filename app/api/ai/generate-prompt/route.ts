import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY || '';

// Text model
const genAI = new GoogleGenerativeAI(apiKey);
const textModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-lite-preview',
});
const imageModel = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-image-preview',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    let result: {
      phenomenon?: string;
      word1?: string;
      word2?: string;
      concept?: string;
      description?: string;
      imageUrl?: string;
    } | null = null;

    switch (type) {
      case 'abduction': {
        const prompt = `奇妙で不可解な現象を1つ生成してください。
以下の条件を守ってください：
- 一見すると論理的ではない現象であること
- 複数の仮説が考えられる余地があること
- ミステリアスで好奇心をそそるものであること
- 日本語で1〜2文で表現すること

例：
「オフィスの全員がサングラスをかけてキーボードを猛烈に叩いているがPCの電源はすべて落ちている」
「コンビニのレジ前に長蛇の列ができているが、店員はおらず、商品棚は空っぽである」

現象のみを出力してください。`;

        const aiResult = await textModel.generateContent(prompt);
        result = { phenomenon: aiResult.response.text().trim() };
        break;
      }

      case 'synapse': {
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

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();
        const matches = text.match(/「([^」]+)」「([^」]+)」/);
        if (matches) {
          result = { word1: matches[1], word2: matches[2] };
        } else {
          const words = text.split(/[「\n]/).filter(w => w && w !== '」').map(w => w.replace(/」/g, '').trim());
          result = {
            word1: words[0] || 'コーヒー',
            word2: words[1] || '雲'
          };
        }
        break;
      }

      case 'metaphor': {
        const concepts = [
          'ブロックチェーン', 'メンタルヘルス', '量子コンピュータ', 'クラウドコンピューティング',
          '人工知能', '機械学習', 'ビッグデータ', 'シナジー効果', 'パラダイムシフト',
          'サステナビリティ', 'デジタルトランスフォーメーション', 'サンドイッチ理論',
          'バリュープロポジション', 'カスタマージャーニー', 'リーンスタートアップ',
          'アジャイル開発', 'クリティカルシンキング', 'クリエイティブ・ディストラクション',
          'トランザクションコスト', 'ネットワーク効果', 'エコシステム'
        ];
        result = { concept: concepts[Math.floor(Math.random() * concepts.length)] };
        break;
      }

      case 'abduction-lens': {
        const prompt = `決定的瞬間のシーンを描写してください。
以下の条件を守ってください：
- 何かが起こりそうな、あるいは何かが起こった直後の不気味なシーンであること
- 1〜2文で簡潔に描写すること
- 観察事実と推測の余地があること

例：
「公園のベンチに置き去られた高級なハンドバッグ。周囲には誰もおらず、風が強く吹き抜けている」
「深夜のオフィスビルの32階窓辺。誰もいないはずの部屋で、椅子がゆっくりと回転している」

シーンのみを出力してください。`;

        const aiResult = await textModel.generateContent(prompt);
        const description = aiResult.response.text().trim();
        result = { description };

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
              const mimeType = imageData.inlineData?.mimeType || 'image/png';
              result.imageUrl = `data:${mimeType};base64,${base64Data}`;
            }
          }
        } catch (error) {
          console.error('Image generation failed:', error);
        }

        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
