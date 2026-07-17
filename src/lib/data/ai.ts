// Ponte do painel para o copiloto de IA.
//
// Tudo aqui é opcional por natureza: se a chave não estiver configurada,
// `useAIDisponivel()` devolve false e as telas simplesmente não mostram nada
// de IA. Nenhuma outra parte do painel precisa saber que a IA existe.

import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import {
  aiDisponivel,
  gerarCasoClinico,
  gerarQuestaoQuiz,
  revisarTexto,
} from "../api/ai.functions";

export const aiDisponivelQueryOptions = () =>
  queryOptions({
    queryKey: ["ai", "disponivel"],
    queryFn: () => aiDisponivel(),
    // A resposta só muda quando alguém mexe na configuração do servidor.
    staleTime: Infinity,
  });

export function useAIDisponivel() {
  const { data } = useQuery(aiDisponivelQueryOptions());
  return data?.habilitado ?? false;
}

/** Mensagens de erro que uma pessoa entende, não códigos internos. */
function traduzirErroIA(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("IA_DESABILITADA")) return "A IA não está configurada neste servidor.";
  if (msg.includes("IA_RECUSOU"))
    return "A IA preferiu não responder a este pedido. Tente reformular o tema.";
  if (msg.includes("IA_SEM_RESPOSTA"))
    return "A IA não conseguiu montar uma resposta completa. Tente de novo.";
  if (msg.includes("rate_limit") || msg.includes("429"))
    return "Muitos pedidos seguidos. Espere alguns segundos e tente de novo.";
  if (msg.includes("authentication") || msg.includes("401"))
    return "A chave da IA parece inválida. Verifique a configuração do servidor.";
  if (msg.includes("credit") || msg.includes("billing")) return "A conta da IA está sem créditos.";
  return "Não foi possível gerar agora. Tente de novo em instantes.";
}

export function useGerarQuestao() {
  return useMutation({
    mutationFn: (vars: { regiao: string; nivel: "basico" | "avancado"; tema?: string }) =>
      gerarQuestaoQuiz({ data: vars }),
    onError: () => {},
  });
}

export function useGerarCaso() {
  return useMutation({
    mutationFn: (vars: { resumo: string; regiao: string; numeroQuestoes: number }) =>
      gerarCasoClinico({ data: vars }),
  });
}

export function useRevisarTexto() {
  return useMutation({
    mutationFn: (vars: {
      texto: string;
      tipo: "enunciado" | "explicacao" | "apresentacao" | "resolucao";
    }) => revisarTexto({ data: vars }),
  });
}

export { traduzirErroIA };
