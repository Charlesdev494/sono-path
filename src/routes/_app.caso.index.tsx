import { createFileRoute, Link } from "@tanstack/react-router";
import { CASOS, casoDaSemana } from "@/content/casos";
import { useProfile } from "@/lib/profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, ChevronRight, Check, Sparkles } from "lucide-react";

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
  const { profile } = useProfile();
  const destaque = casoDaSemana();
  const respondidos = profile?.casosRespondidos ?? [];

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

      <Link
        to="/caso/$id"
        params={{ id: destaque.id }}
        className="block"
      >
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
          Todos os casos ({CASOS.length})
        </h2>
        {CASOS.map((c) => {
          const feito = respondidos.includes(c.id);
          return (
            <Link key={c.id} to="/caso/$id" params={{ id: c.id }}>
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
