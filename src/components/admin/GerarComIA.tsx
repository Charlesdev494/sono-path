import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { traduzirErroIA, useAIDisponivel, useGerarQuestao } from "@/lib/data/ai";
import type { Alternativa } from "@/lib/data/admin";

export type RascunhoQuestao = {
  enunciado: string;
  alternativas: Alternativa[];
  correta: string;
  explicacao: string;
  imagem_label: string;
};

/**
 * Botão "Gerar com IA" do editor de quiz.
 *
 * Renderiza null quando não há chave configurada no servidor — é o que mantém
 * a Fase 4 invisível até alguém decidir ligá-la. O resto do editor não muda.
 *
 * O que a IA devolve NÃO é salvo: preenche o formulário para o Charles revisar.
 * Conteúdo médico gerado por máquina não vai ao ar sem um médico ler antes.
 */
export function GerarQuestaoComIA({
  regiao,
  nivel,
  onGerado,
}: {
  regiao: string;
  nivel: "basico" | "avancado";
  onGerado: (r: RascunhoQuestao) => void;
}) {
  const disponivel = useAIDisponivel();
  const gerar = useGerarQuestao();
  const [aberto, setAberto] = useState(false);
  const [tema, setTema] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  if (!disponivel) return null;

  async function executar() {
    if (!regiao.trim()) {
      setErro("Informe a região anatômica antes de gerar.");
      return;
    }
    setErro(null);
    try {
      const q = await gerar.mutateAsync({
        regiao: regiao.trim(),
        nivel,
        tema: tema.trim() || undefined,
      });
      onGerado({
        enunciado: q.enunciado,
        alternativas: q.alternativas,
        correta: q.correta,
        explicacao: q.explicacao,
        imagem_label: q.imagem_label,
      });
      setAberto(false);
      setTema("");
    } catch (e) {
      setErro(traduzirErroIA(e));
    }
  }

  if (!aberto) {
    return (
      <Button type="button" variant="outline" onClick={() => setAberto(true)}>
        <Sparkles className="mr-1.5 size-4" />
        Gerar com IA
      </Button>
    );
  }

  return (
    <Card className="flex flex-col gap-3 border-primary/40 bg-primary/5 p-4">
      <div className="flex items-center gap-1.5">
        <Sparkles className="size-4 text-primary" />
        <p className="text-sm font-semibold">Gerar questão com IA</p>
      </div>

      <p className="text-xs text-muted-foreground">
        A IA escreve um rascunho para <b>{regiao || "(defina a região)"}</b>, nível{" "}
        {nivel === "avancado" ? "avançado" : "básico"}. Nada é salvo: o texto entra no formulário
        para você revisar e corrigir antes de publicar.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tema-ia" className="text-xs">
          Tema específico (opcional)
        </Label>
        <Input
          id="tema-ia"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: anisotropia do tendão supraespinhal"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              executar();
            }
          }}
        />
      </div>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="button" onClick={executar} disabled={gerar.isPending}>
          {gerar.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {gerar.isPending ? "Escrevendo..." : "Gerar rascunho"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setAberto(false);
            setErro(null);
          }}
          disabled={gerar.isPending}
        >
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
