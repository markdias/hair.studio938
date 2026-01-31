-- Create clients table
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null unique,
  phone text,
  notes text
);

-- Enable RLS
alter table public.clients enable row level security;

-- Create policies (assuming admin access via authenticated role or service role)
create policy "Enable read access for all users" on public.clients
  for select using (true);

create policy "Enable insert access for all users" on public.clients
  for insert with check (true);

create policy "Enable update access for all users" on public.clients
  for update using (true);

-- Add index on email for faster lookups
create index if not exists clients_email_idx on public.clients (email);
