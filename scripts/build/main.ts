import { runCodegen } from "./codegen.ts";
import { buildNpmPackage } from "./npm.ts";

await runCodegen();
await buildNpmPackage();
