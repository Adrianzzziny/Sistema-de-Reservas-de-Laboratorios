export interface Reservation {
  id: string
  studentName: string
  studentLastName: string
  studentEmail: string
  labRoom: string
  date: string
  startTime: string
  duration: number // hours (1-4)
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface LabRoom {
  id: string
  name: string
  type: "windows" | "mac"
  capacity: number
}

export const LAB_ROOMS: LabRoom[] = [
  { id: "be-206", name: "Lab BE-206", type: "windows", capacity: 20 },
  { id: "be-304", name: "Lab BE-304", type: "windows", capacity: 20 },
  { id: "be-305", name: "Lab BE-305", type: "windows", capacity: 20 },
  { id: "be-307", name: "Lab BE-307", type: "windows", capacity: 20 },
  { id: "be-308", name: "Lab BE-308", type: "windows", capacity: 20 },
  { id: "be-309", name: "Lab BE-309", type: "windows", capacity: 20 },
  { id: "be-310", name: "Lab BE-310", type: "windows", capacity: 20 },
  { id: "be-207", name: "iMac BE-207", type: "mac", capacity: 20 },
]

export const TIME_SLOTS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
]
