/**
 * Locale-safe Swiss number formatting utilities.
 * These functions produce identical output on both server (Node.js) and client,
 * avoiding React hydration mismatches caused by locale differences between runtimes.
 */

/**
 * Format a number as Swiss thousands-separated integer (e.g. 1'234'567)
 * Uses apostrophe as thousands separator, consistent across environments.
 */
export function fmtCH(value: number, decimals = 0): string {
  if (!isFinite(value)) return "–";
  const rounded = value.toFixed(decimals);
  const [intPart, decPart] = rounded.split(".");
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u2019"); // U+2019 RIGHT SINGLE QUOTATION MARK (Swiss style)
  return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
}

/**
 * Format a CHF currency value: "CHF 1'234'567"
 */
export function fmtCHF(value: number, decimals = 0): string {
  return `CHF\u00a0${fmtCH(value, decimals)}`;
}

/**
 * Format a volume in litres: "1'234'567 L"
 */
export function fmtLiter(value: number): string {
  return `${fmtCH(value, 0)}\u00a0L`;
}

/**
 * Format a price to 3 decimal places: "1.729"
 */
export function fmtPrice(value: number): string {
  return value.toFixed(3);
}

/**
 * Format percentage: "12.4%"
 */
export function fmtPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
