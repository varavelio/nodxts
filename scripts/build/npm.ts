import { build, emptyDir, LibName } from "@deno/dnt";
import { fromRoot } from "./helpers.ts";
import denoJson from "../../deno.json" with { type: "json" };

export async function buildNpmPackage() {
  await emptyDir(fromRoot("./npm"));

  await build({
    entryPoints: [fromRoot("./src/index.ts")],
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
      version: denoJson.version,
      sideEffects: false,
      publishConfig: {
        access: "public",
      },
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
}
