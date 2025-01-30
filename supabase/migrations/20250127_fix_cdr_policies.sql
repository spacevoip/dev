-- Habilita RLS na tabela cdr
alter table if exists public.cdr enable row level security;

-- Remove políticas existentes para evitar conflitos
drop policy if exists "Usuários podem ver suas próprias chamadas" on public.cdr;
drop policy if exists "Usuários podem ver chamadas da sua conta" on public.cdr;

-- Cria política para permitir que usuários vejam chamadas baseado no accountid
create policy "Usuários podem ver chamadas da sua conta"
on public.cdr
for select
using (
    auth.uid() in (
        select id 
        from auth.users 
        where accountid = cdr.accountid
    )
);

-- Garante que a tabela é acessível para usuários autenticados
grant select on public.cdr to authenticated;
