import { assertEquals } from "@std/assert";
import { Attr } from "./attribute.ts";
import { El, ElementNode, ElVoid } from "./element.ts";
import { Group } from "./group.ts";
import { Text } from "./text.ts";

Deno.test("El with no children", () => {
  assertEquals(El("div").render(), "<div></div>");
});

Deno.test("El renders attributes and content in insertion order", () => {
  const node = El(
    "div",
    Attr("class", "container"),
    Text("Hello"),
    Attr("id", "main"),
    Text("World"),
  );
  assertEquals(node.render(), `<div class="container" id="main">HelloWorld</div>`);
});

Deno.test("El nests elements", () => {
  const node = El(
    "ul",
    El("li", Text("one")),
    El("li", Text("two")),
    El("li", Text("three")),
  );
  assertEquals(
    node.render(),
    "<ul><li>one</li><li>two</li><li>three</li></ul>",
  );
});

Deno.test("El accepts strings, numbers as safe children", () => {
  const node = El("p", "Hello ", "<b>", 42);
  assertEquals(
    node.render(),
    "<p>Hello &lt;b&gt;42</p>",
  );
});

Deno.test("El ignores null, undefined and boolean children", () => {
  const node = El(
    "div",
    null,
    undefined,
    false,
    true,
    Text("Hello"),
    [null, [undefined]],
  );
  assertEquals(node.render(), "<div>Hello</div>");
});

Deno.test("El flattens nested arrays of children", () => {
  const items = ["a", "b"];
  const node = El("ul", items.map((item) => El("li", item)));
  assertEquals(node.render(), "<ul><li>a</li><li>b</li></ul>");
});

Deno.test("El expands groups in place preserving order", () => {
  const node = El(
    "div",
    Text("a"),
    Group(Text("b"), Text("c")),
    El("span", Text("d")),
  );
  assertEquals(node.render(), "<div>abc<span>d</span></div>");
});

Deno.test("El expands nested groups recursively", () => {
  const node = El(
    "div",
    Group(Group(Text("a"), Text("b")), Group(Text("c"))),
  );
  assertEquals(node.render(), "<div>abc</div>");
});

Deno.test("El keeps attributes found inside groups", () => {
  const node = ElVoid(
    "input",
    Group(Attr("type", "text"), Attr("name", "user")),
  );
  assertEquals(node.render(), `<input type="text" name="user">`);
});

Deno.test("El with an empty name renders nothing", () => {
  assertEquals(El("").render(), "");
  assertEquals(new ElementNode("", false, [Text("x")]).render(), "");
});

Deno.test("ElVoid renders a single tag", () => {
  assertEquals(ElVoid("img").render(), "<img>");
  assertEquals(ElVoid("br").render(), "<br>");
});

Deno.test("ElVoid drops content children but keeps attributes", () => {
  const node = ElVoid(
    "img",
    Attr("src", "avatar.png"),
    Text("ignored"),
    El("span", Text("also ignored")),
  );
  assertEquals(node.render(), `<img src="avatar.png">`);
});

Deno.test("ElVoid escapes attribute values", () => {
  const node = ElVoid("img", Attr("alt", `A "quote"`));
  assertEquals(node.render(), `<img alt="A &quot;quote&quot;">`);
});

Deno.test("Element nodes identify themselves", () => {
  const node = El("div");
  assertEquals(node.isElement(), true);
  assertEquals(node.isAttribute(), false);
});

Deno.test("Element nodes stringify to their rendered output", () => {
  assertEquals(String(El("p", Text("hi"))), "<p>hi</p>");
});

Deno.test("Element rendering is pure: repeated renders match", () => {
  const node = El("div", Attr("class", "x"), El("span", Text("y")));
  const first = node.render();
  assertEquals(node.render(), first);
});
