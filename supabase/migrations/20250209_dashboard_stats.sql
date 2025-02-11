-- Função para obter estatísticas do dashboard de forma otimizada
create or replace function get_dashboard_stats()
returns table (
  total_users bigint,
  active_users bigint,
  inactive_users bigint,
  total_extensions bigint,
  active_extensions bigint,
  total_cdr bigint,
  total_revenue numeric,
  expired_plans bigint
)
language plpgsql
as $$
begin
  return query
  with user_stats as (
    select
      count(*) as total_users,
      count(*) filter (where status in ('ativo', 'active')) as active_users,
      count(*) filter (where status in ('inativo', 'inactive')) as inactive_users,
      count(*) filter (
        where status = 'ativo' 
        and created_at < current_timestamp - interval '30 days'
      ) as expired_plans
    from users
  ),
  extension_stats as (
    select
      count(*) as total_extensions,
      count(*) filter (where snystatus not ilike '%Offline%') as active_extensions
    from extensions
  ),
  cdr_stats as (
    select count(*) as total_cdr
    from cdr
  ),
  revenue_stats as (
    select coalesce(sum(valor), 0) as total_revenue
    from pagamentos
  )
  select
    us.total_users,
    us.active_users,
    us.inactive_users,
    es.total_extensions,
    es.active_extensions,
    cs.total_cdr,
    rs.total_revenue,
    us.expired_plans
  from
    user_stats us,
    extension_stats es,
    cdr_stats cs,
    revenue_stats rs;
end;
$$;
