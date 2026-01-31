-- ============================================
-- Table: profiles
-- Description: Stocke les profils utilisateurs avec leur rôle
-- ============================================

-- Créer un type enum pour les rôles
CREATE TYPE user_role AS ENUM ('player', 'club');

-- Créer la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Clé primaire (même que auth.users.id)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rôle de l'utilisateur
  role user_role NOT NULL DEFAULT 'player',
  
  -- Informations player
  player_name TEXT,
  
  -- Informations club
  club_name TEXT,
  
  -- Email (copie pour faciliter les requêtes)
  email TEXT NOT NULL,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Activer Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Politique : Seul le système peut insérer des profils (via trigger)
CREATE POLICY "System can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Commentaires pour la documentation
COMMENT ON TABLE public.profiles IS 'Profils utilisateurs avec leur rôle (player ou club)';
COMMENT ON COLUMN public.profiles.id IS 'UUID de l''utilisateur (référence auth.users.id)';
COMMENT ON COLUMN public.profiles.role IS 'Rôle de l''utilisateur : player (joueur) ou club (gestionnaire de club)';
COMMENT ON COLUMN public.profiles.player_name IS 'Nom du joueur (si role=player)';
COMMENT ON COLUMN public.profiles.club_name IS 'Nom du club (si role=club)';
COMMENT ON COLUMN public.profiles.email IS 'Email de l''utilisateur (copie de auth.users.email)';











