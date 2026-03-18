create extension if not exists pgcrypto;

create table if not exists public.clients (
  id text primary key,
  nome text not null default '',
  whatsapp text not null default '',
  email text,
  data_inicio date,
  tipo_sessao text not null default 'Sessao Essencial',
  queixa_principal text not null default '',
  objetivo text not null default '',
  diagnostico_energetico text not null default '',
  causas_identificadas text not null default '',
  areas_afetadas text not null default '',
  intervencoes_realizadas text not null default '',
  observacoes text not null default '',
  status text not null default 'Novo contato',
  dia_processo integer not null default 1,
  evolucao text not null default '',
  valor numeric(10,2),
  status_pagamento text not null default 'Pendente',
  devolutiva_final text not null default '',
  proximos_passos text not null default '',
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

alter table public.clients enable row level security;

drop policy if exists "authenticated users can read clients" on public.clients;
create policy "authenticated users can read clients"
on public.clients
for select
to authenticated
using (true);

drop policy if exists "authenticated users can insert clients" on public.clients;
create policy "authenticated users can insert clients"
on public.clients
for insert
to authenticated
with check (true);

drop policy if exists "authenticated users can update clients" on public.clients;
create policy "authenticated users can update clients"
on public.clients
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can delete clients" on public.clients;
create policy "authenticated users can delete clients"
on public.clients
for delete
to authenticated
using (true);
