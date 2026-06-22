-- Production patch to reconcile live database schema with supabase/schema.sql
-- Safe to run multiple times; does not drop existing data or recreate existing tables.

create extension if not exists "uuid-ossp";

-- Enum types (Postgres-safe, repeatable)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.user_role AS ENUM ('customer', 'staff', 'admin', 'super_admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'product_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.product_status AS ENUM ('active', 'draft', 'hidden', 'archived');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'product_condition' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.product_condition AS ENUM ('new', 'refurbished', 'used');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'order_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending_payment',
      'payment_submitted',
      'payment_verified',
      'processing',
      'ready_for_pickup',
      'completed',
      'cancelled',
      'refunded',
      'shipped',
      'delivered'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'booking_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.booking_status AS ENUM ('new', 'contacted', 'scheduled', 'completed', 'cancelled');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'payment_log_action' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.payment_log_action AS ENUM ('submitted', 'verified', 'rejected');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'inventory_movement_type' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.inventory_movement_type AS ENUM ('increase', 'reduce', 'correction');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'payment_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.payment_status AS ENUM ('pending_verification', 'approved', 'rejected');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'return_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.return_status AS ENUM ('return_requested', 'under_review', 'approved', 'rejected', 'refunded');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'shipping_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.shipping_status AS ENUM ('not_required', 'pending', 'shipped', 'delivered');
  END IF;
END $$;

-- Core tables and schema additions
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  parent_id uuid references public.categories(id),
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.categories(id),
  brand_id uuid references public.brands(id),
  sku text unique not null,
  name text not null,
  slug text unique not null,
  description text not null,
  condition product_condition not null default 'new',
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2),
  sale_price numeric(12,2),
  stock integer not null default 0,
  reserved_stock integer not null default 0 check (reserved_stock >= 0),
  incoming_stock integer not null default 0,
  low_stock_threshold integer not null default 3,
  supplier_name text,
  supplier_contact text,
  warranty text,
  status product_status not null default 'active',
  archived_at timestamptz,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  images jsonb not null default '[]',
  specs jsonb not null default '{}',
  featured boolean not null default false,
  new_arrival boolean not null default false,
  best_selling boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  check (stock >= 0),
  check (sale_price is null or sale_price >= 0),
  check (reserved_stock <= stock)
);

create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  movement_type inventory_movement_type not null default 'correction',
  previous_quantity integer,
  quantity_change integer not null check (quantity_change <> 0),
  quantity_after integer,
  reason text not null,
  actor_id uuid references public.users(id),
  actor_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  label text not null,
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  city text not null default 'Nairobi',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  payload jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_method text not null,
  shipping_address text,
  notes text,
  payment_reference text,
  payment_screenshot_url text,
  payment_status payment_status not null default 'pending_verification',
  pickup_code text,
  collection_date timestamptz,
  items_snapshot jsonb not null default '[]',
  status order_status not null default 'pending_payment',
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.order_timeline (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  label text not null,
  actor_id uuid references public.users(id),
  actor_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_notes (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  note text not null,
  notify_customer boolean not null default false,
  actor_id uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  amount numeric(12,2) not null,
  paybill_number text not null,
  account_number text not null,
  transaction_code text not null,
  confirmation_url text,
  status payment_status not null default 'pending_verification',
  verified boolean not null default false,
  rejected boolean not null default false,
  rejection_reason text,
  verified_by uuid references public.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_logs (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  action payment_log_action not null,
  note text,
  actor_id uuid references public.users(id),
  actor_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default uuid_generate_v4(),
  receipt_number text unique not null,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_name text not null,
  customer_contact text not null,
  payment_reference text not null,
  items jsonb not null default '[]',
  total numeric(12,2) not null check (total >= 0),
  pdf_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text unique not null,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_name text not null,
  items jsonb not null default '[]',
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_status payment_status not null default 'pending_verification',
  created_at timestamptz not null default now()
);

create table if not exists public.shipping_records (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status shipping_status not null default 'pending',
  courier text,
  tracking_number text,
  updated_at timestamptz not null default now()
);

create table if not exists public.returns (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_name text not null,
  reason text not null,
  status return_status not null default 'return_requested',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  user_name text,
  action text not null,
  entity text not null,
  details text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  service text not null,
  name text not null,
  email text not null,
  phone text not null,
  preferred_date date,
  message text not null,
  status booking_status not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references public.users(id),
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  quote text not null,
  rating integer not null default 5,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null
);

create table if not exists public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.blog_categories(id),
  title text not null,
  slug text unique not null,
  excerpt text not null,
  content text not null,
  tags text[] not null default '{}',
  featured_image text,
  seo_title text,
  seo_description text,
  seo_keywords text[],
  published boolean not null default false,
  draft boolean not null default true,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.search_logs (
  id uuid primary key default uuid_generate_v4(),
  term text not null,
  user_id uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  category text,
  published boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_inquiries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

alter table if exists public.contact_inquiries
  add column if not exists status text not null default 'new' check (status in ('new', 'read', 'replied', 'closed'));

create table if not exists public.email_delivery_logs (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  recipient text not null,
  subject text not null,
  reference_id text,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);

-- Optional alias table for legacy email_logs usage
create table if not exists public.email_logs (
  like public.email_delivery_logs including all
);

-- Admin helper function
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
    where id = auth.uid()
      and role in ('super_admin', 'admin', 'staff')
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Customer'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Inventory and audit helper functions
create or replace function public.adjust_product_stock(product_id_input uuid, stock_change_input integer)
returns void
language plpgsql
security definer
as $$
declare
  would_be_negative boolean;
begin
  select stock + stock_change_input < 0 into would_be_negative from public.products where id = product_id_input;
  if coalesce(would_be_negative, true) then
    raise exception 'Stock cannot become negative';
  end if;

  update public.products
  set stock = greatest(0, stock + stock_change_input)
  where id = product_id_input;

  update public.inventory_movements
  set quantity_after = (select stock from public.products where id = product_id_input),
      movement_type = case when stock_change_input > 0 then 'increase'::inventory_movement_type else 'reduce'::inventory_movement_type end
  where product_id = product_id_input
    and quantity_change = stock_change_input
    and quantity_after is null;
end;
$$;

create or replace function public.log_audit(action_input text, entity_input text, details_input text, user_name_input text default 'System')
returns void
language plpgsql
security definer
as $$
begin
  insert into public.audit_logs (user_name, action, entity, details)
  values (user_name_input, action_input, entity_input, details_input);
end;
$$;

create or replace function public.generate_receipt_for_order(order_id_input uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  order_record public.orders%rowtype;
  receipt_id uuid;
begin
  select * into order_record from public.orders where id = order_id_input;
  if order_record.id is null then
    raise exception 'Order not found';
  end if;

  insert into public.receipts (receipt_number, order_id, customer_name, customer_contact, payment_reference, items, total)
  values (
    'FCS-RCPT-' || upper(substr(order_record.id::text, 1, 8)),
    order_record.id,
    order_record.customer_name,
    order_record.customer_phone,
    coalesce(order_record.payment_reference, ''),
    order_record.items_snapshot,
    order_record.total
  )
  on conflict (receipt_number) do update set total = excluded.total
  returning id into receipt_id;

  perform public.log_audit('Receipt Generated', order_record.id::text, 'Receipt generated after payment approval.');
  return receipt_id;
end;
$$;

create or replace function public.reduce_stock_for_paid_order(order_id_input uuid)
returns void
language plpgsql
security definer
as $$
declare
  item record;
  current_stock integer;
begin
  if exists (
    select 1 from public.audit_logs
    where action = 'Inventory Reduced'
      and entity = order_id_input::text
  ) then
    return;
  end if;

  for item in select product_id, quantity from public.order_items where order_id = order_id_input loop
    select stock into current_stock from public.products where id = item.product_id for update;
    if current_stock is null then
      continue;
    end if;
    if current_stock < item.quantity then
      raise exception 'Insufficient stock for product %', item.product_id;
    end if;

    update public.products set stock = stock - item.quantity, reserved_stock = greatest(0, reserved_stock - item.quantity) where id = item.product_id;
    insert into public.inventory_movements (product_id, movement_type, previous_quantity, quantity_change, quantity_after, reason, actor_name)
    values (item.product_id, 'reduce', current_stock, -item.quantity, current_stock - item.quantity, 'Automatic stock reduction after payment approval', 'System');
  end loop;

  perform public.log_audit('Inventory Reduced', order_id_input::text, 'Stock reduced after payment approval.');
end;
$$;

create or replace function public.restore_stock_for_cancelled_order(order_id_input uuid)
returns void
language plpgsql
security definer
as $$
declare
  item record;
  current_stock integer;
begin
  for item in select product_id, quantity from public.order_items where order_id = order_id_input loop
    select stock into current_stock from public.products where id = item.product_id for update;
    if current_stock is null then
      continue;
    end if;

    update public.products set stock = stock + item.quantity where id = item.product_id;
    insert into public.inventory_movements (product_id, movement_type, previous_quantity, quantity_change, quantity_after, reason, actor_name)
    values (item.product_id, 'increase', current_stock, item.quantity, current_stock + item.quantity, 'Automatic stock restoration after cancellation', 'System');
  end loop;

  perform public.log_audit('Inventory Restored', order_id_input::text, 'Stock restored after order cancellation.');
end;
$$;

-- Enable Row Level Security for protected tables
alter table if exists public.users enable row level security;
alter table if exists public.addresses enable row level security;
alter table if exists public.cart_items enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;
alter table if exists public.payments enable row level security;
alter table if exists public.reviews enable row level security;
alter table if exists public.inventory_movements enable row level security;
alter table if exists public.order_notes enable row level security;
alter table if exists public.payment_logs enable row level security;
alter table if exists public.product_images enable row level security;
alter table if exists public.order_timeline enable row level security;
alter table if exists public.receipts enable row level security;
alter table if exists public.invoices enable row level security;
alter table if exists public.shipping_records enable row level security;
alter table if exists public.returns enable row level security;
alter table if exists public.audit_logs enable row level security;
alter table if exists public.bookings enable row level security;
alter table if exists public.contact_inquiries enable row level security;
alter table if exists public.email_delivery_logs enable row level security;
alter table if exists public.site_settings enable row level security;

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Admins can manage users') THEN
    CREATE POLICY "Admins can manage users" ON public.users FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'addresses' AND policyname = 'Users can manage own addresses') THEN
    CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'addresses' AND policyname = 'Admins can manage addresses') THEN
    CREATE POLICY "Admins can manage addresses" ON public.addresses FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cart_items' AND policyname = 'Users can manage own cart') THEN
    CREATE POLICY "Users can manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Users can view own orders') THEN
    CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Admins can manage orders') THEN
    CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Users can view own order items') THEN
    CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Admins can manage order items') THEN
    CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Users can view own payments') THEN
    CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (exists (select 1 from public.orders where orders.id = payments.order_id and orders.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Admins can manage payments') THEN
    CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_timeline' AND policyname = 'Users can view own order timeline') THEN
    CREATE POLICY "Users can view own order timeline" ON public.order_timeline FOR SELECT USING (exists (select 1 from public.orders where orders.id = order_timeline.order_id and orders.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_timeline' AND policyname = 'Admins can manage order timeline') THEN
    CREATE POLICY "Admins can manage order timeline" ON public.order_timeline FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'receipts' AND policyname = 'Users can view own receipts') THEN
    CREATE POLICY "Users can view own receipts" ON public.receipts FOR SELECT USING (exists (select 1 from public.orders where orders.id = receipts.order_id and orders.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'receipts' AND policyname = 'Admins can manage receipts') THEN
    CREATE POLICY "Admins can manage receipts" ON public.receipts FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices' AND policyname = 'Users can view own invoices') THEN
    CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (exists (select 1 from public.orders where orders.id = invoices.order_id and orders.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices' AND policyname = 'Admins can manage invoices') THEN
    CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shipping_records' AND policyname = 'Users can view own shipping records') THEN
    CREATE POLICY "Users can view own shipping records" ON public.shipping_records FOR SELECT USING (exists (select 1 from public.orders where orders.id = shipping_records.order_id and orders.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shipping_records' AND policyname = 'Admins can manage shipping records') THEN
    CREATE POLICY "Admins can manage shipping records" ON public.shipping_records FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'returns' AND policyname = 'Users can view own returns') THEN
    CREATE POLICY "Users can view own returns" ON public.returns FOR SELECT USING (exists (select 1 from public.orders where orders.id = returns.order_id and orders.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'returns' AND policyname = 'Admins can manage returns') THEN
    CREATE POLICY "Admins can manage returns" ON public.returns FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Users can create own reviews') THEN
    CREATE POLICY "Users can create own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Public can view approved reviews') THEN
    CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (approved = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Admins can manage reviews') THEN
    CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'inventory_movements' AND policyname = 'Admins can manage inventory movements') THEN
    CREATE POLICY "Admins can manage inventory movements" ON public.inventory_movements FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_notes' AND policyname = 'Admins can manage order notes') THEN
    CREATE POLICY "Admins can manage order notes" ON public.order_notes FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_notes' AND policyname = 'Users can view notified own order notes') THEN
    CREATE POLICY "Users can view notified own order notes" ON public.order_notes FOR SELECT USING (notify_customer and exists (select 1 from public.orders where orders.id = order_notes.order_id and orders.user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payment_logs' AND policyname = 'Admins can manage payment logs') THEN
    CREATE POLICY "Admins can manage payment logs" ON public.payment_logs FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_images' AND policyname = 'Public can view product images') THEN
    CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_images' AND policyname = 'Admins can manage product images') THEN
    CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'Admins can view audit logs') THEN
    CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Public can submit bookings') THEN
    CREATE POLICY "Public can submit bookings" ON public.bookings FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can view own bookings by email') THEN
    CREATE POLICY "Users can view own bookings by email" ON public.bookings FOR SELECT USING (auth.jwt() ->> 'email' = email);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Admins can manage bookings') THEN
    CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_inquiries' AND policyname = 'Public can submit contact inquiries') THEN
    CREATE POLICY "Public can submit contact inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_inquiries' AND policyname = 'Admins can manage contact inquiries') THEN
    CREATE POLICY "Admins can manage contact inquiries" ON public.contact_inquiries FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_delivery_logs' AND policyname = 'Admins can view email logs') THEN
    CREATE POLICY "Admins can view email logs" ON public.email_delivery_logs FOR SELECT USING (public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'Public can read site settings') THEN
    CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'Admins can manage site settings') THEN
    CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
  END IF;
END$$;

-- Storage bucket seeding and policy enforcement
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('payments', 'payments', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('testimonials', 'testimonials', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('blog', 'blog', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('services', 'services', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

update storage.buckets set public = false where id in ('payments', 'testimonials');
update storage.buckets set public = true where id in ('products', 'blog', 'services');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view public media') THEN
    CREATE POLICY "Public can view public media" ON storage.objects FOR SELECT USING (bucket_id in ('products', 'blog', 'services'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can manage public media') THEN
    CREATE POLICY "Admins can manage public media" ON storage.objects FOR ALL USING (bucket_id in ('products', 'blog', 'services') and public.current_user_is_admin()) WITH CHECK (bucket_id in ('products', 'blog', 'services') and public.current_user_is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload payment proof') THEN
    CREATE POLICY "Authenticated users can upload payment proof" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payments' and auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can read own payment proof') THEN
    CREATE POLICY "Users can read own payment proof" ON storage.objects FOR SELECT USING (bucket_id = 'payments' and auth.role() = 'authenticated' and owner = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can manage private media') THEN
    CREATE POLICY "Admins can manage private media" ON storage.objects FOR ALL USING (bucket_id in ('payments', 'testimonials') and public.current_user_is_admin()) WITH CHECK (bucket_id in ('payments', 'testimonials') and public.current_user_is_admin());
  END IF;
END$$;

-- Indexes
create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_sku_idx on public.products(sku);
create index if not exists products_status_idx on public.products(status);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_search_idx on public.products using gin (to_tsvector('english', name || ' ' || coalesce(description, '')));
create index if not exists product_images_product_idx on public.product_images(product_id);
create index if not exists cart_items_user_idx on public.cart_items(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists blog_posts_slug_idx on public.blog_posts(slug);
create index if not exists inventory_movements_product_idx on public.inventory_movements(product_id);
create index if not exists payment_logs_order_idx on public.payment_logs(order_id);
create index if not exists receipts_order_idx on public.receipts(order_id);
create index if not exists invoices_order_idx on public.invoices(order_id);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at);
create index if not exists email_delivery_logs_reference_idx on public.email_delivery_logs(reference_id);
create index if not exists search_logs_term_idx on public.search_logs(term);

-- Named constraints for schema consistency
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'products' AND c.conname = 'products_cost_price_nonnegative') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_cost_price_nonnegative CHECK (cost_price >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'products' AND c.conname = 'products_price_nonnegative') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_price_nonnegative CHECK (price >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'products' AND c.conname = 'products_sale_price_nonnegative') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_sale_price_nonnegative CHECK (sale_price IS NULL OR sale_price >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'products' AND c.conname = 'products_stock_nonnegative') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_stock_nonnegative CHECK (stock >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'products' AND c.conname = 'products_reserved_stock_lte_stock') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_reserved_stock_lte_stock CHECK (reserved_stock <= stock);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'cart_items' AND c.conname = 'cart_items_quantity_positive') THEN
    ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_quantity_positive CHECK (quantity > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'payments' AND c.conname = 'payments_amount_nonnegative') THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_amount_nonnegative CHECK (amount >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'payment_logs' AND c.conname = 'payment_logs_action_valid') THEN
    ALTER TABLE public.payment_logs ADD CONSTRAINT payment_logs_action_valid CHECK (action IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'receipts' AND c.conname = 'receipts_total_nonnegative') THEN
    ALTER TABLE public.receipts ADD CONSTRAINT receipts_total_nonnegative CHECK (total >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'reviews' AND c.conname = 'reviews_rating_range') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 1 AND 5);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = 'testimonials' AND c.conname = 'testimonials_rating_nonnegative') THEN
    ALTER TABLE public.testimonials ADD CONSTRAINT testimonials_rating_nonnegative CHECK (rating IS NOT NULL);
  END IF;
END$$;

-- Restore API role access if schema grants were lost.
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, service_role;
grant select on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to postgres, service_role;
grant usage on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to postgres, service_role, anon, authenticated;
alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant select on tables to anon, authenticated;
