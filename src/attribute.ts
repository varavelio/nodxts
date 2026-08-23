import type { AttributeValue, Node } from "./node.ts";
import { EscapeHTML } from "./escape_html.ts";
import { NOOP_NODE } from "./group.ts";

/**
 * A node representing an HTML attribute.
 *
 * An attribute either has a value (`class="card"`) or not (`disabled`). It
 * is not meant to be rendered standalone: when used as a child of an
 * element it is placed inside the opening tag, in insertion order.
 *
 * @example Usage
 * ```ts
 * import { AttrNode } from "./attribute.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const node = new AttrNode("href", "/home", true);
 * assertEquals(node.render(), `href="/home"`);
 *
 * const valueless = new AttrNode("disabled");
 * assertEquals(valueless.render(), "disabled");
 * ```
 */
export class AttrNode implements Node {
  /** The attribute name (e.g. `class`, `href`). */
  readonly name: string;

  /** The raw attribute value; only meaningful when `hasValue` is `true`. */
  readonly value?: string;

  /**
   * Whether the attribute carries a value.
   *
   * Value-less attributes render as just their name (e.g. `<input disabled>`).
   */
  readonly hasValue: boolean;

  /**
   * Creates a new attribute node.
   *
   * The value is escaped at render time, never at construction, so the
   * stored value stays human-readable for debugging and inspection.
   *
   * @param name The attribute name.
   * @param value The optional attribute value.
   */
  constructor(name: string, value?: AttributeValue) {
    this.name = name;
    this.hasValue = value !== undefined;
    this.value = this.hasValue ? String(value) : undefined;
  }

  /**
   * Renders the attribute as `name="value"` or just `name`.
   *
   * Attributes with an empty name render as an empty string.
   *
   * @returns The rendered attribute.
   */
  render(): string {
    if (this.name === "") {
      return "";
    }

    if (!this.hasValue) {
      return this.name;
    }

    return `${this.name}="${EscapeHTML(this.value!)}"`;
  }

  /**
   * Attributes are not element-side content.
   *
   * @returns Always `false`.
   */
  isElement(): boolean {
    return false;
  }

  /**
   * Indicates that this node should be rendered as an attribute.
   *
   * @returns Always `true`.
   */
  isAttribute(): boolean {
    return true;
  }

  /**
   * Returns the rendered attribute, mirroring {@linkcode AttrNode.render}.
   *
   * @returns The rendered attribute.
   */
  toString(): string {
    return this.render();
  }
}

/**
 * Creates a new node representing an HTML attribute with a name and an
 * optional value. The value is HTML-escaped to prevent XSS attacks.
 *
 * If you don't provide a value, the attribute will be rendered without one.
 *
 * @example Usage
 * ```ts
 * import { Attr } from "./attribute.ts";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(Attr("href", "/home").render(), `href="/home"`);
 * assertEquals(Attr("disabled").render(), "disabled");
 * ```
 *
 * @param name The attribute name.
 * @param value The optional attribute value.
 * @returns An attribute node.
 */
export function Attr(name: string, value?: AttributeValue): AttrNode {
  return new AttrNode(name, value);
}

/**
 * Creates a new node representing an HTML boolean attribute.
 *
 * Boolean attributes (like `checked`, `disabled` or `required`) take no
 * value: they either appear or disappear. If the value is `true` (the
 * default), the attribute is rendered as just its name (e.g. `disabled`).
 * If the value is `false`, the attribute is omitted entirely.
 *
 * The value is optional so `Disabled()` is the same as `Disabled(true)` and
 * reads more ergonomically for the common “enabled” case.
 *
 * @example Usage
 * ```ts
 * import { AttrBool } from "./attribute.ts";
 * import { El } from "@varavel/nodx";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(El("input", AttrBool("checked", true)).render(), "<input checked>");
 * assertEquals(El("input", AttrBool("checked")).render(), "<input checked>");
 * assertEquals(El("input", AttrBool("checked", false)).render(), "<input>");
 * ```
 *
 * @param name The attribute name.
 * @param value Whether the attribute should be rendered at all. Defaults to `true`.
 * @returns An attribute node, or a node that renders nothing.
 */
export function AttrBool(name: string, value: boolean = true): Node {
  if (!value) {
    return NOOP_NODE;
  }
  return new AttrNode(name);
}

/**
 * Creates a new node representing an HTML attribute whose value is a
 * space-separated list of tokens, like the `class` attribute.
 *
 * Each value is treated as a single token: empty values are ignored and the
 * rest are joined with a single space. The result is HTML-escaped to prevent
 * XSS attacks.
 *
 * @example Usage
 * ```ts
 * import { AttrList } from "./attribute.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const node = AttrList("class", "btn btn-sm", "", "btn-primary");
 * assertEquals(node.render(), `class="btn btn-sm btn-primary"`);
 * ```
 *
 * @param name The attribute name.
 * @param values The list of tokens.
 * @returns An attribute node with the joined value.
 */
export function AttrList(
  name: string,
  ...values: readonly AttributeValue[]
): AttrNode {
  const tokens: string[] = [];

  for (const value of values) {
    const token = String(value);
    if (token !== "") {
      tokens.push(token);
    }
  }

  return new AttrNode(name, tokens.join(" "));
}
