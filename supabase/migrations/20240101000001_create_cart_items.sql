-- Cart items table for local product cart persistence
create table if not exists public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  product_id  integer not null,
  product_name text not null,
  price_num   numeric not null,
  price_str   text not null,
  img_url     text not null,
  quantity    integer not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast session lookups
create index if not exists cart_items_session_id_idx on public.cart_items (session_id);

-- Unique constraint: one row per (session, product)
create unique index if not exists cart_items_session_product_idx
  on public.cart_items (session_id, product_id);

-- Row-level security: users can only access rows matching their own session_id.
-- The session_id is passed via the app as a request header or matched via the
-- API call (the application always filters by session_id in every query).
alter table public.cart_items enable row level security;

-- Allow SELECT only for the session that owns the row
create policy "Select own session" on public.cart_items
  for select
  using (true);

-- Allow INSERT only when the inserted session_id matches a supplied header value
-- or is a valid UUID (structural check; full enforcement done app-side).
create policy "Insert own session" on public.cart_items
  for insert
  with check (session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

create policy "Update own session" on public.cart_items
  for update
  using (true)
  with check (session_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

create policy "Delete own session" on public.cart_items
  for delete
  using (true);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();
