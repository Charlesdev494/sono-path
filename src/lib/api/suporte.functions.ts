// Suporte.
//
// A gravação passa por aqui, e não pelo cliente direto no Supabase, por um
// motivo prático: a página /suporte precisa abrir SEM login (a App Store exige
// uma URL de suporte pública). Abrir a tabela para insert anônimo pela RLS
// deixaria qualquer um despejar spam nela. Aqui o servidor valida, descobre
// sozinho quem está logado — se estiver — e só então grava com service_role.

import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { getServiceClient } from "../push/config.server";
import { getSupabaseServerClient } from "../supabase/server";

export const abrirChamado = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      nome: z.string().trim().min(2).max(120),
      email: z.string().trim().email().max(200),
      assunto: z.string().trim().min(3).max(160),
      mensagem: z.string().trim().min(10).max(4000),
    }),
  )
  .handler(async ({ data }) => {
    // Quem está logado não precisa digitar nada disso de novo, mas o vínculo
    // com a conta vem da sessão — nunca de um id mandado pelo navegador.
    let userId: string | null = null;
    try {
      const supabase = await getSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // Visitante sem sessão: segue como chamado anônimo.
    }

    const service = await getServiceClient();
    const { error } = await service.from("support_tickets").insert({
      user_id: userId,
      nome: data.nome,
      email: data.email,
      assunto: data.assunto,
      mensagem: data.mensagem,
      user_agent: getRequestHeader("user-agent")?.slice(0, 500) ?? null,
    });
    if (error) throw error;

    return { ok: true };
  });
