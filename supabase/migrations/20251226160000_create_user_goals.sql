
create table if not exists user_goals (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  target_type text not null, -- 'weight', 'body_fat', 'squat', 'bench', 'deadlift', 'custom'
  start_value numeric not null,
  current_value numeric not null,
  target_value numeric not null,
  deadline date,
  status text default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table user_goals enable row level security;

create policy "Users can view their own goals"
  on user_goals for select
  using (auth.uid() = client_id);

create policy "Users can insert their own goals"
  on user_goals for insert
  with check (auth.uid() = client_id);

create policy "Users can update their own goals"
  on user_goals for update
  using (auth.uid() = client_id);

create policy "Users can delete their own goals"
  on user_goals for delete
  using (auth.uid() = client_id);

-- Professionals can view their clients' goals (assuming policy logic similar to others)
create policy "Professionals can view client goals"
  on user_goals for select
  using (
    exists (
      select 1 from professional_clients pc
      where pc.client_id = user_goals.client_id
      and pc.professional_id = auth.uid()
    )
  );
