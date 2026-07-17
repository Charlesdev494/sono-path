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
import { ChevronLeft, Plus, Trash2, Check, Loader2 } from "lucide-react";

import { CampoImagem } from "@/components/admin/CampoImagem";
import {
  adminCasoQueryOptions,
  regioesQueryOptions,
  useExcluirCaso,
  useSalvarCaso,
  type Alternativa,
} from "@/lib/data/admin";

export const Route = createFileRoute("/admin/casos/$id")({
  component: AdminCasoEditor,
});

const LETRAS = ["A", "B", "C", "D", "E"];

type QuestaoForm = {
  id?: string;
  _novo?: boolean;
  slug: string;
  pergunta: string;
  alternativas: Alternativa[];
  correta: string;
  comentario: string;
  imagem_url: string | null;
  imagem_label: string;
};

function questaoVazia(i: number): QuestaoForm {
  return {
    _novo: true,
    slug: `q${i + 1}-${Date.now().toString(36)}`,
    pergunta: "",
    alternativas: [
      { letra: "A", texto: "" },
      { letra: "B", texto: "" },
      { letra: "C", texto: "" },
      { letra: "D", texto: "" },
    ],
    correta: "A",
    comentario: "",
    imagem_url: null,
    imagem_label: "",
  };
}

function AdminCasoEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const novo = id === "novo";

  const { data: existente, isLoading } = useQuery({
    ...adminCasoQueryOptions(id),
    enabled: !novo,
  });
  const { data: regioes } = useQuery(regioesQueryOptions());
  const salvar = useSalvarCaso();
  const excluir = useExcluirCaso();

  const [caso, setCaso] = useState({
    slug: "",
    titulo: "",
    regiao: "",
    semana: 0,
    apresentacao: "",
    exames_fisicos: "",
    resolucao: "",
    imagem_url: null as string | null,
    imagem_label: "",
    status: "rascunho" as "rascunho" | "publicado",
  });
  const [questoes, setQuestoes] = useState<QuestaoForm[]>([questaoVazia(0)]);
  const [removidas, setRemovidas] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (!existente) return;
    setCaso({
      slug: existente.slug,
      titulo: existente.titulo,
      regiao: existente.regiao,
      semana: existente.semana,
      apresentacao: existente.apresentacao,
      exames_fisicos: existente.exames_fisicos,
      resolucao: existente.resolucao,
      imagem_url: existente.imagem_url,
      imagem_label: existente.imagem_label ?? "",
      status: existente.status,
    });
    setQuestoes(
      existente.case_questions.map((q) => ({
        id: q.id,
        slug: q.slug,
        pergunta: q.pergunta,
        alternativas: Array.isArray(q.alternativas) ? (q.alternativas as Alternativa[]) : [],
        correta: q.correta,
        comentario: q.comentario,
        imagem_url: q.imagem_url,
        imagem_label: q.imagem_label ?? "",
      })),
    );
  }, [existente]);

  const setC = <K extends keyof typeof caso>(k: K, v: (typeof caso)[K]) => {
    setCaso((c) => ({ ...c, [k]: v }));
    setSalvo(false);
  };

  const setQ = (i: number, patch: Partial<QuestaoForm>) => {
    setQuestoes((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
    setSalvo(false);
  };

  const removerQuestao = (i: number) => {
    const q = questoes[i];
    if (q.id && !q._novo) setRemovidas((r) => [...r, q.id!]);
    setQuestoes((qs) => qs.filter((_, j) => j !== i));
    setSalvo(false);
  };

  function validar(status: "rascunho" | "publicado"): string | null {
    if (!caso.titulo.trim()) return "Dê um título ao caso.";
    if (!caso.regiao.trim()) return "Informe a região anatômica.";
    if (questoes.length === 0) return "O caso precisa de pelo menos uma pergunta.";
    for (const [i, q] of questoes.entries()) {
      if (!q.pergunta.trim()) return `Escreva a pergunta ${i + 1}.`;
      if (q.alternativas.length < 2)
        return `A pergunta ${i + 1} precisa de 2 alternativas ou mais.`;
      if (q.alternativas.some((a) => !a.texto.trim()))
        return `Preencha todas as alternativas da pergunta ${i + 1}.`;
      if (!q.alternativas.some((a) => a.letra === q.correta))
        return `Marque a alternativa correta da pergunta ${i + 1}.`;
    }
    if (status === "publicado") {
      if (!caso.apresentacao.trim()) return "Escreva a apresentação do caso antes de publicar.";
      if (!caso.resolucao.trim())
        return "Escreva a resolução comentada antes de publicar — é o fecho do aprendizado.";
    }
    return null;
  }

  async function gravar(novoStatus?: "rascunho" | "publicado") {
    const status = novoStatus ?? caso.status;
    const problema = validar(status);
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);

    try {
      const casoId = await salvar.mutateAsync({
        caso: {
          id: novo ? undefined : id,
          slug: caso.slug || `caso-${Date.now().toString(36)}`,
          titulo: caso.titulo.trim(),
          regiao: caso.regiao.trim(),
          semana: caso.semana,
          apresentacao: caso.apresentacao.trim(),
          exames_fisicos: caso.exames_fisicos.trim(),
          resolucao: caso.resolucao.trim(),
          imagem_url: caso.imagem_url,
          imagem_label: caso.imagem_label.trim() || null,
          status,
        },
        questoes,
        questoesRemovidas: removidas,
      });
      setCaso((c) => ({ ...c, status }));
      setRemovidas([]);
      setSalvo(true);
      if (novo) navigate({ to: "/admin/casos/$id", params: { id: casoId } });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
    }
  }

  if (!novo && isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!novo && !existente) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Caso não encontrado.{" "}
        <Link to="/admin/casos" className="text-primary underline">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/admin/casos"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Casos clínicos
        </Link>
        <div className="flex items-center gap-2">
          {caso.status === "publicado" ? (
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

      {/* As seções seguem a ordem do caso real: é assim que o aluno lê e é
          assim que faz sentido escrever. */}
      <Etapa numero={1} titulo="Identificação">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_120px]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={caso.titulo}
              onChange={(e) => setC("titulo", e.target.value)}
              placeholder="Ex: Dor plantar matinal em mulher de 38 anos"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="regiao-caso">Região</Label>
            <Input
              id="regiao-caso"
              list="regioes-caso"
              value={caso.regiao}
              onChange={(e) => setC("regiao", e.target.value)}
              placeholder="Ex: Tornozelo/Pé"
            />
            <datalist id="regioes-caso">
              {regioes?.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="semana">Semana</Label>
            <Input
              id="semana"
              type="number"
              min={0}
              value={caso.semana}
              onChange={(e) => setC("semana", Number(e.target.value))}
            />
          </div>
        </div>
      </Etapa>

      <Etapa numero={2} titulo="Apresentação">
        <div className="flex flex-col gap-3">
          <Textarea
            value={caso.apresentacao}
            onChange={(e) => setC("apresentacao", e.target.value)}
            rows={3}
            placeholder="Quem é o paciente e o que ele conta."
          />
          <div className="flex flex-col gap-1.5">
            <Label>Exame físico</Label>
            <Textarea
              value={caso.exames_fisicos}
              onChange={(e) => setC("exames_fisicos", e.target.value)}
              rows={2}
              placeholder="O que o exame revela."
            />
          </div>
          <CampoImagem
            url={caso.imagem_url}
            onChange={(u) => setC("imagem_url", u)}
            label="Imagem principal do caso (opcional)"
          />
          {caso.imagem_url && (
            <Input
              value={caso.imagem_label}
              onChange={(e) => setC("imagem_label", e.target.value)}
              placeholder="Legenda da imagem"
            />
          )}
        </div>
      </Etapa>

      <Etapa numero={3} titulo={`Perguntas (${questoes.length})`}>
        <div className="flex flex-col gap-3">
          {questoes.map((q, i) => (
            <Card key={q.id ?? q.slug} className="flex flex-col gap-3 border-dashed p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Pergunta {i + 1}</p>
                {questoes.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removerQuestao(i)}
                    aria-label={`Remover pergunta ${i + 1}`}
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                )}
              </div>

              <Textarea
                value={q.pergunta}
                onChange={(e) => setQ(i, { pergunta: e.target.value })}
                rows={2}
                placeholder="O que você quer perguntar?"
              />

              <CampoImagem
                url={q.imagem_url}
                onChange={(u) => setQ(i, { imagem_url: u })}
                label="Imagem desta pergunta (opcional)"
              />

              <div className="flex flex-col gap-2">
                {q.alternativas.map((a, ai) => {
                  const correta = a.letra === q.correta;
                  return (
                    <div key={a.letra} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQ(i, { correta: a.letra })}
                        aria-label={`Marcar ${a.letra} como correta na pergunta ${i + 1}`}
                        aria-pressed={correta}
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                          correta
                            ? "border-success bg-success text-success-foreground"
                            : "border-border hover:border-success"
                        }`}
                      >
                        {correta ? <Check className="size-3.5" /> : a.letra}
                      </button>
                      <Input
                        value={a.texto}
                        onChange={(e) =>
                          setQ(i, {
                            alternativas: q.alternativas.map((x, j) =>
                              j === ai ? { ...x, texto: e.target.value } : x,
                            ),
                          })
                        }
                        placeholder={`Alternativa ${a.letra}`}
                      />
                      {q.alternativas.length > 2 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Remover alternativa ${a.letra}`}
                          onClick={() => {
                            const restantes = q.alternativas
                              .filter((_, j) => j !== ai)
                              .map((x, j) => ({ ...x, letra: LETRAS[j] }));
                            setQ(i, {
                              alternativas: restantes,
                              correta: restantes.some((x) => x.letra === q.correta)
                                ? q.correta
                                : (restantes[0]?.letra ?? "A"),
                            });
                          }}
                        >
                          <Trash2 className="size-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                {q.alternativas.length < 5 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="self-start"
                    onClick={() =>
                      setQ(i, {
                        alternativas: [
                          ...q.alternativas,
                          { letra: LETRAS[q.alternativas.length], texto: "" },
                        ],
                      })
                    }
                  >
                    <Plus className="mr-1.5 size-3.5" />
                    Alternativa
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Comentário (aparece após responder)</Label>
                <Textarea
                  value={q.comentario}
                  onChange={(e) => setQ(i, { comentario: e.target.value })}
                  rows={2}
                  placeholder="Por que essa é a resposta certa?"
                />
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            className="self-start"
            onClick={() => setQuestoes((qs) => [...qs, questaoVazia(qs.length)])}
          >
            <Plus className="mr-1.5 size-4" />
            Adicionar pergunta
          </Button>
        </div>
      </Etapa>

      <Etapa numero={4} titulo="Resolução comentada">
        <Textarea
          value={caso.resolucao}
          onChange={(e) => setC("resolucao", e.target.value)}
          rows={5}
          placeholder="O fecho do caso: o raciocínio completo, o diagnóstico e a conduta."
        />
      </Etapa>

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
        {caso.status === "rascunho" ? (
          <Button onClick={() => gravar("publicado")} disabled={salvar.isPending}>
            Publicar
          </Button>
        ) : (
          <Button variant="outline" onClick={() => gravar("rascunho")} disabled={salvar.isPending}>
            Tirar do ar
          </Button>
        )}
        {!novo && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-1.5 size-4" />
                Excluir caso
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir este caso?</AlertDialogTitle>
                <AlertDialogDescription>
                  O caso, suas {questoes.length} perguntas e o histórico de respostas dos alunos
                  serão apagados. Não há como desfazer. Para só tirá-lo do ar, use "Tirar do ar".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await excluir.mutateAsync(id);
                    navigate({ to: "/admin/casos" });
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

function Etapa({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {numero}
        </span>
        <h2 className="font-display text-sm font-semibold">{titulo}</h2>
      </div>
      {children}
    </Card>
  );
}
