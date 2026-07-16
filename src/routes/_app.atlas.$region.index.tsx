import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findRegion } from "@/content/atlas";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/atlas/$region/")({
  component: RegionPage,
});

function RegionPage() {
  const { region } = Route.useParams();
  const r = findRegion(region);
  if (!r) throw notFound();

  return (
    <div className="flex flex-col gap-4 px-5 pt-6">
      <Link to="/atlas" className="-ml-1 inline-flex items-center text-sm text-muted-foreground">
        <ChevronLeft className="size-4" /> Atlas
      </Link>
      <header>
        <div className="text-3xl">{r.icone}</div>
        <h1 className="mt-1 font-display text-2xl font-bold">{r.nome}</h1>
        <p className="text-sm text-muted-foreground">{r.descricao}</p>
      </header>
      <ul className="space-y-2">
        {r.estruturas.map((e) => (
          <li key={e.slug}>
            <Link
              to="/atlas/$region/$structure"
              params={{ region: r.slug, structure: e.slug }}
              className="flex items-center justify-between rounded-xl border bg-card p-4 hover:bg-accent"
            >
              <div>
                <p className="font-medium">{e.nome}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{e.resumo}</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
