-- Create appointments table
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  stylist text not null,
  service text not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text default 'confirmed',
  notes text,
  google_event_id text -- To keep track if we eventually sync
);

-- Enable RLS
alter table public.appointments enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.appointments
  for select using (true);

create policy "Enable insert access for all users" on public.appointments
  for insert with check (true);

create policy "Enable update access for all users" on public.appointments
  for update using (true);

create policy "Enable delete access for all users" on public.appointments
  for delete using (true);

-- Add indexes
create index if not exists appointments_client_id_idx on public.appointments (client_id);
create index if not exists appointments_start_time_idx on public.appointments (start_time);
