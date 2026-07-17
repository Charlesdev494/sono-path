import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Plus, Trash2, Check, Loader2 } from "lucide-react";

import { CampoImagem } from "@/components/admin/CampoImagem";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type EstruturaRow = Database["public"]["Tables"]["atlas_structures"]["Row"];
type Imagem = { url: string; legenda: string };

export const Route = createFileRoute("/admin/atlas/$id")({
  component: AdminAtlasEditor,
});

function AdminAtlasEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: estrutura, isLoading } = useQuery({
    queryKey: ["admin", "atlas", id],
    queryFn: async (): Promise<EstruturaRow | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("atlas_structures")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    nome: "",
    resumo: "",
    anatomia: "",
    sonoanatomia: "",
    escaneamento: [] as string[],
    armadilhas: [] as string[],
    aplicacoes_clinicas: [] as string[],
    imagens: [] as Imagem[],
  });
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!estrutura) return;
    const lista = (v: unknown) => (Array.isArray(v) ? v : []);
    setForm({
      nome: estrutura.nome,
      resumo: estrutura.resumo,
      anatomia: estrutura.anatomia,
      sonoanatomia: estrutura.sonoanatomia,
      escaneamento: lista(estrutura.escaneamento) as string[],
      armadilhas: lista(estrutura.armadilhas) as string[],
      aplicacoes_clinicas: lista(estrutura.aplicacoes_clinicas) as string[],
      imagens: lista(estrutura.imagens) as Imagem[],
    });
  }, [estrutura]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSalvo(false);
  };

  async function gravar() {
    if (!form.nome.trim()) {
      setErro("A estrutura precisa de um nome.");
      return;
    }
    setErro(null);
    setSalvando(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("atlas_structures")
      .update({
        nome: form.nome.trim(),
        resumo: form.resumo.trim(),
        anatomia: form.anatomia.trim(),
        sonoanatomia: form.sonoanatomia.trim(),
        escaneamento: form.escaneamento.filter((s) => s.trim()),
        armadilhas: form.armadilhas.filter((s) => s.trim()),
        aplicacoes_clinicas: form.aplicacoes_clinicas.filter((s) => s.trim()),
        imagens: form.imagens.filter((i) => i.url),
      })
      .eq("id", id);
    setSalvando(false);
    if (error) {
      setErro("Não foi possível salvar. " + error.message);
      return;
    }
    setSalvo(true);
    qc.invalidateQueries({ queryKey: ["atlas"] });
    qc.invalidateQueries({ queryKey: ["admin", "atlas"] });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!estrutura) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Estrutura não encontrada.{" "}
        <Link to="/admin/atlas" className="text-primary underline">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/admin/atlas"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Atlas
        </Link>
        {salvo && (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check className="size-3.5" />
            Salvo
          </span>
        )}
      </div>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome da estrutura</Label>
          <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="resumo">Resumo</Label>
          <Input
            id="resumo"
            value={form.resumo}
            onChange={(e) => set("resumo", e.target.value)}
            placeholder="Uma linha que aparece na lista"
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="anatomia">Anatomia</Label>
          <Textarea
            id="anatomia"
            value={form.anatomia}
            onChange={(e) => set("anatomia", e.target.value)}
            rows={4}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sonoanatomia">Sonoanatomia</Label>
          <Textarea
            id="sonoanatomia"
            value={form.sonoanatomia}
            onChange={(e) => set("sonoanatomia", e.target.value)}
            rows={4}
          />
        </div>
      </Card>

      <ListaDeTextos
        titulo="Dicas de escaneamento"
        itens={form.escaneamento}
        onChange={(v) => set("escaneamento", v)}
        placeholder="Ex: Posicionar o transdutor linear de alta frequência."
      />
      <ListaDeTextos
        titulo="Armadilhas"
        itens={form.armadilhas}
        onChange={(v) => set("armadilhas", v)}
        placeholder="Ex: Anisotropia pode simular lesão."
      />
      <ListaDeTextos
        titulo="Aplicações clínicas"
        itens={form.aplicacoes_clinicas}
        onChange={(v) => set("aplicacoes_clinicas", v)}
        placeholder="Ex: Bloqueio diagnóstico guiado por ultrassom."
      />

      <Card className="flex flex-col gap-3 p-4">
        <Label>Imagens ({form.imagens.length})</Label>
        {form.imagens.map((img, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
            <div className="flex items-start gap-3">
              <img src={img.url} alt="" className="h-24 w-auto rounded border object-contain" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-xs">Legenda</Label>
                <Input
                  value={img.legenda}
                  onChange={(e) =>
                    set(
                      "imagens",
                      form.imagens.map((x, j) => (j === i ? { ...x, legenda: e.target.value } : x)),
                    )
                  }
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Remover imagem ${i + 1}`}
                onClick={() =>
                  set(
                    "imagens",
                    form.imagens.filter((_, j) => j !== i),
                  )
                }
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}

        <CampoImagem
          url={null}
          onChange={(u) => u && set("imagens", [...form.imagens, { url: u, legenda: "" }])}
          label="Adicionar imagem"
        />
      </Card>

      {erro && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {erro}
        </p>
      )}

      <div>
        <Button onClick={gravar} disabled={salvando}>
          {salvando && <Loader2 className="mr-2 size-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </div>
  );
}

function ListaDeTextos({
  titulo,
  itens,
  onChange,
  placeholder,
}: {
  titulo: string;
  itens: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <Label>{titulo}</Label>
      {itens.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="mt-0 size-1.5 shrink-0 rounded-full bg-primary" />
          <Input
            value={it}
            onChange={(e) => onChange(itens.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder={placeholder}
          />
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Remover item ${i + 1}`}
            onClick={() => onChange(itens.filter((_, j) => j !== i))}
          >
            <Trash2 className="size-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="outline"
        className="self-start"
        onClick={() => onChange([...itens, ""])}
      >
        <Plus className="mr-1.5 size-3.5" />
        Adicionar
      </Button>
    </Card>
  );
}
