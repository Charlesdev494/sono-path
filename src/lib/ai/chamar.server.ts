// Ponte única com os provedores de IA.
//
// Todo o resto do código pede "me devolva um objeto neste formato" e não sabe
// se quem respondeu foi a OpenAI ou a Anthropic. Trocar de provedor no painel
// não mexe em nenhuma função de geração.
//
// Os dois caminhos usam saída estruturada: o provedor é obrigado a responder
// no formato do schema, em vez de devolver texto que teríamos de torcer para
// conseguir interpretar. O schema zod ainda valida a resposta no final — a
// garantia do provedor não dispensa a nossa conferência.

import { z } from "zod/v4";

import { getAIConfig } from "./config.server";

export const CONTEXTO = `Você ajuda o Dr. Charles a preparar material de ensino de
sonoanatomia e ultrassonografia musculoesquelética para médicos brasileiros —
anestesistas, ortopedistas, radiologistas e especialistas em dor.

Diretrizes:
- Escreva em português do Brasil, com a terminologia anatômica correta.
- O público são médicos: seja técnico e preciso, sem simplificar demais.
- Baseie-se em consenso estabelecido. Se um dado for controverso ou você não
  tiver certeza, diga isso na explicação em vez de afirmar com convicção.
- Alternativas erradas devem ser plausíveis (erros que um médico realmente
  cometeria), nunca absurdas — questão fácil demais não ensina.
- A explicação é onde o aluno aprende: diga por que a certa está certa E por
  que as erradas estão erradas.

O que você produz é rascunho. Um médico revisa tudo antes de publicar.`;

/**
 * JSON Schema no formato que os dois provedores aceitam no modo estrito:
 * todo campo obrigatório e nada além do declarado.
 */
function jsonSchemaDe(schema: z.ZodType) {
  const js = z.toJSONSchema(schema, { target: "draft-2020-12" }) as Record<string, unknown>;
  // O $schema é metadado nosso; o modo estrito da OpenAI recusa chaves que não
  // fazem parte da descrição do formato.
  delete js.$schema;
  return js;
}

// O genérico é o próprio schema (não o tipo resultante) para o TypeScript
// inferir o formato da resposta a partir dele — é o que faz o retorno chegar
// tipado em quem chama.
export async function chamarIA<S extends z.ZodType>(params: {
  schema: S;
  prompt: string;
}): Promise<z.infer<S>> {
  const config = await getAIConfig();
  if (!config.habilitado || !config.apiKey) {
    // Rede de segurança: a interface já esconde os botões sem chave, mas a
    // função precisa recusar por conta própria.
    throw new Error("IA_DESABILITADA");
  }

  const bruto =
    config.provedor === "anthropic"
      ? await viaAnthropic({ ...params, apiKey: config.apiKey, modelo: config.modelo })
      : await viaOpenAI({ ...params, apiKey: config.apiKey, modelo: config.modelo });

  // Mesmo com saída estruturada, validamos: é o schema que garante o formato
  // para quem chamou, não a promessa do provedor.
  const conferido = params.schema.safeParse(bruto);
  if (!conferido.success) throw new Error("IA_SEM_RESPOSTA");
  return conferido.data;
}

type Chamada = { schema: z.ZodType; prompt: string; apiKey: string; modelo: string };

async function viaOpenAI({ schema, prompt, apiKey, modelo }: Chamada): Promise<unknown> {
  // Import dinâmico: mantém o SDK fora do bundle enquanto a IA não for usada.
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });

  const resposta = await client.responses.create({
    model: modelo,
    instructions: CONTEXTO,
    input: prompt,
    max_output_tokens: 16000,
    text: {
      format: {
        type: "json_schema",
        name: "resposta",
        strict: true,
        schema: jsonSchemaDe(schema),
      },
    },
  });

  // A recusa vem como um item de conteúdo próprio, não como texto.
  for (const item of resposta.output ?? []) {
    if (item.type !== "message") continue;
    for (const parte of item.content ?? []) {
      if (parte.type === "refusal") throw new Error("IA_RECUSOU");
    }
  }
  if (resposta.status === "incomplete") throw new Error("IA_SEM_RESPOSTA");

  const texto = resposta.output_text;
  if (!texto) throw new Error("IA_SEM_RESPOSTA");
  try {
    return JSON.parse(texto);
  } catch {
    throw new Error("IA_SEM_RESPOSTA");
  }
}

async function viaAnthropic({ schema, prompt, apiKey, modelo }: Chamada): Promise<unknown> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const resposta = await client.messages.create({
    model: modelo,
    max_tokens: 16000,
    system: CONTEXTO,
    messages: [{ role: "user", content: prompt }],
    output_config: {
      format: {
        type: "json_schema",
        schema: jsonSchemaDe(schema),
      },
    },
  } as Parameters<typeof client.messages.create>[0]);

  if ("stop_reason" in resposta && resposta.stop_reason === "refusal") {
    throw new Error("IA_RECUSOU");
  }

  const bloco =
    "content" in resposta
      ? resposta.content.find((c): c is Extract<typeof c, { type: "text" }> => c.type === "text")
      : undefined;
  if (!bloco) throw new Error("IA_SEM_RESPOSTA");
  try {
    return JSON.parse(bloco.text);
  } catch {
    throw new Error("IA_SEM_RESPOSTA");
  }
}

/**
 * Bate na API só para confirmar que a chave funciona. Usado pelo botão "Testar
 * conexão" do painel — é melhor descobrir que a chave está errada ali do que
 * no meio da criação de uma questão.
 */
export async function testarChave(params: {
  provedor: "openai" | "anthropic";
  apiKey: string;
  modelo: string;
}): Promise<{ ok: true } | { ok: false; erro: string }> {
  try {
    if (params.provedor === "openai") {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: params.apiKey });
      await client.responses.create({
        model: params.modelo,
        input: "Responda apenas: ok",
        max_output_tokens: 16,
      });
    } else {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: params.apiKey });
      await client.messages.create({
        model: params.modelo,
        max_tokens: 16,
        messages: [{ role: "user", content: "Responda apenas: ok" }],
      });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : String(e) };
  }
}
