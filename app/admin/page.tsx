"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CalendarDays,
  Clock,
  Monitor,
  Apple,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Calendar,
  ArrowLeft,
  LogOut,
  Mail,
  Send,
} from "lucide-react"
import { LAB_ROOMS, type Reservation } from "@/lib/types"
import { storage } from "@/lib/storage"
import { emailService } from "@/lib/email"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState("")
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailStatus, setEmailStatus] = useState<string | null>(null)

  useEffect(() => {
    setIsLoggedIn(storage.isAdminLoggedIn())
    if (storage.isAdminLoggedIn()) {
      loadReservations()
    }
  }, [])

  const loadReservations = () => {
    const allReservations = storage.getReservations()
    setReservations(allReservations)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple password check - in production this should be more secure
    if (password === "admin123") {
      storage.setAdminSession(true)
      setIsLoggedIn(true)
      loadReservations()
      setPassword("")
    } else {
      alert("Contraseña incorrecta")
    }
  }

  const handleLogout = () => {
    storage.clearAdminSession()
    setIsLoggedIn(false)
    setReservations([])
  }

  const handleApprove = async (reservationId: string) => {
    setIsLoading(true)
    setEmailStatus("Enviando correo...")

    const reservation = reservations.find((r) => r.id === reservationId)
    if (reservation) {
      try {
        // Update reservation status
        storage.updateReservation(reservationId, { status: "approved" })

        // Send approval email
        const emailTemplate = emailService.generateApprovalEmail(reservation)
        await emailService.sendEmail(emailTemplate)

        setEmailStatus("✅ Correo enviado exitosamente")
        setTimeout(() => setEmailStatus(null), 3000)
      } catch (error) {
        setEmailStatus("❌ Error al enviar correo")
        setTimeout(() => setEmailStatus(null), 3000)
      }
    }

    loadReservations()
    setSelectedReservation(null)
    setIsLoading(false)
  }

  const handleReject = async (reservationId: string) => {
    setIsLoading(true)
    setEmailStatus("Enviando correo...")

    const reservation = reservations.find((r) => r.id === reservationId)
    if (reservation) {
      try {
        // Update reservation status
        storage.updateReservation(reservationId, { status: "rejected" })

        // Send rejection email
        const emailTemplate = emailService.generateRejectionEmail(reservation)
        await emailService.sendEmail(emailTemplate)

        setEmailStatus("✅ Correo enviado exitosamente")
        setTimeout(() => setEmailStatus(null), 3000)
      } catch (error) {
        setEmailStatus("❌ Error al enviar correo")
        setTimeout(() => setEmailStatus(null), 3000)
      }
    }

    loadReservations()
    setSelectedReservation(null)
    setIsLoading(false)
  }

  const getStatusBadge = (status: Reservation["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pendiente
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Aprobada
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rechazada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoomInfo = (roomId: string) => {
    return LAB_ROOMS.find((room) => room.id === roomId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getWeeklyStats = () => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const weeklyReservations = reservations.filter((r) => {
      const reservationDate = new Date(r.date)
      return reservationDate >= weekStart && reservationDate <= weekEnd
    })

    return {
      total: weeklyReservations.length,
      pending: weeklyReservations.filter((r) => r.status === "pending").length,
      approved: weeklyReservations.filter((r) => r.status === "approved").length,
      rejected: weeklyReservations.filter((r) => r.status === "rejected").length,
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle>Panel Administrativo</CardTitle>
            <CardDescription>Ingresa la contraseña para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getWeeklyStats()
  const pendingReservations = reservations.filter((r) => r.status === "pending")
  const approvedReservations = reservations.filter((r) => r.status === "approved")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Panel Administrativo</h1>
                <p className="text-sm text-muted-foreground">Gestión de reservas CIBERTEC</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/admin/emails")} className="gap-2">
                <Mail className="w-4 h-4" />
                Emails
              </Button>
              <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Inicio
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {emailStatus && (
          <Alert className="mb-6">
            <Send className="h-4 w-4" />
            <AlertDescription>{emailStatus}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Semana</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rechazadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pendientes ({pendingReservations.length})</TabsTrigger>
            <TabsTrigger value="approved">Aprobadas ({approvedReservations.length})</TabsTrigger>
            <TabsTrigger value="all">Todas ({reservations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingReservations.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>No hay solicitudes pendientes por revisar.</AlertDescription>
              </Alert>
            ) : (
              pendingReservations
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((reservation) => {
                  const roomInfo = getRoomInfo(reservation.labRoom)
                  return (
                    <Card key={reservation.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {roomInfo?.type === "mac" ? (
                              <Apple className="w-6 h-6 text-muted-foreground" />
                            ) : (
                              <Monitor className="w-6 h-6 text-muted-foreground" />
                            )}
                            <div>
                              <h3 className="font-semibold">{roomInfo?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {reservation.studentName} {reservation.studentLastName}
                              </p>
                              <p className="text-xs text-muted-foreground">{reservation.studentEmail}</p>
                            </div>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(reservation.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {reservation.startTime} -{" "}
                              {Number.parseInt(reservation.startTime.split(":")[0]) + reservation.duration}:00
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {reservation.duration} {reservation.duration === 1 ? "hora" : "horas"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReservation(reservation)}
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Ver Detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalles de la Reserva</DialogTitle>
                                <DialogDescription>
                                  Revisa la información completa antes de tomar una decisión
                                </DialogDescription>
                              </DialogHeader>
                              {selectedReservation && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Estudiante</Label>
                                      <p className="text-sm">
                                        {selectedReservation.studentName} {selectedReservation.studentLastName}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Email</Label>
                                      <p className="text-sm">{selectedReservation.studentEmail}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Laboratorio</Label>
                                      <p className="text-sm">{getRoomInfo(selectedReservation.labRoom)?.name}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Fecha</Label>
                                      <p className="text-sm">{formatDate(selectedReservation.date)}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Horario</Label>
                                      <p className="text-sm">
                                        {selectedReservation.startTime} -{" "}
                                        {Number.parseInt(selectedReservation.startTime.split(":")[0]) +
                                          selectedReservation.duration}
                                        :00
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Duración</Label>
                                      <p className="text-sm">
                                        {selectedReservation.duration}{" "}
                                        {selectedReservation.duration === 1 ? "hora" : "horas"}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Solicitado</Label>
                                    <p className="text-sm">
                                      {new Date(selectedReservation.createdAt).toLocaleString("es-PE")}
                                    </p>
                                  </div>
                                </div>
                              )}
                              <DialogFooter className="gap-2">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleReject(selectedReservation!.id)}
                                  disabled={isLoading}
                                  className="gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  {isLoading ? "Procesando..." : "Rechazar"}
                                </Button>
                                <Button
                                  onClick={() => handleApprove(selectedReservation!.id)}
                                  disabled={isLoading}
                                  className="gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {isLoading ? "Procesando..." : "Aprobar"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(reservation.id)}
                            disabled={isLoading}
                            className="gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {isLoading ? "Procesando..." : "Aprobar"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(reservation.id)}
                            disabled={isLoading}
                            className="gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            {isLoading ? "Procesando..." : "Rechazar"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedReservations.length === 0 ? (
              <Alert>
                <AlertDescription>No hay reservas aprobadas aún.</AlertDescription>
              </Alert>
            ) : (
              approvedReservations
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((reservation) => {
                  const roomInfo = getRoomInfo(reservation.labRoom)
                  return (
                    <Card key={reservation.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {roomInfo?.type === "mac" ? (
                              <Apple className="w-6 h-6 text-muted-foreground" />
                            ) : (
                              <Monitor className="w-6 h-6 text-muted-foreground" />
                            )}
                            <div>
                              <h3 className="font-semibold">{roomInfo?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {reservation.studentName} {reservation.studentLastName}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(reservation.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {reservation.startTime} -{" "}
                              {Number.parseInt(reservation.startTime.split(":")[0]) + reservation.duration}:00
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {reservation.duration} {reservation.duration === 1 ? "hora" : "horas"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {reservations.length === 0 ? (
              <Alert>
                <AlertDescription>No hay reservas registradas.</AlertDescription>
              </Alert>
            ) : (
              reservations
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((reservation) => {
                  const roomInfo = getRoomInfo(reservation.labRoom)
                  return (
                    <Card key={reservation.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {roomInfo?.type === "mac" ? (
                              <Apple className="w-6 h-6 text-muted-foreground" />
                            ) : (
                              <Monitor className="w-6 h-6 text-muted-foreground" />
                            )}
                            <div>
                              <h3 className="font-semibold">{roomInfo?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {reservation.studentName} {reservation.studentLastName}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(reservation.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {reservation.startTime} -{" "}
                              {Number.parseInt(reservation.startTime.split(":")[0]) + reservation.duration}:00
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {reservation.duration} {reservation.duration === 1 ? "hora" : "horas"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
