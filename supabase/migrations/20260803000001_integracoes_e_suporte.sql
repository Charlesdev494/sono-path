-- =============================================================================
-- Integrações (chave da IA gerida pelo painel) e Suporte
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Configuração do app
-- ---------------------------------------------------------------------------
-- Guarda o que antes só existia em variável de ambiente: provedor, chave e
-- modelo da IA. Sai do env porque o Charles precisa trocar a chave sozinho,
-- sem programador e sem redeploy.
--
-- A tabela é chave/valor de propósito: a próxima integração entra como uma
-- linha nova, sem migration.
create table public.app_settings (
  chave text primary key,
  valor jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.app_settings is
  'Configuração editável pelo painel. Contém segredos — leitura só via service_role.';

-- RLS ligada e SEM NENHUMA POLÍTICA. Não é esquecimento: é a proteção.
--
-- Sem política, nem anon nem authenticated leem esta tabela — nem o próprio
-- Charles pelo navegador. Só o service_role (que ignora RLS) alcança, e ele
-- só existe no servidor. É o que garante que a chave da OpenAI não pode
-- vazar pelo cliente nem por engano de código: não existe caminho.
alter table public.app_settings enable row level security;

create trigger app_settings_updated_at before update on public.app_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Suporte
-- ---------------------------------------------------------------------------
create type public.support_status as enum ('aberto', 'em_andamento', 'resolvido');

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  -- Nulo quando o chamado vem da página pública, sem login. A App Store exige
  -- uma URL de suporte que abra sem conta — então o formulário precisa
  -- funcionar para quem ainda nem instalou o app.
  user_id uuid references public.profiles (id) on delete set null,
  nome text not null,
  email text not null,
  assunto text not null,
  mensagem text not null,
  status public.support_status not null default 'aberto',
  -- Ajuda a reproduzir o problema sem ter de perguntar.
  user_agent text,
  -- Anotação do Charles enquanto resolve. Nunca aparece para o usuário.
  nota_interna text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_tickets_status_idx on public.support_tickets (status, created_at desc);
create index support_tickets_user_idx on public.support_tickets (user_id);

alter table public.support_tickets enable row level security;

-- Insert não tem política: a gravação passa por server function com
-- service_role, que valida e preenche user_id/user_agent. Deixar o cliente
-- inserir direto abriria a tabela para qualquer anônimo despejar spam.
create policy "admin lê todos os chamados"
  on public.support_tickets for select
  to authenticated
  using (public.is_admin());

create policy "admin atualiza chamados"
  on public.support_tickets for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Cada um vê os próprios chamados (histórico dentro do app, mais adiante).
create policy "vê os próprios chamados"
  on public.support_tickets for select
  to authenticated
  using ((select auth.uid()) = user_id);

create trigger support_tickets_updated_at before update on public.support_tickets
  for each row execute function public.set_updated_at();
