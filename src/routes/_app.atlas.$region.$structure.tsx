import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";

import { atlasQueryOptions } from "@/lib/data/content";
import { useMarcarMissao, useRegistrarVisitaAtlas } from "@/lib/data/progress";

export const Route = createFileRoute("/_app/atlas/$region/$structure")({
  head: ({ params }) => ({
    meta: [{ title: `${params.structure} · Atlas` }],
  }),
  component: StructurePage,
});

function StructurePage() {
  const { region, structure } = Route.useParams();
  const { data: atlas, isLoading } = useQuery(atlasQueryOptions());
  const registrarVisita = useRegistrarVisitaAtlas();
  const marcarMissao = useMarcarMissao();

  const r = atlas?.find((x) => x.slug === region);
  const s = r?.estruturas.find((x) => x.slug === structure);

  // Registra a visita uma vez por estrutura. O ref evita disparar de novo a
  // cada render; o servidor também ignora repetição, mas não faz sentido
  // gastar requisição à toa.
  const jaRegistrou = useRef<string | null>(null);
  useEffect(() => {
    if (!s) return;
    const key = `${region}/${structure}`;
    if (jaRegistrou.current === key) return;
    jaRegistrou.current = key;
    registrarVisita.mutate(key);
    marcarMissao.mutate("atlas");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, structure, s]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!r || !s) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        Estrutura não encontrada.{" "}
        <Link to="/atlas" className="text-primary underline">
          Voltar ao atlas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-6">
      <Link
        to="/atlas/$region"
        params={{ region }}
        className="-ml-1 inline-flex items-center text-sm text-muted-foreground"
      >
        <ChevronLeft className="size-4" /> {r.nome}
      </Link>

      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{r.nome}</p>
        <h1 className="font-display text-2xl font-bold">{s.nome}</h1>
      </header>

      {/* Comparações lado a lado (bruta vs anotada) */}
      {s.comparacoes.length > 0 && (
        <div className="flex flex-col gap-4">
          {s.comparacoes.map((pair, i) => (
            <figure key={i} className="overflow-hidden rounded-xl border bg-black">
              <div className="grid grid-cols-2 gap-0.5 bg-white/10">
                <div className="flex flex-col">
                  <img
                    src={pair.raw.url}
                    alt={pair.raw.legenda}
                    className="w-full"
                    loading="lazy"
                  />
                  <span className="px-2 py-1 text-[10px] uppercase tracking-wider text-white/80">
                    {pair.raw.legenda}
                  </span>
                </div>
                <div className="flex flex-col">
                  <img
                    src={pair.anotada.url}
                    alt={pair.anotada.legenda}
                    className="w-full"
                    loading="lazy"
                  />
                  <span className="px-2 py-1 text-[10px] uppercase tracking-wider text-white/80">
                    {pair.anotada.legenda}
                  </span>
                </div>
              </div>
              {pair.legenda && (
                <figcaption className="px-3 py-2 text-xs leading-relaxed text-white">
                  {pair.legenda}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {/* Galeria */}
      {s.imagens.length > 0 ? (
        <div className="flex flex-col gap-3">
          {s.imagens.map((img, i) => (
            <figure key={i} className="overflow-hidden rounded-xl border bg-black">
              <img src={img.url} alt={img.legenda} className="w-full" loading="lazy" />
              <figcaption className="px-3 py-2 text-xs text-white">
                {img.legenda}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        s.comparacoes.length === 0 && (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-muted text-xs uppercase tracking-widest text-muted-foreground">
            Imagem ultrassonográfica · placeholder
          </div>
        )
      )}

      <Section title="Anatomia">{s.anatomia}</Section>
      <Section title="Sonoanatomia">{s.sonoanatomia}</Section>
      <BulletSection title="Dicas de escaneamento" items={s.escaneamento} />
      <BulletSection title="Armadilhas" items={s.armadilhas}>
        {/* O schema unificou armadilhaImagem (uma) e armadilhaImagens (várias)
            numa lista só — aqui é sempre a lista. */}
        {s.armadilhaImagens.map((img, i) => (
          <figure key={i} className="mt-3 overflow-hidden rounded-xl border bg-black">
            <img src={img.url} alt={img.legenda} className="w-full" loading="lazy" />
            <figcaption className="px-3 py-2 text-xs leading-relaxed text-white">
              {img.legenda}
            </figcaption>
          </figure>
        ))}
      </BulletSection>
      <BulletSection title="Aplicações clínicas" items={s.aplicacoesClinicas} />
      {s.volumes.length > 0 && <BulletSection title="Volumes" items={s.volumes} />}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1 font-display text-base font-semibold">{title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}

function BulletSection({
  title,
  items,
  children,
}: {
  title: string;
  items: string[];
  children?: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1 font-display text-base font-semibold">{title}</h2>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
      {children}
    </section>
  );
}
