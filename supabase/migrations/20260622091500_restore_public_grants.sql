-- Restore Supabase API role access to the public schema.

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select on all tables in schema public to anon, authenticated;

grant all on all sequences in schema public to postgres, service_role;
grant usage on all sequences in schema public to anon, authenticated;

grant execute on all functions in schema public to postgres, service_role, anon, authenticated;

alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant select on tables to anon, authenticated;

alter default privileges in schema public grant all on sequences to postgres, service_role;
alter default privileges in schema public grant usage on sequences to anon, authenticated;

alter table if exists public.categories enable row level security;
alter table if exists public.brands enable row level security;
alter table if exists public.products enable row level security;
alter table if exists public.blog_posts enable row level security;
alter table if exists public.blog_categories enable row level security;
alter table if exists public.testimonials enable row level security;
alter table if exists public.faqs enable row level security;
alter table if exists public.newsletter_subscribers enable row level security;

drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories" on public.categories for select using (true);

drop policy if exists "Public can view brands" on public.brands;
create policy "Public can view brands" on public.brands for select using (true);

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products" on public.products for select using (status = 'active');

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories" on public.categories for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "Admins can manage brands" on public.brands;
create policy "Admins can manage brands" on public.brands for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products for all using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "Public can view published blog posts" on public.blog_posts;
create policy "Public can view published blog posts" on public.blog_posts for select using (published = true and draft = false);

drop policy if exists "Public can view blog categories" on public.blog_categories;
create policy "Public can view blog categories" on public.blog_categories for select using (true);

drop policy if exists "Public can view approved testimonials" on public.testimonials;
create policy "Public can view approved testimonials" on public.testimonials for select using (approved = true);

drop policy if exists "Public can view published faqs" on public.faqs;
create policy "Public can view published faqs" on public.faqs for select using (published = true);
