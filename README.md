<h1 align="center">NodX for TypeScript</h1>

<p align="center">
  <a href="https://jsr.io/@varavel/nodx">
    <img src="https://jsr.io/badges/@varavel/nodx" alt="JSR badge"/>
  </a>
  <a href="https://www.npmjs.com/package/@varavel/nodx">
    <img src="https://img.shields.io/npm/v/@varavel/nodx.svg?label=npm" alt="npm version"/>
  </a>
  <a href="https://github.com/varavelio/nodxts/actions/workflows/ci.yaml">
    <img src="https://github.com/varavelio/nodxts/actions/workflows/ci.yaml/badge.svg" alt="CI status"/>
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/varavelio/nodxts.svg" alt="License"/>
  </a>
  <a href="https://github.com/varavelio/nodxts">
    <img src="https://img.shields.io/github/stars/varavelio/nodxts?style=flat&label=github+stars" alt="GitHub stars"/>
  </a>
</p>

<p align="center">
  <a href="https://varavel.com">
    <img src="https://cdn.jsdelivr.net/gh/varavelio/brand@1.0.0/dist/badges/project.svg" alt="A Varavel project"/>
  </a>
</p>

---

NodX lets you write HTML as plain TypeScript functions. No template strings, no JSX, no new syntax
to learn.

You get type safety, automatic escaping, and readable code - and the HTML it generates is exactly
what you'd expect.

## Key Features

- **Zero dependencies** - tiny, fast, and easy to keep updated.
- **Type safe** - your editor catches typos in tags and attributes before you run anything.
- **Secure by default** - text and attribute values are escaped automatically. No XSS surprises.
- **Readable output** - what you write is what gets rendered, without hidden magic.
- **Familiar** - if you know HTML and TypeScript, you already know NodX.

## Installation

```sh
# npm (Node, Deno, Bun, etc.)
npm install --save --save-exact @varavel/nodx

# JSR (Deno)
deno add --save-exact jsr:@varavel/nodx
```

## Quick Start

Pick the import style you like. Both do the same thing.

**A) Named imports - explicit and tree-shakeable:**

```ts
import {
  Body,
  Class,
  ClassMap,
  Div,
  DocType,
  Group,
  H1,
  Head,
  Html,
  If,
  P,
  TitleEl,
} from "@varavel/nodx";

const happiness = 100;

const page = Group(
  DocType(),
  Html(
    Head(
      TitleEl("My NodX Page"),
    ),
    Body(
      Div(
        ClassMap({
          container: true,
          hidden: false,
        }),
        H1(
          Class("title"),
          "Welcome to NodX!",
        ),
        P("This is a type-safe HTML generator for TypeScript."),
        If(
          happiness > 90,
          P(`With NodX, you will be ${happiness}% happy!`),
        ),
      ),
    ),
  ),
);

console.log(page.render());
```

**B) Namespace import - no need to list everything:**

```ts
import * as N from "@varavel/nodx";

const happiness = 100;

const page = N.Group(
  N.DocType(),
  N.Html(
    N.Head(
      N.TitleEl("My NodX Page"),
    ),
    N.Body(
      N.Div(
        N.ClassMap({
          container: true,
          hidden: false,
        }),
        N.H1(
          N.Class("title"),
          "Welcome to NodX!",
        ),
        N.P("This is a type-safe HTML generator for TypeScript."),
        N.If(
          happiness > 90,
          N.P(`With NodX, you will be ${happiness}% happy!`),
        ),
      ),
    ),
  ),
);

console.log(page.render());
```

Both render the same HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My NodX Page</title>
  </head>
  <body>
    <div class="container">
      <h1 class="title">Welcome to NodX!</h1>
      <p>This is a type-safe HTML generator for TypeScript.</p>
      <p>With NodX, you will be 100% happy!</p>
    </div>
  </body>
</html>
```

> All HTML in this README is formatted for readability. NodX itself emits everything minified by
> default (no line breaks or extra whitespace) - same content, just compact.

From here on we'll use named imports for brevity, but anything like `Div(...)` can be written as
`N.Div(...)` if you prefer the namespace style.

---

## How it works

### Elements are just functions

Call a tag like a function. Pass children, attributes, groups, or plain text - strings are escaped
automatically, just like `Text()`.

```ts
import { Class, Div, H1, P } from "@varavel/nodx";

const node = Div(
  Class("container"),
  H1(Text("Hello, NodX!")), // Text() is optional, you can use a string directly
  P("Build clean and safe HTML effortlessly."),
);

console.log(node.render());
```

```html
<div class="container">
  <h1>Hello, NodX!</h1>
  <p>Build clean and safe HTML effortlessly.</p>
</div>
```

### Attributes are functions too

Same idea for attributes. `Src`, `Alt`, `Href` - you get autocomplete and type checking for all of
them.

```ts
import { Alt, Img, Src } from "@varavel/nodx";

console.log(
  Img(
    Src("image.jpg"),
    Alt("A beautiful image"),
  ).render(),
);
```

```html
<img
  src="image.jpg"
  alt="A beautiful image"
>
```

There are boolean attributes e.g.: `Disabled()` means `Disabled(true)`, `Disabled(false)` removes
it.

```ts
import { Checked, Disabled, Input } from "@varavel/nodx";

console.log(
  Input(
    Checked(),
    Disabled(false),
  ).render(),
);

console.log(
  Input(
    Checked(false),
  ).render(),
);

console.log(
  Input(
    Disabled(),
  ).render(),
);
```

```html
<input checked>
<input>
<input disabled>
```

### Classes and styles that react to data

`ClassMap` and `StyleMap` keep conditional classes readable. Only truthy entries make it to the
output.

```ts
import { ClassMap, Div, StyleMap } from "@varavel/nodx";

const node = Div(
  ClassMap({
    visible: true,
    hidden: false,
  }),
  StyleMap({
    "border: 1px solid black": true,
    "padding: 10px": false,
  }),
  "Conditional styling made simple!",
);

console.log(node.render());
```

```html
<div
  class="visible"
  style="border: 1px solid black"
>
  Conditional styling made simple!
</div>
```

### Conditionals and loops without a template language

No `{{if}}` or `{{each}}`. Just `If`, `Map`, and `Eval`.

```ts
import { Div, Eval, Group, If, Li, Map, Ul } from "@varavel/nodx";

const items = ["one", "two", "three"];
const isAdmin = true;
const score = 42;

const node = Group(
  If(
    isAdmin,
    Div("Admin only!"),
  ),
  // lazy version - the function only runs if isAdmin is true
  If(
    isAdmin,
    () => Div("Lazily rendered"),
  ),
  Ul(
    Map(
      items,
      (item) => Li(item),
    ),
  ),
  Eval(() => score > 40 ? Div("High score!") : Div("Keep trying")),
);

console.log(node.render());
```

```html
<div>
  Admin only!
</div>
<div>
  Lazily rendered
</div>
<ul>
  <li>one</li>
  <li>two</li>
  <li>three</li>
</ul>
<div>
  High score!
</div>
```

`Map` flattens arrays for you, so you don't need to spread. `null`, `undefined`, and `false` are
ignored - great for inline conditionals.

### Components are just functions

If it returns a `Node`, it's a component. No special API.

```ts
import { Button, Class, Div, type Node } from "@varavel/nodx";

function PrimaryButton(label: string): Node {
  return Button(
    Class(
      "btn btn-sm",
      "btn-primary",
    ),
    label,
  );
}

console.log(
  Div(
    PrimaryButton("Save"),
    PrimaryButton("Cancel"),
  ).render(),
);
```

```html
<div>
  <button class="btn btn-sm btn-primary">Save</button>
  <button class="btn btn-sm btn-primary">Cancel</button>
</div>
```

With the namespace import it looks the same:

```ts
import * as N from "@varavel/nodx";
import type { Node } from "@varavel/nodx";

function PrimaryButton(label: string): Node {
  return N.Button(
    N.Class(
      "btn btn-sm",
      "btn-primary",
    ),
    label,
  );
}
```

### When you need something custom

Everything standard is generated for you, but you can always drop down to the primitives:

```ts
import { Attr, El, ElVoid } from "@varavel/nodx";

console.log(
  El(
    "my-widget",
    "Hello",
  ).render(),
);

console.log(
  ElVoid("my-decoration").render(),
);

console.log(
  El(
    "div",
    Attr(
      "data-user",
      "7",
    ),
    "hi",
  ).render(),
);
```

```html
<my-widget>
  Hello
</my-widget>
```

```html
<my-decoration>
```

```html
<div data-user="7">
  hi
</div>
```

`El` is a normal element (with closing tag), `ElVoid` is for void elements (no closing tag), and
`Attr` lets you create any attribute.

### Naming collisions are already handled

Following the [NodX spec](https://github.com/varavelio/nodx/blob/main/SPEC.md), names that would
clash get a predictable suffix:

| Why it collides                     | What you use                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| Element vs attribute with same name | `DataEl` (element `<data>`) / `Data` (attribute `data-*`), `TitleEl` / `TitleAttr` |
| Reserved JS global                  | `MapEl` (element `<map>`), `ObjectEl` (element `<object>`)                         |

Everything else is just PascalCase of the HTML name: `Div`, `Input`, `Class`, `Href`. You rarely
need to think about it - autocomplete shows you the right one.

---

## NodX vs. other approaches

|                 | **NodX**                          | **Template engine**          | **JS framework**         |
| --------------- | --------------------------------- | ---------------------------- | ------------------------ |
| **You write**   | functions (`Div()`, `Class()`)    | files with `{{ }}`           | JSX                      |
| **Type safety** | full - compiler checks every tag  | none - typos fail at runtime | partial                  |
| **New syntax?** | none                              | its own mini-language        | JSX + framework concepts |
| **Best for**    | server HTML, emails, static sites | classic server pages         | highly interactive UIs   |

If your page is mostly server-rendered and you want safety without learning a new templating
language, NodX fits well.

## Documentation

Full API reference — every element, attribute, helper and type, with examples — is on JSR:

**https://jsr.io/@varavel/nodx/doc**

If you want to browse what's available or check a specific tag's signature, start there.

## Ecosystem

NodX can be extended with additional libraries that provide ready-to-use components, attributes, and
server utilities. Here are some projects built on top of NodX:

- [**nodxts-alpine**](https://github.com/varavelio/nodxts-alpine) - Alpine.js attributes for NodX
  Go.
- [**nodxts-htmx**](https://github.com/varavelio/nodxts-htmx) - HTMX attributes and server utilities
  for NodX Go.
- [**nodxts-lucide**](https://github.com/varavelio/nodxts-lucide) - Beautiful & consistent icons for
  NodX Go provided by [Lucide](https://lucide.dev/).
- [**nodxts-simpleicons**](https://github.com/varavelio/nodxts-simpleicons) - The
  [Simple Icons](https://simpleicons.org/) brand icons set for NodX Go.

> **Building your own NodX library?** We'd love to feature it here! Open a pull request adding your
> project to this list, and help grow the NodX ecosystem together.

## Tailwind CSS

Get autocomplete for classes inside `Class(...)` and `ClassMap({...})` by adding this to your VS
Code settings:

```json
{
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "typescript": "typescript"
  },
  "tailwindCSS.experimental.classRegex": [
    [
      "Class\\(([^)]*)\\)",
      "[\"`]([^\"`]*)[\"`]"
    ],
    [
      "ClassMap\\(([^)]*)\\)",
      "[\"`]([^\"`]*)[\"`]"
    ]
  ]
}
```

It works with both import styles (`Class(...)` and `N.Class(...)`).

## License

MIT - see [LICENSE](LICENSE).
