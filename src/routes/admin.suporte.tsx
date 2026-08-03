import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, LifeBuoy, Mail } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type Chamado = Database["public"]["Tables"]["support_tickets"]["Row"];
type Status = Database["public"]["Enums"]["support_status"];

export const Route = createFileRoute("/admin/suporte")({
  component: AdminSuporte,
});

const ROTULO: Record<Status, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
};

function AdminSuporte() {
  const [filtro, setFiltro] = useState<Status | "todos">("aberto");

  // A leitura é direta pelo cliente: a RLS já garante que só admin enxerga
  // esta tabela. Não é preciso server function para ler.
  const { data: chamados, isLoading } = useQuery({
    queryKey: ["admin", "suporte"],
    queryFn: async (): Promise<Chamado[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const visiveis = chamados?.filter((c) => filtro === "todos" || c.status === filtro) ?? [];
  const abertos = chamados?.filter((c) => c.status === "aberto").length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-display text-xl font-bold">Suporte</h1>
        <p className="text-sm text-muted-foreground">
          {abertos} {abertos === 1 ? "chamado aberto" : "chamados abertos"} ·{" "}
          {chamados?.length ?? 0} no total
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["aberto", "em_andamento", "resolvido", "todos"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filtro === f ? "default" : "outline"}
            onClick={() => setFiltro(f)}
          >
            {f === "todos" ? "Todos" : ROTULO[f]}
          </Button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
          <LifeBuoy className="size-6" />
          Nenhum chamado {filtro === "todos" ? "" : ROTULO[filtro as Status].toLowerCase()} por
          aqui.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visiveis.map((c) => (
            <ChamadoCard key={c.id} chamado={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChamadoCard({ chamado }: { chamado: Chamado }) {
  const qc = useQueryClient();
  const [nota, setNota] = useState(chamado.nota_interna ?? "");

  const atualizar = useMutation({
    mutationFn: async (mudanca: { status?: Status; nota_interna?: string }) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("support_tickets").update(mudanca).eq("id", chamado.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "suporte"] }),
  });

  const quando = new Date(chamado.created_at).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{chamado.assunto}</p>
          <p className="text-xs text-muted-foreground">
            {chamado.nome} · {chamado.email} · {quando}
            {!chamado.user_id && " · visitante sem conta"}
          </p>
        </div>
        <Badge variant={chamado.status === "resolvido" ? "secondary" : "default"}>
          {ROTULO[chamado.status]}
        </Badge>
      </div>

      <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">{chamado.mensagem}</p>

      {chamado.user_agent && (
        <p className="truncate text-[11px] text-muted-foreground" title={chamado.user_agent}>
          {chamado.user_agent}
        </p>
      )}

      <Textarea
        rows={2}
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        onBlur={() =>
          nota !== (chamado.nota_interna ?? "") && atualizar.mutate({ nota_interna: nota })
        }
        placeholder="Anotação interna (o usuário nunca vê)"
        className="text-sm"
      />

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" asChild>
          <a
            href={`mailto:${chamado.email}?subject=${encodeURIComponent(`Re: ${chamado.assunto} — US360`)}`}
          >
            <Mail className="mr-1.5 size-3.5" />
            Responder por e-mail
          </a>
        </Button>
        {chamado.status !== "em_andamento" && chamado.status !== "resolvido" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => atualizar.mutate({ status: "em_andamento" })}
            disabled={atualizar.isPending}
          >
            Marcar em andamento
          </Button>
        )}
        {chamado.status !== "resolvido" ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => atualizar.mutate({ status: "resolvido" })}
            disabled={atualizar.isPending}
          >
            Marcar resolvido
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => atualizar.mutate({ status: "aberto" })}
            disabled={atualizar.isPending}
          >
            Reabrir
          </Button>
        )}
      </div>
    </Card>
  );
}
