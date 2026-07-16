import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/atlas/$region")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.region} · Atlas` },
      { name: "description", content: `Estruturas de ${params.region}` },
    ],
  }),
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="p-6 text-center text-muted-foreground">Região não encontrada.</div>
  ),
});
