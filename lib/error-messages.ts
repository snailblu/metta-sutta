/**
 * 에러 분류 및 사용자 친화적 메시지 변환 유틸리티
 */

export type ErrorCategory = "credit" | "timeout" | "general";

const CREDIT_KEYWORDS = [
  "credits",
  "prepayment",
  "billing",
  "quota",
  "rate limit",
  "429",
  "api key",
  "api_key",
  "apikey",
  "unauthorized",
  "invalid key",
  "key expired",
  "payment",
  "subscription",
  "insufficient",
];

const TIMEOUT_KEYWORDS = [
  "timeout",
  "timed out",
  "aborted",
  "abort",
  "timeout error",
  "request timeout",
  "ETIMEDOUT",
  "ECONNABORTED",
  "deadlinexceeded",
];

const USER_MESSAGES: Record<ErrorCategory, string> = {
  credit:
    "AI 서비스 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요. 계속되면 개발자에게 문의해주세요.",
  timeout: "분석 시간이 초과되었습니다. 짧은 구절로 다시 시도해주세요.",
  general: "분석 중 오류가 발생했습니다. 다시 시도해주세요.",
};

/**
 * 에러 메시지 문자열에서 에러 카테고리를 분류합니다.
 */
export function classifyError(message: string): ErrorCategory {
  const lower = message.toLowerCase();

  if (CREDIT_KEYWORDS.some(kw => lower.includes(kw))) {
    return "credit";
  }

  if (TIMEOUT_KEYWORDS.some(kw => lower.includes(kw))) {
    return "timeout";
  }

  return "general";
}

/**
 * 에러 객체 또는 문자열에서 사용자 친화적 메시지를 반환합니다.
 * 내부 에러는 로깅용으로만 사용되고, 사용자에게는 분류된 안내 메시지가 표시됩니다.
 */
export function getUserFriendlyErrorMessage(error: unknown): {
  category: ErrorCategory;
  message: string;
} {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";

  const category = classifyError(rawMessage);

  return {
    category,
    message: USER_MESSAGES[category],
  };
}
