import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

// Volta do Google/Apple e da confirmação de e-mail. O @supabase/ssr troca o
// código por sessão automaticamente ao detectar o parâmetro na URL; aqui só
// esperamos isso acontecer e mandamos a pessoa para o lugar certo — onboarding
// se for a primeira vez, home se já tiver perfil preenchido.
function AuthCallback() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();
      if (cancelado) return;

      if (error || !data.session) {
        setErro("Não foi possível concluir o login. Tente novamente.");
        return;
      }

      const { data: perfil } = await supabase
        .from("profiles")
        .select("onboarding_completo")
        .eq("id", data.session.user.id)
        .maybeSingle();
      if (cancelado) return;

      navigate({ to: perfil?.onboarding_completo ? "/home" : "/onboarding" });
    })();

    return () => {
      cancelado = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6">
      {erro ? (
        <>
          <p className="text-center text-sm text-destructive">{erro}</p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Voltar para o login
          </button>
        </>
      ) : (
        <>
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Concluindo seu login...</p>
        </>
      )}
    </div>
  );
}
