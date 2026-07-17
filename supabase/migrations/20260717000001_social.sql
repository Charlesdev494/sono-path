-- =============================================================================
-- Fase 3 — ranking, amigos e conquistas
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Registro de pontos ao longo do tempo
-- ---------------------------------------------------------------------------
-- user_progress.pontos guarda só o total acumulado, o que basta para o nível
-- mas não para "quem pontuou mais esta semana".
--
-- Somar user_answers quase resolveria, mas deixaria de fora o bônus de
-- conclusão de caso (30) e os pontos do atlas (5) — nenhum dos dois é uma
-- "resposta". O ranking semanal não bateria com o total, e ninguém entenderia
-- por quê. Cada ganho de ponto passa a virar um evento datado aqui.
create type public.point_reason as enum ('quiz', 'caso_questao', 'caso_bonus', 'atlas');

create table public.points_events (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  pontos integer not null check (pontos > 0),
  motivo public.point_reason not null,
  referencia_id uuid,
  created_at timestamptz not null default now()
);

create index points_events_user_data_idx on public.points_events (user_id, created_at desc);
create index points_events_data_idx on public.points_events (created_at desc);

alter table public.points_events enable row level security;

create policy "vê os próprios eventos de pontos"
  on public.points_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- sem policy de escrita: só as funções security definer inserem aqui

-- Preenche o histórico com o que já foi respondido, para quem já usa o app não
-- começar o ranking zerado.
insert into public.points_events (user_id, pontos, motivo, referencia_id, created_at)
select
  ua.user_id,
  ua.pontos_ganhos,
  case when ua.origem = 'quiz' then 'quiz'::public.point_reason else 'caso_questao'::public.point_reason end,
  coalesce(ua.quiz_question_id, ua.case_question_id),
  ua.created_at
from public.user_answers ua
where ua.pontos_ganhos > 0;

-- ---------------------------------------------------------------------------
-- 2. Amizades
-- ---------------------------------------------------------------------------
create type public.friendship_status as enum ('pendente', 'aceito', 'recusado');

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  solicitante_id uuid not null references public.profiles (id) on delete cascade,
  destinatario_id uuid not null references public.profiles (id) on delete cascade,
  status public.friendship_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint amizade_unica unique (solicitante_id, destinatario_id),
  constraint nao_amizade_consigo check (solicitante_id <> destinatario_id)
);

create index friendships_solicitante_idx on public.friendships (solicitante_id);
create index friendships_destinatario_idx on public.friendships (destinatario_id);

create trigger friendships_updated_at before update on public.friendships
  for each row execute function public.set_updated_at();

alter table public.friendships enable row level security;

-- Cada um vê apenas as amizades em que está envolvido.
create policy "vê as próprias amizades"
  on public.friendships for select
  to authenticated
  using ((select auth.uid()) in (solicitante_id, destinatario_id));

create policy "envia convite de amizade"
  on public.friendships for insert
  to authenticated
  with check ((select auth.uid()) = solicitante_id and status = 'pendente');

-- Só o destinatário responde ao convite. Sem esta restrição, quem enviou
-- poderia aceitar o próprio pedido e virar "amigo" de qualquer um.
create policy "destinatário responde ao convite"
  on public.friendships for update
  to authenticated
  using ((select auth.uid()) = destinatario_id)
  with check ((select auth.uid()) = destinatario_id);

create policy "qualquer um dos dois desfaz a amizade"
  on public.friendships for delete
  to authenticated
  using ((select auth.uid()) in (solicitante_id, destinatario_id));

-- ---------------------------------------------------------------------------
-- 3. Conquistas
-- ---------------------------------------------------------------------------
create table public.badges (
  slug text primary key,
  nome text not null,
  descricao text not null,
  icone text not null default '🏅',
  ordem integer not null default 0
);

create table public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_slug text not null references public.badges (slug) on delete cascade,
  conquistado_em timestamptz not null default now(),
  primary key (user_id, badge_slug)
);

alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

create policy "catálogo de conquistas é público"
  on public.badges for select
  to authenticated
  using (true);

-- Conquistas alheias são visíveis: aparecem no perfil público e no ranking.
-- Não expõem nada sensível — são só marcos de estudo.
create policy "conquistas são visíveis"
  on public.user_badges for select
  to authenticated
  using (true);

insert into public.badges (slug, nome, descricao, icone, ordem) values
  ('streak-7',    'Uma semana firme',   '7 dias seguidos estudando.',                 '🔥', 1),
  ('streak-30',   'Um mês sem falhar',  '30 dias seguidos estudando.',                '🔥', 2),
  ('quiz-10',     'Aquecendo',          '10 questões respondidas.',                   '🎯', 3),
  ('quiz-50',     'Pegando o ritmo',    '50 questões respondidas.',                   '🎯', 4),
  ('quiz-100',    'Centenário',         '100 questões respondidas.',                  '🎯', 5),
  ('caso-1',      'Primeiro caso',      'Concluiu seu primeiro caso clínico.',        '🩺', 6),
  ('caso-5',      'Clínico de plantão', 'Concluiu 5 casos clínicos.',                 '🩺', 7),
  ('atlas-10',    'Explorador',         'Visitou 10 estruturas do atlas.',            '🗺️', 8),
  ('atlas-25',    'Cartógrafo',         'Visitou 25 estruturas do atlas.',            '🗺️', 9),
  ('regiao-mestre','Mestre de região',  'Acertou todas as questões de uma região.',   '👑', 10),
  ('nivel-3',     'Intervencionista',   'Chegou ao nível 3.',                         '⭐', 11),
  ('nivel-5',     'Avançado',           'Chegou ao nível 5.',                         '⭐', 12);

-- ---------------------------------------------------------------------------
-- 4. Registrar pontos: as três funções passam a alimentar points_events
-- ---------------------------------------------------------------------------
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
      v_pontos := case when v_acertou then 15 else 0 end;
    end if;

    insert into public.user_answers (
      user_id, origem, quiz_question_id, case_question_id,
      resposta, acertou, pontos_ganhos
    )
    values (
      v_user_id, p_origem,
      case when p_origem = 'quiz' then p_questao_id end,
      case when p_origem = 'caso' then p_questao_id end,
      upper(trim(p_resposta)), v_acertou, v_pontos
    );

    if v_pontos > 0 then
      insert into public.points_events (user_id, pontos, motivo, referencia_id)
      values (
        v_user_id, v_pontos,
        case when p_origem = 'quiz' then 'quiz'::public.point_reason else 'caso_questao'::public.point_reason end,
        p_questao_id
      );
    end if;

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

  insert into public.points_events (user_id, pontos, motivo, referencia_id)
  values (v_user_id, 30, 'caso_bonus', p_caso_id);

  return 30;
end;
$$;

revoke all on function public.concluir_caso(uuid) from public;
grant execute on function public.concluir_caso(uuid) to authenticated;

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

    insert into public.points_events (user_id, pontos, motivo)
    values (v_user_id, v_pontos, 'atlas');
  end if;

  select up.atlas_visitados into v_visitados
  from public.user_progress up
  where up.user_id = v_user_id;

  return query select coalesce(v_visitados, '{}'), v_pontos;
end;
$$;

revoke all on function public.registrar_visita_atlas(text) from public;
grant execute on function public.registrar_visita_atlas(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Nível a partir dos pontos (mesma tabela do app)
-- ---------------------------------------------------------------------------
-- Os limites vivem em dois lugares (aqui e em lib/data/progress.ts) porque o
-- app mostra o progresso para o próximo nível sem ida ao servidor. Se mudarem,
-- mudam nos dois — os testes cobrem os limites para o desencontro não passar.
create or replace function public.nivel_de(p_pontos integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_pontos >= 12000 then 6
    when p_pontos >= 7000 then 5
    when p_pontos >= 3500 then 4
    when p_pontos >= 1500 then 3
    when p_pontos >= 500 then 2
    else 1
  end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Ranking
-- ---------------------------------------------------------------------------
-- periodo: 'sempre' (total) | 'semana' | 'mes'
-- escopo:  'todos' | 'amigos' | 'liga' (mesmo nível de quem pede)
create or replace function public.ranking(
  p_periodo text default 'sempre',
  p_escopo text default 'todos',
  p_limite integer default 50
)
returns table (
  posicao bigint,
  user_id uuid,
  nome text,
  avatar_url text,
  pontos bigint,
  nivel integer,
  e_voce boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_desde timestamptz;
  v_meu_nivel integer;
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  v_desde := case p_periodo
    when 'semana' then now() - interval '7 days'
    when 'mes' then now() - interval '30 days'
    else null
  end;

  select public.nivel_de(up.pontos) into v_meu_nivel
  from public.user_progress up
  where up.user_id = v_user_id;

  return query
  with pontuacao as (
    select
      p.id,
      p.nome,
      p.avatar_url,
      case
        when v_desde is null then up.pontos::bigint
        else coalesce((
          select sum(pe.pontos)
          from public.points_events pe
          where pe.user_id = p.id and pe.created_at >= v_desde
        ), 0)
      end as total,
      public.nivel_de(up.pontos) as nivel_atual
    from public.profiles p
    join public.user_progress up on up.user_id = p.id
    where
      -- quem optou por não aparecer some do ranking, exceto para si mesmo
      (p.aparece_no_ranking or p.id = v_user_id)
      and p.onboarding_completo
      and (
        p_escopo <> 'amigos'
        or p.id = v_user_id
        or exists (
          select 1 from public.friendships f
          where f.status = 'aceito'
            and (
              (f.solicitante_id = v_user_id and f.destinatario_id = p.id)
              or (f.destinatario_id = v_user_id and f.solicitante_id = p.id)
            )
        )
      )
      and (p_escopo <> 'liga' or public.nivel_de(up.pontos) = v_meu_nivel)
  )
  select
    rank() over (order by pt.total desc, pt.nome asc),
    pt.id,
    pt.nome,
    pt.avatar_url,
    pt.total,
    pt.nivel_atual,
    pt.id = v_user_id
  from pontuacao pt
  order by pt.total desc, pt.nome asc
  limit p_limite;
end;
$$;

revoke all on function public.ranking(text, text, integer) from public;
grant execute on function public.ranking(text, text, integer) to authenticated;

-- Posição do usuário mesmo quando ele está fora do top N — sem isso, quem está
-- em 200º não veria posição nenhuma, que é justamente quem mais precisa saber.
create or replace function public.minha_posicao(
  p_periodo text default 'sempre',
  p_escopo text default 'todos'
)
returns table (posicao bigint, total_participantes bigint, pontos bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  return query
  with todos as (
    select * from public.ranking(p_periodo, p_escopo, 1000000)
  )
  select t.posicao, (select count(*) from todos), t.pontos
  from todos t
  where t.e_voce;
end;
$$;

revoke all on function public.minha_posicao(text, text) from public;
grant execute on function public.minha_posicao(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Buscar colegas
-- ---------------------------------------------------------------------------
-- A RLS de profiles só deixa cada um ler o próprio perfil — de propósito. Para
-- achar um colega e mandar convite é preciso uma porta estreita: devolve só o
-- que é público (nome, avatar, nível) e nunca cidade, especialidade ou e-mail.
create or replace function public.buscar_usuarios(p_termo text)
returns table (
  user_id uuid,
  nome text,
  avatar_url text,
  nivel integer,
  situacao text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  if length(trim(p_termo)) < 3 then
    -- Sem mínimo, uma busca por "a" listaria a base inteira.
    return;
  end if;

  return query
  select
    p.id,
    p.nome,
    p.avatar_url,
    public.nivel_de(up.pontos),
    coalesce(
      (
        select case
          when f.status = 'aceito' then 'amigo'
          when f.status = 'pendente' and f.solicitante_id = v_user_id then 'convite_enviado'
          when f.status = 'pendente' then 'convite_recebido'
          else 'nenhum'
        end
        from public.friendships f
        where (f.solicitante_id = v_user_id and f.destinatario_id = p.id)
           or (f.destinatario_id = v_user_id and f.solicitante_id = p.id)
        limit 1
      ),
      'nenhum'
    )
  from public.profiles p
  join public.user_progress up on up.user_id = p.id
  where p.id <> v_user_id
    and p.aparece_no_ranking
    and p.onboarding_completo
    and p.nome ilike '%' || trim(p_termo) || '%'
  order by p.nome
  limit 20;
end;
$$;

revoke all on function public.buscar_usuarios(text) from public;
grant execute on function public.buscar_usuarios(text) to authenticated;

-- Lista de amigos e convites, com os dados públicos de cada um.
create or replace function public.meus_amigos()
returns table (
  friendship_id uuid,
  user_id uuid,
  nome text,
  avatar_url text,
  nivel integer,
  pontos integer,
  status public.friendship_status,
  eu_solicitei boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  return query
  select
    f.id,
    p.id,
    p.nome,
    p.avatar_url,
    public.nivel_de(up.pontos),
    up.pontos,
    f.status,
    f.solicitante_id = v_user_id
  from public.friendships f
  join public.profiles p
    on p.id = case when f.solicitante_id = v_user_id then f.destinatario_id else f.solicitante_id end
  join public.user_progress up on up.user_id = p.id
  where v_user_id in (f.solicitante_id, f.destinatario_id)
    and f.status <> 'recusado'
  order by f.status, p.nome;
end;
$$;

revoke all on function public.meus_amigos() from public;
grant execute on function public.meus_amigos() to authenticated;

-- ---------------------------------------------------------------------------
-- 8. Conquistas: verificação
-- ---------------------------------------------------------------------------
-- Roda depois de cada ação que pode render medalha. Devolve só as novas, para
-- o app celebrar exatamente o que acabou de acontecer.
create or replace function public.verificar_conquistas()
returns table (slug text, nome text, descricao text, icone text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_streak integer;
  v_pontos integer;
  v_visitados text[];
  v_respostas integer;
  v_casos integer;
  v_atlas integer;
  v_novas text[] := '{}';
begin
  if v_user_id is null then
    raise exception 'não autenticado';
  end if;

  select up.streak, up.pontos, up.atlas_visitados
  into v_streak, v_pontos, v_visitados
  from public.user_progress up
  where up.user_id = v_user_id;

  select count(*) into v_respostas
  from public.user_answers ua
  where ua.user_id = v_user_id;

  -- casos concluídos e estruturas do atlas dividem o mesmo array, separados
  -- pelo prefixo "caso:" (ver concluir_caso)
  select count(*) into v_casos
  from unnest(coalesce(v_visitados, '{}')) as v
  where v like 'caso:%';

  select count(*) into v_atlas
  from unnest(coalesce(v_visitados, '{}')) as v
  where v not like 'caso:%';

  if v_streak >= 7 then v_novas := v_novas || 'streak-7'::text; end if;
  if v_streak >= 30 then v_novas := v_novas || 'streak-30'::text; end if;
  if v_respostas >= 10 then v_novas := v_novas || 'quiz-10'::text; end if;
  if v_respostas >= 50 then v_novas := v_novas || 'quiz-50'::text; end if;
  if v_respostas >= 100 then v_novas := v_novas || 'quiz-100'::text; end if;
  if v_casos >= 1 then v_novas := v_novas || 'caso-1'::text; end if;
  if v_casos >= 5 then v_novas := v_novas || 'caso-5'::text; end if;
  if v_atlas >= 10 then v_novas := v_novas || 'atlas-10'::text; end if;
  if v_atlas >= 25 then v_novas := v_novas || 'atlas-25'::text; end if;
  if public.nivel_de(v_pontos) >= 3 then v_novas := v_novas || 'nivel-3'::text; end if;
  if public.nivel_de(v_pontos) >= 5 then v_novas := v_novas || 'nivel-5'::text; end if;

  -- "Mestre de região": acertou todas as questões publicadas de alguma região.
  -- Regiões sem questão nenhuma não contam (o having evita medalha de graça).
  if exists (
    select 1
    from public.quiz_questions q
    where q.status = 'publicado'
    group by q.regiao
    having count(*) > 0
       and count(*) = count(*) filter (
         where exists (
           select 1 from public.user_answers ua
           where ua.quiz_question_id = q.id
             and ua.user_id = v_user_id
             and ua.acertou
         )
       )
  ) then
    v_novas := v_novas || 'regiao-mestre'::text;
  end if;

  return query
  with inseridas as (
    insert into public.user_badges (user_id, badge_slug)
    select v_user_id, s
    from unnest(v_novas) as s
    on conflict (user_id, badge_slug) do nothing
    returning badge_slug
  )
  select b.slug, b.nome, b.descricao, b.icone
  from inseridas i
  join public.badges b on b.slug = i.badge_slug
  order by b.ordem;
end;
$$;

revoke all on function public.verificar_conquistas() from public;
grant execute on function public.verificar_conquistas() to authenticated;

-- Conquistas de um usuário (as próprias ou as de um colega, para o perfil dele).
create or replace function public.conquistas_de(p_user_id uuid)
returns table (slug text, nome text, descricao text, icone text, conquistado_em timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select b.slug, b.nome, b.descricao, b.icone, ub.conquistado_em
  from public.user_badges ub
  join public.badges b on b.slug = ub.badge_slug
  where ub.user_id = p_user_id
  order by b.ordem;
$$;

revoke all on function public.conquistas_de(uuid) from public;
grant execute on function public.conquistas_de(uuid) to authenticated;
