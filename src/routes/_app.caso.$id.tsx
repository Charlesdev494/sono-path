import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CASOS, type CasoClinico } from "@/content/casos";
import { useProfile } from "@/lib/profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_app/caso/$id")({
  head: ({ params }) => {
    const c = CASOS.find((x) => x.id === params.id);
    return {
      meta: [
        { title: `${c?.titulo ?? "Caso"} · US360` },
        { name: "description", content: c?.apresentacao?.slice(0, 150) ?? "" },
      ],
    };
  },
  component: CasoDetailPage,
  notFoundComponent: () => (
    <div className="p-6 text-center text-sm text-muted-foreground">
      Caso não encontrado.{" "}
      <Link to="/caso" className="text-primary underline">
        Voltar
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="p-6 text-center text-sm text-destructive">
      Erro ao carregar caso.
    </div>
  ),
  loader: ({ params }) => {
    const caso = CASOS.find((c) => c.id === params.id);
    if (!caso) throw notFound();
    return { caso };
  },
});

function CasoDetailPage() {
  const { caso } = Route.useLoaderData() as { caso: CasoClinico };
  const { update, addPontos, marcarMissao } = useProfile();
  const [respostas, setRespostas] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [finalizado, setFinalizado] = useState(false);

  const responder = (qid: string, letra: "A" | "B" | "C" | "D") => {
    if (finalizado) return;
    setRespostas((r) => ({ ...r, [qid]: letra }));
  };

  const finalizar = () => {
    const acertos = caso.questoes.filter((q) => respostas[q.id] === q.correta).length;
    const pontos = 30 + acertos * 15;
    addPontos(pontos);
    marcarMissao("caso");
    update((p) =>
      p.casosRespondidos.includes(caso.id)
        ? p
        : { ...p, casosRespondidos: [...p.casosRespondidos, caso.id] },
    );
    setFinalizado(true);
  };

  const todasRespondidas = caso.questoes.every((q) => respostas[q.id]);

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-6">
      <Link
        to="/caso"
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground"
      >
        <ChevronLeft className="size-4" /> Casos
      </Link>

      <header>
        <Badge variant="secondary">{caso.regiao}</Badge>
        <h1 className="mt-2 font-display text-2xl font-bold leading-tight">
          {caso.titulo}
        </h1>
      </header>

      {caso.imagemUrl && (
        <Card className="overflow-hidden p-0">
          <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-900">
            <img
              src={caso.imagemUrl}
              alt={caso.imagemLabel ?? caso.titulo}
              className="size-full object-contain"
            />
            {caso.imagemLabel && (
              <div className="absolute left-3 top-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                US · {caso.imagemLabel}
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h2 className="mb-1 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Apresentação
        </h2>
        <p className="text-sm leading-relaxed">{caso.apresentacao}</p>
        <h2 className="mb-1 mt-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Exame físico
        </h2>
        <p className="text-sm leading-relaxed">{caso.examesFisicos}</p>
      </Card>

      <div className="space-y-4">
        {caso.questoes.map((q, idx) => {
          const escolhida = respostas[q.id];
          return (
            <Card key={q.id} className="p-4">
              <p className="mb-3 text-sm font-semibold">
                {idx + 1}. {q.pergunta}
              </p>
              {q.imagemUrl && (
                <div className="relative mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-md bg-slate-900">
                  <img
                    src={q.imagemUrl}
                    alt={q.imagemLabel ?? q.pergunta}
                    className="size-full object-contain"
                  />
                  {q.imagemLabel && (
                    <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                      US · {q.imagemLabel}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {q.alternativas.map((a) => {
                  const isCorreta = a.letra === q.correta;
                  const isChosen = escolhida === a.letra;
                  let style = "border bg-background hover:bg-accent";
                  if (finalizado && isCorreta)
                    style = "border-success bg-success/15";
                  else if (finalizado && isChosen && !isCorreta)
                    style = "border-destructive bg-destructive/10";
                  else if (isChosen) style = "border-primary bg-primary/10";
                  return (
                    <button
                      key={a.letra}
                      onClick={() => responder(q.id, a.letra)}
                      disabled={finalizado}
                      className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm transition-colors ${style}`}
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded border bg-background text-xs font-bold">
                        {a.letra}
                      </span>
                      <span className="flex-1">{a.texto}</span>
                      {finalizado && isCorreta && (
                        <Check className="size-4 text-success" />
                      )}
                      {finalizado && isChosen && !isCorreta && (
                        <X className="size-4 text-destructive" />
                      )}
                    </button>
                  );
                })}
              </div>
              {finalizado && (
                <p className="mt-3 rounded-md bg-muted/60 p-2.5 text-xs text-muted-foreground">
                  {q.comentario}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {!finalizado ? (
        <Button onClick={finalizar} disabled={!todasRespondidas} size="lg">
          Ver resolução
        </Button>
      ) : (
        <Card className="border-primary/30 bg-primary/5 p-4">
          <h2 className="mb-2 font-display font-semibold">Resolução comentada</h2>
          <p className="text-sm leading-relaxed">{caso.resolucao}</p>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link to="/caso">Voltar para a lista</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
