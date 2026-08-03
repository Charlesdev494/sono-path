import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { EH_NATIVO } from "../nativo";
import type { Database } from "./database.types";

// Cliente do navegador. A anon key é pública de propósito: quem protege os
// dados é a RLS no banco, não o sigilo da chave.
//
// Onde a sessão é guardada muda conforme o alvo, e não é detalhe:
//
// - WEB: cookie, via createBrowserClient do @supabase/ssr. O app é SSR, e o
//   servidor só enxerga o usuário logado se o token viajar no cookie da
//   requisição. Com localStorage, toda página renderizaria deslogada no
//   servidor e piscaria ao hidratar.
//
// - NATIVO: localStorage. Dentro do app a origem é capacitor://localhost, um
//   esquema onde o WKWebView descarta cookies — a sessão era gravada e sumia.
//   O login funcionava (é uma chamada de rede), mas as consultas seguintes
//   saíam sem token e a RLS devolvia zero linhas em vez de erro: o app abria
//   vazio, sem nada indicando o motivo. E aqui não há SSR, então o cookie não
//   serve para mais nada.
let browserClient: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    browserClient = EH_NATIVO
      ? createClient<Database>(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            // Sem OAuth por link de retorno nesta versão; deixar ligado faria o
            // cliente procurar token na URL a cada abertura, à toa.
            detectSessionInUrl: false,
          },
        })
      : createBrowserClient<Database>(url, anonKey);
  }
  return browserClient;
}
