import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";
import { METTA_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { logger } from "@/lib/logger";

// 최대 실행 시간 설정 (Vercel 호환)
export const maxDuration = 60;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

// Zod 스키마 정의: AI 응답 구조 강제
const analysisSchema = z.object({
  original: z.string().describe("사용자가 입력한 원본 문구"),
  pali_analysis: z
    .array(
      z.object({
        word: z.string().describe("빨리어 단어"),
        grammar: z.string().describe("문법 분석 (품사/성/수/격)"),
        meaning: z.string().describe("단어의 의미"),
        note: z.string().optional().describe("추가 설명 또는 어원"),
      })
    )
    .describe("단어별 문법 및 의미 분석"),
  translations: z.object({
    literal: z.string().describe("문법에 충실한 직역"),
    zen_style: z.string().describe("백봉 스타일의 수행적 의역"),
    chineseTranslation: z.string().describe("한문 번역 (한자로 표현한 불교 번역)"),
  }),
  commentary: z.string().describe("백봉 스타일의 수행 해설 (2~3문장)"),
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = streamObject({
      model: google("gemini-2.5-flash"), // Gemini 2.5 Flash (안정 버전)
      schema: analysisSchema,
      system: METTA_SYSTEM_PROMPT,
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    logger.error("Analyze API error", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
