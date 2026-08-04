// Envio de notificação para o app iOS, pelo APNs.
//
// O Web Push não alcança o app das lojas: dentro do WKWebView quem entrega é o
// próprio sistema, por um canal que fala HTTP/2 e autentica com um JWT
// assinado pela chave .p8 da conta Apple.
//
// Por que node:http2 e não fetch: o APNs exige HTTP/2, e o fetch do Node
// (undici) só fala HTTP/1.1. A conexão morreria no handshake, com um erro que
// não explica nada.

import http2 from "node:http2";
import { createPrivateKey, sign as assinar } from "node:crypto";
import process from "node:process";

const HOST_PROD = "https://api.push.apple.com";
const HOST_TESTE = "https://api.sandbox.push.apple.com";

export type ConfigAPNs = {
  habilitado: boolean;
  keyId?: string;
  teamId?: string;
  bundleId: string;
  chave?: string;
  /** Builds do TestFlight e da App Store usam produção; só o Xcode usa sandbox. */
  sandbox: boolean;
};

export function getAPNsConfig(): ConfigAPNs {
  const chave = process.env.APNS_KEY;
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID ?? "75W4LAAFHK";
  return {
    habilitado: Boolean(chave && keyId && teamId),
    keyId,
    teamId,
    chave,
    bundleId: process.env.APNS_BUNDLE_ID ?? "com.drcharles.sonopath",
    sandbox: process.env.APNS_SANDBOX === "1",
  };
}

const b64url = (b: Buffer | string) =>
  Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// A Apple aceita reusar o mesmo token por até 1 hora e RECUSA quem gera um
// token novo a cada envio (429 TooManyProviderTokenUpdates). Por isso o cache.
let cache: { token: string; expira: number } | null = null;

function tokenDeProvedor(config: ConfigAPNs) {
  const agora = Math.floor(Date.now() / 1000);
  if (cache && cache.expira > agora + 60) return cache.token;

  const header = b64url(JSON.stringify({ alg: "ES256", kid: config.keyId }));
  const payload = b64url(JSON.stringify({ iss: config.teamId, iat: agora }));
  const conteudo = `${header}.${payload}`;

  const assinatura = assinar("sha256", Buffer.from(conteudo), {
    key: createPrivateKey(config.chave!),
    // JOSE espera r||s; o DER padrão do Node faz a Apple recusar sem dizer por quê.
    dsaEncoding: "ieee-p1363",
  });

  const token = `${conteudo}.${b64url(assinatura)}`;
  // Validade real é 1h; renovamos antes para não esbarrar no limite.
  cache = { token, expira: agora + 45 * 60 };
  return token;
}

export type ResultadoAPNs = { ok: true } | { ok: false; morto: boolean; motivo: string };

/**
 * Entrega uma notificação a um aparelho. `morto` distingue token que não existe
 * mais (app desinstalado) de falha temporária — só o primeiro justifica
 * invalidar a inscrição.
 */
export async function enviarAPNs(
  deviceToken: string,
  notif: { titulo: string; corpo: string; url?: string; tipo: string },
): Promise<ResultadoAPNs> {
  const config = getAPNsConfig();
  if (!config.habilitado) return { ok: false, morto: false, motivo: "APNS_NAO_CONFIGURADO" };

  const corpo = JSON.stringify({
    aps: {
      alert: { title: notif.titulo, body: notif.corpo },
      sound: "default",
      badge: 1,
    },
    // Lido pelo app ao tocar na notificação, para abrir a tela certa.
    url: notif.url ?? "/home",
    tipo: notif.tipo,
  });

  const cliente = http2.connect(config.sandbox ? HOST_TESTE : HOST_PROD);

  try {
    return await new Promise<ResultadoAPNs>((resolve) => {
      const req = cliente.request({
        ":method": "POST",
        ":path": `/3/device/${deviceToken}`,
        authorization: `bearer ${tokenDeProvedor(config)}`,
        "apns-topic": config.bundleId,
        "apns-push-type": "alert",
        // 5 = normal. Com 10 (imediato) a Apple recusa push que não acorda a
        // tela, e todos os nossos são de conteúdo, não urgência.
        "apns-priority": "5",
        // Um dia: passou disso, o lembrete perdeu a hora.
        "apns-expiration": String(Math.floor(Date.now() / 1000) + 86400),
        "content-type": "application/json",
        "content-length": Buffer.byteLength(corpo),
      });

      let status = 0;
      let resposta = "";
      req.on("response", (h) => {
        status = Number(h[":status"]);
      });
      req.on("data", (d) => (resposta += d));
      req.on("error", (e) => resolve({ ok: false, morto: false, motivo: e.message }));
      req.on("end", () => {
        if (status === 200) return resolve({ ok: true });
        const razao = safeReason(resposta);
        // 410 = token expirado; 400 BadDeviceToken = token de outro ambiente ou
        // inválido. Nos dois casos insistir não adianta.
        const morto = status === 410 || razao === "BadDeviceToken" || razao === "Unregistered";
        resolve({ ok: false, morto, motivo: `${status} ${razao}` });
      });

      req.setTimeout(10000, () => {
        req.close();
        resolve({ ok: false, morto: false, motivo: "timeout" });
      });

      req.end(corpo);
    });
  } finally {
    cliente.close();
  }
}

function safeReason(corpo: string) {
  try {
    return (JSON.parse(corpo).reason as string) ?? "";
  } catch {
    return corpo.slice(0, 80);
  }
}
