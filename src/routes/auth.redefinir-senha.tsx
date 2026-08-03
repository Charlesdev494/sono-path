import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/redefinir-senha")({
  head: () => ({
    meta: [{ title: "Redefinir senha · US360" }],
  }),
  component: RedefinirSenha,
});

// Para onde o link do e-mail de recuperação leva. O @supabase/ssr troca o
// código da URL por uma sessão temporária automaticamente; aqui só esperamos
// isso acontecer e então deixamos a pessoa escolher uma nova senha.
function RedefinirSenha() {
  const navigate = useNavigate();
  const [pronto, setPronto] = useState(false);
  const [linkValido, setLinkValido] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (cancelado) return;
      setLinkValido(!!data.session);
      setPronto(true);
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    setEnviando(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setEnviando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setOk(true);
    setTimeout(() => navigate({ to: "/home" }), 1500);
  }

  if (!pronto) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Validando o link...</p>
      </div>
    );
  }

  if (!linkValido) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-destructive">
          Este link de recuperação é inválido ou já expirou.
        </p>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Voltar para o login
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <header className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold">US360</h1>
          <p className="mt-1 text-sm text-muted-foreground">Escolha uma nova senha.</p>
        </header>

        {ok ? (
          <p className="text-center text-sm text-success">
            Senha atualizada! Redirecionando...
          </p>
        ) : (
          <form onSubmit={salvar} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha">Nova senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmar">Confirmar nova senha</Label>
              <Input
                id="confirmar"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="Repita a senha"
              />
            </div>

            {erro && (
              <p role="alert" className="text-sm text-destructive">
                {erro}
              </p>
            )}

            <Button type="submit" disabled={enviando} className="w-full">
              {enviando && <Loader2 className="mr-2 size-4 animate-spin" />}
              Salvar nova senha
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
