import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Users, UserPlus } from "lucide-react";

import { useAuth } from "@/lib/auth";
import {
  ESCOPOS,
  PERIODOS,
  minhaPosicaoQueryOptions,
  rankingQueryOptions,
  type Escopo,
  type Periodo,
} from "@/lib/data/social";

export const Route = createFileRoute("/_app/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking · US360" },
      { name: "description", content: "Veja sua posição entre os colegas." },
    ],
  }),
  component: RankingPage,
});

function RankingPage() {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [escopo, setEscopo] = useState<Escopo>("todos");

  const { data: linhas, isLoading } = useQuery(rankingQueryOptions(periodo, escopo));
  const { data: minha } = useQuery(minhaPosicaoQueryOptions(periodo, escopo));

  const podio = linhas?.slice(0, 3) ?? [];
  const resto = linhas?.slice(3) ?? [];
  // Se a pessoa está fora dos 50 primeiros, a régua de baixo é a única forma
  // dela saber onde está — e é justamente quem mais precisa saber.
  const estaNaLista = linhas?.some((l) => l.e_voce) ?? false;

  return (
    <div className="flex flex-col gap-4 px-5 pb-24 pt-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Ranking</h1>
          <p className="text-sm text-muted-foreground">Sua posição entre os colegas</p>
        </div>
        <Link
          to="/amigos"
          className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
        >
          <Users className="size-4" />
          Amigos
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
        {PERIODOS.map((p) => (
          <button
            key={p.valor}
            onClick={() => setPeriodo(p.valor)}
            className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
              periodo === p.valor ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {ESCOPOS.map((e) => (
          <button
            key={e.valor}
            onClick={() => setEscopo(e.valor)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              escopo === e.valor
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !linhas || linhas.length === 0 ? (
        <VazioPorEscopo escopo={escopo} />
      ) : (
        <>
          {podio.length > 0 && <Podio linhas={podio} />}

          {resto.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {resto.map((l) => (
                <Linha key={l.user_id} linha={l} />
              ))}
            </div>
          )}
        </>
      )}

      {/* régua fixa com a sua posição */}
      {minha && !estaNaLista && (
        <div className="fixed inset-x-0 bottom-16 mx-auto max-w-md px-5">
          <Card className="flex items-center gap-3 border-primary bg-primary p-3 text-primary-foreground shadow-lg">
            <span className="font-display text-sm font-bold tabular-nums">#{minha.posicao}</span>
            <span className="flex-1 text-sm font-medium">Você</span>
            <span className="text-sm tabular-nums">{minha.pontos} pts</span>
          </Card>
        </div>
      )}

      {minha && (
        <p className="text-center text-xs text-muted-foreground">
          Você está em #{minha.posicao} de {minha.total_participantes}
          {escopo === "liga" && " na sua liga"}
          {escopo === "amigos" && " entre seus amigos"}.
        </p>
      )}
    </div>
  );
}

function Podio({ linhas }: { linhas: RankLinha[] }) {
  const medalhas = ["🥇", "🥈", "🥉"];
  return (
    <div className="flex flex-col gap-1.5">
      {linhas.map((l, i) => (
        <Card
          key={l.user_id}
          className={`flex items-center gap-3 p-3 ${
            l.e_voce ? "border-primary bg-primary/5" : ""
          } ${i === 0 ? "bg-gradient-to-r from-warm/15 to-transparent" : ""}`}
        >
          <span className="text-xl">{medalhas[i]}</span>
          <Avatar nome={l.nome} url={l.avatar_url} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {l.nome}
              {l.e_voce && <span className="ml-1 text-xs text-primary">(você)</span>}
            </p>
            <p className="text-xs text-muted-foreground">Nível {l.nivel}</p>
          </div>
          <span className="font-display text-sm font-bold tabular-nums">{l.pontos}</span>
        </Card>
      ))}
    </div>
  );
}

function Linha({ linha }: { linha: RankLinha }) {
  return (
    <Card
      className={`flex items-center gap-3 p-2.5 ${linha.e_voce ? "border-primary bg-primary/5" : ""}`}
    >
      <span className="w-6 text-center text-xs font-semibold tabular-nums text-muted-foreground">
        {linha.posicao}
      </span>
      <Avatar nome={linha.nome} url={linha.avatar_url} pequeno />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          {linha.nome}
          {linha.e_voce && <span className="ml-1 text-xs text-primary">(você)</span>}
        </p>
      </div>
      <Badge variant="secondary" className="text-[10px]">
        N{linha.nivel}
      </Badge>
      <span className="w-12 text-right text-sm tabular-nums">{linha.pontos}</span>
    </Card>
  );
}

function Avatar({ nome, url, pequeno }: { nome: string; url: string | null; pequeno?: boolean }) {
  const tamanho = pequeno ? "size-7 text-xs" : "size-9 text-sm";
  if (url)
    return <img src={url} alt="" className={`${tamanho} shrink-0 rounded-full object-cover`} />;
  return (
    <div
      className={`${tamanho} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow font-bold text-primary-foreground`}
    >
      {(nome[0] ?? "?").toUpperCase()}
    </div>
  );
}

function VazioPorEscopo({ escopo }: { escopo: Escopo }) {
  if (escopo === "amigos") {
    return (
      <Card className="flex flex-col items-center gap-2 p-8 text-center">
        <UserPlus className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">Você ainda não tem amigos aqui</p>
        <p className="text-xs text-muted-foreground">
          Adicione colegas para comparar o progresso de vocês.
        </p>
        <Link to="/amigos" className="mt-1 text-sm font-medium text-primary hover:underline">
          Encontrar colegas
        </Link>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col items-center gap-2 p-8 text-center">
      <Trophy className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Ninguém pontuou neste período ainda. Responda um quiz e seja o primeiro.
      </p>
    </Card>
  );
}

type RankLinha = {
  posicao: number;
  user_id: string;
  nome: string;
  avatar_url: string | null;
  pontos: number;
  nivel: number;
  e_voce: boolean;
};
