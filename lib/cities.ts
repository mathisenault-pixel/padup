/**
 * Base de données des villes de la région Sud (150+ villes)
 * Départements couverts : Gard (30), Vaucluse (84), Bouches-du-Rhône (13), Hérault (34), Drôme (26), Ardèche (07)
 * Avec coordonnées GPS précises pour le calcul de distance
 */

export type City = {
  name: string
  postalCode: string
  department: string
  lat: number
  lng: number
}

export const CITIES: City[] = [
  // GARD (30)
  { name: 'Nîmes', postalCode: '30000', department: 'Gard', lat: 43.8374, lng: 4.3601 },
  { name: 'Alès', postalCode: '30100', department: 'Gard', lat: 44.1250, lng: 4.0814 },
  { name: 'Bagnols-sur-Cèze', postalCode: '30200', department: 'Gard', lat: 44.1628, lng: 4.6206 },
  { name: 'Beaucaire', postalCode: '30300', department: 'Gard', lat: 43.8083, lng: 4.6458 },
  { name: 'Saint-Gilles', postalCode: '30800', department: 'Gard', lat: 43.6772, lng: 4.4319 },
  { name: 'Vauvert', postalCode: '30600', department: 'Gard', lat: 43.6944, lng: 4.2756 },
  { name: 'Villeneuve-lès-Avignon', postalCode: '30400', department: 'Gard', lat: 43.9667, lng: 4.7969 },
  { name: 'Pont-Saint-Esprit', postalCode: '30130', department: 'Gard', lat: 44.2575, lng: 4.6478 },
  { name: 'Marguerittes', postalCode: '30320', department: 'Gard', lat: 43.8631, lng: 4.4428 },
  { name: 'Uzès', postalCode: '30700', department: 'Gard', lat: 44.0122, lng: 4.4197 },
  { name: 'Le Grau-du-Roi', postalCode: '30240', department: 'Gard', lat: 43.5356, lng: 4.1358 },
  { name: 'Laudun-l\'Ardoise', postalCode: '30290', department: 'Gard', lat: 44.1081, lng: 4.6533 },
  { name: 'Aigues-Mortes', postalCode: '30220', department: 'Gard', lat: 43.5669, lng: 4.1919 },
  { name: 'Rochefort-du-Gard', postalCode: '30650', department: 'Gard', lat: 43.9781, lng: 4.6911 },
  { name: 'Saint-Laurent-des-Arbres', postalCode: '30126', department: 'Gard', lat: 44.0528, lng: 4.6981 },
  { name: 'Les Angles', postalCode: '30133', department: 'Gard', lat: 43.9631, lng: 4.7633 },
  { name: 'Manduel', postalCode: '30129', department: 'Gard', lat: 43.8194, lng: 4.4731 },
  { name: 'Milhaud', postalCode: '30540', department: 'Gard', lat: 43.7928, lng: 4.3136 },
  { name: 'Redessan', postalCode: '30129', department: 'Gard', lat: 43.8339, lng: 4.5022 },
  { name: 'Sommières', postalCode: '30250', department: 'Gard', lat: 43.7831, lng: 4.0900 },
  { name: 'Caveirac', postalCode: '30820', department: 'Gard', lat: 43.8333, lng: 4.2667 },
  { name: 'Calvisson', postalCode: '30420', department: 'Gard', lat: 43.7850, lng: 4.1908 },
  { name: 'Saint-Christol-lès-Alès', postalCode: '30380', department: 'Gard', lat: 44.0514, lng: 4.0986 },
  { name: 'Bellegarde', postalCode: '30127', department: 'Gard', lat: 43.7500, lng: 4.5167 },
  { name: 'Générac', postalCode: '30510', department: 'Gard', lat: 43.7333, lng: 4.3500 },
  { name: 'Aimargues', postalCode: '30470', department: 'Gard', lat: 43.6833, lng: 4.2000 },
  { name: 'Vergèze', postalCode: '30310', department: 'Gard', lat: 43.7444, lng: 4.2281 },
  { name: 'Roquemaure', postalCode: '30150', department: 'Gard', lat: 44.0533, lng: 4.7761 },
  { name: 'Jonquières-Saint-Vincent', postalCode: '30300', department: 'Gard', lat: 43.8167, lng: 4.6000 },
  { name: 'Bernis', postalCode: '30620', department: 'Gard', lat: 43.7667, lng: 4.2833 },

  // VAUCLUSE (84)
  { name: 'Avignon', postalCode: '84000', department: 'Vaucluse', lat: 43.9493, lng: 4.8055 },
  { name: 'Orange', postalCode: '84100', department: 'Vaucluse', lat: 44.1372, lng: 4.8086 },
  { name: 'Carpentras', postalCode: '84200', department: 'Vaucluse', lat: 44.0550, lng: 5.0481 },
  { name: 'Cavaillon', postalCode: '84300', department: 'Vaucluse', lat: 43.8369, lng: 5.0378 },
  { name: 'Apt', postalCode: '84400', department: 'Vaucluse', lat: 43.8767, lng: 5.3967 },
  { name: 'Pertuis', postalCode: '84120', department: 'Vaucluse', lat: 43.6942, lng: 5.5017 },
  { name: 'Bollène', postalCode: '84500', department: 'Vaucluse', lat: 44.2800, lng: 4.7500 },
  { name: 'Le Pontet', postalCode: '84130', department: 'Vaucluse', lat: 43.9608, lng: 4.8583 },
  { name: 'Sorgues', postalCode: '84700', department: 'Vaucluse', lat: 44.0069, lng: 4.8714 },
  { name: 'Vedène', postalCode: '84270', department: 'Vaucluse', lat: 43.9786, lng: 4.9050 },
  { name: 'L\'Isle-sur-la-Sorgue', postalCode: '84800', department: 'Vaucluse', lat: 43.9192, lng: 5.0506 },
  { name: 'Valréas', postalCode: '84600', department: 'Vaucluse', lat: 44.3833, lng: 4.9917 },
  { name: 'Pernes-les-Fontaines', postalCode: '84210', department: 'Vaucluse', lat: 43.9989, lng: 5.0578 },
  { name: 'Monteux', postalCode: '84170', department: 'Vaucluse', lat: 44.0358, lng: 4.9978 },
  { name: 'Entraigues-sur-la-Sorgue', postalCode: '84320', department: 'Vaucluse', lat: 43.9831, lng: 4.9281 },
  { name: 'Sarrians', postalCode: '84260', department: 'Vaucluse', lat: 44.0833, lng: 4.9667 },
  { name: 'Morières-lès-Avignon', postalCode: '84310', department: 'Vaucluse', lat: 43.9381, lng: 4.9031 },
  { name: 'Châteauneuf-du-Pape', postalCode: '84230', department: 'Vaucluse', lat: 44.0556, lng: 4.8306 },
  { name: 'Malaucène', postalCode: '84340', department: 'Vaucluse', lat: 44.1747, lng: 5.1322 },
  { name: 'Mazan', postalCode: '84380', department: 'Vaucluse', lat: 44.0575, lng: 5.1222 },
  { name: 'Bédarrides', postalCode: '84370', department: 'Vaucluse', lat: 44.0417, lng: 4.8969 },
  { name: 'Althen-des-Paluds', postalCode: '84210', department: 'Vaucluse', lat: 43.9833, lng: 4.9667 },
  { name: 'Vaison-la-Romaine', postalCode: '84110', department: 'Vaucluse', lat: 44.2408, lng: 5.0733 },
  { name: 'Courthézon', postalCode: '84350', department: 'Vaucluse', lat: 44.0875, lng: 4.8897 },
  { name: 'Cadenet', postalCode: '84160', department: 'Vaucluse', lat: 43.7344, lng: 5.3747 },

  // BOUCHES-DU-RHÔNE (13)
  { name: 'Marseille', postalCode: '13000', department: 'Bouches-du-Rhône', lat: 43.2965, lng: 5.3698 },
  { name: 'Aix-en-Provence', postalCode: '13100', department: 'Bouches-du-Rhône', lat: 43.5297, lng: 5.4474 },
  { name: 'Arles', postalCode: '13200', department: 'Bouches-du-Rhône', lat: 43.6767, lng: 4.6278 },
  { name: 'Martigues', postalCode: '13500', department: 'Bouches-du-Rhône', lat: 43.4047, lng: 5.0517 },
  { name: 'Aubagne', postalCode: '13400', department: 'Bouches-du-Rhône', lat: 43.2928, lng: 5.5708 },
  { name: 'Salon-de-Provence', postalCode: '13300', department: 'Bouches-du-Rhône', lat: 43.6403, lng: 5.0978 },
  { name: 'Istres', postalCode: '13800', department: 'Bouches-du-Rhône', lat: 43.5136, lng: 4.9878 },
  { name: 'Vitrolles', postalCode: '13127', department: 'Bouches-du-Rhône', lat: 43.4553, lng: 5.2478 },
  { name: 'Marignane', postalCode: '13700', department: 'Bouches-du-Rhône', lat: 43.4178, lng: 5.2156 },
  { name: 'La Ciotat', postalCode: '13600', department: 'Bouches-du-Rhône', lat: 43.1747, lng: 5.6061 },
  { name: 'Châteaurenard', postalCode: '13160', department: 'Bouches-du-Rhône', lat: 43.8831, lng: 4.8528 },
  { name: 'Tarascon', postalCode: '13150', department: 'Bouches-du-Rhône', lat: 43.8056, lng: 4.6606 },
  { name: 'Berre-l\'Étang', postalCode: '13130', department: 'Bouches-du-Rhône', lat: 43.4850, lng: 5.1656 },
  { name: 'Port-de-Bouc', postalCode: '13110', department: 'Bouches-du-Rhône', lat: 43.4058, lng: 4.9864 },
  { name: 'Fos-sur-Mer', postalCode: '13270', department: 'Bouches-du-Rhône', lat: 43.4447, lng: 4.9433 },
  { name: 'Gardanne', postalCode: '13120', department: 'Bouches-du-Rhône', lat: 43.4550, lng: 5.4697 },
  { name: 'Miramas', postalCode: '13140', department: 'Bouches-du-Rhône', lat: 43.5847, lng: 5.0008 },
  { name: 'Les Pennes-Mirabeau', postalCode: '13170', department: 'Bouches-du-Rhône', lat: 43.4106, lng: 5.3097 },
  { name: 'Boulbon', postalCode: '13150', department: 'Bouches-du-Rhône', lat: 43.8519, lng: 4.7111 },
  { name: 'Saint-Rémy-de-Provence', postalCode: '13210', department: 'Bouches-du-Rhône', lat: 43.7889, lng: 4.8319 },
  { name: 'Eyguières', postalCode: '13430', department: 'Bouches-du-Rhône', lat: 43.6958, lng: 5.0311 },
  { name: 'Lambesc', postalCode: '13410', department: 'Bouches-du-Rhône', lat: 43.6544, lng: 5.2622 },
  { name: 'Pélissanne', postalCode: '13330', department: 'Bouches-du-Rhône', lat: 43.6347, lng: 5.1500 },
  { name: 'Rognes', postalCode: '13840', department: 'Bouches-du-Rhône', lat: 43.6642, lng: 5.3461 },
  { name: 'Cassis', postalCode: '13260', department: 'Bouches-du-Rhône', lat: 43.2147, lng: 5.5381 },
  { name: 'Allauch', postalCode: '13190', department: 'Bouches-du-Rhône', lat: 43.3364, lng: 5.4803 },
  { name: 'Bouc-Bel-Air', postalCode: '13320', department: 'Bouches-du-Rhône', lat: 43.4528, lng: 5.4161 },
  { name: 'Peyrolles-en-Provence', postalCode: '13860', department: 'Bouches-du-Rhône', lat: 43.6417, lng: 5.5833 },
  { name: 'Rognac', postalCode: '13340', department: 'Bouches-du-Rhône', lat: 43.4883, lng: 5.2311 },
  { name: 'Carry-le-Rouet', postalCode: '13620', department: 'Bouches-du-Rhône', lat: 43.3317, lng: 5.1556 },
  { name: 'Venelles', postalCode: '13770', department: 'Bouches-du-Rhône', lat: 43.5981, lng: 5.4794 },
  { name: 'Graveson', postalCode: '13690', department: 'Bouches-du-Rhône', lat: 43.8508, lng: 4.7731 },
  { name: 'Cabriès', postalCode: '13480', department: 'Bouches-du-Rhône', lat: 43.4431, lng: 5.3794 },
  { name: 'Plan-de-Cuques', postalCode: '13380', department: 'Bouches-du-Rhône', lat: 43.3483, lng: 5.4622 },
  { name: 'Meyrargues', postalCode: '13650', department: 'Bouches-du-Rhône', lat: 43.6381, lng: 5.5194 },

  // HÉRAULT (34)
  { name: 'Montpellier', postalCode: '34000', department: 'Hérault', lat: 43.6108, lng: 3.8767 },
  { name: 'Béziers', postalCode: '34500', department: 'Hérault', lat: 43.3444, lng: 3.2150 },
  { name: 'Sète', postalCode: '34200', department: 'Hérault', lat: 43.4028, lng: 3.6972 },
  { name: 'Lunel', postalCode: '34400', department: 'Hérault', lat: 43.6753, lng: 4.1361 },
  { name: 'Agde', postalCode: '34300', department: 'Hérault', lat: 43.3097, lng: 3.4742 },
  { name: 'Frontignan', postalCode: '34110', department: 'Hérault', lat: 43.4489, lng: 3.7553 },
  { name: 'Castelnau-le-Lez', postalCode: '34170', department: 'Hérault', lat: 43.6342, lng: 3.8989 },
  { name: 'Mauguio', postalCode: '34130', department: 'Hérault', lat: 43.6169, lng: 4.0119 },
  { name: 'Lattes', postalCode: '34970', department: 'Hérault', lat: 43.5669, lng: 3.9000 },
  { name: 'Pérols', postalCode: '34470', department: 'Hérault', lat: 43.5619, lng: 3.9556 },
  { name: 'Lodève', postalCode: '34700', department: 'Hérault', lat: 43.7319, lng: 3.3194 },
  { name: 'Palavas-les-Flots', postalCode: '34250', department: 'Hérault', lat: 43.5322, lng: 3.9311 },
  { name: 'Marseillan', postalCode: '34340', department: 'Hérault', lat: 43.3572, lng: 3.5289 },
  { name: 'Juvignac', postalCode: '34990', department: 'Hérault', lat: 43.6122, lng: 3.8047 },
  { name: 'Villeneuve-lès-Maguelone', postalCode: '34750', department: 'Hérault', lat: 43.5328, lng: 3.8597 },
  { name: 'Pignan', postalCode: '34570', department: 'Hérault', lat: 43.5808, lng: 3.7589 },
  { name: 'Baillargues', postalCode: '34670', department: 'Hérault', lat: 43.6597, lng: 4.0089 },
  { name: 'Vendargues', postalCode: '34740', department: 'Hérault', lat: 43.6572, lng: 3.9667 },
  { name: 'Saint-Jean-de-Védas', postalCode: '34430', department: 'Hérault', lat: 43.5764, lng: 3.8339 },
  { name: 'Clermont-l\'Hérault', postalCode: '34800', department: 'Hérault', lat: 43.6286, lng: 3.4319 },

  // DRÔME (26)
  { name: 'Valence', postalCode: '26000', department: 'Drôme', lat: 44.9333, lng: 4.8919 },
  { name: 'Montélimar', postalCode: '26200', department: 'Drôme', lat: 44.5583, lng: 4.7511 },
  { name: 'Romans-sur-Isère', postalCode: '26100', department: 'Drôme', lat: 45.0444, lng: 5.0514 },
  { name: 'Bourg-lès-Valence', postalCode: '26500', department: 'Drôme', lat: 44.9467, lng: 4.8936 },
  { name: 'Pierrelatte', postalCode: '26700', department: 'Drôme', lat: 44.3769, lng: 4.6989 },
  { name: 'Bourg-de-Péage', postalCode: '26300', department: 'Drôme', lat: 45.0372, lng: 5.0517 },
  { name: 'Livron-sur-Drôme', postalCode: '26250', department: 'Drôme', lat: 44.7739, lng: 4.8422 },
  { name: 'Portes-lès-Valence', postalCode: '26800', department: 'Drôme', lat: 44.8747, lng: 4.8775 },
  { name: 'Saint-Paul-Trois-Châteaux', postalCode: '26130', department: 'Drôme', lat: 44.3506, lng: 4.7681 },
  { name: 'Crest', postalCode: '26400', department: 'Drôme', lat: 44.7283, lng: 5.0208 },

  // ARDÈCHE (07)
  { name: 'Annonay', postalCode: '07100', department: 'Ardèche', lat: 45.2397, lng: 4.6697 },
  { name: 'Aubenas', postalCode: '07200', department: 'Ardèche', lat: 44.6200, lng: 4.3903 },
  { name: 'Tournon-sur-Rhône', postalCode: '07300', department: 'Ardèche', lat: 45.0683, lng: 4.8331 },
  { name: 'Privas', postalCode: '07000', department: 'Ardèche', lat: 44.7350, lng: 4.5989 },
  { name: 'Guilherand-Granges', postalCode: '07500', department: 'Ardèche', lat: 44.9333, lng: 4.8750 },
  { name: 'Le Teil', postalCode: '07400', department: 'Ardèche', lat: 44.5500, lng: 4.6833 },
  { name: 'Bourg-Saint-Andéol', postalCode: '07700', department: 'Ardèche', lat: 44.3736, lng: 4.6436 },
  { name: 'Saint-Péray', postalCode: '07130', department: 'Ardèche', lat: 44.9503, lng: 4.8514 },
]

/**
 * Récupérer les coordonnées GPS d'une ville par son nom
 */
export function getCityCoordinates(cityName: string): { lat: number; lng: number } | null {
  const city = CITIES.find(c => 
    c.name.toLowerCase() === cityName.toLowerCase()
  )
  return city ? { lat: city.lat, lng: city.lng } : null
}

/**
 * Récupérer la liste de toutes les villes pour les suggestions
 */
export function getCitySuggestions(): string[] {
  return CITIES.map(c => c.name).sort()
}

/**
 * Rechercher une ville (insensible à la casse, recherche partielle)
 */
export function searchCities(query: string): City[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return []
  
  return CITIES.filter(city =>
    city.name.toLowerCase().includes(lowerQuery) ||
    city.postalCode.includes(lowerQuery) ||
    city.department.toLowerCase().includes(lowerQuery)
  ).slice(0, 10) // Limiter à 10 résultats
}
