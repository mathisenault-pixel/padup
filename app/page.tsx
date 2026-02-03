import { redirect } from 'next/navigation'

export const metadata = {
  title: "Accueil",
}

export default function Page() {
  redirect('/player/accueil')
}
