-- =============================================================================
-- Push nativo do iOS (APNs), ao lado do Web Push que já existe
-- =============================================================================
--
-- O Web Push não funciona dentro do WKWebView: no app das lojas o iOS entrega
-- notificação por APNs, com um token de aparelho em vez de um endpoint HTTP e
-- sem as chaves de criptografia do protocolo web.
--
-- A mesma tabela atende os dois. Separar em duas seria duplicar o vínculo com
-- o usuário, a invalidação e todas as consultas — a diferença entre eles cabe
-- numa coluna.

create type public.push_tipo as enum ('web', 'apns');

alter table public.push_subscriptions
  add column tipo public.push_tipo not null default 'web';

comment on column public.push_subscriptions.endpoint is
  'Web: a URL que o navegador fornece. APNs: o token do aparelho.';

-- O APNs não tem par de chaves: quem cifra é a Apple, contra o token.
alter table public.push_subscriptions
  alter column p256dh drop not null,
  alter column auth drop not null;

-- Impede uma inscrição APNs gravada como se fosse web (e vice-versa) — sem
-- isto, um erro de código viraria envio silenciosamente perdido.
alter table public.push_subscriptions
  add constraint push_subscriptions_chaves_coerentes check (
    (tipo = 'web' and p256dh is not null and auth is not null)
    or (tipo = 'apns' and p256dh is null and auth is null)
  );

-- O envio precisa saber por qual caminho mandar cada aparelho.
--
-- drop antes do create: "create or replace" recusa mudança no tipo de retorno
-- ("cannot change return type of existing function"), e acrescentar a coluna
-- tipo muda a tabela devolvida.
drop function if exists public.push_inscricoes_de(uuid);

create function public.push_inscricoes_de(p_user_id uuid)
returns table (id uuid, endpoint text, p256dh text, auth text, tipo public.push_tipo)
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
  select s.id, s.endpoint, s.p256dh, s.auth, s.tipo
  from public.push_subscriptions s
  where s.user_id = p_user_id and s.invalida_em is null;
end;
$$;

revoke all on function public.push_inscricoes_de(uuid) from public;
grant execute on function public.push_inscricoes_de(uuid) to authenticated;
