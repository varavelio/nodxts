/**
 * The characters that must be escaped to prevent XSS attacks:
 * `&`, `<`, `>`, `"` and `'`.
 */
const ESCAPE_CHARS = /[&<>"']/;

/** The replacements for each escapable character. */
const REPLACEMENTS: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes the input string to prevent XSS attacks.
 *
 * The following characters are replaced with their HTML entities:
 *
 * | Character | Entity    |
 * | --------- | --------- |
 * | `&`       | `&amp;`   |
 * | `<`       | `&lt;`    |
 * | `>`       | `&gt;`    |
 * | `"`       | `&quot;`  |
 * | `'`       | `&#39;`   |
 *
 * If the input contains no characters that need escaping, it is returned
 * unchanged without any allocation.
 *
 * Non-ASCII characters (including emoji and other astral plane characters)
 * are preserved exactly as-is.
 *
 * @example Usage
 * ```ts
 * import { EscapeHTML } from "./escape_html.ts";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(EscapeHTML(`<script>alert("xss")</script>`), "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
 * assertEquals(EscapeHTML("Tom & Jerry"), "Tom &amp; Jerry");
 * ```
 *
 * @param input The string to escape.
 * @returns The escaped string.
 */
export function EscapeHTML(input: string): string {
  // Fast path: nothing to escape, return the input as-is.
  if (!ESCAPE_CHARS.test(input)) {
    return input;
  }

  let result = "";
  let start = 0;

  for (let i = 0; i < input.length; i++) {
    const replacement = REPLACEMENTS[input[i]];

    if (replacement === undefined) {
      continue;
    }

    result += input.slice(start, i) + replacement;
    start = i + 1;
  }

  return result + input.slice(start);
}
