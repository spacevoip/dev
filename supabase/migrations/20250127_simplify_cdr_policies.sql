-- Remove todas as políticas existentes
drop policy if exists "Admins podem ver todas as chamadas" on public.cdr;
drop policy if exists "Usuários podem ver chamadas da sua conta" on public.cdr;
drop policy if exists "Usuários podem ver suas próprias chamadas" on public.cdr;

-- Cria uma única política simples
create policy "Usuários podem ver chamadas do seu accountid"
on public.cdr
for select
using (
    auth.uid() in (
        select id 
        from auth.users 
        where accountid = cdr.accountid
    )
);

-- Garante permissões
grant select on public.cdr to authenticated;
