import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Loader2 } from "lucide-react";

import { atlasQueryOptions } from "@/lib/data/content";

export const Route = createFileRoute("/admin/atlas/")({
  component: AdminAtlasList,
});

function AdminAtlasList() {
  const { data: atlas, isLoading } = useQuery(atlasQueryOptions());

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalEstruturas = atlas?.reduce((n, r) => n + r.estruturas.length, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-xl font-bold">Atlas</h1>
        <p className="text-sm text-muted-foreground">
          {atlas?.length ?? 0} regiões · {totalEstruturas} estruturas
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {atlas?.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">{r.icone}</span>
              <div>
                <h2 className="font-display text-sm font-semibold">{r.nome}</h2>
                <p className="text-xs text-muted-foreground">{r.descricao}</p>
              </div>
              <Badge variant="outline" className="ml-auto text-[10px]">
                {r.estruturas.length} estruturas
              </Badge>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              {r.estruturas.map((e) => (
                <Link
                  key={e.id}
                  to="/admin/atlas/$id"
                  params={{ id: e.id }}
                  className="flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.imagens.length + e.comparacoes.length} imagens
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
