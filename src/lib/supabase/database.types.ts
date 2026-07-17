// Gerado a partir do schema do Supabase. NÃO editar à mão.
// Regerar:  npm run types:gen

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      atlas_regions: {
        Row: {
          created_at: string
          descricao: string
          icone: string
          id: string
          nome: string
          ordem: number
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string
          icone?: string
          id?: string
          nome: string
          ordem?: number
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          icone?: string
          id?: string
          nome?: string
          ordem?: number
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      atlas_structures: {
        Row: {
          anatomia: string
          aplicacoes_clinicas: Json
          armadilha_imagens: Json
          armadilhas: Json
          comparacoes: Json
          created_at: string
          escaneamento: Json
          id: string
          imagens: Json
          nome: string
          ordem: number
          origem: Database["public"]["Enums"]["content_origin"]
          region_id: string
          resumo: string
          slug: string
          sonoanatomia: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          volumes: Json
        }
        Insert: {
          anatomia?: string
          aplicacoes_clinicas?: Json
          armadilha_imagens?: Json
          armadilhas?: Json
          comparacoes?: Json
          created_at?: string
          escaneamento?: Json
          id?: string
          imagens?: Json
          nome: string
          ordem?: number
          origem?: Database["public"]["Enums"]["content_origin"]
          region_id: string
          resumo?: string
          slug: string
          sonoanatomia?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          volumes?: Json
        }
        Update: {
          anatomia?: string
          aplicacoes_clinicas?: Json
          armadilha_imagens?: Json
          armadilhas?: Json
          comparacoes?: Json
          created_at?: string
          escaneamento?: Json
          id?: string
          imagens?: Json
          nome?: string
          ordem?: number
          origem?: Database["public"]["Enums"]["content_origin"]
          region_id?: string
          resumo?: string
          slug?: string
          sonoanatomia?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          volumes?: Json
        }
        Relationships: [
          {
            foreignKeyName: "atlas_structures_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "atlas_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          descricao: string
          icone: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          descricao: string
          icone?: string
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          descricao?: string
          icone?: string
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      case_questions: {
        Row: {
          alternativas: Json
          case_id: string
          comentario: string
          correta: string
          created_at: string
          id: string
          imagem_label: string | null
          imagem_url: string | null
          ordem: number
          pergunta: string
          slug: string
          updated_at: string
        }
        Insert: {
          alternativas?: Json
          case_id: string
          comentario?: string
          correta: string
          created_at?: string
          id?: string
          imagem_label?: string | null
          imagem_url?: string | null
          ordem?: number
          pergunta: string
          slug: string
          updated_at?: string
        }
        Update: {
          alternativas?: Json
          case_id?: string
          comentario?: string
          correta?: string
          created_at?: string
          id?: string
          imagem_label?: string | null
          imagem_url?: string | null
          ordem?: number
          pergunta?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_questions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "clinical_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_cases: {
        Row: {
          apresentacao: string
          created_at: string
          created_by: string | null
          exames_fisicos: string
          id: string
          imagem_label: string | null
          imagem_url: string | null
          origem: Database["public"]["Enums"]["content_origin"]
          regiao: string
          resolucao: string
          semana: number
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          titulo: string
          updated_at: string
        }
        Insert: {
          apresentacao?: string
          created_at?: string
          created_by?: string | null
          exames_fisicos?: string
          id?: string
          imagem_label?: string | null
          imagem_url?: string | null
          origem?: Database["public"]["Enums"]["content_origin"]
          regiao: string
          resolucao?: string
          semana?: number
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          titulo: string
          updated_at?: string
        }
        Update: {
          apresentacao?: string
          created_at?: string
          created_by?: string | null
          exames_fisicos?: string
          id?: string
          imagem_label?: string | null
          imagem_url?: string | null
          origem?: Database["public"]["Enums"]["content_origin"]
          regiao?: string
          resolucao?: string
          semana?: number
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_audit_log: {
        Row: {
          acao: string
          actor_id: string | null
          created_at: string
          dados_antes: Json | null
          dados_depois: Json | null
          id: number
          registro_id: string | null
          tabela: string
        }
        Insert: {
          acao: string
          actor_id?: string | null
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: number
          registro_id?: string | null
          tabela: string
        }
        Update: {
          acao?: string
          actor_id?: string | null
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: number
          registro_id?: string | null
          tabela?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          destinatario_id: string
          id: string
          solicitante_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          destinatario_id: string
          id?: string
          solicitante_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          destinatario_id?: string
          id?: string
          solicitante_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_log: {
        Row: {
          chave: string | null
          corpo: string
          entregue: boolean
          enviado_em: string
          erro: string | null
          id: number
          tipo: Database["public"]["Enums"]["notif_tipo"]
          titulo: string
          user_id: string
        }
        Insert: {
          chave?: string | null
          corpo: string
          entregue?: boolean
          enviado_em?: string
          erro?: string | null
          id?: number
          tipo: Database["public"]["Enums"]["notif_tipo"]
          titulo: string
          user_id: string
        }
        Update: {
          chave?: string | null
          corpo?: string
          entregue?: boolean
          enviado_em?: string
          erro?: string | null
          id?: number
          tipo?: Database["public"]["Enums"]["notif_tipo"]
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points_events: {
        Row: {
          created_at: string
          id: number
          motivo: Database["public"]["Enums"]["point_reason"]
          pontos: number
          referencia_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          motivo: Database["public"]["Enums"]["point_reason"]
          pontos: number
          referencia_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          motivo?: Database["public"]["Enums"]["point_reason"]
          pontos?: number
          referencia_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aparece_no_ranking: boolean
          avatar_url: string | null
          cidade: string
          created_at: string
          especialidade: string
          id: string
          nome: string
          notif_conquista: boolean
          notif_lembrete: boolean
          notif_nivel: boolean
          notif_ranking: boolean
          onboarding_completo: boolean
          role: Database["public"]["Enums"]["user_role"]
          tem_us: boolean
          tempo_formado: string
          trabalha_dor: boolean
          updated_at: string
        }
        Insert: {
          aparece_no_ranking?: boolean
          avatar_url?: string | null
          cidade?: string
          created_at?: string
          especialidade?: string
          id: string
          nome?: string
          notif_conquista?: boolean
          notif_lembrete?: boolean
          notif_nivel?: boolean
          notif_ranking?: boolean
          onboarding_completo?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          tem_us?: boolean
          tempo_formado?: string
          trabalha_dor?: boolean
          updated_at?: string
        }
        Update: {
          aparece_no_ranking?: boolean
          avatar_url?: string | null
          cidade?: string
          created_at?: string
          especialidade?: string
          id?: string
          nome?: string
          notif_conquista?: boolean
          notif_lembrete?: boolean
          notif_nivel?: boolean
          notif_ranking?: boolean
          onboarding_completo?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          tem_us?: boolean
          tempo_formado?: string
          trabalha_dor?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      push_fila: {
        Row: {
          chave: string | null
          corpo: string
          criado_em: string
          id: number
          processado_em: string | null
          tipo: Database["public"]["Enums"]["notif_tipo"]
          titulo: string
          url: string
          user_id: string
        }
        Insert: {
          chave?: string | null
          corpo: string
          criado_em?: string
          id?: number
          processado_em?: string | null
          tipo: Database["public"]["Enums"]["notif_tipo"]
          titulo: string
          url?: string
          user_id: string
        }
        Update: {
          chave?: string | null
          corpo?: string
          criado_em?: string
          id?: number
          processado_em?: string | null
          tipo?: Database["public"]["Enums"]["notif_tipo"]
          titulo?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_fila_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          invalida_em: string | null
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          invalida_em?: string | null
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          invalida_em?: string | null
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          alternativas: Json
          caso: string | null
          correta: string
          created_at: string
          created_by: string | null
          enunciado: string
          explicacao: string
          id: string
          imagem_label: string | null
          imagem_url: string | null
          nivel: Database["public"]["Enums"]["quiz_level"]
          ordem: number
          origem: Database["public"]["Enums"]["content_origin"]
          regiao: string
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          alternativas?: Json
          caso?: string | null
          correta: string
          created_at?: string
          created_by?: string | null
          enunciado: string
          explicacao?: string
          id?: string
          imagem_label?: string | null
          imagem_url?: string | null
          nivel?: Database["public"]["Enums"]["quiz_level"]
          ordem?: number
          origem?: Database["public"]["Enums"]["content_origin"]
          regiao: string
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          alternativas?: Json
          caso?: string | null
          correta?: string
          created_at?: string
          created_by?: string | null
          enunciado?: string
          explicacao?: string
          id?: string
          imagem_label?: string | null
          imagem_url?: string | null
          nivel?: Database["public"]["Enums"]["quiz_level"]
          ordem?: number
          origem?: Database["public"]["Enums"]["content_origin"]
          regiao?: string
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_answers: {
        Row: {
          acertou: boolean
          case_question_id: string | null
          created_at: string
          id: string
          origem: Database["public"]["Enums"]["answer_source"]
          pontos_ganhos: number
          quiz_question_id: string | null
          resposta: string
          user_id: string
        }
        Insert: {
          acertou: boolean
          case_question_id?: string | null
          created_at?: string
          id?: string
          origem: Database["public"]["Enums"]["answer_source"]
          pontos_ganhos?: number
          quiz_question_id?: string | null
          resposta: string
          user_id: string
        }
        Update: {
          acertou?: boolean
          case_question_id?: string | null
          created_at?: string
          id?: string
          origem?: Database["public"]["Enums"]["answer_source"]
          pontos_ganhos?: number
          quiz_question_id?: string | null
          resposta?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_case_question_id_fkey"
            columns: ["case_question_id"]
            isOneToOne: false
            referencedRelation: "case_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_quiz_question_id_fkey"
            columns: ["quiz_question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_slug: string
          conquistado_em: string
          user_id: string
        }
        Insert: {
          badge_slug: string
          conquistado_em?: string
          user_id: string
        }
        Update: {
          badge_slug?: string
          conquistado_em?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_slug_fkey"
            columns: ["badge_slug"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          atlas_visitados: string[]
          missoes_hoje: string[]
          missoes_hoje_data: string | null
          pontos: number
          streak: number
          ultimo_acesso: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          atlas_visitados?: string[]
          missoes_hoje?: string[]
          missoes_hoje_data?: string | null
          pontos?: number
          streak?: number
          ultimo_acesso?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          atlas_visitados?: string[]
          missoes_hoje?: string[]
          missoes_hoje_data?: string | null
          pontos?: number
          streak?: number
          ultimo_acesso?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_aluno_atividade: {
        Args: { p_dias?: number; p_user_id: string }
        Returns: {
          acertos: number
          dia: string
          erros: number
        }[]
      }
      admin_aluno_regioes: {
        Args: { p_user_id: string }
        Returns: {
          acertos: number
          regiao: string
          respostas: number
          taxa_acerto: number
        }[]
      }
      admin_aluno_resumo: {
        Args: { p_user_id: string }
        Returns: {
          acertos: number
          casos_concluidos: number
          cidade: string
          criado_em: string
          erros: number
          especialidade: string
          nivel: number
          nome: string
          pontos: number
          respostas: number
          streak: number
          taxa_acerto: number
          ultimo_acesso: string
          user_id: string
        }[]
      }
      admin_alunos: {
        Args: never
        Returns: {
          acertos: number
          cidade: string
          criado_em: string
          especialidade: string
          nivel: number
          nome: string
          pontos: number
          respostas: number
          streak: number
          taxa_acerto: number
          ultimo_acesso: string
          user_id: string
        }[]
      }
      admin_stats_atividade: {
        Args: { p_dias?: number }
        Returns: {
          acertos: number
          alunos_ativos: number
          dia: string
          erros: number
        }[]
      }
      admin_stats_niveis: {
        Args: never
        Returns: {
          alunos: number
          nivel: number
        }[]
      }
      admin_stats_overview: {
        Args: never
        Returns: {
          acertos_total: number
          ativos_30d: number
          ativos_7d: number
          casos_publicados: number
          erros_total: number
          estruturas_publicadas: number
          quiz_publicados: number
          quiz_rascunhos: number
          respostas_total: number
          streak_medio: number
          taxa_acerto: number
          usuarios_novos_7d: number
          usuarios_total: number
        }[]
      }
      admin_stats_quiz: {
        Args: never
        Returns: {
          acertos: number
          enunciado: string
          nivel: Database["public"]["Enums"]["quiz_level"]
          question_id: string
          regiao: string
          respostas: number
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          taxa_acerto: number
        }[]
      }
      admin_stats_regioes: {
        Args: never
        Returns: {
          acertos: number
          questoes: number
          regiao: string
          respostas: number
          taxa_acerto: number
        }[]
      }
      alternativa_existe: {
        Args: { p_alternativas: Json; p_letra: string }
        Returns: boolean
      }
      buscar_usuarios: {
        Args: { p_termo: string }
        Returns: {
          avatar_url: string
          nivel: number
          nome: string
          situacao: string
          user_id: string
        }[]
      }
      concluir_caso: { Args: { p_caso_id: string }; Returns: number }
      conquistas_de: {
        Args: { p_user_id: string }
        Returns: {
          conquistado_em: string
          descricao: string
          icone: string
          nome: string
          slug: string
        }[]
      }
      delete_own_account: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      marcar_missao: { Args: { p_missao: string }; Returns: string[] }
      meus_amigos: {
        Args: never
        Returns: {
          avatar_url: string
          eu_solicitei: boolean
          friendship_id: string
          nivel: number
          nome: string
          pontos: number
          status: Database["public"]["Enums"]["friendship_status"]
          user_id: string
        }[]
      }
      minha_posicao: {
        Args: { p_escopo?: string; p_periodo?: string }
        Returns: {
          pontos: number
          posicao: number
          total_participantes: number
        }[]
      }
      nivel_de: { Args: { p_pontos: number }; Returns: number }
      push_alvos_inatividade: {
        Args: { p_dias?: number }
        Returns: {
          dias_parado: number
          nome: string
          streak: number
          user_id: string
        }[]
      }
      push_alvos_ranking: {
        Args: never
        Returns: {
          nome: string
          pontos: number
          posicao: number
          total: number
          user_id: string
        }[]
      }
      push_inscricoes_de: {
        Args: { p_user_id: string }
        Returns: {
          auth: string
          endpoint: string
          id: string
          p256dh: string
        }[]
      }
      ranking: {
        Args: { p_escopo?: string; p_limite?: number; p_periodo?: string }
        Returns: {
          avatar_url: string
          e_voce: boolean
          nivel: number
          nome: string
          pontos: number
          posicao: number
          user_id: string
        }[]
      }
      regioes_existentes: {
        Args: never
        Returns: {
          regiao: string
          total: number
        }[]
      }
      registrar_resposta: {
        Args: {
          p_origem: Database["public"]["Enums"]["answer_source"]
          p_questao_id: string
          p_resposta: string
        }
        Returns: {
          acertou: boolean
          pontos_ganhos: number
          pontos_total: number
        }[]
      }
      registrar_visita_atlas: {
        Args: { p_slug: string }
        Returns: {
          pontos_ganhos: number
          visitados: string[]
        }[]
      }
      touch_streak: {
        Args: never
        Returns: {
          streak: number
          ultimo_acesso: string
        }[]
      }
      verificar_conquistas: {
        Args: never
        Returns: {
          descricao: string
          icone: string
          nome: string
          slug: string
        }[]
      }
    }
    Enums: {
      answer_source: "quiz" | "caso"
      content_origin: "manual" | "ia"
      content_status: "rascunho" | "publicado"
      friendship_status: "pendente" | "aceito" | "recusado"
      notif_tipo:
        | "lembrete_inatividade"
        | "streak_em_risco"
        | "conquista"
        | "subiu_nivel"
        | "ranking_semanal"
      point_reason: "quiz" | "caso_questao" | "caso_bonus" | "atlas"
      quiz_level: "basico" | "avancado"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      answer_source: ["quiz", "caso"],
      content_origin: ["manual", "ia"],
      content_status: ["rascunho", "publicado"],
      friendship_status: ["pendente", "aceito", "recusado"],
      notif_tipo: [
        "lembrete_inatividade",
        "streak_em_risco",
        "conquista",
        "subiu_nivel",
        "ranking_semanal",
      ],
      point_reason: ["quiz", "caso_questao", "caso_bonus", "atlas"],
      quiz_level: ["basico", "avancado"],
      user_role: ["user", "admin"],
    },
  },
} as const
