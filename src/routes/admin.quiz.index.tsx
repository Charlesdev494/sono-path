import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, ImageIcon } from "lucide-react";

import { adminQuizListQueryOptions } from "@/lib/data/admin";

export const Route = createFileRoute("/admin/quiz/")({
  component: AdminQuizList,
});

export function StatusBadge({ status }: { status: string }) {
  return status === "publicado" ? (
    <Badge className="bg-success/20 text-success hover:bg-success/20">No ar</Badge>
  ) : (
    <Badge variant="secondary">Rascunho</Badge>
  );
}

function AdminQuizList() {
  const { data: questoes, isLoading } = useQuery(adminQuizListQueryOptions());
  const [busca, setBusca] = useState("");
  const [regiao, setRegiao] = useState("Todas");
  const [status, setStatus] = useState<"todos" | "publicado" | "rascunho">("todos");

  const regioes = useMemo(
    () => ["Todas", ...[...new Set((questoes ?? []).map((q) => q.regiao))].sort()],
    [questoes],
  );

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (questoes ?? []).filter((q) => {
      if (regiao !== "Todas" && q.regiao !== regiao) return false;
      if (status !== "todos" && q.status !== status) return false;
      if (!termo) return true;
      // busca no enunciado e nas alternativas: procurar por um termo que só
      // aparece numa alternativa é comum ao revisar conteúdo
      const alts = Array.isArray(q.alternativas)
        ? (q.alternativas as { texto?: string }[]).map((a) => a.texto ?? "").join(" ")
        : "";
      return `${q.enunciado} ${alts} ${q.explicacao}`.toLowerCase().includes(termo);
    });
  }, [questoes, busca, regiao, status]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Quiz</h1>
          <p className="text-sm text-muted-foreground">
            {questoes?.length ?? 0} questões ·{" "}
            {questoes?.filter((q) => q.status === "publicado").length ?? 0} no ar
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/quiz/$id" params={{ id: "nova" }}>
            <Plus className="mr-1.5 size-4" />
            Nova questão
          </Link>
        </Button>
      </header>

      <Card className="flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar no enunciado, alternativas ou explicação"
            className="pl-8"
          />
        </div>
        <select
          value={regiao}
          onChange={(e) => setRegiao(e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          {regioes.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="todos">Todos os status</option>
          <option value="publicado">No ar</option>
          <option value="rascunho">Rascunho</option>
        </select>
      </Card>

      {filtradas.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma questão encontrada com esses filtros.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtradas.map((q) => (
            <Link key={q.id} to="/admin/quiz/$id" params={{ id: q.id }}>
              <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-accent">
                {q.imagem_url ? (
                  <img
                    src={q.imagem_url}
                    alt=""
                    className="size-11 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    <ImageIcon className="size-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{q.enunciado}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {q.regiao}
                    </Badge>
                    {q.nivel === "avancado" && (
                      <Badge variant="outline" className="text-[10px]">
                        Avançado
                      </Badge>
                    )}
                    {q.origem === "ia" && (
                      <Badge variant="outline" className="text-[10px]">
                        Gerada por IA
                      </Badge>
                    )}
                  </div>
                </div>
                <StatusBadge status={q.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
