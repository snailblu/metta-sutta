'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { useState } from 'react';
import { z } from 'zod';

// Zod 스키마 정의 (서버와 동일)
const analysisSchema = z.object({
  original: z.string(),
  pali_analysis: z.array(z.object({
    word: z.string(),
    grammar: z.string(),
    meaning: z.string(),
    note: z.string().optional(),
  })),
  translations: z.object({
    literal: z.string(),
    zen_style: z.string(),
  }),
  commentary: z.string(),
});

export default function MettaTranslator() {
  const { object, submit, isLoading, error } = useObject({
    api: '/api/analyze',
    schema: analysisSchema,
  });

  const [input, setInput] = useState('Sabbe sattā bhavantu sukhitattā');

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>🧘</span> 백봉 스타일 경전 분석기
      </h2>

      {/* 입력 영역 */}
      <div className="mb-6">
        <label htmlFor="pali-input" className="block text-lg font-medium text-gray-700 mb-2">
          빨리어 또는 영어 문구를 입력하세요
        </label>
        <textarea
          id="pali-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-4 text-xl border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all min-h-[120px]"
          placeholder="예: Sabbe sattā bhavantu sukhitattā"
        />
        <button
          onClick={() => submit({ prompt: input })}
          disabled={isLoading || !input.trim()}
          className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xl font-bold rounded-xl transition-colors shadow-md flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin text-2xl">⏳</span> 분석 중...
            </>
          ) : (
            '분석 시작'
          )}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
          ⚠️ 오류가 발생했습니다: {error.message}
        </div>
      )}

      {/* 결과 영역 (스트리밍) */}
      {object && (
        <div className="space-y-8 animate-fade-in">
          {/* 1. 번역 (가장 중요) */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">📜 번역</h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-blue-500 uppercase tracking-wide">직역 (그대로 옮김)</span>
                <p className="text-lg text-gray-800 mt-1">{object.translations?.literal}</p>
              </div>
              <div className="pt-4 border-t border-blue-200">
                <span className="text-sm font-medium text-blue-500 uppercase tracking-wide">백봉 스타일 (의역)</span>
                <p className="text-2xl font-bold text-blue-900 mt-2 leading-relaxed">
                  "{object.translations?.zen_style}"
                </p>
              </div>
            </div>
          </div>

          {/* 2. 해설 */}
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <h3 className="text-xl font-semibold text-green-900 mb-3">🧘 도반의 해설</h3>
            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
              {object.commentary}
            </p>
          </div>

          {/* 3. 단어 분석 (표) */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 단어 하나하나 뜯어보기</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300 text-gray-500 text-sm">
                    <th className="py-2 px-3">단어 (Pali)</th>
                    <th className="py-2 px-3">문법</th>
                    <th className="py-2 px-3">뜻</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {object.pali_analysis?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-100 transition-colors">
                      <td className="py-3 px-3 font-medium text-gray-900">{item?.word}</td>
                      <td className="py-3 px-3 text-sm text-gray-600">{item?.grammar}</td>
                      <td className="py-3 px-3 text-gray-800">{item?.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
