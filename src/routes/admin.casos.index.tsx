import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Stethoscope } from "lucide-react";

import { adminCasosListQueryOptions } from "@/lib/data/admin";
import { StatusBadge } from "./admin.quiz.index";

export const Route = createFileRoute("/admin/casos/")({
  component: AdminCasosList,
});

function AdminCasosList() {
  const { data: casos, isLoading } = useQuery(adminCasosListQueryOptions());

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
          <h1 className="font-display text-xl font-bold">Casos clínicos</h1>
          <p className="text-sm text-muted-foreground">
            {casos?.length ?? 0} casos ·{" "}
            {casos?.filter((c) => c.status === "publicado").length ?? 0} no ar
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/casos/$id" params={{ id: "novo" }}>
            <Plus className="mr-1.5 size-4" />
            Novo caso
          </Link>
        </Button>
      </header>

      {!casos || casos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhum caso ainda.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-1.5">
          {casos.map((c) => (
            <Link key={c.id} to="/admin/casos/$id" params={{ id: c.id }}>
              <Card className="flex items-center gap-3 p-3 transition-colors hover:bg-accent">
                {c.imagem_url ? (
                  <img
                    src={c.imagem_url}
                    alt=""
                    className="size-11 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    <Stethoscope className="size-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.titulo}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {c.regiao}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {c.case_questions?.[0]?.count ?? 0} perguntas
                    </span>
                    {c.semana > 0 && (
                      <span className="text-xs text-muted-foreground">· semana {c.semana}</span>
                    )}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
