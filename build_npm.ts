import { build, emptyDir } from "@deno/dnt";
import denoFile from "./deno.json" with { type: "json" };

await emptyDir("./npm");

await build({
  packageManager: "pnpm",
  entryPoints: [
    {
      name: ".",
      path: "./src/mod.ts",
    },
    {
      name: "./schemas",
      path: "./src/schemas.ts",
    },
    {
      name: "./bindings",
      path: "./src/bindings.ts",
    },
  ],
  outDir: "./npm",
  typeCheck: false,
  test: false,
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    name: denoFile.name,
    version: denoFile.version,
  },
});
