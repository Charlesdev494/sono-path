import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Flame, ChevronRight } from "lucide-react";

import { alunosQueryOptions } from "@/lib/data/admin";
import { NIVEIS } from "@/lib/data/progress";

export const Route = createFileRoute("/admin/alunos/")({
  component: AdminAlunos,
});

type Ordem = "pontos" | "recentes" | "acerto" | "nome";

function AdminAlunos() {
  const navigate = useNavigate();
  const { data: alunos, isLoading } = useQuery(alunosQueryOptions());
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("pontos");

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrados = (alunos ?? []).filter(
      (a) => !termo || `${a.nome} ${a.especialidade} ${a.cidade}`.toLowerCase().includes(termo),
    );
    const ordenado = [...filtrados];
    switch (ordem) {
      case "recentes":
        // Quem nunca acessou vai para o fim, não para o topo: a lista é para
        // encontrar quem está ativo, não para exibir buracos.
        ordenado.sort(
          (a, b) =>
            new Date(b.ultimo_acesso ?? 0).getTime() - new Date(a.ultimo_acesso ?? 0).getTime(),
        );
        break;
      case "acerto":
        ordenado.sort((a, b) => Number(b.taxa_acerto ?? -1) - Number(a.taxa_acerto ?? -1));
        break;
      case "nome":
        ordenado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        break;
      default:
        ordenado.sort((a, b) => b.pontos - a.pontos);
    }
    return ordenado;
  }, [alunos, busca, ordem]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-xl font-bold">Alunos</h1>
        <p className="text-sm text-muted-foreground">
          {alunos?.length ?? 0} cadastrados · toque num aluno para ver as métricas dele
        </p>
      </header>

      <Card className="flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, especialidade ou cidade"
            className="pl-8"
          />
        </div>
        <select
          value={ordem}
          onChange={(e) => setOrdem(e.target.value as Ordem)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="pontos">Mais pontos</option>
          <option value="recentes">Mais recentes</option>
          <option value="acerto">Maior taxa de acerto</option>
          <option value="nome">Nome (A–Z)</option>
        </select>
      </Card>

      {lista.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {alunos?.length === 0
              ? "Nenhum aluno cadastrado ainda."
              : "Nenhum aluno encontrado com essa busca."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          {/* Tabela larga rola dentro do próprio contêiner — a página nunca
              rola de lado. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <Th>Aluno</Th>
                  <Th>Nível</Th>
                  <Th alinhar="right">Pontos</Th>
                  <Th alinhar="right">Sequência</Th>
                  <Th alinhar="right">Respostas</Th>
                  <Th alinhar="right">Acerto</Th>
                  <Th>Última atividade</Th>
                  <Th>{""}</Th>
                </tr>
              </thead>
              <tbody>
                {lista.map((a) => (
                  <tr
                    key={a.user_id}
                    onClick={() => navigate({ to: "/admin/alunos/$id", params: { id: a.user_id } })}
                    className="cursor-pointer border-b last:border-0 hover:bg-accent/50"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-bold text-primary-foreground">
                          {(a.nome[0] ?? "?").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{a.nome}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {[a.especialidade, a.cidade].filter(Boolean).join(" · ") || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {NIVEIS.find((n) => n.nivel === a.nivel)?.nome ?? a.nivel}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{a.pontos}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        {a.streak > 0 && <Flame className="size-3 text-warm" />}
                        {a.streak}d
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                      {a.respostas}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {a.taxa_acerto === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span
                          className={
                            Number(a.taxa_acerto) >= 70
                              ? "text-success"
                              : Number(a.taxa_acerto) < 50
                                ? "text-destructive"
                                : ""
                          }
                        >
                          {a.taxa_acerto}%
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {formatarQuando(a.ultimo_acesso)}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <ChevronRight className="inline size-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function Th({ children, alinhar }: { children: React.ReactNode; alinhar?: "right" }) {
  return (
    <th
      className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
        alinhar === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/** "há 2 dias" diz mais que uma data — o que importa é se sumiu ou não. */
function formatarQuando(iso: string | null): string {
  if (!iso) return "nunca entrou";
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  if (dias < 60) return "há mais de 1 mês";
  return `há ${Math.floor(dias / 30)} meses`;
}
