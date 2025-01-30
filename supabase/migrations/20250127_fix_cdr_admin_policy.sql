-- Remove políticas existentes para evitar conflitos
drop policy if exists "Admins podem ver todas as chamadas" on public.cdr;
drop policy if exists "Usuários podem ver chamadas da sua conta" on public.cdr;

-- Política para usuários normais
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

-- Política para admins
create policy "Admins podem ver todas as chamadas"
on public.cdr
for select
using (
    auth.uid() in (
        select id 
        from auth.users 
        where role = 'admin'
    )
);

-- Garante permissões
grant select on public.cdr to authenticated;
