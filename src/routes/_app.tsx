import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { useAuth, useProfile } from "@/lib/auth";
import { touchStreak } from "@/lib/data/progress";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const { user, pronto } = useAuth();
  const { profile, carregando } = useProfile();

  // Guard de navegação, não de segurança: o que realmente protege os dados é a
  // RLS no banco. Aqui é só para a pessoa não encarar uma tela vazia.
  useEffect(() => {
    if (!pronto) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!carregando && profile && !profile.onboarding_completo) {
      navigate({ to: "/onboarding" });
    }
  }, [pronto, user, profile, carregando, navigate]);

  // Mantém o streak de dias. Roda uma vez por montagem do layout; o banco
  // ignora repetição no mesmo dia, então chamar de novo é inofensivo.
  useEffect(() => {
    if (user) touchStreak().catch(() => {});
  }, [user]);

  if (!pronto || carregando || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}
