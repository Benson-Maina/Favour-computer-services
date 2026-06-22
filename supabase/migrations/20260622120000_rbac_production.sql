-- RBAC production hardening + Clerk user ID migration (uuid -> text)
-- public.users.id stores the Clerk user ID (e.g. user_2abc...)

-- ---------------------------------------------------------------------------
-- Step 1: Drop RLS policies that block column type changes
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Admins can manage users" on public.users;

drop policy if exists "Users can manage own addresses" on public.addresses;
drop policy if exists "Admins can manage addresses" on public.addresses;

drop policy if exists "Users can manage own cart" on public.cart_items;

drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Admins can manage orders" on public.orders;

drop policy if exists "Users can view own order items" on public.order_items;
drop policy if exists "Admins can manage order items" on public.order_items;

drop policy if exists "Users can view own payments" on public.payments;
drop policy if exists "Admins can manage payments" on public.payments;

drop policy if exists "Users can view own order timeline" on public.order_timeline;
drop policy if exists "Admins can manage order timeline" on public.order_timeline;

drop policy if exists "Users can view own receipts" on public.receipts;
drop policy if exists "Admins can manage receipts" on public.receipts;

drop policy if exists "Users can view own invoices" on public.invoices;
drop policy if exists "Admins can manage invoices" on public.invoices;

drop policy if exists "Users can view own shipping records" on public.shipping_records;
drop policy if exists "Admins can manage shipping records" on public.shipping_records;

drop policy if exists "Users can view own returns" on public.returns;
drop policy if exists "Admins can manage returns" on public.returns;

drop policy if exists "Users can create own reviews" on public.reviews;
drop policy if exists "Public can view approved reviews" on public.reviews;
drop policy if exists "Admins can manage reviews" on public.reviews;

drop policy if exists "Admins can manage inventory movements" on public.inventory_movements;
drop policy if exists "Admins can manage order notes" on public.order_notes;
drop policy if exists "Users can view notified own order notes" on public.order_notes;

drop policy if exists "Admins can manage payment logs" on public.payment_logs;
drop policy if exists "Admins can view audit logs" on public.audit_logs;
drop policy if exists "Super admins can view audit logs" on public.audit_logs;

drop policy if exists "Public can submit bookings" on public.bookings;
drop policy if exists "Users can view own bookings by email" on public.bookings;
drop policy if exists "Users can view own bookings" on public.bookings;
drop policy if exists "Admins can manage bookings" on public.bookings;

-- Legacy policy names from Supabase Auth era
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;

-- ---------------------------------------------------------------------------
-- Step 2: Convert legacy UUID user IDs to text (Clerk-ready)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'id'
      and udt_name = 'uuid'
  ) then
    drop trigger if exists on_auth_user_created on auth.users;
    drop function if exists public.handle_new_auth_user();

    alter table public.users drop constraint if exists users_id_fkey;

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

    alter table public.addresses add constraint addresses_user_id_fkey
      foreign key (user_id) references public.users(id) on delete cascade;
    alter table public.cart_items add constraint cart_items_user_id_fkey
      foreign key (user_id) references public.users(id) on delete cascade;
    alter table public.orders add constraint orders_user_id_fkey
      foreign key (user_id) references public.users(id);
    alter table public.order_timeline add constraint order_timeline_actor_id_fkey
      foreign key (actor_id) references public.users(id);
    alter table public.order_notes add constraint order_notes_actor_id_fkey
      foreign key (actor_id) references public.users(id);
    alter table public.payments add constraint payments_verified_by_fkey
      foreign key (verified_by) references public.users(id);
    alter table public.payment_logs add constraint payment_logs_actor_id_fkey
      foreign key (actor_id) references public.users(id);
    alter table public.inventory_movements add constraint inventory_movements_actor_id_fkey
      foreign key (actor_id) references public.users(id);
    alter table public.audit_logs add constraint audit_logs_user_id_fkey
      foreign key (user_id) references public.users(id);
    alter table public.reviews add constraint reviews_user_id_fkey
      foreign key (user_id) references public.users(id);
    alter table public.search_logs add constraint search_logs_user_id_fkey
      foreign key (user_id) references public.users(id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Step 3: Users table RBAC columns
-- ---------------------------------------------------------------------------
alter table public.users add column if not exists email text;
alter table public.users add column if not exists updated_at timestamptz not null default now();
alter table public.users add column if not exists deleted_at timestamptz;
alter table public.users add column if not exists is_active boolean not null default true;

-- ---------------------------------------------------------------------------
-- Step 4: Bookings ownership
-- ---------------------------------------------------------------------------
alter table public.bookings add column if not exists user_id text;
alter table public.bookings drop constraint if exists bookings_user_id_fkey;
alter table public.bookings add constraint bookings_user_id_fkey
  foreign key (user_id) references public.users(id);

-- ---------------------------------------------------------------------------
-- Step 5: Indexes
-- ---------------------------------------------------------------------------
create unique index if not exists users_email_active_uidx
  on public.users (lower(email))
  where email is not null and deleted_at is null;

create index if not exists users_role_idx on public.users (role);
create index if not exists users_is_active_idx on public.users (is_active) where is_active = true;
create index if not exists users_created_at_idx on public.users (created_at);
create index if not exists bookings_user_id_idx on public.bookings (user_id);

-- ---------------------------------------------------------------------------
-- Step 6: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Step 7: RLS helpers
-- ---------------------------------------------------------------------------
create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
      and role in ('super_admin', 'admin', 'staff')
      and is_active = true
      and deleted_at is null
  );
$$;

create or replace function public.current_user_is_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
      and is_active = true
      and deleted_at is null
  );
$$;

-- ---------------------------------------------------------------------------
-- Step 8: Recreate RLS policies (Clerk text IDs + RBAC)
-- ---------------------------------------------------------------------------
create policy "Users can view own profile" on public.users
  for select using (
    coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = id
    and is_active = true
    and deleted_at is null
  );

create policy "Users can update own profile" on public.users
  for update using (
    coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = id
    and is_active = true
    and deleted_at is null
  );

create policy "Admins can manage users" on public.users
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can manage own addresses" on public.addresses
  for all using (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = user_id);

create policy "Admins can manage addresses" on public.addresses
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can manage own cart" on public.cart_items
  for all using (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = user_id)
  with check (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = user_id);

create policy "Users can view own orders" on public.orders
  for select using (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = user_id);

create policy "Admins can manage orders" on public.orders
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
    )
  );

create policy "Admins can manage order items" on public.order_items
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can view own payments" on public.payments
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id
        and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
    )
  );

create policy "Admins can manage payments" on public.payments
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can view own order timeline" on public.order_timeline
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_timeline.order_id
        and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
    )
  );

create policy "Admins can manage order timeline" on public.order_timeline
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can view own receipts" on public.receipts
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = receipts.order_id
        and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
    )
  );

create policy "Admins can manage receipts" on public.receipts
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can view own invoices" on public.invoices
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = invoices.order_id
        and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
    )
  );

create policy "Admins can manage invoices" on public.invoices
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can view own shipping records" on public.shipping_records
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = shipping_records.order_id
        and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
    )
  );

create policy "Admins can manage shipping records" on public.shipping_records
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can view own returns" on public.returns
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = returns.order_id
        and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
    )
  );

create policy "Admins can manage returns" on public.returns
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can create own reviews" on public.reviews
  for insert with check (coalesce(auth.jwt() ->> 'sub', auth.uid()::text) = user_id);

create policy "Public can view approved reviews" on public.reviews
  for select using (approved = true);

create policy "Admins can manage reviews" on public.reviews
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Admins can manage inventory movements" on public.inventory_movements
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Admins can manage order notes" on public.order_notes
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Users can view notified own order notes" on public.order_notes
  for select using (
    notify_customer and exists (
      select 1 from public.orders
      where orders.id = order_notes.order_id
        and orders.user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
    )
  );

create policy "Admins can manage payment logs" on public.payment_logs
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "Super admins can view audit logs" on public.audit_logs
  for select using (
    exists (
      select 1 from public.users
      where id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
        and role = 'super_admin'
        and is_active = true
        and deleted_at is null
    )
  );

create policy "Public can submit bookings" on public.bookings
  for insert with check (true);

create policy "Users can view own bookings" on public.bookings
  for select using (
    public.current_user_is_active()
    and (
      user_id = coalesce(auth.jwt() ->> 'sub', auth.uid()::text)
      or (user_id is null and auth.jwt() ->> 'email' = email)
    )
  );

create policy "Admins can manage bookings" on public.bookings
  for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
