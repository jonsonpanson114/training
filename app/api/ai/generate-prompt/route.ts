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
        const prompt = `以下の形式で、なぜなぜ分析（5回のなぜ？）のための課題を生成してください。

【課題】
${['最近感じたイライラの原因', '最近直面した仕事の課題', '最近成功したことの背景', '最近失敗したことの根本原因', '最近気になっていることの根本原因', '最近変えたい習慣の理由'][Math.floor(Math.random() * 6)]}

【回答例】
1回目「なぜ？」：（20〜40文字）
2回目「なぜ？」：（20〜40文字）
3回目「なぜ？」：（20〜40文字）
4回目「なぜ？」：（20〜40文字）
5回目「なぜ？」：（20〜40文字、根本原因または行動）

【トレーニングの目的】
この手法は、表面的な原因ではなく、根本原因を探ることで、本質的な理解と解決策を発見するためのものです。5回繰り返すことで、表層から深層へと思考を掘り下げていきます。

【制約条件】
- 日常的で、誰にでも起こりうる課題であること
- 日本語で自然な表現であること
- 深掘りが可能な課題であること`;

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();

        // Parse the response
        const lines = text.split('\n').filter(line => line.trim());
        const challenge = lines.find(line => !line.includes('回答例') && !line.includes('トレーニングの目的') && !line.includes('制約条件'));

        result = {
          question: challenge || '最近感じたイライラの原因をなぜなぜで掘り下げてください。',
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
        const prompt = `以下の形式で、「つまり何？」分析のための課題を生成してください。

【テーマ】
${['最近読んだニュースの本質', '最近の仕事での出来事から得られる教訓', '最近の友人との会話の意味', '最近の失敗体験から学ぶべきこと', '最近観察した社会現象の背景'][Math.floor(Math.random() * 6)]}

【回答例】
1回目「つまり何？」：（20〜40文字、意味や影響）
2回目「つまり何？」：（20〜40文字、さらに深い意味）
3回目「つまり何？」：（20〜40文字、抽象度を上げる）
4回目「つまり何？」：（20〜40文字、行動可能な教訓）
5回目「つまり何？」：（20〜40文字、本質的な洞察）

【トレーニングの目的】
この手法は、表面的な事実から抽象度を階段を登って、本質的な洞察を発見するためのものです。「事実」→「解釈」→「教訓」の流れで思考を整理し、意味を深めていきます。

【制約条件】
- 具体的な事実から始まること
- 抽象度を徐々に上げること
- 行動可能な教訓に落とし込むこと`;

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();

        // Parse the response
        const lines = text.split('\n').filter(line => line.trim());
        const theme = lines.find(line => !line.includes('回答例') && !line.includes('トレーニングの目的') && !line.includes('制約条件'));

        result = {
          question: theme || '最近読んだニュースの本質を「つまり何？」で掘り下げてください。',
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
        const prompt = `以下の形式で、5W1H（5つのW、1つのH）分析のための課題を生成してください。

【テーマ】
${['最近の買い物の5W1H整理', '最近の会議の5W1H整理', '最近の旅行の5W1H整理', '最近のトラブル解決の5W1H整理', '最近のプロジェクトの5W1H整理'][Math.floor(Math.random() * 6)]}

【5W1H要素】
- When（いつ）：（10〜20文字）
- Where（どこ）：（10〜20文字）
- Who（誰）：（10〜20文字）
- What（何）：（10〜20文字）
- Why（なぜ）：（10〜20文字）
- How（どのように）：（10〜20文字）

【行動プラン】
（上記5W1Hに基づいた行動プランを1〜2文でまとめる）

【トレーニングの目的】
5W1Hは、情報を6つの要素に整理し、具体的で実行可能なアクションプランを作成するための思考法です。情報の漏れを防ぎ、論理的な行動計画を立てることができます。

【制約条件】
- 6つの要素すべてを網羅すること
- 具体的で実行可能であること
- 行動プランが明確であること`;

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();

        // Parse the response to extract 5W1H elements
        const lines = text.split('\n').filter(line => line.trim());
        const theme = lines.find(line => !line.includes('回答例') && !line.includes('トレーニングの目的') && !line.includes('制約条件')) || '最近の買い物について5W1Hで整理して行動プランを作成してください。';

        result = {
          question: theme,
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
        const prompt = `以下の形式で、PREP法（Point-Reason-Example-Point）のための課題を生成してください。

【テーマ】
${['リモートワークのメリットをPREP法で伝える', '朝活の重要性をPREP法で伝える', '時間管理の重要性をPREP法で伝える', '継続の力をPREP法で伝える', 'デジタル detox の効果をPREP法で伝える'][Math.floor(Math.random() * 6)]}

【PREP構成の回答例】
- Point（結論）：（20〜40文字、主張）
- Reason（理由）：（20〜40文字、その理由）
- Example（具体例）：（20〜40文字、裏付け）
- Point（結論）：（20〜40文字、主張の再確認）

【トレーニングの目的】
PREP法は、意見や主張を論理的でわかりやすく伝えるための構成法です。「結論」→「理由」→「具体例」→「結論」の順序で構成することで、説得力を高め、相手に伝わりやすい表現になります。

【制約条件】
- 結論が明確であること
- 理由と具体例が一貫していること
- 論理的に説得力があること`;

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();

        // Parse the response to get theme
        const lines = text.split('\n').filter(line => line.trim());
        const theme = lines.find(line => !line.includes('回答例') && !line.includes('トレーニングの目的') && !line.includes('制約条件')) || 'リモートワークのメリットをPREP法で伝えてください。';

        result = {
          question: theme,
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
        const prompt = `以下の形式で、Fog Catcher（思考の霧払い）のためのテーマを生成してください。

【テーマ】
${['今の頭の中にある「ぼんやりとした悩み」', '最近感じた「漠然とした不安」', '最近のモヤモヤした感情', '言いにくい思考', '将来への不確かな思い'][Math.floor(Math.random() * 6)]}

【テーマの説明】
（このテーマについて、自分の思考や感情を率直に書き出すためのガイドラインを1〜2文で説明）

【トレーニングの目的】
Fog Catcherは、頭の中にあるぼんやりとした思考や感情を、無制限に、編集せずに、そのまま書き出すことで思考を整理・明確化するためのトレーニングです。言葉にすることで、霧が晴れ、思考がクリアになります。

【制約条件】
- 思考や感情を率直に表現すること
- 編集せずに書き出すこと
- �語化することで思考を整理すること`;

        const aiResult = await textModel.generateContent(prompt);
        const text = aiResult.response.text().trim();

        // Parse the response to get theme and description
        const lines = text.split('\n').filter(line => line.trim());
        const theme = lines[0] || '今の頭の中にある「ぼんやりとした悩み」';
        const description = lines.slice(1).join(' ') || '思考や感情を制限なしで自由に書き出してください。';

        result = {
          question: theme,
          description: `思考や感情を制限なしで自由に書き出してください。編集せず、そのままの言葉で書くことで、思考の霧を晴らすことができます。${description}`
        };
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
