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
      question?: string;
      challenges?: string[];
      steps?: Array<{ step: number; label: string; placeholder: string }>;
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
          const words = text.split(/[\n]/).filter(w => w && w !== '」').map(w => w.replace(/」/g, '').trim());
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

      case 'whysos': {
        const defaultChallenges = [
          '最近感じたイライラの原因',
          '最近直面した仕事の課題',
          '最近成功したことの背景',
          '最近失敗したことの根本原因',
          '最近気になっていることの根本原因',
          '最近変えたい習慣の理由'
        ];

        const prompt = `なぜなぜ分析（5回のなぜ？）のための、日常的で深掘りしやすい課題を3つ生成してください。

【出力形式】
1. 課題1
2. 課題2
3. 課題3

【条件】
- 日常的で、誰にでも起こりうる課題であること
- 日本語で自然な表現であること
- 深掘りが可能な課題であること
- 各課題は簡潔に（20文字以内）

課題のみを3つ出力してください。`;

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();

        // Parse the response - extract challenges
        let challenges = defaultChallenges.slice(0, 3);
        const lines = text.split('\n').filter(line => line.trim());

        // Try to find numbered list format
        const numberedList = lines
          .filter(line => /^\d+\.\s+/.test(line) || /^\d+、\s*/.test(line))
          .map(line => line.replace(/^\d+[、.]\s*/, '').trim())
          .filter(line => line.length > 3);

        if (numberedList.length >= 3) {
          challenges = numberedList.slice(0, 3);
        } else {
          // Fallback: extract non-empty lines
          const extracted = lines
            .filter(line => !line.includes('出力形式') && !line.includes('条件') && line.length > 5 && line.length < 50)
            .slice(0, 3);
          if (extracted.length >= 2) {
            challenges = extracted;
          }
        }

        result = {
          question: '', // Will be set by user selection
          challenges,
          steps: [
            { step: 1, label: '1回目「なぜ？」', placeholder: '1つ目の原因を考えてください（20〜40文字）' },
            { step: 2, label: '2回目「なぜ？」', placeholder: 'さらに深く掘り下げてください（20〜40文字）' },
            { step: 3, label: '3回目「なぜ？」', placeholder: '根本原因に近づけてください（20〜40文字）' },
            { step: 4, label: '4回目「なぜ？」', placeholder: 'もっと深く掘り下げてください（20〜40文字）' },
            { step: 5, label: '5回目「なぜ？」', placeholder: '根本原因を明確にしてください（20〜40文字）' }
          ]
        };
        break;
      }

      case 'sowhat': {
        const defaultThemes = [
          '最近読んだニュースの本質',
          '最近の仕事での出来事から得られる教訓',
          '最近の友人との会話の意味',
          '最近の失敗体験から学ぶべきこと',
          '最近観察した社会現象の背景',
          '最近の成功体験から得られる洞察'
        ];

        const prompt = `「つまり何？」分析のための、抽象化・深掘りしやすいテーマを3つ生成してください。

【出力形式】
1. テーマ1
2. テーマ2
3. テーマ3

【条件】
- 具体的な事実から始まるテーマであること
- 抽象度を上げられるテーマであること
- 行動可能な教訓に落とし込めるテーマであること
- 各テーマは簡潔に（20文字以内）

テーマのみを3つ出力してください。`;

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();

        // Parse the response - extract challenges
        let challenges = defaultThemes.slice(0, 3);
        const lines = text.split('\n').filter(line => line.trim());

        const numberedList = lines
          .filter(line => /^\d+\.\s+/.test(line) || /^\d+、\s*/.test(line))
          .map(line => line.replace(/^\d+[、.]\s*/, '').trim())
          .filter(line => line.length > 3);

        if (numberedList.length >= 3) {
          challenges = numberedList.slice(0, 3);
        } else {
          const extracted = lines
            .filter(line => !line.includes('出力形式') && !line.includes('条件') && line.length > 5 && line.length < 50)
            .slice(0, 3);
          if (extracted.length >= 2) {
            challenges = extracted;
          }
        }

        result = {
          question: '', // Will be set by user selection
          challenges,
          steps: [
            { step: 1, label: '1回目「つまり何？」', placeholder: 'この事実から意味や影響を考えてください（20〜40文字）' },
            { step: 2, label: '2回目「つまり何？」', placeholder: 'さらに深い意味を探ってください（20〜40文字）' },
            { step: 3, label: '3回目「つまり何？」', placeholder: '抽象度を上げて考えてください（20〜40文字）' },
            { step: 4, label: '4回目「つまり何？」', placeholder: '行動可能な教訓を考えてください（20〜40文字）' },
            { step: 5, label: '5回目「つまり何？」', placeholder: '本質的な洞察をまとめてください（20〜40文字）' }
          ]
        };
        break;
      }

      case '5w1h': {
        const defaultThemes = [
          '最近の買い物の5W1H整理',
          '最近の会議の5W1H整理',
          '最近の旅行の5W1H整理',
          '最近のトラブル解決の5W1H整理',
          '最近のプロジェクトの5W1H整理',
          '最近の新しい習慣の5W1H整理'
        ];

        const prompt = `5W1H分析のための、整理・分析しやすいテーマを3つ生成してください。

【出力形式】
1. テーマ1
2. テーマ2
3. テーマ3

【条件】
- 具体的な出来事や活動であること
- 6つの要素（When, Where, Who, What, Why, How）に分解できること
- 行動プランを立てられるテーマであること
- 各テーマは簡潔に（20文字以内）

テーマのみを3つ出力してください。`;

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();

        // Parse the response - extract challenges
        let challenges = defaultThemes.slice(0, 3);
        const lines = text.split('\n').filter(line => line.trim());

        const numberedList = lines
          .filter(line => /^\d+\.\s+/.test(line) || /^\d+、\s*/.test(line))
          .map(line => line.replace(/^\d+[、.]\s*/, '').trim())
          .filter(line => line.length > 3);

        if (numberedList.length >= 3) {
          challenges = numberedList.slice(0, 3);
        } else {
          const extracted = lines
            .filter(line => !line.includes('出力形式') && !line.includes('条件') && line.length > 5 && line.length < 50)
            .slice(0, 3);
          if (extracted.length >= 2) {
            challenges = extracted;
          }
        }

        result = {
          question: '', // Will be set by user selection
          challenges,
          steps: [
            { step: 1, label: 'When（いつ）', placeholder: 'いつ起こりましたか？（10〜20文字）' },
            { step: 2, label: 'Where（どこ）', placeholder: 'どこで起こりましたか？（10〜20文字）' },
            { step: 3, label: 'Who（誰）', placeholder: '誰が関わっていましたか？（10〜20文字）' },
            { step: 4, label: 'What（何）', placeholder: '何が起こりましたか？（10〜20文字）' },
            { step: 5, label: 'Why（なぜ）', placeholder: 'なぜ起こりましたか？（10〜20文字）' },
            { step: 6, label: 'How（どのように）', placeholder: 'どのように解決・対応しますか？（10〜20文字）' }
          ]
        };
        break;
      }

      case 'prep': {
        const defaultThemes = [
          'リモートワークのメリットをPREP法で伝える',
          '朝活の重要性をPREP法で伝える',
          '時間管理の重要性をPREP法で伝える',
          '継続の力をPREP法で伝える',
          'デジタル detox の効果をPREP法で伝える',
          '読書の価値をPREP法で伝える'
        ];

        const prompt = `PREP法（Point-Reason-Example-Point）のための、説得力のあるテーマを3つ生成してください。

【出力形式】
1. テーマ1
2. テーマ2
3. テーマ3

【条件】
- 明確な主張（結論）を含むテーマであること
- 理由と具体例を挙げられるテーマであること
- 論理的に説得力のあるテーマであること
- 各テーマは簡潔に（25文字以内）

テーマのみを3つ出力してください。`;

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();

        // Parse the response - extract challenges
        let challenges = defaultThemes.slice(0, 3);
        const lines = text.split('\n').filter(line => line.trim());

        const numberedList = lines
          .filter(line => /^\d+\.\s+/.test(line) || /^\d+、\s*/.test(line))
          .map(line => line.replace(/^\d+[、.]\s*/, '').trim())
          .filter(line => line.length > 3);

        if (numberedList.length >= 3) {
          challenges = numberedList.slice(0, 3);
        } else {
          const extracted = lines
            .filter(line => !line.includes('出力形式') && !line.includes('条件') && line.length > 5 && line.length < 50)
            .slice(0, 3);
          if (extracted.length >= 2) {
            challenges = extracted;
          }
        }

        result = {
          question: '', // Will be set by user selection
          challenges,
          steps: [
            { step: 1, label: 'Point（結論）', placeholder: '主張を述べてください（20〜40文字）' },
            { step: 2, label: 'Reason（理由）', placeholder: 'その理由を説明してください（20〜40文字）' },
            { step: 3, label: 'Example（具体例）', placeholder: '具体例を挙げてください（20〜40文字）' },
            { step: 4, label: 'Point（結論）', placeholder: '主張を再確認してください（20〜40文字）' }
          ]
        };
        break;
      }

      case 'fogcatcher': {
        const defaultThemes = [
          '今の頭の中にある「ぼんやりとした悩み」',
          '最近感じた「漠然とした不安」',
          '最近のモヤモヤした感情',
          '言いにくい思考',
          '将来への不確かな思い',
          '今の気分や感情の波'
        ];

        const prompt = `Fog Catcher（思考の霧払い）のための、思考整理に適したテーマを3つ生成してください。

【出力形式】
1. テーマ1
2. テーマ2
3. テーマ3

【条件】
- 思考や感情を率直に表現できるテーマであること
- 編集せずに書き出せるテーマであること
- 言語化することで思考を整理できるテーマであること
- 各テーマは簡潔に（20文字以内）

テーマのみを3つ出力してください。`;

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();

        // Parse the response - extract challenges
        let challenges = defaultThemes.slice(0, 3);
        const lines = text.split('\n').filter(line => line.trim());

        const numberedList = lines
          .filter(line => /^\d+\.\s+/.test(line) || /^\d+、\s*/.test(line))
          .map(line => line.replace(/^\d+[、.]\s*/, '').trim())
          .filter(line => line.length > 3);

        if (numberedList.length >= 3) {
          challenges = numberedList.slice(0, 3);
        } else {
          const extracted = lines
            .filter(line => !line.includes('出力形式') && !line.includes('条件') && line.length > 5 && line.length < 50)
            .slice(0, 3);
          if (extracted.length >= 2) {
            challenges = extracted;
          }
        }

        result = {
          question: '', // Will be set by user selection
          challenges,
          description: '思考や感情を制限なしで自由に書き出してください。編集せず、そのままの言葉で書くことで、思考の霧を晴らすことができます。'
        };
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!result) {
      console.error('Result is null for type:', type);
      return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
    }

    console.log('API returning result for type', type, ':', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
