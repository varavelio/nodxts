import { assertEquals } from "@std/assert";
import { Eval, If, Map } from "./conditional.ts";
import { Div, Li, Ul } from "./generated/elements.ts";
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

Deno.test("Map maps every item into a group of children", () => {
  const items = ["one", "two"];
  const node = Ul(Map(items, (item) => Li(Text(item))));
  assertEquals(node.render(), "<ul><li>one</li><li>two</li></ul>");
});

Deno.test("Map passes the index to the callback", () => {
  const node = Map(["a", "b"], (_item, index) => Text(`${index}`));
  assertEquals(node.render(), "01");
});

Deno.test("Map normalizes ignored and primitive results", () => {
  const node = Map(["x", null, 3 as unknown as string], (item) => item);
  assertEquals(node.render(), "x3");
});

Deno.test("Map over an empty list renders nothing", () => {
  assertEquals(Map<number>([], (n) => Text(`${n}`)).render(), "");
});

Deno.test("Map expands inside elements like any group", async () => {
  const { Div } = await import("./index.ts");
  const node = Div(Map([1, 2], (n) => Text(String(n))));
  assertEquals(node.render(), "<div>12</div>");
});

Deno.test("Eval integrates a factory result as a node", () => {
  assertEquals(Eval(() => "hello").render(), "hello");
  assertEquals(Eval(() => "<b>").render(), "&lt;b&gt;");
  assertEquals(Div(Eval(() => "hi")).render(), "<div>hi</div>");
  // Eval with false condition
  const cond = false;
  assertEquals(
    Div(Eval(() => cond ? "yes" : "no")).render(),
    "<div>no</div>",
  );
});

Deno.test("If still works for plain values and nodes", () => {
  assertEquals(If(true, Div("yes")).render(), "<div>yes</div>");
  assertEquals(If(false, Div("no")).render(), "");
  assertEquals(If(true, "plain").render(), "plain");
});
