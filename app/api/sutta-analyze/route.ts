import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";
import { SUTTA_ANALYSIS_PROMPT } from "@/lib/ai/sutta-prompts";
import { logger } from "@/lib/logger";

// 최대 실행 시간 설정 (Vercel 호환)
export const maxDuration = 120;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

// Zod 스키마 정의: 구절 분석 응답 구조
const suttaAnalysisSchema = z.object({
  segments: z.array(
    z.object({
      segmentId: z.string().describe("구절 ID"),
      original: z.string().describe("해당 구절의 빨리어 원문"),
      pali_analysis: z
        .array(
          z.object({
            word: z.string().describe("빨리어 단어"),
            grammar: z.string().describe("문법 분석 (품사/성/수/격)"),
            meaning: z.string().describe("단어의 의미"),
            chineseMeaning: z.string().optional().describe("한자 뜻 (1-3자 한자로 간결하게)"),
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
    })
  ),
  overallCommentary: z.string().describe("이 구절 그룹 전체에 대한 수행적 해설"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { segments, context } = body as {
      segments?: Array<{ id: string; pali: string }>;
      context?: string;
    };

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return new Response(
        JSON.stringify({ error: "segments is required and must be a non-empty array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 프롬프트에 context 주입
    const systemPrompt = SUTTA_ANALYSIS_PROMPT.replace("{context}", context || "알 수 없는 경전");

    // 구절 목록을 프롬프트로 구성
    const prompt = segments.map((s, i) => `[${i + 1}] ID: ${s.id}\n빨리어: ${s.pali}`).join("\n\n");

    const result = streamObject({
      model: google("gemini-2.5-flash"),
      schema: suttaAnalysisSchema,
      system: systemPrompt,
      prompt: prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    logger.error("Sutta Analyze API error", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
