-- Table pour stocker les demandes d'accès club
-- Les clubs remplissent ce formulaire, je les recontacte manuellement

CREATE TABLE IF NOT EXISTS public.club_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Infos du club
  club_name TEXT NOT NULL,
  city TEXT NOT NULL,
  num_courts INTEGER,
  website TEXT, -- Site web ou Instagram
  
  -- Contact
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  
  -- Message optionnel
  message TEXT,
  accept_contact BOOLEAN NOT NULL DEFAULT false, -- RGPD obligatoire
  
  -- Métadonnées
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  request_day DATE GENERATED ALWAYS AS (created_at::date) STORED, -- Pour contrainte anti-spam
  
  -- Notes internes (admin)
  admin_notes TEXT,
  
  -- Anti-spam: max 1 demande par email par jour
  CONSTRAINT unique_email_per_day UNIQUE (contact_email, request_day)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_club_requests_status ON public.club_requests(status);
CREATE INDEX IF NOT EXISTS idx_club_requests_created_at ON public.club_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_club_requests_email ON public.club_requests(contact_email);
CREATE INDEX IF NOT EXISTS idx_club_requests_day ON public.club_requests(request_day);

-- ============================================
-- RLS (Row Level Security) - STRICT
-- ============================================
ALTER TABLE public.club_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Insert via Server Action uniquement (anon/authenticated avec validation)
-- Le honeypot et la validation checkbox sont gérés côté Server Action
CREATE POLICY "Public can insert club requests"
  ON public.club_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Validation basique au niveau DB
    club_name IS NOT NULL 
    AND city IS NOT NULL
    AND contact_name IS NOT NULL
    AND contact_phone IS NOT NULL
    AND contact_email IS NOT NULL
    AND accept_contact = true -- RGPD obligatoire
  );

-- Policy 2: Seul service_role peut SELECT (admin dashboard futur)
CREATE POLICY "Only service role can read requests"
  ON public.club_requests
  FOR SELECT
  TO service_role
  USING (true);

-- Policy 3: Seul service_role peut UPDATE (changement de status, notes)
CREATE POLICY "Only service role can update requests"
  ON public.club_requests
  FOR UPDATE
  TO service_role
  USING (true);

-- Policy 4: Seul service_role peut DELETE (nettoyage spam)
CREATE POLICY "Only service role can delete requests"
  ON public.club_requests
  FOR DELETE
  TO service_role
  USING (true);

-- ⚠️ IMPORTANT: Les utilisateurs normaux (authenticated) ne peuvent PAS lire les demandes
-- Seuls les admins (via service_role) peuvent accéder aux données

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_club_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_club_requests_updated_at_trigger
  BEFORE UPDATE ON public.club_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_club_requests_updated_at();

-- Commentaires
COMMENT ON TABLE public.club_requests IS 'Demandes d''accès club - formulaire de contact (pas de création auto)';
COMMENT ON COLUMN public.club_requests.status IS 'pending, contacted, approved, rejected';
COMMENT ON COLUMN public.club_requests.accept_contact IS 'RGPD - obligatoire pour traiter la demande';
COMMENT ON COLUMN public.club_requests.website IS 'Site web ou Instagram du club (optionnel)';
COMMENT ON COLUMN public.club_requests.request_day IS 'Date (jour uniquement) - pour contrainte anti-spam';
COMMENT ON CONSTRAINT unique_email_per_day ON public.club_requests IS 'Anti-spam: max 1 demande par email par jour';
