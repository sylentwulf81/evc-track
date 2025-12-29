"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Car, Download, Globe, LogIn, Moon, Sun, Laptop, Zap, Flower2, ChevronLeft, ChevronRight, Check, ChevronsUpDown } from "lucide-react"
import Link from "next/link"
import { updateProfile, getProfile, getChargingSessions } from "@/app/actions"
import { getLocalSessions, getLocalCurrency, setLocalCurrency } from "@/lib/storage"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import type { User } from "@supabase/supabase-js"
import { useLanguage } from "@/contexts/LanguageContext"
import { Language } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { EV_DATABASE } from "@/lib/ev-data"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// Local storage keys
const LOCAL_STORAGE_BATTERY = "evc_battery_capacity"
const LOCAL_STORAGE_RATE = "evc_home_rate"

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const { t, language, setLanguage } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [batteryCapacity, setBatteryCapacity] = useState("")
  const [homeRate, setHomeRate] = useState("")
  const [currency, setCurrency] = useState("JPY")

  const [openVehicleDialog, setOpenVehicleDialog] = useState(false)
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("")
  const [vehiclePage, setVehiclePage] = useState(1)
  
  const [selectedEvId, setSelectedEvId] = useState("")
  const [manualAvatar, setManualAvatar] = useState<string | null>(null)
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false)

  // Group EVs by Make
  const groupedEVs = EV_DATABASE.reduce((acc, ev) => {
      if (!acc[ev.make]) acc[ev.make] = []
      acc[ev.make].push(ev)
      return acc
  }, {} as Record<string, typeof EV_DATABASE>)

  // Filter and paginate EVs
  const ITEMS_PER_PAGE = 10
  const filteredEVs = EV_DATABASE.filter((ev) => {
    if (!vehicleSearchQuery) return true
    const query = vehicleSearchQuery.toLowerCase()
    return (
      ev.make.toLowerCase().includes(query) ||
      ev.model.toLowerCase().includes(query) ||
      (ev.trim && ev.trim.toLowerCase().includes(query))
    )
  })
  const totalPages = Math.ceil(filteredEVs.length / ITEMS_PER_PAGE)
  const paginatedEVs = filteredEVs.slice(
    (vehiclePage - 1) * ITEMS_PER_PAGE,
    vehiclePage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when search changes
  useEffect(() => {
    setVehiclePage(1)
  }, [vehicleSearchQuery])

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
  
  // NOTE: Loading state is handled by parent or just empty render for now if needed, 
  // but let's keep it simple and just show form even if loading prefs (defaults will update)

  return (
    <div className="space-y-6 pb-20 md:pb-0">
        {!user && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <LogIn className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{t('settings.signIn') || "Sign In"}</CardTitle>
                  <CardDescription>
                    {t('settings.signInToSync') || "Sign in to sync your data across devices"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/auth/login" className="w-full">
                <Button className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

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
                <Sun className="h-5 w-5 text-primary rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 text-primary rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </div>
              <div>
                <CardTitle>{t('common.theme') || "Appearance"}</CardTitle>
                <CardDescription>
                  {t('settings.themeDesc') || "Select your preferred theme"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <Button 
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setTheme("light")}
                >
                   <Sun className="h-4 w-4" />
                   <span className="text-xs">Light</span>
                </Button>
                <Button 
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setTheme("dark")}
                >
                   <Moon className="h-4 w-4" />
                   <span className="text-xs">Dark</span>
                </Button>
                <Button 
                    variant={theme === "system" ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setTheme("system")}
                >
                   <Laptop className="h-4 w-4" />
                   <span className="text-xs">System</span>
                </Button>
                <Button 
                    variant={theme === "charge" ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setTheme("charge")}
                >
                   <Zap className="h-4 w-4" />
                   <span className="text-xs">Charge</span>
                </Button>
                <Button 
                    variant={theme === "sakura" ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setTheme("sakura")}
                >
                   <Flower2 className="h-4 w-4" />
                   <span className="text-xs">Sakura</span>
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative group">
                  <div className="p-2 bg-primary/10 rounded-full cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setOpenAvatarDialog(true)}>
                     {selectedEvId || manualAvatar ? (
                          <img 
                             src={manualAvatar || EV_DATABASE.find(e => e.id === selectedEvId)?.image || "/assets/avatars/sedan.png"} 
                             alt="Vehicle Avatar" 
                             className="h-10 w-10 object-contain"
                          />
                     ) : (
                        <Car className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  
                  <Dialog open={openAvatarDialog} onOpenChange={setOpenAvatarDialog}>
                      <DialogContent className="sm:max-w-md">
                          <div className="grid grid-cols-2 gap-4 p-4">
                              {["sedan", "suv", "truck", "hatchback"].map((type) => (
                                  <div 
                                    key={type} 
                                    className="cursor-pointer hover:bg-accent rounded-lg p-4 flex flex-col items-center gap-2 border-2 border-transparent hover:border-primary/50 transition-all"
                                    onClick={() => {
                                        setManualAvatar(`/assets/avatars/${type}.png`)
                                        setOpenAvatarDialog(false)
                                    }}
                                  >
                                      <img src={`/assets/avatars/${type}.png`} alt={type} className="h-20 w-20 object-contain" />
                                      <span className="capitalize text-sm font-medium">{type}</span>
                                  </div>
                              ))}
                          </div>
                      </DialogContent>
                  </Dialog>
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
                  <div className="space-y-2 flex flex-col">
                      <Label>{t('settings.selectEv')}</Label>
                      <Button
                          variant="outline"
                          onClick={() => {
                            setOpenVehicleDialog(true)
                            setVehicleSearchQuery("")
                            setVehiclePage(1)
                          }}
                          className="w-full justify-between font-normal"
                      >
                          {selectedEvId
                              ? EV_DATABASE.find((ev) => ev.id === selectedEvId)?.model
                                  ? `${EV_DATABASE.find((ev) => ev.id === selectedEvId)?.make} ${EV_DATABASE.find((ev) => ev.id === selectedEvId)?.model} ${EV_DATABASE.find((ev) => ev.id === selectedEvId)?.trim || ''}`
                                  : t('settings.selectVehicle')
                              : t('settings.selectVehicle')}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                      
                      <Dialog open={openVehicleDialog} onOpenChange={(open) => {
                        setOpenVehicleDialog(open)
                        if (!open) {
                          setVehicleSearchQuery("")
                          setVehiclePage(1)
                        }
                      }}>
                        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0">
                          <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold mb-3">{t('settings.selectVehicle')}</h2>
                            <Input
                              placeholder={t('settings.searchEv')}
                              value={vehicleSearchQuery}
                              onChange={(e) => setVehicleSearchQuery(e.target.value)}
                              className="w-full"
                              autoFocus={false}
                            />
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-4">
                            {filteredEVs.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                {t('settings.noVehicleFound')}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {paginatedEVs.map((ev) => (
                                  <div
                                    key={ev.id}
                                    className={cn(
                                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                      selectedEvId === ev.id
                                        ? "bg-primary/10 border-primary"
                                        : "hover:bg-accent border-transparent hover:border-border"
                                    )}
                                    onClick={() => {
                                      setSelectedEvId(ev.id)
                                      setManualAvatar(null)
                                      setBatteryCapacity(ev.capacity.toString())
                                      setOpenVehicleDialog(false)
                                      setVehicleSearchQuery("")
                                      setVehiclePage(1)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4 shrink-0",
                                        selectedEvId === ev.id ? "opacity-100 text-primary" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium">{ev.make} {ev.model}</div>
                                      {ev.trim && (
                                        <div className="text-sm text-muted-foreground">{ev.trim}</div>
                                      )}
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {ev.capacity} kWh
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {totalPages > 1 && (
                            <div className="p-4 border-t flex items-center justify-between gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVehiclePage((p) => Math.max(1, p - 1))}
                                disabled={vehiclePage === 1}
                                className="gap-1"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>
                              <span className="text-sm text-muted-foreground">
                                Page {vehiclePage} of {totalPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVehiclePage((p) => Math.min(totalPages, p + 1))}
                                disabled={vehiclePage === totalPages}
                                className="gap-1"
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
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
    </div>
  )
}
