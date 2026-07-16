import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}
