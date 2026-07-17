import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar · US360" },
      { name: "description", content: "Acesse seu progresso em sonoanatomia." },
    ],
  }),
  component: Login,
});

type Modo = "entrar" | "criar";

function Login() {
  const navigate = useNavigate();
  const { user, pronto } = useAuth();
  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (pronto && user) navigate({ to: "/home" });
  }, [pronto, user, navigate]);

  async function comEmail(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setEnviando(true);
    const supabase = getSupabaseBrowserClient();

    const { error } =
      modo === "entrar"
        ? await supabase.auth.signInWithPassword({ email, password: senha })
        : await supabase.auth.signUp({
            email,
            password: senha,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          });

    setEnviando(false);
    if (error) {
      setErro(traduzirErro(error.message));
      return;
    }
    if (modo === "criar") {
      setAviso("Conta criada. Confira seu e-mail para confirmar o cadastro.");
    }
  }

  async function comProvedor(provider: "google" | "apple") {
    setErro(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErro(traduzirErro(error.message));
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <header className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold">US360</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {modo === "entrar"
              ? "Entre para continuar seu progresso."
              : "Crie sua conta e comece a estudar."}
          </p>
        </header>

        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => comProvedor("google")} className="w-full">
            Continuar com Google
          </Button>
          <Button variant="outline" onClick={() => comProvedor("apple")} className="w-full">
            Continuar com Apple
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={comEmail} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 8 caracteres"
            />
          </div>

          {erro && (
            <p role="alert" className="text-sm text-destructive">
              {erro}
            </p>
          )}
          {aviso && <p className="text-sm text-success">{aviso}</p>}

          <Button type="submit" disabled={enviando} className="w-full">
            {enviando && <Loader2 className="mr-2 size-4 animate-spin" />}
            {modo === "entrar" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {modo === "entrar" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setModo(modo === "entrar" ? "criar" : "entrar");
              setErro(null);
              setAviso(null);
            }}
          >
            {modo === "entrar" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}

// As mensagens do Supabase vêm em inglês e falam a língua do sistema
// ("Invalid login credentials"). O aluno precisa saber o que fazer.
function traduzirErro(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("user already registered")) return "Já existe uma conta com este e-mail.";
  if (m.includes("password should be at least"))
    return "A senha precisa ter pelo menos 8 caracteres.";
  if (m.includes("unable to validate email address")) return "E-mail inválido.";
  if (m.includes("provider is not enabled"))
    return "Este login ainda não foi habilitado. Use e-mail e senha por enquanto.";
  return mensagem;
}
