import process from "node:process";

import { getServiceClient } from "../push/config.server";

// Configuração do copiloto de IA. O sufixo .server.ts impede o Vite de mandar
// este arquivo para o navegador — a chave nunca sai do servidor.
//
// A configuração vem do banco (app_settings), não mais só de variável de
// ambiente: o Charles troca provedor, chave e modelo pelo painel, sem
// programador e sem redeploy. O env continua valendo como fallback, para o
// que já estava no ar não parar de funcionar quando esta versão subir.
//
// A tabela app_settings tem RLS ligada e nenhuma política: só o service_role
// alcança. Por isso a leitura acontece aqui, no servidor, e a chave nunca é
// devolvida a quem chama de fora.

export type ProvedorIA = "openai" | "anthropic";

/** Modelo usado quando ninguém escolheu um. */
const MODELO_PADRAO: Record<ProvedorIA, string> = {
  openai: "gpt-5",
  anthropic: "claude-opus-4-8",
};

export const CHAVE_CONFIG_IA = "ia";

export type ConfigIA = {
  habilitado: boolean;
  provedor: ProvedorIA;
  apiKey?: string;
  modelo: string;
  /** De onde veio a chave — o painel mostra isso para o Charles se localizar. */
  origem: "painel" | "ambiente" | "nenhuma";
};

type ConfigSalva = {
  provedor?: string;
  api_key?: string;
  modelo?: string;
};

function ehProvedor(v: unknown): v is ProvedorIA {
  return v === "openai" || v === "anthropic";
}

/**
 * Lê a configuração da IA. Ordem: o que está no painel manda; se lá não houver
 * chave, cai para as variáveis de ambiente.
 *
 * Lido dentro da função de propósito: em runtime serverless o env só existe no
 * momento da requisição — ler no escopo do módulo devolveria undefined.
 */
export async function getAIConfig(): Promise<ConfigIA> {
  const doPainel = await lerConfigDoPainel();
  if (doPainel?.api_key) {
    const provedor = ehProvedor(doPainel.provedor) ? doPainel.provedor : "openai";
    return {
      habilitado: true,
      provedor,
      apiKey: doPainel.api_key,
      modelo: doPainel.modelo?.trim() || MODELO_PADRAO[provedor],
      origem: "painel",
    };
  }

  // Fallback: o que já estava configurado na Vercel antes do painel existir.
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return {
      habilitado: true,
      provedor: "openai",
      apiKey: openaiKey,
      modelo: process.env.OPENAI_MODEL ?? MODELO_PADRAO.openai,
      origem: "ambiente",
    };
  }
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return {
      habilitado: true,
      provedor: "anthropic",
      apiKey: anthropicKey,
      modelo: process.env.ANTHROPIC_MODEL ?? MODELO_PADRAO.anthropic,
      origem: "ambiente",
    };
  }

  // Sem chave em lugar nenhum: a IA fica dormente e os botões nem aparecem.
  const provedor = ehProvedor(doPainel?.provedor) ? doPainel.provedor : "openai";
  return {
    habilitado: false,
    provedor,
    modelo: doPainel?.modelo?.trim() || MODELO_PADRAO[provedor],
    origem: "nenhuma",
  };
}

async function lerConfigDoPainel(): Promise<ConfigSalva | null> {
  try {
    const service = await getServiceClient();
    const { data, error } = await service
      .from("app_settings")
      .select("valor")
      .eq("chave", CHAVE_CONFIG_IA)
      .maybeSingle();
    if (error || !data) return null;
    return (data.valor ?? null) as ConfigSalva | null;
  } catch {
    // Banco fora do ar ou service_role ausente não pode derrubar o painel
    // inteiro: sem configuração, a IA simplesmente fica dormente.
    return null;
  }
}

export function modeloPadraoDe(provedor: ProvedorIA) {
  return MODELO_PADRAO[provedor];
}

/**
 * Versão da chave que pode ser mostrada na tela: só o suficiente para o Charles
 * reconhecer qual chave está lá. O valor inteiro nunca volta ao navegador.
 */
export function mascararChave(chave: string) {
  const limpa = chave.trim();
  if (limpa.length <= 12) return "•".repeat(limpa.length);
  return `${limpa.slice(0, 6)}${"•".repeat(8)}${limpa.slice(-4)}`;
}
