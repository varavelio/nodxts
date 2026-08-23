import { build, emptyDir, LibName } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/main.ts"],
  outDir: "./npm",
  shims: {
    deno: "dev",
  },
  test: false,
  compilerOptions: {
    lib: ["ES2025", "DOM"] as LibName[],
    target: "ES2015",
  },
  package: {
    name: "@varavel/nodx",
    description: "NodX implementation for TypeScript",
    version: Deno.args[0],
    license: "MIT",
    author: "Varavel",
    homepage: "https://github.com/varavelio/nodxts",
    repository: {
      type: "git",
      url: "git+https://github.com/varavelio/nodxts.git",
    },
    bugs: {
      url: "https://github.com/varavelio/nodxts/issues",
    },
    keywords: [
      "typescript",
      "nodx",
      "html",
      "template-engine",
      "varavel",
      "deno",
      "node",
      "nodejs",
    ],
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
