import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';
import { METTA_SYSTEM_PROMPT } from '@/lib/ai/prompts';

// 최대 실행 시간 설정 (Vercel 호환)
export const maxDuration = 60;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

// Zod 스키마 정의: AI 응답 구조 강제
const analysisSchema = z.object({
  original: z.string().describe('사용자가 입력한 원본 문구'),
  pali_analysis: z.array(z.object({
    word: z.string().describe('빨리어 단어'),
    grammar: z.string().describe('문법 분석 (품사/성/수/격)'),
    meaning: z.string().describe('단어의 의미'),
    note: z.string().optional().describe('추가 설명 또는 어원'),
  })).describe('단어별 문법 및 의미 분석'),
  translations: z.object({
    literal: z.string().describe('문법에 충실한 직역'),
    zen_style: z.string().describe('백봉 스타일의 수행적 의역'),
  }),
  commentary: z.string().describe('백봉 스타일의 수행 해설 (2~3문장)'),
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamObject({
    model: google('models/gemini-3-flash-preview'), // Gemini 3.0 Flash Preview 시도
    schema: analysisSchema,
    system: METTA_SYSTEM_PROMPT,
    prompt: prompt,
  });

  return result.toTextStreamResponse();
}
