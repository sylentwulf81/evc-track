"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Car, Zap, Download } from "lucide-react"
import Link from "next/link"
import { updateProfile, getProfile, getChargingSessions } from "@/app/actions"
import { getLocalSessions } from "@/lib/storage"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

// Local storage keys
const LOCAL_STORAGE_BATTERY = "evc_battery_capacity"
const LOCAL_STORAGE_RATE = "evc_home_rate"

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [batteryCapacity, setBatteryCapacity] = useState("")
  const [homeRate, setHomeRate] = useState("")

  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Load from server
        const profile = await getProfile()
        if (profile) {
          setBatteryCapacity(profile.battery_capacity?.toString() ?? "")
          setHomeRate(profile.home_rate?.toString() ?? "")
        }
      } else {
        // Load from local storage
        const savedBattery = localStorage.getItem(LOCAL_STORAGE_BATTERY)
        const savedRate = localStorage.getItem(LOCAL_STORAGE_RATE)
        
        if (savedBattery) setBatteryCapacity(savedBattery)
        if (savedRate) setHomeRate(savedRate)
      }
      
      setLoading(false)
    }

    loadData()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (user) {
        // Save to server
        const formData = new FormData()
        formData.append("batteryCapacity", batteryCapacity)
        formData.append("homeRate", homeRate)
        
        const result = await updateProfile(formData)
        if (result.error) throw new Error(result.error)
        
        toast.success("Settings saved to your account")
      } else {
        // Save to local storage
        localStorage.setItem(LOCAL_STORAGE_BATTERY, batteryCapacity)
        localStorage.setItem(LOCAL_STORAGE_RATE, homeRate)
        
        toast.success("Settings saved to this device")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
      try {
          let sessions = []
          if (user) {
              sessions = await getChargingSessions()
          } else {
              sessions = getLocalSessions()
          }

          if (!sessions || sessions.length === 0) {
              toast.error("No data to export")
              return
          }

          // CSV Headers
          const headers = ["Date", "Cost (¥)", "Start %", "End %", "kWh", "Type"]
          const rows = sessions.map(s => [
              new Date(s.charged_at).toLocaleString(),
              s.cost,
              s.start_percent,
              s.end_percent,
              s.kwh || "",
              s.charge_type || "standard"
          ])

          const csvContent = [
              headers.join(","),
              ...rows.map(row => row.join(","))
          ].join("\n")

          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.setAttribute("href", url)
          link.setAttribute("download", `ev_charging_data_${new Date().toISOString().split('T')[0]}.csv`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
      } catch (e) {
          console.error(e)
          toast.error("Failed to export data")
      }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Zap className="h-8 w-8 animate-pulse text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 pb-24">
      <div className="container max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Vehicle Profile</CardTitle>
                <CardDescription>
                  Set your car's details for smart calculations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batteryCapacity">Battery Capacity (kWh)</Label>
                <div className="relative">
                  <Input
                    id="batteryCapacity"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 75.0"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    kWh
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Used to calculate energy added from % change.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeRate">Home Electricity Rate</Label>
                <div className="relative">
                  <Input
                    id="homeRate"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 30.00"
                    value={homeRate}
                    onChange={(e) => setHomeRate(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ¥/kWh
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Used to auto-calculate cost for home charging.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Settings
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Export your data</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export to CSV
                </Button>
            </CardContent>
        </Card>

        {!user && (
          <div className="text-center p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p>Sign in to sync these settings across your devices.</p>
            <Link href="/auth/login" className="text-primary hover:underline mt-2 inline-block">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
