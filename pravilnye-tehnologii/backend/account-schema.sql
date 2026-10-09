-- Run in the authorized Supabase SQL editor before enabling account-config.js.
-- Authentication is provided by Supabase Auth; no passwords in this table.
create table if not exists public.customer_shopping (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cart jsonb not null default '{}'::jsonb check (jsonb_typeof(cart)='object' and octet_length(cart::text)<32768),
  favorites jsonb not null default '[]'::jsonb check (jsonb_typeof(favorites)='array' and jsonb_array_length(favorites)<=1000),
  updated_at timestamptz not null default now()
);
alter table public.customer_shopping enable row level security;
revoke all on public.customer_shopping from anon;
grant select,insert,update,delete on public.customer_shopping to authenticated;
create policy "Read own shopping" on public.customer_shopping for select to authenticated using ((select auth.uid())=user_id);
create policy "Insert own shopping" on public.customer_shopping for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own shopping" on public.customer_shopping for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "Delete own shopping" on public.customer_shopping for delete to authenticated using ((select auth.uid())=user_id);
-- Verify with two authenticated test users: neither can select/update another user's row.
-- Shopping lists never authorize prices, stock, payment, or wholesale privileges.
