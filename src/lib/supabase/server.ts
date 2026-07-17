import { createServerClient } from "@supabase/ssr";
import { getCookie, getRequestHeader, setCookie } from "@tanstack/react-start/server";

import type { Database } from "./database.types";

// Cliente Supabase do lado do servidor.
//
// A sessão vive em cookie (definido pelo cliente do @supabase/ssr no
// navegador). Aqui lemos e escrevemos esse cookie via a API de request do
// TanStack Start, para que uma server function saiba QUEM está chamando —
// diferente das funções de IA, onde a identidade do usuário não importa.
//
// Só existe no servidor: a anon key é pública, mas createServerClient depende
// dos cookies da requisição, que não existem no navegador.
export async function getSupabaseServerClient() {
  return createServerClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      cookies: {
        // O @supabase/ssr lê todos os cookies de uma vez. Reconstruímos a
        // lista a partir do header Cookie da requisição.
        getAll() {
          const header = getRequestHeader("cookie") ?? "";
          return header
            .split(";")
            .map((p) => p.trim())
            .filter(Boolean)
            .map((par) => {
              const i = par.indexOf("=");
              return {
                name: decodeURIComponent(par.slice(0, i)),
                value: decodeURIComponent(par.slice(i + 1)),
              };
            });
        },
        setAll(cookies) {
          // O Supabase pode rotacionar o token no meio da requisição; gravamos
          // de volta para a próxima requisição já vir com o token novo.
          for (const { name, value, options } of cookies) {
            setCookie(name, value, options);
          }
        },
      },
    },
  );
}

// getCookie fica exportado para quem precisar de um cookie avulso sem montar o
// cliente inteiro.
export { getCookie };
