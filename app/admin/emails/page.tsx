"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Eye, Send } from "lucide-react"
import { emailService } from "@/lib/email"
import { storage } from "@/lib/storage"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function EmailsPage() {
  const router = useRouter()
  const [emails, setEmails] = useState<any[]>([])
  const [selectedEmail, setSelectedEmail] = useState<any>(null)

  useEffect(() => {
    // Check if admin is logged in
    if (!storage.isAdminLoggedIn()) {
      router.push("/admin")
      return
    }

    loadEmails()
  }, [router])

  const loadEmails = () => {
    const sentEmails = emailService.getSentEmails()
    setEmails(sentEmails)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-PE")
  }

  const getEmailTypeBadge = (subject: string) => {
    if (subject.includes("Aprobada")) {
      return <Badge className="bg-green-100 text-green-800">Aprobación</Badge>
    } else if (subject.includes("No Aprobada")) {
      return <Badge variant="destructive">Rechazo</Badge>
    }
    return <Badge variant="secondary">Otro</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/admin")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al Panel
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Historial de Emails</h1>
              <p className="text-sm text-muted-foreground">Emails enviados automáticamente</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Información del Sistema de Emails
              </CardTitle>
              <CardDescription>
                Los emails se envían automáticamente cuando se aprueba o rechaza una reserva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Send className="h-4 w-4" />
                <AlertDescription>
                  <strong>Modo Demo:</strong> Los emails se simulan y almacenan localmente. En producción, integra con
                  servicios como Resend, SendGrid o similar.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {emails.length === 0 ? (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                No se han enviado emails aún. Los emails aparecerán aquí cuando apruebes o rechaces reservas.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {emails.length} {emails.length === 1 ? "email enviado" : "emails enviados"}
              </h2>

              {emails
                .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                .map((email) => (
                  <Card key={email.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{email.subject}</h3>
                          <p className="text-sm text-muted-foreground">Para: {email.to}</p>
                          <p className="text-xs text-muted-foreground">Enviado: {formatDate(email.sentAt)}</p>
                        </div>
                        {getEmailTypeBadge(email.subject)}
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEmail(email)}
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Email
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Vista Previa del Email</DialogTitle>
                              <DialogDescription>{selectedEmail?.subject}</DialogDescription>
                            </DialogHeader>
                            {selectedEmail && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Para:</strong> {selectedEmail.to}
                                  </div>
                                  <div>
                                    <strong>Enviado:</strong> {formatDate(selectedEmail.sentAt)}
                                  </div>
                                </div>

                                <div className="border rounded-lg p-4 bg-muted/50">
                                  <h4 className="font-medium mb-2">Contenido HTML:</h4>
                                  <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                                  />
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
