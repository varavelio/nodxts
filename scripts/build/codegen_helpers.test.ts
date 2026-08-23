import { assert, assertEquals } from "@std/assert";
import {
  conflictsWithKeyword,
  createFuncName,
  hasDuplicateName,
  PRESERVED_GLOBALS,
  shadowsGlobal,
  stripGlobMarker,
  toPascalCase,
} from "./codegen_helpers.ts";
import type { Attr, El } from "./codegen_helpers.ts";

const els: El[] = [
  { name: "a", isVoid: false, description: "Defines a hyperlink." },
  { name: "data", isVoid: false, description: "Links data." },
  { name: "map", isVoid: false, description: "Defines an image map." },
  { name: "title", isVoid: false, description: "Defines a title." },
];

const attrs: Attr[] = [
  { name: "abbr", description: "Abbreviation." },
  { name: "class", description: "Classes.", isList: true },
  { name: "data-*", description: "Custom data." },
  { name: "for", description: "Associated control." },
  { name: "hidden", description: "Hides.", isBoolean: true },
  { name: "title", description: "Advisory title." },
];

Deno.test("hasDuplicateName detects element/attribute duplicates", () => {
  // Both a `title` element and a `title` attribute exist.
  assert(hasDuplicateName("title", els, attrs));

  // Unique names never conflict.
  assert(!hasDuplicateName("abbr", els, attrs));
  assert(!hasDuplicateName("a", els, attrs));
});

Deno.test("hasDuplicateName counts matches within the same collection", () => {
  const duplicatedEls: El[] = [
    ...els,
    { name: "a", isVoid: true, description: "Duplicate." },
  ];
  assert(hasDuplicateName("a", duplicatedEls, attrs));
});

Deno.test("conflictsWithKeyword matches final identifiers exactly", () => {
  const keywords = ["for", "class", "interface"];

  // A candidate that is literally a keyword must be escaped...
  assert(conflictsWithKeyword("for", keywords));

  // ...but TypeScript identifiers are case-sensitive: the PascalCase output
  // of the generator can never collide with a lowercase keyword.
  assert(!conflictsWithKeyword("Class", keywords));
  assert(!conflictsWithKeyword("For", keywords));
  assert(!conflictsWithKeyword("Interface", keywords));
});

Deno.test("stripGlobMarker removes only the trailing star", () => {
  assertEquals(stripGlobMarker("data-*"), "data-");
  assertEquals(stripGlobMarker("aria-*"), "aria-");
  assertEquals(stripGlobMarker("class"), "class");
});

Deno.test("toPascalCase converts kebab-case names", () => {
  assertEquals(toPascalCase("a"), "A");
  assertEquals(toPascalCase("div"), "Div");
  assertEquals(toPascalCase("accept-charset"), "AcceptCharset");
  assertEquals(toPascalCase("data-"), "Data");
  assertEquals(toPascalCase("http-equiv"), "HttpEquiv");
});

Deno.test("createFuncName resolves plain names", () => {
  const resolved = createFuncName("div", "El", false);
  assertEquals(resolved, { name: "Div", isGlob: false, attrName: "div" });
});

Deno.test("createFuncName appends the suffix on conflict", () => {
  assertEquals(createFuncName("title", "El", true).name, "TitleEl");
  assertEquals(createFuncName("title", "Attr", true).name, "TitleAttr");
  assertEquals(createFuncName("for", "Attr", true).name, "ForAttr");
});

Deno.test("createFuncName handles glob attributes", () => {
  const resolved = createFuncName("data-*", "Attr", false);
  assertEquals(resolved, { name: "Data", isGlob: true, attrName: "data-" });
});

Deno.test("PRESERVED_GLOBALS keeps ECMAScript constructors usable", () => {
  assert(PRESERVED_GLOBALS.includes("Map"));
  assert(PRESERVED_GLOBALS.includes("Object"));
  assert(shadowsGlobal("Map"));
  assert(shadowsGlobal("Object"));
  assert(!shadowsGlobal("Div"));
});
