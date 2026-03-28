type LogLevel = "error";

function serializeError(error?: unknown) {
  if (error instanceof Error) {
    return error.stack ?? `${error.name}: ${error.message}`;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error === undefined) {
    return "";
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function formatMessage(level: LogLevel, message: string, error?: unknown) {
  const detail = serializeError(error);
  return detail ? `[${level}] ${message}\n${detail}\n` : `[${level}] ${message}\n`;
}

function writeServerLog(level: LogLevel, message: string, error?: unknown) {
  if (typeof process === "undefined") {
    return;
  }

  const output = formatMessage(level, message, error);
  process.stderr.write(output);
}

export const logger = {
  error(message: string, error?: unknown) {
    if (typeof window === "undefined") {
      writeServerLog("error", message, error);
      return;
    }

    if (error instanceof Error && typeof globalThis.reportError === "function") {
      globalThis.reportError(error);
    }
  },
};
