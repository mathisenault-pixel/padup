import LoginClient from './LoginClient'

export const metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte Pad\'Up pour gérer vos réservations de terrains de padel',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  // TODO: Implémenter authentification avec Prisma
  // Pour l'instant, afficher le formulaire sans vérification
  
  const callbackUrl = searchParams.callbackUrl || '/player/accueil'
  
  return <LoginClient callbackUrl={callbackUrl} />
}
