import type { Node, NodeChild } from "./node.ts";
import { normalizeChildren } from "./normalize.ts";

/**
 * A special node that represents a group of nodes.
 *
 * - When rendered directly, it renders all the nodes in the group
 *   sequentially, with no separator and no wrapping tag.
 * - When used as a child of an element, it is expanded so that the nodes in
 *   the group become direct children of that element.
 *
 * @example Usage
 * ```ts
 * import { GroupNode } from "./group.ts";
 * import { TextNode } from "./text.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const node = new GroupNode([new TextNode("Hello"), new TextNode("World")]);
 * assertEquals(node.render(), "HelloWorld");
 * ```
 */
export class GroupNode implements Node {
  /** The normalized child nodes of the group. */
  readonly children: readonly Node[];

  /**
   * Creates a new group of nodes.
   *
   * Children are normalized on construction: arrays are flattened,
   * `null`/`undefined`/booleans are dropped and primitives are converted
   * into escaped text nodes.
   *
   * @param children The nodes to group.
   */
  constructor(children: readonly NodeChild[] = []) {
    this.children = normalizeChildren(children);
  }

  /**
   * Renders all the children sequentially.
   *
   * @returns The concatenated HTML of all the children.
   */
  render(): string {
    let result = "";
    for (const child of this.children) {
      result += child.render();
    }
    return result;
  }

  /**
   * Groups are neither elements nor attributes when categorized by their
   * parent: they are expanded in place instead.
   *
   * @returns Always `false`.
   */
  isElement(): boolean {
    return false;
  }

  /**
   * Groups are never treated as attributes.
   *
   * @returns Always `false`.
   */
  isAttribute(): boolean {
    return false;
  }

  /**
   * Returns the rendered HTML, mirroring {@linkcode GroupNode.render}.
   *
   * @returns The concatenated HTML of all the children.
   */
  toString(): string {
    return this.render();
  }
}

/**
 * A shared, immutable node that renders nothing.
 *
 * Used internally to represent "nothing" (e.g. a `false` boolean attribute
 * or a skipped conditional) without allocating a new node every time.
 */
export const NOOP_NODE: GroupNode = new GroupNode([]);

/**
 * Combines multiple nodes into a single node without wrapping them in any
 * HTML tag.
 *
 * When rendered directly, it renders all the nodes in the group
 * sequentially.
 *
 * When used as a child of another node, it is expanded so that the nodes in
 * the group become direct children of the group's parent.
 *
 * @example Usage
 * ```ts
 * import { Group, El, Text } from "@varavel/nodx";
 * import { assertEquals } from "@std/assert";
 *
 * const node = Group(
 *   El("h1", Text("Hello")),
 *   El("p", Text("World")),
 * );
 * assertEquals(node.render(), "<h1>Hello</h1><p>World</p>");
 * ```
 *
 * @param children The nodes to group.
 * @returns A group node.
 */
export function Group(...children: NodeChild[]): GroupNode {
  return new GroupNode(children);
}
