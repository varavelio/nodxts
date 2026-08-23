/**
 * Child normalization: the single place where the flexible {@linkcode
 * NodeChild} inputs are converted into a flat list of ready-to-render nodes.
 *
 * @module
 */

import type { Node, NodeChild } from "./node.ts";
import { TextNode } from "./text.ts";

/**
 * Normalizes a list of children into a flat list of nodes.
 *
 * The following transformations are applied, in order, recursively:
 *
 * - Arrays are flattened, so nested arrays (e.g. the result of `.map()`)
 *   become sibling nodes.
 * - `null`, `undefined` and booleans are dropped. This makes conditional
 *   rendering safe: `${isReady && El("div")}` never leaks stray text.
 * - Strings and numbers are converted into escaped text nodes.
 * - Nodes implementing the {@linkcode Node} interface are kept as-is.
 *
 * @param children The raw children to normalize.
 * @returns A new flat array of nodes; the input is never mutated.
 */
export function normalizeChildren(
  children: readonly NodeChild[],
): Node[] {
  const result: Node[] = [];

  for (const child of children) {
    if (child === null || child === undefined || typeof child === "boolean") {
      continue;
    }

    if (Array.isArray(child)) {
      const nested = normalizeChildren(child);
      for (const node of nested) {
        result.push(node);
      }
      continue;
    }

    if (typeof child === "string" || typeof child === "number") {
      result.push(new TextNode(String(child)));
      continue;
    }

    // Anything else must be a Node implementation.
    result.push(child);
  }

  return result;
}
