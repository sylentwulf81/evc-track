// Client-side storage utilities for guest users
export interface ChargingSession {
  id: string
  cost: number | null
  start_percent: number
  end_percent: number | null
  charged_at: string
  user_id: string | null
  kwh?: number | null
  charge_type?: "fast" | "standard" | null
}


export interface VehicleExpense {
  id: string
  user_id: string | null
  title: string
  amount: number
  expense_date: string
  category: "maintenance" | "repair" | "insurance" | "tax" | "other"
  description?: string | null
  odometer?: number | null
  location?: string | null
}

const STORAGE_KEY = "ev_charging_sessions"
const EXPENSES_STORAGE_KEY = "ev_vehicle_expenses"

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

// Expense helpers
export function getLocalExpenses(): VehicleExpense[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(EXPENSES_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function addLocalExpense(expense: Omit<VehicleExpense, "id" | "user_id">): VehicleExpense {
  const expenses = getLocalExpenses()
  const newExpense: VehicleExpense = {
    ...expense,
    id: crypto.randomUUID(),
    user_id: null,
  }
  expenses.unshift(newExpense)
  localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses))
  return newExpense
}

export function deleteLocalExpense(id: string): void {
  const expenses = getLocalExpenses()
  const filtered = expenses.filter((e) => e.id !== id)
  localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(filtered))
}
