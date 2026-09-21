create table productos (
  id uuid primary key default gen_random_uuid(),
  barcode text unique not null,
  nombre text,
  marca text,
  submarca text,
  categoria text,
  cantidad text,
  imagen_url text,
  fuente text not null check (fuente in ('open_beauty_facts', 'open_food_facts', 'manual')),
  respuesta_cruda jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_productos_barcode on productos(barcode);
create index idx_productos_marca on productos(marca);

create table historial_escaneos (
  id uuid primary key default gen_random_uuid(),
  barcode text not null,
  encontrado boolean not null,
  source text,                           -- 'local' | 'open_beauty_facts' | 'open_food_facts' | null (no match)
  producto_id uuid references productos(id),
  created_at timestamptz not null default now(),
  verificado boolean
);

-- Row Level Security (RLS)
alter table productos enable row level security;
alter table historial_escaneos enable row level security;

create policy "allow all for anon" on productos
  for all using (true) with check (true);

create policy "allow all for anon" on historial_escaneos
  for all using (true) with check (true);
