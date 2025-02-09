-- Create payments table
create table public.payments (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    plan_id text not null,
    amount decimal(10,2) not null,
    status text not null default 'pending',
    pix_code text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    paid_at timestamp with time zone
);

-- Enable RLS
alter table public.payments enable row level security;

-- Create policies
create policy "Users can view their own payments"
    on public.payments for select
    using (auth.uid() = user_id);

create policy "Users can create their own payments"
    on public.payments for insert
    with check (auth.uid() = user_id);

-- Create function to update user plan after payment
create or replace function public.update_user_plan_after_payment()
returns trigger as $$
begin
    if NEW.status = 'paid' and OLD.status = 'pending' then
        update public.users
        set plano = (
            case 
                when NEW.plan_id = 'trial' then 'Sip Trial'
                when NEW.plan_id = 'basic' then 'Sip Basico'
                when NEW.plan_id = 'premium' then 'Sip Premium'
                when NEW.plan_id = 'exclusive' then 'Sip Exclusive'
                else plano
            end
        )
        where id = NEW.user_id;
    end if;
    return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for plan update
create trigger update_user_plan_after_payment_trigger
    after update on public.payments
    for each row
    execute function public.update_user_plan_after_payment();
