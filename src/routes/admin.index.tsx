import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, Users, Activity, CheckCircle2 } from "lucide-react";

import { statsOverviewQueryOptions, statsQuizQueryOptions } from "@/lib/data/admin";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: geral, isLoading } = useQuery(statsOverviewQueryOptions());
  const { data: porQuestao } = useQuery(statsQuizQueryOptions());

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Questões com muita gente errando geralmente têm enunciado confuso ou
  // gabarito trocado. É o número que mais rende ação, então vem em destaque.
  const problematicas = (porQuestao ?? [])
    .filter((q) => q.respostas >= 5 && q.taxa_acerto !== null && Number(q.taxa_acerto) < 40)
    .slice(0, 5);

  const respondidas = (porQuestao ?? []).filter((q) => q.respostas > 0);
  const taxaMedia =
    respondidas.length > 0
      ? respondidas.reduce((n, q) => n + Number(q.taxa_acerto ?? 0), 0) / respondidas.length
      : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-xl font-bold">Visão geral</h1>
        <p className="text-sm text-muted-foreground">Como o app está sendo usado.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Numero label="Alunos cadastrados" valor={geral?.usuarios_total ?? 0} icone={Users} />
        <Numero label="Ativos nos últimos 7 dias" valor={geral?.ativos_7d ?? 0} icone={Activity} />
        <Numero
          label="Respostas registradas"
          valor={geral?.respostas_total ?? 0}
          icone={CheckCircle2}
        />
        <Numero
          label="Acerto médio"
          valor={taxaMedia === null ? "—" : `${taxaMedia.toFixed(0)}%`}
          icone={CheckCircle2}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Conteúdo no ar</p>
          <div className="mt-2 flex gap-6">
            <div>
              <p className="font-display text-2xl font-bold tabular-nums">
                {geral?.quiz_publicados ?? 0}
              </p>
              <Link to="/admin/quiz" className="text-xs text-primary hover:underline">
                questões de quiz
              </Link>
            </div>
            <div>
              <p className="font-display text-2xl font-bold tabular-nums">
                {geral?.casos_publicados ?? 0}
              </p>
              <Link to="/admin/casos" className="text-xs text-primary hover:underline">
                casos clínicos
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <AlertTriangle className="size-3.5 text-warm" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Questões que os alunos mais erram
            </p>
          </div>
          {problematicas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma questão com acerto abaixo de 40%. Quando houver, ela aparece aqui — costuma
              ser sinal de enunciado confuso ou gabarito trocado.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {problematicas.map((q) => (
                <li key={q.question_id}>
                  <Link
                    to="/admin/quiz/$id"
                    params={{ id: q.question_id }}
                    className="flex items-start justify-between gap-3 rounded-md p-1.5 transition-colors hover:bg-accent"
                  >
                    <span className="line-clamp-2 text-sm">{q.enunciado}</span>
                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                      {Number(q.taxa_acerto).toFixed(0)}%
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Numero({
  label,
  valor,
  icone: Icone,
}: {
  label: string;
  valor: number | string;
  icone: typeof Users;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icone className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-1.5 font-display text-2xl font-bold tabular-nums">{valor}</p>
    </Card>
  );
}
