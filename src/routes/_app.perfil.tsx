import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { calcularNivel, clearProfile, NIVEIS, useProfile } from "@/lib/profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ATLAS } from "@/content/atlas";
import { QUIZ } from "@/content/quiz";
import { CASOS } from "@/content/casos";
import { Flame, MapPin, Briefcase, RotateCcw, Trophy } from "lucide-react";

export const Route = createFileRoute("/_app/perfil")({
  head: () => ({
    meta: [{ title: "Perfil · US360" }],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  if (!profile) return null;
  const nivel = calcularNivel(profile.pontos);
  const totalEstruturas = ATLAS.reduce((acc, r) => acc + r.estruturas.length, 0);

  const resetar = () => {
    if (confirm("Tem certeza que deseja resetar todo seu progresso?")) {
      clearProfile();
      navigate({ to: "/onboarding" });
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-8">
      <header className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-2xl font-bold text-primary-foreground">
          {(profile.nome[0] ?? "?").toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">{profile.nome}</h1>
          <p className="text-sm text-muted-foreground">{profile.especialidade}</p>
        </div>
      </header>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Nível {nivel.nivel}
            </p>
            <p className="font-display text-lg font-semibold">{nivel.nome}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Trophy className="size-3" />
              {profile.pontos} pts
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Flame className="size-3" />
              {profile.streak}d
            </Badge>
          </div>
        </div>
        <Progress value={nivel.progresso} className="h-2" />
        {nivel.proximo && (
          <p className="mt-2 text-xs text-muted-foreground">
            Faltam {nivel.faltam} pts para {nivel.proximo.nome}
          </p>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Atlas" value={`${profile.atlasVisitados.length}/${totalEstruturas}`} />
        <Stat label="Quiz" value={`${profile.quizzesRespondidos.length}/${QUIZ.length}`} />
        <Stat label="Casos" value={`${profile.casosRespondidos.length}/${CASOS.length}`} />
      </div>

      <Card className="p-4">
        <h2 className="mb-3 font-display font-semibold">Dados</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" /> {profile.cidade}
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="size-4" /> {profile.tempoFormado} anos de formado
          </li>
          <li className="text-muted-foreground">
            Ultrassom: {profile.temUS ? "Sim" : "Não"} · Dor:{" "}
            {profile.trabalhaDor ? "Sim" : "Não"}
          </li>
        </ul>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 font-display font-semibold">Mapa de carreira</h2>
        <ul className="space-y-1.5">
          {NIVEIS.map((n) => {
            const alcancado = profile.pontos >= n.min;
            const atual = nivel.nivel === n.nivel;
            return (
              <li
                key={n.nivel}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                  atual
                    ? "bg-primary/10 font-semibold text-primary"
                    : alcancado
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                <span>
                  {n.nivel}. {n.nome}
                </span>
                <span className="text-xs">{n.min}+ pts</span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Button variant="outline" onClick={resetar} className="text-destructive">
        <RotateCcw className="mr-2 size-4" />
        Resetar progresso
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        US360 · MVP v0.1
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
    </Card>
  );
}
