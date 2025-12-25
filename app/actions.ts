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

  const { error } = await supabase.from("charging_sessions").insert({
    cost,
    start_percent: startPercent,
    end_percent: endPercent,
    user_id: user.id,
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

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    battery_capacity: batteryCapacity,
    home_rate: homeRate,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error updating profile:", error)
    return { error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}
