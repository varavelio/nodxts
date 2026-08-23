import { EscapeHTML } from "./escape_html.ts";
import type { Node } from "./node.ts";

/**
 * A node representing escaped text content.
 *
 * The constructor escapes its input automatically, so a `TextNode` can never
 * hold unsafe content.
 *
 * @example Usage
 * ```ts
 * import { TextNode } from "./text.ts";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(new TextNode("<b>bold</b>").render(), "&lt;b&gt;bold&lt;/b&gt;");
 * ```
 */
export class TextNode implements Node {
  /** The already-escaped text content. */
  readonly text: string;

  /**
   * Creates a new escaped text node.
   *
   * @param text The raw text content; it is HTML-escaped immediately.
   */
  constructor(text: string) {
    this.text = EscapeHTML(text);
  }

  /**
   * Returns the escaped text content.
   *
   * @returns The escaped text content.
   */
  render(): string {
    return this.text;
  }

  /**
   * Text nodes behave as element-side content.
   *
   * @returns Always `true`.
   */
  isElement(): boolean {
    return true;
  }

  /**
   * Text nodes are not attributes.
   *
   * @returns Always `false`.
   */
  isAttribute(): boolean {
    return false;
  }

  /**
   * Returns the escaped text content, mirroring {@linkcode TextNode.render}.
   *
   * @returns The escaped text content.
   */
  toString(): string {
    return this.text;
  }
}

/**
 * A node representing raw, unescaped HTML content.
 *
 * This node renders its content exactly as provided. It is the explicit
 * escape hatch of the library and the only way to output unescaped markup,
 * so make sure the content comes from a trusted source.
 *
 * @example Usage
 * ```ts
 * import { RawNode } from "./text.ts";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(new RawNode("<b>bold</b>").render(), "<b>bold</b>");
 * ```
 */
export class RawNode implements Node {
  /** The raw, unescaped HTML content. */
  readonly text: string;

  /**
   * Creates a new raw text node.
   *
   * @param text The HTML content; it is NOT escaped in any way.
   */
  constructor(text: string) {
    this.text = text;
  }

  /**
   * Returns the raw content as-is.
   *
   * @returns The raw content.
   */
  render(): string {
    return this.text;
  }

  /**
   * Raw nodes behave as element-side content.
   *
   * @returns Always `true`.
   */
  isElement(): boolean {
    return true;
  }

  /**
   * Raw nodes are not attributes.
   *
   * @returns Always `false`.
   */
  isAttribute(): boolean {
    return false;
  }

  /**
   * Returns the raw content, mirroring {@linkcode RawNode.render}.
   *
   * @returns The raw content.
   */
  toString(): string {
    return this.text;
  }
}

/**
 * Creates a new node representing escaped HTML text.
 *
 * The value is HTML-escaped to prevent XSS attacks, so it is always safe to
 * pass user-provided or otherwise untrusted data.
 *
 * @example Usage
 * ```ts
 * import { Text } from "./text.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const node = Text("<b>bold</b>");
 * assertEquals(node.render(), "&lt;b&gt;bold&lt;/b&gt;");
 * ```
 *
 * @param value The text content; it will be escaped.
 * @returns A text node holding the escaped content.
 */
export function Text(value: string): TextNode {
  return new TextNode(value);
}

/**
 * Creates a new node representing raw, unescaped HTML text.
 *
 * The value is NOT escaped, so the caller must ensure the content is safe.
 * Useful for rendering trusted markup, like the contents of a `<script>` or
 * `<style>` tag or the output of a trusted markdown renderer.
 *
 * @example Usage
 * ```ts
 * import { Raw } from "./text.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const node = Raw("<b>bold</b>");
 * assertEquals(node.render(), "<b>bold</b>");
 * ```
 *
 * @param value The raw HTML content; it will NOT be escaped.
 * @returns A raw text node holding the content verbatim.
 */
export function Raw(value: string): RawNode {
  return new RawNode(value);
}
