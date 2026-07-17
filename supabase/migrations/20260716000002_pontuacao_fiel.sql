-- =============================================================================
-- Pontuação: replica no servidor as regras que o app já usava
-- =============================================================================
-- A primeira versão de registrar_resposta() dava 10 pontos fixos por acerto —
-- um chute meu, não a regra do produto. As regras reais, lidas do código atual:
--
--   quiz básico     acerto 20 · erro 5
--   quiz avançado   acerto 30 · erro 10
--   caso clínico    30 ao concluir + 15 por questão certa
--   atlas           5 por estrutura nova visitada
--
-- Erro pontua de propósito (pontos de consolação): é decisão de produto do app,
-- mantida aqui para a migração não mudar a experiência de quem já usa.
-- =============================================================================

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
  v_nivel public.quiz_level;
  v_acertou boolean;
  v_pontos integer := 0;
  v_ja_respondeu boolean;
  v_total integer;
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  -- Só conteúdo publicado pontua (rascunho do admin não vira pontos).
  if p_origem = 'quiz' then
    select q.correta, q.nivel into v_correta, v_nivel
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

  select exists (
    select 1 from public.user_answers ua
    where ua.user_id = v_user_id
      and (
        (p_origem = 'quiz' and ua.quiz_question_id = p_questao_id)
        or (p_origem = 'caso' and ua.case_question_id = p_questao_id)
      )
  ) into v_ja_respondeu;

  if not v_ja_respondeu then
    if p_origem = 'quiz' then
      if v_acertou then
        v_pontos := case when v_nivel = 'avancado' then 30 else 20 end;
      else
        v_pontos := case when v_nivel = 'avancado' then 10 else 5 end;
      end if;
    else
      -- questão de caso: só acerto pontua; o bônus de conclusão vem à parte
      v_pontos := case when v_acertou then 15 else 0 end;
    end if;

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

-- ---------------------------------------------------------------------------
-- Bônus de conclusão do caso (os 30 pontos)
-- ---------------------------------------------------------------------------
-- Pago uma vez por caso. Guardamos a marca em atlas_visitados com prefixo
-- "caso:" — reaproveitar o array evita mais uma tabela só para isso, e a
-- unicidade do array já garante que o bônus não paga duas vezes.
create or replace function public.concluir_caso(p_caso_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_marca text := 'caso:' || p_caso_id::text;
  v_ja boolean;
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  if not exists (
    select 1 from public.clinical_cases c
    where c.id = p_caso_id and c.status = 'publicado'
  ) then
    raise exception 'caso não encontrado ou não publicado';
  end if;

  select v_marca = any(up.atlas_visitados) into v_ja
  from public.user_progress up
  where up.user_id = v_user_id;

  if coalesce(v_ja, false) then
    return 0;
  end if;

  update public.user_progress up
  set pontos = up.pontos + 30,
      atlas_visitados = up.atlas_visitados || array[v_marca]
  where up.user_id = v_user_id;

  return 30;
end;
$$;

revoke all on function public.concluir_caso(uuid) from public;
grant execute on function public.concluir_caso(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Atlas: 5 pontos por estrutura nova
-- ---------------------------------------------------------------------------
-- Passa a devolver os pontos ganhos junto, e não só a lista. Como o tipo de
-- retorno muda, create or replace não basta — o Postgres exige drop antes.
drop function if exists public.registrar_visita_atlas(text);

create or replace function public.registrar_visita_atlas(p_slug text)
returns table (visitados text[], pontos_ganhos integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_ja boolean;
  v_pontos integer := 0;
  v_visitados text[];
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  select p_slug = any(up.atlas_visitados) into v_ja
  from public.user_progress up
  where up.user_id = v_user_id;

  if not coalesce(v_ja, false) then
    v_pontos := 5;
    update public.user_progress up
    set pontos = up.pontos + v_pontos,
        atlas_visitados = up.atlas_visitados || array[p_slug]
    where up.user_id = v_user_id;
  end if;

  select up.atlas_visitados into v_visitados
  from public.user_progress up
  where up.user_id = v_user_id;

  return query select coalesce(v_visitados, '{}'), v_pontos;
end;
$$;

revoke all on function public.registrar_visita_atlas(text) from public;
grant execute on function public.registrar_visita_atlas(text) to authenticated;
