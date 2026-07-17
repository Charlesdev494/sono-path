-- =============================================================================
-- Fase 2 — o que o painel do admin precisa do banco
-- =============================================================================
-- Duas coisas:
--   1. Storage: hoje só o backend escreve no bucket. O Charles precisa subir
--      imagem pelo painel, mas ninguém além dele.
--   2. Auditoria: registrar quem mudou o quê, automaticamente.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Storage — leitura pública, escrita só do admin
-- ---------------------------------------------------------------------------
-- O bucket é público para leitura (as imagens aparecem para os alunos e são
-- cacheáveis). Escrever é outra história: sem estas policies, um aluno logado
-- poderia subir arquivo no bucket do conteúdo.
create policy "imagens de conteúdo são públicas para leitura"
  on storage.objects for select
  to public
  using (bucket_id = 'content-images');

create policy "só admin envia imagem de conteúdo"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'content-images' and public.is_admin());

create policy "só admin substitui imagem de conteúdo"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'content-images' and public.is_admin())
  with check (bucket_id = 'content-images' and public.is_admin());

create policy "só admin apaga imagem de conteúdo"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'content-images' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Auditoria automática
-- ---------------------------------------------------------------------------
-- Registra toda escrita em conteúdo. Fica no trigger, não no app: assim
-- nenhuma alteração escapa do log, venha ela do painel, de um script ou do SQL.
--
-- Guarda a linha inteira em jsonb (antes/depois) em vez de tentar adivinhar
-- quais campos importam — o volume é baixo (o Charles editando conteúdo) e
-- poder ver exatamente o que mudou vale mais que economizar bytes.
create or replace function public.auditar_conteudo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_registro_id uuid;
begin
  v_registro_id := case
    when tg_op = 'DELETE' then (to_jsonb(old) ->> 'id')::uuid
    else (to_jsonb(new) ->> 'id')::uuid
  end;

  insert into public.content_audit_log (actor_id, tabela, registro_id, acao, dados_antes, dados_depois)
  values (
    (select auth.uid()),
    tg_table_name,
    v_registro_id,
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger quiz_questions_auditoria
  after insert or update or delete on public.quiz_questions
  for each row execute function public.auditar_conteudo();

create trigger clinical_cases_auditoria
  after insert or update or delete on public.clinical_cases
  for each row execute function public.auditar_conteudo();

create trigger case_questions_auditoria
  after insert or update or delete on public.case_questions
  for each row execute function public.auditar_conteudo();

create trigger atlas_structures_auditoria
  after insert or update or delete on public.atlas_structures
  for each row execute function public.auditar_conteudo();

create trigger atlas_regions_auditoria
  after insert or update or delete on public.atlas_regions
  for each row execute function public.auditar_conteudo();

-- ---------------------------------------------------------------------------
-- 3. Ajuda ao editor: regiões já usadas
-- ---------------------------------------------------------------------------
-- O campo "região" é texto livre. Sem uma lista do que já existe, o editor
-- acumularia "Ombro", "ombro" e "Ombro " como coisas distintas, e o filtro do
-- aluno mostraria três regiões iguais.
create or replace function public.regioes_existentes()
returns table (regiao text, total bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select q.regiao, count(*)
  from public.quiz_questions q
  group by q.regiao
  union
  select c.regiao, count(*)
  from public.clinical_cases c
  group by c.regiao
  order by 1;
$$;

revoke all on function public.regioes_existentes() from public;
grant execute on function public.regioes_existentes() to authenticated;
