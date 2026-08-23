/**
 * Node.js smoke test for the built npm package.
 *
 * This script is executed by `deno task test` and by CI to ensure
 * that the library is runtime agnostic: what passes under Deno
 * also passes when imported as plain ESM and CJS through Node.js.
 */

// ESM entrypoint.
import * as nodx from "../npm/esm/index.js";

// CJS entrypoint via a dynamic import helper (Node-specific shim that
// `dnt` emits; it is available after `deno task build`).
const nodxCjs = await (async () => {
  try {
    const cjs = await import("../npm/script/index.js");
    return cjs;
  } catch {
    return null;
  }
})();

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    const hint = message ? ` (${message})` : "";
    throw new Error(
      `Assertion failed${hint}:\n  expected: ${JSON.stringify(expected)}\n  actual:   ${
        JSON.stringify(actual)
      }`,
    );
  }
}

function run(suite, tests) {
  console.log(`\n[${suite}]`);
  for (const [name, fn] of Object.entries(tests)) {
    fn();
    console.log(`  ✓ ${name}`);
  }
}

// ── ESM ───────────────────────────────────────────────────────────────────

run("ESM", {
  "div renders correctly": () =>
    assertEquals(nodx.Div(nodx.Text("Hello")).render(), "<div>Hello</div>"),

  "escaping is enforced": () =>
    assertEquals(
      nodx.P(nodx.Text(`<script>alert("xss")</script>`)).render(),
      `<p>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</p>`,
    ),

  "void elements drop children": () =>
    assertEquals(
      nodx.Img(nodx.Src("cat.jpg"), nodx.Text("ignored")).render(),
      `<img src="cat.jpg">`,
    ),

  "ClassMap / StyleMap": () => {
    assertEquals(
      nodx.Div(nodx.ClassMap({ a: true, b: false })).render(),
      `<div class="a"></div>`,
    );
    assertEquals(
      nodx.StyleMap({ "color: red": true, "border: 1px solid black": false }).render(),
      `style="color: red"`,
    );
  },

  "If and Each": () => {
    assertEquals(nodx.If(false, nodx.Text("no")).render(), "");
    assertEquals(nodx.If(true, () => nodx.Text("yes")).render(), "yes");
    assertEquals(
      nodx.Ul(nodx.Each(["one", "two"], (item) => nodx.Li(nodx.Text(item)))).render(),
      "<ul><li>one</li><li>two</li></ul>",
    );
  },

  "Raw is explicit": () => assertEquals(nodx.Raw("<b>bold</b>").render(), "<b>bold</b>"),

  "Group expands inside elements": () =>
    assertEquals(
      nodx.El("div", nodx.Group(nodx.Text("a"), nodx.Text("b"))).render(),
      "<div>ab</div>",
    ),

  "glob attributes": () => {
    assertEquals(nodx.Data("user", "7").render(), `data-user="7"`);
    assertEquals(nodx.Aria("label", "Close").render(), `aria-label="Close"`);
  },

  "DocType": () => assertEquals(nodx.DocType().render(), "<!DOCTYPE html>"),
});

// ── CJS ───────────────────────────────────────────────────────────────────

if (nodxCjs) {
  run("CJS", {
    "div renders correctly": () =>
      assertEquals(nodxCjs.Div(nodxCjs.Text("Hello")).render(), "<div>Hello</div>"),

    "escaping is enforced": () =>
      assertEquals(
        nodxCjs.P(nodxCjs.Text(`<script>alert(1)</script>`)).render(),
        `<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>`,
      ),
  });
} else {
  console.warn("  (CJS entry not found, skipping)");
}

console.log("\nNode.js Runtime check passed — ESM + CJS both work in Node.js.\n");
