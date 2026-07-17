// Leitura do conteúdo, agora vindo do banco em vez de src/content/*.ts.
//
// Os tipos abaixo espelham o formato que os componentes já consumiam
// (imagemUrl, aplicacoesClinicas, ...), então as telas mudaram pouco: o que
// muda é a origem dos dados. As funções mapeiam snake_case do banco para o
// camelCase que o app usa.
//
// Nenhuma query filtra por status: a RLS já garante que aluno só recebe
// conteúdo publicado, e o admin recebe rascunho também. Filtrar aqui seria
// duplicar a regra em dois lugares — e um dia elas divergiriam.

import { queryOptions } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "../supabase/client";
import type { Database } from "../supabase/database.types";

type QuizRow = Database["public"]["Tables"]["quiz_questions"]["Row"];
type CasoRow = Database["public"]["Tables"]["clinical_cases"]["Row"];
type CasoQuestaoRow = Database["public"]["Tables"]["case_questions"]["Row"];
type RegiaoRow = Database["public"]["Tables"]["atlas_regions"]["Row"];
type EstruturaRow = Database["public"]["Tables"]["atlas_structures"]["Row"];

export type QuizLetra = "A" | "B" | "C" | "D" | "E";
export type Alternativa = { letra: QuizLetra; texto: string };
export type AtlasImage = { url: string; legenda: string };
export type AtlasImagePair = { raw: AtlasImage; anotada: AtlasImage; legenda?: string };

export type QuizQuestion = {
  id: string;
  slug: string;
  regiao: string;
  nivel: "basico" | "avancado";
  enunciado: string;
  imagemLabel?: string;
  imagemUrl?: string;
  caso?: string;
  alternativas: Alternativa[];
  correta: QuizLetra;
  explicacao: string;
};

export type CasoQuestao = {
  id: string;
  pergunta: string;
  alternativas: Alternativa[];
  correta: QuizLetra;
  comentario: string;
  imagemUrl?: string;
  imagemLabel?: string;
};

export type CasoClinico = {
  id: string;
  slug: string;
  semana: number;
  titulo: string;
  regiao: string;
  imagemUrl?: string;
  imagemLabel?: string;
  apresentacao: string;
  examesFisicos: string;
  questoes: CasoQuestao[];
  resolucao: string;
};

export type AtlasStructure = {
  id: string;
  slug: string;
  nome: string;
  resumo: string;
  anatomia: string;
  sonoanatomia: string;
  escaneamento: string[];
  armadilhas: string[];
  armadilhaImagens: AtlasImage[];
  aplicacoesClinicas: string[];
  volumes: string[];
  imagens: AtlasImage[];
  comparacoes: AtlasImagePair[];
};

export type AtlasRegion = {
  id: string;
  slug: string;
  nome: string;
  icone: string;
  descricao: string;
  estruturas: AtlasStructure[];
};

// O banco guarda listas em jsonb; do lado do TS chegam como `Json`, então
// convertemos com um default seguro em vez de confiar no cast.
function lista<T>(valor: unknown): T[] {
  return Array.isArray(valor) ? (valor as T[]) : [];
}

function mapQuiz(row: QuizRow): QuizQuestion {
  return {
    id: row.id,
    slug: row.slug,
    regiao: row.regiao,
    nivel: row.nivel,
    enunciado: row.enunciado,
    imagemLabel: row.imagem_label ?? undefined,
    imagemUrl: row.imagem_url ?? undefined,
    caso: row.caso ?? undefined,
    alternativas: lista<Alternativa>(row.alternativas),
    correta: row.correta as QuizLetra,
    explicacao: row.explicacao,
  };
}

function mapCasoQuestao(row: CasoQuestaoRow): CasoQuestao {
  return {
    id: row.id,
    pergunta: row.pergunta,
    alternativas: lista<Alternativa>(row.alternativas),
    correta: row.correta as QuizLetra,
    comentario: row.comentario,
    imagemUrl: row.imagem_url ?? undefined,
    imagemLabel: row.imagem_label ?? undefined,
  };
}

function mapCaso(row: CasoRow & { case_questions: CasoQuestaoRow[] }): CasoClinico {
  return {
    id: row.id,
    slug: row.slug,
    semana: row.semana,
    titulo: row.titulo,
    regiao: row.regiao,
    imagemUrl: row.imagem_url ?? undefined,
    imagemLabel: row.imagem_label ?? undefined,
    apresentacao: row.apresentacao,
    examesFisicos: row.exames_fisicos,
    resolucao: row.resolucao,
    questoes: [...row.case_questions].sort((a, b) => a.ordem - b.ordem).map(mapCasoQuestao),
  };
}

function mapEstrutura(row: EstruturaRow): AtlasStructure {
  return {
    id: row.id,
    slug: row.slug,
    nome: row.nome,
    resumo: row.resumo,
    anatomia: row.anatomia,
    sonoanatomia: row.sonoanatomia,
    escaneamento: lista<string>(row.escaneamento),
    armadilhas: lista<string>(row.armadilhas),
    armadilhaImagens: lista<AtlasImage>(row.armadilha_imagens),
    aplicacoesClinicas: lista<string>(row.aplicacoes_clinicas),
    volumes: lista<string>(row.volumes),
    imagens: lista<AtlasImage>(row.imagens),
    comparacoes: lista<AtlasImagePair>(row.comparacoes),
  };
}

// ---------------------------------------------------------------------------
// queries
// ---------------------------------------------------------------------------
export const quizQueryOptions = () =>
  queryOptions({
    queryKey: ["quiz"],
    queryFn: async (): Promise<QuizQuestion[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from("quiz_questions").select("*").order("ordem");
      if (error) throw error;
      return data.map(mapQuiz);
    },
  });

export const casosQueryOptions = () =>
  queryOptions({
    queryKey: ["casos"],
    queryFn: async (): Promise<CasoClinico[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("clinical_cases")
        .select("*, case_questions(*)")
        .order("semana");
      if (error) throw error;
      return (data as (CasoRow & { case_questions: CasoQuestaoRow[] })[]).map(mapCaso);
    },
  });

export const atlasQueryOptions = () =>
  queryOptions({
    queryKey: ["atlas"],
    queryFn: async (): Promise<AtlasRegion[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("atlas_regions")
        .select("*, atlas_structures(*)")
        .order("ordem");
      if (error) throw error;
      return (data as (RegiaoRow & { atlas_structures: EstruturaRow[] })[]).map((r) => ({
        id: r.id,
        slug: r.slug,
        nome: r.nome,
        icone: r.icone,
        descricao: r.descricao,
        estruturas: [...r.atlas_structures].sort((a, b) => a.ordem - b.ordem).map(mapEstrutura),
      }));
    },
  });
