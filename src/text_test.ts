import { assertEquals } from "@std/assert";
import { Raw, RawNode, Text, TextNode } from "./text.ts";
import { Br, Div, P, SpanEl } from "./generated/elements.ts";
import { ElVoid } from "./element.ts";
import { Group } from "./group.ts";

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

Deno.test("plain string children behave like Text()", () => {
  assertEquals(Div("hello").render(), Div(Text("hello")).render());
  assertEquals(Div("hello").render(), "<div>hello</div>");

  assertEquals(P("a", "b").render(), P(Text("a"), Text("b")).render());
  assertEquals(P("a", "b").render(), "<p>ab</p>");
});

Deno.test("plain string children are escaped by default", () => {
  assertEquals(Div("<b>bold</b>").render(), "<div>&lt;b&gt;bold&lt;/b&gt;</div>");
  assertEquals(
    Div('<script>alert("xss")</script>').render(),
    "<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>",
  );
  assertEquals(Div("a & b").render(), "<div>a &amp; b</div>");
  assertEquals(Div(`it's`).render(), "<div>it&#39;s</div>");
});

Deno.test("plain string children are equivalent to Text() in all positions", () => {
  const withText = Div(Text("hi"), SpanEl(Text("there")));
  const withLiteral = Div("hi", SpanEl("there"));
  assertEquals(withLiteral.render(), withText.render());
  assertEquals(withLiteral.render(), "<div>hi<span>there</span></div>");
});

Deno.test("numbers as plain children behave like Text(String(n))", () => {
  assertEquals(Div(42).render(), Div(Text("42")).render());
  assertEquals(Div(0).render(), "<div>0</div>");
  assertEquals(P("count: ", 123).render(), "<p>count: 123</p>");
});

Deno.test("plain string literals are ignored inside void elements", () => {
  // Void elements must drop all content children, including plain strings.
  assertEquals(ElVoid("br", "ignored").render(), "<br>");
  assertEquals(Br("ignored").render(), "<br>");
  assertEquals(ElVoid("img", "hello", Text("world")).render(), "<img>");
  assertEquals(ElVoid("input", "plain", 123).render(), "<input>");
});

Deno.test("plain literals mix with nodes and groups", () => {
  assertEquals(
    Div("a", Group("b", Text("c")), "d").render(),
    "<div>abcd</div>",
  );
  assertEquals(
    Group("hello ", "world").render(),
    "hello world",
  );
  assertEquals(
    Group("a & b", Text("c")).render(),
    "a &amp; bc",
  );
});

Deno.test("literals inside Map/Eval/If are normalized", async () => {
  const { Map, Eval, If } = await import("./conditional.ts");
  const { Ul, Li } = await import("./generated/elements.ts");

  assertEquals(If(true, "yes").render(), "yes");
  assertEquals(If(false, "no").render(), "");

  assertEquals(Eval(() => "hello").render(), "hello");
  assertEquals(Eval(() => "<b>").render(), "&lt;b&gt;");

  const node = Ul(Map(["one", "two"], (item) => Li(item)));
  assertEquals(node.render(), "<ul><li>one</li><li>two</li></ul>");
});
