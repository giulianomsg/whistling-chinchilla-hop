create table public.workout_execution_logs (
  id uuid not null default gen_random_uuid (),
  workout_session_id uuid not null,
  exercise_id uuid not null,
  workout_exercise_id uuid null,
  weight numeric null,
  reps integer null,
  notes text null,
  completed_at timestamp with time zone not null default now(),
  constraint workout_execution_logs_pkey primary key (id),
  constraint workout_execution_logs_workout_session_id_fkey foreign key (workout_session_id) references workout_sessions (id) on delete cascade,
  constraint workout_execution_logs_exercise_id_fkey foreign key (exercise_id) references exercises_library (id) on delete cascade,
  constraint workout_execution_logs_workout_exercise_id_fkey foreign key (workout_exercise_id) references workout_exercises (id) on delete set null
);

alter table public.workout_execution_logs enable row level security;

create policy "Users can view their own execution logs" on public.workout_execution_logs
  for select using (auth.uid() in (
    select client_id from workout_sessions where id = workout_session_id
  ));

create policy "Users can insert their own execution logs" on public.workout_execution_logs
  for insert with check (auth.uid() in (
    select client_id from workout_sessions where id = workout_session_id
  ));

create policy "Professionals can view execution logs of their clients" on public.workout_execution_logs
  for select using (auth.uid() in (
    select professional_id from workout_sessions where id = workout_session_id
  ));
