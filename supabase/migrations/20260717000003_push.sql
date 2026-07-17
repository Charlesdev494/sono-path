-- =============================================================================
-- Notificações push
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Inscrições
-- ---------------------------------------------------------------------------
-- Uma linha por aparelho: a mesma pessoa pode ativar no celular e no
-- computador, e cada um tem seu próprio endpoint.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- URL que o navegador dá; é ela que identifica o aparelho
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  -- Quando o serviço de push responde 404/410, a inscrição morreu (app
  -- desinstalado, permissão revogada). Marcamos em vez de apagar na hora,
  -- para o envio não precisar de permissão de escrita destrutiva.
  invalida_em timestamptz
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id)
  where invalida_em is null;

alter table public.push_subscriptions enable row level security;

create policy "vê as próprias inscrições"
  on public.push_subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "cria a própria inscrição"
  on public.push_subscriptions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "apaga a própria inscrição"
  on public.push_subscriptions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 2. Preferências
-- ---------------------------------------------------------------------------
-- Tudo ligado por padrão, mas cada tipo desligável separadamente. "Desligar
-- tudo" é retirar a permissão no navegador; aqui é o controle fino.
alter table public.profiles
  add column notif_lembrete boolean not null default true,
  add column notif_conquista boolean not null default true,
  add column notif_nivel boolean not null default true,
  add column notif_ranking boolean not null default true;

comment on column public.profiles.notif_lembrete is
  'Lembretes de inatividade e streak em risco.';

-- ---------------------------------------------------------------------------
-- 3. Registro de envios
-- ---------------------------------------------------------------------------
-- Serve para duas coisas que decidem se a notificação ajuda ou irrita:
--   1. não mandar a mesma coisa duas vezes
--   2. respeitar um teto diário por pessoa
create type public.notif_tipo as enum (
  'lembrete_inatividade',
  'streak_em_risco',
  'conquista',
  'subiu_nivel',
  'ranking_semanal'
);

create table public.notifications_log (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  tipo public.notif_tipo not null,
  titulo text not null,
  corpo text not null,
  -- Identifica o "assunto" para não repetir: ex. 'nivel:3' avisa uma vez que
  -- a pessoa chegou ao nível 3, e nunca mais.
  chave text,
  enviado_em timestamptz not null default now(),
  entregue boolean not null default false,
  erro text
);

create index notifications_log_user_idx on public.notifications_log (user_id, enviado_em desc);
create unique index notifications_log_chave_unica
  on public.notifications_log (user_id, tipo, chave)
  where chave is not null;

alter table public.notifications_log enable row level security;

create policy "vê o próprio histórico de notificações"
  on public.notifications_log for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 4. Quem deve receber o quê
-- ---------------------------------------------------------------------------
-- Estas funções decidem os destinatários; quem envia de fato é o servidor da
-- aplicação (só ele tem a chave VAPID). São security definer e exigem
-- service_role — nunca são chamadas do navegador.
create or replace function public.push_alvos_inatividade(p_dias integer default 2)
returns table (
  user_id uuid,
  nome text,
  dias_parado integer,
  streak integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  -- auth.uid() nulo = chamada de backend (service_role/cron). Um usuário
  -- logado nunca deve conseguir listar quem anda sumido.
  if (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'acesso restrito';
  end if;

  return query
  select
    p.id,
    p.nome,
    extract(day from now() - up.ultimo_acesso)::integer,
    up.streak
  from public.profiles p
  join public.user_progress up on up.user_id = p.id
  where p.onboarding_completo
    and p.notif_lembrete
    and up.ultimo_acesso is not null
    and up.ultimo_acesso < now() - (p_dias || ' days')::interval
    -- Sumiu há mais de duas semanas? Insistir vira spam.
    and up.ultimo_acesso > now() - interval '14 days'
    and exists (
      select 1 from public.push_subscriptions s
      where s.user_id = p.id and s.invalida_em is null
    )
    -- nada de repetir o lembrete no mesmo dia
    and not exists (
      select 1 from public.notifications_log l
      where l.user_id = p.id
        and l.tipo = 'lembrete_inatividade'
        and l.enviado_em > now() - interval '20 hours'
    );
end;
$$;

revoke all on function public.push_alvos_inatividade(integer) from public;

-- Ranking semanal: só faz sentido avisar quem está no jogo. Quem não pontuou
-- na semana receberia "você está em 47º com 0 pontos", que desanima em vez de
-- chamar de volta.
create or replace function public.push_alvos_ranking()
returns table (
  user_id uuid,
  nome text,
  posicao bigint,
  pontos bigint,
  total bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'acesso restrito';
  end if;

  return query
  with semana as (
    select
      p.id,
      p.nome,
      coalesce(sum(pe.pontos), 0) as pts
    from public.profiles p
    join public.user_progress up on up.user_id = p.id
    left join public.points_events pe
      on pe.user_id = p.id and pe.created_at >= now() - interval '7 days'
    where p.onboarding_completo
      and p.notif_ranking
      and p.aparece_no_ranking
    group by p.id, p.nome
  ),
  posicionado as (
    select
      s.id,
      s.nome,
      s.pts,
      rank() over (order by s.pts desc) as pos,
      count(*) over () as tot
    from semana s
  )
  select pc.id, pc.nome, pc.pos, pc.pts, pc.tot
  from posicionado pc
  where pc.pts > 0
    and exists (
      select 1 from public.push_subscriptions s
      where s.user_id = pc.id and s.invalida_em is null
    )
    and not exists (
      select 1 from public.notifications_log l
      where l.user_id = pc.id
        and l.tipo = 'ranking_semanal'
        and l.enviado_em > now() - interval '6 days'
    );
end;
$$;

revoke all on function public.push_alvos_ranking() from public;

-- Inscrições ativas de uma pessoa — o servidor pede isto antes de enviar.
create or replace function public.push_inscricoes_de(p_user_id uuid)
returns table (id uuid, endpoint text, p256dh text, auth text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and (select auth.uid()) <> p_user_id and not public.is_admin() then
    raise exception 'acesso restrito';
  end if;

  return query
  select s.id, s.endpoint, s.p256dh, s.auth
  from public.push_subscriptions s
  where s.user_id = p_user_id and s.invalida_em is null;
end;
$$;

revoke all on function public.push_inscricoes_de(uuid) from public;

-- ---------------------------------------------------------------------------
-- 5. Subida de nível — detectada no momento em que acontece
-- ---------------------------------------------------------------------------
-- Um trigger é o único lugar que enxerga o antes e o depois dos pontos. O
-- cron rodando de madrugada não saberia dizer se a pessoa subiu de nível às
-- 15h ou às 15h05 — e "parabéns, você subiu de nível ontem" não tem graça.
--
-- O trigger não envia nada: só registra que há o que enviar. Quem envia é o
-- servidor, no próximo ciclo. Assim uma falha de push nunca derruba a
-- transação que credita os pontos do aluno.
create table public.push_fila (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  tipo public.notif_tipo not null,
  titulo text not null,
  corpo text not null,
  url text not null default '/home',
  chave text,
  criado_em timestamptz not null default now(),
  processado_em timestamptz
);

create index push_fila_pendentes_idx on public.push_fila (criado_em)
  where processado_em is null;

alter table public.push_fila enable row level security;
-- sem policies: só o backend (service_role) mexe aqui

create or replace function public.detectar_subida_de_nivel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nivel_antes integer;
  v_nivel_depois integer;
begin
  v_nivel_antes := public.nivel_de(old.pontos);
  v_nivel_depois := public.nivel_de(new.pontos);

  if v_nivel_depois <= v_nivel_antes then
    return new;
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = new.user_id and p.notif_nivel
  ) then
    return new;
  end if;

  insert into public.push_fila (user_id, tipo, titulo, corpo, url, chave)
  values (
    new.user_id,
    'subiu_nivel',
    'Você subiu de nível!',
    'Agora você é ' || (
      case v_nivel_depois
        when 2 then 'Operador'
        when 3 then 'Intervencionista'
        when 4 then 'Instrutor'
        when 5 then 'Avançado'
        when 6 then 'Expert'
        else 'Iniciante'
      end
    ) || '. Continue assim.',
    '/perfil',
    'nivel:' || v_nivel_depois
  )
  on conflict do nothing;

  return new;
end;
$$;

-- AFTER e não BEFORE: um trigger BEFORE pode alterar NEW e mexer no valor que
-- será gravado. Aqui só queremos observar a mudança, nunca influenciá-la — se
-- este código tiver qualquer defeito, ele não pode chegar perto dos pontos do
-- aluno.
create trigger user_progress_subida_nivel
  after update of pontos on public.user_progress
  for each row execute function public.detectar_subida_de_nivel();
