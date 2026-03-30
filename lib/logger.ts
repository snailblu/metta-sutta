type LogLevel = "error" | "warn" | "info" | "debug";

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
  const stream = level === "error" || level === "warn" ? process.stderr : process.stdout;
  stream.write(output);
}

function writeBrowserLog(level: LogLevel, message: string, error?: unknown) {
  const loggerMethod = console[level] ?? console.error;

  if (error === undefined) {
    loggerMethod(message);
  } else {
    loggerMethod(message, error);
  }

  if (level === "error" && error instanceof Error && typeof globalThis.reportError === "function") {
    globalThis.reportError(error);
  }
}

function log(level: LogLevel, message: string, error?: unknown) {
  if (typeof window === "undefined") {
    writeServerLog(level, message, error);
    return;
  }

  writeBrowserLog(level, message, error);
}

export const logger = {
  error(message: string, error?: unknown) {
    log("error", message, error);
  },
  warn(message: string, error?: unknown) {
    log("warn", message, error);
  },
  info(message: string, error?: unknown) {
    log("info", message, error);
  },
  debug(message: string, error?: unknown) {
    log("debug", message, error);
  },
};
