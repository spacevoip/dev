-- Remove a função que não é necessária
drop function if exists buscar_historico_chamadas(text);
drop function if exists buscar_historico_chamadas(text, uuid);

-- Verifica e garante que a tabela cdr tem os campos necessários
do $$ 
begin
  -- Verifica se a coluna accountid existe
  if not exists (
    select 1 
    from information_schema.columns 
    where table_name = 'cdr' 
    and column_name = 'accountid'
  ) then
    alter table cdr add column accountid uuid references auth.users(id);
  end if;

  -- Verifica se a coluna type existe
  if not exists (
    select 1 
    from information_schema.columns 
    where table_name = 'cdr' 
    and column_name = 'type'
  ) then
    alter table cdr add column type text;
  end if;

  -- Adiciona índices para melhor performance
  if not exists (
    select 1
    from pg_indexes
    where tablename = 'cdr'
    and indexname = 'cdr_accountid_idx'
  ) then
    create index cdr_accountid_idx on cdr(accountid);
  end if;

  if not exists (
    select 1
    from pg_indexes
    where tablename = 'cdr'
    and indexname = 'cdr_start_idx'
  ) then
    create index cdr_start_idx on cdr(start);
  end if;
end $$;
