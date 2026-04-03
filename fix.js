const fs = require("fs");
const code = "import { NextRequest, NextResponse } from \"next/server\";\n" +
"import { GoogleGenerativeAI } from \"@google/generative-ai\";\n" +
"const apiKey = process.env.GOOGLE_AI_API_KEY || \"\";\n" +
"const genAI = new GoogleGenerativeAI(apiKey);\n" +
"const textModel = genAI.getGenerativeModel({ model: \"gemini-3-flash-preview\" });\n" +
"const imageModel = genAI.getGenerativeModel({ model: \"gemini-3.1-flash-image-preview\" });\n" +
"export async function POST(request: NextRequest) {\n" +
"  try {\n" +
"    const body = await request.json();\n" +
"    const { type } = body;\n" +
"    let result: any = null;\n" +
"    switch (type) {\n" +
"      case \"abduction\": result = { phenomenon: \"G\", steps: [{ step: 1, label: \"L\", placeholder: \"P\" }] }; break;\n" +
"      case \"synapse\": result = { word1: \"A\", word2: \"B\" }; break;\n" +
"      case \"metaphor\": result = { concept: \"C\" }; break;\n" +
"      case \"abduction-lens\": result = { description: \"D\", imageUrl: \"https://picsum.photos/200\", steps: [{ step: 1, label: \"L\", placeholder: \"P\" }] }; break;\n" +
"      default: result = { prompts: [\"P\"], steps: [{ step: 1, label: \"L\", placeholder: \"P\" }] }; break;\n" +
"    }\n" +
"    return NextResponse.json(result);\n" +
"  } catch (error) {\n" +
"    return NextResponse.json({ error: \"E\" }, { status: 500 });\n" +
"  }\n" +
"}";
fs.writeFileSync("app/api/ai/generate-prompt/route.ts", code);
