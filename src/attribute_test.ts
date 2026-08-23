import { assertEquals } from "@std/assert";
import { Attr, AttrBool, AttrList, AttrNode } from "./attribute.ts";

Deno.test("Attr renders a name/value attribute", () => {
  assertEquals(Attr("class", "card").render(), `class="card"`);
  assertEquals(Attr("href", "/home").render(), `href="/home"`);
});

Deno.test("Attr escapes the value at render time", () => {
  const node = Attr("title", `He said "hi" <b>bold</b>`);
  // The stored value stays raw for inspection...
  assertEquals(node.value, `He said "hi" <b>bold</b>`);
  // ...and is escaped when rendered.
  assertEquals(
    node.render(),
    `title="He said &quot;hi&quot; &lt;b&gt;bold&lt;/b&gt;"`,
  );
});

Deno.test("Attr supports numeric values", () => {
  assertEquals(Attr("tabindex", 1).render(), `tabindex="1"`);
  assertEquals(Attr("colspan", 0).render(), `colspan="0"`);
});

Deno.test("Attr renders value-less attributes as bare names", () => {
  assertEquals(Attr("disabled").render(), "disabled");
  assertEquals(new AttrNode("checked").hasValue, false);
});

Deno.test("Attr with an empty name renders nothing", () => {
  assertEquals(Attr("").render(), "");
});

Deno.test("AttrBool renders the attribute only when true", () => {
  assertEquals(AttrBool("checked", true).render(), "checked");
  assertEquals(AttrBool("checked", false).render(), "");
});

Deno.test("AttrList joins tokens and ignores empty ones", () => {
  assertEquals(
    AttrList("class", "btn btn-sm", "", "btn-primary").render(),
    `class="btn btn-sm btn-primary"`,
  );
});

Deno.test("AttrList with no tokens renders an empty value", () => {
  assertEquals(AttrList("rel").render(), `rel=""`);
  assertEquals(AttrList("rel", "").render(), `rel=""`);
});

Deno.test("Attribute nodes identify themselves as attributes", () => {
  const node = Attr("id", "x");
  assertEquals(node.isAttribute(), true);
  assertEquals(node.isElement(), false);
});

Deno.test("Attribute nodes stringify to their rendered output", () => {
  assertEquals(String(Attr("key", "value")), `key="value"`);
});
