// Progresso do aluno (pontos, streak, missões), agora no servidor.
//
// Diferença central em relação ao localStorage antigo: o cliente não escreve
// pontuação. Ele diz "respondi B" e o banco decide se acertou e quanto vale.
// Toda mutação passa por RPC (funções security definer no Postgres).

import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "../supabase/client";
import type { Database } from "../supabase/database.types";

export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];

export const NIVEIS = [
  { nivel: 1, nome: "Iniciante", min: 0, max: 499 },
  { nivel: 2, nome: "Operador", min: 500, max: 1499 },
  { nivel: 3, nome: "Intervencionista", min: 1500, max: 3499 },
  { nivel: 4, nome: "Instrutor", min: 3500, max: 6999 },
  { nivel: 5, nome: "Avançado", min: 7000, max: 11999 },
  { nivel: 6, nome: "Expert", min: 12000, max: Infinity },
];

export function calcularNivel(pontos: number) {
  const atual = NIVEIS.find((n) => pontos >= n.min && pontos <= n.max) ?? NIVEIS[0];
  const proximo = NIVEIS.find((n) => n.min > atual.max);
  const faltam = proximo ? proximo.min - pontos : 0;
  const progresso = proximo
    ? Math.min(100, ((pontos - atual.min) / (proximo.min - atual.min)) * 100)
    : 100;
  return { ...atual, proximo, faltam, progresso };
}

export const progressQueryOptions = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["progress", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<UserProgress | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

/** Respostas já dadas — usado para não repetir questão e marcar o que foi feito. */
export const respostasQueryOptions = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["respostas", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("user_answers")
        .select("quiz_question_id, case_question_id, resposta, acertou");
      if (error) throw error;
      return data;
    },
  });

export function useRegistrarResposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { origem: "quiz" | "caso"; questaoId: string; resposta: string }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("registrar_resposta", {
        p_origem: vars.origem,
        p_questao_id: vars.questaoId,
        p_resposta: vars.resposta,
      });
      if (error) throw error;
      // a função retorna uma linha só
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["respostas"] });
    },
  });
}

export function useMarcarMissao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missao: "quiz" | "caso" | "atlas") => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("marcar_missao", { p_missao: missao });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress"] }),
  });
}

export function useRegistrarVisitaAtlas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("registrar_visita_atlas", {
        p_slug: slug,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress"] }),
  });
}

/** Chamado uma vez por sessão para manter o streak de dias. */
export async function touchStreak() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("touch_streak");
  if (error) throw error;
  return data[0];
}

/** Missões do dia — o banco zera a lista quando vira o dia. */
export function missoesDeHoje(progress: UserProgress | null): string[] {
  if (!progress?.missoes_hoje_data) return [];
  const hoje = new Date().toISOString().slice(0, 10);
  return progress.missoes_hoje_data === hoje ? progress.missoes_hoje : [];
}
