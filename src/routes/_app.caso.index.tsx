import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, ChevronRight, Check, Sparkles, Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { casosQueryOptions } from "@/lib/data/content";
import { progressQueryOptions } from "@/lib/data/progress";

export const Route = createFileRoute("/_app/caso/")({
  head: () => ({
    meta: [
      { title: "Casos Clínicos · US360" },
      { name: "description", content: "Biblioteca de casos clínicos com imagem de US." },
    ],
  }),
  component: CasoListPage,
});

function CasoListPage() {
  const { user } = useAuth();
  const { data: casos, isLoading } = useQuery(casosQueryOptions());
  const { data: progress } = useQuery(progressQueryOptions(user?.id));

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!casos || casos.length === 0) {
    return (
      <div className="px-5 pt-8">
        <p className="text-sm text-muted-foreground">
          Nenhum caso publicado ainda.
        </p>
      </div>
    );
  }

  // Mesma regra de antes: gira o destaque a cada semana. Vive aqui porque a
  // função morava no arquivo de conteúdo, que deixou de existir.
  const destaque =
    casos[Math.floor((Date.now() / (1000 * 60 * 60 * 24 * 7)) % casos.length)];

  const feitos = new Set(
    (progress?.atlas_visitados ?? [])
      .filter((v) => v.startsWith("caso:"))
      .map((v) => v.slice("caso:".length)),
  );

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Casos Clínicos</h1>
          <p className="text-sm text-muted-foreground">
            Imagem de US + sequência de perguntas
          </p>
        </div>
        <div className="rounded-full bg-primary/15 p-2.5 text-primary">
          <Stethoscope className="size-5" />
        </div>
      </header>

      <Link to="/caso/$id" params={{ id: destaque.slug }} className="block">
        <Card className="overflow-hidden border-primary/30 bg-primary/5 p-0">
          {destaque.imagemUrl && (
            <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-900">
              <img
                src={destaque.imagemUrl}
                alt={destaque.imagemLabel ?? destaque.titulo}
                className="size-full object-contain"
              />
              <div className="absolute left-3 top-3 rounded bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                Em destaque
              </div>
            </div>
          )}
          <div className="p-4">
            <div className="mb-1 flex items-center gap-2 text-xs text-primary">
              <Sparkles className="size-3.5" />
              <span className="font-semibold uppercase tracking-wider">
                Caso da semana
              </span>
            </div>
            <p className="font-display font-semibold">{destaque.titulo}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {destaque.apresentacao}
            </p>
          </div>
        </Card>
      </Link>

      <div className="space-y-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Todos os casos ({casos.length})
        </h2>
        {casos.map((c) => {
          const feito = feitos.has(c.id);
          return (
            <Link key={c.id} to="/caso/$id" params={{ id: c.slug }}>
              <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-accent">
                {c.imagemUrl ? (
                  <img
                    src={c.imagemUrl}
                    alt=""
                    className="size-14 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Stethoscope className="size-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {c.regiao}
                    </Badge>
                    {feito && (
                      <Badge className="gap-0.5 bg-success/20 text-[10px] text-success">
                        <Check className="size-3" /> feito
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm font-medium">{c.titulo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.questoes.length} perguntas
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
