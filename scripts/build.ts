import { build, emptyDir, LibName } from "@deno/dnt";
import { dirname, fromFileUrl, join } from "@std/path";

/**
 * Converts any path relative to workspace root and returns its absolute url.
 *
 * @param relativePath The path relative to workspace root
 * @returns The absolute path
 */
const fromRoot = (relativePath: string) => {
  const scriptDir = dirname(fromFileUrl(import.meta.url));
  return join(scriptDir, "..", relativePath);
};

await emptyDir(fromRoot("./npm"));

await build({
  entryPoints: [fromRoot("./src/main.ts")],
  outDir: fromRoot("./npm"),
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
    sideEffects: false,
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
    Deno.copyFileSync(fromRoot("./LICENSE"), fromRoot("./npm/LICENSE"));
    Deno.copyFileSync(fromRoot("./README.md"), fromRoot("./npm/README.md"));
  },
});
