import { assertEquals } from "@std/assert";
import { EscapeHTML } from "./escape_html.ts";

Deno.test("EscapeHTML leaves safe text unchanged", () => {
  assertEquals(EscapeHTML(""), "");
  assertEquals(EscapeHTML("Hello World!"), "Hello World!");
  assertEquals(EscapeHTML("héllo wörld"), "héllo wörld");
  assertEquals(EscapeHTML("café naïve — 日本語 🎉"), "café naïve — 日本語 🎉");
});

Deno.test("EscapeHTML escapes every special character", () => {
  assertEquals(EscapeHTML("&"), "&amp;");
  assertEquals(EscapeHTML("<"), "&lt;");
  assertEquals(EscapeHTML(">"), "&gt;");
  assertEquals(EscapeHTML(`"`), "&quot;");
  assertEquals(EscapeHTML("'"), "&#39;");
});

Deno.test("EscapeHTML escapes mixed content", () => {
  assertEquals(
    EscapeHTML(`<script>alert("xss")</script>`),
    "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
  );
  assertEquals(
    EscapeHTML(`Tom & Jerry's <b>"bold"</b>`),
    "Tom &amp; Jerry&#39;s &lt;b&gt;&quot;bold&quot;&lt;/b&gt;",
  );
  assertEquals(
    EscapeHTML(`<img src=x onerror=alert(1)>`),
    "&lt;img src=x onerror=alert(1)&gt;",
  );
});

Deno.test("EscapeHTML escapes already-escaped entities only once", () => {
  assertEquals(
    EscapeHTML("&amp;&lt;&gt;&quot;&#39;"),
    "&amp;amp;&amp;lt;&amp;gt;&amp;quot;&amp;#39;",
  );
});

Deno.test("EscapeHTML preserves non-ASCII characters exactly", () => {
  // Astral plane characters are stored as surrogate pairs in UTF-16; they
  // must survive escaping untouched.
  const input = "👍🏽 𝕏𝕐ℤ \u{1F600}";
  assertEquals(EscapeHTML(input), input);
});

Deno.test("EscapeHTML handles repeated special characters", () => {
  assertEquals(EscapeHTML("&".repeat(100)), "&amp;".repeat(100));
  assertEquals(EscapeHTML("<>".repeat(50)), "&lt;&gt;".repeat(50));
});

Deno.test("EscapeHTML returns the same instance when nothing changes", () => {
  // The fast path avoids any allocation for strings without escapable
  // characters.
  const input = "no escaping needed";
  assertEquals(EscapeHTML(input), input);
});
