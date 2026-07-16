-- =============================================================================
-- US360 · v2 — Schema inicial
-- =============================================================================
-- Fase 1 do escopo v2: tira o conteúdo do código-fonte e o progresso do
-- localStorage, colocando ambos no banco.
--
-- Princípio de segurança desta migration: a regra "só o Charles edita
-- conteúdo" é imposta pelo BANCO (RLS), não pela interface. Um token roubado
-- batendo direto na API REST continua sem conseguir escrever em quiz,
-- casos ou atlas.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('user', 'admin');
create type public.content_status as enum ('rascunho', 'publicado');
create type public.content_origin as enum ('manual', 'ia');
create type public.quiz_level as enum ('basico', 'avancado');
create type public.answer_source as enum ('quiz', 'caso');

-- ---------------------------------------------------------------------------
-- Validação das alternativas
-- ---------------------------------------------------------------------------
-- CHECK não aceita subquery, então a verificação "a letra correta existe entre
-- as alternativas" mora aqui dentro. Marcada immutable para poder ser usada em
-- constraint. Impede o gabarito apontar para uma alternativa que não existe —
-- erro fácil de cometer no editor do painel admin.
create or replace function public.alternativa_existe(p_alternativas jsonb, p_letra text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_alternativas) as e
    where e ->> 'letra' = p_letra
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles — espelha auth.users com os dados do onboarding
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  especialidade text not null default '',
  cidade text not null default '',
  tempo_formado text not null default '',
  tem_us boolean not null default false,
  trabalha_dor boolean not null default false,
  avatar_url text,
  role public.user_role not null default 'user',
  -- Fase 3: permite sair do ranking global sem perder o progresso.
  aparece_no_ranking boolean not null default true,
  onboarding_completo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.role is
  'Autorização do app. Só admin escreve conteúdo. Alterado apenas por outro admin (ver trigger guard_role_change).';

-- ---------------------------------------------------------------------------
-- Conteúdo: quiz
-- ---------------------------------------------------------------------------
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  -- slug legível, herda os ids atuais ("q1", "q2"...) e serve de chave estável
  slug text not null unique,
  regiao text not null,
  nivel public.quiz_level not null default 'basico',
  enunciado text not null,
  caso text,
  imagem_label text,
  imagem_url text,
  -- [{"letra": "A", "texto": "..."}, ...]
  alternativas jsonb not null default '[]'::jsonb,
  correta text not null,
  explicacao text not null default '',
  status public.content_status not null default 'rascunho',
  origem public.content_origin not null default 'manual',
  ordem integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint quiz_alternativas_e_lista check (jsonb_typeof(alternativas) = 'array'),
  constraint quiz_min_duas_alternativas check (jsonb_array_length(alternativas) >= 2),
  constraint quiz_correta_valida check (correta ~ '^[A-E]$'),
  -- a letra correta precisa existir entre as alternativas
  constraint quiz_correta_existe check (public.alternativa_existe(alternativas, correta))
);

create index quiz_questions_status_idx on public.quiz_questions (status);
create index quiz_questions_regiao_idx on public.quiz_questions (regiao);
create index quiz_questions_nivel_idx on public.quiz_questions (nivel);

-- ---------------------------------------------------------------------------
-- Conteúdo: casos clínicos
-- ---------------------------------------------------------------------------
create table public.clinical_cases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  semana integer not null default 0,
  titulo text not null,
  regiao text not null,
  imagem_label text,
  imagem_url text,
  apresentacao text not null default '',
  exames_fisicos text not null default '',
  resolucao text not null default '',
  status public.content_status not null default 'rascunho',
  origem public.content_origin not null default 'manual',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clinical_cases_status_idx on public.clinical_cases (status);
create index clinical_cases_semana_idx on public.clinical_cases (semana);

create table public.case_questions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.clinical_cases (id) on delete cascade,
  slug text not null,
  pergunta text not null,
  alternativas jsonb not null default '[]'::jsonb,
  correta text not null,
  comentario text not null default '',
  imagem_label text,
  imagem_url text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (case_id, slug),
  constraint case_alternativas_e_lista check (jsonb_typeof(alternativas) = 'array'),
  constraint case_min_duas_alternativas check (jsonb_array_length(alternativas) >= 2),
  constraint case_correta_valida check (correta ~ '^[A-E]$'),
  constraint case_correta_existe check (public.alternativa_existe(alternativas, correta))
);

create index case_questions_case_id_idx on public.case_questions (case_id);

-- ---------------------------------------------------------------------------
-- Conteúdo: atlas
-- ---------------------------------------------------------------------------
create table public.atlas_regions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  icone text not null default '',
  descricao text not null default '',
  status public.content_status not null default 'rascunho',
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.atlas_structures (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.atlas_regions (id) on delete cascade,
  slug text not null,
  nome text not null,
  resumo text not null default '',
  anatomia text not null default '',
  sonoanatomia text not null default '',
  -- listas de texto simples
  escaneamento jsonb not null default '[]'::jsonb,
  armadilhas jsonb not null default '[]'::jsonb,
  aplicacoes_clinicas jsonb not null default '[]'::jsonb,
  volumes jsonb not null default '[]'::jsonb,
  -- imagens: [{"url": "...", "legenda": "..."}]
  imagens jsonb not null default '[]'::jsonb,
  armadilha_imagens jsonb not null default '[]'::jsonb,
  -- comparações: [{"raw": {...}, "anotada": {...}, "legenda": "..."}]
  comparacoes jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'rascunho',
  origem public.content_origin not null default 'manual',
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (region_id, slug)
);

create index atlas_structures_region_id_idx on public.atlas_structures (region_id);

-- ---------------------------------------------------------------------------
-- Progresso do usuário
-- ---------------------------------------------------------------------------
-- Fonte da verdade da gamificação. O cliente NUNCA escreve aqui direto:
-- não existe policy de INSERT/UPDATE para o usuário. Toda mutação passa
-- pelas funções security definer abaixo (registrar_resposta, touch_streak).
create table public.user_progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  pontos integer not null default 0 check (pontos >= 0),
  streak integer not null default 0 check (streak >= 0),
  ultimo_acesso timestamptz,
  atlas_visitados text[] not null default '{}',
  missoes_hoje_data date,
  missoes_hoje text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Histórico de respostas. Base das estatísticas do painel admin (taxa de
-- acerto por questão) e da pontuação.
create table public.user_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  origem public.answer_source not null,
  quiz_question_id uuid references public.quiz_questions (id) on delete cascade,
  case_question_id uuid references public.case_questions (id) on delete cascade,
  resposta text not null,
  -- calculado no servidor pelo trigger, jamais aceito do cliente
  acertou boolean not null,
  pontos_ganhos integer not null default 0,
  created_at timestamptz not null default now(),

  -- exatamente uma referência preenchida, coerente com a origem
  constraint answer_referencia_unica check (
    (origem = 'quiz' and quiz_question_id is not null and case_question_id is null)
    or
    (origem = 'caso' and case_question_id is not null and quiz_question_id is null)
  )
);

create index user_answers_user_id_idx on public.user_answers (user_id);
create index user_answers_quiz_question_idx on public.user_answers (quiz_question_id);
create index user_answers_case_question_idx on public.user_answers (case_question_id);
-- uma resposta por questão por usuário (a primeira vale; repetir não pontua)
create unique index user_answers_quiz_unico
  on public.user_answers (user_id, quiz_question_id)
  where quiz_question_id is not null;
create unique index user_answers_case_unico
  on public.user_answers (user_id, case_question_id)
  where case_question_id is not null;

-- ---------------------------------------------------------------------------
-- Auditoria de conteúdo — quem mudou o quê no painel admin
-- ---------------------------------------------------------------------------
create table public.content_audit_log (
  id bigserial primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  tabela text not null,
  registro_id uuid,
  acao text not null,
  dados_antes jsonb,
  dados_depois jsonb,
  created_at timestamptz not null default now()
);

create index content_audit_log_created_at_idx on public.content_audit_log (created_at desc);

-- =============================================================================
-- Funções auxiliares
-- =============================================================================

-- is_admin() é security definer de propósito: se ela consultasse profiles
-- como o usuário chamador, as policies de profiles chamariam a si mesmas
-- (recursão infinita). Sendo definer, a leitura ignora RLS e a checagem
-- funciona dentro de qualquer policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger quiz_questions_updated_at before update on public.quiz_questions
  for each row execute function public.set_updated_at();
create trigger clinical_cases_updated_at before update on public.clinical_cases
  for each row execute function public.set_updated_at();
create trigger case_questions_updated_at before update on public.case_questions
  for each row execute function public.set_updated_at();
create trigger atlas_regions_updated_at before update on public.atlas_regions
  for each row execute function public.set_updated_at();
create trigger atlas_structures_updated_at before update on public.atlas_structures
  for each row execute function public.set_updated_at();
create trigger user_progress_updated_at before update on public.user_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trava de escalação de privilégio
-- ---------------------------------------------------------------------------
-- Sem isto, a policy "usuário edita o próprio perfil" permitiria que
-- qualquer um se promovesse a admin com um único PATCH e ganhasse acesso
-- de escrita a todo o conteúdo. O trigger devolve o role antigo silenciosamente
-- quando quem edita não é admin.
--
-- A checagem de auth.uid() não é detalhe: sem ela, o próprio backend fica
-- impedido de promover o primeiro admin (não há usuário logado numa conexão
-- SQL direta, então is_admin() é falso e a promoção seria revertida em
-- silêncio — impossível criar o Charles). uid nulo = contexto de backend
-- (migration, service_role), que é confiável por definição. Um usuário
-- autenticado nunca chega aqui com uid nulo: as policies de UPDATE exigem
-- auth.uid() = id ou is_admin().
create or replace function public.guard_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not public.is_admin()
  then
    new.role := old.role;
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_role_change();

-- ---------------------------------------------------------------------------
-- Criação automática de perfil no cadastro
-- ---------------------------------------------------------------------------
-- Roda quando o Supabase Auth cria o usuário (e-mail, Google ou Apple).
-- Aproveita o nome/avatar que vêm do provedor social quando existirem.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.clinical_cases enable row level security;
alter table public.case_questions enable row level security;
alter table public.atlas_regions enable row level security;
alter table public.atlas_structures enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_answers enable row level security;
alter table public.content_audit_log enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "perfil próprio é legível"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "admin lê todos os perfis"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create policy "usuário edita o próprio perfil"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "admin edita qualquer perfil"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Sem policy de INSERT: perfis nascem só pelo trigger handle_new_user.
-- Sem policy de DELETE: exclusão passa por delete_own_account().

-- ---------------------------------------------------------------------------
-- Conteúdo — leitura para todos os logados (só publicado), escrita só admin
-- ---------------------------------------------------------------------------
create policy "quiz publicado é legível"
  on public.quiz_questions for select
  to authenticated
  using (status = 'publicado' or public.is_admin());

create policy "só admin escreve no quiz"
  on public.quiz_questions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "caso publicado é legível"
  on public.clinical_cases for select
  to authenticated
  using (status = 'publicado' or public.is_admin());

create policy "só admin escreve nos casos"
  on public.clinical_cases for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Questão de caso segue a visibilidade do caso pai.
create policy "questão de caso publicado é legível"
  on public.case_questions for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.clinical_cases c
      where c.id = case_questions.case_id
        and c.status = 'publicado'
    )
  );

create policy "só admin escreve nas questões de caso"
  on public.case_questions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "região publicada é legível"
  on public.atlas_regions for select
  to authenticated
  using (status = 'publicado' or public.is_admin());

create policy "só admin escreve nas regiões"
  on public.atlas_regions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "estrutura publicada é legível"
  on public.atlas_structures for select
  to authenticated
  using (
    public.is_admin()
    or (
      status = 'publicado'
      and exists (
        select 1 from public.atlas_regions r
        where r.id = atlas_structures.region_id
          and r.status = 'publicado'
      )
    )
  );

create policy "só admin escreve nas estruturas"
  on public.atlas_structures for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Progresso — leitura própria; escrita só via funções
-- ---------------------------------------------------------------------------
create policy "progresso próprio é legível"
  on public.user_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "admin lê todo o progresso"
  on public.user_progress for select
  to authenticated
  using (public.is_admin());

-- Ausência proposital de INSERT/UPDATE/DELETE: o cliente não escreve pontos.

create policy "respostas próprias são legíveis"
  on public.user_answers for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "admin lê todas as respostas"
  on public.user_answers for select
  to authenticated
  using (public.is_admin());

-- Idem: inserir resposta é só por registrar_resposta().

-- ---------------------------------------------------------------------------
-- Auditoria — só admin lê; escrita só pelas funções
-- ---------------------------------------------------------------------------
create policy "só admin lê a auditoria"
  on public.content_audit_log for select
  to authenticated
  using (public.is_admin());

-- =============================================================================
-- Funções de escrita do progresso (a "validação no servidor" do escopo)
-- =============================================================================

-- Registra a resposta e credita pontos. O cliente informa apenas QUAL foi a
-- resposta; quem decide se acertou e quanto vale é o banco, comparando com o
-- gabarito. Assim ninguém consegue postar "ganhei 5000 pontos".
create or replace function public.registrar_resposta(
  p_origem public.answer_source,
  p_questao_id uuid,
  p_resposta text
)
returns table (acertou boolean, pontos_ganhos integer, pontos_total integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_correta text;
  v_acertou boolean;
  v_pontos integer := 0;
  v_ja_respondeu boolean;
  v_total integer;
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  -- Busca o gabarito só de conteúdo publicado (impede pontuar rascunho).
  if p_origem = 'quiz' then
    select q.correta into v_correta
    from public.quiz_questions q
    where q.id = p_questao_id and q.status = 'publicado';
  else
    select cq.correta into v_correta
    from public.case_questions cq
    join public.clinical_cases c on c.id = cq.case_id
    where cq.id = p_questao_id and c.status = 'publicado';
  end if;

  if v_correta is null then
    raise exception 'questão não encontrada ou não publicada';
  end if;

  v_acertou := upper(trim(p_resposta)) = v_correta;

  -- Repetir questão já respondida não pontua de novo.
  select exists (
    select 1 from public.user_answers ua
    where ua.user_id = v_user_id
      and (
        (p_origem = 'quiz' and ua.quiz_question_id = p_questao_id)
        or (p_origem = 'caso' and ua.case_question_id = p_questao_id)
      )
  ) into v_ja_respondeu;

  if v_acertou and not v_ja_respondeu then
    v_pontos := 10;
  end if;

  if not v_ja_respondeu then
    insert into public.user_answers (
      user_id, origem, quiz_question_id, case_question_id,
      resposta, acertou, pontos_ganhos
    )
    values (
      v_user_id,
      p_origem,
      case when p_origem = 'quiz' then p_questao_id end,
      case when p_origem = 'caso' then p_questao_id end,
      upper(trim(p_resposta)),
      v_acertou,
      v_pontos
    );

    update public.user_progress up
    set pontos = up.pontos + v_pontos
    where up.user_id = v_user_id;
  end if;

  select up.pontos into v_total
  from public.user_progress up
  where up.user_id = v_user_id;

  return query select v_acertou, v_pontos, coalesce(v_total, 0);
end;
$$;

revoke all on function public.registrar_resposta(public.answer_source, uuid, text) from public;
grant execute on function public.registrar_resposta(public.answer_source, uuid, text) to authenticated;

-- Atualiza o streak de dias. Mesma lógica do touchStreak() atual do
-- localStorage, agora no servidor: ontem = +1, hoje = mantém, mais antigo = 1.
create or replace function public.touch_streak()
returns table (streak integer, ultimo_acesso timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_ultimo date;
  v_hoje date := current_date;
  v_streak integer;
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  select up.ultimo_acesso::date, up.streak
  into v_ultimo, v_streak
  from public.user_progress up
  where up.user_id = v_user_id;

  if v_ultimo is null then
    v_streak := 1;
  elsif v_ultimo = v_hoje then
    null; -- já contabilizado hoje
  elsif v_ultimo = v_hoje - 1 then
    v_streak := v_streak + 1;
  else
    v_streak := 1;
  end if;

  update public.user_progress up
  set streak = v_streak,
      ultimo_acesso = now(),
      -- zera as missões quando vira o dia
      missoes_hoje = case when up.missoes_hoje_data = v_hoje then up.missoes_hoje else '{}' end,
      missoes_hoje_data = v_hoje
  where up.user_id = v_user_id;

  return query
    select up.streak, up.ultimo_acesso
    from public.user_progress up
    where up.user_id = v_user_id;
end;
$$;

revoke all on function public.touch_streak() from public;
grant execute on function public.touch_streak() to authenticated;

-- Marca missão diária concluída (quiz / caso / atlas).
create or replace function public.marcar_missao(p_missao text)
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_missoes text[];
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  if p_missao not in ('quiz', 'caso', 'atlas') then
    raise exception 'missão inválida: %', p_missao;
  end if;

  update public.user_progress up
  set missoes_hoje = (
        select array_agg(distinct m)
        from unnest(
          case when up.missoes_hoje_data = current_date then up.missoes_hoje else '{}'::text[] end
          || array[p_missao]
        ) as m
      ),
      missoes_hoje_data = current_date
  where up.user_id = v_user_id
  returning up.missoes_hoje into v_missoes;

  return coalesce(v_missoes, '{}');
end;
$$;

revoke all on function public.marcar_missao(text) from public;
grant execute on function public.marcar_missao(text) to authenticated;

-- Registra visita a uma estrutura do atlas.
create or replace function public.registrar_visita_atlas(p_slug text)
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_visitados text[];
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  update public.user_progress up
  set atlas_visitados = (
        select array_agg(distinct v)
        from unnest(up.atlas_visitados || array[p_slug]) as v
      )
  where up.user_id = v_user_id
  returning up.atlas_visitados into v_visitados;

  return coalesce(v_visitados, '{}');
end;
$$;

revoke all on function public.registrar_visita_atlas(text) from public;
grant execute on function public.registrar_visita_atlas(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Exclusão de conta — exigência do Google Play e da App Store
-- ---------------------------------------------------------------------------
-- Apaga auth.users; profiles/user_progress/user_answers caem por cascade.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

-- =============================================================================
-- Estatísticas do painel admin
-- =============================================================================
-- Taxa de acerto por questão: identifica perguntas confusas ou com gabarito
-- errado. Só admin enxerga (a função checa antes de devolver qualquer linha).
create or replace function public.admin_stats_quiz()
returns table (
  question_id uuid,
  slug text,
  regiao text,
  enunciado text,
  respostas bigint,
  acertos bigint,
  taxa_acerto numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'acesso restrito ao administrador';
  end if;

  return query
    select
      q.id,
      q.slug,
      q.regiao,
      q.enunciado,
      count(ua.id),
      count(ua.id) filter (where ua.acertou),
      case
        when count(ua.id) = 0 then null
        else round(100.0 * count(ua.id) filter (where ua.acertou) / count(ua.id), 1)
      end
    from public.quiz_questions q
    left join public.user_answers ua on ua.quiz_question_id = q.id
    group by q.id, q.slug, q.regiao, q.enunciado
    order by count(ua.id) desc;
end;
$$;

revoke all on function public.admin_stats_quiz() from public;
grant execute on function public.admin_stats_quiz() to authenticated;

-- Números gerais do painel.
create or replace function public.admin_stats_overview()
returns table (
  usuarios_total bigint,
  ativos_7d bigint,
  respostas_total bigint,
  quiz_publicados bigint,
  casos_publicados bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'acesso restrito ao administrador';
  end if;

  return query
    select
      (select count(*) from public.profiles),
      (select count(*) from public.user_progress where ultimo_acesso > now() - interval '7 days'),
      (select count(*) from public.user_answers),
      (select count(*) from public.quiz_questions where status = 'publicado'),
      (select count(*) from public.clinical_cases where status = 'publicado');
end;
$$;

revoke all on function public.admin_stats_overview() from public;
grant execute on function public.admin_stats_overview() to authenticated;
