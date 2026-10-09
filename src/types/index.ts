export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  is_active?: boolean
  created_at?: string
}

export type WorkshopStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export interface Workshop {
  id: number
  code: string
  title: string
  instructor: string
  location: string
  description?: string | null
  start_time: string
  end_time?: string | null
  capacity: number
  status: WorkshopStatus
  created_by_name?: string
  active_registrations: number
  available_seats: number
  waitlist_count: number
  created_at?: string
  updated_at?: string
}

export interface Registration {
  id: number
  workshop_id: number
  workshop_code?: string
  workshop_title?: string
  attendee_name: string
  attendee_email: string
  status: 'CONFIRMED' | 'CANCELLED'
  registered_at: string
  registered_by_name?: string
  cancelled_at?: string | null
  cancelled_by_name?: string | null
  cancellation_reason?: string | null
}

export interface WaitlistEntry {
  id: number
  workshop_id: number
  attendee_name: string
  attendee_email: string
  status: 'WAITING' | 'PROMOTED' | 'CANCELLED'
  created_at: string
  promoted_at?: string | null
  added_by_name?: string
}
