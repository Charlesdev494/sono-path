import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Plug, Sparkles, Trash2, TriangleAlert } from "lucide-react";

import {
  obterConfigIA,
  removerChaveIA,
  salvarConfigIA,
  testarConexaoIA,
} from "@/lib/api/integracoes.functions";

export const Route = createFileRoute("/admin/integracoes")({
  component: AdminIntegracoes,
});

type Provedor = "openai" | "anthropic";

const PROVEDORES: { id: Provedor; nome: string; onde: string; prefixo: string }[] = [
  {
    id: "openai",
    nome: "OpenAI (ChatGPT)",
    onde: "platform.openai.com/api-keys",
    prefixo: "sk-...",
  },
  {
    id: "anthropic",
    nome: "Anthropic (Claude)",
    onde: "console.anthropic.com",
    prefixo: "sk-ant-...",
  },
];

function AdminIntegracoes() {
  const qc = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: ["admin", "config-ia"],
    queryFn: () => obterConfigIA(),
  });

  const [provedor, setProvedor] = useState<Provedor>("openai");
  const [modelo, setModelo] = useState("");
  // Fica vazio depois de salvar: a chave gravada nunca volta do servidor, e
  // deixar o campo em branco significa "mantém a que já está lá".
  const [chave, setChave] = useState("");
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    if (!config) return;
    setProvedor(config.provedor);
    setModelo(config.modelo);
  }, [config]);

  const salvar = useMutation({
    mutationFn: () => salvarConfigIA({ data: { provedor, modelo, apiKey: chave || undefined } }),
    onSuccess: () => {
      setChave("");
      setMsg({ tipo: "ok", texto: "Configuração salva." });
      qc.invalidateQueries({ queryKey: ["admin", "config-ia"] });
      // Os botões de IA do painel aparecem/somem conforme esta resposta.
      qc.invalidateQueries({ queryKey: ["ai", "disponivel"] });
    },
    onError: (e) => setMsg({ tipo: "erro", texto: traduzir(e) }),
  });

  const testar = useMutation({
    mutationFn: () => testarConexaoIA({ data: { provedor, modelo, apiKey: chave || undefined } }),
    onSuccess: (r) =>
      setMsg(
        r.ok
          ? { tipo: "ok", texto: "Conexão funcionando. A chave e o modelo estão válidos." }
          : { tipo: "erro", texto: `A chamada falhou: ${r.erro}` },
      ),
    onError: (e) => setMsg({ tipo: "erro", texto: traduzir(e) }),
  });

  const remover = useMutation({
    mutationFn: () => removerChaveIA(),
    onSuccess: () => {
      setChave("");
      setMsg({ tipo: "ok", texto: "Chave removida. A IA voltou a ficar desligada." });
      qc.invalidateQueries({ queryKey: ["admin", "config-ia"] });
      qc.invalidateQueries({ queryKey: ["ai", "disponivel"] });
    },
    onError: (e) => setMsg({ tipo: "erro", texto: traduzir(e) }),
  });

  const ocupado = salvar.isPending || testar.isPending || remover.isPending;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const escolhido = PROVEDORES.find((p) => p.id === provedor)!;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <header>
        <h1 className="font-display text-xl font-bold">Integrações</h1>
        <p className="text-sm text-muted-foreground">
          Serviços externos que o app usa. Hoje, o copiloto de IA que ajuda a escrever quiz, casos
          clínicos e o Atlas.
        </p>
      </header>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold">Copiloto de IA</h2>
              <p className="text-xs text-muted-foreground">
                {config?.habilitado
                  ? config.origem === "ambiente"
                    ? "Ligado por variável de ambiente do servidor"
                    : "Ligado pela chave salva aqui"
                  : "Desligado — os botões de IA não aparecem no painel"}
              </p>
            </div>
          </div>
          <Badge variant={config?.habilitado ? "default" : "secondary"}>
            {config?.habilitado ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Provedor</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {PROVEDORES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setProvedor(p.id);
                  // O modelo do provedor anterior não existe no novo; limpar
                  // faz o servidor usar o padrão de quem foi escolhido.
                  setModelo("");
                  setMsg(null);
                }}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  provedor === p.id ? "border-primary bg-accent" : "hover:bg-accent/50"
                }`}
              >
                <p className="text-sm font-medium">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.onde}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="chave">Chave da API</Label>
          <Input
            id="chave"
            type="password"
            autoComplete="off"
            value={chave}
            onChange={(e) => {
              setChave(e.target.value);
              setMsg(null);
            }}
            placeholder={config?.chaveMascarada ?? escolhido.prefixo}
          />
          <p className="text-xs text-muted-foreground">
            {config?.chaveMascarada
              ? `Chave atual: ${config.chaveMascarada}. Deixe em branco para mantê-la.`
              : `Cole a chave criada em ${escolhido.onde}.`}{" "}
            Ela fica guardada só no servidor e nunca é devolvida para esta tela.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="modelo">Modelo</Label>
          <Input
            id="modelo"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            placeholder={config?.modeloPadrao}
          />
          <p className="text-xs text-muted-foreground">
            Em branco usa o padrão ({config?.modeloPadrao}). Modelo melhor gera texto melhor e custa
            mais por geração.
          </p>
        </div>

        {msg && (
          <p
            role="status"
            className={`flex items-start gap-2 rounded-md p-3 text-sm ${
              msg.tipo === "ok"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {msg.tipo === "ok" ? (
              <Check className="mt-0.5 size-4 shrink-0" />
            ) : (
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            )}
            {msg.texto}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => salvar.mutate()} disabled={ocupado}>
            {salvar.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Salvar
          </Button>
          <Button variant="outline" onClick={() => testar.mutate()} disabled={ocupado}>
            {testar.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Plug className="mr-2 size-4" />
            )}
            Testar conexão
          </Button>
          {config?.chaveMascarada && config.origem === "painel" && (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => remover.mutate()}
              disabled={ocupado}
            >
              <Trash2 className="mr-2 size-4" />
              Remover chave
            </Button>
          )}
        </div>
      </Card>

      <Card className="flex flex-col gap-2 p-5 text-sm text-muted-foreground">
        <h2 className="font-display text-sm font-semibold text-foreground">
          Como funciona a conta
        </h2>
        <p>
          A cobrança é do provedor, por uso: cada geração consome créditos da conta dona da chave.
          Não há mensalidade do app.
        </p>
        <p>
          Tudo que a IA escreve entra como <strong>rascunho</strong> e precisa da sua revisão antes
          de ir ao ar. Conteúdo médico gerado por máquina não é publicado sozinho.
        </p>
      </Card>
    </div>
  );
}

function traduzir(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("NAO_AUTORIZADO")) return "Só um administrador pode mudar isto.";
  if (msg.includes("NAO_AUTENTICADO")) return "Sua sessão expirou. Entre de novo.";
  return "Não foi possível concluir. Tente de novo.";
}
