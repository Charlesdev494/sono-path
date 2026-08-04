import { useEffect, useState } from "react";
import { Bell, BellOff, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EH_NATIVO } from "@/lib/nativo";

type Estado = "carregando" | "prompt" | "granted" | "denied" | "processando";

/**
 * Controle de notificações do app das lojas.
 *
 * O componente da web (PreferenciasNotif) não serve aqui: ele fala Web Push,
 * que não funciona dentro do WKWebView. Este conversa com o APNs pelo plugin.
 *
 * Os três estados existem porque o iOS não deixa voltar atrás: negada a
 * permissão, o app não pode perguntar de novo — só resta mandar a pessoa para
 * os Ajustes do sistema, e dizer isso é melhor do que um botão que não faz nada.
 */
export function NotificacoesNativas() {
  const [estado, setEstado] = useState<Estado>("carregando");

  useEffect(() => {
    if (!EH_NATIVO) return;
    (async () => {
      const { permissaoNativa } = await import("@/lib/push/nativo");
      setEstado(await permissaoNativa());
    })();
  }, []);

  if (!EH_NATIVO || estado === "carregando") return null;

  async function ativar() {
    setEstado("processando");
    const { ativarPushNativo, permissaoNativa } = await import("@/lib/push/nativo");
    const r = await ativarPushNativo();
    setEstado(r.ok ? "granted" : await permissaoNativa());
  }

  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        {estado === "granted" ? (
          <Bell className="size-4 text-success" />
        ) : (
          <BellOff className="size-4 text-muted-foreground" />
        )}
        <p className="text-sm font-semibold">Notificações</p>
      </div>

      {estado === "granted" && (
        <p className="flex items-center gap-1.5 text-xs text-success">
          <Check className="size-3.5" />
          Ativadas. Você recebe lembretes de estudo, avisos de nível e do ranking.
        </p>
      )}

      {estado === "denied" && (
        <p className="text-xs text-muted-foreground">
          Estão desativadas. Para religar, abra os Ajustes do iPhone, procure por US360 e ligue
          Notificações — o app não consegue pedir de novo depois de uma recusa.
        </p>
      )}

      {(estado === "prompt" || estado === "processando") && (
        <>
          <p className="text-xs text-muted-foreground">
            Receba lembretes dos seus estudos, avisos quando subir de nível e sua posição no ranking
            da semana.
          </p>
          <Button
            size="sm"
            className="self-start"
            onClick={ativar}
            disabled={estado === "processando"}
          >
            {estado === "processando" ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Bell className="mr-1.5 size-3.5" />
            )}
            Ativar notificações
          </Button>
        </>
      )}
    </Card>
  );
}
