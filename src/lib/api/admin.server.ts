// Quem está chamando esta server function, e é admin?
//
// Na web a sessão viaja em cookie. No app empacotado, não: a origem é
// capacitor://localhost chamando sono-path.vercel.app, e navegador nenhum
// manda cookie entre origens diferentes assim. O app compensa enviando o
// token no cabeçalho Authorization (ver src/start.ts), e é por isso que aqui
// os dois caminhos são aceitos.

import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../supabase/database.types";
import { getSupabaseServerClient } from "../supabase/server";

/**
 * Devolve o usuário e um cliente que fala EM NOME DELE.
 *
 * Os dois andam juntos de propósito. Identificar a pessoa pelo token e depois
 * consultar o banco com um cliente sem sessão não funciona: a consulta sai como
 * visitante, a RLS esconde o próprio perfil da pessoa, e a checagem de admin
 * recusa alguém que É admin. Foi exatamente o que acontecia no app — o login
 * passava e o painel dizia que não havia permissão.
 */
async function usuarioDaRequisicao() {
  const header = getRequestHeader("authorization") ?? getRequestHeader("Authorization");
  const token = header?.replace(/^Bearer\s+/i, "").trim();

  if (token) {
    // Cliente com o token em TODAS as requisições: o auth.getUser valida a
    // assinatura, e as consultas seguintes rodam sob a identidade dele, com a
    // RLS enxergando o que essa pessoa pode ver.
    const supabase = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data } = await supabase.auth.getUser(token);
    return { supabase, user: data.user ?? null };
  }

  // Web: a sessão vem no cookie e o cliente do @supabase/ssr já a aplica.
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user ?? null };
}

/**
 * Barra quem não for admin. Lança em vez de devolver false para que esquecer
 * de checar o retorno não vire uma porta aberta.
 */
export async function exigirAdmin() {
  const { supabase, user } = await usuarioDaRequisicao();
  if (!user) throw new Error("NAO_AUTENTICADO");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (perfil?.role !== "admin") throw new Error("NAO_AUTORIZADO");
  return user.id;
}
