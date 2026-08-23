import type { AttrNode } from "./attribute.ts";
import { GroupNode } from "./group.ts";
import type { Node, NodeChild } from "./node.ts";
import { normalizeChildren } from "./normalize.ts";

/**
 * A node representing an HTML element.
 *
 * Children are processed once, at construction time:
 *
 * - Arrays are flattened and `null`/`undefined`/booleans are dropped.
 * - Strings and numbers become escaped text nodes.
 * - Groups are expanded in place so their nodes become direct children,
 *   preserving insertion order.
 * - Attributes and content are categorized so rendering is a plain,
 *   allocation-free walk over two ready-made lists.
 *
 * Rendering itself is pure and predictable:
 *
 * 1. The opening tag is rendered, followed by every attribute separated by
 *    a single space.
 * 2. Unless the element is void, all content children are rendered and the
 *    closing tag is appended. Void elements render no closing tag and drop
 *    their content children, per the HTML specification.
 *
 * @example Usage
 * ```ts
 * import { ElNode } from "./element.ts";
 * import { Attr } from "./attribute.ts";
 * import { Text } from "./text.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const node = new ElNode("div", false, [
 *   Attr("class", "card"),
 *   Text("Hello"),
 * ]);
 * assertEquals(node.render(), `<div class="card">Hello</div>`);
 * ```
 */
export class ElNode implements Node {
  /** The tag name of the element (e.g. `div`, `img`). */
  readonly name: string;

  /** Whether the element is a void element (no closing tag). */
  readonly isVoid: boolean;

  /** The normalized and expanded child nodes of the element. */
  readonly children: readonly Node[];

  /** The attribute children, in insertion order. */
  private readonly attributes: readonly AttrNode[];

  /** The content children (elements, text), in insertion order. */
  private readonly content: readonly Node[];

  /**
   * Creates a new HTML element.
   *
   * @param name The tag name of the element.
   * @param isVoid Whether the element is a void element.
   * @param children The children of the element.
   */
  constructor(name: string, isVoid: boolean, children: readonly NodeChild[]) {
    this.name = name;
    this.isVoid = isVoid;
    this.children = expandGroups(normalizeChildren(children));

    const attributes: AttrNode[] = [];
    const content: Node[] = [];

    for (const child of this.children) {
      // A well-behaved node is either an attribute or content, but both
      // flags are honored to support custom node implementations.
      if (child.isAttribute()) {
        attributes.push(child as AttrNode);
      }
      if (child.isElement()) {
        content.push(child);
      }
    }

    this.attributes = attributes;
    this.content = content;
  }

  /**
   * Renders the element into its final HTML form.
   *
   * Elements with an empty name render as an empty string.
   *
   * @returns The rendered HTML.
   */
  render(): string {
    if (this.name === "") {
      return "";
    }

    let result = `<${this.name}`;

    for (const attribute of this.attributes) {
      result += ` ${attribute.render()}`;
    }

    result += ">";

    if (!this.isVoid) {
      for (const child of this.content) {
        result += child.render();
      }
      result += `</${this.name}>`;
    }

    return result;
  }

  /**
   * Indicates that this node should be treated as element-side content.
   *
   * @returns Always `true`.
   */
  isElement(): boolean {
    return true;
  }

  /**
   * Elements are not attributes.
   *
   * @returns Always `false`.
   */
  isAttribute(): boolean {
    return false;
  }

  /**
   * Returns the rendered HTML, mirroring {@linkcode ElNode.render}.
   *
   * @returns The rendered HTML.
   */
  toString(): string {
    return this.render();
  }
}

/**
 * Expands group nodes within a list of already-normalized children, so that
 * the nodes inside each group become direct children of the parent element.
 *
 * @param children The normalized children to expand.
 * @returns A flat array of nodes with every group expanded.
 */
function expandGroups(children: readonly Node[]): Node[] {
  const result: Node[] = [];

  for (const child of children) {
    if (child instanceof GroupNode) {
      const nested = expandGroups(child.children);
      for (const node of nested) {
        result.push(node);
      }
      continue;
    }

    result.push(child);
  }

  return result;
}

/**
 * Creates a new node representing an HTML element with the given name.
 *
 * This is the generic constructor used by the generated element functions
 * and by custom elements not covered by the library. Prefer the named
 * functions ({@linkcode Div}, {@linkcode Span}...) whenever possible.
 *
 * @example Usage
 * ```ts
 * import { El, Attr, Text } from "@varavel/nodx";
 * import { assertEquals } from "@std/assert";
 *
 * const node = El("my-widget", Attr("class", "card"), Text("Hello"));
 * assertEquals(node.render(), `<my-widget class="card">Hello</my-widget>`);
 * ```
 *
 * @param name The tag name of the element.
 * @param children The children of the element.
 * @returns An element node.
 */
export function El(name: string, ...children: NodeChild[]): ElNode {
  return new ElNode(name, false, children);
}

/**
 * Creates a new node representing an HTML void element with the given name.
 *
 * Void elements (like `<img>` or `<input>`) have no closing tag per the
 * HTML specification. Any content children they receive are ignored during
 * rendering; only their attributes are rendered.
 *
 * @example Usage
 * ```ts
 * import { ElVoid, Class } from "@varavel/nodx";
 * import { assertEquals } from "@std/assert";
 *
 * const node = ElVoid("br", Class("spacer"));
 * assertEquals(node.render(), `<br class="spacer">`);
 * ```
 *
 * @param name The tag name of the void element.
 * @param children The children of the element; content is ignored when
 * rendering.
 * @returns A void element node.
 */
export function ElVoid(name: string, ...children: NodeChild[]): ElNode {
  return new ElNode(name, true, children);
}
