import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookOpen, Brain, Loader2, ShieldCheck, Stethoscope, ArrowLeft, Users } from "lucide-react";

import { useAuth, useProfile } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Administração · US360" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const { user, pronto } = useAuth();
  const { profile, carregando, isAdmin } = useProfile();

  // Guard de navegação. A proteção de verdade está na RLS: mesmo que alguém
  // force a URL, o banco não devolve nem aceita nada sem role='admin'.
  useEffect(() => {
    if (!pronto || carregando) return;
    if (!user) navigate({ to: "/login" });
    else if (profile && !isAdmin) navigate({ to: "/home" });
  }, [pronto, carregando, user, profile, isAdmin, navigate]);

  if (!pronto || carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold leading-tight">Administração</p>
              <p className="text-xs text-muted-foreground">{profile?.nome}</p>
            </div>
          </div>
          <Link
            to="/home"
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao app
          </Link>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3">
          <Aba to="/admin" icon={ShieldCheck} label="Visão geral" exata />
          <Aba to="/admin/alunos" icon={Users} label="Alunos" />
          <Aba to="/admin/quiz" icon={Brain} label="Quiz" />
          <Aba to="/admin/casos" icon={Stethoscope} label="Casos clínicos" />
          <Aba to="/admin/atlas" icon={BookOpen} label="Atlas" />
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <Outlet />
      </main>
    </div>
  );
}

function Aba({
  to,
  icon: Icon,
  label,
  exata,
}: {
  to: string;
  icon: typeof Brain;
  label: string;
  exata?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: exata }}
      className="flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:border-primary [&.active]:font-medium [&.active]:text-foreground"
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
