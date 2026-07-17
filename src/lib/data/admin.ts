// Camada de dados do painel do admin.
//
// Diferença em relação a lib/data/content.ts: lá é leitura para o aluno; aqui é
// escrita. Nenhuma função abaixo checa permissão — quem faz isso é a RLS no
// banco. Se um dia esta camada for chamada por engano de uma tela de aluno, o
// banco recusa. É de propósito: uma regra, um lugar.

import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "../supabase/client";
import type { Database } from "../supabase/database.types";

export type QuizRow = Database["public"]["Tables"]["quiz_questions"]["Row"];
export type QuizInsert = Database["public"]["Tables"]["quiz_questions"]["Insert"];
export type CasoRow = Database["public"]["Tables"]["clinical_cases"]["Row"];
export type CasoQuestaoRow = Database["public"]["Tables"]["case_questions"]["Row"];

export type Alternativa = { letra: string; texto: string };

const BUCKET = "content-images";

// ---------------------------------------------------------------------------
// listagens (o admin enxerga rascunho também — a RLS cuida disso)
// ---------------------------------------------------------------------------
export const adminQuizListQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "quiz"],
    queryFn: async (): Promise<QuizRow[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const adminQuizQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["admin", "quiz", id],
    queryFn: async (): Promise<QuizRow | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const adminCasosListQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "casos"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("clinical_cases")
        .select("*, case_questions(count)")
        .order("semana");
      if (error) throw error;
      return data as (CasoRow & { case_questions: { count: number }[] })[];
    },
  });

export const adminCasoQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["admin", "caso", id],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("clinical_cases")
        .select("*, case_questions(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const caso = data as CasoRow & { case_questions: CasoQuestaoRow[] };
      return {
        ...caso,
        case_questions: [...caso.case_questions].sort((a, b) => a.ordem - b.ordem),
      };
    },
  });

export const regioesQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "regioes"],
    queryFn: async (): Promise<string[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("regioes_existentes");
      if (error) throw error;
      return [...new Set((data ?? []).map((r) => r.regiao))].sort();
    },
  });

export const statsOverviewQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "stats", "overview"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("admin_stats_overview");
      if (error) throw error;
      return data[0] ?? null;
    },
  });

export const statsQuizQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "stats", "quiz"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("admin_stats_quiz");
      if (error) throw error;
      return data ?? [];
    },
  });

export const statsAtividadeQueryOptions = (dias: number) =>
  queryOptions({
    queryKey: ["admin", "stats", "atividade", dias],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("admin_stats_atividade", { p_dias: dias });
      if (error) throw error;
      return data ?? [];
    },
  });

export const statsRegioesQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "stats", "regioes"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("admin_stats_regioes");
      if (error) throw error;
      return data ?? [];
    },
  });

export const statsNiveisQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "stats", "niveis"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("admin_stats_niveis");
      if (error) throw error;
      return data ?? [];
    },
  });

export const alunosQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "alunos"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc("admin_alunos");
      if (error) throw error;
      return data ?? [];
    },
  });

// ---------------------------------------------------------------------------
// escrita
// ---------------------------------------------------------------------------
function invalidarConteudo(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["admin"] });
  // as telas do aluno leem por estas chaves; sem isto, o Charles publica e não
  // vê a mudança no preview
  qc.invalidateQueries({ queryKey: ["quiz"] });
  qc.invalidateQueries({ queryKey: ["casos"] });
  qc.invalidateQueries({ queryKey: ["atlas"] });
}

export function useSalvarQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (q: QuizInsert & { id?: string }) => {
      const supabase = getSupabaseBrowserClient();
      if (q.id) {
        const { id, ...campos } = q;
        const { data, error } = await supabase
          .from("quiz_questions")
          .update(campos)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("quiz_questions").insert(q).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidarConteudo(qc),
  });
}

export function useExcluirQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidarConteudo(qc),
  });
}

export function useDuplicarQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (original: QuizRow) => {
      const supabase = getSupabaseBrowserClient();
      // A cópia nasce como rascunho: duplicar é ponto de partida para editar,
      // não para publicar duas questões iguais sem querer.
      const { id, created_at, updated_at, ...campos } = original;
      const { data, error } = await supabase
        .from("quiz_questions")
        .insert({
          ...campos,
          slug: `${original.slug}-copia-${Date.now().toString(36)}`,
          enunciado: `[Cópia] ${original.enunciado}`,
          status: "rascunho",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidarConteudo(qc),
  });
}

export function useSalvarCaso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      caso: Partial<CasoRow> & { id?: string };
      questoes: (Partial<CasoQuestaoRow> & { _novo?: boolean })[];
      questoesRemovidas: string[];
    }) => {
      const supabase = getSupabaseBrowserClient();
      let casoId = vars.caso.id;

      if (casoId) {
        const { id, ...campos } = vars.caso;
        const { error } = await supabase.from("clinical_cases").update(campos).eq("id", casoId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("clinical_cases")
          .insert(vars.caso as never)
          .select()
          .single();
        if (error) throw error;
        casoId = data.id;
      }

      if (vars.questoesRemovidas.length) {
        const { error } = await supabase
          .from("case_questions")
          .delete()
          .in("id", vars.questoesRemovidas);
        if (error) throw error;
      }

      for (const [i, q] of vars.questoes.entries()) {
        const linha = {
          case_id: casoId!,
          slug: q.slug || `q${i + 1}`,
          pergunta: q.pergunta ?? "",
          alternativas: q.alternativas ?? [],
          correta: q.correta ?? "A",
          comentario: q.comentario ?? "",
          imagem_label: q.imagem_label ?? null,
          imagem_url: q.imagem_url ?? null,
          ordem: i,
        };
        if (q.id && !q._novo) {
          const { error } = await supabase.from("case_questions").update(linha).eq("id", q.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("case_questions").insert(linha);
          if (error) throw error;
        }
      }

      return casoId!;
    },
    onSuccess: () => invalidarConteudo(qc),
  });
}

export function useExcluirCaso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      // as questões caem por cascade (FK on delete cascade)
      const { error } = await supabase.from("clinical_cases").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidarConteudo(qc),
  });
}

// ---------------------------------------------------------------------------
// upload de imagem
// ---------------------------------------------------------------------------
const TIPOS_ACEITOS = ["image/png", "image/jpeg", "image/webp"];
const TAMANHO_MAX = 10 * 1024 * 1024;

export function useEnviarImagem() {
  return useMutation({
    mutationFn: async (arquivo: File): Promise<string> => {
      if (!TIPOS_ACEITOS.includes(arquivo.type)) {
        throw new Error("Formato não aceito. Use PNG, JPG ou WebP.");
      }
      if (arquivo.size > TAMANHO_MAX) {
        throw new Error(
          `Imagem muito grande (${(arquivo.size / 1024 / 1024).toFixed(1)} MB). O limite é 10 MB.`,
        );
      }

      const supabase = getSupabaseBrowserClient();
      // nome estável e sem colisão: data + aleatório + nome limpo do arquivo
      const limpo = arquivo.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9.]+/g, "-");
      const caminho = `admin/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}-${limpo}`;

      const { error } = await supabase.storage.from(BUCKET).upload(caminho, arquivo, {
        contentType: arquivo.type,
        upsert: false,
      });
      if (error) throw new Error(`Não foi possível enviar a imagem: ${error.message}`);

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
      return data.publicUrl;
    },
  });
}
