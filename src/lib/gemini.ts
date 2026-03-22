import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) throw new Error("NEXT_PUBLIC_GEMINI_API_KEY가 .env.local에 설정되지 않았습니다.");

const genAI = new GoogleGenerativeAI(apiKey);
export const gemini = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    thinkingConfig: {
      thinkingBudget: 2048,
    },
  } as never,
});
