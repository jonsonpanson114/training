const fs = require("fs");
const code = `import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_AI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const textModel = genAI ? genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }) : null;
const imageModel = genAI ? genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" }) : null;

function extractJsonObject(text) {
  const match = text.match(/\\{[\\s\\S]*\\}/);
  return match ? JSON.parse(match[0]) : null;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { type } = body;
    let result = {};

    if (type === "abduction-lens") {
      const description = "真夜中の廃校。音楽室のピアノが、誰もいないのに完璧なベートーヴェンを奏でている。窓の外には赤い月。";
      let imageUrl = "https://picsum.photos/seed/abduction/1200/800";
      if (imageModel) {
        try {
          const imgRes = await imageModel.generateContent("Create a cinematic, mysterious photo of a midnight music room with a piano and a red moon outside the window. No text.");
          const part = imgRes.response.candidates[0].content.parts.find(p => p.inlineData);
          if (part) imageUrl = "data:" + part.inlineData.mimeType + ";base64," + part.inlineData.data;
        } catch (e) {}
      }
      result = {
        description,
        imageUrl,
        steps: [
          { step: 1, label: "❶ 観察事実", placeholder: "目に見える違和感を書き出せ" },
          { step: 2, label: "❷ 飛躍的仮説", placeholder: "裏で何が起きている？" },
          { step: 3, label: "❸ 推論の連結", placeholder: "なぜそう思った？" }
        ]
      };
    } else if (type === "analogy") {
      result = {
        prompts: ["新規事業の立ち上げ|ジャズのセッション", "チームの不和|不協和音の調律"],
        steps: [
          { step: 1, label: "課題の分解", placeholder: "要素を抽出せよ" },
          { step: 2, label: "大テーマの原理", placeholder: "成功法則を書け" },
          { step: 3, label: "転用案", placeholder: "具体的なアクションは？" }
        ]
      };
    } else {
      result = {
        prompts: ["テストお題"],
        steps: [{ step: 1, label: "ステップ1", placeholder: "入力してください" }]
      };
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}`;
fs.writeFileSync("app/api/ai/generate-prompt/route.ts", code);
