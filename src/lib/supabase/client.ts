import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";

// Cliente do navegador. A anon key é pública de propósito: quem protege os
// dados é a RLS no banco, não o sigilo da chave.
//
// createBrowserClient (do @supabase/ssr) guarda a sessão em COOKIE, não em
// localStorage. Isso não é detalhe: o app é SSR, e o servidor só enxerga o
// usuário logado se o token viajar no cookie da requisição. Com localStorage,
// toda página renderizaria deslogada no servidor e piscaria ao hidratar.
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );
  }
  return browserClient;
}
