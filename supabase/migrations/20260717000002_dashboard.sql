-- =============================================================================
-- Dashboard do admin — os números que o Charles precisa ver
-- =============================================================================
-- Toda função aqui checa is_admin() antes de devolver qualquer linha. São
-- dados de alunos identificáveis: a checagem não é formalidade.
--
-- São security definer porque precisam ler a base inteira, o que a RLS
-- (corretamente) proíbe a qualquer usuário. A porta é estreita: só admin
-- passa, e só sai o que o painel mostra.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Visão geral — os cartões do topo
-- ---------------------------------------------------------------------------
drop function if exists public.admin_stats_overview();

create or replace function public.admin_stats_overview()
returns table (
  usuarios_total bigint,
  usuarios_novos_7d bigint,
  ativos_7d bigint,
  ativos_30d bigint,
  respostas_total bigint,
  acertos_total bigint,
  erros_total bigint,
  taxa_acerto numeric,
  quiz_publicados bigint,
  quiz_rascunhos bigint,
  casos_publicados bigint,
  estruturas_publicadas bigint,
  streak_medio numeric
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
    (select count(*) from public.profiles where onboarding_completo),
    -- O mesmo filtro de onboarding_completo do total. Sem ele, quem criou
    -- conta e abandonou no meio do cadastro entrava em "novos" mas não no
    -- "total" — e o painel mostrava mais novos que o total, o que parece bug.
    (select count(*) from public.profiles
      where onboarding_completo and created_at > now() - interval '7 days'),
    (select count(*) from public.user_progress where ultimo_acesso > now() - interval '7 days'),
    (select count(*) from public.user_progress where ultimo_acesso > now() - interval '30 days'),
    (select count(*) from public.user_answers),
    (select count(*) from public.user_answers where acertou),
    (select count(*) from public.user_answers where not acertou),
    -- null e não 0 quando ninguém respondeu: 0% de acerto e "ninguém tentou"
    -- são coisas diferentes, e mostrar 0% assustaria à toa
    (select case when count(*) = 0 then null
       else round(100.0 * count(*) filter (where acertou) / count(*), 1) end
     from public.user_answers),
    (select count(*) from public.quiz_questions where status = 'publicado'),
    (select count(*) from public.quiz_questions where status = 'rascunho'),
    (select count(*) from public.clinical_cases where status = 'publicado'),
    (select count(*) from public.atlas_structures where status = 'publicado'),
    (select round(avg(streak), 1) from public.user_progress where ultimo_acesso > now() - interval '7 days');
end;
$$;

revoke all on function public.admin_stats_overview() from public;
grant execute on function public.admin_stats_overview() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Atividade dia a dia — o gráfico de acertos vs erros
-- ---------------------------------------------------------------------------
-- generate_series garante um ponto por dia mesmo sem atividade. Sem isso o
-- gráfico "pularia" os dias vazios e desenharia uma linha otimista que não
-- corresponde à realidade.
create or replace function public.admin_stats_atividade(p_dias integer default 30)
returns table (
  dia date,
  acertos bigint,
  erros bigint,
  alunos_ativos bigint
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
    d::date,
    count(ua.id) filter (where ua.acertou),
    count(ua.id) filter (where not ua.acertou),
    count(distinct ua.user_id)
  from generate_series(
    current_date - (p_dias - 1),
    current_date,
    interval '1 day'
  ) as d
  left join public.user_answers ua on ua.created_at::date = d::date
  group by d
  order by d;
end;
$$;

revoke all on function public.admin_stats_atividade(integer) from public;
grant execute on function public.admin_stats_atividade(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Desempenho por região — onde os alunos tropeçam
-- ---------------------------------------------------------------------------
create or replace function public.admin_stats_regioes()
returns table (
  regiao text,
  questoes bigint,
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
    q.regiao,
    count(distinct q.id),
    count(ua.id),
    count(ua.id) filter (where ua.acertou),
    case when count(ua.id) = 0 then null
      else round(100.0 * count(ua.id) filter (where ua.acertou) / count(ua.id), 1) end
  from public.quiz_questions q
  left join public.user_answers ua on ua.quiz_question_id = q.id
  where q.status = 'publicado'
  group by q.regiao
  order by 5 nulls last;
end;
$$;

revoke all on function public.admin_stats_regioes() from public;
grant execute on function public.admin_stats_regioes() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Distribuição de níveis — a forma da turma
-- ---------------------------------------------------------------------------
create or replace function public.admin_stats_niveis()
returns table (nivel integer, alunos bigint)
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
  select n.n, count(up.user_id)
  from generate_series(1, 6) as n(n)
  left join public.user_progress up
    on public.nivel_de(up.pontos) = n.n
  left join public.profiles p
    on p.id = up.user_id and p.onboarding_completo
  where up.user_id is null or p.id is not null
  group by n.n
  order by n.n;
end;
$$;

revoke all on function public.admin_stats_niveis() from public;
grant execute on function public.admin_stats_niveis() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Lista de alunos — o Charles vendo cada um
-- ---------------------------------------------------------------------------
-- O professor vê o progresso dos alunos: é o objetivo do painel. Mesmo assim
-- só sai o que serve ao acompanhamento — sem e-mail, sem dado que o painel
-- não use.
create or replace function public.admin_alunos()
returns table (
  user_id uuid,
  nome text,
  especialidade text,
  cidade text,
  nivel integer,
  pontos integer,
  streak integer,
  ultimo_acesso timestamptz,
  respostas bigint,
  acertos bigint,
  taxa_acerto numeric,
  criado_em timestamptz
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
    p.id,
    p.nome,
    p.especialidade,
    p.cidade,
    public.nivel_de(up.pontos),
    up.pontos,
    up.streak,
    up.ultimo_acesso,
    count(ua.id),
    count(ua.id) filter (where ua.acertou),
    case when count(ua.id) = 0 then null
      else round(100.0 * count(ua.id) filter (where ua.acertou) / count(ua.id), 1) end,
    p.created_at
  from public.profiles p
  join public.user_progress up on up.user_id = p.id
  left join public.user_answers ua on ua.user_id = p.id
  where p.onboarding_completo
  group by p.id, p.nome, p.especialidade, p.cidade, up.pontos, up.streak, up.ultimo_acesso, p.created_at
  order by up.pontos desc;
end;
$$;

revoke all on function public.admin_alunos() from public;
grant execute on function public.admin_alunos() to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Estatísticas por questão — agora com os casos também
-- ---------------------------------------------------------------------------
drop function if exists public.admin_stats_quiz();

create or replace function public.admin_stats_quiz()
returns table (
  question_id uuid,
  slug text,
  regiao text,
  nivel public.quiz_level,
  enunciado text,
  status public.content_status,
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
    q.nivel,
    q.enunciado,
    q.status,
    count(ua.id),
    count(ua.id) filter (where ua.acertou),
    case when count(ua.id) = 0 then null
      else round(100.0 * count(ua.id) filter (where ua.acertou) / count(ua.id), 1) end
  from public.quiz_questions q
  left join public.user_answers ua on ua.quiz_question_id = q.id
  group by q.id, q.slug, q.regiao, q.nivel, q.enunciado, q.status
  order by count(ua.id) desc;
end;
$$;

revoke all on function public.admin_stats_quiz() from public;
grant execute on function public.admin_stats_quiz() to authenticated;
