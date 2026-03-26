create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text not null default '',
  email text,
  cidade text not null default '',
  data_nascimento date,
  observacoes_gerais text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.methods (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text not null default '',
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.method_sections (
  id uuid primary key default gen_random_uuid(),
  method_id uuid not null references public.methods(id) on delete cascade,
  slug text not null,
  nome text not null,
  tipo text not null default 'catalog',
  ordem integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(method_id, slug)
);

create table if not exists public.method_items (
  id uuid primary key default gen_random_uuid(),
  method_id uuid not null references public.methods(id) on delete cascade,
  section_id uuid not null references public.method_sections(id) on delete cascade,
  slug text not null,
  nome text not null,
  descricao text not null default '',
  item_type text not null default 'reference',
  ativo boolean not null default true,
  ordem integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(method_id, slug)
);

create table if not exists public.method_item_links (
  id uuid primary key default gen_random_uuid(),
  source_item_id uuid not null references public.method_items(id) on delete cascade,
  target_item_id uuid not null references public.method_items(id) on delete cascade,
  link_type text not null default 'supports',
  ordem integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique(source_item_id, target_item_id, link_type)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  method_id uuid not null references public.methods(id) on delete restrict,
  titulo text not null default '',
  status text not null default 'novo',
  data_inicio date,
  data_fim_prevista date,
  dia_processo integer not null default 1,
  queixa_principal text not null default '',
  objetivo text not null default '',
  valor numeric(10,2),
  status_pagamento text not null default 'pendente',
  observacoes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointment_protocols (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  method_item_id uuid not null references public.method_items(id) on delete restrict,
  is_primary boolean not null default false,
  status text not null default 'ativo',
  started_at timestamptz,
  completed_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointment_tool_usages (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  method_item_id uuid not null references public.method_items(id) on delete restrict,
  usage_type text not null default 'analysis',
  recorded_at timestamptz not null default timezone('utc', now()),
  summary text not null default '',
  result_data jsonb not null default '{}'::jsonb,
  notes text not null default ''
);

create table if not exists public.appointment_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  note_type text not null default 'general',
  titulo text not null default '',
  conteudo text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  resumo text not null default '',
  diagnostico_final text not null default '',
  padroes_identificados text not null default '',
  intervencoes_realizadas text not null default '',
  orientacoes_finais text not null default '',
  status text not null default 'rascunho',
  delivered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

drop trigger if exists methods_set_updated_at on public.methods;
create trigger methods_set_updated_at
before update on public.methods
for each row
execute function public.set_updated_at();

drop trigger if exists method_sections_set_updated_at on public.method_sections;
create trigger method_sections_set_updated_at
before update on public.method_sections
for each row
execute function public.set_updated_at();

drop trigger if exists method_items_set_updated_at on public.method_items;
create trigger method_items_set_updated_at
before update on public.method_items
for each row
execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row
execute function public.set_updated_at();

drop trigger if exists feedback_reports_set_updated_at on public.feedback_reports;
create trigger feedback_reports_set_updated_at
before update on public.feedback_reports
for each row
execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.methods enable row level security;
alter table public.method_sections enable row level security;
alter table public.method_items enable row level security;
alter table public.method_item_links enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_protocols enable row level security;
alter table public.appointment_tool_usages enable row level security;
alter table public.appointment_notes enable row level security;
alter table public.feedback_reports enable row level security;

drop policy if exists "authenticated full access clients" on public.clients;
create policy "authenticated full access clients"
on public.clients
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access methods" on public.methods;
create policy "authenticated full access methods"
on public.methods
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access method_sections" on public.method_sections;
create policy "authenticated full access method_sections"
on public.method_sections
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access method_items" on public.method_items;
create policy "authenticated full access method_items"
on public.method_items
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access method_item_links" on public.method_item_links;
create policy "authenticated full access method_item_links"
on public.method_item_links
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access appointments" on public.appointments;
create policy "authenticated full access appointments"
on public.appointments
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access appointment_protocols" on public.appointment_protocols;
create policy "authenticated full access appointment_protocols"
on public.appointment_protocols
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access appointment_tool_usages" on public.appointment_tool_usages;
create policy "authenticated full access appointment_tool_usages"
on public.appointment_tool_usages
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access appointment_notes" on public.appointment_notes;
create policy "authenticated full access appointment_notes"
on public.appointment_notes
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated full access feedback_reports" on public.feedback_reports;
create policy "authenticated full access feedback_reports"
on public.feedback_reports
for all
to authenticated
using (true)
with check (true);
