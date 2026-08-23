import { assertEquals } from "@std/assert";
import { ClassMap } from "./class_map.ts";

Deno.test("ClassMap includes only truthy classes", () => {
  const node = ClassMap({
    "odd-class": true,
    "even-class": false,
    "always-on": true,
  });
  assertEquals(node.render(), `class="always-on odd-class"`);
});

Deno.test("ClassMap sorts tokens alphabetically for deterministic output", () => {
  const a = ClassMap({ z: true, a: true, m: true });
  const b = ClassMap({ m: true, z: true, a: true });
  assertEquals(a.render(), `class="a m z"`);
  assertEquals(a.render(), b.render());
});

Deno.test("ClassMap renders an empty value when nothing is truthy", () => {
  assertEquals(ClassMap({ hidden: false }).render(), `class=""`);
  assertEquals(ClassMap({}).render(), `class=""`);
});

Deno.test("ClassMap escapes dynamic class names", () => {
  const userInput = `" onmouseover="alert(1)`;
  const node = ClassMap({ [userInput]: true });
  assertEquals(
    node.render(),
    `class="&quot; onmouseover=&quot;alert(1)"`,
  );
});

Deno.test("ClassMap identifies itself as an attribute", () => {
  const node = ClassMap({ btn: true });
  assertEquals(node.isAttribute(), true);
  assertEquals(node.isElement(), false);
});

Deno.test("ClassMap works alongside other attributes", async () => {
  const { El } = await import("./element.ts");
  const { Id } = await import("./generated/attributes.ts");
  const node = El(
    "div",
    Id("box"),
    ClassMap({ container: true, hidden: false }),
  );
  assertEquals(node.render(), `<div id="box" class="container"></div>`);
});
