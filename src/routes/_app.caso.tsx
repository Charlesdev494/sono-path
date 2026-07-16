import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/caso")({
  head: () => ({
    meta: [
      { title: "Casos Clínicos · US360" },
      { name: "description", content: "Biblioteca de casos clínicos comentados." },
    ],
  }),
  component: () => <Outlet />,
});
