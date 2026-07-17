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
import { Activity, ChevronLeft, Flame, Loader2, Stethoscope, Target, Trophy } from "lucide-react";

import {
  alunoAtividadeQueryOptions,
  alunoRegioesQueryOptions,
  alunoResumoQueryOptions,
} from "@/lib/data/admin";
import { NIVEIS } from "@/lib/data/progress";

export const Route = createFileRoute("/admin/alunos/$id")({
  component: AdminAlunoDetalhe,
});

// Mesmas cores da visão geral, dos tokens do tema.
const COR_ACERTO = "hsl(var(--success))";
const COR_ERRO = "hsl(var(--destructive))";

function AdminAlunoDetalhe() {
  const { id } = Route.useParams();
  const [dias, setDias] = useState(30);
  const { data: aluno, isLoading, isError } = useQuery(alunoResumoQueryOptions(id));
  const { data: regioes } = useQuery(alunoRegioesQueryOptions(id));
  const { data: atividade } = useQuery(alunoAtividadeQueryOptions(id, dias));

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !aluno) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Aluno não encontrado.{" "}
        <Link to="/admin/alunos" className="text-primary underline">
          Voltar
        </Link>
      </div>
    );
  }

  const nivelNome = NIVEIS.find((n) => n.nivel === aluno.nivel)?.nome ?? `Nível ${aluno.nivel}`;
  const semDados = Number(aluno.respostas) === 0;

  const dadosAtividade = (atividade ?? []).map((d) => ({
    dia: new Date(d.dia + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    Acertos: Number(d.acertos),
    Erros: Number(d.erros),
  }));

  const dadosRegioes = (regioes ?? [])
    .filter((r) => Number(r.respostas) > 0)
    .map((r) => ({
      regiao: r.regiao,
      Acerto: Number(r.taxa_acerto ?? 0),
      respostas: Number(r.respostas),
    }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/admin/alunos"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Alunos
        </Link>
        <header className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-lg font-bold text-primary-foreground">
            {(aluno.nome[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold">{aluno.nome}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {[aluno.especialidade, aluno.cidade].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </header>
      </div>

      {/* Cartões — o mesmo conjunto da visão geral, deste aluno */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Numero label="Nível" valor={nivelNome} icone={Trophy} rodape={`${aluno.pontos} pontos`} />
        <Numero
          label="Sequência"
          valor={aluno.streak > 0 ? `${aluno.streak} dias` : "—"}
          icone={Flame}
          rodape={`última atividade ${formatarQuando(aluno.ultimo_acesso)}`}
        />
        <Numero label="Respostas" valor={Number(aluno.respostas)} icone={Target} />
        <Numero
          label="Taxa de acerto"
          valor={aluno.taxa_acerto === null ? "—" : `${aluno.taxa_acerto}%`}
          icone={Target}
        />
        <Numero label="Acertos" valor={Number(aluno.acertos)} icone={Target} cor="text-success" />
        <Numero label="Erros" valor={Number(aluno.erros)} icone={Target} cor="text-destructive" />
        <Numero
          label="Casos concluídos"
          valor={Number(aluno.casos_concluidos)}
          icone={Stethoscope}
        />
        <Numero
          label="Cadastro"
          valor={new Date(aluno.criado_em).toLocaleDateString("pt-BR")}
          icone={Activity}
        />
      </section>

      {semDados ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Activity className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Este aluno ainda não respondeu nada</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Os gráficos aparecem quando ele começar a responder quiz e casos.
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

          {/* Desempenho por região deste aluno */}
          <Card className="flex flex-col gap-3 p-4">
            <div>
              <h2 className="font-display text-sm font-semibold">Desempenho por região</h2>
              <p className="text-xs text-muted-foreground">
                Onde este aluno acerta e onde tropeça.
              </p>
            </div>
            {dadosRegioes.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Ainda sem respostas suficientes.
              </p>
            ) : (
              <div className="w-full" style={{ height: Math.max(160, dadosRegioes.length * 34) }}>
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
        </>
      )}
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
  icone: typeof Target;
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

/** "há 2 dias" diz mais que uma data — o que importa é se sumiu ou não. */
function formatarQuando(iso: string | null): string {
  if (!iso) return "nunca";
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  if (dias < 60) return "há mais de 1 mês";
  return `há ${Math.floor(dias / 30)} meses`;
}
