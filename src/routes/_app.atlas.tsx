import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/atlas")({
  head: () => ({
    meta: [
      { title: "Atlas · US360" },
      { name: "description", content: "Atlas de sonoanatomia musculoesquelética." },
    ],
  }),
  component: () => <Outlet />,
});
