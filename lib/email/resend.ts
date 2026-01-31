/**
 * Resend Email Service
 * Documentation: https://resend.com/docs/send-with-nextjs
 * 
 * Configuration requise:
 * - Installer: npm install resend
 * - Variable d'environnement: RESEND_API_KEY
 * - Variable d'environnement: RESEND_FROM_EMAIL (ex: noreply@padup.com)
 */

type EmailOptions = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // Vérifier que les variables d'environnement sont configurées
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@padup.com'

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[EMAIL] RESEND_API_KEY not configured. Email would be sent to:', to)
      console.log('[EMAIL] Subject:', subject)
      console.log('[EMAIL] HTML preview:', html.slice(0, 200) + '...')
    }
    return { success: false, error: 'Email service not configured' }
  }

  try {
    // Utiliser fetch pour appeler l'API Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Pad'Up <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[EMAIL] Email sent successfully:', data.id)
    }

    return { success: true, id: data.id }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[EMAIL] Error sending email:', error)
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}











