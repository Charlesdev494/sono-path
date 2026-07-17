import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// O evento que o Chrome dispara quando o app é instalável. Não está nos tipos
// padrão do DOM porque não é padrão — só Chromium implementa.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISPENSADO = "us360:instalar-dispensado";

/**
 * Convite para instalar o app na tela inicial.
 *
 * Dois caminhos, porque os sistemas são diferentes:
 *  - Android/Chrome dispara `beforeinstallprompt` e deixa o app abrir o
 *    diálogo nativo de instalação.
 *  - iOS/Safari não tem esse evento nem API de instalação: a única forma é a
 *    pessoa usar Compartilhar → Adicionar à Tela de Início. Como não dá para
 *    automatizar, ensinamos o caminho.
 *
 * Não aparece para quem já instalou (o app já roda em standalone) nem para
 * quem dispensou.
 */
export function InstalarApp() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [mostrarIOS, setMostrarIOS] = useState(false);
  const [fechado, setFechado] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Já instalado? Então não há o que convidar.
    const jaInstalado =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS não implementa display-mode: standalone; usa esta propriedade
      // própria do Safari.
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (jaInstalado) return;

    if (localStorage.getItem(DISPENSADO)) return;

    const ehIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const ehSafari =
      /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);

    if (ehIOS && ehSafari) {
      setMostrarIOS(true);
      setFechado(false);
      return;
    }

    const aoInstalavel = (e: Event) => {
      // Sem isto o Chrome mostra a barra dele; queremos o convite no momento
      // e no lugar certos.
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
      setFechado(false);
    };
    window.addEventListener("beforeinstallprompt", aoInstalavel);

    const aoInstalar = () => {
      setFechado(true);
      setEvento(null);
    };
    window.addEventListener("appinstalled", aoInstalar);

    return () => {
      window.removeEventListener("beforeinstallprompt", aoInstalavel);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  function dispensar() {
    setFechado(true);
    localStorage.setItem(DISPENSADO, "1");
  }

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    // Recusou agora não quer dizer recusou para sempre — não gravamos a
    // dispensa aqui, o Chrome mesmo espaça as próximas ofertas.
    if (outcome === "accepted") setFechado(true);
    setEvento(null);
  }

  if (fechado || (!evento && !mostrarIOS)) return null;

  return (
    <Card className="relative flex flex-col gap-2.5 border-primary/30 bg-primary/5 p-4">
      <button
        onClick={dispensar}
        aria-label="Dispensar convite de instalação"
        className="absolute right-2 top-2 rounded p-1 text-muted-foreground transition-colors hover:bg-accent"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-2 pr-6">
        <Download className="size-4 shrink-0 text-primary" />
        <p className="text-sm font-semibold">Instale o US360 no seu celular</p>
      </div>

      {mostrarIOS ? (
        <>
          <p className="text-xs text-muted-foreground">
            Abre em tela cheia, sem a barra do navegador, e fica com ícone próprio junto dos seus
            outros apps.
          </p>
          {/* iOS não permite instalar por código — só ensinando o caminho. */}
          <ol className="flex flex-col gap-1.5 text-xs">
            <li className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                1
              </span>
              Toque em <Share className="size-3.5" aria-label="Compartilhar" /> na barra do Safari
            </li>
            <li className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                2
              </span>
              Escolha <SquarePlus className="size-3.5" aria-hidden="true" />
              <b>Adicionar à Tela de Início</b>
            </li>
          </ol>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Abre em tela cheia, sem a barra do navegador, e fica com ícone próprio junto dos seus
            outros apps.
          </p>
          <Button size="sm" onClick={instalar} className="self-start">
            <Download className="mr-1.5 size-3.5" />
            Instalar
          </Button>
        </>
      )}
    </Card>
  );
}
