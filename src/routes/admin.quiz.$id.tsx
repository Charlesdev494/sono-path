import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { ChevronLeft, Plus, Trash2, Check, Loader2, Eye, Copy, Sparkles } from "lucide-react";

import { CampoImagem } from "@/components/admin/CampoImagem";
import { GerarQuestaoComIA } from "@/components/admin/GerarComIA";
import {
  adminQuizQueryOptions,
  regioesQueryOptions,
  useDuplicarQuiz,
  useExcluirQuiz,
  useSalvarQuiz,
  type Alternativa,
} from "@/lib/data/admin";

export const Route = createFileRoute("/admin/quiz/$id")({
  component: AdminQuizEditor,
});

const LETRAS = ["A", "B", "C", "D", "E"];

type Form = {
  slug: string;
  regiao: string;
  nivel: "basico" | "avancado";
  enunciado: string;
  caso: string;
  imagem_label: string;
  imagem_url: string | null;
  alternativas: Alternativa[];
  correta: string;
  explicacao: string;
  status: "rascunho" | "publicado";
  // Marca a procedência do conteúdo. Vira 'ia' quando o rascunho saiu do
  // copiloto — fica visível na lista e no banco, para nunca se perder de vista
  // o que foi escrito por máquina.
  origem: "manual" | "ia";
};

const VAZIO: Form = {
  slug: "",
  regiao: "",
  nivel: "basico",
  enunciado: "",
  caso: "",
  imagem_label: "",
  imagem_url: null,
  alternativas: [
    { letra: "A", texto: "" },
    { letra: "B", texto: "" },
    { letra: "C", texto: "" },
    { letra: "D", texto: "" },
  ],
  correta: "A",
  explicacao: "",
  status: "rascunho",
  origem: "manual",
};

function AdminQuizEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const nova = id === "nova";

  const { data: existente, isLoading } = useQuery({
    ...adminQuizQueryOptions(id),
    enabled: !nova,
  });
  const { data: regioes } = useQuery(regioesQueryOptions());
  const salvar = useSalvarQuiz();
  const excluir = useExcluirQuiz();
  const duplicar = useDuplicarQuiz();

  const [form, setForm] = useState<Form>(VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (!existente) return;
    setForm({
      slug: existente.slug,
      regiao: existente.regiao,
      nivel: existente.nivel,
      enunciado: existente.enunciado,
      caso: existente.caso ?? "",
      imagem_label: existente.imagem_label ?? "",
      imagem_url: existente.imagem_url,
      alternativas: Array.isArray(existente.alternativas)
        ? (existente.alternativas as Alternativa[])
        : [],
      correta: existente.correta,
      explicacao: existente.explicacao,
      status: existente.status,
      origem: existente.origem,
    });
  }, [existente]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSalvo(false);
  };

  const setAlt = (i: number, texto: string) => {
    setForm((f) => ({
      ...f,
      alternativas: f.alternativas.map((a, j) => (j === i ? { ...a, texto } : a)),
    }));
    setSalvo(false);
  };

  const addAlt = () => {
    if (form.alternativas.length >= 5) return;
    setForm((f) => ({
      ...f,
      alternativas: [...f.alternativas, { letra: LETRAS[f.alternativas.length], texto: "" }],
    }));
  };

  const removerAlt = (i: number) => {
    setForm((f) => {
      const restantes = f.alternativas
        .filter((_, j) => j !== i)
        // As letras são reatribuídas por posição: sem isso sobraria um buraco
        // (A, C, D) e a letra correta poderia apontar para o vazio.
        .map((a, j) => ({ ...a, letra: LETRAS[j] }));
      const corretaSumiu = !restantes.some((a) => a.letra === f.correta);
      return {
        ...f,
        alternativas: restantes,
        correta: corretaSumiu ? (restantes[0]?.letra ?? "A") : f.correta,
      };
    });
    setSalvo(false);
  };

  function validar(): string | null {
    if (!form.enunciado.trim()) return "Escreva o enunciado da questão.";
    if (!form.regiao.trim()) return "Informe a região anatômica.";
    if (form.alternativas.length < 2) return "A questão precisa de pelo menos 2 alternativas.";
    if (form.alternativas.some((a) => !a.texto.trim()))
      return "Preencha o texto de todas as alternativas (ou remova as que não usar).";
    if (!form.alternativas.some((a) => a.letra === form.correta))
      return "Marque qual alternativa é a correta.";
    if (form.status === "publicado" && !form.explicacao.trim())
      return "Escreva a explicação antes de publicar — é o que o aluno lê depois de responder.";
    return null;
  }

  async function gravar(novoStatus?: "rascunho" | "publicado") {
    const dados = { ...form, status: novoStatus ?? form.status };
    const problema = (() => {
      const f = form;
      if (novoStatus === "publicado" && !f.explicacao.trim())
        return "Escreva a explicação antes de publicar — é o que o aluno lê depois de responder.";
      return validar();
    })();
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);

    try {
      const salvoRow = await salvar.mutateAsync({
        id: nova ? undefined : id,
        slug: dados.slug || `q-${Date.now().toString(36)}`,
        regiao: dados.regiao.trim(),
        nivel: dados.nivel,
        enunciado: dados.enunciado.trim(),
        caso: dados.caso.trim() || null,
        imagem_label: dados.imagem_label.trim() || null,
        imagem_url: dados.imagem_url,
        alternativas: dados.alternativas,
        correta: dados.correta,
        explicacao: dados.explicacao.trim(),
        status: dados.status,
        origem: dados.origem,
      });
      setForm((f) => ({ ...f, status: dados.status }));
      setSalvo(true);
      if (nova) navigate({ to: "/admin/quiz/$id", params: { id: salvoRow.id } });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  }

  if (!nova && isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!nova && !existente) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Questão não encontrada.{" "}
        <Link to="/admin/quiz" className="text-primary underline">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/admin/quiz"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Quiz
        </Link>
        <div className="flex items-center gap-2">
          {form.origem === "ia" && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="size-3" />
              Rascunho de IA
            </Badge>
          )}
          {form.status === "publicado" ? (
            <Badge className="bg-success/20 text-success hover:bg-success/20">No ar</Badge>
          ) : (
            <Badge variant="secondary">Rascunho</Badge>
          )}
          {salvo && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Check className="size-3.5" />
              Salvo
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* editor */}
        <div className="flex flex-col gap-4">
          {/* Some por completo quando não há chave de IA no servidor. */}
          <GerarQuestaoComIA
            regiao={form.regiao}
            nivel={form.nivel}
            onGerado={(r) => {
              setForm((f) => ({
                ...f,
                enunciado: r.enunciado,
                alternativas: r.alternativas,
                correta: r.correta,
                explicacao: r.explicacao,
                imagem_label: r.imagem_label || f.imagem_label,
                // Nasce como rascunho de IA e assim fica registrado. Só sai do
                // ar de "rascunho" quando o Charles clicar em Publicar.
                origem: "ia",
                status: "rascunho",
              }));
              setSalvo(false);
              setErro(null);
            }}
          />

          <Card className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="enunciado">Enunciado</Label>
              <Textarea
                id="enunciado"
                value={form.enunciado}
                onChange={(e) => set("enunciado", e.target.value)}
                placeholder="O que o aluno precisa responder?"
                rows={3}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="regiao">Região anatômica</Label>
                <Input
                  id="regiao"
                  list="regioes-existentes"
                  value={form.regiao}
                  onChange={(e) => set("regiao", e.target.value)}
                  placeholder="Ex: Ombro"
                />
                {/* sugere o que já existe para não criar "Ombro" e "ombro" */}
                <datalist id="regioes-existentes">
                  {regioes?.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nivel">Nível</Label>
                <select
                  id="nivel"
                  value={form.nivel}
                  onChange={(e) => set("nivel", e.target.value as Form["nivel"])}
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                >
                  <option value="basico">Básico (vale 20 pontos)</option>
                  <option value="avancado">Avançado (vale 30 pontos)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="caso">Contexto clínico (opcional)</Label>
              <Textarea
                id="caso"
                value={form.caso}
                onChange={(e) => set("caso", e.target.value)}
                placeholder="Ex: Mulher, 38 anos, dor plantar há 3 meses..."
                rows={2}
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-3 p-4">
            <CampoImagem
              url={form.imagem_url}
              onChange={(u) => set("imagem_url", u)}
              label="Imagem de ultrassom (opcional)"
            />
            {form.imagem_url && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="imagem_label">Legenda da imagem</Label>
                <Input
                  id="imagem_label"
                  value={form.imagem_label}
                  onChange={(e) => set("imagem_label", e.target.value)}
                  placeholder="Ex: Ombro · Longitudinal anterior"
                />
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <Label>Alternativas</Label>
              <p className="text-xs text-muted-foreground">Clique no círculo para marcar a certa</p>
            </div>

            <div className="flex flex-col gap-2">
              {form.alternativas.map((a, i) => {
                const correta = a.letra === form.correta;
                return (
                  <div key={a.letra} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => set("correta", a.letra)}
                      aria-label={`Marcar ${a.letra} como correta`}
                      aria-pressed={correta}
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                        correta
                          ? "border-success bg-success text-success-foreground"
                          : "border-border hover:border-success"
                      }`}
                    >
                      {correta ? <Check className="size-4" /> : a.letra}
                    </button>
                    <Input
                      value={a.texto}
                      onChange={(e) => setAlt(i, e.target.value)}
                      placeholder={`Alternativa ${a.letra}`}
                    />
                    {form.alternativas.length > 2 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removerAlt(i)}
                        aria-label={`Remover alternativa ${a.letra}`}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {form.alternativas.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAlt}
                className="self-start"
              >
                <Plus className="mr-1.5 size-3.5" />
                Adicionar alternativa
              </Button>
            )}
          </Card>

          <Card className="flex flex-col gap-1.5 p-4">
            <Label htmlFor="explicacao">Explicação</Label>
            <p className="text-xs text-muted-foreground">
              Aparece depois que o aluno responde. É o momento em que ele aprende.
            </p>
            <Textarea
              id="explicacao"
              value={form.explicacao}
              onChange={(e) => set("explicacao", e.target.value)}
              rows={4}
              placeholder="Por que essa é a resposta certa?"
            />
          </Card>

          {erro && (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {erro}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => gravar()} disabled={salvar.isPending}>
              {salvar.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Salvar
            </Button>

            {form.status === "rascunho" ? (
              <Button
                variant="default"
                onClick={() => gravar("publicado")}
                disabled={salvar.isPending}
              >
                Publicar
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => gravar("rascunho")}
                disabled={salvar.isPending}
              >
                Tirar do ar
              </Button>
            )}

            <Button variant="outline" onClick={() => setPreview((p) => !p)}>
              <Eye className="mr-1.5 size-4" />
              {preview ? "Ocultar" : "Ver como o aluno vê"}
            </Button>

            {!nova && existente && (
              <>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const copia = await duplicar.mutateAsync(existente);
                    navigate({ to: "/admin/quiz/$id", params: { id: copia.id } });
                  }}
                  disabled={duplicar.isPending}
                >
                  <Copy className="mr-1.5 size-4" />
                  Duplicar
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="mr-1.5 size-4" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir esta questão?</AlertDialogTitle>
                      <AlertDialogDescription>
                        A questão e o histórico de respostas dos alunos a ela serão apagados. Não há
                        como desfazer. Se a intenção é só tirá-la do ar, use "Tirar do ar" — assim
                        ela some para os alunos mas continua aqui.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          await excluir.mutateAsync(id);
                          navigate({ to: "/admin/quiz" });
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir definitivamente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {/* preview */}
        {preview && (
          <div className="lg:sticky lg:top-4 lg:self-start">
            <PreviewAluno form={form} />
          </div>
        )}
      </div>
    </div>
  );
}

// Renderiza a questão do jeito que ela aparece no app do aluno. Usa os mesmos
// componentes e classes da tela real (_app.quiz.tsx) — um preview que não é
// fiel é pior que nenhum, porque dá confiança falsa.
function PreviewAluno({ form }: { form: Form }) {
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const revelado = escolhida !== null;
  const pontos = form.nivel === "avancado" ? 30 : 20;
  const pontosErro = form.nivel === "avancado" ? 10 : 5;
  const acertou = escolhida === form.correta;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b bg-muted/50 px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">Como o aluno vê</p>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {form.imagem_url && (
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 to-slate-700">
            <img src={form.imagem_url} alt="" className="size-full object-contain" />
            {form.imagem_label && (
              <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                US · {form.imagem_label}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Badge variant="secondary">{form.regiao || "Região"}</Badge>
          {form.nivel === "avancado" && (
            <Badge className="bg-primary/15 text-primary">Avançado</Badge>
          )}
        </div>

        {form.caso && (
          <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Caso: </span>
            {form.caso}
          </p>
        )}

        <p className="font-medium">{form.enunciado || "(sem enunciado)"}</p>

        <div className="flex flex-col gap-2">
          {form.alternativas.map((a) => {
            const eCorreta = a.letra === form.correta;
            const eEscolhida = escolhida === a.letra;
            let style = "border bg-card hover:bg-accent";
            if (revelado && eCorreta) style = "border-success bg-success/15";
            else if (revelado && eEscolhida && !eCorreta)
              style = "border-destructive bg-destructive/10";
            return (
              <button
                key={a.letra}
                onClick={() => setEscolhida(a.letra)}
                disabled={revelado}
                className={`flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition-colors ${style}`}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-bold">
                  {a.letra}
                </span>
                <span className="flex-1 text-sm">
                  {a.texto || `(alternativa ${a.letra} vazia)`}
                </span>
              </button>
            );
          })}
        </div>

        {revelado && (
          <Card className="border-primary/30 bg-primary/5 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-primary">
              <Sparkles className="size-3.5" />
              <p className="text-xs font-semibold">
                +{acertou ? pontos : pontosErro} pontos ·{" "}
                {acertou ? "resposta correta" : "resposta incorreta"}
              </p>
            </div>
            <p className="text-sm text-foreground/80">
              {form.explicacao || "(sem explicação — o aluno não vai entender por quê)"}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              onClick={() => setEscolhida(null)}
            >
              Testar de novo
            </Button>
          </Card>
        )}
      </div>
    </Card>
  );
}
