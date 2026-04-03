import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = process.env.GOOGLE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const textModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
const imageModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;
    let result: any = null;
    switch (type) {
      case "abduction": result = { phenomenon: "G", steps: [{ step: 1, label: "L", placeholder: "P" }] }; break;
      case "synapse": result = { word1: "A", word2: "B" }; break;
      case "metaphor": result = { concept: "C" }; break;
      case "abduction-lens": result = { description: "D", imageUrl: "https://picsum.photos/200", steps: [{ step: 1, label: "L", placeholder: "P" }] }; break;
      default: result = { prompts: ["P"], steps: [{ step: 1, label: "L", placeholder: "P" }] }; break;
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "E" }, { status: 500 });
  }
}