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

-- Row-level security: anyone can read/write their own session
alter table public.cart_items enable row level security;

create policy "Allow all on own session" on public.cart_items
  for all
  using (true)
  with check (true);

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
