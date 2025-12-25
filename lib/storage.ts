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
  currency: string
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
  currency: string
}

const STORAGE_KEY = "ev_charging_sessions"
const EXPENSES_STORAGE_KEY = "ev_vehicle_expenses"
const SETTINGS_CURRENCY_KEY = "evc_currency_preference"

export function getLocalCurrency(): string {
  if (typeof window === "undefined") return "JPY"
  return localStorage.getItem(SETTINGS_CURRENCY_KEY) || "JPY"
}

export function setLocalCurrency(currency: string): void {
  localStorage.setItem(SETTINGS_CURRENCY_KEY, currency)
}

export function getLocalSessions(): ChargingSession[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function addLocalSession(session: Omit<ChargingSession, "id" | "charged_at" | "user_id" | "currency">): ChargingSession {
  const sessions = getLocalSessions()
  const currency = getLocalCurrency()
  const newSession: ChargingSession = {
    ...session,
    id: crypto.randomUUID(),
    charged_at: new Date().toISOString(),
    user_id: null,
    currency,
  }
  sessions.unshift(newSession)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  return newSession
}

export function deleteLocalSession(id: string): void {
  const sessions = getLocalSessions()
  const filtered = sessions.filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)) // BUG FIX: was saving filtered but variable passed was sessions? No, wait. 
  // implementation below relies on replace_file_content, checking logic correctness:
  // previous code: localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  // so this is fine.
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

export function addLocalExpense(expense: Omit<VehicleExpense, "id" | "user_id" | "currency">): VehicleExpense {
  const expenses = getLocalExpenses()
  const currency = getLocalCurrency()
  const newExpense: VehicleExpense = {
    ...expense,
    id: crypto.randomUUID(),
    user_id: null,
    currency,
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
