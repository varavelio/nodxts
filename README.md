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

NodX is a modern and developer-friendly template engine for generating **safe**, **clean**, and
**maintainable** HTML in TypeScript. Designed for maximum productivity and easy maintenance, it
combines **simplicity**, **type safety** and **robust formatting**.

## Key Features

- **Zero Dependencies 📦**: Lightweight and fast, with no external dependencies.
- **Type Safety 🛡️**: Fully typed APIs ensure you write error-free HTML, even at scale.
- **Robust Formatting 🧹**: Generated HTML stays readable and consistent.
- **DX in Mind 🧠**: If you can write HTML and TypeScript, you can write NodX.
- **Security by Default 🔒**: Text and attribute values are automatically escaped to prevent XSS.

## Quick Start

```sh
# From NPM (Node, Deno, Bun, etc)
npm install --save --save-exact @varavel/nodx

# From JSR (Deno)
deno add --save-exact jsr:@varavel/nodx
```

Start building your HTML with intuitive, type-safe functions. Plain strings are automatically
escaped, just like `Text()`:

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
const hideContainer = false;

const page = Group(
  DocType(),
  Html(
    Head(TitleEl("My NodX Page")),
    Body(
      Div(
        ClassMap({ container: true, hidden: hideContainer }),
        H1(Class("title"), "Welcome to NodX!"),
        P("This is a type-safe HTML generator for TypeScript."),
        If(happiness > 90, P(`With NodX, you will be ${happiness}% happy!`)),
      ),
    ),
  ),
);

console.log(page.render());
```

### Output:

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

## Key Concepts

### **Elements made easy**

Every HTML tag is a function! Just call it with child elements, attributes, groups or plain text:

```ts
import { Div, H1, P } from "@varavel/nodx";

Div(
  Class("container"),
  H1("Hello, NodX!"),
  P("Build clean and safe HTML effortlessly."),
);
```

Plain strings like `"Hello"` work exactly like `Text("Hello")` and are always escaped.

### **Attributes with helpers**

Attributes like `class`, `src` and `alt` have their own functions too:

```ts
import { Alt, Img, Src } from "@varavel/nodx";

Img(Src("image.jpg"), Alt("A beautiful image"));
```

**Boolean attributes** (like `checked`, `disabled` and `required`) are ergonomic by default:
`Disabled()` is the same as `Disabled(true)`, and `Disabled(false)` omits it.

```ts
import { Checked, Disabled, Input } from "@varavel/nodx";

Input(Checked(), Disabled(false));
// Output: <input checked>
```

### **Dynamic class management**

Use `ClassMap` and `StyleMap` to conditionally include classes and style rules:

```ts
import { ClassMap, StyleMap } from "@varavel/nodx";

Div(
  ClassMap({ visible: true, hidden: false }),
  StyleMap({ "border: 1px solid black": true, "padding: 10px": false }),
  "Conditional styling made simple!",
);
```

### **Control flow**

Use `If` for conditionals and `Map` for loops. `Eval` lets you inline computed nodes:

```ts
import { Div, Eval, Group, If, Li, Map, Ul } from "@varavel/nodx";

const items = ["one", "two", "three"];
const isAdmin = true;
const score = 42;

Group(
  If(isAdmin, Div("Admin only!")),
  If(isAdmin, () => Div("Lazily rendered")),
  Ul(Map(items, (item) => Li(item))),
  Eval(() => score > 40 ? Div("High score!") : Div("Keep trying")),
);
```

### **Fully typed components**

Components are just functions returning nodes:

```ts
import { Button, Class, Div, type Node } from "@varavel/nodx";

function PrimaryButton(label: string): Node {
  return Button(Class("btn btn-sm", "btn-primary"), label);
}

Div(PrimaryButton("Save"), PrimaryButton("Cancel"));
```

### **Naming collisions**

Following the [NodX specification](https://github.com/varavelio/nodx/blob/main/SPEC.md), generated
functions never collide. When a name would collide, it gets a deterministic suffix:

| Reason                     | Example                                                       |
| -------------------------- | ------------------------------------------------------------- |
| Element/attribute clash    | `data` → `DataEl`/`DataAttr`, `title` → `TitleEl`/`TitleAttr` |
| ECMAScript global preserve | `map` → `MapEl`, `object` → `ObjectEl`                        |

- `DataEl("hi")` is the `<data>` element; `Data("key", "value")` is the `data-*` attribute.

Every other name is the plain PascalCase of the HTML name: `Div(...)`, `Input(...)`, `Class(...)`,
`Href(...)`.

### **Custom elements and attributes**

When you need something not covered by the generated vocabulary:

```ts
import { Attr, El, ElVoid } from "@varavel/nodx";

El("my-widget", "Hello");
ElVoid("my-decoration");
El("div", Attr("data-user", "7"), "hi");
```

## Why Choose NodX?

|                      | NodX                                                   | Template engine                    | JS framework                        |
| -------------------- | ------------------------------------------------------ | ---------------------------------- | ----------------------------------- |
| HTML is written with | native functions (`Div()`, `Class()`)                  | template files with `{{ }}` syntax | JSX / JavaScript                    |
| Type safety          | full - the compiler validates every tag                | none - typos are runtime surprises | partial - JSX, but still JavaScript |
| New syntax to learn  | none                                                   | a mini-language                    | JSX + framework concepts            |
| Built for            | server-rendered HTML, simple UIs, static sites, emails | classic server-rendered pages      | rich, interactive client-side apps  |

## Tailwind CSS

If you use TailwindCSS, add this to your VS Code settings so IntelliSense picks up the classes
inside `Class(...)` and `ClassMap({... })`:

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

## License

NodX is open source under the [MIT License](LICENSE).
