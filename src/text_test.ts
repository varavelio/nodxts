import { assertEquals } from "@std/assert";
import { Raw, RawNode, Text, TextNode } from "./text.ts";

Deno.test("Text escapes the provided value", () => {
  assertEquals(Text("Hello").render(), "Hello");
  assertEquals(Text("<b>bold</b>").render(), "&lt;b&gt;bold&lt;/b&gt;");
  assertEquals(Text(`Tom & "Jerry"`).render(), "Tom &amp; &quot;Jerry&quot;");
});

Deno.test("Text renders an empty string as an empty string", () => {
  assertEquals(Text("").render(), "");
});

Deno.test("TextNode escapes its content on construction", () => {
  const node = new TextNode("<i>italic</i>");
  assertEquals(node.text, "&lt;i&gt;italic&lt;/i&gt;");
  assertEquals(node.render(), node.text);
  // Rendering twice yields the exact same output: no double escaping.
  assertEquals(node.render(), node.render());
});

Deno.test("TextNode identifies itself as content", () => {
  const node = new TextNode("Hello");
  assertEquals(node.isElement(), true);
  assertEquals(node.isAttribute(), false);
});

Deno.test("Raw renders the value without escaping", () => {
  assertEquals(Raw("<b>bold</b>").render(), "<b>bold</b>");
  assertEquals(Raw(`<script>alert("xss")</script>`).render(), `<script>alert("xss")</script>`);
});

Deno.test("RawNode keeps its content verbatim", () => {
  const node = new RawNode("<hr>");
  assertEquals(node.text, "<hr>");
  assertEquals(node.render(), "<hr>");
});

Deno.test("RawNode identifies itself as content", () => {
  const node = new RawNode("Hello");
  assertEquals(node.isElement(), true);
  assertEquals(node.isAttribute(), false);
});

Deno.test("Text nodes stringify to their rendered output", () => {
  assertEquals(String(Text("<x>")), "&lt;x&gt;");
  assertEquals(String(Raw("<x>")), "<x>");
});
