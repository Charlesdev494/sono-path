import { createFileRoute, Link } from "@tanstack/react-router";
import { ATLAS } from "@/content/atlas";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/atlas/")({
  component: AtlasIndex,
});

function AtlasIndex() {
  return (
    <div className="flex flex-col gap-4 px-5 pt-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Atlas</h1>
        <p className="text-sm text-muted-foreground">
          Sonoanatomia por região anatômica
        </p>
      </header>
      <ul className="grid grid-cols-2 gap-3">
        {ATLAS.map((r) => (
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
      <div className="mt-2 rounded-xl bg-muted/60 p-4 text-xs text-muted-foreground">
        <ChevronRight className="mr-1 inline size-3" />
        Conteúdo placeholder — será substituído por imagens e vídeos reais.
      </div>
    </div>
  );
}
