// Registro do aparelho no push do iOS, dentro do app empacotado.
//
// Diferente do Web Push, aqui não geramos chave nenhuma: pedimos a permissão,
// o sistema devolve um token do aparelho, e é esse token que o servidor usa
// para entregar (ver lib/push/apns.server.ts).
//
// Só é chamado no build nativo — na web o caminho continua sendo o Web Push.

import { registrarAparelhoAPNs } from "../api/push.functions";

export type ResultadoRegistro =
  { ok: true } | { ok: false; motivo: "negado" | "sem-suporte" | "erro" };

/**
 * Pede a permissão e registra o token.
 *
 * Precisa ser chamado a partir de um toque da pessoa: iOS só mostra o diálogo
 * do sistema uma vez por instalação, e gastá-lo numa abertura automática
 * costuma render um "não" que não dá para desfazer dentro do app.
 */
export async function ativarPushNativo(): Promise<ResultadoRegistro> {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const permissao = await PushNotifications.requestPermissions();
    if (permissao.receive !== "granted") return { ok: false, motivo: "negado" };

    // O token não volta da chamada: chega depois, por evento. Por isso a
    // promessa espera o 'registration' em vez de seguir adiante.
    const token = await new Promise<string | null>((resolve) => {
      const limite = setTimeout(() => resolve(null), 15000);

      PushNotifications.addListener("registration", (t) => {
        clearTimeout(limite);
        resolve(t.value);
      });
      PushNotifications.addListener("registrationError", () => {
        clearTimeout(limite);
        resolve(null);
      });

      PushNotifications.register();
    });

    if (!token) return { ok: false, motivo: "erro" };

    await registrarAparelhoAPNs({ data: { token } });
    return { ok: true };
  } catch {
    return { ok: false, motivo: "sem-suporte" };
  }
}

/** A permissão já foi concedida? Usado para mostrar o estado certo no perfil. */
export async function permissaoNativa(): Promise<"granted" | "denied" | "prompt"> {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const r = await PushNotifications.checkPermissions();
    if (r.receive === "granted") return "granted";
    if (r.receive === "denied") return "denied";
    return "prompt";
  } catch {
    return "denied";
  }
}

/**
 * Ao tocar numa notificação, abrir a tela que ela indica em vez da home.
 * Registrado uma vez, na montagem do app.
 */
export async function ligarNavegacaoPorNotificacao(navegar: (url: string) => void) {
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    await PushNotifications.addListener("pushNotificationActionPerformed", (acao) => {
      const url = acao.notification.data?.url;
      if (typeof url === "string" && url.startsWith("/")) navegar(url);
    });
  } catch {
    // Sem plugin (web), não há o que ligar.
  }
}
