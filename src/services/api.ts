import { User, Workshop, Registration, WaitlistEntry, UserRole } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  const headers = { ...getHeaders(), ...(options.headers || {}) }

  let response: Response
  try {
    response = await fetch(url, { ...options, headers })
  } catch {
    throw new Error(
      'Could not connect to the backend. If using the live Render deployment, the free instance might be waking up from sleep (takes about 30 to 50 seconds). Please retry shortly.'
    )
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    let errorMsg = ''
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      errorMsg = data.errors.join('. ')
    } else {
      errorMsg = data.error || data.message || `Request failed with status ${response.status}`
    }
    throw new Error(errorMsg)
  }

  return data.data !== undefined ? data.data : data
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ user: User }>('/auth/me'),
  },

  users: {
    list: () => request<User[]>('/users'),
    create: (payload: { name: string; email: string; password: string; role: UserRole }) =>
      request<User>('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    updateRole: (id: number, role: UserRole) =>
      request<User>(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
  },

  workshops: {
    list: (params: { from?: string; to?: string; status?: string; seatsAvailable?: boolean; search?: string } = {}) => {
      const query = new URLSearchParams()
      if (params.from) query.set('from', params.from)
      if (params.to) query.set('to', params.to)
      if (params.status) query.set('status', params.status)
      if (params.seatsAvailable) query.set('seatsAvailable', 'true')
      if (params.search) query.set('search', params.search)
      const qs = query.toString() ? `?${query.toString()}` : ''
      return request<Workshop[]>(`/workshops${qs}`)
    },
    get: (id: number) => request<Workshop>(`/workshops/${id}`),
    create: (payload: {
      code: string
      title: string
      instructor: string
      location?: string
      description?: string
      startTime: string
      endTime?: string
      capacity: number
      status?: string
    }) =>
      request<Workshop>('/workshops', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: Partial<{
      code: string
      title: string
      instructor: string
      location: string
      description: string
      startTime: string
      endTime: string
      capacity: number
      status: string
    }>) =>
      request<Workshop>(`/workshops/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  registrations: {
    register: (workshopId: number, attendee: { attendeeName: string; attendeeEmail: string }) =>
      request<{
        registration: Registration
        workshop: { id: number; activeRegistrations: number; remainingSeats: number }
      }>(`/workshops/${workshopId}/register`, {
        method: 'POST',
        body: JSON.stringify(attendee),
      }),
    cancel: (registrationId: number, cancellationReason?: string) =>
      request<{ cancelledRegistration: Registration; promotedWaitlistAttendee?: Registration }>(
        `/registrations/${registrationId}/cancel`,
        {
          method: 'POST',
          body: JSON.stringify({ cancellationReason }),
        }
      ),
    forWorkshop: (workshopId: number) =>
      request<{ workshop: Workshop; registrations: Registration[] }>(`/workshops/${workshopId}/registrations`),
    history: (params: { status?: string; search?: string } = {}) => {
      const query = new URLSearchParams()
      if (params.status) query.set('status', params.status)
      if (params.search) query.set('search', params.search)
      const qs = query.toString() ? `?${query.toString()}` : ''
      return request<Registration[]>(`/registrations/history${qs}`)
    },
  },

  waitlist: {
    add: (workshopId: number, attendee: { attendeeName: string; attendeeEmail: string }) =>
      request<WaitlistEntry>(`/workshops/${workshopId}/waitlist`, {
        method: 'POST',
        body: JSON.stringify(attendee),
      }),
    forWorkshop: (workshopId: number) =>
      request<{ workshop: Workshop; waitlist: WaitlistEntry[] }>(`/workshops/${workshopId}/waitlist`),
  },
}
