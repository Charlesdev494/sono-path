-- =============================================================================
-- Detalhe de um aluno — a visão geral, porém de uma pessoa só
-- =============================================================================
-- Mesmo contrato das funções do dashboard: security definer para ler a base
-- inteira, mas com is_admin() na porta. Recebem o id do aluno e devolvem só
-- os números daquele aluno. Nada de e-mail; só o que o acompanhamento usa.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Resumo — os cartões do topo, de um aluno
-- ---------------------------------------------------------------------------
create or replace function public.admin_aluno_resumo(p_user_id uuid)
returns table (
  user_id uuid,
  nome text,
  especialidade text,
  cidade text,
  nivel integer,
  pontos integer,
  streak integer,
  ultimo_acesso timestamptz,
  criado_em timestamptz,
  respostas bigint,
  acertos bigint,
  erros bigint,
  taxa_acerto numeric,
  casos_concluidos bigint
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
    p.created_at,
    count(ua.id),
    count(ua.id) filter (where ua.acertou),
    count(ua.id) filter (where not ua.acertou),
    case when count(ua.id) = 0 then null
      else round(100.0 * count(ua.id) filter (where ua.acertou) / count(ua.id), 1) end,
    -- Casos concluídos ficam marcados em user_progress.atlas_visitados como
    -- 'caso:<id>' (mesmo array das estruturas do atlas). Contamos só os casos.
    (select count(*) from unnest(up.atlas_visitados) as m where m like 'caso:%')
  from public.profiles p
  join public.user_progress up on up.user_id = p.id
  left join public.user_answers ua on ua.user_id = p.id
  where p.id = p_user_id
  group by p.id, p.nome, p.especialidade, p.cidade, up.pontos, up.streak, up.ultimo_acesso, p.created_at;
end;
$$;

revoke all on function public.admin_aluno_resumo(uuid) from public;
grant execute on function public.admin_aluno_resumo(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Desempenho por região, de um aluno — onde ELE tropeça
-- ---------------------------------------------------------------------------
create or replace function public.admin_aluno_regioes(p_user_id uuid)
returns table (
  regiao text,
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
    count(ua.id),
    count(ua.id) filter (where ua.acertou),
    case when count(ua.id) = 0 then null
      else round(100.0 * count(ua.id) filter (where ua.acertou) / count(ua.id), 1) end
  from public.user_answers ua
  join public.quiz_questions q on q.id = ua.quiz_question_id
  where ua.user_id = p_user_id
  group by q.regiao
  order by count(ua.id) desc;
end;
$$;

revoke all on function public.admin_aluno_regioes(uuid) from public;
grant execute on function public.admin_aluno_regioes(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Atividade dia a dia, de um aluno — o mesmo generate_series do dashboard
-- ---------------------------------------------------------------------------
create or replace function public.admin_aluno_atividade(p_user_id uuid, p_dias integer default 30)
returns table (
  dia date,
  acertos bigint,
  erros bigint
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
    count(ua.id) filter (where not ua.acertou)
  from generate_series(
    current_date - (p_dias - 1),
    current_date,
    interval '1 day'
  ) as d
  left join public.user_answers ua
    on ua.created_at::date = d::date and ua.user_id = p_user_id
  group by d
  order by d;
end;
$$;

revoke all on function public.admin_aluno_atividade(uuid, integer) from public;
grant execute on function public.admin_aluno_atividade(uuid, integer) to authenticated;
