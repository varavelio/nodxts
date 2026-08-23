/**
 * NodX is a template engine for generating safe, clean, and type-safe HTML in TypeScript.
 *
 * In NodX, everything is a node and anything that implements the
 * {@linkcode Node} interface can be rendered as HTML or used as a child.
 *
 * @example Build a full document
 * ```ts
 * import { Body, ClassMap, DocType, Group, H1, Head, Html, P, Textf, TitleEl } from "@varavel/nodx";
 *
 * const happiness = 100;
 * const hideContainer = false;
 *
 * const page = Group(
 *   DocType(),
 *   Html(
 *     Head(TitleEl(Text("My NodX Page"))),
 *     Body(
 *       Div(
 *         ClassMap({ container: true, hidden: hideContainer }),
 *         H1(Class("title"), Text(`Welcome to ${"NodX"}!`)),
 *         P(Text("This is a type-safe HTML generator for TypeScript.")),
 *         If(happiness > 90, P(Text(`With NodX, you will be ${happiness}% happy!`))),
 *       ),
 *     ),
 *   ),
 * );
 *
 * console.log(page.render());
 * ```
 *
 * @module
 */

// Core types.
export type { AttributeValue, Node, NodeChild } from "./node.ts";

// Escape hatch.
export { Raw, RawNode, Text, TextNode } from "./text.ts";

// Attributes.
export { Attr, AttrBool, AttributeNode, AttrList } from "./attribute.ts";

// Elements.
export { El, ElementNode, ElVoid } from "./element.ts";

// Groups.
export { Group, GroupNode } from "./group.ts";

// Conditional helpers.
export { ClassMap, type ClassMapInput } from "./class_map.ts";
export { StyleMap, type StyleMapInput } from "./style_map.ts";
export { Each, If } from "./conditional.ts";

// Special nodes.
export { DocType } from "./doctype.ts";

// Utilities.
export { EscapeHTML } from "./escape_html.ts";

// Generated HTML vocabulary (every standard element and attribute).
export * from "./generated/elements.ts";
export * from "./generated/attributes.ts";
