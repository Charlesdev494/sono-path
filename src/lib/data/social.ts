// Ranking, amigos e conquistas (Fase 3).
//
// Tudo aqui passa por RPC porque as regras (quem vê quem, quem é amigo de
// quem, quem ganhou medalha) moram no banco. O cliente pede e recebe pronto.

import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "../supabase/client";

export type Periodo = "sempre" | "semana" | "mes";
export type Escopo = "todos" | "amigos" | "liga";

export const PERIODOS: { valor: Periodo; label: string }[] = [
  { valor: "semana", label: "Semana" },
  { valor: "mes", label: "Mês" },
  { valor: "sempre", label: "Geral" },
];

export const ESCOPOS: { valor: Escopo; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "liga", label: "Minha liga" },
  { valor: "amigos", label: "Amigos" },
];

export const rankingQueryOptions = (periodo: Periodo, escopo: Escopo) =>
  queryOptions({
    queryKey: ["ranking", periodo, escopo],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("ranking", {
        p_periodo: periodo,
        p_escopo: escopo,
        p_limite: 50,
      });
      if (error) throw error;
      return data ?? [];
    },
  });

export const minhaPosicaoQueryOptions = (periodo: Periodo, escopo: Escopo) =>
  queryOptions({
    queryKey: ["minha-posicao", periodo, escopo],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("minha_posicao", {
        p_periodo: periodo,
        p_escopo: escopo,
      });
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });

export const amigosQueryOptions = () =>
  queryOptions({
    queryKey: ["amigos"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("meus_amigos");
      if (error) throw error;
      return data ?? [];
    },
  });

export const conquistasQueryOptions = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["conquistas", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("conquistas_de", { p_user_id: userId! });
      if (error) throw error;
      return data ?? [];
    },
  });

export const catalogoBadgesQueryOptions = () =>
  queryOptions({
    queryKey: ["badges"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from("badges").select("*").order("ordem");
      if (error) throw error;
      return data;
    },
  });

export function useBuscarUsuarios() {
  return useMutation({
    mutationFn: async (termo: string) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("buscar_usuarios", { p_termo: termo });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEnviarConvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (destinatarioId: string) => {
      const supabase = getSupabaseBrowserClient();
      const { data: sessao } = await supabase.auth.getUser();
      const { error } = await supabase.from("friendships").insert({
        solicitante_id: sessao.user!.id,
        destinatario_id: destinatarioId,
      });
      if (error) {
        // o índice único é a rede de segurança contra convite duplicado
        if (error.code === "23505") throw new Error("Você já tem um convite com essa pessoa.");
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["amigos"] });
      qc.invalidateQueries({ queryKey: ["ranking"] });
    },
  });
}

export function useResponderConvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { friendshipId: string; aceitar: boolean }) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("friendships")
        .update({ status: vars.aceitar ? "aceito" : "recusado" })
        .eq("id", vars.friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["amigos"] });
      qc.invalidateQueries({ queryKey: ["ranking"] });
    },
  });
}

export function useDesfazerAmizade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (friendshipId: string) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["amigos"] });
      qc.invalidateQueries({ queryKey: ["ranking"] });
    },
  });
}

/**
 * Confere se alguma conquista foi desbloqueada e devolve só as novas.
 * Chamado depois das ações que podem render medalha (responder, concluir caso,
 * visitar atlas). Nunca lança: uma medalha que falha não pode atrapalhar o
 * estudo de ninguém.
 */
export async function verificarConquistas() {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.rpc("verificar_conquistas");
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export function usePrivacidadeRanking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { userId: string; aparecer: boolean }) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("profiles")
        .update({ aparece_no_ranking: vars.aparecer })
        .eq("id", vars.userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["ranking"] });
    },
  });
}
