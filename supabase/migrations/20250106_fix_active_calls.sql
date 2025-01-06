-- Recria a tabela active_calls com a estrutura correta
drop table if exists public.active_calls;

create table public.active_calls (
    id text primary key,
    callerid text,
    duracao text,
    destino text,
    status text,
    ramal text,
    channel text,
    user_id uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Adiciona políticas de segurança RLS
alter table public.active_calls enable row level security;

-- Permite que usuários autenticados vejam apenas suas próprias chamadas
create policy "Usuários podem ver suas próprias chamadas"
    on public.active_calls for select
    using (auth.uid() = user_id);

-- Permite que usuários autenticados insiram apenas suas próprias chamadas
create policy "Usuários podem inserir suas próprias chamadas"
    on public.active_calls for insert
    with check (auth.uid() = user_id);

-- Permite que usuários autenticados atualizem apenas suas próprias chamadas
create policy "Usuários podem atualizar suas próprias chamadas"
    on public.active_calls for update
    using (auth.uid() = user_id);

-- Permite que usuários autenticados deletem apenas suas próprias chamadas
create policy "Usuários podem deletar suas próprias chamadas"
    on public.active_calls for delete
    using (auth.uid() = user_id);

-- Adiciona índices para melhor performance
create index active_calls_user_id_idx on public.active_calls(user_id);
create index active_calls_status_idx on public.active_calls(status);
create index active_calls_ramal_idx on public.active_calls(ramal);
