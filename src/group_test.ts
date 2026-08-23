import { assertEquals } from "@std/assert";
import { Attr } from "./attribute.ts";
import { El, ElVoid } from "./element.ts";
import { Group, NOOP_NODE } from "./group.ts";
import type { Node } from "./node.ts";
import { Text } from "./text.ts";

Deno.test("Group with no nodes", () => {
  assertEquals(Group().render(), "");
});

Deno.test("Group with multiple nodes", () => {
  assertEquals(Group(Text("Hello"), Text("World")).render(), "HelloWorld");
});

Deno.test("Group with some ignored nodes", () => {
  const node = Group(Text("Hello"), null, undefined, false, Text("World"));
  assertEquals(node.render(), "HelloWorld");
});

Deno.test("Group with mixed children", () => {
  const node = Group(
    El("div", Attr("class", "container"), Text("Hello"), Text("World")),
    Text("Hello"),
    Text("World"),
  );
  assertEquals(
    node.render(),
    `<div class="container">HelloWorld</div>HelloWorld`,
  );
});

Deno.test("Group flattens arrays of nodes", () => {
  const node = Group([Text("a"), Text("b")], [Text("c")]);
  assertEquals(node.render(), "abc");
});

Deno.test("Group accepts raw strings safely", () => {
  const node = Group("Hello ", "<b>world</b>");
  assertEquals(node.render(), "Hello &lt;b&gt;world&lt;/b&gt;");
});

Deno.test("Group nests inside groups without expansion", () => {
  const inner = Group(Text("b"));
  const outer = Group(Text("a"), inner, Text("c"));
  assertEquals(outer.render(), "abc");
});

Deno.test("Group identifies as neither element nor attribute", () => {
  const node = Group();
  assertEquals(node.isElement(), false);
  assertEquals(node.isAttribute(), false);
});

Deno.test("NOOP_NODE renders nothing and is reusable", () => {
  const noop: Node = NOOP_NODE;
  assertEquals(noop.render(), "");
  assertEquals(noop.render(), "");
});

Deno.test("Group stringifies to its rendered output", () => {
  assertEquals(String(Group(Text("x"))), "x");
});

Deno.test("Groups work as direct children of void elements", () => {
  const node = ElVoid("input", Group(Attr("type", "checkbox")));
  assertEquals(node.render(), `<input type="checkbox">`);
});
