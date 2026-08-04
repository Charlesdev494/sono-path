// Quem está chamando esta server function, e é admin?
//
// Na web a sessão viaja em cookie. No app empacotado, não: a origem é
// capacitor://localhost chamando sono-path.vercel.app, e navegador nenhum
// manda cookie entre origens diferentes assim. O app compensa enviando o
// token no cabeçalho Authorization (ver src/start.ts), e é por isso que aqui
// os dois caminhos são aceitos.
//
// O token é sempre verificado contra o Supabase — não basta parecer um JWT.

import { getRequestHeader } from "@tanstack/react-start/server";

import { getSupabaseServerClient } from "../supabase/server";

async function usuarioDaRequisicao() {
  const supabase = await getSupabaseServerClient();

  const header = getRequestHeader("authorization") ?? getRequestHeader("Authorization");
  const token = header?.replace(/^Bearer\s+/i, "").trim();

  // getUser(token) valida a assinatura e a expiração no servidor do Supabase.
  const { data } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();

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
