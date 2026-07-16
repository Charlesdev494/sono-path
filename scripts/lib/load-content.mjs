// Carrega o conteúdo hardcoded (quiz.ts, casos.ts, atlas.ts) para dentro do Node.
//
// Esses arquivos são TypeScript e importam @/assets/*.asset.json, então não dá
// para simplesmente dar require() neles. O esbuild resolve os dois problemas de
// uma vez: transpila o TS e inlineia os JSON de asset.
//
// Usado pelo seed (migra o conteúdo para o banco) e serve como ponte enquanto
// os arquivos originais ainda existirem no repositório.

import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(import.meta.dirname, "../..");

export async function loadContent() {
  const outDir = await mkdtemp(join(tmpdir(), "us360-content-"));

  try {
    await build({
      entryPoints: [
        join(ROOT, "src/content/quiz.ts"),
        join(ROOT, "src/content/casos.ts"),
        join(ROOT, "src/content/atlas.ts"),
      ],
      bundle: true,
      format: "esm",
      platform: "node",
      outdir: outDir,
      outExtension: { ".js": ".mjs" },
      loader: { ".json": "json" },
      alias: { "@": join(ROOT, "src") },
      logLevel: "error",
    });

    const [quiz, casos, atlas] = await Promise.all([
      import(pathToFileURL(join(outDir, "quiz.mjs")).href),
      import(pathToFileURL(join(outDir, "casos.mjs")).href),
      import(pathToFileURL(join(outDir, "atlas.mjs")).href),
    ]);

    return { QUIZ: quiz.QUIZ, CASOS: casos.CASOS, ATLAS: atlas.ATLAS };
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
}
