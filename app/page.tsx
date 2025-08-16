"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarDays, Clock, Monitor, Apple, Users, Shield, CheckCircle, AlertCircle, Info, Mail } from "lucide-react"
import { LAB_ROOMS, TIME_SLOTS, type Reservation } from "@/lib/types"
import { storage } from "@/lib/storage"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    studentName: "",
    studentLastName: "",
    studentEmail: "",
    labRoom: "",
    date: "",
    startTime: "",
    duration: 1,
  })
  const [availableSpots, setAvailableSpots] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [dayAvailability, setDayAvailability] = useState<any>(null)

  const validateAndCheckAvailability = () => {
    if (!formData.labRoom || !formData.date || !formData.startTime) {
      setValidationErrors(["Por favor completa todos los campos requeridos"])
      return
    }

    const validation = storage.validateReservation({
      studentName: formData.studentName,
      studentLastName: formData.studentLastName,
      studentEmail: formData.studentEmail,
      labRoom: formData.labRoom,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
    })

    setValidationErrors(validation.errors)

    if (validation.isValid) {
      const spots = storage.checkAvailability(formData.labRoom, formData.date, formData.startTime, formData.duration)
      setAvailableSpots(spots)

      const dayAvail = storage.getDayAvailability(formData.labRoom, formData.date)
      setDayAvailability(dayAvail)
    } else {
      setAvailableSpots(null)
      setDayAvailability(null)
    }
  }

  useEffect(() => {
    if (formData.startTime && formData.duration && formData.labRoom && formData.date) {
      validateAndCheckAvailability()
    } else {
      setValidationErrors([])
      setAvailableSpots(null)
      setDayAvailability(null)
    }
  }, [formData.startTime, formData.duration, formData.labRoom, formData.date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = storage.validateReservation({
      studentName: formData.studentName,
      studentLastName: formData.studentLastName,
      studentEmail: formData.studentEmail,
      labRoom: formData.labRoom,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
    })

    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    setValidationErrors([])

    const reservation: Reservation = {
      id: Date.now().toString(),
      studentName: formData.studentName,
      studentLastName: formData.studentLastName,
      studentEmail: formData.studentEmail,
      labRoom: formData.labRoom,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    storage.saveReservation(reservation)

    // Reset form
    setFormData({
      studentName: "",
      studentLastName: "",
      studentEmail: "",
      labRoom: "",
      date: "",
      startTime: "",
      duration: 1,
    })
    setAvailableSpots(null)
    setDayAvailability(null)
    setIsSubmitting(false)
    setShowSuccessModal(true)
  }

  const getAvailableTimeSlots = () => {
    return TIME_SLOTS.filter((time) => {
      const startHour = Number.parseInt(time.split(":")[0])
      const endHour = startHour + formData.duration
      return endHour <= 19 // Don't allow reservations that end after 7pm
    })
  }

  const selectedRoom = LAB_ROOMS.find((room) => room.id === formData.labRoom)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b backdrop-blur-sm" style={{ backgroundColor: "#002856" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-[#002856]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CIBERTEC</h1>
                <p className="text-sm text-gray-200">Sistema de Reservas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/mis-reservas")}
                className="gap-2 bg-white text-[#002856] border-white hover:bg-blue-200 hover:text-[#002856]"
              >
                <CalendarDays className="w-4 h-4" />
                Mis Reservas
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin")}
                className="gap-2 bg-white text-[#002856] border-white hover:bg-blue-200 hover:text-[#002856]"
              >
                <Shield className="w-4 h-4" />
                Panel Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Reserva tu Laboratorio</h2>
            <p className="text-muted-foreground">
              Solicita acceso a nuestros laboratorios de cómputo por hasta 4 horas
            </p>
          </div>

          {validationErrors.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Límites de reserva:</strong> Máximo 2 reservas por día, 4 horas por reserva, horario de 7:00 AM a
              7:00 PM.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Nueva Reserva
              </CardTitle>
              <CardDescription>Completa el formulario para solicitar tu reserva</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.studentName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, studentName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={formData.studentLastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, studentLastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.studentEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, studentEmail: e.target.value }))}
                    required
                  />
                </div>

                {/* Lab Selection */}
                <div className="space-y-2">
                  <Label>Laboratorio *</Label>
                  <Select
                    value={formData.labRoom}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, labRoom: value }))
                      setAvailableSpots(null)
                      setDayAvailability(null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un laboratorio" />
                    </SelectTrigger>
                    <SelectContent>
                      {LAB_ROOMS.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          <div className="flex items-center gap-2">
                            {room.type === "mac" ? <Apple className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                            {room.name}
                            <Badge variant="secondary" className="ml-2">
                              <Users className="w-3 h-3 mr-1" />
                              {room.capacity}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, date: e.target.value }))
                        setAvailableSpots(null)
                        setDayAvailability(null)
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duración (horas) *</Label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, duration: Number.parseInt(value) }))
                        setAvailableSpots(null)
                        setDayAvailability(null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((hours) => (
                          <SelectItem key={hours} value={hours.toString()}>
                            {hours} {hours === 1 ? "hora" : "horas"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hora de Inicio *</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, startTime: value }))
                      setAvailableSpots(null)
                      setDayAvailability(null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTimeSlots().map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.startTime && formData.duration && (
                    <p className="text-sm text-muted-foreground">
                      Termina a las {Number.parseInt(formData.startTime.split(":")[0]) + formData.duration}:00
                    </p>
                  )}
                </div>

                {/* Availability Display */}
                {availableSpots !== null && validationErrors.length === 0 && (
                  <div className="space-y-3">
                    <div
                      className={`p-4 rounded-lg border ${
                        availableSpots > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      {availableSpots > 0 ? (
                        <p className="text-green-800">✅ Disponible: {availableSpots} espacios libres</p>
                      ) : (
                        <p className="text-red-800">❌ No hay espacios disponibles en este horario</p>
                      )}
                    </div>
                  </div>
                )}

                {dayAvailability && formData.labRoom && formData.date && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Disponibilidad del día</CardTitle>
                      <CardDescription className="text-xs">
                        Espacios disponibles por hora en {selectedRoom?.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        {Object.entries(dayAvailability).map(([hour, info]: [string, any]) => (
                          <div
                            key={hour}
                            className={`p-2 rounded text-center ${
                              info.available > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            <div className="font-medium">{hour}</div>
                            <div>{info.available}/20</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || availableSpots === 0 || validationErrors.length > 0}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Success Modal Dialog */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-green-800">¡Solicitud Enviada Exitosamente!</DialogTitle>
            <DialogDescription className="text-center space-y-3 pt-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>Recibirás una confirmación por correo cuando sea aprobada</span>
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p>
                  <strong>Próximos pasos:</strong>
                </p>
                <p>• Revisa tu correo electrónico regularmente</p>
                <p>• Puedes consultar el estado en "Mis Reservas"</p>
                <p>• El equipo administrativo revisará tu solicitud pronto</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setShowSuccessModal(false)} className="w-full">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
