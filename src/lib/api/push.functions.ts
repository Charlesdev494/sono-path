// Funções de push chamadas pelo navegador.
//
// Inscrever/desinscrever passam pela sessão do usuário (RLS): cada um só mexe
// nas próprias inscrições. O envio de verdade não está aqui — vive em
// enviar.server.ts e só roda com service_role.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSupabaseServerClient } from "../supabase/server";

// Formato que o navegador entrega ao inscrever.
const inscricaoSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
  userAgent: z.string().optional(),
});

/**
 * Diz ao cliente se o push está ligado no servidor. Sem chave VAPID, a UI de
 * ativar notificações some — como a IA, a feature fica dormente sozinha.
 */
export const pushDisponivel = createServerFn({ method: "GET" }).handler(async () => {
  const { getPushConfig } = await import("../push/config.server");
  const config = getPushConfig();
  return {
    habilitado: config.habilitado,
    // A pública precisa chegar ao navegador para ele se inscrever. É pública
    // por design; a privada nunca sai daqui.
    publicKey: config.habilitado ? config.publicKey : null,
  };
});

export const inscreverPush = createServerFn({ method: "POST" })
  .inputValidator(inscricaoSchema)
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("não autenticado");

    // upsert por endpoint: reativar no mesmo aparelho não cria linha duplicada
    // nem deixa uma inscrição fantasma marcada como inválida.
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        user_agent: data.userAgent ?? null,
        invalida_em: null,
      },
      { onConflict: "endpoint" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const desinscreverPush = createServerFn({ method: "POST" })
  .inputValidator(z.object({ endpoint: z.string() }))
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", data.endpoint);
    if (error) throw error;
    return { ok: true };
  });

// Envia uma notificação de teste para os aparelhos da própria pessoa. Serve
// para o Charles confirmar que o push funciona no aparelho dele — sem depender
// de esperar dois dias inativo para o primeiro lembrete chegar.
export const enviarPushDeTeste = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("não autenticado");

  const { enviarPara } = await import("../push/enviar.server");
  const { getServiceClient } = await import("../push/config.server");
  const service = await getServiceClient();

  const r = await enviarPara(service, user.id, {
    tipo: "conquista",
    titulo: "Notificações ativadas",
    corpo: "É assim que você vai receber seus lembretes e conquistas. 🎉",
    url: "/home",
    // sem chave: teste pode ser reenviado quantas vezes quiser
  });
  return r;
});
