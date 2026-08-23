/**
 * Document type helper.
 *
 * @module
 */

import { RawNode } from "./text.ts";

/**
 * Defines the document type declaration of an HTML document.
 *
 * This is a special node and should typically be the first child of a
 * {@linkcode Group} wrapping a full document.
 *
 * @example Usage
 * ```ts
 * import { DocType, El, Group, Text } from "@varavel/nodx";
 * import { assertEquals } from "@std/assert";
 *
 * const node = Group(
 *   DocType(),
 *   El("html", El("body", Text("Hello"))),
 * );
 * assertEquals(node.render(), "<!DOCTYPE html><html><body>Hello</body></html>");
 * ```
 *
 * @returns A raw node rendering `<!DOCTYPE html>`.
 */
export function DocType(): RawNode {
  return new RawNode("<!DOCTYPE html>");
}
