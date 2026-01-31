-- Ajouter les colonnes first_name et last_name à la table profiles
alter table public.profiles
add column if not exists first_name text,
add column if not exists last_name text;

-- Mettre à jour les données existantes en séparant player_name si possible
-- (Optionnel : cette partie peut être retirée si vous préférez le faire manuellement)
update public.profiles
set 
  first_name = split_part(player_name, ' ', 1),
  last_name = case 
    when array_length(string_to_array(player_name, ' '), 1) > 1 
    then substring(player_name from position(' ' in player_name) + 1)
    else null
  end
where player_name is not null 
  and first_name is null 
  and last_name is null;





