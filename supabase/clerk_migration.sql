-- Clerk authentication migration
-- Run this in Supabase SQL Editor when migrating from Supabase Auth to Clerk.
-- Clerk user IDs are text (e.g. user_2abc...), not UUIDs.

-- Remove Supabase Auth sync trigger
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_auth_user();

-- Drop foreign key from users to auth.users
alter table public.users drop constraint if exists users_id_fkey;

-- Drop foreign keys referencing users.id
alter table public.addresses drop constraint if exists addresses_user_id_fkey;
alter table public.cart_items drop constraint if exists cart_items_user_id_fkey;
alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.order_timeline drop constraint if exists order_timeline_actor_id_fkey;
alter table public.order_notes drop constraint if exists order_notes_actor_id_fkey;
alter table public.payments drop constraint if exists payments_verified_by_fkey;
alter table public.payment_logs drop constraint if exists payment_logs_actor_id_fkey;
alter table public.inventory_movements drop constraint if exists inventory_movements_actor_id_fkey;
alter table public.audit_logs drop constraint if exists audit_logs_user_id_fkey;
alter table public.reviews drop constraint if exists reviews_user_id_fkey;
alter table public.search_logs drop constraint if exists search_logs_user_id_fkey;

-- Convert user ID columns from uuid to text
-- WARNING: Existing Supabase Auth UUID users will not match Clerk IDs.
-- Backfill users manually after migration or start with an empty users table.
alter table public.users alter column id type text using id::text;
alter table public.addresses alter column user_id type text using user_id::text;
alter table public.cart_items alter column user_id type text using user_id::text;
alter table public.orders alter column user_id type text using user_id::text;
alter table public.order_timeline alter column actor_id type text using actor_id::text;
alter table public.order_notes alter column actor_id type text using actor_id::text;
alter table public.payments alter column verified_by type text using verified_by::text;
alter table public.payment_logs alter column actor_id type text using actor_id::text;
alter table public.inventory_movements alter column actor_id type text using actor_id::text;
alter table public.audit_logs alter column user_id type text using user_id::text;
alter table public.reviews alter column user_id type text using user_id::text;
alter table public.search_logs alter column user_id type text using user_id::text;

-- Re-add foreign keys
alter table public.addresses add constraint addresses_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;
alter table public.cart_items add constraint cart_items_user_id_fkey foreign key (user_id) references public.users(id) on delete cascade;
alter table public.orders add constraint orders_user_id_fkey foreign key (user_id) references public.users(id);
alter table public.order_timeline add constraint order_timeline_actor_id_fkey foreign key (actor_id) references public.users(id);
alter table public.order_notes add constraint order_notes_actor_id_fkey foreign key (actor_id) references public.users(id);
alter table public.payments add constraint payments_verified_by_fkey foreign key (verified_by) references public.users(id);
alter table public.payment_logs add constraint payment_logs_actor_id_fkey foreign key (actor_id) references public.users(id);
alter table public.inventory_movements add constraint inventory_movements_actor_id_fkey foreign key (actor_id) references public.users(id);
alter table public.audit_logs add constraint audit_logs_user_id_fkey foreign key (user_id) references public.users(id);
alter table public.reviews add constraint reviews_user_id_fkey foreign key (user_id) references public.users(id);
alter table public.search_logs add constraint search_logs_user_id_fkey foreign key (user_id) references public.users(id);

-- Update admin check to use Clerk JWT sub claim when Supabase JWT is configured with Clerk
-- Application uses service role for authorization; this remains for RLS if JWT is bridged later.
create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
      and role in ('super_admin', 'admin', 'staff')
  );
$$;

-- Update RLS policies to compare text user IDs
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
create policy "Users can view own profile" on public.users for select using (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = id);
create policy "Users can update own profile" on public.users for update using (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = id);

drop policy if exists "Users can manage own addresses" on public.addresses;
create policy "Users can manage own addresses" on public.addresses for all using (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = user_id);

drop policy if exists "Users can manage own cart" on public.cart_items;
create policy "Users can manage own cart" on public.cart_items for all using (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = user_id) with check (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = user_id);

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders for select using (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = user_id);

drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)));

drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments" on public.payments for select using (exists (select 1 from public.orders where orders.id = payments.order_id and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)));

drop policy if exists "Users can view own order timeline" on public.order_timeline;
create policy "Users can view own order timeline" on public.order_timeline for select using (exists (select 1 from public.orders where orders.id = order_timeline.order_id and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)));

drop policy if exists "Users can view own receipts" on public.receipts;
create policy "Users can view own receipts" on public.receipts for select using (exists (select 1 from public.orders where orders.id = receipts.order_id and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)));

drop policy if exists "Users can view own invoices" on public.invoices;
create policy "Users can view own invoices" on public.invoices for select using (exists (select 1 from public.orders where orders.id = invoices.order_id and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)));

drop policy if exists "Users can view own shipping records" on public.shipping_records;
create policy "Users can view own shipping records" on public.shipping_records for select using (exists (select 1 from public.orders where orders.id = shipping_records.order_id and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)));

drop policy if exists "Users can view own returns" on public.returns;
create policy "Users can view own returns" on public.returns for select using (exists (select 1 from public.orders where orders.id = returns.order_id and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)));

drop policy if exists "Users can create own reviews" on public.reviews;
create policy "Users can create own reviews" on public.reviews for insert with check (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = user_id);

drop policy if exists "Users can view notified own order notes" on public.order_notes;
create policy "Users can view notified own order notes" on public.order_notes for select using (notify_customer and exists (select 1 from public.orders where orders.id = order_notes.order_id and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)));
