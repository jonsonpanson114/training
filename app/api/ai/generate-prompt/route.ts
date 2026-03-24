import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY || '';

// Text model - using absolute standard 3.1 model (NO FOSSILS like 1.5/2.0)
const genAI = new GoogleGenerativeAI(apiKey);
const textModel = genAI.getGenerativeModel({
  model: 'gemini-3-flash-preview',
});
const imageModel = genAI.getGenerativeModel({
  model: 'gemini-3-flash-preview',
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
      prompts?: string[];
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

        try {
          const aiResult = await textModel.generateContent(prompt);
          result = { phenomenon: aiResult.response.text().trim() };
        } catch (error) {
          console.error('AI generation error for abduction:', error);
          result = {
            phenomenon: 'オフィスの全員がサングラスをかけてキーボードを猛烈に叩いているがPCの電源はすべて落ちている'
          };
        }
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

        try {
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
        } catch (error) {
          console.error('AI generation error for synapse:', error);
          result = {
            word1: 'コーヒー',
            word2: '雲'
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

        try {
          const aiResult = await textModel.generateContent(prompt);
          const description = aiResult.response.text().trim();
          const seed = Math.floor(Math.random() * 1000);
          
          result = { 
            description,
            imageUrl: `https://picsum.photos/seed/${seed}/800/600?grayscale&blur=1`
          };
        } catch (error) {
          console.error('AI generation error for abduction-lens:', error);
          const seed = Math.floor(Math.random() * 1000);
          result = {
            description: '公園のベンチに置き去られた高級なハンドバッグ。周囲には誰もおらず、風が強く吹き抜けている',
            imageUrl: `https://picsum.photos/seed/${seed}/800/600?grayscale&blur=1`
          };
        }
        break;
      }

      case 'whysos': {
        const prompt = `なぜなぜ分析（5回のなぜ？）のための、日常的で深掘りしやすい「具体的な問題・課題」を3つ提案してください。

出力は以下のJSON形式のみにしてください：
{
  "prompts": ["課題1", "課題2", "課題3"]
}

条件：
- 日常的で、誰にでも起こりうる具体的な課題であること
- 日本語で自然な表現であること
- 深掘りが可能なものであること
- 各課題は簡潔に（25文字以内）`;

        let prompts = [
          '最近感じたイライラの原因',
          '仕事でミスをしてしまった背景',
          'ついついスマホを触ってしまう理由'
        ];

        try {
          const aiResult = await textModel.generateContent(prompt);
          const text = aiResult.response.text().trim();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            if (data.prompts && Array.isArray(data.prompts)) {
              prompts = data.prompts.slice(0, 3);
            }
          }
        } catch (error) {
          console.error('AI generation error for whysos:', error);
        }

        result = {
          question: '',
          prompts,
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
        const prompt = `「つまり何？」分析のための、抽象化・深掘りしやすい「事実やニュース」を3つ提案してください。

出力は以下のJSON形式のみにしてください：
{
  "prompts": ["事実1", "事実2", "事実3"]
}

条件：
- 具体的な事実や現象から始まるものであること
- 抽象度を上げられる余地があること
- 行動可能な教訓に落とし込めるものであること
- 各お題は簡潔に（25文字以内）`;

        let prompts = [
          '最近読んだ興味深いニュース',
          '仕事で学んだ小さな教訓',
          '街で見かけた不思議な流行'
        ];

        try {
          const aiResult = await textModel.generateContent(prompt);
          const text = aiResult.response.text().trim();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            if (data.prompts && Array.isArray(data.prompts)) {
              prompts = data.prompts.slice(0, 3);
            }
          }
        } catch (error) {
          console.error('AI generation error for sowhat:', error);
        }

        result = {
          question: '',
          prompts,
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
        const prompt = `5W1H分析のための、非常に長くて情報が入り乱れた「未整理の長文」を1つだけ提案してください。

出力は以下のJSON形式のみにしてください：
{
  "prompts": ["非常に長い文章"]
}

条件：
- 400〜600文字程度の重厚な文章にすること
- 話の筋が何度も横道に逸れたり、話し手の個人的な感想や細かい状況描写、無関係なノイズ情報が大量に含まれていること
- 5W1H（いつ、どこで、誰が、何を、なぜ、どのように）の要素が、文章のあちこちに断片的に散らばっていること
- 読んだ瞬間に「うわっ、長いし分かりにくいな」と思わせる「整理しがいのある」内容にすること
- ビジネスのトラブル報告、あるいは非常に複雑な事件の目撃証言のようなシチュエーションをイメージすること

例：
「いや、本当に参りましたよ。実は今日の午後、あ、正確には昼食を済ませてからだから13時半くらいのことだったかな……」から始まり、余計な描写（コーヒーの味、天候、過去の愚ぐ痴など）を交えつつ、最終的に重要な5W1Hを抽出させる。`;

        let prompts = [
          'ええと、お疲れ様です。実は今さっき報告が入ったんですけど、例の新製品の発表イベント、来週の月曜にあるじゃないですか。銀座のメインホールでやるやつです。あそこで使う予定だった巨大なデジタルサイネージ、さっき設営チームの田中くんから電話があって、どうも運搬中にトラックが急ブレーキを踏んだ拍子に固定が外れて、画面が派手に割れちゃったらしいんですよ。田中くんもかなり動揺してて、説明がしどろもどろだったんですけど。そもそも今回のイベント、去年の実績を上回るために予算もかなりつぎ込んでて、役員も期待してるわけじゃないですか。僕も昨日はその準備で徹夜気味で、さっきまでデスクで少し意識が飛んでたくらいなんですけど。それで、代替品を探そうにも、あのサイズの特注モニターって今国内に在庫がほとんどないらしくて。田中くんが知り合いの業者を片っ端から当たってくれてるんですけど、今のところ最速でも火曜日着になっちゃうみたいで。でも月曜の朝一にはリハーサルが始まるし、広報ももう各メディアに案内を送っちゃってるから、簡単に延期もできないですよね……。それで今、急遽展示内容をパネル形式に差し替えるか、あるいはプロジェクターで代用できないか検討してるんですが、機材の手配を夕方までに確定させないと、設営スケジュールが完全に崩壊しちゃうんです。もう、本当にどこで誰がミスしたのか突き止めたい気分ですけど、今は高橋部長をどう説得するかが一番の懸念事項で……。'
        ];

        try {
          const aiResult = await textModel.generateContent(prompt);
          const text = aiResult.response.text().trim();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            if (data.prompts && Array.isArray(data.prompts)) {
              prompts = data.prompts.slice(0, 1);
            }
          }
        } catch (error) {
          console.error('AI generation error for 5w1h:', error);
        }

        result = {
          question: '',
          prompts,
          steps: [
            { step: 1, label: 'When（いつ）', placeholder: 'いつの出来事ですか？' },
            { step: 2, label: 'Where（どこ）', placeholder: 'どこでの出来事ですか？' },
            { step: 3, label: 'Who（誰）', placeholder: '誰が関わっていますか？' },
            { step: 4, label: 'What（何）', placeholder: '何が起こりましたか？' },
            { step: 5, label: 'Why（なぜ）', placeholder: 'なぜそれが起こった、あるいはそうなったのですか？' },
            { step: 6, label: 'How（どのように）', placeholder: 'どのように対処、あるいは解決しましたか？' }
          ]
        };
        break;
      }

      case 'prep': {
        const prompt = `PREP法（結論-理由-具体例-結論）のための、説得力が必要な「主張・テーマ」を3つ提案してください。

出力は以下のJSON形式のみにしてください：
{
  "prompts": ["テーマ1", "テーマ2", "テーマ3"]
}

条件：
- 賛否がある、あるいは説明が必要な主張であること
- 理由と具体例を挙げやすいものであること
- 各テーマは簡潔に（25文字以内）`;

        let prompts = [
          'リモートワークの効率性',
          '朝型の生活を送るべき理由',
          '読書が人生に与える影響'
        ];

        try {
          const aiResult = await textModel.generateContent(prompt);
          const text = aiResult.response.text().trim();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            if (data.prompts && Array.isArray(data.prompts)) {
              prompts = data.prompts.slice(0, 3);
            }
          }
        } catch (error) {
          console.error('AI generation error for prep:', error);
        }

        result = {
          question: '',
          prompts,
          steps: [
            { step: 1, label: 'Point（結論）', placeholder: '一番伝えたい主張を述べてください' },
            { step: 2, label: 'Reason（理由）', placeholder: 'なぜそう言えるのか、理由を説明してください' },
            { step: 3, label: 'Example（具体例）', placeholder: '納得感を高めるための具体例を挙げてください' },
            { step: 4, label: 'Point（結論）', placeholder: '最後にもう一度、結論を強調してください' }
          ]
        };
        break;
      }

      case 'fogcatcher': {
        const prompt = `Fog Catcher（思考の霧払い）のための、内省に適した「抽象的なテーマ」を3つ提案してください。

出力は以下のJSON形式のみにしてください：
{
  "prompts": ["テーマ1", "テーマ2", "テーマ3"]
}

条件：
- 思考や感情を率直に書き出しやすいもの
- 普段は言葉にしないような曖昧な感情や状態
- 各テーマは簡潔に（25文字以内）`;

        let prompts = [
          '今の頭の中にある漠然とした不安',
          '自分にとっての理想の休息',
          '最近感じた言葉にできない違和感'
        ];

        try {
          const aiResult = await textModel.generateContent(prompt);
          const text = aiResult.response.text().trim();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            if (data.prompts && Array.isArray(data.prompts)) {
              prompts = data.prompts.slice(0, 3);
            }
          }
        } catch (error) {
          console.error('AI generation error for fogcatcher:', error);
        }

        result = {
          question: '',
          prompts,
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
