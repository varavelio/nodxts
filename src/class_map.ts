import { AttrNode } from "./attribute.ts";

/**
 * A record of class names with conditional rendering.
 *
 * The keys are the class names and the values are boolean expressions that
 * determine whether each class should be included in the final output.
 */
export type ClassMapInput = Record<string, boolean>;

/**
 * Creates the `class` attribute from a record of conditional classes.
 *
 * Class names whose value is `true` are included; the rest are omitted.
 * The resulting tokens are sorted alphabetically so the output is
 * deterministic regardless of key insertion order, which also makes the
 * rendered HTML trivially comparable in tests.
 *
 * @example Usage
 * ```ts
 * import { ClassMap } from "./class_map.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const isHidden = false;
 * const node = ClassMap({ "btn": true, "hidden": isHidden });
 * assertEquals(node.render(), `class="btn"`);
 * ```
 *
 * @param classes The conditional class names.
 * @returns The `class` attribute node.
 */
export function ClassMap(classes: ClassMapInput): AttrNode {
  const tokens: string[] = [];

  for (const className of Object.keys(classes)) {
    if (classes[className]) {
      tokens.push(className);
    }
  }

  return new AttrNode("class", tokens.sort().join(" "));
}
