/**
 * Pure helpers shared by the code generator.
 *
 * Keeping the naming rules in a small, dependency-free module makes them
 * easy to test exhaustively, which is exactly what
 * {@link ./codegen_helpers.test.ts} does.
 *
 * @module
 */

/** An HTML element as described by `data/elements.json`. */
export interface El {
  /** The tag name (e.g. `div`, `img`). */
  name: string;
  /** Whether the element is a void element (no closing tag). */
  isVoid: boolean;
  /** A short human-readable description of the element. */
  description: string;
}

/** An HTML attribute as described by `data/attributes.json`. */
export interface Attr {
  /** The attribute name (e.g. `class`, `aria-*`). */
  name: string;
  /** A short human-readable description of the attribute. */
  description: string;
  /** Whether the attribute is a boolean attribute (`disabled`, `checked`...). */
  isBoolean?: boolean;
  /**
   * Whether the attribute accepts a space-separated list of tokens
   * (`class`, `rel`...).
   */
  isList?: boolean;
}

/** The suffix appended to generated function names on collision. */
export type Suffix = "El" | "Attr";

/**
 * ECMAScript global constructors that must not be shadowed by generated
 * exports.
 *
 * All generated names are PascalCase, which makes collisions with the
 * lowercase JavaScript keywords impossible (identifiers are
 * case-sensitive). Shadowing a global *constructor*, however, is still
 * possible and genuinely dangerous: an exported `Map` function would break
 * every `new Map()` call in modules using named imports, and an exported
 * `Object` function would break every `Object.keys(...)` call.
 *
 * The `map` element therefore becomes `MapEl`, which conveniently matches
 * the Go implementation, where `map` is a reserved keyword. Only globals
 * defined by ECMAScript itself are listed here: they exist in every
 * runtime this library supports.
 */
export const PRESERVED_GLOBALS: readonly string[] = ["Map", "Object"];

/** The resolved name of a generated function. */
export interface FuncName {
  /** The final function name (e.g. `Div`, `TitleEl`, `Data`). */
  name: string;
  /** Whether the attribute is a glob pattern like `data-*`. */
  isGlob: boolean;
  /** The attribute name with the glob marker removed (e.g. `data-`). */
  attrName: string;
}

/**
 * Determines whether more than one element or attribute shares the same
 * raw name, following the NodX specification.
 *
 * When two entries share a name (e.g. the `title` element and the `title`
 * attribute), both get a deterministic suffix (`El` for elements and
 * `Attr` for attributes) so that no two exports ever share a name.
 *
 * @param name The raw element or attribute name (globs included).
 * @param els The full list of elements.
 * @param attrs The full list of attributes.
 * @returns `true` when the name needs a deterministic suffix.
 */
export function hasDuplicateName(
  name: string,
  els: readonly El[],
  attrs: readonly Attr[],
): boolean {
  let matches = 0;

  for (const el of els) {
    if (el.name === name) matches++;
  }
  for (const attr of attrs) {
    if (attr.name === name) matches++;
  }

  return matches > 1;
}

/**
 * Determines whether a candidate identifier collides with a reserved
 * keyword of the target language, following the NodX specification.
 *
 * The candidate must be the *final* generated identifier (e.g. `Class`),
 * not the raw HTML name (e.g. `class`). TypeScript identifiers are
 * case-sensitive and every keyword is lowercase, so PascalCase candidates
 * can never collide in practice; the check is kept data-driven so the day
 * the naming scheme changes, the guard is already in place.
 *
 * @param candidate The final generated identifier (e.g. `Div`).
 * @param keywords The reserved words of the target language.
 * @returns `true` when the identifier needs a deterministic suffix.
 */
export function conflictsWithKeyword(
  candidate: string,
  keywords: readonly string[],
): boolean {
  return keywords.includes(candidate);
}

/**
 * Determines whether a generated PascalCase name would shadow one of the
 * preserved ECMAScript globals (see {@linkcode PRESERVED_GLOBALS}).
 *
 * @param funcName The generated function name.
 * @returns `true` when the name must get a suffix.
 */
export function shadowsGlobal(funcName: string): boolean {
  return PRESERVED_GLOBALS.includes(funcName);
}

/**
 * Removes the glob marker (`*`) from an attribute name, keeping any
 * trailing hyphen: `data-*` becomes `data-`.
 *
 * @param name The raw attribute name.
 * @returns The name without its glob marker.
 */
export function stripGlobMarker(name: string): string {
  return name.endsWith("*") ? name.slice(0, -1) : name;
}

/**
 * Resolves the final function name for an element or attribute.
 *
 * Glob attributes (like `data-*`) keep their trailing hyphen in `attrName`
 * so generators can append the dynamic key directly.
 *
 * @param name The raw element or attribute name.
 * @param type Whether this is an element or an attribute.
 * @param conflict Whether {@linkcode hasDuplicateName}, {@linkcode
 * conflictsWithKeyword} or {@linkcode shadowsGlobal} returned `true`.
 * @returns The resolved function name.
 */
export function createFuncName(
  name: string,
  type: Suffix,
  conflict: boolean,
): FuncName {
  const isGlob = name.endsWith("*");
  const attrName = stripGlobMarker(name);

  let funcName = toPascalCase(attrName);

  if (conflict) {
    funcName += type;
  }

  return { name: funcName, isGlob, attrName };
}

/**
 * Converts a kebab-case (or plain lowercase) name into PascalCase.
 *
 * Mirrors the behavior of the Go implementation's generator:
 * `accept-charset` becomes `AcceptCharset` and `a` stays `A`.
 *
 * @param name The kebab-case name.
 * @returns The PascalCase name.
 */
export function toPascalCase(name: string): string {
  return name
    .split("-")
    .map((part) => part.length === 0 ? "" : part[0].toUpperCase() + part.slice(1))
    .join("");
}
