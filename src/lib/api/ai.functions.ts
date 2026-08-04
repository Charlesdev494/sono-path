// Copiloto de IA do painel (Fase 4 do escopo v2).
//
// Roda só no servidor: a chave da API nunca chega ao navegador. O cliente
// chama estas funções, elas conversam com a IA e devolvem um RASCUNHO — nada
// é gravado no banco aqui. Quem grava é o Charles, depois de revisar no
// editor. Conteúdo médico gerado por máquina sem revisão humana não vai ao ar.

import { createServerFn } from "@tanstack/react-start";
// zod/v4 e não "zod": o helper zodOutputFormat do SDK da Anthropic tipa contra
// a v4. O pacote zod instalado expõe as duas versões, então isto não obriga o
// resto do projeto a migrar.
import { z } from "zod/v4";

import { chamarIA } from "../ai/chamar.server";
import { exigirAdmin } from "./admin.server";
import { getAIConfig } from "../ai/config.server";

// ---------------------------------------------------------------------------
// Formato das respostas
// ---------------------------------------------------------------------------
// Structured outputs: a API garante que a resposta obedece a este schema, em
// vez de devolver texto que teríamos de torcer para conseguir interpretar.
const alternativaSchema = z.object({
  letra: z.enum(["A", "B", "C", "D"]),
  texto: z.string(),
});

const questaoSchema = z.object({
  enunciado: z.string(),
  alternativas: z.array(alternativaSchema),
  correta: z.enum(["A", "B", "C", "D"]),
  explicacao: z.string(),
  imagem_label: z.string(),
});

const casoSchema = z.object({
  titulo: z.string(),
  apresentacao: z.string(),
  exames_fisicos: z.string(),
  questoes: z.array(
    z.object({
      pergunta: z.string(),
      alternativas: z.array(alternativaSchema),
      correta: z.enum(["A", "B", "C", "D"]),
      comentario: z.string(),
    }),
  ),
  resolucao: z.string(),
});

const revisaoSchema = z.object({
  texto_revisado: z.string(),
  mudancas: z.array(z.string()),
});

// Uma estrutura do Atlas: os mesmos campos que o editor já tem na tela, para o
// rascunho cair direto no formulário.
const estruturaSchema = z.object({
  resumo: z.string(),
  anatomia: z.string(),
  sonoanatomia: z.string(),
  escaneamento: z.array(z.string()),
  armadilhas: z.array(z.string()),
  aplicacoes_clinicas: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// funções expostas ao painel
// ---------------------------------------------------------------------------

/**
 * O painel pergunta isto ao carregar. Sem chave configurada, os botões de IA
 * não são renderizados — é o que mantém a IA dormente sem estorvar.
 */
export const aiDisponivel = createServerFn({ method: "GET" }).handler(async () => {
  const config = await getAIConfig();
  return { habilitado: config.habilitado, provedor: config.provedor };
});

export const gerarQuestaoQuiz = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      regiao: z.string().min(1),
      nivel: z.enum(["basico", "avancado"]),
      tema: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await exigirAdmin();
    const nivelTexto =
      data.nivel === "avancado"
        ? "Nível avançado: exija raciocínio clínico, não apenas memorização — armadilhas técnicas, decisões de conduta, achados sutis."
        : "Nível básico: identificação de estruturas, referências anatômicas e conceitos fundamentais.";

    const questao = await chamarIA({
      schema: questaoSchema,
      prompt: `Crie UMA questão de múltipla escolha sobre a região: ${data.regiao}.

${nivelTexto}
${data.tema ? `\nTema específico: ${data.tema}` : ""}

Use exatamente 4 alternativas (A a D).
Em "imagem_label", descreva o corte de ultrassom que deveria acompanhar a
questão (ex: "Ombro · Longitudinal anterior"). O Dr. Charles anexa a imagem
depois — não invente que a imagem já existe nem se refira a ela como se o
aluno pudesse vê-la, a menos que o enunciado funcione sem ela.`,
    });

    return questao;
  });

export const reformularQuestaoQuiz = createServerFn({ method: "POST" })
  .inputValidator(
    // Entrada frouxa de propósito: a questão vem do banco, onde 'correta' e as
    // letras são texto livre (uma questão pode ter até 5 alternativas, A–E). A
    // SAÍDA (questaoSchema) continua estrita em A–D.
    z.object({
      regiao: z.string().min(1),
      nivel: z.enum(["basico", "avancado"]),
      enunciado: z.string().min(1),
      alternativas: z.array(z.object({ letra: z.string(), texto: z.string() })).min(2),
      correta: z.string(),
      explicacao: z.string().default(""),
      // Instrução livre do Charles: "deixe mais difícil", "troque a imagem por
      // corte transversal", "as alternativas estão fáceis demais". Opcional.
      instrucao: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await exigirAdmin();
    const alternativasTexto = data.alternativas
      .map((a) => `${a.letra}) ${a.texto}${a.letra === data.correta ? "  [correta]" : ""}`)
      .join("\n");

    const questao = await chamarIA({
      schema: questaoSchema,
      prompt: `Reescreva/melhore esta questão de múltipla escolha já existente sobre ${data.regiao} (nível ${data.nivel}).

Questão atual:
Enunciado: ${data.enunciado}
Alternativas:
${alternativasTexto}
Explicação atual: ${data.explicacao || "(sem explicação)"}

${
  data.instrucao
    ? `Instrução do professor: ${data.instrucao}`
    : "Mantenha o mesmo tema e objetivo de aprendizado, mas melhore clareza, precisão terminológica e a qualidade das alternativas erradas (plausíveis, não absurdas)."
}

Use exatamente 4 alternativas (A a D). Em "imagem_label", descreva o corte de
ultrassom que deveria acompanhar a questão. Preserve a intenção pedagógica
original — isto é uma revisão, não uma questão sobre outro assunto.`,
    });

    return questao;
  });

export const gerarCasoClinico = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      resumo: z.string().min(10).max(2000),
      regiao: z.string().min(1),
      numeroQuestoes: z.number().int().min(2).max(6).default(4),
    }),
  )
  .handler(async ({ data }) => {
    await exigirAdmin();
    const caso = await chamarIA({
      schema: casoSchema,
      prompt: `Monte um caso clínico completo a partir deste resumo:

"${data.resumo}"

Região: ${data.regiao}
Crie ${data.numeroQuestoes} questões, cada uma com 4 alternativas (A a D).

Estruture assim:
- apresentacao: quem é o paciente e o que ele conta (queixa, tempo, o que
  melhora e piora, contexto relevante).
- exames_fisicos: o que o exame revela — manobras, achados, o que é normal.
- questoes: em ordem de raciocínio, do reconhecimento à conduta.
- resolucao: o fecho — o raciocínio completo, o diagnóstico e a conduta, do
  jeito que um preceptor explicaria ao final da discussão.`,
    });

    return caso;
  });

export const revisarTexto = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      texto: z.string().min(1).max(10000),
      tipo: z.enum(["enunciado", "explicacao", "apresentacao", "resolucao"]),
    }),
  )
  .handler(async ({ data }) => {
    await exigirAdmin();
    const revisao = await chamarIA({
      schema: revisaoSchema,
      prompt: `Revise este texto (${data.tipo}) de material médico:

"${data.texto}"

Melhore clareza, precisão terminológica e gramática. Preserve o sentido
clínico e o tom — não reescreva a voz do autor nem acrescente informação que
não estava lá. Se estiver bom, devolva quase igual.

Em "mudancas", liste o que você alterou e por quê, em frases curtas. Se não
mudou nada relevante, devolva uma lista vazia.`,
    });

    return revisao;
  });

/**
 * Rascunho de uma estrutura do Atlas. O Charles digita o nome (e, se quiser,
 * um tema), a IA escreve os textos e ele revisa antes de salvar — mesma regra
 * do resto: nada de conteúdo médico publicado sem médico ler.
 */
export const gerarEstruturaAtlas = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      regiao: z.string().min(1),
      nome: z.string().min(1),
      tema: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await exigirAdmin();
    const estrutura = await chamarIA({
      schema: estruturaSchema,
      prompt: `Escreva a ficha de Atlas de sonoanatomia da estrutura "${data.nome}", da região ${data.regiao}.
${data.tema ? `\nRecorte pedido pelo professor: ${data.tema}` : ""}

Preencha assim:
- resumo: UMA linha, a que aparece na lista de estruturas.
- anatomia: a anatomia relevante para quem vai escanear — relações, limites,
  referências ósseas e musculares que orientam a busca.
- sonoanatomia: como a estrutura aparece no ultrassom — ecogenicidade, forma,
  planos, o que a identifica com segurança e o que a distingue do vizinho.
- escaneamento: passos práticos, um por item. Posição do paciente, transdutor
  (tipo e frequência), plano inicial e como deslizar até a janela boa.
- armadilhas: erros que realmente acontecem, um por item. Anisotropia,
  confusão com estrutura vizinha, artefato que simula lesão.
- aplicacoes_clinicas: para que serve na prática, um por item — bloqueios,
  infiltrações, achados patológicos procurados nessa janela.

Não invente medidas de referência ou valores de corte se não tiver certeza do
consenso: nesse caso, descreva o achado sem número.`,
    });

    return estrutura;
  });
