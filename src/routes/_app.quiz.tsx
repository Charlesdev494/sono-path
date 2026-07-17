import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Brain,
  Sparkles,
  GraduationCap,
  Award,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { quizQueryOptions, type QuizLetra } from "@/lib/data/content";
import {
  respostasQueryOptions,
  useMarcarMissao,
  useRegistrarResposta,
} from "@/lib/data/progress";

type QuizNivel = "basico" | "avancado";

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
  const { user } = useAuth();
  const { data: QUIZ, isLoading, error } = useQuery(quizQueryOptions());
  const { data: respostas } = useQuery(respostasQueryOptions(user?.id));
  const registrar = useRegistrarResposta();
  const marcarMissao = useMarcarMissao();

  const [nivel, setNivel] = useState<QuizNivel>("basico");
  const [regiao, setRegiao] = useState<string>("Todas");
  const [chosen, setChosen] = useState<QuizLetra | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 9973));

  const regioesDisponiveis = useMemo(() => {
    if (!QUIZ) return ["Todas"];
    const set = new Set(QUIZ.filter((q) => q.nivel === nivel).map((q) => q.regiao));
    return ["Todas", ...Array.from(set).sort()];
  }, [QUIZ, nivel]);

  // Embaralha as alternativas para evitar viés de letra. Guarda `letraOriginal`
  // em cada uma: a tela mostra a letra embaralhada, mas o servidor só conhece a
  // do banco — mandar a embaralhada faria todo acerto virar erro.
  const q = useMemo(() => {
    if (!QUIZ || QUIZ.length === 0) return null;
    const filtradas = QUIZ.filter(
      (item) => item.nivel === nivel && (regiao === "Todas" || item.regiao === regiao),
    );
    const base = filtradas.length > 0 ? filtradas : QUIZ.filter((i) => i.nivel === nivel);
    if (base.length === 0) return null;
    const original = base[(seedBase + round) % base.length];

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
      letraOriginal: original.alternativas[origIdx].letra,
    }));
    const novaCorreta =
      novasAlts.find((a) => a.letraOriginal === original.correta)?.letra ?? original.correta;

    return { ...original, alternativas: novasAlts, correta: novaCorreta };
  }, [QUIZ, round, nivel, regiao, seedBase]);

  const respondidasHoje = respostas?.filter((r) => r.quiz_question_id).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !q) {
    return (
      <div className="px-5 pt-8">
        <p className="text-sm text-muted-foreground">
          {error
            ? "Não foi possível carregar o quiz. Verifique sua conexão."
            : "Nenhuma questão disponível neste filtro."}
        </p>
      </div>
    );
  }

  const responder = async (letra: QuizLetra) => {
    if (revealed || registrar.isPending) return;
    setChosen(letra);
    setRevealed(true);

    const alt = q.alternativas.find((a) => a.letra === letra);
    if (!alt) return;

    try {
      // vai a letra original — a que o banco conhece
      await registrar.mutateAsync({
        origem: "quiz",
        questaoId: q.id,
        resposta: alt.letraOriginal,
      });
      await marcarMissao.mutateAsync("quiz");
    } catch {
      // A resposta já está na tela; se o registro falhar, o feedback continua
      // válido e a pontuação é recuperada quando a conexão voltar.
    }
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

  const acertou = chosen === q.correta;
  const pontosGanhos = registrar.data?.pontos_ganhos;

  return (
    <div className="flex flex-col gap-4 px-5 pb-8 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Quiz Diário</h1>
          <p className="text-sm text-muted-foreground">
            Respondidas: {respondidasHoje} de {QUIZ?.length ?? 0}
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
            <img
              src={q.imagemUrl}
              alt={q.imagemLabel ?? q.enunciado}
              className="size-full object-contain"
            />
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
              <span className="font-semibold text-foreground">Caso: </span>
              {q.caso}
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
              {/* pontos vêm do servidor: é ele quem decide quanto vale */}
              {pontosGanhos != null ? `+${pontosGanhos} pontos · ` : ""}
              {acertou ? "resposta correta" : "resposta incorreta"}
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
