'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
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

interface Translation {
  _id: string;
  original: string;
  result: {
    original: string;
    pali_analysis: Array<{
      word: string;
      grammar: string;
      meaning: string;
      note?: string;
    }>;
    translations: {
      literal: string;
      zen_style: string;
    };
    commentary: string;
  };
  createdAt: number;
}

export default function MettaTranslator() {
  const { object, submit, isLoading, error } = useObject({
    api: '/api/analyze',
    schema: analysisSchema,
  });

  const [input, setInput] = useState('Sabbe sattā bhavantu sukhitattā');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Translation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 에러 발생 시 팝업 표시
  useEffect(() => {
    if (error) {
      setShowErrorPopup(true);
    }
  }, [error]);

  // 분석 완료 후 저장
  useEffect(() => {
    if (object && !isLoading) {
      saveTranslation(object);
      loadHistory();
    }
  }, [object, isLoading]);

  const saveTranslation = async (result: any) => {
    try {
      await fetch('/api/translations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: result.original,
          result,
        }),
      });
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/translations/list');
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error('Load history failed:', error);
    }
  };

  const searchHistory = async (query: string) => {
    try {
      const res = await fetch(`/api/translations/list?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 히스토리 섹션 */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) loadHistory();
          }}
          className="text-blue-600 hover:text-blue-700 font-medium mb-2 flex items-center gap-1"
        >
          {showHistory ? '📚 숨기' : '📚 히스토리 보기'}
        </button>

        {showHistory && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="mb-3">
              <input
                type="text"
                placeholder="검색어 입력..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    searchHistory(e.target.value);
                  } else {
                    loadHistory();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">아직 번역 기록이 없습니다.</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      setInput(item.original);
                      setShowHistory(false);
                    }}
                    className="w-full text-left p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                  >
                    <p className="text-sm text-gray-800 font-medium">{item.original}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(item.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>🧘</span> 경전 분석기
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

      {/* 에러 팝업 */}
      {showErrorPopup && error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-xl font-bold text-red-600">분석 오류</h3>
            </div>
            <p className="text-gray-700 mb-4">
              AI 분석 중 오류가 발생했습니다.
            </p>
            <div className="bg-red-50 p-3 rounded-lg mb-4 text-sm text-red-700 break-all">
              {error.message || '알 수 없는 오류'}
            </div>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
            >
              닫기
            </button>
          </div>
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
                <span className="text-sm font-medium text-blue-500 uppercase tracking-wide">의역 (수행적 번역)</span>
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
    </div>
  );
}
