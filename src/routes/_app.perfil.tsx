import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Flame, MapPin, Briefcase, Trophy, LogOut, Trash2, Loader2 } from "lucide-react";

import { sair, useAuth, useProfile } from "@/lib/auth";
import { atlasQueryOptions, casosQueryOptions, quizQueryOptions } from "@/lib/data/content";
import {
  calcularNivel,
  NIVEIS,
  progressQueryOptions,
  respostasQueryOptions,
} from "@/lib/data/progress";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/_app/perfil")({
  head: () => ({
    meta: [{ title: "Perfil · US360" }],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: progress } = useQuery(progressQueryOptions(user?.id));
  const { data: respostas } = useQuery(respostasQueryOptions(user?.id));
  const { data: atlas } = useQuery(atlasQueryOptions());
  const { data: quiz } = useQuery(quizQueryOptions());
  const { data: casos } = useQuery(casosQueryOptions());
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!profile) return null;

  const pontos = progress?.pontos ?? 0;
  const nivel = calcularNivel(pontos);
  const totalEstruturas = atlas?.reduce((acc, r) => acc + r.estruturas.length, 0) ?? 0;

  // atlas_visitados também guarda as marcas de caso concluído ("caso:<id>"),
  // então filtramos para o contador de estruturas não inflar.
  const estruturasVistas =
    progress?.atlas_visitados.filter((v) => !v.startsWith("caso:")).length ?? 0;
  const casosFeitos =
    progress?.atlas_visitados.filter((v) => v.startsWith("caso:")).length ?? 0;
  const quizRespondidos = respostas?.filter((r) => r.quiz_question_id).length ?? 0;

  async function excluirConta() {
    setExcluindo(true);
    setErro(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      setExcluindo(false);
      setErro("Não foi possível excluir a conta agora. Tente novamente em instantes.");
      return;
    }
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

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
              {pontos} pts
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Flame className="size-3" />
              {progress?.streak ?? 0}d
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
        <Stat label="Atlas" value={`${estruturasVistas}/${totalEstruturas}`} />
        <Stat label="Quiz" value={`${quizRespondidos}/${quiz?.length ?? 0}`} />
        <Stat label="Casos" value={`${casosFeitos}/${casos?.length ?? 0}`} />
      </div>

      <Card className="p-4">
        <h2 className="mb-3 font-display font-semibold">Dados</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" /> {profile.cidade}
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="size-4" /> {profile.tempo_formado} anos de formado
          </li>
          <li className="text-muted-foreground">
            Ultrassom: {profile.tem_us ? "Sim" : "Não"} · Dor:{" "}
            {profile.trabalha_dor ? "Sim" : "Não"}
          </li>
        </ul>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 font-display font-semibold">Mapa de carreira</h2>
        <ul className="space-y-1.5">
          {NIVEIS.map((n) => {
            const alcancado = pontos >= n.min;
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

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={async () => {
            await sair();
            navigate({ to: "/login" });
          }}
        >
          <LogOut className="mr-2 size-4" />
          Sair da conta
        </Button>

        {/* Exigido pela Google Play e pela App Store: quem cria conta precisa
            conseguir excluí-la dentro do app. */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 size-4" />
              Excluir minha conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
              <AlertDialogDescription>
                Sua conta e todo o seu progresso — {pontos} pontos, {progress?.streak ?? 0}{" "}
                dias de sequência e o histórico de respostas — serão apagados
                definitivamente. Não há como desfazer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={excluirConta}
                disabled={excluindo}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {excluindo && <Loader2 className="mr-2 size-4 animate-spin" />}
                Excluir definitivamente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p className="text-center text-xs text-muted-foreground">US360 · v2</p>
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
