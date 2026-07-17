import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, Share, SquarePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ativarNotificacoes,
  estaInstalado,
  permissaoAtual,
  suportaPush,
  usePushDisponivel,
} from "@/lib/data/push";

const DISPENSADO = "us360:notif-dispensado";

/**
 * Convite para ligar as notificações, na home.
 *
 * Aparece só quando faz sentido pedir:
 *  - o servidor tem chave VAPID (senão a feature está dormente)
 *  - o navegador suporta push
 *  - a pessoa ainda não decidiu (permissão "default")
 *  - não foi dispensado
 *
 * No iPhone há um porém que não dá para contornar: push só funciona com o app
 * instalado na tela inicial. Se for iOS no navegador, em vez do botão
 * mostramos por que instalar primeiro.
 */
export function AtivarNotificacoes() {
  const { data: disp } = usePushDisponivel();
  const [estado, setEstado] = useState<"carregando" | "pronto" | "processando" | "erro">(
    "carregando",
  );
  const [erro, setErro] = useState<string | null>(null);
  const [fechado, setFechado] = useState(true);
  const [precisaInstalarIOS, setPrecisaInstalarIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISPENSADO)) return;
    if (!suportaPush()) {
      // iOS no Safari não tem PushManager até o app ser instalado. Vale a pena
      // explicar em vez de simplesmente sumir.
      const ehIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (ehIOS && !estaInstalado()) {
        setPrecisaInstalarIOS(true);
        setFechado(false);
      }
      return;
    }
    // Só oferece a quem ainda não decidiu. Quem já concedeu não precisa do
    // convite; quem negou, o navegador não deixa perguntar de novo.
    if (permissaoAtual() === "default") {
      setEstado("pronto");
      setFechado(false);
    }
  }, []);

  // Nada de chave no servidor = nada a oferecer (a menos que seja o aviso do
  // iOS, que independe do servidor).
  if (!precisaInstalarIOS && !disp?.habilitado) return null;
  if (fechado) return null;

  function dispensar() {
    setFechado(true);
    localStorage.setItem(DISPENSADO, "1");
  }

  async function ligar() {
    if (!disp?.publicKey) return;
    setEstado("processando");
    setErro(null);
    const r = await ativarNotificacoes(disp.publicKey);
    if (r.ok) {
      setFechado(true);
      // não gravamos "dispensado": se um dia desligar e voltar, o convite pode
      // reaparecer
    } else if (r.motivo === "negado") {
      // O navegador não deixa pedir de novo; esconder e não insistir.
      setFechado(true);
      localStorage.setItem(DISPENSADO, "1");
    } else {
      setEstado("erro");
      setErro(
        r.motivo === "sem-suporte"
          ? "Seu navegador não suporta notificações."
          : "Não foi possível ativar agora. Tente de novo.",
      );
    }
  }

  return (
    <Card className="relative flex flex-col gap-2.5 border-primary/30 bg-primary/5 p-4">
      <button
        onClick={dispensar}
        aria-label="Dispensar"
        className="absolute right-2 top-2 rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-2 pr-6">
        <Bell className="size-4 shrink-0 text-primary" />
        <p className="text-sm font-semibold">Ativar notificações</p>
      </div>

      {precisaInstalarIOS ? (
        <>
          <p className="text-xs text-muted-foreground">
            No iPhone, as notificações só funcionam com o app instalado na tela de início. Depois de
            instalar, abra pelo ícone e volte aqui para ativar.
          </p>
          <ol className="flex flex-col gap-1.5 text-xs">
            <li className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                1
              </span>
              Toque em <Share className="size-3.5" aria-label="Compartilhar" /> no Safari
            </li>
            <li className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                2
              </span>
              <SquarePlus className="size-3.5" aria-hidden="true" />
              <b>Adicionar à Tela de Início</b>
            </li>
          </ol>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Receba lembretes dos seus estudos, avisos quando subir de nível e sua posição no ranking
            da semana. Você controla o que chega no seu perfil.
          </p>
          {erro && (
            <p role="alert" className="text-sm text-destructive">
              {erro}
            </p>
          )}
          <Button
            size="sm"
            onClick={ligar}
            disabled={estado === "processando"}
            className="self-start"
          >
            {estado === "processando" ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Bell className="mr-1.5 size-3.5" />
            )}
            Ativar
          </Button>
        </>
      )}
    </Card>
  );
}

/**
 * Controle fino no perfil: liga/desliga geral e os quatro tipos separados.
 * Diferente do card, este componente aparece para todo mundo (mostra o estado
 * atual), não só para quem ainda não decidiu.
 */
export function ControleNotificacoes({
  children,
}: {
  children: (props: {
    suportado: boolean;
    permissao: NotificationPermission | "indisponivel";
    disponivelNoServidor: boolean;
    publicKey: string | null;
  }) => React.ReactNode;
}) {
  const { data: disp } = usePushDisponivel();
  return (
    <>
      {children({
        suportado: suportaPush(),
        permissao: permissaoAtual(),
        disponivelNoServidor: disp?.habilitado ?? false,
        publicKey: disp?.publicKey ?? null,
      })}
    </>
  );
}
