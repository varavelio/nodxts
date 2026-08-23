import { AttrNode } from "./attribute.ts";

/**
 * A record of CSS style declarations with conditional rendering.
 *
 * The keys are complete CSS declarations (e.g. `"border: 1px solid black"`)
 * and the values are boolean expressions that determine whether each rule
 * should be included in the final output.
 */
export type StyleMapInput = Record<string, boolean>;

/**
 * Creates the `style` attribute from a record of conditional styles.
 *
 * Declarations whose value is `true` are included; the rest are omitted.
 * Rules are joined with `"; "` and sorted alphabetically so the output is
 * deterministic regardless of key insertion order.
 *
 * @example Usage
 * ```ts
 * import { StyleMap } from "./style_map.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const isBordered = false;
 * const node = StyleMap({
 *   "border: 1px solid black": isBordered,
 *   "margin: 5px": true,
 * });
 * assertEquals(node.render(), `style="margin: 5px"`);
 * ```
 *
 * @param styles The conditional CSS declarations.
 * @returns The `style` attribute node.
 */
export function StyleMap(styles: StyleMapInput): AttrNode {
  const rules: string[] = [];

  for (const declaration of Object.keys(styles)) {
    if (styles[declaration]) {
      rules.push(declaration);
    }
  }

  return new AttrNode("style", rules.sort().join("; "));
}
