import { redirect } from 'next/navigation'

export default function PlayerLoginRedirect({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  // Rediriger vers /login avec le callbackUrl si présent
  const params = searchParams.callbackUrl ? `?callbackUrl=${encodeURIComponent(searchParams.callbackUrl)}` : ''
  redirect(`/login${params}`)
}
