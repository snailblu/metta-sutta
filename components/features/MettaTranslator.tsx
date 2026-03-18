"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import { z } from "zod";

// Zod 스키마 정의 (서버와 동일)
const analysisSchema = z.object({
  original: z.string(),
  pali_analysis: z.array(
    z.object({
      word: z.string(),
      grammar: z.string(),
      meaning: z.string(),
      note: z.string().optional(),
    })
  ),
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
    api: "/api/analyze",
    schema: analysisSchema,
  });

  const [input, setInput] = useState("Sabbe sattā bhavantu sukhitattā");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Translation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHistory, setSelectedHistory] = useState<Translation | null>(null);

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
      await fetch("/api/translations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original: result.original,
          result,
        }),
      });
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/translations/list");
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error("Load history failed:", error);
    }
  };

  const searchHistory = async (query: string) => {
    try {
      const res = await fetch(`/api/translations/list?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleReanalyze = (original: string) => {
    setInput(original);
    setSelectedHistory(null);
    setShowHistory(false);
    submit({ prompt: original });
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
          {showHistory ? "📚 숨기" : "📚 히스토리 보기"}
        </button>

        {showHistory && (
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
            <div className="mb-3">
              <input
                type="text"
                placeholder="검색어 입력..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    searchHistory(e.target.value);
                  } else {
                    loadHistory();
                  }
                }}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-500 text-sm text-center py-4">
                  아직 번역 기록이 없습니다.
                </p>
              ) : (
                history.map(item => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedHistory(item)}
                    className="w-full text-left p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                  >
                    <p className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">
                      {item.original}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 truncate">
                      {new Date(item.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 히스토리 상세 모달 */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                📚 저장된 분석 결과
              </h3>
              <button
                onClick={() => setSelectedHistory(null)}
                className="text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* 저장된 결과 표시 */}
            <div className="space-y-6">
              {/* 번역 */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">📜 번역</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-blue-500">직역</span>
                    <p className="text-neutral-900 dark:text-neutral-100 mt-1">
                      {selectedHistory.result.translations?.literal}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-blue-200">
                    <span className="text-sm font-medium text-blue-500">의역</span>
                    <p className="text-xl font-bold text-blue-900 mt-1">
                      "{selectedHistory.result.translations?.zen_style}"
                    </p>
                  </div>
                </div>
              </div>

              {/* 해설 */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="text-lg font-semibold text-green-900 mb-2">🧘 도반의 해설</h4>
                <p className="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                  {selectedHistory.result.commentary}
                </p>
              </div>

              {/* 단어 분석 */}
              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  🔍 단어 분석
                </h4>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-500 text-sm">
                      <th className="py-2 px-2">단어</th>
                      <th className="py-2 px-2">문법</th>
                      <th className="py-2 px-2">뜻</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {selectedHistory.result.pali_analysis?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-2 font-medium">{item?.word}</td>
                        <td className="py-2 px-2 text-sm text-neutral-600 dark:text-neutral-400">
                          {item?.grammar}
                        </td>
                        <td className="py-2 px-2">{item?.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 버튼 */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleReanalyze(selectedHistory.original)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                🔄 다시 분석
              </button>
              <button
                onClick={() => setSelectedHistory(null)}
                className="flex-1 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 font-bold rounded-xl transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-100 dark:border-neutral-800">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <span>🧘</span> 경전 분석기
        </h2>

        {/* 입력 영역 */}
        <div className="mb-6">
          <label
            htmlFor="pali-input"
            className="block text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2"
          >
            빨리어 또는 영어 문구를 입력하세요
          </label>
          <textarea
            id="pali-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full p-4 text-xl border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all min-h-[120px] bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            placeholder="예: Sabbe sattā bhavantu sukhitattā"
          />
          <button
            onClick={() => submit({ prompt: input })}
            disabled={isLoading || !input.trim()}
            className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 text-white text-xl font-bold rounded-xl transition-colors shadow-md flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin text-2xl">⏳</span> 분석 중...
              </>
            ) : (
              "분석 시작"
            )}
          </button>
        </div>

        {/* 에러 팝업 */}
        {showErrorPopup && error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200 dark:border-red-900">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">⚠️</span>
                <h3 className="text-xl font-bold text-red-600">분석 오류</h3>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                AI 분석 중 오류가 발생했습니다.
              </p>
              <div className="bg-red-50 p-3 rounded-lg mb-4 text-sm text-red-700 break-all">
                {error.message || "알 수 없는 오류"}
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
                  <span className="text-sm font-medium text-blue-500 uppercase tracking-wide">
                    직역 (그대로 옮김)
                  </span>
                  <p className="text-lg text-neutral-900 dark:text-neutral-100 mt-1">
                    {object.translations?.literal}
                  </p>
                </div>
                <div className="pt-4 border-t border-blue-200">
                  <span className="text-sm font-medium text-blue-500 uppercase tracking-wide">
                    의역 (수행적 번역)
                  </span>
                  <p className="text-2xl font-bold text-blue-900 mt-2 leading-relaxed">
                    "{object.translations?.zen_style}"
                  </p>
                </div>
              </div>
            </div>

            {/* 2. 해설 */}
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
              <h3 className="text-xl font-semibold text-green-900 mb-3">🧘 도반의 해설</h3>
              <p className="text-lg text-neutral-900 dark:text-neutral-100 leading-relaxed whitespace-pre-wrap">
                {object.commentary}
              </p>
            </div>

            {/* 3. 단어 분석 (표) */}
            <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                🔍 단어 하나하나 뜯어보기
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-500 text-sm">
                      <th className="py-2 px-3">단어 (Pali)</th>
                      <th className="py-2 px-3">문법</th>
                      <th className="py-2 px-3">뜻</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {object.pali_analysis?.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <td className="py-3 px-3 font-medium text-neutral-900 dark:text-neutral-100">
                          {item?.word}
                        </td>
                        <td className="py-3 px-3 text-sm text-neutral-600 dark:text-neutral-400">
                          {item?.grammar}
                        </td>
                        <td className="py-3 px-3 text-neutral-900 dark:text-neutral-100">
                          {item?.meaning}
                        </td>
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
