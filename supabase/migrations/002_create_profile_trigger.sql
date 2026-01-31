-- ============================================
-- Trigger: Création automatique du profil lors du signup
-- Description: Crée automatiquement une ligne dans profiles
--              quand un utilisateur s'inscrit
-- ============================================

-- Fonction qui sera appelée par le trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer un nouveau profil avec les données de l'utilisateur
  INSERT INTO public.profiles (id, email, role, player_name)
  VALUES (
    NEW.id,
    NEW.email,
    'player', -- Rôle par défaut
    COALESCE(NEW.raw_user_meta_data->>'player_name', SPLIT_PART(NEW.email, '@', 1)) -- Nom par défaut = partie avant @ de l'email
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger qui se déclenche après insertion dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Commentaire pour la documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Crée automatiquement un profil player lors de l''inscription d''un utilisateur';

-- ============================================
-- Fonction pour mettre à jour updated_at automatiquement
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON FUNCTION public.handle_updated_at() IS 'Met à jour automatiquement le champ updated_at lors d''une modification';











