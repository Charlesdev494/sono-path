import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth, type Profile } from "@/lib/auth";
import { usePreferenciaNotif, type PrefNotif } from "@/lib/data/social";
import { ControleNotificacoes } from "@/components/AtivarNotificacoes";
import { ativarNotificacoes, desativarNotificacoes, suportaPush } from "@/lib/data/push";
import { enviarPushDeTeste } from "@/lib/api/push.functions";

const TIPOS: { campo: PrefNotif; titulo: string; descricao: string }[] = [
  {
    campo: "notif_lembrete",
    titulo: "Lembretes de estudo",
    descricao: "Quando você fica alguns dias sem estudar ou sua sequência está em risco.",
  },
  {
    campo: "notif_nivel",
    titulo: "Subida de nível",
    descricao: "Quando você acumula pontos suficientes para o próximo nível.",
  },
  {
    campo: "notif_conquista",
    titulo: "Conquistas",
    descricao: "Quando você desbloqueia uma nova medalha.",
  },
  {
    campo: "notif_ranking",
    titulo: "Ranking semanal",
    descricao: "Sua posição no ranking, uma vez por semana.",
  },
];

/**
 * Preferências de notificação no perfil.
 *
 * Duas camadas:
 *  - o interruptor geral controla a permissão do navegador (a inscrição push)
 *  - os quatro tipos controlam o que o servidor manda, no banco
 *
 * Desligar o geral no navegador não altera as preferências; religar volta com
 * elas como estavam. É de propósito: quem desliga por um tempo não perde a
 * configuração fina.
 */
export function PreferenciasNotif({ profile }: { profile: Profile }) {
  const { user } = useAuth();
  const pref = usePreferenciaNotif();

  return (
    <ControleNotificacoes>
      {({ suportado, permissao, disponivelNoServidor, publicKey }) => {
        // Sem chave no servidor, a seção inteira some — feature dormente.
        if (!disponivelNoServidor) return null;

        return (
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-1.5">
              <Bell className="size-4" />
              <h2 className="font-display font-semibold">Notificações</h2>
            </div>

            <InterruptorGeral suportado={suportado} permissao={permissao} publicKey={publicKey} />

            {/* Os tipos só fazem sentido se o push estiver ligado. */}
            {permissao === "granted" && (
              <div className="flex flex-col divide-y">
                {TIPOS.map((t) => (
                  <div
                    key={t.campo}
                    className="flex items-start justify-between gap-3 py-3 first:pt-1"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.titulo}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t.descricao}</p>
                    </div>
                    <Switch
                      checked={profile[t.campo]}
                      onCheckedChange={(v) =>
                        user && pref.mutate({ userId: user.id, campo: t.campo, valor: v })
                      }
                      aria-label={t.titulo}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      }}
    </ControleNotificacoes>
  );
}

function InterruptorGeral({
  suportado,
  permissao,
  publicKey,
}: {
  suportado: boolean;
  permissao: NotificationPermission | "indisponivel";
  publicKey: string | null;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  // A permissão do navegador não é reativa; guardamos localmente para a tela
  // refletir a mudança sem recarregar.
  const [permLocal, setPermLocal] = useState(permissao);

  if (!suportado) {
    return (
      <p className="text-xs text-muted-foreground">
        Seu navegador não suporta notificações. No iPhone, instale o app na tela de início primeiro.
      </p>
    );
  }

  async function alternar(ligar: boolean) {
    if (!publicKey) return;
    setOcupado(true);
    setAviso(null);
    if (ligar) {
      const r = await ativarNotificacoes(publicKey);
      if (r.ok) {
        setPermLocal("granted");
      } else if (r.motivo === "negado") {
        // O navegador bloqueou; só o próprio usuário reverte nas configurações
        // do site. Explicamos em vez de fingir que deu certo.
        setPermLocal(Notification.permission);
        setAviso(
          "O navegador bloqueou as notificações. Reative nas configurações do site, no cadeado ao lado do endereço.",
        );
      } else {
        setAviso("Não foi possível ativar agora.");
      }
    } else {
      await desativarNotificacoes();
      setPermLocal("default");
    }
    setOcupado(false);
  }

  const ligado = permLocal === "granted";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Receber notificações neste aparelho</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {ligado
              ? "Ativado. Você recebe os tipos marcados abaixo."
              : "Desligado. Ative para receber lembretes e avisos."}
          </p>
        </div>
        {ocupado ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <Switch
            checked={ligado}
            onCheckedChange={alternar}
            disabled={permLocal === "denied"}
            aria-label="Receber notificações neste aparelho"
          />
        )}
      </div>

      {aviso && <p className="text-xs text-warm">{aviso}</p>}

      {ligado && (
        <Button
          size="sm"
          variant="outline"
          className="self-start"
          onClick={async () => {
            setOcupado(true);
            await enviarPushDeTeste();
            setOcupado(false);
          }}
          disabled={ocupado}
        >
          Enviar notificação de teste
        </Button>
      )}
    </div>
  );
}
