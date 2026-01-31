import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// ✅ Initialiser Resend avec la clé API côté serveur UNIQUEMENT
const resend = new Resend(process.env.RESEND_API_KEY)

// ✅ Type pour la validation des données d'entrée
type InviteEmailData = {
  to: string | string[]  // ✅ Accepte un email ou une liste d'emails
  clubName: string
  dateText: string
  message?: string
  bookingUrl?: string
}

// ✅ Fonction de validation des données
function validateInviteData(data: any): { valid: boolean; error?: string; data?: InviteEmailData; emails?: string[] } {
  // Vérifier les champs requis
  if (!data.to) {
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
  
  // Supporter à la fois string et string[]
  const emails = Array.isArray(data.to) ? data.to : [data.to]
  
  // Filtrer les emails vides et valider le format
  const validEmails = emails
    .filter((email: any) => email && typeof email === 'string' && email.trim())
    .map((email: string) => email.trim())
  
  if (validEmails.length === 0) {
    return { valid: false, error: 'Aucun email valide fourni' }
  }

  // Vérifier que tous les emails ont un format valide
  const invalidEmails = validEmails.filter((email: string) => !emailRegex.test(email))
  if (invalidEmails.length > 0) {
    return { valid: false, error: `Format email invalide: ${invalidEmails.join(', ')}` }
  }

  return {
    valid: true,
    emails: validEmails,
    data: {
      to: validEmails,
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

    const { clubName, dateText, message, bookingUrl } = validation.data!
    const emails = validation.emails!

    console.log('[API /invite POST] Validated emails:', emails)

    // Générer le HTML de l'email
    const emailHTML = generateEmailHTML(clubName, dateText, message || '', bookingUrl || '')
    const emailText = `
Vous avez été invité à une partie de padel !

Club: ${clubName}
Date: ${dateText}
${message ? `\nMessage: ${message}` : ''}
${bookingUrl ? `\nLien: ${bookingUrl}` : ''}

---
Pad'Up - La plateforme de réservation de terrains de padel
    `.trim()

    // ✅ Envoyer à tous les emails en parallèle avec Promise.allSettled
    console.log('[API /invite POST] Sending emails to:', emails.length, 'recipients')
    
    const sendPromises = emails.map(async (email) => {
      console.log('[API /invite POST] Sending to:', email)
      try {
        const result = await resend.emails.send({
          from: "Pad'up <onboarding@resend.dev>",
          to: email,
          subject: `🎾 Invitation à une partie de padel - ${clubName}`,
          html: emailHTML,
          text: emailText
        })
        
        if (result.error) {
          console.error('[API /invite POST] Error sending to', email, ':', result.error)
          return { email, success: false, error: result.error }
        }
        
        console.log('[API /invite POST] Successfully sent to:', email, 'ID:', result.data?.id)
        return { email, success: true, emailId: result.data?.id }
      } catch (err: any) {
        console.error('[API /invite POST] Exception sending to', email, ':', err)
        return { email, success: false, error: err.message }
      }
    })

    const results = await Promise.allSettled(sendPromises)

    // ✅ Analyser les résultats
    const successful: any[] = []
    const failed: any[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const value = result.value
        if (value.success) {
          successful.push(value)
        } else {
          failed.push(value)
        }
      } else {
        failed.push({ 
          email: emails[index], 
          success: false, 
          error: result.reason?.message || 'Unknown error' 
        })
      }
    })

    console.log('[API /invite POST] Results:', {
      total: emails.length,
      successful: successful.length,
      failed: failed.length
    })

    // ✅ Retourner un statut selon les résultats
    if (successful.length === emails.length) {
      // Tous réussis
      return NextResponse.json(
        { 
          success: true,
          message: `${successful.length} invitation(s) envoyée(s) avec succès`,
          results: { successful, failed }
        },
        { status: 200 }
      )
    } else if (successful.length > 0) {
      // Partiellement réussi
      return NextResponse.json(
        { 
          success: true,
          message: `${successful.length}/${emails.length} invitation(s) envoyée(s)`,
          warning: `${failed.length} email(s) en échec`,
          results: { successful, failed }
        },
        { status: 207 } // Multi-Status
      )
    } else {
      // Tous échoués
      return NextResponse.json(
        { 
          error: 'Échec de l\'envoi de toutes les invitations',
          code: 'ALL_FAILED',
          results: { successful, failed }
        },
        { status: 500 }
      )
    }

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
