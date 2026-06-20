create extension if not exists "uuid-ossp";

create type user_role as enum ('customer', 'staff', 'admin', 'super_admin');
create type product_status as enum ('active', 'draft', 'hidden', 'archived');
create type product_condition as enum ('new', 'refurbished', 'used');
create type order_status as enum ('pending_payment', 'payment_submitted', 'payment_verified', 'processing', 'ready_for_pickup', 'completed', 'cancelled', 'refunded', 'shipped', 'delivered');
create type booking_status as enum ('new', 'contacted', 'scheduled', 'completed', 'cancelled');
create type payment_log_action as enum ('submitted', 'verified', 'rejected');
create type inventory_movement_type as enum ('increase', 'reduce', 'correction');
create type payment_status as enum ('pending_verification', 'approved', 'rejected');
create type return_status as enum ('return_requested', 'under_review', 'approved', 'rejected', 'refunded');
create type shipping_status as enum ('not_required', 'pending', 'shipped', 'delivered');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  parent_id uuid references public.categories(id),
  image_url text,
  created_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table public.products (
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
  incoming_stock integer not null default 0 check (incoming_stock >= 0),
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

create table public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.inventory_movements (
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

create table public.addresses (
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

create table public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  payload jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.orders (
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

create table public.order_timeline (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  label text not null,
  actor_id uuid references public.users(id),
  actor_name text,
  created_at timestamptz not null default now()
);

create table public.order_notes (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  note text not null,
  notify_customer boolean not null default false,
  actor_id uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table public.payments (
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

create table public.payment_logs (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  action payment_log_action not null,
  note text,
  actor_id uuid references public.users(id),
  actor_name text,
  created_at timestamptz not null default now()
);

create table public.receipts (
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

create table public.invoices (
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

create table public.shipping_records (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status shipping_status not null default 'pending',
  courier text,
  tracking_number text,
  updated_at timestamptz not null default now()
);

create table public.returns (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_name text not null,
  reason text not null,
  status return_status not null default 'return_requested',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  user_name text,
  action text not null,
  entity text not null,
  details text not null,
  created_at timestamptz not null default now()
);

create table public.bookings (
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

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references public.users(id),
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text,
  quote text not null,
  rating integer not null default 5,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.blog_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null
);

create table public.blog_posts (
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

create table public.search_logs (
  id uuid primary key default uuid_generate_v4(),
  term text not null,
  user_id uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  category text,
  published boolean not null default true,
  sort_order integer not null default 0
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.contact_inquiries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.email_delivery_logs (
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

alter table public.users enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.order_notes enable row level security;
alter table public.payment_logs enable row level security;
alter table public.product_images enable row level security;
alter table public.order_timeline enable row level security;
alter table public.receipts enable row level security;
alter table public.invoices enable row level security;
alter table public.shipping_records enable row level security;
alter table public.returns enable row level security;
alter table public.audit_logs enable row level security;
alter table public.bookings enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.email_delivery_logs enable row level security;
alter table public.site_settings enable row level security;

create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Admins can manage users" on public.users for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can manage own addresses" on public.addresses for all using (auth.uid() = user_id);
create policy "Admins can manage addresses" on public.addresses for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can manage own cart" on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Admins can manage orders" on public.orders for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can view own order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Admins can manage order items" on public.order_items for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can view own payments" on public.payments for select using (exists (select 1 from public.orders where orders.id = payments.order_id and orders.user_id = auth.uid()));
create policy "Admins can manage payments" on public.payments for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can view own order timeline" on public.order_timeline for select using (exists (select 1 from public.orders where orders.id = order_timeline.order_id and orders.user_id = auth.uid()));
create policy "Admins can manage order timeline" on public.order_timeline for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can view own receipts" on public.receipts for select using (exists (select 1 from public.orders where orders.id = receipts.order_id and orders.user_id = auth.uid()));
create policy "Admins can manage receipts" on public.receipts for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can view own invoices" on public.invoices for select using (exists (select 1 from public.orders where orders.id = invoices.order_id and orders.user_id = auth.uid()));
create policy "Admins can manage invoices" on public.invoices for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can view own shipping records" on public.shipping_records for select using (exists (select 1 from public.orders where orders.id = shipping_records.order_id and orders.user_id = auth.uid()));
create policy "Admins can manage shipping records" on public.shipping_records for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can view own returns" on public.returns for select using (exists (select 1 from public.orders where orders.id = returns.order_id and orders.user_id = auth.uid()));
create policy "Admins can manage returns" on public.returns for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can create own reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Public can view approved reviews" on public.reviews for select using (approved = true);
create policy "Admins can manage reviews" on public.reviews for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Admins can manage inventory movements" on public.inventory_movements for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Admins can manage order notes" on public.order_notes for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Users can view notified own order notes" on public.order_notes for select using (notify_customer and exists (select 1 from public.orders where orders.id = order_notes.order_id and orders.user_id = auth.uid()));
create policy "Admins can manage payment logs" on public.payment_logs for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Public can view product images" on public.product_images for select using (true);
create policy "Admins can manage product images" on public.product_images for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Admins can view audit logs" on public.audit_logs for select using (public.current_user_is_admin());
create policy "Public can submit bookings" on public.bookings for insert with check (true);
create policy "Users can view own bookings by email" on public.bookings for select using (auth.jwt() ->> 'email' = email);
create policy "Admins can manage bookings" on public.bookings for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Public can submit contact inquiries" on public.contact_inquiries for insert with check (true);
create policy "Admins can manage contact inquiries" on public.contact_inquiries for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "Admins can view email logs" on public.email_delivery_logs for select using (public.current_user_is_admin());
create policy "Public can read site settings" on public.site_settings for select using (true);
create policy "Admins can manage site settings" on public.site_settings for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

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

create policy "Public can view public media" on storage.objects for select using (bucket_id in ('products', 'blog', 'services'));
create policy "Admins can manage public media" on storage.objects for all using (bucket_id in ('products', 'blog', 'services') and public.current_user_is_admin()) with check (bucket_id in ('products', 'blog', 'services') and public.current_user_is_admin());
create policy "Authenticated users can upload payment proof" on storage.objects for insert with check (bucket_id = 'payments' and auth.role() = 'authenticated');
create policy "Users can read own payment proof" on storage.objects for select using (bucket_id = 'payments' and auth.role() = 'authenticated' and owner = auth.uid());
create policy "Admins can manage private media" on storage.objects for all using (bucket_id in ('payments', 'testimonials') and public.current_user_is_admin()) with check (bucket_id in ('payments', 'testimonials') and public.current_user_is_admin());

create index products_slug_idx on public.products(slug);
create index products_sku_idx on public.products(sku);
create index products_status_idx on public.products(status);
create index products_category_idx on public.products(category_id);
create index products_search_idx on public.products using gin (to_tsvector('english', name || ' ' || coalesce(description, '')));
create index product_images_product_idx on public.product_images(product_id);
create index cart_items_user_idx on public.cart_items(user_id);
create index orders_status_idx on public.orders(status);
create index orders_payment_status_idx on public.orders(payment_status);
create index blog_posts_slug_idx on public.blog_posts(slug);
create index inventory_movements_product_idx on public.inventory_movements(product_id);
create index payment_logs_order_idx on public.payment_logs(order_id);
create index receipts_order_idx on public.receipts(order_id);
create index invoices_order_idx on public.invoices(order_id);
create index audit_logs_created_idx on public.audit_logs(created_at);
create index email_delivery_logs_reference_idx on public.email_delivery_logs(reference_id);
create index search_logs_term_idx on public.search_logs(term);

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
