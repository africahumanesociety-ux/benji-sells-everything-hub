-- Orders table for seller dashboard analytics
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  customer_name   text not null,
  customer_email  text,
  product_name    text not null,
  category        text not null,
  amount          numeric not null,
  quantity        integer not null default 1,
  status          text not null default 'completed'
                    check (status in ('completed', 'pending', 'cancelled', 'refunded')),
  created_at      timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_category_idx   on public.orders (category);
create index if not exists orders_status_idx     on public.orders (status);

alter table public.orders enable row level security;

create policy "Allow read for all" on public.orders
  for select using (true);

-- Seed realistic sample data (last 90 days)
insert into public.orders (order_number, customer_name, customer_email, product_name, category, amount, quantity, status, created_at) values
  ('ORD-001', 'Emeka Okafor',    'emeka@gmail.com',   'Wireless Earbuds',       'electronics', 15000, 1, 'completed', now() - interval '88 days'),
  ('ORD-002', 'Ngozi Adeyemi',   'ngozi@yahoo.com',   'Smart Watch',            'electronics', 25000, 1, 'completed', now() - interval '85 days'),
  ('ORD-003', 'Chidi Nwosu',     'chidi@outlook.com', 'Bluetooth Speaker',      'electronics', 12000, 2, 'completed', now() - interval '82 days'),
  ('ORD-004', 'Amaka Eze',       'amaka@gmail.com',   'Women''s Handbag',       'fashion',     18000, 1, 'completed', now() - interval '80 days'),
  ('ORD-005', 'Tunde Balogun',   'tunde@gmail.com',   'Men''s Polo Shirt',      'fashion',      8000, 3, 'completed', now() - interval '78 days'),
  ('ORD-006', 'Fatima Musa',     'fatima@gmail.com',  'LED Desk Lamp',          'home',         6500, 1, 'completed', now() - interval '75 days'),
  ('ORD-007', 'Kemi Adewale',    'kemi@gmail.com',    'Leather Wallet',         'accessories',  5000, 2, 'completed', now() - interval '72 days'),
  ('ORD-008', 'Seun Okonkwo',    'seun@gmail.com',    'Phone Case',             'accessories',  3000, 4, 'completed', now() - interval '70 days'),
  ('ORD-009', 'Bola Fashola',    'bola@gmail.com',    'Power Bank 20000mAh',    'electronics', 14000, 1, 'completed', now() - interval '68 days'),
  ('ORD-010', 'Adaobi Igwe',     'adaobi@gmail.com',  'Sneakers',               'fashion',     22000, 1, 'completed', now() - interval '65 days'),
  ('ORD-011', 'Yemi Adesanya',   'yemi@gmail.com',    'Gold Wristwatch',        'accessories', 45000, 1, 'completed', now() - interval '62 days'),
  ('ORD-012', 'Ola Bankole',     'ola@gmail.com',     'Laptop Backpack',        'accessories', 16000, 1, 'completed', now() - interval '60 days'),
  ('ORD-013', 'Chisom Obi',      'chisom@gmail.com',  'Wireless Earbuds',       'electronics', 15000, 2, 'completed', now() - interval '58 days'),
  ('ORD-014', 'Dayo Adekunle',   'dayo@gmail.com',    'Ceramic Mug Set',        'home',         7000, 1, 'completed', now() - interval '55 days'),
  ('ORD-015', 'Ife Adeyemi',     'ife@gmail.com',     'Gaming Mouse RGB',       'electronics', 11000, 1, 'completed', now() - interval '52 days'),
  ('ORD-016', 'Nkechi Uzo',      'nkechi@gmail.com',  'Throw Pillows (set)',    'home',         9000, 2, 'completed', now() - interval '50 days'),
  ('ORD-017', 'Babatunde Okeke', 'baba@gmail.com',    'Sunglasses',             'accessories',  7500, 1, 'completed', now() - interval '47 days'),
  ('ORD-018', 'Chiamaka Ibe',    'chiamaka@gmail.com','Premium Headphones',     'electronics', 35000, 1, 'completed', now() - interval '45 days'),
  ('ORD-019', 'Musa Ibrahim',    'musa@gmail.com',    'Running Shoes',          'fashion',     19000, 1, 'completed', now() - interval '42 days'),
  ('ORD-020', 'Sade Ogundimu',   'sade@gmail.com',    'Wireless Charger',       'electronics',  8500, 3, 'completed', now() - interval '40 days'),
  ('ORD-021', 'Emeka Okafor',    'emeka@gmail.com',   'Smart Watch',            'electronics', 25000, 1, 'completed', now() - interval '38 days'),
  ('ORD-022', 'Zainab Yusuf',    'zainab@gmail.com',  'Scented Candle',         'home',         4500, 4, 'completed', now() - interval '35 days'),
  ('ORD-023', 'Tope Abiodun',    'tope@gmail.com',    'Women''s Handbag',       'fashion',     18000, 1, 'pending',   now() - interval '33 days'),
  ('ORD-024', 'Ikenna Obi',      'ikenna@gmail.com',  'Bluetooth Speaker',      'electronics', 12000, 1, 'completed', now() - interval '30 days'),
  ('ORD-025', 'Adaeze Nwofor',   'adaeze@gmail.com',  'Laptop Backpack',        'accessories', 16000, 2, 'completed', now() - interval '28 days'),
  ('ORD-026', 'Bisi Olawale',    'bisi@gmail.com',    'LED Desk Lamp',          'home',         6500, 2, 'completed', now() - interval '25 days'),
  ('ORD-027', 'Chukwu Amadi',    'chukwu@gmail.com',  'Phone Case',             'accessories',  3000, 5, 'completed', now() - interval '23 days'),
  ('ORD-028', 'Halima Sule',     'halima@gmail.com',  'Gold Wristwatch',        'accessories', 45000, 1, 'completed', now() - interval '20 days'),
  ('ORD-029', 'Lanre Adewumi',   'lanre@gmail.com',   'Wireless Earbuds',       'electronics', 15000, 1, 'cancelled', now() - interval '18 days'),
  ('ORD-030', 'Ngozi Adeyemi',   'ngozi@yahoo.com',   'Premium Headphones',     'electronics', 35000, 1, 'completed', now() - interval '15 days'),
  ('ORD-031', 'Funke Akindele',  'funke@gmail.com',   'Ceramic Mug Set',        'home',         7000, 3, 'completed', now() - interval '13 days'),
  ('ORD-032', 'Rotimi Adesola',  'rotimi@gmail.com',  'Sneakers',               'fashion',     22000, 2, 'completed', now() - interval '10 days'),
  ('ORD-033', 'Yetunde Badmus',  'yetunde@gmail.com', 'Gaming Mouse RGB',       'electronics', 11000, 1, 'completed', now() - interval '8 days'),
  ('ORD-034', 'Kola Fashola',    'kola@gmail.com',    'Power Bank 20000mAh',    'electronics', 14000, 2, 'completed', now() - interval '5 days'),
  ('ORD-035', 'Amina Garba',     'amina@gmail.com',   'Wireless Charger',       'electronics',  8500, 1, 'completed', now() - interval '3 days'),
  ('ORD-036', 'Taiwo Oduola',    'taiwo@gmail.com',   'Running Shoes',          'fashion',     19000, 1, 'completed', now() - interval '2 days'),
  ('ORD-037', 'Obiageli Nzeka',  'obi@gmail.com',     'Leather Wallet',         'accessories',  5000, 2, 'pending',   now() - interval '1 day'),
  ('ORD-038', 'Emeka Okafor',    'emeka@gmail.com',   'Smart Watch',            'electronics', 25000, 1, 'completed', now() - interval '12 hours'),
  ('ORD-039', 'Ngozi Adeyemi',   'ngozi@yahoo.com',   'Women''s Handbag',       'fashion',     18000, 1, 'completed', now() - interval '6 hours'),
  ('ORD-040', 'Chidi Nwosu',     'chidi@outlook.com', 'Premium Headphones',     'electronics', 35000, 1, 'pending',   now() - interval '2 hours')
on conflict (order_number) do nothing;
