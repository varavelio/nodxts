import { assertEquals } from "@std/assert";
import { Each, If } from "./conditional.ts";
import { Li, Ul } from "./generated/elements.ts";
import { Text } from "./text.ts";

Deno.test("If renders the node when the condition holds", () => {
  assertEquals(If(true, Text("yes")).render(), "yes");
});

Deno.test("If renders nothing when the condition fails", () => {
  assertEquals(If(false, Text("no")).render(), "");
});

Deno.test("If evaluates nodes lazily when given a factory", () => {
  let calls = 0;

  const result = If(false, () => {
    calls++;
    return Text("expensive");
  });

  assertEquals(result.render(), "");
  assertEquals(calls, 0);

  If(true, () => {
    calls++;
    return Text("cheap");
  });
  assertEquals(calls, 1);
});

Deno.test("If accepts any child input, including arrays and primitives", () => {
  assertEquals(If(true, ["a", "b"]).render(), "ab");
  assertEquals(If(true, String(42)).render(), "42");
  assertEquals(If(true, null).render(), "");
  assertEquals(If(false, "hidden").render(), "");
});

Deno.test("Each maps every item into a group of children", () => {
  const items = ["one", "two"];
  const node = Ul(Each(items, (item) => Li(Text(item))));
  assertEquals(node.render(), "<ul><li>one</li><li>two</li></ul>");
});

Deno.test("Each passes the index to the callback", () => {
  const node = Each(["a", "b"], (_item, index) => Text(`${index}`));
  assertEquals(node.render(), "01");
});

Deno.test("Each normalizes ignored and primitive results", () => {
  const node = Each(["x", null, 3 as unknown as string], (item) => item);
  assertEquals(node.render(), "x3");
});

Deno.test("Each over an empty list renders nothing", () => {
  assertEquals(Each<number>([], (n) => Text(`${n}`)).render(), "");
});

Deno.test("Each expands inside elements like any group", async () => {
  const { Div } = await import("./index.ts");
  const node = Div(Each([1, 2], (n) => Text(String(n))));
  assertEquals(node.render(), "<div>12</div>");
});
