import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles, RefreshCw, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  traduzirErroIA,
  useAIDisponivel,
  useGerarQuestao,
  useReformularQuestao,
} from "@/lib/data/ai";
import { guardarRascunhoIA } from "@/lib/data/ia-rascunho";
import type { Alternativa } from "@/lib/data/admin";

/**
 * Botão "IA" de cada questão na lista do quiz.
 *
 * Some por completo sem chave de IA no servidor (Fase 4 dormente). Abre um
 * diálogo com duas ações:
 *  - Reformular: a IA reescreve ESTA questão (mesmo tema, melhor feitura).
 *  - Criar nova: a IA cria uma questão nova a partir da região/nível desta.
 *
 * Em ambos, nada é salvo: o rascunho abre no editor para o Charles revisar e
 * decidir. Conteúdo médico de máquina não vai ao ar sem um médico ler antes.
 */
export function BotaoIAQuestao({
  questao,
}: {
  questao: {
    id: string;
    regiao: string;
    nivel: "basico" | "avancado";
    enunciado: string;
    alternativas: Alternativa[];
    correta: string;
    explicacao: string;
  };
}) {
  const disponivel = useAIDisponivel();
  const navigate = useNavigate();
  const reformular = useReformularQuestao();
  const gerarNova = useGerarQuestao();
  const [aberto, setAberto] = useState(false);
  const [instrucao, setInstrucao] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  if (!disponivel) return null;

  const ocupado = reformular.isPending || gerarNova.isPending;

  async function aoReformular() {
    setErro(null);
    try {
      const q = await reformular.mutateAsync({
        regiao: questao.regiao,
        nivel: questao.nivel,
        enunciado: questao.enunciado,
        alternativas: questao.alternativas,
        correta: questao.correta,
        explicacao: questao.explicacao,
        instrucao: instrucao.trim() || undefined,
      });
      // Rascunho fica para ESTA questão: o editor abre o texto novo por cima do
      // atual, sem salvar. O Charles compara e decide.
      guardarRascunhoIA(questao.id, {
        enunciado: q.enunciado,
        alternativas: q.alternativas,
        correta: q.correta,
        explicacao: q.explicacao,
        imagem_label: q.imagem_label,
      });
      setAberto(false);
      navigate({ to: "/admin/quiz/$id", params: { id: questao.id } });
    } catch (e) {
      setErro(traduzirErroIA(e));
    }
  }

  async function aoCriarNova() {
    setErro(null);
    try {
      const q = await gerarNova.mutateAsync({
        regiao: questao.regiao,
        nivel: questao.nivel,
        tema: instrucao.trim() || undefined,
      });
      guardarRascunhoIA("nova", {
        enunciado: q.enunciado,
        alternativas: q.alternativas,
        correta: q.correta,
        explicacao: q.explicacao,
        imagem_label: q.imagem_label,
      });
      setAberto(false);
      navigate({ to: "/admin/quiz/$id", params: { id: "nova" } });
    } catch (e) {
      setErro(traduzirErroIA(e));
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1 text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <Sparkles className="size-3.5" />
          IA
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-primary" />
            IA para esta questão
          </DialogTitle>
          <DialogDescription>
            A IA escreve um rascunho sobre <b>{questao.regiao}</b> (nível{" "}
            {questao.nivel === "avancado" ? "avançado" : "básico"}). Nada é salvo: o texto abre no
            editor para você revisar antes de publicar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="instrucao-ia" className="text-xs font-medium">
            O que você quer? (opcional)
          </label>
          <Textarea
            id="instrucao-ia"
            value={instrucao}
            onChange={(e) => setInstrucao(e.target.value)}
            placeholder="Ex: deixe mais difícil, as alternativas erradas estão óbvias, foque na anisotropia..."
            rows={2}
            disabled={ocupado}
          />
        </div>

        {erro && (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={aoReformular} disabled={ocupado} className="flex-1">
            {reformular.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 size-4" />
            )}
            Reformular esta
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={aoCriarNova}
            disabled={ocupado}
            className="flex-1"
          >
            {gerarNova.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Plus className="mr-1.5 size-4" />
            )}
            Criar questão nova
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
