export default function ClubLayout({ children }: { children: React.ReactNode }) {
  // Simple layout sans gestion d'auth globale
  // Chaque page gère sa propre authentification
  return <>{children}</>
}
