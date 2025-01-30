-- Verifica se a tabela cdr existe, se não existir, cria
create table if not exists public.cdr (
    id bigint primary key generated always as identity,
    accountid uuid references auth.users(id),
    start timestamp with time zone,
    channel text,
    src text,
    dst text,
    billsec integer,
    disposition text,
    recording_url text,
    type text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Adiciona índices necessários
create index if not exists cdr_accountid_idx on public.cdr(accountid);
create index if not exists cdr_start_idx on public.cdr(start);
create index if not exists cdr_channel_idx on public.cdr(channel);
create index if not exists cdr_dst_idx on public.cdr(dst);

-- Habilita RLS
alter table public.cdr enable row level security;

-- Remove políticas antigas
drop policy if exists "Usuários podem ver suas próprias chamadas" on public.cdr;
drop policy if exists "Usuários podem ver chamadas da sua conta" on public.cdr;

-- Adiciona nova política
create policy "Usuários podem ver chamadas da sua conta"
on public.cdr
for select
using (
    auth.uid() in (
        select u.id 
        from auth.users u 
        where u.accountid = cdr.accountid
    )
);

-- Garante permissões
grant select on public.cdr to authenticated;

-- Função para debug - retorna a estrutura atual da tabela
create or replace function debug_cdr_structure()
returns table (
    column_name text,
    data_type text,
    is_nullable text
)
language sql
security definer
as $$
    select 
        column_name::text,
        data_type::text,
        is_nullable::text
    from information_schema.columns
    where table_name = 'cdr'
    and table_schema = 'public'
    order by ordinal_position;
$$;
