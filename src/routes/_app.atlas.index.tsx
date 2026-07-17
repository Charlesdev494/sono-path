import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { atlasQueryOptions } from "@/lib/data/content";

export const Route = createFileRoute("/_app/atlas/")({
  component: AtlasIndex,
});

function AtlasIndex() {
  const { data: atlas, isLoading } = useQuery(atlasQueryOptions());

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Atlas</h1>
        <p className="text-sm text-muted-foreground">
          Sonoanatomia por região anatômica
        </p>
      </header>
      <ul className="grid grid-cols-2 gap-3">
        {atlas?.map((r) => (
          <li key={r.slug}>
            <Link
              to="/atlas/$region"
              params={{ region: r.slug }}
              className="block h-full rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="text-2xl">{r.icone}</div>
              <p className="mt-2 font-medium">{r.nome}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {r.estruturas.length} estruturas
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
