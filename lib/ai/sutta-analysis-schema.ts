import { z } from "zod";

export const suttaAnalysisSchema = z.object({
  segments: z.array(
    z.object({
      segmentId: z.string(),
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
    })
  ),
  overallCommentary: z.string(),
});

export type SuttaAnalysisResult = z.infer<typeof suttaAnalysisSchema>;

export type SegmentAnalysisData = SuttaAnalysisResult["segments"][number];
