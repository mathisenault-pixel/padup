-- Créer la table des profils
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  role text not null check (role in ('club', 'player')),
  club_name text,
  player_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Politique : Les utilisateurs peuvent voir leur propre profil
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Politique : Permettre l'insertion lors de l'inscription
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Fonction pour mettre à jour updated_at automatiquement
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger pour updated_at
create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
