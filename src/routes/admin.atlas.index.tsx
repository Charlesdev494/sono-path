import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Loader2, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { StatusBadge } from "./admin.quiz.index";
import { atlasQueryOptions, type AtlasRegion } from "@/lib/data/content";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { gerarSlug } from "@/lib/utils";

export const Route = createFileRoute("/admin/atlas/")({
  component: AdminAtlasList,
});

function AdminAtlasList() {
  const { data: atlas, isLoading } = useQuery(atlasQueryOptions());
  const [novaRegiao, setNovaRegiao] = useState(false);
  const [novaEstruturaEm, setNovaEstruturaEm] = useState<string | null>(null);
  // Os dois diálogos moram aqui, e não dentro do menu de cada card: item de
  // menu fecha o menu ao ser clicado, e o diálogo que estivesse dentro dele
  // desmontaria junto, antes de aparecer.
  const [editando, setEditando] = useState<AtlasRegion | null>(null);
  const [excluindo, setExcluindo] = useState<AtlasRegion | null>(null);

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
                <MenuRegiao
                  regiao={r}
                  onEditar={() => setEditando(r)}
                  onExcluir={() => setExcluindo(r)}
                />
              </div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              {r.estruturas.map((e) => (
                // min-w-0 no PRÓPRIO item do grid, não só no filho. Item de grid
                // nasce com min-width:auto, e como o nome está em truncate
                // (white-space:nowrap) a largura mínima do item vira o texto
                // inteiro: o truncate nunca chega a agir e a página fica mais
                // larga que a tela. Era isso que empurrava o Atlas para o lado
                // no celular, cortando o título e o cabeçalho.
                <Link
                  key={e.id}
                  to="/admin/atlas/$id"
                  params={{ id: e.id }}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-md border p-2.5 text-sm transition-colors hover:bg-accent"
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
      <DialogEditarRegiao regiao={editando} onFechar={() => setEditando(null)} />
      <DialogExcluirRegiao regiao={excluindo} onFechar={() => setExcluindo(null)} />
    </div>
  );
}

/**
 * Publicar, corrigir e excluir cabem num menu, não na linha do card: no
 * celular os três lado a lado passavam da largura da tela.
 */
function MenuRegiao({
  regiao,
  onEditar,
  onExcluir,
}: {
  regiao: AtlasRegion;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const qc = useQueryClient();
  // Sem isto, uma região criada aqui nasceria rascunho e não teria como sair
  // disso — o aluno nunca a veria, por mais estrutura que tivesse dentro.
  const alternar = useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("atlas_regions")
        .update({ status: regiao.status === "publicado" ? "rascunho" : "publicado" })
        .eq("id", regiao.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["atlas"] }),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="size-8"
          aria-label={`Ações de ${regiao.nome}`}
        >
          {alternar.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MoreVertical className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => alternar.mutate()}>
          {regiao.status === "publicado" ? "Tirar do ar" : "Publicar"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onEditar}>
          <Pencil className="mr-2 size-4" />
          Corrigir nome, ícone e descrição
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onExcluir} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 size-4" />
          Excluir região
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Corrigir vem antes de excluir de propósito. Um erro de digitação no nome de
 * uma região não pode custar as estruturas de dentro dela — que é o que
 * aconteceria se o único conserto fosse apagar e criar de novo.
 */
function DialogEditarRegiao({
  regiao,
  onFechar,
}: {
  regiao: AtlasRegion | null;
  onFechar: () => void;
}) {
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [icone, setIcone] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  // Reabrir o diálogo em outra região precisa recarregar os campos; sem isto
  // ficariam os valores da região anterior.
  useEffect(() => {
    if (!regiao) return;
    setNome(regiao.nome);
    setIcone(regiao.icone);
    setDescricao(regiao.descricao);
    setErro(null);
  }, [regiao]);

  const salvar = useMutation({
    mutationFn: async () => {
      if (!regiao) throw new Error("sem região");
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("atlas_regions")
        .update({
          nome: nome.trim(),
          icone: icone.trim(),
          descricao: descricao.trim(),
          // O slug acompanha o nome: corrigir a digitação tem de corrigir
          // também o endereço público, senão o erro fica visível na URL para
          // sempre. O diálogo mostra o endereço resultante para que a troca
          // não seja silenciosa.
          slug: gerarSlug(nome),
        })
        .eq("id", regiao.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["atlas"] });
      setErro(null);
      onFechar();
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      setErro(
        msg.includes("duplicate") || msg.includes("unique")
          ? "Já existe outra região com esse nome."
          : "Não foi possível salvar. " + msg,
      );
    },
  });

  return (
    <Dialog open={Boolean(regiao)} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Corrigir região</DialogTitle>
          <DialogDescription>
            As estruturas de dentro não são tocadas. Só o que aparece na lista e o endereço.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="editar-nome">Nome</Label>
            <Input
              id="editar-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
            {nome.trim() && (
              <p className="text-xs text-muted-foreground">Endereço: /atlas/{gerarSlug(nome)}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="editar-icone">Ícone</Label>
            <Input
              id="editar-icone"
              value={icone}
              onChange={(e) => setIcone(e.target.value)}
              placeholder="Um emoji, ex: 🤚"
              className="w-24"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="editar-descricao">Descrição</Label>
            <Input
              id="editar-descricao"
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
          <Button onClick={() => salvar.mutate()} disabled={!nome.trim() || salvar.isPending}>
            {salvar.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogExcluirRegiao({
  regiao,
  onFechar,
}: {
  regiao: AtlasRegion | null;
  onFechar: () => void;
}) {
  const qc = useQueryClient();
  const [erro, setErro] = useState<string | null>(null);

  const excluir = useMutation({
    mutationFn: async () => {
      if (!regiao) throw new Error("sem região");
      const supabase = getSupabaseBrowserClient();
      // As estruturas caem por cascade (FK on delete cascade). É por isso que a
      // contagem aparece na pergunta: quem apaga precisa ver o que vai junto.
      const { error } = await supabase.from("atlas_regions").delete().eq("id", regiao.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["atlas"] });
      setErro(null);
      onFechar();
    },
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : String(e)),
  });

  const quantas = regiao?.estruturas.length ?? 0;

  return (
    <AlertDialog open={Boolean(regiao)} onOpenChange={(v) => !v && onFechar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {regiao?.nome}?</AlertDialogTitle>
          <AlertDialogDescription>
            {quantas > 0
              ? `As ${quantas} estruturas dentro desta região serão apagadas junto, com os textos e as imagens. Não há como desfazer.`
              : "A região está vazia. Não há como desfazer."}{" "}
            Se o problema for só o nome, use "Corrigir" — nada se perde.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {erro && (
          <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Não foi possível excluir. {erro}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Sem isto o AlertDialog fecha sozinho no clique e o erro, se
              // houver, não teria onde aparecer.
              e.preventDefault();
              excluir.mutate();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {excluir.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Excluir definitivamente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
