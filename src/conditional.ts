/**
 * Control-flow helpers: conditionals and loops over plain node trees.
 *
 * These helpers are thin conveniences. Thanks to {@linkcode NodeChild}
 * dropping `null`/`undefined`, ternaries like `${ready ? Div() : null}` work
 * out of the box; use these functions when you want to be more explicit.
 *
 * @module
 */

import { GroupNode, NOOP_NODE } from "./group.ts";
import type { Node, NodeChild } from "./node.ts";
import { TextNode } from "./text.ts";

/**
 * Renders a node based on the provided boolean condition.
 *
 * If the condition is `true`, the node is rendered; otherwise nothing is
 * rendered. Passing a function makes evaluation lazy: the function is only
 * called when the condition is `true`.
 *
 * @example Usage
 * ```ts
 * import { If, El, Text } from "@varavel/nodx";
 * import { assertEquals } from "@std/assert";
 *
 * const isAdmin = false;
 * const node = El("div", If(isAdmin, () => El("a", Text("Delete"))));
 * assertEquals(node.render(), "<div></div>");
 * ```
 *
 * @param condition Whether the content should be rendered.
 * @param node The node to render, or a lazy factory returning it.
 * @returns The given node, or a node that renders nothing.
 */
export function If(
  condition: boolean,
  node: NodeChild | (() => NodeChild),
): Node {
  if (!condition) {
    return NOOP_NODE;
  }

  const result = typeof node === "function" ? (node as () => NodeChild)() : node;

  if (Array.isArray(result)) {
    return new GroupNode(result);
  }

  if (result === null || result === undefined || typeof result === "boolean") {
    return NOOP_NODE;
  }

  if (typeof result === "string" || typeof result === "number") {
    return new TextNode(String(result));
  }

  return result;
}

/**
 * Transforms a list of items into a group of nodes by applying a function
 * to each one.
 *
 * This is the loop primitive of NodX: combine it with any element or
 * component function to render lists. The callback receives the item and
 * its index, mirroring `Array.prototype.map`. The returned children may be
 * nodes, primitives or arrays thereof; they are normalized exactly like any
 * other children.
 *
 * @example Usage
 * ```ts
 * import { Each, Li, Ul, Text } from "@varavel/nodx";
 * import { assertEquals } from "@std/assert";
 *
 * const items = ["one", "two"];
 * const node = Ul(Each(items, (item) => Li(Text(item))));
 * assertEquals(node.render(), "<ul><li>one</li><li>two</li></ul>");
 * ```
 *
 * @typeParam T The type of the items.
 * @param items The items to render.
 * @param render The function that maps an item (and its index) to a child.
 * @returns A group node holding all the rendered children.
 */
export function Each<T>(
  items: readonly T[],
  render: (item: T, index: number) => NodeChild,
): GroupNode {
  const children: NodeChild[] = [];

  for (let index = 0; index < items.length; index++) {
    children.push(render(items[index], index));
  }

  return new GroupNode(children);
}
