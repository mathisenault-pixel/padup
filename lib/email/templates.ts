/**
 * Templates d'emails transactionnels
 * Simples, propres, responsives
 */

type ReservationConfirmationParams = {
  playerName: string
  clubName: string
  courtName: string
  date: string
  startTime: string
  endTime: string
  city?: string
  pricePerHour?: number
  reservationUrl: string
}

type ReservationNotificationParams = {
  clubName: string
  courtName: string
  playerEmail: string
  date: string
  startTime: string
  endTime: string
  reservationUrl: string
}

type CancellationParams = {
  recipientName: string
  clubName: string
  courtName: string
  date: string
  startTime: string
  endTime: string
}

// Style commun pour tous les emails
const emailStyles = `
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #334155; 
      margin: 0; 
      padding: 0; 
      background-color: #f8fafc;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0; 
      font-size: 32px; 
      font-weight: bold; 
    }
    .content { 
      padding: 40px 30px; 
    }
    .info-box { 
      background: #f1f5f9; 
      border-left: 4px solid #0f172a; 
      padding: 20px; 
      margin: 24px 0; 
      border-radius: 6px; 
    }
    .info-row { 
      display: flex; 
      justify-content: space-between; 
      margin: 12px 0; 
      padding: 8px 0; 
      border-bottom: 1px solid #e2e8f0; 
    }
    .info-row:last-child { 
      border-bottom: none; 
    }
    .info-label { 
      font-weight: 600; 
      color: #475569; 
    }
    .info-value { 
      color: #0f172a; 
      font-weight: 500; 
    }
    .payment-notice { 
      background: #fef3c7; 
      border: 2px solid #fbbf24; 
      padding: 16px; 
      border-radius: 8px; 
      margin: 24px 0; 
      text-align: center; 
    }
    .payment-notice strong { 
      color: #92400e; 
      font-size: 16px; 
    }
    .button { 
      display: inline-block; 
      background: #0f172a; 
      color: white; 
      padding: 14px 32px; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 600; 
      margin: 24px 0; 
    }
    .footer { 
      background: #f8fafc; 
      padding: 30px; 
      text-align: center; 
      color: #64748b; 
      font-size: 14px; 
    }
  </style>
`

export function getReservationConfirmationEmail(params: ReservationConfirmationParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header">
        <h1>Pad'Up</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">Réservation confirmée</p>
      </div>
      
      <div class="content">
        <p style="font-size: 16px;">Bonjour ${params.playerName},</p>
        
        <p>Votre réservation a été confirmée avec succès !</p>
        
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">📍 Club</span>
            <span class="info-value">${params.clubName}</span>
          </div>
          ${params.city ? `
          <div class="info-row">
            <span class="info-label">🏙️ Ville</span>
            <span class="info-value">${params.city}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">🎾 Terrain</span>
            <span class="info-value">${params.courtName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📅 Date</span>
            <span class="info-value">${params.date}</span>
          </div>
          <div class="info-row">
            <span class="info-label">🕐 Horaire</span>
            <span class="info-value">${params.startTime} - ${params.endTime}</span>
          </div>
        </div>
        
        <div class="payment-notice">
          <strong>💳 Paiement sur place au club</strong>
          ${params.pricePerHour ? `<p style="margin: 8px 0 0 0;">Prix indicatif : ${params.pricePerHour}€/heure</p>` : ''}
        </div>
        
        <div style="text-align: center;">
          <a href="${params.reservationUrl}" class="button">Voir ma réservation</a>
        </div>
        
        <p style="margin-top: 32px; color: #64748b; font-size: 14px;">
          <strong>Important :</strong> Présentez-vous au club à l'heure indiquée. Le paiement s'effectue directement sur place.
        </p>
      </div>
      
      <div class="footer">
        <p><strong>Pad'Up</strong> - Réservez vos terrains de padel</p>
        <p style="margin-top: 8px;">Des questions ? Contactez directement le club.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

export function getClubNotificationEmail(params: ReservationNotificationParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header">
        <h1>Pad'Up</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">Nouvelle réservation</p>
      </div>
      
      <div class="content">
        <p style="font-size: 16px;">Bonjour ${params.clubName},</p>
        
        <p>Vous avez reçu une nouvelle réservation !</p>
        
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">👤 Joueur</span>
            <span class="info-value">${params.playerEmail}</span>
          </div>
          <div class="info-row">
            <span class="info-label">🎾 Terrain</span>
            <span class="info-value">${params.courtName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📅 Date</span>
            <span class="info-value">${params.date}</span>
          </div>
          <div class="info-row">
            <span class="info-label">🕐 Horaire</span>
            <span class="info-value">${params.startTime} - ${params.endTime}</span>
          </div>
        </div>
        
        <div class="payment-notice">
          <strong>💳 Paiement sur place</strong>
          <p style="margin: 8px 0 0 0;">N'oubliez pas d'encaisser le joueur lors de son arrivée.</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${params.reservationUrl}" class="button">Voir dans le dashboard</a>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>Pad'Up</strong> - Gestion de clubs de padel</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

export function getCancellationEmail(params: CancellationParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body>
  <div style="padding: 20px;">
    <div class="container">
      <div class="header" style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);">
        <h1>Pad'Up</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">Réservation annulée</p>
      </div>
      
      <div class="content">
        <p style="font-size: 16px;">Bonjour ${params.recipientName},</p>
        
        <p>La réservation suivante a été annulée :</p>
        
        <div class="info-box" style="border-left-color: #dc2626;">
          <div class="info-row">
            <span class="info-label">📍 Club</span>
            <span class="info-value">${params.clubName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">🎾 Terrain</span>
            <span class="info-value">${params.courtName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📅 Date</span>
            <span class="info-value">${params.date}</span>
          </div>
          <div class="info-row">
            <span class="info-label">🕐 Horaire</span>
            <span class="info-value">${params.startTime} - ${params.endTime}</span>
          </div>
        </div>
        
        <p style="margin-top: 24px; color: #64748b;">
          Le créneau est maintenant à nouveau disponible pour les autres joueurs.
        </p>
      </div>
      
      <div class="footer">
        <p><strong>Pad'Up</strong> - Réservez vos terrains de padel</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}











