import { z } from "zod";

export const analysisSchema = z.object({
  original: z.string(),
  pali_analysis: z.array(
    z.object({
      word: z.string(),
      grammar: z.string(),
      meaning: z.string(),
      chineseMeaning: z.string().optional(),
      note: z.string().optional(),
    })
  ),
  translations: z.object({
    literal: z.string(),
    zen_style: z.string(),
    chineseTranslation: z.string(),
  }),
  commentary: z.string(),
});

export type AnalysisResult = z.infer<typeof analysisSchema>;

export interface TranslationHistoryItem {
  _id: string;
  original: string;
  result: AnalysisResult;
  createdAt: number;
}

export interface StoredTranslationRecord {
  _id: string;
  original: string;
  result: string;
  createdAt: number;
}
