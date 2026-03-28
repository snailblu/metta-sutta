import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MettaTranslator from "./MettaTranslator";

// Mock @ai-sdk/react
vi.mock("@ai-sdk/react", () => ({
  experimental_useObject: vi.fn(() => ({
    object: null,
    submit: vi.fn(),
    isLoading: false,
    error: null,
  })),
}));

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as unknown as typeof fetch;

describe("MettaTranslator", () => {
  it("renders the translator component", () => {
    render(<MettaTranslator />);

    // Check for main title - use function matcher for split text
    expect(
      screen.getByText((content, element) => {
        return element?.textContent === "🧘 경전 분석기";
      })
    ).toBeInTheDocument();

    // Check for input label
    expect(screen.getByLabelText("빨리어 또는 영어 문구를 입력하세요")).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByText("분석 시작")).toBeInTheDocument();
  });

  it("renders history toggle button", () => {
    render(<MettaTranslator />);

    const historyButton = screen.getByText("📚 히스토리 보기");
    expect(historyButton).toBeInTheDocument();
  });

  it("renders textarea with default value", () => {
    render(<MettaTranslator />);

    const textarea = screen.getByPlaceholderText("예: Sabbe sattā bhavantu sukhitattā");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue("Sabbe sattā bhavantu sukhitattā");
  });
});
