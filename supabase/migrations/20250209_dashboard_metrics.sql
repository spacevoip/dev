-- Função para obter métricas do dashboard de forma otimizada
create or replace function get_dashboard_metrics()
returns table (
  total_users bigint,
  active_users bigint,
  inactive_users bigint,
  total_extensions bigint,
  active_extensions bigint,
  total_cdr bigint,
  expired_plans bigint
)
language plpgsql
as $$
begin
  return query
  with metrics as (
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
  extension_metrics as (
    select
      count(*) as total_extensions,
      count(*) filter (where snystatus not ilike '%Offline%') as active_extensions
    from extensions
  ),
  cdr_metrics as (
    select count(*) as total_cdr
    from cdr
  )
  select
    m.total_users,
    m.active_users,
    m.inactive_users,
    e.total_extensions,
    e.active_extensions,
    c.total_cdr,
    m.expired_plans
  from
    metrics m,
    extension_metrics e,
    cdr_metrics c;
end;
$$;

-- Função para obter dados do gráfico de usuários por dia
create or replace function get_users_by_day()
returns table (
  date date,
  count bigint
)
language plpgsql
as $$
begin
  return query
  with dates as (
    select generate_series(
      current_date - interval '29 days',
      current_date,
      interval '1 day'
    )::date as date
  )
  select
    d.date,
    count(u.created_at)::bigint
  from
    dates d
    left join users u on date_trunc('day', u.created_at) = d.date
  group by d.date
  order by d.date;
end;
$$;
