import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// ✅ Initialiser Resend avec la clé API côté serveur UNIQUEMENT
const resend = new Resend(process.env.RESEND_API_KEY)

// ✅ Type pour la validation des données d'entrée
type InviteEmailData = {
  to: string
  clubName: string
  dateText: string
  message?: string
  bookingUrl?: string
}

// ✅ Fonction de validation des données
function validateInviteData(data: any): { valid: boolean; error?: string; data?: InviteEmailData } {
  // Vérifier les champs requis
  if (!data.to || typeof data.to !== 'string') {
    return { valid: false, error: 'Le champ "to" (email destinataire) est requis' }
  }

  if (!data.clubName || typeof data.clubName !== 'string') {
    return { valid: false, error: 'Le champ "clubName" est requis' }
  }

  if (!data.dateText || typeof data.dateText !== 'string') {
    return { valid: false, error: 'Le champ "dateText" est requis' }
  }

  // Valider le format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.to)) {
    return { valid: false, error: 'Format email invalide' }
  }

  return {
    valid: true,
    data: {
      to: data.to,
      clubName: data.clubName,
      dateText: data.dateText,
      message: data.message || '',
      bookingUrl: data.bookingUrl || '',
    },
  }
}

// ✅ Template HTML élégant pour l'email
function generateEmailHTML(clubName: string, dateText: string, message: string, bookingUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation - Partie de Padel</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header avec gradient bleu -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 32px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">
                🎾 Invitation Padel
              </h1>
              <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 500;">
                Vous avez été invité à une partie !
              </p>
            </td>
          </tr>

          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px 32px;">
              
              <!-- Info club et date -->
              <div style="background-color: #f9fafb; border-left: 4px solid #2563eb; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    📍 Club
                  </p>
                  <p style="margin: 0; color: #111827; font-size: 20px; font-weight: 700;">
                    ${clubName}
                  </p>
                </div>
                
                <div>
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    📅 Date & Heure
                  </p>
                  <p style="margin: 0; color: #111827; font-size: 20px; font-weight: 700;">
                    ${dateText}
                  </p>
                </div>
              </div>

              <!-- Message personnel (si présent) -->
              ${message ? `
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  💬 Message
                </p>
                <p style="margin: 0; color: #1e3a8a; font-size: 16px; line-height: 1.6;">
                  ${message}
                </p>
              </div>
              ` : ''}

              <!-- Bouton CTA -->
              ${bookingUrl ? `
              <div style="text-align: center; margin: 32px 0;">
                <a href="${bookingUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); transition: all 0.3s;">
                  Voir ma réservation
                </a>
              </div>
              ` : ''}

              <!-- Instructions -->
              <div style="border-top: 2px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  <strong>Comment ça marche ?</strong>
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Confirmez votre présence en répondant à cet email</li>
                  <li style="margin-bottom: 8px;">Arrivez 10 minutes avant pour récupérer votre équipement</li>
                  <li style="margin-bottom: 8px;">N'oubliez pas vos chaussures de sport !</li>
                </ul>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; color: #111827; font-size: 18px; font-weight: 700;">
                Pad'Up
              </p>
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                La plateforme de réservation de terrains de padel
              </p>
              <div style="margin-top: 20px;">
                <a href="https://padup.one" style="color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">
                  Visiter le site
                </a>
                <span style="color: #d1d5db;">•</span>
                <a href="https://padup.one/contact" style="color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">
                  Contact
                </a>
              </div>
              <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Pad'Up. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// ✅ Endpoint POST pour envoyer l'invitation
export async function POST(req: NextRequest) {
  console.log('[API /invite POST] Start')

  try {
    // Vérifier que la clé API Resend est configurée
    if (!process.env.RESEND_API_KEY) {
      console.error('[API /invite POST] RESEND_API_KEY not configured')
      return NextResponse.json(
        { 
          error: 'Service email non configuré',
          code: 'RESEND_NOT_CONFIGURED'
        },
        { status: 500 }
      )
    }

    // Parser et valider le body
    const body = await req.json()
    console.log('[API /invite POST] Request body received:', { 
      to: body.to,
      clubName: body.clubName,
      dateText: body.dateText,
      hasMessage: !!body.message,
      hasBookingUrl: !!body.bookingUrl
    })

    const validation = validateInviteData(body)
    
    if (!validation.valid) {
      console.log('[API /invite POST] Validation error:', validation.error)
      return NextResponse.json(
        { 
          error: validation.error,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    const { to, clubName, dateText, message, bookingUrl } = validation.data!

    // Générer le HTML de l'email
    const emailHTML = generateEmailHTML(clubName, dateText, message || '', bookingUrl || '')

    // Envoyer l'email via Resend
    console.log('[API /invite POST] Sending email via Resend to:', to)
    
    const { data, error } = await resend.emails.send({
      from: "Pad'up <onboarding@resend.dev>",
      to: to,
      subject: `🎾 Invitation à une partie de padel - ${clubName}`,
      html: emailHTML,
      // Version texte pour les clients email qui ne supportent pas HTML
      text: `
Vous avez été invité à une partie de padel !

Club: ${clubName}
Date: ${dateText}
${message ? `\nMessage: ${message}` : ''}
${bookingUrl ? `\nLien: ${bookingUrl}` : ''}

---
Pad'Up - La plateforme de réservation de terrains de padel
      `.trim()
    })

    // Gérer les erreurs Resend
    if (error) {
      console.error('[API /invite POST] Resend error:', error)
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'envoi de l\'email',
          code: 'RESEND_ERROR',
          details: process.env.NODE_ENV === 'development' ? error : undefined
        },
        { status: 500 }
      )
    }

    console.log('[API /invite POST] Email sent successfully:', data)

    return NextResponse.json(
      { 
        success: true,
        message: 'Invitation envoyée avec succès',
        emailId: data?.id
      },
      { status: 200 }
    )

  } catch (e: any) {
    console.error('[API /invite POST] Unhandled exception:', e)
    return NextResponse.json(
      { 
        error: e?.message || 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? e?.stack : undefined
      },
      { status: 500 }
    )
  }
}
