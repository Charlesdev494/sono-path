// Configuração das integrações pelo painel — hoje, a chave da IA.
//
// A chave entra por aqui e nunca mais sai: a leitura devolve só a máscara
// (sk-pro••••••••1a2b) e um "está configurada: sim/não". Não existe função que
// devolva o valor inteiro ao navegador, então nem um erro futuro de tela
// consegue vazá-la.
//
// A gravação usa service_role porque app_settings tem RLS sem nenhuma
// política — nem o Charles logado alcança a tabela pelo cliente. Por isso a
// checagem de admin é feita aqui, na mão, antes de qualquer escrita.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { testarChave } from "../ai/chamar.server";
import { CHAVE_CONFIG_IA, getAIConfig, mascararChave, modeloPadraoDe } from "../ai/config.server";
import { exigirAdmin } from "./admin.server";
import { getServiceClient } from "../push/config.server";
import type { Json } from "../supabase/database.types";

const provedorSchema = z.enum(["openai", "anthropic"]);

export const obterConfigIA = createServerFn({ method: "GET" }).handler(async () => {
  await exigirAdmin();
  const config = await getAIConfig();
  return {
    habilitado: config.habilitado,
    provedor: config.provedor,
    modelo: config.modelo,
    origem: config.origem,
    chaveMascarada: config.apiKey ? mascararChave(config.apiKey) : null,
    modeloPadrao: modeloPadraoDe(config.provedor),
  };
});

export const salvarConfigIA = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      provedor: provedorSchema,
      modelo: z.string().max(120).optional(),
      // Ausente = manter a chave que já está gravada. É o que permite trocar
      // só o modelo sem ter de colar a chave de novo.
      apiKey: z.string().max(400).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const adminId = await exigirAdmin();
    const service = await getServiceClient();

    const { data: atual } = await service
      .from("app_settings")
      .select("valor")
      .eq("chave", CHAVE_CONFIG_IA)
      .maybeSingle();
    const valorAtual = (atual?.valor ?? {}) as { api_key?: string };

    const novaChave = data.apiKey?.trim();
    const chaveFinal = novaChave ? novaChave : valorAtual.api_key;

    const { error } = await service.from("app_settings").upsert(
      {
        chave: CHAVE_CONFIG_IA,
        valor: {
          provedor: data.provedor,
          modelo: data.modelo?.trim() || modeloPadraoDe(data.provedor),
          ...(chaveFinal ? { api_key: chaveFinal } : {}),
        },
        updated_by: adminId,
      },
      { onConflict: "chave" },
    );
    if (error) throw error;

    return { ok: true };
  });

export const removerChaveIA = createServerFn({ method: "POST" }).handler(async () => {
  const adminId = await exigirAdmin();
  const service = await getServiceClient();

  const { data: atual } = await service
    .from("app_settings")
    .select("valor")
    .eq("chave", CHAVE_CONFIG_IA)
    .maybeSingle();
  const { api_key: _removida, ...resto } = (atual?.valor ?? {}) as Record<string, Json>;

  const { error } = await service
    .from("app_settings")
    .upsert({ chave: CHAVE_CONFIG_IA, valor: resto, updated_by: adminId }, { onConflict: "chave" });
  if (error) throw error;
  return { ok: true };
});

/**
 * Testa a chave antes de confiar nela. Aceita uma chave ainda não salva para o
 * Charles conferir que colou certo antes de gravar.
 */
export const testarConexaoIA = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      provedor: provedorSchema,
      modelo: z.string().max(120).optional(),
      apiKey: z.string().max(400).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await exigirAdmin();

    let apiKey = data.apiKey?.trim();
    if (!apiKey) {
      const config = await getAIConfig();
      apiKey = config.apiKey;
    }
    if (!apiKey) return { ok: false as const, erro: "Nenhuma chave configurada." };

    return testarChave({
      provedor: data.provedor,
      apiKey,
      modelo: data.modelo?.trim() || modeloPadraoDe(data.provedor),
    });
  });
