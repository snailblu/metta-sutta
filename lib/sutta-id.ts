/**
 * Sutta ID parsing utilities.
 *
 * Handles IDs like "SN56.11", "mn1", "dn10", "kn4" etc.
 * and extracts the nikāya slug and normalized UID.
 */

export const NIKAYA_PREFIXES = ["dn", "mn", "sn", "an", "kn"] as const;

/**
 * Parse a raw sutta ID string into its nikāya and normalized UID.
 *
 * - Case-insensitive: "SN56.11" → { nikaya: "sn", uid: "sn56.11" }
 * - Returns `null` when the input doesn't start with a known nikāya prefix
 *   followed by at least one digit.
 */
export function parseSuttaId(input: string): { nikaya: string; uid: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  for (const prefix of NIKAYA_PREFIXES) {
    if (lower.startsWith(prefix)) {
      const rest = lower.slice(prefix.length);
      // Must be followed by at least one digit
      if (/^\d/.test(rest)) {
        return { nikaya: prefix, uid: `${prefix}${rest}` };
      }
    }
  }

  return null;
}

/**
 * Quick check whether a string looks like a valid sutta ID.
 */
export function isValidSuttaId(input: string): boolean {
  return parseSuttaId(input) !== null;
}
