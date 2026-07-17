// Entrega de um rascunho de IA da lista de quiz para o editor.
//
// A lista gera a questão com IA e navega para o editor; o editor precisa
// receber esse rascunho. Como a navegação é client-side (SPA), um estado de
// módulo sobrevive à troca de rota — mais simples e confiável que serializar
// em querystring (texto médico longo) ou sessionStorage.
//
// Regra que não muda: NADA é salvo aqui. O rascunho preenche o formulário do
// editor para o Charles revisar; conteúdo médico de máquina só vai ao ar
// depois que um médico lê e clica em Publicar.

import type { Alternativa } from "./admin";

export type RascunhoIA = {
  enunciado: string;
  alternativas: Alternativa[];
  correta: string;
  explicacao: string;
  imagem_label: string;
};

// Chave = id da questão de destino ("nova" para uma questão nova). Guardar por
// chave evita que um rascunho vaze para o editor errado se algo for cancelado.
let pendente: { chave: string; rascunho: RascunhoIA } | null = null;

export function guardarRascunhoIA(chave: string, rascunho: RascunhoIA) {
  pendente = { chave, rascunho };
}

/** Lê e consome (só serve uma vez, para não reaparecer ao recarregar). */
export function consumirRascunhoIA(chave: string): RascunhoIA | null {
  if (pendente?.chave !== chave) return null;
  const r = pendente.rascunho;
  pendente = null;
  return r;
}
