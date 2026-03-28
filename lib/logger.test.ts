import { describe, it, expect, vi, afterEach } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("writes error and warn messages to stderr on the server", () => {
    const stderrWrite = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    const stdoutWrite = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    vi.stubGlobal("window", undefined);

    logger.error("Error message", new Error("boom"));
    logger.warn("Warn message", { code: 123 });

    expect(stderrWrite).toHaveBeenCalledTimes(2);
    expect(stderrWrite.mock.calls[0][0]).toContain("[error] Error message");
    expect(stderrWrite.mock.calls[0][0]).toContain("Error: boom");
    expect(stderrWrite.mock.calls[1][0]).toContain('[warn] Warn message\n{"code":123}\n');
    expect(stdoutWrite).not.toHaveBeenCalled();
  });

  it("writes info and debug messages to stdout on the server", () => {
    const stderrWrite = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    const stdoutWrite = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    const circular: { self?: unknown } = {};

    circular.self = circular;
    vi.stubGlobal("window", undefined);

    logger.info("Info message");
    logger.debug("Debug message", "details");
    logger.debug("Circular message", circular);

    expect(stderrWrite).not.toHaveBeenCalled();
    expect(stdoutWrite.mock.calls[0][0]).toBe("[info] Info message\n");
    expect(stdoutWrite.mock.calls[1][0]).toBe("[debug] Debug message\ndetails\n");
    expect(stdoutWrite.mock.calls[2][0]).toContain("[debug] Circular message\n");
    expect(stdoutWrite.mock.calls[2][0]).toContain("[object Object]");
  });

  it("logs to the browser console and reports browser errors", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});
    const consoleDebug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const reportError = vi.fn();
    const error = new Error("browser failure");

    vi.stubGlobal("reportError", reportError);

    logger.error("Browser error", error);
    logger.warn("Browser warn", { retry: true });
    logger.info("Browser info");
    logger.debug("Browser debug", "trace");

    expect(consoleError).toHaveBeenCalledWith("Browser error", error);
    expect(reportError).toHaveBeenCalledWith(error);
    expect(consoleWarn).toHaveBeenCalledWith("Browser warn", { retry: true });
    expect(consoleInfo).toHaveBeenCalledWith("Browser info");
    expect(consoleDebug).toHaveBeenCalledWith("Browser debug", "trace");
  });
});
