import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight, Loader2, Plus } from "lucide-react";

import { StatusBadge } from "./admin.quiz.index";
import { atlasQueryOptions } from "@/lib/data/content";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { gerarSlug } from "@/lib/utils";

export const Route = createFileRoute("/admin/atlas/")({
  component: AdminAtlasList,
});

function AdminAtlasList() {
  const { data: atlas, isLoading } = useQuery(atlasQueryOptions());
  const [novaRegiao, setNovaRegiao] = useState(false);
  const [novaEstruturaEm, setNovaEstruturaEm] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalEstruturas = atlas?.reduce((n, r) => n + r.estruturas.length, 0) ?? 0;
  const regiao = atlas?.find((r) => r.id === novaEstruturaEm);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">Atlas</h1>
          <p className="text-sm text-muted-foreground">
            {atlas?.length ?? 0} regiões · {totalEstruturas} estruturas
          </p>
        </div>
        <Button onClick={() => setNovaRegiao(true)}>
          <Plus className="mr-1.5 size-4" />
          Nova região
        </Button>
      </header>

      <div className="flex flex-col gap-4">
        {atlas?.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xl">{r.icone}</span>
              <div className="min-w-0">
                <h2 className="font-display text-sm font-semibold">{r.nome}</h2>
                <p className="text-xs text-muted-foreground">{r.descricao}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <StatusBadge status={r.status} />
                <Badge variant="outline" className="text-[10px]">
                  {r.estruturas.length} estruturas
                </Badge>
                <BotaoPublicarRegiao id={r.id} status={r.status} />
              </div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              {r.estruturas.map((e) => (
                <Link
                  key={e.id}
                  to="/admin/atlas/$id"
                  params={{ id: e.id }}
                  className="flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.imagens.length + e.comparacoes.length} imagens
                      {e.status === "rascunho" && " · rascunho"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}

              <button
                type="button"
                onClick={() => setNovaEstruturaEm(r.id)}
                className="flex items-center gap-2 rounded-md border border-dashed p-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Plus className="size-4 shrink-0" />
                Nova estrutura
              </button>
            </div>
          </Card>
        ))}
      </div>

      <DialogNovaRegiao
        aberto={novaRegiao}
        onFechar={() => setNovaRegiao(false)}
        proximaOrdem={(atlas?.length ?? 0) + 1}
      />
      <DialogNovaEstrutura regiao={regiao ?? null} onFechar={() => setNovaEstruturaEm(null)} />
    </div>
  );
}

/**
 * Sem isto, uma região criada aqui nasceria rascunho e não teria como sair
 * disso — o aluno nunca a veria, por mais estrutura que tivesse dentro.
 */
function BotaoPublicarRegiao({ id, status }: { id: string; status: "rascunho" | "publicado" }) {
  const qc = useQueryClient();
  const alternar = useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("atlas_regions")
        .update({ status: status === "publicado" ? "rascunho" : "publicado" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["atlas"] }),
  });

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-xs"
      onClick={() => alternar.mutate()}
      disabled={alternar.isPending}
    >
      {alternar.isPending && <Loader2 className="mr-1.5 size-3 animate-spin" />}
      {status === "publicado" ? "Tirar do ar" : "Publicar"}
    </Button>
  );
}

function DialogNovaRegiao({
  aberto,
  onFechar,
  proximaOrdem,
}: {
  aberto: boolean;
  onFechar: () => void;
  proximaOrdem: number;
}) {
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [icone, setIcone] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const criar = useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("atlas_regions").insert({
        slug: gerarSlug(nome),
        nome: nome.trim(),
        icone: icone.trim(),
        descricao: descricao.trim(),
        ordem: proximaOrdem,
        // Nasce como rascunho de propósito: região vazia não aparece para o
        // aluno até ter estrutura dentro e alguém decidir publicar.
        status: "rascunho",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["atlas"] });
      setNome("");
      setIcone("");
      setDescricao("");
      setErro(null);
      onFechar();
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      setErro(
        msg.includes("duplicate") || msg.includes("unique")
          ? "Já existe uma região com esse nome."
          : "Não foi possível criar. " + msg,
      );
    },
  });

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova região</DialogTitle>
          <DialogDescription>
            Uma região agrupa estruturas — Ombro, Joelho, Nervos Periféricos. Ela nasce como
            rascunho: só aparece para o aluno quando você publicar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="regiao-nome">Nome</Label>
            <Input
              id="regiao-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Punho Anterior"
              autoFocus
            />
            {nome.trim() && (
              <p className="text-xs text-muted-foreground">Endereço: /atlas/{gerarSlug(nome)}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="regiao-icone">Ícone</Label>
            <Input
              id="regiao-icone"
              value={icone}
              onChange={(e) => setIcone(e.target.value)}
              placeholder="Um emoji, ex: 🤚"
              className="w-24"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="regiao-descricao">Descrição</Label>
            <Input
              id="regiao-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Uma linha que aparece embaixo do nome"
            />
          </div>
          {erro && (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {erro}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={() => criar.mutate()} disabled={!nome.trim() || criar.isPending}>
            {criar.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Criar região
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogNovaEstrutura({
  regiao,
  onFechar,
}: {
  regiao: { id: string; nome: string; estruturas: { id: string }[] } | null;
  onFechar: () => void;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const criar = useMutation({
    mutationFn: async () => {
      if (!regiao) throw new Error("sem região");
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("atlas_structures")
        .insert({
          region_id: regiao.id,
          slug: gerarSlug(nome),
          nome: nome.trim(),
          ordem: regiao.estruturas.length + 1,
          status: "rascunho",
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["atlas"] });
      setNome("");
      setErro(null);
      onFechar();
      // Criar e cair direto no editor: o nome sozinho não serve de nada, o
      // trabalho de verdade é preencher a ficha.
      navigate({ to: "/admin/atlas/$id", params: { id } });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      setErro(
        msg.includes("duplicate") || msg.includes("unique")
          ? "Já existe uma estrutura com esse nome nesta região."
          : "Não foi possível criar. " + msg,
      );
    },
  });

  return (
    <Dialog open={Boolean(regiao)} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova estrutura</DialogTitle>
          <DialogDescription>
            Em {regiao?.nome}. Depois de criar, o editor abre para você preencher os textos — com
            ajuda da IA, se ela estiver ligada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="estrutura-nome">Nome da estrutura</Label>
          <Input
            id="estrutura-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Nervo Mediano no Punho"
            autoFocus
          />
          {erro && (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {erro}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={() => criar.mutate()} disabled={!nome.trim() || criar.isPending}>
            {criar.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Criar e editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
