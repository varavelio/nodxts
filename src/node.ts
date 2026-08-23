/**
 * The foundational types of NodX.
 *
 * In NodX, everything is a node. There are three kinds of built-in nodes:
 *
 * - **Element nodes**: an HTML element, like `<div>` or `<img>`.
 * - **Attribute nodes**: an HTML attribute, like `class` or `href`.
 * - **Text nodes**: text content inside an element.
 *
 * Anything that implements the {@linkcode Node} interface can be rendered as
 * HTML and used anywhere a node is accepted, which is how custom components
 * and third-party extensions integrate with the library.
 *
 * @module
 */

/**
 * The interface that wraps the basic render methods used by the different
 * NodX node types.
 *
 * Anything that implements this interface can be used as a node.
 *
 * Implementing this interface directly is considered an advanced use case:
 * most code should create nodes with the provided factories ({@linkcode
 * El}, {@linkcode Attr}, {@linkcode Text}, etc) or with plain functions that
 * return node trees (components).
 */
export interface Node {
  /**
   * Returns the node HTML as a string.
   *
   * This method is pure: it never mutates the node and always returns the
   * same output for the same node.
   */
  render(): string;

  /**
   * Indicates whether the node should be treated as content (an element,
   * text or a group of them) when used as a child of another node.
   */
  isElement(): boolean;

  /** Indicates whether the node should be treated as an attribute. */
  isAttribute(): boolean;
}

/**
 * Anything that can be used as a child of an element or a group.
 *
 * - {@linkcode Node} values are used as-is.
 * - Strings, numbers are converted into escaped text nodes, so user-provided
 *   data is always safe to interpolate.
 * - Arrays are flattened recursively, which makes spreading the result of
 *   `.map()` unnecessary.
 * - `null`, `undefined` and booleans are ignored, which enables idiomatic
 *   conditional rendering like `${isActive && Div(...)}` without leaking
 *   stray "false" text into the output.
 */
export type NodeChild =
  | Node
  | string
  | number
  | NodeChild[]
  | null
  | undefined
  | boolean;

/**
 * A value that can be assigned to an attribute.
 *
 * Numbers are converted to their decimal string representation before being
 * escaped, so `Attr("tabindex", 1)` renders as `tabindex="1"`.
 */
export type AttributeValue = string | number;
