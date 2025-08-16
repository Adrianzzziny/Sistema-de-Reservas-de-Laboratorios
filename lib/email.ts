import type { Reservation } from "./types"
import { LAB_ROOMS } from "./types"

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text: string
}

export const emailService = {
  // Simulate email sending - in production, integrate with Resend, SendGrid, etc.
  async sendEmail(template: EmailTemplate): Promise<boolean> {
    console.log("[v0] Email would be sent:", template)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store email in localStorage for demo purposes
    const emails = JSON.parse(localStorage.getItem("cibertec_emails") || "[]")
    emails.push({
      ...template,
      sentAt: new Date().toISOString(),
      id: Date.now().toString(),
    })
    localStorage.setItem("cibertec_emails", JSON.stringify(emails))

    return true
  },

  generateApprovalEmail(reservation: Reservation): EmailTemplate {
    const room = LAB_ROOMS.find((r) => r.id === reservation.labRoom)
    const date = new Date(reservation.date).toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const endTime = Number.parseInt(reservation.startTime.split(":")[0]) + reservation.duration

    return {
      to: reservation.studentEmail,
      subject: "✅ Reserva Aprobada - CIBERTEC",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #596079; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .reservation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #596079; }
            .success { color: #22c55e; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CIBERTEC</h1>
              <p>Sistema de Reservas</p>
            </div>
            <div class="content">
              <h2 class="success">¡Tu reserva ha sido aprobada!</h2>
              <p>Hola ${reservation.studentName} ${reservation.studentLastName},</p>
              <p>Nos complace informarte que tu solicitud de reserva ha sido <strong>aprobada</strong>.</p>
              
              <div class="reservation-details">
                <h3>Detalles de tu reserva:</h3>
                <div class="detail-row">
                  <span class="detail-label">Laboratorio:</span>
                  <span>${room?.name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha:</span>
                  <span>${date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Horario:</span>
                  <span>${reservation.startTime} - ${endTime}:00</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duración:</span>
                  <span>${reservation.duration} ${reservation.duration === 1 ? "hora" : "horas"}</span>
                </div>
              </div>

              <h3>Instrucciones importantes:</h3>
              <ul>
                <li>Llega puntualmente a la hora reservada</li>
                <li>Presenta tu DNI o carnet de estudiante</li>
                <li>Respeta el tiempo asignado</li>
                <li>Mantén el laboratorio limpio y ordenado</li>
              </ul>

              <p>Si tienes alguna consulta, no dudes en contactarnos.</p>
              
              <div class="footer">
                <p>CIBERTEC - Instituto de Educación Superior<br>
                Sistema de Reservas de Laboratorios</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
CIBERTEC - Reserva Aprobada

Hola ${reservation.studentName} ${reservation.studentLastName},

¡Tu reserva ha sido aprobada!

Detalles:
- Laboratorio: ${room?.name}
- Fecha: ${date}
- Horario: ${reservation.startTime} - ${endTime}:00
- Duración: ${reservation.duration} ${reservation.duration === 1 ? "hora" : "horas"}

Instrucciones:
- Llega puntualmente
- Presenta tu DNI o carnet
- Respeta el tiempo asignado
- Mantén el laboratorio limpio

CIBERTEC - Sistema de Reservas
      `,
    }
  },

  generateRejectionEmail(reservation: Reservation): EmailTemplate {
    const room = LAB_ROOMS.find((r) => r.id === reservation.labRoom)
    const date = new Date(reservation.date).toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return {
      to: reservation.studentEmail,
      subject: "❌ Reserva No Aprobada - CIBERTEC",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #596079; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .reservation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #596079; }
            .rejected { color: #ef4444; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CIBERTEC</h1>
              <p>Sistema de Reservas</p>
            </div>
            <div class="content">
              <h2 class="rejected">Reserva no aprobada</h2>
              <p>Hola ${reservation.studentName} ${reservation.studentLastName},</p>
              <p>Lamentamos informarte que tu solicitud de reserva no pudo ser aprobada en esta ocasión.</p>
              
              <div class="reservation-details">
                <h3>Detalles de la solicitud:</h3>
                <div class="detail-row">
                  <span class="detail-label">Laboratorio:</span>
                  <span>${room?.name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha:</span>
                  <span>${date}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Horario:</span>
                  <span>${reservation.startTime}</span>
                </div>
              </div>

              <h3>Posibles motivos:</h3>
              <ul>
                <li>El laboratorio ya está ocupado en ese horario</li>
                <li>Mantenimiento programado</li>
                <li>Capacidad máxima alcanzada</li>
                <li>Horario no disponible</li>
              </ul>

              <p>Te invitamos a realizar una nueva solicitud con un horario diferente.</p>
              
              <div class="footer">
                <p>CIBERTEC - Instituto de Educación Superior<br>
                Sistema de Reservas de Laboratorios</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
CIBERTEC - Reserva No Aprobada

Hola ${reservation.studentName} ${reservation.studentLastName},

Tu solicitud de reserva no pudo ser aprobada.

Detalles de la solicitud:
- Laboratorio: ${room?.name}
- Fecha: ${date}
- Horario: ${reservation.startTime}

Posibles motivos:
- Laboratorio ocupado
- Mantenimiento programado
- Capacidad máxima alcanzada
- Horario no disponible

Te invitamos a realizar una nueva solicitud.

CIBERTEC - Sistema de Reservas
      `,
    }
  },

  // Get sent emails for demo purposes
  getSentEmails(): any[] {
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("cibertec_emails") || "[]")
  },
}
