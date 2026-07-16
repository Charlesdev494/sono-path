import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { QUIZ, type QuizNivel, type QuizLetra } from "@/content/quiz";
import { useProfile } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Brain, Sparkles, GraduationCap, Award } from "lucide-react";

export const Route = createFileRoute("/_app/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz Diário · US360" },
      { name: "description", content: "Quiz de imagens em sonoanatomia." },
    ],
  }),
  component: QuizPage,
});


function QuizPage() {
  const { profile, loaded, update, addPontos, marcarMissao } = useProfile();
  const navigate = useNavigate();
  const [nivel, setNivel] = useState<QuizNivel>("basico");
  const [regiao, setRegiao] = useState<string>("Todas");
  const [chosen, setChosen] = useState<QuizLetra | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 9973));

  useEffect(() => {
    if (loaded && !profile) navigate({ to: "/onboarding" });
  }, [loaded, profile, navigate]);

  const hojeIds = profile?.quizzesHoje.ids ?? [];

  const regioesDisponiveis = useMemo(() => {
    const set = new Set(QUIZ.filter((q) => q.nivel === nivel).map((q) => q.regiao));
    return ["Todas", ...Array.from(set).sort()];
  }, [nivel]);

  // q depende apenas de seedBase + round + nivel + regiao — não muda ao responder
  const q = useMemo(() => {
    const filtradas = QUIZ.filter(
      (item) => item.nivel === nivel && (regiao === "Todas" || item.regiao === regiao),
    );
    const base = filtradas.length > 0 ? filtradas : QUIZ.filter((i) => i.nivel === nivel);
    const original = base[(seedBase + round) % base.length];
    // Embaralhamento determinístico das alternativas para evitar viés de letra
    const letras: QuizLetra[] = ["A", "B", "C", "D", "E"];
    let seed = 0;
    const key = `${original.id}|${round}|${seedBase}`;
    for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
    const indices = original.alternativas.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const novasAlts = indices.map((origIdx, newIdx) => ({
      letra: letras[newIdx],
      texto: original.alternativas[origIdx].texto,
      _origLetra: original.alternativas[origIdx].letra,
    }));
    const novaCorreta =
      novasAlts.find((a) => a._origLetra === original.correta)?.letra ?? original.correta;
    return {
      ...original,
      alternativas: novasAlts.map(({ letra, texto }) => ({ letra, texto })),
      correta: novaCorreta,
    };
  }, [round, nivel, regiao, seedBase]);


  if (!profile) return null;

  const pontosAcerto = nivel === "avancado" ? 30 : 20;
  const pontosErro = nivel === "avancado" ? 10 : 5;

  const responder = (letra: QuizLetra) => {
    if (revealed) return;
    setChosen(letra);
    setRevealed(true);
    const acertou = letra === q.correta;
    update((p) => ({
      ...p,
      quizzesRespondidos: [...p.quizzesRespondidos, q.id],
      quizzesHoje: {
        dateISO: new Date().toISOString().slice(0, 10),
        ids: [...p.quizzesHoje.ids, q.id],
      },
    }));
    addPontos(acertou ? pontosAcerto : pontosErro);
    marcarMissao("quiz");
  };

  const proximo = () => {
    setChosen(null);
    setRevealed(false);
    setRound((r) => r + 1);
  };

  const trocarNivel = (n: QuizNivel) => {
    if (n === nivel) return;
    setNivel(n);
    setRegiao("Todas");
    setChosen(null);
    setRevealed(false);
    setRound((r) => r + 1);
  };

  const trocarRegiao = (r: string) => {
    if (r === regiao) return;
    setRegiao(r);
    setChosen(null);
    setRevealed(false);
    setRound((x) => x + 1);
  };


  return (
    <div className="flex flex-col gap-4 px-5 pb-8 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Quiz Diário</h1>
          <p className="text-sm text-muted-foreground">
            Respondidos hoje: {hojeIds.length}
          </p>
        </div>
        <div className="rounded-full bg-warm/20 p-2.5 text-warm">
          <Brain className="size-5" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-1">
        <button
          onClick={() => trocarNivel("basico")}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            nivel === "basico"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <GraduationCap className="size-4" />
          Básico
          <span className="text-[10px] font-normal opacity-70">+20</span>
        </button>
        <button
          onClick={() => trocarNivel("avancado")}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            nivel === "avancado"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Award className="size-4" />
          Avançado
          <span className="text-[10px] font-normal opacity-70">+30</span>
        </button>
      </div>

      <div className="-mx-5 overflow-x-auto px-5">
        <div className="flex gap-2 pb-1">
          {regioesDisponiveis.map((r) => (
            <button
              key={r}
              onClick={() => trocarRegiao(r)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                regiao === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>



      <Card className="overflow-hidden p-0">
        {q.imagemUrl && (
          <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 text-xs uppercase tracking-widest text-white/70">
            <img src={q.imagemUrl} alt={q.imagemLabel} className="size-full object-contain" />
            <div className="absolute left-3 top-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
              US · {q.imagemLabel}
            </div>
          </div>
        )}
        <div className="p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <Badge variant="secondary">{q.regiao}</Badge>
            {q.nivel === "avancado" && (
              <Badge className="bg-primary/15 text-primary">Avançado</Badge>
            )}
          </div>
          {q.caso && (
            <p className="mb-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Caso: </span>{q.caso}
            </p>
          )}
          <p className="font-medium">{q.enunciado}</p>
        </div>
      </Card>

      <div className="space-y-2">
        {q.alternativas.map((a) => {
          const isCorreta = a.letra === q.correta;
          const isChosen = chosen === a.letra;
          let style = "border bg-card hover:bg-accent";
          if (revealed && isCorreta) style = "border-success bg-success/15";
          else if (revealed && isChosen && !isCorreta)
            style = "border-destructive bg-destructive/10";
          return (
            <button
              key={a.letra}
              onClick={() => responder(a.letra)}
              disabled={revealed}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${style}`}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-sm font-bold">
                {a.letra}
              </span>
              <span className="flex-1 text-sm">{a.texto}</span>
              {revealed && isCorreta && <Check className="size-5 text-success" />}
              {revealed && isChosen && !isCorreta && (
                <X className="size-5 text-destructive" />
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <Card className="border-primary/30 bg-primary/5 p-4">
          <div className="mb-1 flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <p className="text-sm font-semibold">
              {chosen === q.correta
                ? `+${pontosAcerto} pontos · resposta correta`
                : `+${pontosErro} pontos · resposta incorreta`}
            </p>
          </div>
          <p className="text-sm text-foreground/80">{q.explicacao}</p>
          <Button className="mt-3 w-full" onClick={proximo}>
            Próxima pergunta
          </Button>
        </Card>
      )}
    </div>
  );
}
