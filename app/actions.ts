"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addChargingSession(formData: FormData) {
  const cost = formData.get("cost") ? Number.parseInt(formData.get("cost") as string) : null
  const startPercent = Number.parseInt(formData.get("startPercent") as string)
  const endPercent = formData.get("endPercent") ? Number.parseInt(formData.get("endPercent") as string) : null

  if (isNaN(startPercent)) {
    return { error: "Start percentage is required" }
  }

  if (startPercent < 0 || startPercent > 100) {
    return { error: "Start percentage must be between 0 and 100" }
  }

  if (endPercent !== null && (endPercent < 0 || endPercent > 100)) {
    return { error: "End percentage must be between 0 and 100" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get user profile for currency, default to JPY
  const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).single()
  const currency = profile?.currency || "JPY"

  const { error } = await supabase.from("charging_sessions").insert({
    cost,
    start_percent: startPercent,
    end_percent: endPercent,
    user_id: user.id,
    currency,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function getChargingSessions() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase.from("charging_sessions").select("*").order("charged_at", { ascending: false })

  if (error) {
    console.error("Error fetching charging sessions:", error)
    return []
  }

  return data || []
}

export async function getProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    // If no profile exists, return defaults or null. 
    // It's common for the row not to exist yet if we didn't insert on signup trigger.
    return null
  }

  return data
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const batteryCapacity = formData.get("batteryCapacity")
    ? Number.parseFloat(formData.get("batteryCapacity") as string)
    : null

  const homeRate = formData.get("homeRate")
    ? Number.parseFloat(formData.get("homeRate") as string)
    : null

  const currency = formData.get("currency") as string || "JPY"

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    battery_capacity: batteryCapacity,
    home_rate: homeRate,
    currency,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error updating profile:", error)
    return { error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function addVehicleExpense(data: {
  title: string
  amount: number
  expense_date: string
  category: string
  description?: string | null
  odometer?: number | null
  location?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Get user profile for currency, default to JPY
  const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).single()
  const currency = profile?.currency || "JPY"

  const { error } = await supabase.from("vehicle_expenses").insert({
    title: data.title,
    amount: data.amount,
    expense_date: data.expense_date,
    category: data.category,
    description: data.description,
    odometer: data.odometer,
    location: data.location,
    user_id: user.id,
    currency,
  })

  if (error) {
    console.error("Error adding expense:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function deleteVehicleExpense(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("vehicle_expenses").delete().eq("id", id)

  if (error) {
    console.error("Error deleting expense:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}
