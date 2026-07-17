import type { SupabaseClient } from "@supabase/supabase-js";

import { getPushConfig, getServiceClient } from "./config.server";
import type { Database } from "../supabase/database.types";

type Service = SupabaseClient<Database>;
type NotifTipo = Database["public"]["Enums"]["notif_tipo"];

export type Notificacao = {
  tipo: NotifTipo;
  titulo: string;
  corpo: string;
  url?: string;
  // Marca o assunto: 'nivel:3' garante que o aviso de nível 3 sai uma vez só.
  // Sem chave, o envio não é de-duplicado (ex: lembretes diários, que já são
  // limitados na própria consulta de alvos).
  chave?: string | null;
};

/**
 * Envia uma notificação para todos os aparelhos de uma pessoa.
 *
 * Trata a parte chata do push: uma inscrição pode ter morrido (app
 * desinstalado, permissão revogada). O serviço responde 404/410, e aí a
 * marcamos como inválida em vez de tentar de novo para sempre.
 *
 * Devolve quantos aparelhos receberam. Registra no log — inclusive falhas,
 * para o teto diário e a de-duplicação funcionarem.
 */
export async function enviarPara(
  service: Service,
  userId: string,
  notif: Notificacao,
): Promise<{ entregues: number; total: number }> {
  const config = getPushConfig();
  if (!config.habilitado) return { entregues: 0, total: 0 };

  // De-duplicação: se já mandamos este assunto para esta pessoa, não repete.
  // O índice único no banco é a rede de segurança; esta checagem evita o
  // trabalho e o erro de conflito no caminho feliz.
  if (notif.chave) {
    const { data: jaEnviado } = await service
      .from("notifications_log")
      .select("id")
      .eq("user_id", userId)
      .eq("tipo", notif.tipo)
      .eq("chave", notif.chave)
      .maybeSingle();
    if (jaEnviado) return { entregues: 0, total: 0 };
  }

  const { data: inscricoes, error } = await service.rpc("push_inscricoes_de", {
    p_user_id: userId,
  });
  if (error || !inscricoes || inscricoes.length === 0) {
    return { entregues: 0, total: 0 };
  }

  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(config.subject, config.publicKey!, config.privateKey!);

  const payload = JSON.stringify({
    titulo: notif.titulo,
    corpo: notif.corpo,
    url: notif.url ?? "/home",
    tipo: notif.tipo,
  });

  let entregues = 0;
  const mortas: string[] = [];

  await Promise.all(
    inscricoes.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
          { TTL: 60 * 60 * 24 }, // vale por 1 dia; depois disso a mensagem perdeu a hora
        );
        entregues++;
      } catch (e: unknown) {
        const status = (e as { statusCode?: number }).statusCode;
        // 404/410 = a inscrição não existe mais. Qualquer outro erro pode ser
        // temporário (rede, serviço fora do ar), então não a matamos por isso.
        if (status === 404 || status === 410) {
          mortas.push(s.id);
        }
      }
    }),
  );

  if (mortas.length) {
    await service
      .from("push_subscriptions")
      .update({ invalida_em: new Date().toISOString() })
      .in("id", mortas);
  }

  await service.from("notifications_log").insert({
    user_id: userId,
    tipo: notif.tipo,
    titulo: notif.titulo,
    corpo: notif.corpo,
    chave: notif.chave ?? null,
    entregue: entregues > 0,
    erro: entregues === 0 && inscricoes.length > 0 ? "nenhum aparelho recebeu" : null,
  });

  return { entregues, total: inscricoes.length };
}

/**
 * Esvazia a fila de notificações imediatas (subida de nível, geradas pelo
 * trigger). Roda tanto no cron quanto logo após uma ação que possa ter
 * enfileirado algo, para o aviso chegar em segundos, não na próxima madrugada.
 */
export async function processarFila(service?: Service): Promise<number> {
  const sb = service ?? (await getServiceClient());
  const { data: pendentes } = await sb
    .from("push_fila")
    .select("*")
    .is("processado_em", null)
    .order("criado_em")
    .limit(200);

  if (!pendentes || pendentes.length === 0) return 0;

  let enviadas = 0;
  for (const item of pendentes) {
    await enviarPara(sb, item.user_id, {
      tipo: item.tipo,
      titulo: item.titulo,
      corpo: item.corpo,
      url: item.url,
      chave: item.chave,
    });
    await sb
      .from("push_fila")
      .update({ processado_em: new Date().toISOString() })
      .eq("id", item.id);
    enviadas++;
  }
  return enviadas;
}
