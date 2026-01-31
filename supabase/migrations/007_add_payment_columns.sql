-- ============================================
-- Migration: Ajout des colonnes de paiement (sur place uniquement)
-- Description: Système de paiement au club (pas de paiement en ligne)
-- ============================================

-- 1. Ajouter payment_mode dans la table clubs
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS payment_mode TEXT NOT NULL DEFAULT 'on_site' CHECK (payment_mode IN ('on_site'));

-- 2. Ajouter price_per_hour dans la table courts (prix indicatif)
ALTER TABLE public.courts
ADD COLUMN IF NOT EXISTS price_per_hour DECIMAL(10, 2);

-- 3. Ajouter payment_status dans la table reservations
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pay_on_site' CHECK (
  payment_status IN ('pay_on_site', 'paid_on_site', 'waived')
);

-- 4. Ajouter paid_at pour tracer quand le paiement a été effectué
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 5. Créer un index pour les réservations non payées
CREATE INDEX IF NOT EXISTS reservations_payment_status_idx 
  ON public.reservations(payment_status) 
  WHERE status = 'confirmed';

-- 6. Politique : Les clubs peuvent mettre à jour le payment_status de leurs réservations
DROP POLICY IF EXISTS "Clubs can update court reservations" ON public.reservations;
CREATE POLICY "Clubs can update court reservations"
  ON public.reservations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courts
      JOIN public.clubs ON clubs.id = courts.club_id
      WHERE courts.id = reservations.court_id
      AND clubs.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courts
      JOIN public.clubs ON clubs.id = courts.club_id
      WHERE courts.id = reservations.court_id
      AND clubs.owner_id = auth.uid()
    )
  );

-- 7. Trigger pour mettre à jour paid_at automatiquement
CREATE OR REPLACE FUNCTION update_paid_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid_on_site' AND OLD.payment_status != 'paid_on_site' THEN
    NEW.paid_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reservation_paid
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_paid_at();

-- 8. Commentaires
COMMENT ON COLUMN public.clubs.payment_mode IS 'Mode de paiement (uniquement on_site pour paiement au club)';
COMMENT ON COLUMN public.courts.price_per_hour IS 'Prix indicatif par heure (à payer au club)';
COMMENT ON COLUMN public.reservations.payment_status IS 'Statut du paiement : pay_on_site (à payer), paid_on_site (payé au club), waived (offert)';
COMMENT ON COLUMN public.reservations.paid_at IS 'Date et heure du paiement sur place';

-- 9. Vue pour les réservations avec informations de paiement
DROP VIEW IF EXISTS reservations_with_details;
CREATE OR REPLACE VIEW reservations_with_details AS
SELECT 
  r.id,
  r.court_id,
  r.player_id,
  r.date,
  r.start_time,
  r.end_time,
  r.status,
  r.payment_status,
  r.paid_at,
  r.price,
  r.notes,
  r.created_at,
  r.updated_at,
  r.cancelled_at,
  co.name AS court_name,
  co.type AS court_type,
  co.price_per_hour AS court_price_per_hour,
  cl.id AS club_id,
  cl.name AS club_name,
  cl.city AS club_city,
  cl.payment_mode AS club_payment_mode,
  p.email AS player_email,
  pr.player_name
FROM public.reservations r
JOIN public.courts co ON co.id = r.court_id
JOIN public.clubs cl ON cl.id = co.club_id
JOIN auth.users u ON u.id = r.player_id
LEFT JOIN public.profiles pr ON pr.id = r.player_id
LEFT JOIN public.profiles p ON p.id = r.player_id;











