"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Car, Download, Globe, LogIn } from "lucide-react"
import Link from "next/link"
import { updateProfile, getProfile, getChargingSessions } from "@/app/actions"
import { getLocalSessions, getLocalCurrency, setLocalCurrency } from "@/lib/storage"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import { useLanguage } from "@/contexts/LanguageContext"
import { Language } from "@/lib/translations"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { EV_DATABASE } from "@/lib/ev-data"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// Local storage keys
const LOCAL_STORAGE_BATTERY = "evc_battery_capacity"
const LOCAL_STORAGE_RATE = "evc_home_rate"

export function SettingsView() {
  const { t, language, setLanguage } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [batteryCapacity, setBatteryCapacity] = useState("")
  const [homeRate, setHomeRate] = useState("")
  const [currency, setCurrency] = useState("JPY")

  const [openCombobox, setOpenCombobox] = useState(false)
  
  const [selectedEvId, setSelectedEvId] = useState("")
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false)

  // Group EVs by Make
  const groupedEVs = EV_DATABASE.reduce((acc, ev) => {
      if (!acc[ev.make]) acc[ev.make] = []
      acc[ev.make].push(ev)
      return acc
  }, {} as Record<string, typeof EV_DATABASE>)

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
                <div className="relative group">
                  <div className="p-2 bg-primary/10 rounded-full cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setOpenAvatarDialog(true)}>
                    {selectedEvId ? (
                         <img 
                            src={EV_DATABASE.find(e => e.id === selectedEvId)?.image || "/assets/avatars/sedan.png"} 
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
                                        // find first car of this type to get image path, or construct it
                                        // This is a visual override only for now, ideally strictly mapped to car model
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
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                          <PopoverTrigger asChild>
                              <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openCombobox}
                                  className="w-full justify-between font-normal"
                              >
                                  {selectedEvId
                                      ? EV_DATABASE.find((ev) => ev.id === selectedEvId)?.model
                                          ? `${EV_DATABASE.find((ev) => ev.id === selectedEvId)?.make} ${EV_DATABASE.find((ev) => ev.id === selectedEvId)?.model} ${EV_DATABASE.find((ev) => ev.id === selectedEvId)?.trim || ''}`
                                          : t('settings.selectVehicle')
                                      : t('settings.selectVehicle')}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                              <Command>
                                  <CommandInput placeholder={t('settings.searchEv')} />
                                  <CommandList>
                                      <CommandEmpty>{t('settings.noVehicleFound')}</CommandEmpty>
                                      {Object.entries(groupedEVs).map(([make, evs]) => (
                                          <CommandGroup key={make} heading={make}>
                                              {evs.map((ev) => (
                                                  <CommandItem
                                                      key={ev.id}
                                                      value={`${ev.make} ${ev.model} ${ev.trim || ''}`}
                                                      onSelect={() => {
                                                          setSelectedEvId(ev.id)
                                                          setBatteryCapacity(ev.capacity.toString())
                                                          setOpenCombobox(false)
                                                      }}
                                                  >
                                                      <Check
                                                          className={cn(
                                                              "mr-2 h-4 w-4",
                                                              selectedEvId === ev.id ? "opacity-100" : "opacity-0"
                                                          )}
                                                      />
                                                      <span>{ev.model}</span>
                                                      {ev.trim && <span className="ml-2 text-muted-foreground text-xs">({ev.trim})</span>}
                                                  </CommandItem>
                                              ))}
                                          </CommandGroup>
                                      ))}
                                  </CommandList>
                              </Command>
                          </PopoverContent>
                      </Popover>
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
             <div className="flex flex-col items-center gap-2">
                 <p>{t('settings.signInToSync')}</p>
                 <Link href="/auth/login" className="w-full">
                     <Button variant="outline" className="w-full gap-2">
                         <LogIn className="h-4 w-4" />
                         Sign In
                     </Button>
                  </Link>
             </div>
          </div>
        )}
    </div>
  )
}
