"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, Clock, Monitor, Apple, ArrowLeft, Search, AlertCircle } from "lucide-react"
import { LAB_ROOMS, type Reservation } from "@/lib/types"
import { storage } from "@/lib/storage"
import { useRouter } from "next/navigation"

export default function MisReservasPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const searchReservations = () => {
    if (!email.trim()) return

    setIsSearching(true)
    const allReservations = storage.getReservations()
    const userReservations = allReservations.filter(
      (reservation) => reservation.studentEmail.toLowerCase() === email.toLowerCase(),
    )

    setReservations(userReservations)
    setHasSearched(true)
    setIsSearching(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary" >Mis Reservas</h1>
              <p className="text-sm text-muted-foreground">Consulta el estado de tus solicitudes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Buscar Reservas
              </CardTitle>
              <CardDescription>Ingresa tu correo electrónico para ver todas tus reservas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email" className="sr-only">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu.correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchReservations()}
                  />
                </div>
                <Button onClick={searchReservations} disabled={isSearching || !email.trim()}>
                  {isSearching ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {hasSearched && (
            <>
              {reservations.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No se encontraron reservas para el correo electrónico ingresado.</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    {reservations.length} {reservations.length === 1 ? "reserva encontrada" : "reservas encontradas"}
                  </h2>

                  {reservations
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
                              <div className="text-muted-foreground">
                                Duración: {reservation.duration} {reservation.duration === 1 ? "hora" : "horas"}
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                              Solicitado el {new Date(reservation.createdAt).toLocaleString("es-PE")}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
