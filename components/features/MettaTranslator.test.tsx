import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnalysisResult, TranslationHistoryItem } from "@/lib/translations";
import MettaTranslator from "./MettaTranslator";
import { logger } from "@/lib/logger";

const mockUseObject = vi.fn();

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
  _id: "history-1",
  original: analysisResult.original,
  result: analysisResult,
  createdAt: new Date("2025-01-02T03:04:05Z").getTime(),
};

describe("MettaTranslator", () => {
  beforeEach(() => {
    mockUseObject.mockReturnValue({
      object: null,
      submit: vi.fn(),
      isLoading: false,
      error: null,
    });
    global.fetch = vi.fn();
    vi.clearAllMocks();
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
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/translations/save") {
        return {
          json: vi.fn().mockResolvedValue({ ok: true }),
        } as unknown as Response;
      }

      if (url === "/api/translations/list") {
        return {
          json: vi.fn().mockResolvedValue([historyItem]),
        } as unknown as Response;
      }

      throw new Error(`Unexpected fetch: ${url} ${JSON.stringify(init)}`);
    });

    global.fetch = fetchMock;
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
      const saveCall = fetchMock.mock.calls.find(call => call[0] === "/api/translations/save");
      expect(saveCall).toBeTruthy();

      const [, init] = saveCall as [string, RequestInit];
      expect(init?.method).toBe("POST");
      expect(init?.headers).toEqual({ "Content-Type": "application/json" });

      const body = JSON.parse(String(init?.body));
      expect(body.original).toBe(analysisResult.original);
      expect(body.result).toMatchObject(analysisResult);

      expect(fetchMock).toHaveBeenCalledWith("/api/translations/list");
    });
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
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/translations/list") {
        return {
          json: vi.fn().mockResolvedValue([historyItem]),
        } as unknown as Response;
      }

      if (url === "/api/translations/list?q=Sabbe") {
        return {
          json: vi.fn().mockResolvedValue([historyItem]),
        } as unknown as Response;
      }

      if (url === "/api/translations/list?q=mett%C4%81") {
        return {
          json: vi.fn().mockResolvedValue([]),
        } as unknown as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    global.fetch = fetchMock;
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
      expect(fetchMock).toHaveBeenCalledWith("/api/translations/list?q=Sabbe");
    });

    await user.clear(searchInput);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/translations/list");
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
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/translations/save") {
        throw new Error("save failed");
      }

      if (url === "/api/translations/list") {
        throw new Error("load failed");
      }

      if (url === "/api/translations/list?q=mett%C4%81") {
        throw new Error("search failed");
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    global.fetch = fetchMock;
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
