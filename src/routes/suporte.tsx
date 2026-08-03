import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Check, LifeBuoy, Loader2 } from "lucide-react";

import { abrirChamado } from "@/lib/api/suporte.functions";
import { useAuth, useProfile } from "@/lib/auth";

// Rota de topo, fora do /_app: precisa abrir sem login. É esta URL que vai no
// campo "URL de suporte" da App Store, e a Apple testa com o app desinstalado.
export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title: "Suporte · US360" },
      {
        name: "description",
        content: "Central de ajuda do US360: dúvidas frequentes e canal de contato.",
      },
    ],
  }),
  component: Suporte,
});

const FAQ = [
  {
    p: "O que é o US360?",
    r: "Um aplicativo de educação médica continuada em ultrassonografia musculoesquelética, com atlas de sonoanatomia, quiz por região, casos clínicos e acompanhamento de progresso. É material de estudo para profissionais e estudantes da área da saúde — não realiza diagnóstico nem substitui avaliação médica.",
  },
  {
    p: "Esqueci minha senha. E agora?",
    r: "Na tela de entrada, toque em 'Esqueci minha senha' e informe o e-mail da conta. Você recebe um link para criar uma nova. Se o e-mail não chegar em alguns minutos, confira a caixa de spam antes de pedir de novo.",
  },
  {
    p: "Como excluo minha conta e meus dados?",
    r: "Dentro do app, vá em Perfil e toque em 'Excluir minha conta'. A exclusão é definitiva: progresso, pontos, histórico de respostas e conquistas são apagados e não há como recuperar.",
  },
  {
    p: "Perdi meu progresso ao trocar de aparelho.",
    r: "O progresso fica vinculado à sua conta, não ao aparelho. Confira se entrou com o mesmo e-mail nos dois. Se entrou e o progresso não apareceu, nos escreva pelo formulário abaixo informando o e-mail usado.",
  },
  {
    p: "Não estou recebendo as notificações.",
    r: "Confira se a permissão de notificações está concedida nos ajustes do sistema para o US360 e se os avisos estão ligados em Perfil. Em alguns aparelhos, o modo de economia de bateria também bloqueia o envio.",
  },
  {
    p: "Encontrei um erro no conteúdo de uma questão.",
    r: "Escreva pelo formulário abaixo dizendo a região e o enunciado da questão. Todo o conteúdo é revisado por médico, mas correções de leitores são bem-vindas e entram nas atualizações.",
  },
  {
    p: "Como vocês tratam meus dados?",
    r: "Coletamos apenas o necessário para a conta funcionar: nome, e-mail, dados de perfil profissional e o progresso de estudo. Não coletamos dados de saúde nem imagens de pacientes, e não vendemos dados a terceiros.",
  },
];

function Suporte() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const [form, setForm] = useState({ nome: "", email: "", assunto: "", mensagem: "" });
  const [erro, setErro] = useState<string | null>(null);

  // Quem já está logado não redigita o que o app já sabe.
  useEffect(() => {
    setForm((f) => ({
      ...f,
      nome: f.nome || profile?.nome || "",
      email: f.email || user?.email || "",
    }));
  }, [profile?.nome, user?.email]);

  const enviar = useMutation({
    mutationFn: () => abrirChamado({ data: form }),
    onError: () =>
      setErro("Não foi possível enviar agora. Tente de novo em instantes ou escreva por e-mail."),
  });

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErro(null);
  };

  const podeEnviar =
    form.nome.trim().length >= 2 &&
    /.+@.+\..+/.test(form.email) &&
    form.assunto.trim().length >= 3 &&
    form.mensagem.trim().length >= 10;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-5 py-10 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
      <header className="flex flex-col gap-3">
        <Link
          to={user ? "/home" : "/login"}
          className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {user ? "Voltar ao app" : "Entrar"}
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LifeBuoy className="size-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Suporte do US360</h1>
            <p className="text-sm text-muted-foreground">
              Respondemos em até 2 dias úteis, no e-mail que você informar.
            </p>
          </div>
        </div>
      </header>

      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">Dúvidas frequentes</h2>
        <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm">{item.p}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.r}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">Falar com a gente</h2>

        {enviar.isSuccess ? (
          <Card className="flex flex-col items-start gap-2 border-success/40 bg-success/5 p-5">
            <div className="flex items-center gap-2 text-success">
              <Check className="size-5" />
              <p className="font-medium">Chamado enviado.</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Recebemos sua mensagem e vamos responder em {form.email}. Não é preciso enviar de
              novo.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                enviar.reset();
                setForm((f) => ({ ...f, assunto: "", mensagem: "" }));
              }}
            >
              Enviar outro
            </Button>
          </Card>
        ) : (
          <Card className="flex flex-col gap-3 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome">Seu nome</Label>
                <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-mail para resposta</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assunto">Assunto</Label>
              <Input
                id="assunto"
                value={form.assunto}
                onChange={(e) => set("assunto", e.target.value)}
                placeholder="Ex: não consigo entrar na minha conta"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea
                id="mensagem"
                rows={6}
                value={form.mensagem}
                onChange={(e) => set("mensagem", e.target.value)}
                placeholder="Conte o que aconteceu, em que tela e o que você já tentou. Quanto mais detalhe, mais rápido resolvemos."
              />
            </div>

            {erro && (
              <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {erro}
              </p>
            )}

            <div>
              <Button onClick={() => enviar.mutate()} disabled={!podeEnviar || enviar.isPending}>
                {enviar.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Enviar
              </Button>
            </div>
          </Card>
        )}
      </section>

      <footer className="flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground">
        <p>
          O US360 é uma ferramenta de estudo para profissionais e estudantes da área da saúde. Não
          realiza diagnóstico, não substitui avaliação médica e não se destina ao uso por pacientes.
        </p>
        <Link to="/privacidade" className="underline underline-offset-4">
          Política de Privacidade
        </Link>
      </footer>
    </div>
  );
}
