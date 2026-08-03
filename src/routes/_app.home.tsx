import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Star,
  Brain,
  Stethoscope,
  BookOpen,
  Check,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import { InstalarApp } from "@/components/InstalarApp";
import { AtivarNotificacoes } from "@/components/AtivarNotificacoes";
import { useAuth, useProfile } from "@/lib/auth";
import { calcularNivel, missoesDeHoje, progressQueryOptions } from "@/lib/data/progress";
import { atlasQueryOptions } from "@/lib/data/content";

export const Route = createFileRoute("/_app/home")({
  head: () => ({
    meta: [
      { title: "Início · US360" },
      { name: "description", content: "Sua missão diária de aprendizado." },
    ],
  }),
  component: Home,
});

function Home() {
  const { user } = useAuth();
  const { profile, isAdmin } = useProfile();
  const { data: progress } = useQuery(progressQueryOptions(user?.id));
  const { data: atlas } = useQuery(atlasQueryOptions());

  if (!profile) return null;

  const pontos = progress?.pontos ?? 0;
  const nivel = calcularNivel(pontos);
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const missoes = missoesDeHoje(progress ?? null);

  const totalEstruturas = atlas?.reduce((n, r) => n + r.estruturas.length, 0) ?? 0;

  // O Atlas era também um "Atalho" logo abaixo — a mesma porta duas vezes na
  // mesma tela. Virou missão única, e os números do banco que davam contexto
  // ao atalho vieram junto para não se perderem.
  const ms = [
    { id: "quiz", label: "Quiz diário", to: "/quiz", icon: Brain, detalhe: undefined },
    { id: "caso", label: "Caso clínico", to: "/caso", icon: Stethoscope, detalhe: undefined },
    {
      id: "atlas",
      label: "Atlas de Sonoanatomia",
      to: "/atlas",
      icon: BookOpen,
      detalhe: atlas?.length
        ? `${atlas.length} regiões · ${totalEstruturas} estruturas`
        : undefined,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-5 px-5 pt-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{saudacao},</p>
          <h1 className="text-2xl font-bold">Dr. {profile.nome.split(" ")[0] || "Colega"}</h1>
        </div>
        {/* Só o Charles vê este atalho. Esconder não é a proteção — a RLS é;
            isto é só para não mostrar uma porta que não abre. */}
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-medium transition-colors hover:bg-accent"
          >
            <ShieldCheck className="size-4" />
            Admin
          </Link>
        )}
      </header>

      {/* Só aparece se der para instalar e a pessoa ainda não instalou. */}
      <InstalarApp />
      {/* Só aparece se o push estiver ligado no servidor e a pessoa ainda não
          decidiu. */}
      <AtivarNotificacoes />

      {/* Stats card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary-glow p-5 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">Nível atual</p>
            <p className="font-display text-xl font-semibold">
              {nivel.nivel}. {nivel.nome}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-warm px-3 py-1 text-warm-foreground">
            <Flame className="size-4" />
            <span className="text-sm font-semibold">{progress?.streak ?? 0}d</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs opacity-90">
            <span>{pontos} pts</span>
            {nivel.proximo && (
              <span>
                {nivel.faltam} pts para {nivel.proximo.nome}
              </span>
            )}
          </div>
          <Progress
            value={nivel.progresso}
            className="h-2 bg-primary-foreground/20 [&>div]:bg-warm"
          />
        </div>
      </Card>

      {/* Missions */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Missão de hoje</h2>
          <Badge variant="secondary" className="gap-1">
            <Star className="size-3" />
            {missoes.length}/3
          </Badge>
        </div>
        <div className="space-y-2">
          {ms.map((m) => {
            const done = missoes.includes(m.id);
            return (
              <Link
                key={m.id}
                to={m.to}
                className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-lg ${
                    done
                      ? "bg-success text-success-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {done ? <Check className="size-5" /> : <m.icon className="size-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {done ? "Concluído" : (m.detalhe ?? "Toque para começar")}
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </section>

      <Link
        to="/suporte"
        className="pb-2 text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        Ajuda e suporte
      </Link>
    </div>
  );
}
