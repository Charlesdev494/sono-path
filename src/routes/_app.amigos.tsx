import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronLeft, Loader2, Search, UserPlus, X, Clock } from "lucide-react";

import {
  amigosQueryOptions,
  useBuscarUsuarios,
  useDesfazerAmizade,
  useEnviarConvite,
  useResponderConvite,
} from "@/lib/data/social";

export const Route = createFileRoute("/_app/amigos")({
  head: () => ({
    meta: [{ title: "Amigos · US360" }],
  }),
  component: AmigosPage,
});

function AmigosPage() {
  const { data: amigos, isLoading } = useQuery(amigosQueryOptions());
  const buscar = useBuscarUsuarios();
  const enviar = useEnviarConvite();
  const responder = useResponderConvite();
  const desfazer = useDesfazerAmizade();

  const [termo, setTermo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  // Busca com atraso: sem isso, cada tecla digitada vira uma consulta.
  useEffect(() => {
    if (termo.trim().length < 3) return;
    const id = setTimeout(() => buscar.mutate(termo.trim()), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termo]);

  const aceitos = amigos?.filter((a) => a.status === "aceito") ?? [];
  const recebidos = amigos?.filter((a) => a.status === "pendente" && !a.eu_solicitei) ?? [];
  const enviados = amigos?.filter((a) => a.status === "pendente" && a.eu_solicitei) ?? [];

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-6">
      <Link
        to="/ranking"
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
      >
        <ChevronLeft className="size-4" /> Ranking
      </Link>

      <header>
        <h1 className="font-display text-2xl font-bold">Amigos</h1>
        <p className="text-sm text-muted-foreground">Compare seu progresso com o de colegas.</p>
      </header>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => {
              setTermo(e.target.value);
              setErro(null);
            }}
            placeholder="Buscar colega pelo nome"
            className="pl-8"
          />
        </div>
        {termo.trim().length > 0 && termo.trim().length < 3 && (
          <p className="text-xs text-muted-foreground">Digite ao menos 3 letras.</p>
        )}
      </div>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}

      {/* resultados da busca */}
      {termo.trim().length >= 3 && (
        <section className="flex flex-col gap-2">
          {buscar.isPending ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : buscar.data && buscar.data.length > 0 ? (
            buscar.data.map((u) => (
              <Card key={u.user_id} className="flex items-center gap-3 p-3">
                <Avatar nome={u.nome} url={u.avatar_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.nome}</p>
                  <p className="text-xs text-muted-foreground">Nível {u.nivel}</p>
                </div>
                {u.situacao === "amigo" ? (
                  <Badge variant="secondary" className="gap-1">
                    <Check className="size-3" />
                    Amigos
                  </Badge>
                ) : u.situacao === "convite_enviado" ? (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="size-3" />
                    Convite enviado
                  </Badge>
                ) : u.situacao === "convite_recebido" ? (
                  <Badge variant="outline">Convidou você</Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await enviar.mutateAsync(u.user_id);
                        buscar.mutate(termo.trim());
                      } catch (e) {
                        setErro(e instanceof Error ? e.message : "Não foi possível convidar.");
                      }
                    }}
                    disabled={enviar.isPending}
                  >
                    <UserPlus className="mr-1.5 size-3.5" />
                    Adicionar
                  </Button>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Ninguém encontrado com esse nome.</p>
            </Card>
          )}
        </section>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {recebidos.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Convites recebidos ({recebidos.length})
              </h2>
              {recebidos.map((a) => (
                <Card key={a.friendship_id} className="flex items-center gap-3 p-3">
                  <Avatar nome={a.nome} url={a.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.nome}</p>
                    <p className="text-xs text-muted-foreground">Nível {a.nivel}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label={`Recusar convite de ${a.nome}`}
                    onClick={() =>
                      responder.mutate({ friendshipId: a.friendship_id, aceitar: false })
                    }
                  >
                    <X className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    aria-label={`Aceitar convite de ${a.nome}`}
                    onClick={() =>
                      responder.mutate({ friendshipId: a.friendship_id, aceitar: true })
                    }
                  >
                    <Check className="size-4" />
                  </Button>
                </Card>
              ))}
            </section>
          )}

          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Meus amigos ({aceitos.length})
            </h2>
            {aceitos.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Você ainda não adicionou ninguém. Busque pelo nome de um colega acima.
                </p>
              </Card>
            ) : (
              aceitos.map((a) => (
                <Card key={a.friendship_id} className="flex items-center gap-3 p-3">
                  <Avatar nome={a.nome} url={a.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Nível {a.nivel} · {a.pontos} pts
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-muted-foreground"
                    onClick={() => desfazer.mutate(a.friendship_id)}
                  >
                    Remover
                  </Button>
                </Card>
              ))
            )}
          </section>

          {enviados.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Convites enviados ({enviados.length})
              </h2>
              {enviados.map((a) => (
                <Card key={a.friendship_id} className="flex items-center gap-3 p-3 opacity-70">
                  <Avatar nome={a.nome} url={a.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{a.nome}</p>
                  </div>
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <Clock className="size-3" />
                    Aguardando
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-muted-foreground"
                    onClick={() => desfazer.mutate(a.friendship_id)}
                  >
                    Cancelar
                  </Button>
                </Card>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Avatar({ nome, url }: { nome: string; url: string | null }) {
  if (url) return <img src={url} alt="" className="size-9 shrink-0 rounded-full object-cover" />;
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-sm font-bold text-primary-foreground">
      {(nome[0] ?? "?").toUpperCase()}
    </div>
  );
}
