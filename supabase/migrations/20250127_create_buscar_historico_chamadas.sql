-- Função para buscar o histórico de chamadas de um número
create or replace function buscar_historico_chamadas(numero_busca text)
returns table (
  data_hora timestamp with time zone,
  duracao interval,
  status text,
  tipo_chamada text
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
    ch.created_at as data_hora,
    ch.duracao::interval,
    ch.status,
    ch.tipo_chamada
  from chamadas ch
  where 
    regexp_replace(ch.numero_destino, '\D', '', 'g') like '%' || numero_limpo || '%'
    or regexp_replace(ch.numero_destino, '\D', '', 'g') like '%' || numero_sem_ddd || '%'
  order by ch.created_at desc
  limit 50;
end;
$$;
