import { assertEquals } from "@std/assert";
import { Attr } from "./attribute.ts";
import { El, ElVoid } from "./element.ts";
import {
  Area,
  Base,
  Br,
  Col,
  Embed,
  Hr,
  Img,
  Input,
  Link,
  Meta,
  Param,
  Source,
  Track,
  Wbr,
} from "./generated/elements.ts";

// All HTML void elements must:
// 1. Render as <tag ...> with a single ">" (no slash, minimal HTML)
// 2. Never have an end tag like </br>
// 3. Drop any content children

const voidCases: Array<{ name: string; node: { render(): string } }> = [
  { name: "area", node: Area(Attr("href", "#")) },
  { name: "base", node: Base() },
  { name: "br", node: Br() },
  { name: "col", node: Col() },
  { name: "embed", node: Embed() },
  { name: "hr", node: Hr() },
  { name: "img", node: Img(Attr("src", "x.jpg")) },
  { name: "input", node: Input() },
  { name: "link", node: Link(Attr("rel", "stylesheet")) },
  { name: "meta", node: Meta(Attr("charset", "utf-8")) },
  { name: "param", node: Param() },
  { name: "source", node: Source() },
  { name: "track", node: Track() },
  { name: "wbr", node: Wbr() },
  { name: "ElVoid(br)", node: ElVoid("br", Attr("class", "x"), "ignored") },
  { name: "ElVoid(img)", node: ElVoid("img", Attr("src", "a.jpg"), "ignored") },
];

for (const { name, node } of voidCases) {
  Deno.test(`void element <${name}> renders without end tag and without slash`, () => {
    const html = node.render();
    // Must end with ">" and not " />"
    assertEquals(html.endsWith(" />"), false, `${name} should not use slash (minimal HTML)`);
    assertEquals(html.endsWith(">"), true, `${name} should end with >`);
    // Must NOT contain an end tag
    assertEquals(html.includes(`</${name}>`), false, `${name} must not have end tag </${name}>`);
    assertEquals(html.includes("</"), false, `${name} must not contain any </`);
  });
}

Deno.test("void elements drop content children", () => {
  assertEquals(Img(Attr("src", "a.jpg"), "ignored text").render(), `<img src="a.jpg">`);
  assertEquals(Br("ignored").render(), "<br>");
  assertEquals(Input(Attr("type", "text"), "oops").render(), `<input type="text">`);
  assertEquals(Link(Attr("href", "x.css"), "content").render(), `<link href="x.css">`);
});

Deno.test("non-void El('br') intentionally has an end tag — use Br() for void", () => {
  // El() is for custom/non-void elements. If you pass a void tag name to El(),
  // it will render with an end tag, which is invalid for HTML void elements.
  // This test documents the distinction and prevents regressions.
  assertEquals(El("br").render(), "<br></br>");
  assertEquals(El("link", Attr("rel", "stylesheet")).render(), `<link rel="stylesheet"></link>`);
  // Correct void usage:
  assertEquals(Br().render(), "<br>");
  assertEquals(Link(Attr("rel", "stylesheet")).render(), `<link rel="stylesheet">`);
});

Deno.test("void elements are minimal — no extra whitespace or slash", () => {
  assertEquals(Br().render(), "<br>");
  assertEquals(Hr().render(), "<hr>");
  assertEquals(Wbr().render(), "<wbr>");
  assertEquals(Meta(Attr("charset", "utf-8")).render(), `<meta charset="utf-8">`);
  assertEquals(
    Link(Attr("rel", "stylesheet"), Attr("href", "a.css")).render(),
    `<link rel="stylesheet" href="a.css">`,
  );
});
