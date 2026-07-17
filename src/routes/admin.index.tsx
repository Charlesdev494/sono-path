import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Loader2,
  Users,
  Activity,
  Target,
  Flame,
  UserPlus,
  FileText,
} from "lucide-react";

import {
  statsAtividadeQueryOptions,
  statsNiveisQueryOptions,
  statsOverviewQueryOptions,
  statsQuizQueryOptions,
  statsRegioesQueryOptions,
} from "@/lib/data/admin";
import { NIVEIS } from "@/lib/data/progress";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

// Cores dos gráficos vindas dos tokens do tema, não chumbadas — assim os
// gráficos acompanham a identidade do app em vez de divergir dela.
const COR_ACERTO = "hsl(var(--success))";
const COR_ERRO = "hsl(var(--destructive))";
const COR_PRIMARIA = "hsl(var(--primary))";

function AdminDashboard() {
  const [dias, setDias] = useState(30);
  const { data: geral, isLoading } = useQuery(statsOverviewQueryOptions());
  const { data: atividade } = useQuery(statsAtividadeQueryOptions(dias));
  const { data: regioes } = useQuery(statsRegioesQueryOptions());
  const { data: niveis } = useQuery(statsNiveisQueryOptions());
  const { data: porQuestao } = useQuery(statsQuizQueryOptions());

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Questões com muita gente errando: o número que mais rende ação. Exige um
  // mínimo de respostas — 1 pessoa errando 1 vez não diz nada sobre a questão.
  const problematicas = (porQuestao ?? [])
    .filter((q) => q.respostas >= 5 && q.taxa_acerto !== null && Number(q.taxa_acerto) < 50)
    .slice(0, 6);

  const semDados = (geral?.respostas_total ?? 0) === 0;

  const dadosAtividade = (atividade ?? []).map((d) => ({
    dia: new Date(d.dia + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    Acertos: Number(d.acertos),
    Erros: Number(d.erros),
    Alunos: Number(d.alunos_ativos),
  }));

  // Só regiões que alguém já respondeu — as demais poluiriam o gráfico com
  // barras vazias que não dizem nada.
  const dadosRegioes = (regioes ?? [])
    .filter((r) => Number(r.respostas) > 0)
    .slice(0, 12)
    .map((r) => ({
      regiao: r.regiao,
      Acerto: Number(r.taxa_acerto ?? 0),
      respostas: Number(r.respostas),
    }));

  const dadosNiveis = (niveis ?? []).map((n) => ({
    nome: NIVEIS.find((x) => x.nivel === n.nivel)?.nome ?? `Nível ${n.nivel}`,
    Alunos: Number(n.alunos),
  }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Visão geral</h1>
          <p className="text-sm text-muted-foreground">Como seus alunos estão indo.</p>
        </div>
        <Link
          to="/admin/alunos"
          className="rounded-lg border bg-card px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
        >
          Ver todos os alunos
        </Link>
      </header>

      {/* Alunos */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Alunos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Numero label="Cadastrados" valor={geral?.usuarios_total ?? 0} icone={Users} />
          <Numero
            label="Novos nesta semana"
            valor={geral?.usuarios_novos_7d ?? 0}
            icone={UserPlus}
          />
          <Numero
            label="Ativos nos últimos 7 dias"
            valor={geral?.ativos_7d ?? 0}
            icone={Activity}
            rodape={`${geral?.ativos_30d ?? 0} nos últimos 30 dias`}
          />
          <Numero
            label="Sequência média"
            valor={geral?.streak_medio ? `${geral.streak_medio} dias` : "—"}
            icone={Flame}
            rodape="entre quem esteve ativo na semana"
          />
        </div>
      </section>

      {/* Desempenho */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Desempenho
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Numero
            label="Respostas registradas"
            valor={geral?.respostas_total ?? 0}
            icone={Target}
          />
          <Numero
            label="Acertos"
            valor={geral?.acertos_total ?? 0}
            icone={Target}
            cor="text-success"
          />
          <Numero
            label="Erros"
            valor={geral?.erros_total ?? 0}
            icone={Target}
            cor="text-destructive"
          />
          <Numero
            label="Taxa de acerto"
            // null (ninguém respondeu) e 0% (todos erraram) são coisas
            // diferentes — mostrar "—" evita alarme falso.
            valor={geral?.taxa_acerto === null ? "—" : `${geral?.taxa_acerto}%`}
            icone={Target}
          />
        </div>
      </section>

      {semDados ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Activity className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Nenhuma resposta ainda</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Os gráficos aparecem quando os alunos começarem a responder. O conteúdo já está no ar:{" "}
            {geral?.quiz_publicados ?? 0} questões, {geral?.casos_publicados ?? 0} casos e{" "}
            {geral?.estruturas_publicadas ?? 0} estruturas do atlas.
          </p>
        </Card>
      ) : (
        <>
          {/* Atividade no tempo */}
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-sm font-semibold">Acertos e erros por dia</h2>
                <p className="text-xs text-muted-foreground">
                  Dias sem atividade aparecem como zero, não são pulados.
                </p>
              </div>
              <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDias(d)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                      dias === d ? "bg-card shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dadosAtividade}
                  margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis
                    dataKey="dia"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                    allowDecimals={false}
                  />
                  <Tooltip content={<DicaGrafico />} />
                  <Area
                    type="monotone"
                    dataKey="Acertos"
                    stackId="1"
                    stroke={COR_ACERTO}
                    fill={COR_ACERTO}
                    fillOpacity={0.25}
                  />
                  <Area
                    type="monotone"
                    dataKey="Erros"
                    stackId="1"
                    stroke={COR_ERRO}
                    fill={COR_ERRO}
                    fillOpacity={0.25}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Taxa por região */}
            <Card className="flex flex-col gap-3 p-4">
              <div>
                <h2 className="font-display text-sm font-semibold">Taxa de acerto por região</h2>
                <p className="text-xs text-muted-foreground">
                  As barras mais baixas são onde o conteúdo pode estar confuso.
                </p>
              </div>
              {dadosRegioes.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Ainda sem respostas suficientes.
                </p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dadosRegioes}
                      layout="vertical"
                      margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                        unit="%"
                      />
                      <YAxis
                        type="category"
                        dataKey="regiao"
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                        width={95}
                      />
                      <Tooltip content={<DicaRegiao />} />
                      <Bar dataKey="Acerto" radius={[0, 4, 4, 0]}>
                        {dadosRegioes.map((r) => (
                          // Vermelho abaixo de 50%, âmbar até 70%: a cor já
                          // conta a história antes de alguém ler o número.
                          <Cell
                            key={r.regiao}
                            fill={
                              r.Acerto < 50
                                ? COR_ERRO
                                : r.Acerto < 70
                                  ? "hsl(var(--warm))"
                                  : COR_ACERTO
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Distribuição de níveis */}
            <Card className="flex flex-col gap-3 p-4">
              <div>
                <h2 className="font-display text-sm font-semibold">Alunos por nível</h2>
                <p className="text-xs text-muted-foreground">A forma da turma hoje.</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosNiveis} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="nome"
                      tick={{ fontSize: 10 }}
                      className="fill-muted-foreground"
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      className="fill-muted-foreground"
                      allowDecimals={false}
                    />
                    <Tooltip content={<DicaGrafico />} />
                    <Bar dataKey="Alunos" fill={COR_PRIMARIA} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Questões problemáticas + conteúdo */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="size-3.5 text-warm" />
            <h2 className="font-display text-sm font-semibold">
              Questões que os alunos mais erram
            </h2>
          </div>
          {problematicas.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Nenhuma questão com acerto abaixo de 50% (entre as que já têm 5 respostas ou mais).
              Quando houver, ela aparece aqui — costuma ser sinal de enunciado confuso ou gabarito
              trocado.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {problematicas.map((q) => (
                <li key={q.question_id}>
                  <Link
                    to="/admin/quiz/$id"
                    params={{ id: q.question_id }}
                    className="flex items-start justify-between gap-3 rounded-md p-2 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm">{q.enunciado}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {q.regiao} · {q.respostas} respostas
                      </p>
                    </div>
                    <Badge
                      className="shrink-0 tabular-nums"
                      variant={Number(q.taxa_acerto) < 30 ? "destructive" : "secondary"}
                    >
                      {Number(q.taxa_acerto).toFixed(0)}%
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-muted-foreground" />
            <h2 className="font-display text-sm font-semibold">Seu conteúdo</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ItemConteudo
              valor={geral?.quiz_publicados ?? 0}
              label="questões no ar"
              to="/admin/quiz"
            />
            <ItemConteudo
              valor={geral?.casos_publicados ?? 0}
              label="casos no ar"
              to="/admin/casos"
            />
            <ItemConteudo
              valor={geral?.estruturas_publicadas ?? 0}
              label="estruturas do atlas"
              to="/admin/atlas"
            />
            <ItemConteudo
              valor={geral?.quiz_rascunhos ?? 0}
              label="rascunhos de quiz"
              to="/admin/quiz"
              destaque={(geral?.quiz_rascunhos ?? 0) > 0}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Numero({
  label,
  valor,
  icone: Icone,
  rodape,
  cor,
}: {
  label: string;
  valor: number | string;
  icone: typeof Users;
  rodape?: string;
  cor?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icone className={`size-4 shrink-0 ${cor ?? "text-muted-foreground"}`} />
      </div>
      <p className={`mt-1.5 font-display text-2xl font-bold tabular-nums ${cor ?? ""}`}>{valor}</p>
      {rodape && <p className="mt-0.5 text-xs text-muted-foreground">{rodape}</p>}
    </Card>
  );
}

function ItemConteudo({
  valor,
  label,
  to,
  destaque,
}: {
  valor: number;
  label: string;
  to: string;
  destaque?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`rounded-lg border p-3 transition-colors hover:bg-accent ${
        destaque ? "border-warm/40 bg-warm/5" : ""
      }`}
    >
      <p className="font-display text-xl font-bold tabular-nums">{valor}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Link>
  );
}

// Tooltip próprio: o padrão do recharts não segue o tema e fica branco no
// modo escuro.
function DicaGrafico({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-2.5 shadow-md">
      <p className="mb-1 text-xs font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs tabular-nums" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function DicaRegiao({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { regiao: string; Acerto: number; respostas: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card p-2.5 shadow-md">
      <p className="text-xs font-semibold">{d.regiao}</p>
      <p className="text-xs tabular-nums text-muted-foreground">
        {d.Acerto}% de acerto em {d.respostas} respostas
      </p>
    </div>
  );
}
