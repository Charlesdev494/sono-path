import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { findRegion, findStructure } from "@/content/atlas";
import { useProfile } from "@/lib/profile";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_app/atlas/$region/$structure")({
  head: ({ params }) => ({
    meta: [{ title: `${params.structure} · Atlas` }],
  }),
  component: StructurePage,
  notFoundComponent: () => (
    <div className="p-6 text-center text-muted-foreground">Estrutura não encontrada.</div>
  ),
});

function StructurePage() {
  const { region, structure } = Route.useParams();
  const r = findRegion(region);
  const s = findStructure(region, structure);
  const { update, marcarMissao, addPontos } = useProfile();

  useEffect(() => {
    if (!s) return;
    const key = `${region}/${structure}`;
    update((p) => {
      if (p.atlasVisitados.includes(key)) return p;
      return { ...p, atlasVisitados: [...p.atlasVisitados, key] };
    });
    marcarMissao("atlas");
    addPontos(5);
  }, [region, structure, s, update, marcarMissao, addPontos]);

  if (!r || !s) throw notFound();

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
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {r.nome}
        </p>
        <h1 className="font-display text-2xl font-bold">{s.nome}</h1>
      </header>

      {/* Side-by-side comparisons (raw vs annotated) */}
      {s.comparacoes && s.comparacoes.length > 0 && (
        <div className="flex flex-col gap-4">
          {s.comparacoes.map((pair, i) => (
            <figure key={i} className="overflow-hidden rounded-xl border bg-black">
              <div className="grid grid-cols-2 gap-0.5 bg-white/10">
                <div className="flex flex-col">
                  <img src={pair.raw.url} alt={pair.raw.legenda} className="w-full" loading="lazy" />
                  <span className="px-2 py-1 text-[10px] uppercase tracking-wider text-white/80">
                    {pair.raw.legenda}
                  </span>
                </div>
                <div className="flex flex-col">
                  <img src={pair.anotada.url} alt={pair.anotada.legenda} className="w-full" loading="lazy" />
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

      {/* Image gallery */}
      {s.imagens && s.imagens.length > 0 ? (
        <div className="flex flex-col gap-3">
          {s.imagens.map((img, i) => (
            <figure key={i} className="overflow-hidden rounded-xl border bg-black">
              <img
                src={img.url}
                alt={img.legenda}
                className="w-full"
                loading="lazy"
              />
              <figcaption className="px-3 py-2 text-xs text-white">
                {img.legenda}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        !s.comparacoes?.length && (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-muted text-xs uppercase tracking-widest text-muted-foreground">
            Imagem ultrassonográfica · placeholder
          </div>
        )
      )}

      <Section title="Anatomia">{s.anatomia}</Section>
      <Section title="Sonoanatomia">{s.sonoanatomia}</Section>
      <BulletSection title="Dicas de escaneamento" items={s.escaneamento} />
      <BulletSection title="Armadilhas" items={s.armadilhas}>
        {s.armadilhaImagem && (
          <figure className="mt-3 overflow-hidden rounded-xl border bg-black">
            <img
              src={s.armadilhaImagem.url}
              alt={s.armadilhaImagem.legenda}
              className="w-full"
              loading="lazy"
            />
            <figcaption className="px-3 py-2 text-xs leading-relaxed text-white">
              {s.armadilhaImagem.legenda}
            </figcaption>
          </figure>
        )}
        {s.armadilhaImagens?.map((img, i) => (
          <figure key={i} className="mt-3 overflow-hidden rounded-xl border bg-black">
            <img
              src={img.url}
              alt={img.legenda}
              className="w-full"
              loading="lazy"
            />
            <figcaption className="px-3 py-2 text-xs leading-relaxed text-white">
              {img.legenda}
            </figcaption>
          </figure>
        ))}
      </BulletSection>
      <BulletSection title="Aplicações clínicas" items={s.aplicacoesClinicas} />
      {s.volumes && s.volumes.length > 0 && (
        <BulletSection title="Volumes" items={s.volumes} />
      )}
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
