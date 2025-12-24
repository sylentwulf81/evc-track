"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addChargingSession(formData: FormData) {
  const cost = Number.parseInt(formData.get("cost") as string)
  const startPercent = Number.parseInt(formData.get("startPercent") as string)
  const endPercent = Number.parseInt(formData.get("endPercent") as string)

  if (isNaN(cost) || isNaN(startPercent) || isNaN(endPercent)) {
    return { error: "Invalid input" }
  }

  if (startPercent < 0 || startPercent > 100 || endPercent < 0 || endPercent > 100) {
    return { error: "Percentages must be between 0 and 100" }
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
