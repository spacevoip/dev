-- Create mailing_manager table
create table if not exists public.mailing_manager (
    id bigint primary key generated always as identity,
    nome text not null,
    quantidade integer not null,
    accountid bigint not null references public.accounts(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.mailing_manager enable row level security;

create policy "Users can view their own mailings"
    on public.mailing_manager for select
    using (auth.uid() in (
        select user_id from user_accounts where accountid = mailing_manager.accountid
    ));

create policy "Users can insert their own mailings"
    on public.mailing_manager for insert
    with check (auth.uid() in (
        select user_id from user_accounts where accountid = mailing_manager.accountid
    ));

create policy "Users can update their own mailings"
    on public.mailing_manager for update
    using (auth.uid() in (
        select user_id from user_accounts where accountid = mailing_manager.accountid
    ));

create policy "Users can delete their own mailings"
    on public.mailing_manager for delete
    using (auth.uid() in (
        select user_id from user_accounts where accountid = mailing_manager.accountid
    ));

-- Create updated_at trigger
create trigger set_updated_at
    before update on public.mailing_manager
    for each row
    execute function public.set_updated_at();
