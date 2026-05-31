import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnalysisResult, TranslationHistoryItem } from "@/lib/translations";
import MettaTranslator from "./MettaTranslator";
import { logger } from "@/lib/logger";

const mockUseObject = vi.fn();
const mockFetch = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  experimental_useObject: () => mockUseObject(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

function createFetchResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } as Response;
}

const analysisResult: AnalysisResult = {
  original: "Sabbe sattā bhavantu sukhitattā",
  translations: {
    literal: "May all beings be happy-minded.",
    zen_style: "May all beings rest in ease.",
    chineseTranslation: "一切有情",
  },
  commentary: "A wish for universal well-being.",
  pali_analysis: [
    {
      word: "Sabbe",
      grammar: "adjective",
      meaning: "all",
      chineseMeaning: "一切",
    },
    {
      word: "sattā",
      grammar: "noun",
      meaning: "beings",
      chineseMeaning: "有情",
    },
  ],
};

const historyItem: TranslationHistoryItem = {
  _id: "test-id-1",
  original: analysisResult.original,
  result: analysisResult,
  createdAt: new Date("2025-01-02T03:04:05Z").getTime(),
};

describe("MettaTranslator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);

    mockUseObject.mockReturnValue({
      object: null,
      submit: vi.fn(),
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits the current input and shows loading state", async () => {
    const submit = vi.fn();
    const user = userEvent.setup();

    mockUseObject.mockReturnValue({
      object: null,
      submit,
      isLoading: true,
      error: null,
    });

    const { rerender } = render(<MettaTranslator />);

    expect(screen.getByRole("button", { name: /분석 중/i })).toBeDisabled();

    mockUseObject.mockReturnValue({
      object: null,
      submit,
      isLoading: false,
      error: null,
    });

    rerender(<MettaTranslator />);

    const textarea = screen.getByLabelText("빨리어 또는 영어 문구를 입력하세요");
    await user.clear(textarea);
    await user.type(textarea, "Metta for everyone");
    await user.click(screen.getByRole("button", { name: "분석 시작" }));

    expect(submit).toHaveBeenCalledWith({ prompt: "Metta for everyone" });

    await user.clear(textarea);
    expect(screen.getByRole("button", { name: "분석 시작" })).toBeDisabled();
  });

  it("renders analysis results and persists them after a completed response", async () => {
    // saveTranslation POST + loadHistory GET (both fire on mount when object is set)
    mockFetch
      .mockResolvedValueOnce(createFetchResponse({ success: true, id: "test-id-1" }))
      .mockResolvedValueOnce(createFetchResponse([]));

    mockUseObject.mockReturnValue({
      object: analysisResult,
      submit: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<MettaTranslator />);

    expect(screen.getByText("May all beings be happy-minded.")).toBeInTheDocument();
    expect(screen.getByText('"May all beings rest in ease."')).toBeInTheDocument();
    expect(screen.getByText("A wish for universal well-being.")).toBeInTheDocument();
    expect(screen.getByText("Sabbe")).toBeInTheDocument();
    expect(screen.getByText("sattā")).toBeInTheDocument();
    expect(screen.getByText("一切")).toBeInTheDocument();
    expect(screen.getByText("有情")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // Verify saveTranslation call
    const saveCall = mockFetch.mock.calls[0];
    expect(saveCall[0]).toBe("/api/translations/save");
    expect(saveCall[1].method).toBe("POST");
    expect(saveCall[1].headers).toEqual({ "Content-Type": "application/json" });
    const saveBody = JSON.parse(saveCall[1].body);
    expect(saveBody.original).toBe(analysisResult.original);
    expect(saveBody.result).toEqual(analysisResult);

    // Verify loadHistory call
    const loadCall = mockFetch.mock.calls[1];
    expect(loadCall[0]).toBe("/api/translations/list");
    expect(loadCall[1]).toBeUndefined();
  });

  it("shows and dismisses the error popup when analysis fails", async () => {
    const user = userEvent.setup();

    mockUseObject.mockReturnValue({
      object: null,
      submit: vi.fn(),
      isLoading: false,
      error: new Error("API exploded"),
    });

    render(<MettaTranslator />);

    expect(screen.getByText("분석 오류")).toBeInTheDocument();
    expect(screen.getByText("API exploded")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "닫기" }));

    await waitFor(() => {
      expect(screen.queryByText("분석 오류")).not.toBeInTheDocument();
    });
  });

  it("loads history, supports search, shows detail, and reanalyzes a saved item", async () => {
    const submit = vi.fn();
    const user = userEvent.setup();

    // Use mockImplementation to handle per-character fetch calls from user.type
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("?q=")) {
        const query = decodeURIComponent(url.split("q=")[1]);
        if (query.includes("mett") || query.includes("ā")) {
          return Promise.resolve(createFetchResponse([]));
        }
        return Promise.resolve(createFetchResponse([historyItem]));
      }
      return Promise.resolve(createFetchResponse([historyItem]));
    });

    mockUseObject.mockReturnValue({
      object: null,
      submit,
      isLoading: false,
      error: null,
    });

    render(<MettaTranslator />);

    await user.click(screen.getByRole("button", { name: "📚 히스토리 보기" }));

    expect(
      await screen.findByRole("button", {
        name: new RegExp(historyItem.original),
      })
    ).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("검색어 입력...");
    await user.type(searchInput, "Sabbe");

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/translations/list?q=Sabbe");
    });

    await user.clear(searchInput);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/translations/list");
    });

    await user.clear(searchInput);
    await user.type(searchInput, "mettā");

    expect(await screen.findByText("아직 번역 기록이 없습니다.")).toBeInTheDocument();

    await user.clear(searchInput);
    expect(
      await screen.findByRole("button", {
        name: new RegExp(historyItem.original),
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(historyItem.original),
      })
    );

    expect(await screen.findByText("📚 저장된 분석 결과")).toBeInTheDocument();
    expect(screen.getByText("May all beings be happy-minded.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "🔄 다시 분석" }));

    expect(submit).toHaveBeenCalledWith({ prompt: historyItem.original });
    await waitFor(() => {
      expect(screen.queryByText("📚 저장된 분석 결과")).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText("검색어 입력...")).not.toBeInTheDocument();
    });
  });

  it("logs save, load, and search failures", async () => {
    const user = userEvent.setup();

    // Use mockImplementation with URL-based routing:
    // - saveTranslation POST → rejected (logs "Save translation failed")
    // - 1st loadHistory (useEffect) → rejected (logs "Load translation history failed")
    // - subsequent loadHistory → succeeds (empty)
    // - searchHistory → rejected (logs "Search translation history failed")
    let loadCallCount = 0;
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/translations/save") {
        return Promise.reject(new Error("save failed"));
      }
      if (url.includes("?q=")) {
        return Promise.reject(new Error("search failed"));
      }
      // loadHistory calls
      loadCallCount++;
      if (loadCallCount === 1) {
        return Promise.reject(new Error("load failed"));
      }
      return Promise.resolve(createFetchResponse([]));
    });

    mockUseObject.mockReturnValue({
      object: analysisResult,
      submit: vi.fn(),
      isLoading: false,
      error: null,
    });

    render(<MettaTranslator />);

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith("Save translation failed", expect.any(Error));
      expect(logger.error).toHaveBeenCalledWith(
        "Load translation history failed",
        expect.any(Error)
      );
    });

    await user.click(screen.getByRole("button", { name: "📚 히스토리 보기" }));
    await user.type(screen.getByPlaceholderText("검색어 입력..."), "mettā");

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(
        "Search translation history failed",
        expect.any(Error)
      );
    });
  });
});
