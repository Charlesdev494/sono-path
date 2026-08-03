// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import process from "node:process";

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// ---------------------------------------------------------------------------
// Build nativo (Capacitor → App Store / Play)
// ---------------------------------------------------------------------------
// A web continua SSR na Vercel; nada aqui muda o build de sempre. O app das
// lojas precisa de outra coisa: a Apple rejeita app que é só um navegador
// apontando para um site (Guideline 4.2), então o pacote leva os arquivos
// dentro dele e roda como SPA.
//
// Duas mudanças, ligadas por NATIVE=1:
//
// 1. spa.enabled — gera o index.html estático que o Capacitor carrega. Sem
//    ele o build só produz rotas de servidor e não há o que empacotar.
//
// 2. VITE_NATIVE_API_URL — dentro do app a origem é capacitor://localhost, onde
//    não existe backend. Quem redireciona as chamadas para a Vercel é o hook
//    serverFns.fetch, em src/start.ts; aqui só publicamos o endereço.
//
//    Tentei antes a opção serverFns.base do próprio Start: ela é normalizada
//    como CAMINHO, não URL — "https://..." virava "/https:/..." no bundle.
const nativo = process.env.NATIVE === "1";

// Trocável por env para apontar um build de teste a um preview, sem editar código.
const API = process.env.NATIVE_API_URL ?? "https://sono-path.vercel.app";

export default defineConfig({
  // O Nitro empacota para Cloudflare e grava em .output/. É o que a web precisa,
  // mas quebra o prerender do SPA: ele procura o servidor em dist/server/, o
  // layout padrão do Start. Desligado no build nativo, que não vai para
  // servidor nenhum — vira arquivo dentro do app.
  nitro: nativo ? false : undefined,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(nativo
      ? {
          spa: {
            enabled: true,
            // Padrão do Start é _shell.html; o Capacitor carrega index.html.
            prerender: { outputPath: "/index" },
          },
        }
      : {}),
  },
  vite: {
    define: nativo
      ? { "import.meta.env.VITE_NATIVE_API_URL": JSON.stringify(API) }
      : // Na web fica undefined, e o hook de fetch não faz nada: as chamadas
        // continuam relativas, na mesma origem.
        { "import.meta.env.VITE_NATIVE_API_URL": "undefined" },
  },
});
