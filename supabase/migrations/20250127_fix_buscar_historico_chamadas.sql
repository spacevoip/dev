-- Recria a função buscar_historico_chamadas corretamente
create or replace function buscar_historico_chamadas(
  numero_busca text,
  account_id uuid
)
returns table (
  id bigint,
  start timestamp with time zone,
  channel text,
  dst text,
  billsec integer,
  disposition text,
  recording_url text,
  accountid uuid,
  type text
)
language plpgsql
security definer
as $$
declare
  numero_limpo text;
  numero_sem_ddd text;
begin
  -- Remove qualquer caractere não numérico do número de busca
  numero_limpo := regexp_replace(numero_busca, '\D', '', 'g');
  
  -- Remove o DDD para comparar com números que podem estar sem DDD
  numero_sem_ddd := right(numero_limpo, 8);
  
  return query
  select 
    c.id,
    c.start,
    c.channel,
    c.dst,
    c.billsec,
    c.disposition,
    c.recording_url,
    c.accountid,
    c.type
  from cdr c
  where 
    c.accountid = account_id
    and (
      regexp_replace(c.channel, '\D', '', 'g') like '%' || numero_limpo || '%'
      or regexp_replace(c.channel, '\D', '', 'g') like '%' || numero_sem_ddd || '%'
      or regexp_replace(c.dst, '\D', '', 'g') like '%' || numero_limpo || '%'
      or regexp_replace(c.dst, '\D', '', 'g') like '%' || numero_sem_ddd || '%'
    )
  order by c.start desc
  limit 50;
end;
$$;
