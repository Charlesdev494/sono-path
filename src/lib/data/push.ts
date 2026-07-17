// Ponte do cliente para as notificações push.
//
// A permissão é do navegador; a inscrição é guardada no nosso servidor. Aqui
// juntamos os dois: pedir permissão, inscrever no PushManager, mandar a
// inscrição para o banco — e o caminho de volta.

import { useQuery } from "@tanstack/react-query";

import { desinscreverPush, inscreverPush, pushDisponivel } from "../api/push.functions";

export function usePushDisponivel() {
  return useQuery({
    queryKey: ["push", "disponivel"],
    queryFn: () => pushDisponivel(),
    staleTime: Infinity,
  });
}

/** O navegador tem as APIs necessárias? (iOS fora da tela inicial não tem.) */
export function suportaPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Já rodando instalado? No iOS, push só funciona aqui. */
export function estaInstalado(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// A chave pública vem como base64url; o PushManager quer os bytes. Devolvemos
// um ArrayBuffer (e não Uint8Array) porque a assinatura de applicationServerKey
// aceita BufferSource, e o Uint8Array genérico do TS colide com ele.
function base64ParaBytes(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes.buffer;
}

export type ResultadoAtivacao =
  { ok: true } | { ok: false; motivo: "sem-suporte" | "negado" | "erro"; detalhe?: string };

/**
 * Pede permissão e inscreve. Chamado por um gesto do usuário (clique) — o
 * navegador só mostra o diálogo de permissão em resposta a uma ação.
 */
export async function ativarNotificacoes(publicKey: string): Promise<ResultadoAtivacao> {
  if (!suportaPush()) return { ok: false, motivo: "sem-suporte" };

  try {
    const permissao = await Notification.requestPermission();
    if (permissao !== "granted") {
      // "default" (fechou sem escolher) e "denied" caem aqui. Em ambos o
      // navegador não perguntará de novo tão cedo, então tratamos igual.
      return { ok: false, motivo: "negado" };
    }

    const registro = await navigator.serviceWorker.ready;
    // Reaproveita a inscrição se já existir; senão cria.
    let inscricao = await registro.pushManager.getSubscription();
    if (!inscricao) {
      inscricao = await registro.pushManager.subscribe({
        userVisibleOnly: true, // exigência do Chrome: todo push tem de virar notificação visível
        applicationServerKey: base64ParaBytes(publicKey),
      });
    }

    const json = inscricao.toJSON();
    await inscreverPush({
      data: {
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
        userAgent: navigator.userAgent,
      },
    });

    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: "erro", detalhe: e instanceof Error ? e.message : String(e) };
  }
}

export async function desativarNotificacoes(): Promise<void> {
  if (!suportaPush()) return;
  const registro = await navigator.serviceWorker.ready;
  const inscricao = await registro.pushManager.getSubscription();
  if (inscricao) {
    const endpoint = inscricao.endpoint;
    await inscricao.unsubscribe();
    await desinscreverPush({ data: { endpoint } });
  }
}

/** Estado atual da permissão, sem pedir nada. */
export function permissaoAtual(): NotificationPermission | "indisponivel" {
  if (typeof window === "undefined" || !("Notification" in window)) return "indisponivel";
  return Notification.permission;
}
