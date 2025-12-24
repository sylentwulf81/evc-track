// Client-side storage utilities for guest users
export interface ChargingSession {
  id: string
  cost: number
  start_percent: number
  end_percent: number
  charged_at: string
  user_id: string | null
  kwh?: number | null
  charge_type?: "fast" | "standard" | null
}

const STORAGE_KEY = "ev_charging_sessions"

export function getLocalSessions(): ChargingSession[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function addLocalSession(session: Omit<ChargingSession, "id" | "charged_at" | "user_id">): ChargingSession {
  const sessions = getLocalSessions()
  const newSession: ChargingSession = {
    ...session,
    id: crypto.randomUUID(),
    charged_at: new Date().toISOString(),
    user_id: null,
  }
  sessions.unshift(newSession)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  return newSession
}

export function deleteLocalSession(id: string): void {
  const sessions = getLocalSessions()
  const filtered = sessions.filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function clearLocalSessions(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function updateLocalSession(id: string, updates: Partial<Omit<ChargingSession, "id" | "user_id">>): void {
  const sessions = getLocalSessions()
  const index = sessions.findIndex((s) => s.id === id)
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }
}
