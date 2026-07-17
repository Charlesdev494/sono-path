import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronLeft, Loader2 } from "lucide-react";

import { casosQueryOptions, type QuizLetra } from "@/lib/data/content";
import { useMarcarMissao, useRegistrarResposta } from "@/lib/data/progress";
import { useConferirConquistas } from "@/lib/usarConquistas";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/_app/caso/$id")({
  // O título vinha do conteúdo estático; agora o caso só é conhecido depois da
  // query, então o head fica genérico e a tela mostra o título real.
  head: () => ({
    meta: [{ title: "Caso clínico · US360" }],
  }),
  component: CasoDetailPage,
  errorComponent: () => (
    <div className="p-6 text-center text-sm text-destructive">Erro ao carregar caso.</div>
  ),
});

function CasoDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: casos, isLoading } = useQuery(casosQueryOptions());
  const registrar = useRegistrarResposta();
  const marcarMissao = useMarcarMissao();
  const conferirConquistas = useConferirConquistas();

  const [respostas, setRespostas] = useState<Record<string, QuizLetra>>({});
  const [finalizado, setFinalizado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // a URL usa o slug legível ("caso-fascite"), não o uuid
  const caso = casos?.find((c) => c.slug === id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!caso) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Caso não encontrado.{" "}
        <Link to="/caso" className="text-primary underline">
          Voltar
        </Link>
      </div>
    );
  }

  const responder = (qid: string, letra: QuizLetra) => {
    if (finalizado) return;
    setRespostas((r) => ({ ...r, [qid]: letra }));
  };

  const finalizar = async () => {
    setSalvando(true);
    try {
      // Cada resposta é validada individualmente pelo servidor; depois vem o
      // bônus de conclusão. Em série de propósito: o total precisa ficar certo.
      for (const q of caso.questoes) {
        const escolhida = respostas[q.id];
        if (!escolhida) continue;
        await registrar.mutateAsync({
          origem: "caso",
          questaoId: q.id,
          resposta: escolhida,
        });
      }
      const supabase = getSupabaseBrowserClient();
      await supabase.rpc("concluir_caso", { p_caso_id: caso.id });
      await marcarMissao.mutateAsync("caso");
      await queryClient.invalidateQueries({ queryKey: ["progress"] });
      await conferirConquistas();
    } catch {
      // A resolução aparece de qualquer forma — o estudo não depende do
      // registro dos pontos ter dado certo.
    }
    setSalvando(false);
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
                  if (finalizado && isCorreta) style = "border-success bg-success/15";
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
                      {finalizado && isCorreta && <Check className="size-4 text-success" />}
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
        <Button onClick={finalizar} disabled={!todasRespondidas || salvando} size="lg">
          {salvando && <Loader2 className="mr-2 size-4 animate-spin" />}
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
