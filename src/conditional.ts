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
 * rendered.
 *
 * For lazy evaluation this TypeScript implementation also accepts a factory
 * function as `node`.
 *
 * @example Usage
 * ```ts
 * import { If, Div, Text } from "@varavel/nodx";
 * import { assertEquals } from "@std/assert";
 *
 * assertEquals(If(true, Div("yes")).render(), "<div>yes</div>");
 * assertEquals(If(false, Div("no")).render(), "");
 * ```
 *
 * @param condition Whether the content should be rendered.
 * @param node The node to render, or a factory returning it (lazy).
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
 * This is the loop primitive of NodX. Combine it with any element
 * or component function to render lists. The callback receives
 * the item and its index, mirroring `Array.prototype.map`. The returned
 * children may be nodes, primitives or arrays thereof; they are normalized
 * exactly like any other children.
 *
 * @example Usage
 * ```ts
 * import { Map, Li, Ul, Text } from "@varavel/nodx";
 * import { assertEquals } from "@std/assert";
 *
 * const items = ["one", "two"];
 * const node = Ul(Map(items, (item) => Li(item)));
 * assertEquals(node.render(), "<ul><li>one</li><li>two</li></ul>");
 * ```
 *
 * @typeParam T The type of the items.
 * @param items The items to render.
 * @param fn The function that maps an item (and its index) to a child.
 * @returns A group node holding all the rendered children.
 */
export function Map<T>(
  items: readonly T[],
  fn: (item: T, index: number) => NodeChild,
): GroupNode {
  const children: NodeChild[] = [];

  for (let index = 0; index < items.length; index++) {
    children.push(fn(items[index], index));
  }

  return new GroupNode(children);
}

/**
 * Executes a factory function and integrates its resulting node into the
 * current node tree.
 *
 * @example Usage
 * ```ts
 * import { Div, Eval, Text } from "@varavel/nodx";
 * import { assertEquals } from "@std/assert";
 *
 * const condition = true;
 * const node = Div(
 *   Eval(() => condition ? Text("yes") : Text("no")),
 * );
 * assertEquals(node.render(), "<div>yes</div>");
 * ```
 *
 * @param fn The factory that builds the node.
 * @returns The factory result, normalized as a node.
 */
export function Eval(fn: () => NodeChild): Node {
  const result = fn();

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
