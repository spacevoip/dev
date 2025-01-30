-- Função para buscar registros onde o número esteja em qualquer lugar do JSON
create or replace function buscar_por_numero(numero_busca text)
returns table (dados jsonb)
language plpgsql
security definer
as $$
declare
  numero_sem_ddd text;
  numero_limpo text;
  dados_limpos jsonb;
begin
  -- Remove qualquer caractere não numérico do número de busca
  numero_limpo := regexp_replace(numero_busca, '\D', '', 'g');
  
  -- Remove o DDD para comparar com números que podem estar sem DDD
  numero_sem_ddd := right(numero_limpo, 8);
  
  with dados_encontrados as (
    select distinct mc.dados as dados_originais
    from mailing_clientes mc,
    lateral jsonb_each_text(mc.dados) as fields(key, value)
    where 
      -- Remove caracteres não numéricos do valor do campo para comparação
      regexp_replace(fields.value, '\D', '', 'g') like '%' || numero_limpo || '%'
      or regexp_replace(fields.value, '\D', '', 'g') like '%' || numero_sem_ddd || '%'
      -- Também tenta com o valor sem as aspas
      or regexp_replace(replace(fields.value, '"', ''), '\D', '', 'g') like '%' || numero_limpo || '%'
      or regexp_replace(replace(fields.value, '"', ''), '\D', '', 'g') like '%' || numero_sem_ddd || '%'
    limit 1
  ),
  dados_processados as (
    select 
      replace(replace(key, '\"', ''), '"', '') as clean_key,
      case 
        when jsonb_typeof(value) = 'string' 
        then format('"%s"', replace(replace(value::text, '\"', ''), '"', ''))::jsonb
        else value
      end as clean_value
    from dados_encontrados,
    lateral jsonb_each(dados_originais) as t(key, value)
  )
  select jsonb_object_agg(clean_key, clean_value) into dados_limpos
  from dados_processados;

  return query select dados_limpos where dados_limpos is not null;
end;
$$;