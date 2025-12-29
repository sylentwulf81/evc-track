"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Car, Zap, Download, Globe } from "lucide-react"
import Link from "next/link"
import { updateProfile, getProfile, getChargingSessions } from "@/app/actions"
import { getLocalSessions, getLocalCurrency, setLocalCurrency } from "@/lib/storage"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import { useLanguage } from "@/contexts/LanguageContext"
import { Language } from "@/lib/translations"

// Local storage keys
const LOCAL_STORAGE_BATTERY = "evc_battery_capacity"
const LOCAL_STORAGE_RATE = "evc_home_rate"

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [batteryCapacity, setBatteryCapacity] = useState("")
  const [homeRate, setHomeRate] = useState("")
  const [currency, setCurrency] = useState("JPY")

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
          setCurrency(profile.currency || "JPY")
        }
      } else {
        // Load from local storage
        const savedBattery = localStorage.getItem(LOCAL_STORAGE_BATTERY)
        const savedRate = localStorage.getItem(LOCAL_STORAGE_RATE)
        const savedCurrency = getLocalCurrency()
        
        if (savedBattery) setBatteryCapacity(savedBattery)
        if (savedRate) setHomeRate(savedRate)
        if (savedCurrency) setCurrency(savedCurrency)
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
        formData.append("currency", currency)
        
        const result = await updateProfile(formData)
        if (result.error) throw new Error(result.error)
        
        toast.success(t('common.success'))
      } else {
        // Save to local storage
        localStorage.setItem(LOCAL_STORAGE_BATTERY, batteryCapacity)
        localStorage.setItem(LOCAL_STORAGE_RATE, homeRate)
        setLocalCurrency(currency)
        
        toast.success(t('common.success'))
      }
    } catch (err: any) {
      toast.error(err.message || t('common.error'))
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
              toast.error(t('history.noData'))
              return
          }

          // CSV Headers
          const headers = ["Date", `${t('common.cost')} (${currency})`, t('forms.startPercent'), t('forms.endPercent'), "kWh", t('forms.type')]
          const rows = sessions.map((s: any) => [
              new Date(s.charged_at).toLocaleString(),
              s.cost,
              s.start_percent,
              s.end_percent,
              s.kwh || "",
              s.charge_type || "standard"
          ])

          const csvContent = [
              headers.join(","),
              ...rows.map((row: any[]) => row.join(","))
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
          toast.error(t('common.error'))
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
          <h1 className="text-xl font-bold">{t('settings.title')}</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t('common.language')}</CardTitle>
                <CardDescription>
                  Select your preferred language
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t('settings.vehicleProfile')}</CardTitle>
                <CardDescription>
                  {t('settings.vehicleProfileDesc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="currency">{t('common.currency')}</Label>
                <div className="relative">
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>


              <div className="space-y-4">
                  <div className="space-y-2">
                      <Label>{t('settings.selectEv') || "Select Popular EV"}</Label>
                      <Select onValueChange={(val) => {
                          if (val) setBatteryCapacity(val)
                      }}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select a vehicle..." />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="57.5">Tesla Model 3 RWD (LFP)</SelectItem>
                              <SelectItem value="75.0">Tesla Model 3 Long Range / Perf</SelectItem>
                              <SelectItem value="60.0">Tesla Model Y RWD</SelectItem>
                              <SelectItem value="75.0">Tesla Model Y Long Range / Perf</SelectItem>
                              <SelectItem value="100.0">Tesla Model S/X Long Range</SelectItem>
                              <SelectItem value="40.0">Nissan Leaf (40 kWh)</SelectItem>
                              <SelectItem value="62.0">Nissan Leaf e+ (62 kWh)</SelectItem>
                              <SelectItem value="66.0">Chevrolet Bolt EV/EUV</SelectItem>
                              <SelectItem value="77.4">Hyundai Ioniq 5 (Long Range)</SelectItem>
                              <SelectItem value="58.0">Hyundai Ioniq 5 (Standard Range)</SelectItem>
                              <SelectItem value="77.4">Kia EV6 (Long Range)</SelectItem>
                              <SelectItem value="58.0">Kia EV6 (Standard Range)</SelectItem>
                              <SelectItem value="82.0">Volkswagen ID.4 (Pro)</SelectItem>
                              <SelectItem value="62.0">Volkswagen ID.4 (Standard)</SelectItem>
                              <SelectItem value="72.8">Toyota bZ4X (FWD)</SelectItem>
                              <SelectItem value="91.0">Ford Mustang Mach-E (Ext Range)</SelectItem>
                              <SelectItem value="72.0">Ford Mustang Mach-E (Std Range)</SelectItem>
                              <SelectItem value="131.0">Ford F-150 Lightning (Ext Range)</SelectItem>
                              <SelectItem value="98.0">Ford F-150 Lightning (Std Range)</SelectItem>
                              <SelectItem value="87.0">Nissan Ariya (87 kWh)</SelectItem>
                              <SelectItem value="63.0">Nissan Ariya (63 kWh)</SelectItem>
                              <SelectItem value="105.0">BMW iX xDrive50</SelectItem>
                              <SelectItem value="80.7">BMW i4 eDrive40</SelectItem>
                              <SelectItem value="83.9">Rivian R1T/R1S (Standard)</SelectItem>
                              <SelectItem value="135.0">Rivian R1T/R1S (Large)</SelectItem>
                          </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Selecting a vehicle only auto-fills the battery capacity below.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batteryCapacity">{t('settings.batteryCapacity')} (kWh)</Label>
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
                      {t('settings.batteryCapacityDesc')}
                    </p>
                  </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeRate">{t('settings.homeRate')}</Label>
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
                    /kWh
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('settings.homeRateDesc')}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  t('common.loading')
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> {t('common.save')}
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
                        <CardTitle>{t('settings.dataManagement')}</CardTitle>
                        <CardDescription>{t('settings.exportData')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> {t('settings.exportData')}
                </Button>
            </CardContent>
        </Card>

        {!user && (
          <div className="text-center p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p>{t('settings.signInToSync')}</p>
            <Link href="/auth/login" className="text-primary hover:underline mt-2 inline-block">
              Sign In
            </Link>
            <Link href="/auth/login" className="text-primary hover:underline mt-2 inline-block">
              Sign In
            </Link>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground/50 pt-4 pb-8">
            {t('settings.version')} v1.1.0
        </div>
      </div>
    </div>
  )
}
