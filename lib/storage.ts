import type { Reservation } from "./types"

const RESERVATIONS_KEY = "cibertec_reservations"
const ADMIN_KEY = "cibertec_admin_session"

export const storage = {
  // Reservation management
  getReservations(): Reservation[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(RESERVATIONS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveReservation(reservation: Reservation): void {
    if (typeof window === "undefined") return
    const reservations = this.getReservations()
    reservations.push(reservation)
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations))
  },

  updateReservation(id: string, updates: Partial<Reservation>): void {
    if (typeof window === "undefined") return
    const reservations = this.getReservations()
    const index = reservations.findIndex((r) => r.id === id)
    if (index !== -1) {
      reservations[index] = { ...reservations[index], ...updates }
      localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations))
    }
  },

  checkAvailability(labRoom: string, date: string, startTime: string, duration: number): number {
    const reservations = this.getReservations()
    const approvedReservations = reservations.filter(
      (r) => r.status === "approved" && r.labRoom === labRoom && r.date === date,
    )

    const requestedStartHour = Number.parseInt(startTime.split(":")[0])
    const requestedEndHour = requestedStartHour + duration

    // Count occupied spots for each hour in the requested time range
    let maxOccupiedSpots = 0

    for (let hour = requestedStartHour; hour < requestedEndHour; hour++) {
      let occupiedSpotsThisHour = 0

      for (const reservation of approvedReservations) {
        const resStartHour = Number.parseInt(reservation.startTime.split(":")[0])
        const resEndHour = resStartHour + reservation.duration

        // Check if this reservation overlaps with the current hour
        if (hour >= resStartHour && hour < resEndHour) {
          occupiedSpotsThisHour += 20 // Each approved reservation takes full capacity
        }
      }

      maxOccupiedSpots = Math.max(maxOccupiedSpots, occupiedSpotsThisHour)
    }

    return Math.max(0, 20 - maxOccupiedSpots)
  },

  validateReservation(reservation: Omit<Reservation, "id" | "status" | "createdAt">): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validate date is not in the past
    const reservationDate = new Date(reservation.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (reservationDate < today) {
      errors.push("No se pueden hacer reservas para fechas pasadas")
    }

    // Validate time range (7am to 7pm)
    const startHour = Number.parseInt(reservation.startTime.split(":")[0])
    const endHour = startHour + reservation.duration

    if (startHour < 7) {
      errors.push("El horario de inicio debe ser desde las 7:00 AM")
    }

    if (endHour > 19) {
      errors.push("Las reservas no pueden terminar después de las 7:00 PM")
    }

    // Validate duration (1-4 hours)
    if (reservation.duration < 1 || reservation.duration > 4) {
      errors.push("La duración debe ser entre 1 y 4 horas")
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(reservation.studentEmail)) {
      errors.push("El formato del correo electrónico no es válido")
    }

    // Validate required fields
    if (!reservation.studentName.trim()) {
      errors.push("El nombre es requerido")
    }

    if (!reservation.studentLastName.trim()) {
      errors.push("El apellido es requerido")
    }

    if (!reservation.labRoom) {
      errors.push("Debe seleccionar un laboratorio")
    }

    // Check availability
    const availableSpots = this.checkAvailability(
      reservation.labRoom,
      reservation.date,
      reservation.startTime,
      reservation.duration,
    )

    if (availableSpots === 0) {
      errors.push("No hay espacios disponibles en el horario seleccionado")
    }

    const existingReservations = this.getReservations()
    const duplicateReservation = existingReservations.find(
      (r) =>
        r.studentEmail.toLowerCase() === reservation.studentEmail.toLowerCase() &&
        r.date === reservation.date &&
        r.labRoom === reservation.labRoom &&
        r.startTime === reservation.startTime &&
        (r.status === "pending" || r.status === "approved"),
    )

    if (duplicateReservation) {
      errors.push("Ya tienes una reserva para este laboratorio en el mismo horario")
    }

    const userReservationsToday = existingReservations.filter(
      (r) =>
        r.studentEmail.toLowerCase() === reservation.studentEmail.toLowerCase() &&
        r.date === reservation.date &&
        (r.status === "pending" || r.status === "approved"),
    )

    if (userReservationsToday.length >= 2) {
      errors.push("Solo puedes hacer máximo 2 reservas por día")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  getDayAvailability(
    labRoom: string,
    date: string,
  ): {
    [hour: string]: {
      available: number
      total: number
      reservations: Reservation[]
    }
  } {
    const reservations = this.getReservations()
    const dayReservations = reservations.filter(
      (r) => r.status === "approved" && r.labRoom === labRoom && r.date === date,
    )

    const availability: {
      [hour: string]: {
        available: number
        total: number
        reservations: Reservation[]
      }
    } = {}

    // Initialize all hours from 7 AM to 7 PM
    for (let hour = 7; hour < 19; hour++) {
      const hourKey = `${hour.toString().padStart(2, "0")}:00`
      availability[hourKey] = {
        available: 20,
        total: 20,
        reservations: [],
      }
    }

    // Calculate occupancy for each hour
    for (const reservation of dayReservations) {
      const startHour = Number.parseInt(reservation.startTime.split(":")[0])
      const endHour = startHour + reservation.duration

      for (let hour = startHour; hour < endHour; hour++) {
        const hourKey = `${hour.toString().padStart(2, "0")}:00`
        if (availability[hourKey]) {
          availability[hourKey].available = Math.max(0, availability[hourKey].available - 20)
          availability[hourKey].reservations.push(reservation)
        }
      }
    }

    return availability
  },

  // Admin session management
  setAdminSession(isAdmin: boolean): void {
    if (typeof window === "undefined") return
    localStorage.setItem(ADMIN_KEY, JSON.stringify(isAdmin))
  },

  isAdminLoggedIn(): boolean {
    if (typeof window === "undefined") return false
    const data = localStorage.getItem(ADMIN_KEY)
    return data ? JSON.parse(data) : false
  },

  clearAdminSession(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(ADMIN_KEY)
  },
}
