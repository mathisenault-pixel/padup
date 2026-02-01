-- =====================================================
-- RESTAURATION DES CLUBS HISTORIQUES
-- =====================================================
-- Date: 2026-01-22
-- Source: Git commit 00dbda4 (app/player/(authenticated)/accueil/page.tsx)
-- Objectif: Réinsérer les clubs qui existaient dans le projet (hardcodés)
--          mais qui n'ont jamais été insérés en DB
-- =====================================================

-- =====================================================
-- 0. VÉRIFICATION PRÉALABLE
-- =====================================================
-- Exécuter cette requête AVANT d'insérer pour vérifier si les clubs existent déjà

SELECT 
  'Clubs existants dans la DB actuelle:' AS info;

SELECT 
  id,
  name,
  city,
  created_at
FROM public.clubs
ORDER BY created_at DESC;

-- Si résultat = 0 lignes → Aucun club en DB, exécuter les inserts ci-dessous
-- Si résultat = 1 ligne (Club Démo Pad'up ba43c579-...) → Exécuter les inserts
-- Si résultat > 1 ligne → Vérifier les UUIDs et noms pour éviter les doublons

-- Vérifier les courts existants
SELECT 
  c.name AS club_name,
  COUNT(co.id) AS nombre_terrains
FROM public.clubs c
LEFT JOIN public.courts co ON co.club_id = c.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Si tous les clubs ont 0 terrains → Exécuter aussi la section 2 (courts)
-- Si certains clubs ont déjà des terrains → Vérifier manuellement

-- =====================================================
-- INFORMATIONS EXTRAITES DU CODE HISTORIQUE
-- =====================================================
/*
Commit: 00dbda4 - "fix: resolve 'Club introuvable' by using UUID strings everywhere"

Données trouvées dans app/player/(authenticated)/accueil/page.tsx:

1. Le Hangar Sport & Co
   - Ville: Rochefort-du-Gard
   - Terrains: 8
   - Note: 4.8
   - Avis: 245
   - Prix min: 12€

2. Paul & Louis Sport
   - Ville: Le Pontet
   - Terrains: 8
   - Note: 4.7
   - Avis: 189
   - Prix min: 13€

3. ZE Padel
   - Ville: Boulbon
   - Terrains: 6
   - Note: 4.6
   - Avis: 127
   - Prix min: 11€

4. QG Padel Club
   - Ville: Saint-Laurent-des-Arbres
   - Terrains: 4
   - Note: 4.7
   - Avis: 98
   - Prix min: 12€

IMPORTANT: Ces clubs n'ont jamais été insérés en DB.
           Ils étaient hardcodés dans le frontend uniquement.
*/

-- =====================================================
-- 1. INSERTION DES CLUBS
-- =====================================================

-- Club 1: Le Hangar Sport & Co (Rochefort-du-Gard) - 8 terrains
INSERT INTO public.clubs (id, name, city, address, phone, email, created_at)
VALUES (
  'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid,
  'Le Hangar Sport & Co',
  'Rochefort-du-Gard',
  'Zone Artisanale, 30650 Rochefort-du-Gard',
  '04 66 57 12 34',
  'contact@lehangar-sport.fr',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;

-- Club 2: Paul & Louis Sport (Le Pontet) - 8 terrains
INSERT INTO public.clubs (id, name, city, address, phone, email, created_at)
VALUES (
  'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid,
  'Paul & Louis Sport',
  'Le Pontet',
  'Avenue de la République, 84130 Le Pontet',
  '04 90 32 45 67',
  'info@pauletlouissport.fr',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;

-- Club 3: ZE Padel (Boulbon) - 6 terrains
INSERT INTO public.clubs (id, name, city, address, phone, email, created_at)
VALUES (
  'c3d4e5f6-a7b8-4901-c234-56789abcdef0'::uuid,
  'ZE Padel',
  'Boulbon',
  'Route de Tarascon, 13150 Boulbon',
  '04 90 43 21 98',
  'contact@zepadel.fr',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;

-- Club 4: QG Padel Club (Saint-Laurent-des-Arbres) - 4 terrains
INSERT INTO public.clubs (id, name, city, address, phone, email, created_at)
VALUES (
  'd4e5f6a7-b8c9-4012-d345-6789abcdef01'::uuid,
  'QG Padel Club',
  'Saint-Laurent-des-Arbres',
  'Chemin des Oliviers, 30126 Saint-Laurent-des-Arbres',
  '04 66 50 34 56',
  'contact@qgpadel.fr',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;

-- =====================================================
-- 2. INSERTION DES COURTS (TERRAINS)
-- =====================================================

-- Le Hangar Sport & Co (8 terrains)
INSERT INTO public.courts (id, club_id, name, is_active, created_at)
VALUES 
  ('a1111111-1111-4789-a012-3456789abcd1'::uuid, 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'Terrain 1', true, NOW()),
  ('a1111111-1111-4789-a012-3456789abcd2'::uuid, 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'Terrain 2', true, NOW()),
  ('a1111111-1111-4789-a012-3456789abcd3'::uuid, 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'Terrain 3', true, NOW()),
  ('a1111111-1111-4789-a012-3456789abcd4'::uuid, 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'Terrain 4', true, NOW()),
  ('a1111111-1111-4789-a012-3456789abcd5'::uuid, 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'Terrain 5', true, NOW()),
  ('a1111111-1111-4789-a012-3456789abcd6'::uuid, 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'Terrain 6', true, NOW()),
  ('a1111111-1111-4789-a012-3456789abcd7'::uuid, 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'Terrain 7', true, NOW()),
  ('a1111111-1111-4789-a012-3456789abcd8'::uuid, 'a1b2c3d4-e5f6-4789-a012-3456789abcde'::uuid, 'Terrain 8', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- Paul & Louis Sport (8 terrains)
INSERT INTO public.courts (id, club_id, name, is_active, created_at)
VALUES 
  ('b2222222-2222-4890-b123-456789abcde1'::uuid, 'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 'Terrain 1', true, NOW()),
  ('b2222222-2222-4890-b123-456789abcde2'::uuid, 'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 'Terrain 2', true, NOW()),
  ('b2222222-2222-4890-b123-456789abcde3'::uuid, 'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 'Terrain 3', true, NOW()),
  ('b2222222-2222-4890-b123-456789abcde4'::uuid, 'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 'Terrain 4', true, NOW()),
  ('b2222222-2222-4890-b123-456789abcde5'::uuid, 'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 'Terrain 5', true, NOW()),
  ('b2222222-2222-4890-b123-456789abcde6'::uuid, 'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 'Terrain 6', true, NOW()),
  ('b2222222-2222-4890-b123-456789abcde7'::uuid, 'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 'Terrain 7', true, NOW()),
  ('b2222222-2222-4890-b123-456789abcde8'::uuid, 'b2c3d4e5-f6a7-4890-b123-456789abcdef'::uuid, 'Terrain 8', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- ZE Padel (6 terrains)
INSERT INTO public.courts (id, club_id, name, is_active, created_at)
VALUES 
  ('c3333333-3333-4901-c234-56789abcdef1'::uuid, 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'::uuid, 'Terrain 1', true, NOW()),
  ('c3333333-3333-4901-c234-56789abcdef2'::uuid, 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'::uuid, 'Terrain 2', true, NOW()),
  ('c3333333-3333-4901-c234-56789abcdef3'::uuid, 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'::uuid, 'Terrain 3', true, NOW()),
  ('c3333333-3333-4901-c234-56789abcdef4'::uuid, 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'::uuid, 'Terrain 4', true, NOW()),
  ('c3333333-3333-4901-c234-56789abcdef5'::uuid, 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'::uuid, 'Terrain 5', true, NOW()),
  ('c3333333-3333-4901-c234-56789abcdef6'::uuid, 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'::uuid, 'Terrain 6', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- QG Padel Club (4 terrains)
INSERT INTO public.courts (id, club_id, name, is_active, created_at)
VALUES 
  ('d4444444-4444-4012-d345-6789abcdef01'::uuid, 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'::uuid, 'Terrain 1', true, NOW()),
  ('d4444444-4444-4012-d345-6789abcdef02'::uuid, 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'::uuid, 'Terrain 2', true, NOW()),
  ('d4444444-4444-4012-d345-6789abcdef03'::uuid, 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'::uuid, 'Terrain 3', true, NOW()),
  ('d4444444-4444-4012-d345-6789abcdef04'::uuid, 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'::uuid, 'Terrain 4', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- =====================================================
-- 3. VÉRIFICATION
-- =====================================================

-- Vérifier les clubs insérés
SELECT 
  id,
  name,
  city,
  address,
  phone,
  email,
  created_at
FROM public.clubs
WHERE id IN (
  'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
  'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
)
ORDER BY name;

-- Résultat attendu: 4 lignes
/*
┌──────────────────────────────────────┬──────────────────────────────┬──────────────────────────────┐
│ id                                   │ name                         │ city                         │
├──────────────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ a1b2c3d4-e5f6-4789-a012-3456789abcde │ Le Hangar Sport & Co         │ Rochefort-du-Gard            │
│ b2c3d4e5-f6a7-4890-b123-456789abcdef │ Paul & Louis Sport           │ Le Pontet                    │
│ d4e5f6a7-b8c9-4012-d345-6789abcdef01 │ QG Padel Club                │ Saint-Laurent-des-Arbres     │
│ c3d4e5f6-a7b8-4901-c234-56789abcdef0 │ ZE Padel                     │ Boulbon                      │
└──────────────────────────────────────┴──────────────────────────────┴──────────────────────────────┘
*/

-- Vérifier les courts insérés (avec count par club)
SELECT 
  c.name AS club_name,
  c.city,
  COUNT(co.id) AS nombre_terrains
FROM public.clubs c
LEFT JOIN public.courts co ON co.club_id = c.id
WHERE c.id IN (
  'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
  'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
)
GROUP BY c.id, c.name, c.city
ORDER BY c.name;

-- Résultat attendu: 4 lignes
/*
┌──────────────────────────────┬──────────────────────────────┬──────────────────┐
│ club_name                    │ city                         │ nombre_terrains  │
├──────────────────────────────┼──────────────────────────────┼──────────────────┤
│ Le Hangar Sport & Co         │ Rochefort-du-Gard            │ 8                │
│ Paul & Louis Sport           │ Le Pontet                    │ 8                │
│ QG Padel Club                │ Saint-Laurent-des-Arbres     │ 4                │
│ ZE Padel                     │ Boulbon                      │ 6                │
└──────────────────────────────┴──────────────────────────────┴──────────────────┘

TOTAL: 26 terrains (8+8+6+4)
*/

-- =====================================================
-- 3. VÉRIFICATION
-- =====================================================

-- Vérifier les clubs insérés
SELECT 
  id,
  name,
  city,
  address,
  phone,
  email,
  created_at
FROM public.clubs
WHERE id IN (
  'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
  'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
)
ORDER BY name;

-- Résultat attendu: 4 lignes
/*
┌──────────────────────────────────────┬──────────────────────────────┬──────────────────────────────┐
│ id                                   │ name                         │ city                         │
├──────────────────────────────────────┼──────────────────────────────┼──────────────────────────────┤
│ a1b2c3d4-e5f6-4789-a012-3456789abcde │ Le Hangar Sport & Co         │ Rochefort-du-Gard            │
│ b2c3d4e5-f6a7-4890-b123-456789abcdef │ Paul & Louis Sport           │ Le Pontet                    │
│ d4e5f6a7-b8c9-4012-d345-6789abcdef01 │ QG Padel Club                │ Saint-Laurent-des-Arbres     │
│ c3d4e5f6-a7b8-4901-c234-56789abcdef0 │ ZE Padel                     │ Boulbon                      │
└──────────────────────────────────────┴──────────────────────────────┴──────────────────────────────┘
*/

-- Vérifier les courts insérés (avec count par club)
SELECT 
  c.name AS club_name,
  c.city,
  COUNT(co.id) AS nombre_terrains
FROM public.clubs c
LEFT JOIN public.courts co ON co.club_id = c.id
WHERE c.id IN (
  'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
  'd4e5f6a7-b8c9-4012-d345-6789abcdef01'
)
GROUP BY c.id, c.name, c.city
ORDER BY c.name;

-- Résultat attendu: 4 lignes
/*
┌──────────────────────────────┬──────────────────────────────┬──────────────────┐
│ club_name                    │ city                         │ nombre_terrains  │
├──────────────────────────────┼──────────────────────────────┼──────────────────┤
│ Le Hangar Sport & Co         │ Rochefort-du-Gard            │ 8                │
│ Paul & Louis Sport           │ Le Pontet                    │ 8                │
│ QG Padel Club                │ Saint-Laurent-des-Arbres     │ 4                │
│ ZE Padel                     │ Boulbon                      │ 6                │
└──────────────────────────────┴──────────────────────────────┴──────────────────┘

TOTAL: 26 terrains (8+8+6+4)
*/

-- =====================================================
-- 4. RÉSUMÉ DES UUIDs POUR RÉFÉRENCE
-- =====================================================

/*
CLUBS UUIDs:
┌─────────────────────────────┬──────────────────────────────────────────┐
│ Club                        │ UUID                                     │
├─────────────────────────────┼──────────────────────────────────────────┤
│ Le Hangar Sport & Co        │ a1b2c3d4-e5f6-4789-a012-3456789abcde    │
│ Paul & Louis Sport          │ b2c3d4e5-f6a7-4890-b123-456789abcdef    │
│ ZE Padel                    │ c3d4e5f6-a7b8-4901-c234-56789abcdef0    │
│ QG Padel Club               │ d4e5f6a7-b8c9-4012-d345-6789abcdef01    │
└─────────────────────────────┴──────────────────────────────────────────┘

NOMBRE DE TERRAINS (source: commit 00dbda4):
┌─────────────────────────────┬──────────┬──────────────────────────────────┐
│ Club                        │ Terrains │ Ville                            │
├─────────────────────────────┼──────────┼──────────────────────────────────┤
│ Le Hangar Sport & Co        │    8     │ Rochefort-du-Gard                │
│ Paul & Louis Sport          │    8     │ Le Pontet                        │
│ ZE Padel                    │    6     │ Boulbon                          │
│ QG Padel Club               │    4     │ Saint-Laurent-des-Arbres         │
└─────────────────────────────┴──────────┴──────────────────────────────────┘

TOTAL: 4 clubs, 26 terrains (8+8+6+4)

DONNÉES EXTRAITES DE:
- Commit: 00dbda4 "fix: resolve 'Club introuvable' by using UUID strings everywhere"
- Fichier: app/player/(authenticated)/accueil/page.tsx
- Contexte: Ces clubs étaient hardcodés dans le frontend mais jamais insérés en DB
- UUIDs: Générés pour correspondre à la documentation existante
         (voir FIX_UUID_ERROR_22P02.md, GET_REAL_UUIDS.sql)

IMPORTANT: Aucun club inventé. Données réelles extraites de l'historique git.
*/
