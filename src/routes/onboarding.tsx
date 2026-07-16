import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { saveProfile, type Profile } from "@/lib/profile";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Bem-vindo · US360" },
      { name: "description", content: "Configure seu perfil em 5 passos." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    nome: "Dr. Teste",
    especialidade: "Medicina da Dor",
    cidade: "Belo Horizonte / MG",
    tempoFormado: "6 a 10",
    temUS: true,
    trabalhaDor: true,
  });

  const total = 5;
  const set = (k: keyof typeof data, v: string | boolean) =>
    setData((d) => ({ ...d, [k]: v }));

  const next = () => setStep((s) => Math.min(total, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const concluir = () => {
    const profile: Profile = {
      ...data,
      pontos: 0,
      streak: 1,
      ultimoAcessoISO: new Date().toISOString(),
      quizzesRespondidos: [],
      quizzesHoje: { dateISO: new Date().toISOString().slice(0, 10), ids: [] },
      casosRespondidos: [],
      atlasVisitados: [],
      missoesCompletadasHoje: {
        dateISO: new Date().toISOString().slice(0, 10),
        missoes: [],
      },
      createdAtISO: new Date().toISOString(),
    };
    saveProfile(profile);
    navigate({ to: "/home" });
  };

  const podeAvancar = () => {
    if (step === 0) return data.nome.trim().length > 1;
    if (step === 1) return !!data.especialidade;
    if (step === 2) return data.cidade.trim().length > 1;
    if (step === 3) return !!data.tempoFormado;
    return true;
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-6 pb-8 pt-10">
      <div className="mb-6">
        <Progress value={((step + 1) / total) * 100} className="h-1.5" />
        <p className="mt-2 text-xs text-muted-foreground">
          Passo {step + 1} de {total}
        </p>
      </div>

      <div className="flex-1">
        {step === 0 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Olá, Doutor(a)!</h1>
            <p className="text-muted-foreground">
              Vamos configurar seu copiloto em sonoanatomia. Como devemos te chamar?
            </p>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: João Silva"
                value={data.nome}
                onChange={(e) => set("nome", e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Sua especialidade</h1>
            <p className="text-muted-foreground">
              Personalizamos o conteúdo conforme sua área.
            </p>
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Select
                value={data.especialidade}
                onValueChange={(v) => set("especialidade", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Anestesiologia",
                    "Ortopedia",
                    "Reumatologia",
                    "Medicina da Dor",
                    "Medicina Física",
                    "Medicina Esportiva",
                    "Neurocirurgia",
                    "Radiologia",
                    "Clínica Médica",
                    "Outra",
                  ].map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Onde você atua?</h1>
            <p className="text-muted-foreground">
              Para conectarmos você à comunidade local no futuro.
            </p>
            <div className="space-y-2">
              <Label>Cidade / UF</Label>
              <Input
                placeholder="Ex: Belo Horizonte / MG"
                value={data.cidade}
                onChange={(e) => set("cidade", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Tempo de formado</h1>
            <p className="text-muted-foreground">
              Ajustamos a profundidade do conteúdo.
            </p>
            <div className="space-y-2">
              <Label>Anos de formado</Label>
              <Select
                value={data.tempoFormado}
                onValueChange={(v) => set("tempoFormado", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {["Menos de 2", "2 a 5", "6 a 10", "11 a 20", "Mais de 20"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t} anos
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Sua prática hoje</h1>
            <div className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div>
                <p className="font-medium">Possui aparelho de ultrassom?</p>
                <p className="text-xs text-muted-foreground">Próprio ou no serviço</p>
              </div>
              <Switch
                checked={data.temUS}
                onCheckedChange={(v) => set("temUS", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div>
                <p className="font-medium">Trabalha com dor?</p>
                <p className="text-xs text-muted-foreground">
                  Procedimentos / intervenções
                </p>
              </div>
              <Switch
                checked={data.trabalhaDor}
                onCheckedChange={(v) => set("trabalhaDor", v)}
              />
            </div>

            <div className="rounded-xl bg-gradient-to-br from-primary to-primary-glow p-5 text-primary-foreground">
              <Sparkles className="mb-2 size-5" />
              <p className="font-semibold">Tudo pronto, {data.nome.split(" ")[0]}!</p>
              <p className="text-sm opacity-90">
                Você começará no nível Iniciante. Vamos evoluir juntos.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={back} className="flex-1">
            <ChevronLeft className="mr-1 size-4" />
            Voltar
          </Button>
        )}
        {step < total - 1 ? (
          <Button onClick={next} disabled={!podeAvancar()} className="flex-1">
            Continuar
            <ChevronRight className="ml-1 size-4" />
          </Button>
        ) : (
          <Button onClick={concluir} className="flex-1">
            Começar
          </Button>
        )}
      </div>
    </div>
  );
}
