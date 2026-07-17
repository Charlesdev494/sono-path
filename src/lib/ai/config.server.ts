import process from "node:process";

// Configuração do copiloto de IA. O sufixo .server.ts impede o Vite de mandar
// este arquivo para o navegador — a chave nunca sai do servidor.
//
// A Fase 4 do escopo é assim de propósito: o código todo existe e fica
// dormente. Sem ANTHROPIC_API_KEY, as funções recusam e os botões nem
// aparecem no painel. Configurou a chave, liga sozinho — sem deploy, sem
// mexer em código.

/** Modelo padrão. Trocável por env sem alterar código. */
const MODELO_PADRAO = "claude-opus-4-8";

export function getAIConfig() {
  // Lido dentro da função de propósito: em runtimes serverless (Cloudflare,
  // que é o alvo de build hoje) o env só existe no momento da requisição —
  // ler no escopo do módulo devolveria undefined.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  return {
    habilitado: Boolean(apiKey),
    apiKey,
    modelo: process.env.ANTHROPIC_MODEL ?? MODELO_PADRAO,
  };
}
