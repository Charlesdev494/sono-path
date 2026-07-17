import { getServiceClient } from "./config.server";
import { enviarPara, processarFila } from "./enviar.server";

// O trabalho que roda de tempos em tempos. Chamado pelo endpoint /api/cron.
//
// Três coisas, cada uma respeitando o que já foi enviado (as consultas de
// alvos no banco filtram quem já recebeu):
//   1. esvaziar a fila de avisos imediatos (subida de nível) que porventura
//      ficaram — o normal é saírem na hora, isto é rede de segurança
//   2. lembrar quem sumiu ("você está há 2 dias sem estudar")
//   3. mostrar a posição no ranking semanal, uma vez por semana
export async function rodarCronNotificacoes() {
  const service = await getServiceClient();

  const fila = await processarFila(service);
  const inatividade = await lembrarInativos(service);
  const ranking = await avisarRanking(service);

  return { fila, inatividade, ranking };
}

async function lembrarInativos(service: Awaited<ReturnType<typeof getServiceClient>>) {
  const { data: alvos } = await service.rpc("push_alvos_inatividade", { p_dias: 2 });
  if (!alvos || alvos.length === 0) return 0;

  let enviados = 0;
  for (const alvo of alvos) {
    const dias = alvo.dias_parado;
    // Se a pessoa tem streak em risco, o gancho é a sequência (dói mais perder
    // 8 dias seguidos que "faz 2 dias"). Senão, o lembrete simples.
    const temStreak = alvo.streak >= 3;
    const r = await enviarPara(service, alvo.user_id, {
      tipo: temStreak ? "streak_em_risco" : "lembrete_inatividade",
      titulo: temStreak
        ? `Sua sequência de ${alvo.streak} dias está em risco`
        : `${alvo.nome?.split(" ")[0] || "Ei"}, que tal um quiz rápido?`,
      corpo: temStreak
        ? "Volte hoje para não perder o que você construiu."
        : `Você está há ${dias} ${dias === 1 ? "dia" : "dias"} sem estudar. Bastam 5 minutos.`,
      url: "/quiz",
      // um lembrete por pessoa por dia — a consulta de alvos já garante isso,
      // mas a chave datada blinda contra duas execuções no mesmo dia
      chave: `inatividade:${new Date().toISOString().slice(0, 10)}`,
    });
    if (r.entregues > 0) enviados++;
  }
  return enviados;
}

async function avisarRanking(service: Awaited<ReturnType<typeof getServiceClient>>) {
  const { data: alvos } = await service.rpc("push_alvos_ranking");
  if (!alvos || alvos.length === 0) return 0;

  let enviados = 0;
  for (const alvo of alvos) {
    const pos = Number(alvo.posicao);
    // O tom muda com a posição: pódio celebra, resto convida a subir.
    const noPodio = pos <= 3;
    const r = await enviarPara(service, alvo.user_id, {
      tipo: "ranking_semanal",
      titulo: noPodio
        ? `Você está em ${pos}º no ranking da semana! 🏆`
        : `Você está em ${pos}º nesta semana`,
      corpo: noPodio
        ? `${alvo.pontos} pontos entre ${alvo.total} colegas. Segure a posição!`
        : `${alvo.pontos} pontos. Um quiz a mais pode te fazer subir.`,
      url: "/ranking",
      // uma vez por semana; a consulta de alvos já não repete em 6 dias, e a
      // chave semanal reforça
      chave: `ranking:${semanaISO()}`,
    });
    if (r.entregues > 0) enviados++;
  }
  return enviados;
}

// Identificador da semana (ano + número da semana ISO), para a chave de
// de-duplicação do ranking mudar toda segunda.
function semanaISO(): string {
  const d = new Date();
  const alvo = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const diaSemana = (alvo.getUTCDay() + 6) % 7; // segunda = 0
  alvo.setUTCDate(alvo.getUTCDate() - diaSemana + 3); // quinta da mesma semana
  const primeiraQuinta = new Date(Date.UTC(alvo.getUTCFullYear(), 0, 4));
  const semana = 1 + Math.round((alvo.getTime() - primeiraQuinta.getTime()) / (7 * 86400000));
  return `${alvo.getUTCFullYear()}-S${String(semana).padStart(2, "0")}`;
}
