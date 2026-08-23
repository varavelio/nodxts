import { assertEquals } from "@std/assert";
import { StyleMap } from "./style_map.ts";

Deno.test("StyleMap includes only truthy declarations", () => {
  const node = StyleMap({
    "border: 1px solid black": true,
    "padding: 10px": false,
    "margin: 5px": true,
  });
  assertEquals(
    node.render(),
    `style="border: 1px solid black; margin: 5px"`,
  );
});

Deno.test("StyleMap sorts declarations alphabetically", () => {
  const a = StyleMap({ "z-index: 1": true, "color: red": true });
  const b = StyleMap({ "color: red": true, "z-index: 1": true });
  assertEquals(a.render(), `style="color: red; z-index: 1"`);
  assertEquals(a.render(), b.render());
});

Deno.test("StyleMap renders an empty value when nothing is truthy", () => {
  assertEquals(StyleMap({ "color: red": false }).render(), `style=""`);
  assertEquals(StyleMap({}).render(), `style=""`);
});

Deno.test("StyleMap identifies itself as an attribute", () => {
  const node = StyleMap({ "color: red": true });
  assertEquals(node.isAttribute(), true);
  assertEquals(node.isElement(), false);
});
