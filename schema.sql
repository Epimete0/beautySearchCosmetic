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
  producto_id uuid references productos(id),
  created_at timestamptz not null default now()
);
