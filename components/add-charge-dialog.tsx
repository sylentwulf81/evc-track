"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Home, Zap, Battery, BatteryFull, Plug } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProfile } from "@/app/actions"
import type { User } from "@supabase/supabase-js"
import type { ChargingSession } from "@/lib/storage"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/LanguageContext"

interface AddChargeDialogProps {
  onAdd: (data: {
    cost: number | null
    startPercent: number
    endPercent: number | null
    kwh?: number | null
    chargeType?: ChargingSession['charge_type']
    odometer?: number | null
  }) => Promise<{ error?: string }>
  user: User | null
  trigger?: React.ReactNode
}

// Local storage keys (matching settings page)
const LOCAL_STORAGE_BATTERY = "evc_battery_capacity"
const LOCAL_STORAGE_RATE = "evc_home_rate"

export function AddChargeDialog({ onAdd, user, trigger }: AddChargeDialogProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [cost, setCost] = useState("")
  const [startPercent, setStartPercent] = useState("")
  const [endPercent, setEndPercent] = useState("")
  const [kwhAdded, setKwhAdded] = useState("")
  const [odometer, setOdometer] = useState("")
  const [chargeType, setChargeType] = useState<ChargingSession['charge_type']>("standard")
  
  // Smart Logic State
  const [useHomeCharge, setUseHomeCharge] = useState(false)
  const [batteryCapacity, setBatteryCapacity] = useState<number | null>(null)
  const [homeRate, setHomeRate] = useState<number | null>(null)

  const formRef = useRef<HTMLFormElement>(null)

  // Load Profile Data
  useEffect(() => {
    if (open) {
      const loadProfile = async () => {
        let capacity = null
        let rate = null

        if (user) {
          const profile = await getProfile()
          if (profile) {
            capacity = profile.battery_capacity
            rate = profile.home_rate
          }
        } else {
          const savedBattery = localStorage.getItem(LOCAL_STORAGE_BATTERY)
          const savedRate = localStorage.getItem(LOCAL_STORAGE_RATE)
          if (savedBattery) capacity = Number(savedBattery)
          if (savedRate) rate = Number(savedRate)
        }

        setBatteryCapacity(capacity)
        setHomeRate(rate)
      }
      loadProfile()
    }
  }, [open, user])

  // Smart Calculation Effect
  useEffect(() => {
    if (startPercent && endPercent && batteryCapacity) {
      const start = Number(startPercent)
      const end = Number(endPercent)
      
      // Calculate kWh Added
      if (!isNaN(start) && !isNaN(end) && end > start) {
        const percentDiff = (end - start) / 100
        const calculatedKwh = percentDiff * batteryCapacity
        // Only auto-fill if kwh is empty or seems calculated match
        setKwhAdded(calculatedKwh.toFixed(2))

        // Calculate Cost if Home Charge
        if (useHomeCharge && homeRate) {
           const calculatedCost = calculatedKwh * homeRate
           setCost(Math.round(calculatedCost).toString())
        }
      }
    } else if (!startPercent || !endPercent || !batteryCapacity) {
        setKwhAdded(""); // Clear kwhAdded if inputs are incomplete
        if (useHomeCharge) setCost(""); // Clear cost if home charge is active and inputs are incomplete
    }
  }, [startPercent, endPercent, batteryCapacity, useHomeCharge, homeRate])

  // Auto-set charge type when toggling home charge
  useEffect(() => {
    if (useHomeCharge) {
      setChargeType("standard")
    }
  }, [useHomeCharge])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    // Only startPercent is mandatory
    if (!startPercent) {
        toast.error(t('common.error') || "Please enter a starting percentage")
        setLoading(false)
        return
    }

    const start = Number.parseFloat(startPercent)
    const end = endPercent ? Number.parseFloat(endPercent) : null
    const costVal = cost ? Number.parseFloat(cost) : null
    const odoVal = odometer ? Number.parseFloat(odometer) : null

    // Helper for validation only if value is provided
    if (start < 0 || start > 100) {
      toast.error(t('common.error') || "Start percentage must be between 0 and 100")
      setLoading(false)
      return
    }
    
    if (end !== null && (end < 0 || end > 100)) {
        toast.error(t('common.error') || "End percentage must be between 0 and 100")
        setLoading(false)
        return
    }

    const res = await onAdd({
      cost: costVal,
      startPercent: start,
      endPercent: end,
      kwh: kwhAdded ? Number.parseFloat(kwhAdded) : undefined,
      chargeType: chargeType,
      odometer: odoVal,
    })

    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(t('tracker.sessionAdded') || "Charging session added")
      setOpen(false)
      resetForm()
    }
  }

  function resetForm() {
    setCost("")
    setStartPercent("")
    setEndPercent("")
    setKwhAdded("")
    setOdometer("")
    setChargeType("standard")
    setUseHomeCharge(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
        setOpen(val)
        if (!val) resetForm()
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-full h-14 w-14 shadow-lg p-0 hover:scale-105 transition-transform">
            <Plus className="h-8 w-8" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('tracker.addCharge')}</DialogTitle>
          <DialogDescription>
            {t('tracker.enterDetails') || "Enter the details of your charging session."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Home Charge Toggle */}
          {(homeRate || batteryCapacity) && (
            <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${useHomeCharge ? 'bg-primary/20' : 'bg-muted'}`}>
                      <Home className={`h-4 w-4 ${useHomeCharge ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-sm font-medium">{t('tracker.homeCharge')}</span>
                      <span className="text-[10px] text-muted-foreground">{t('tracker.autoCalc') || "Auto-calc cost"}</span>
                  </div>
              </div>
              <Switch checked={useHomeCharge} onCheckedChange={setUseHomeCharge} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start">{t('forms.startPercent')} <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="start"
                  type="number"
                  placeholder="0"
                  value={startPercent}
                  onChange={(e) => setStartPercent(e.target.value)}
                  className="pl-8"
                  required
                />
                <Battery className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">{t('forms.endPercent')} <span className="text-xs text-muted-foreground font-normal">({t('common.optional')})</span></Label>
              <div className="relative">
                <Input
                  id="end"
                  type="number"
                  placeholder="80"
                  value={endPercent}
                  onChange={(e) => setEndPercent(e.target.value)}
                  className="pl-8"
                />
                <BatteryFull className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="cost">{t('forms.cost')} (¥) <span className="text-xs text-muted-foreground font-normal">({t('common.optional')})</span></Label>
            <div className="relative">
              <Input
                id="cost"
                type="number"
                placeholder="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className={`pl-8 ${useHomeCharge ? 'border-primary/50 bg-primary/5' : ''}`}
                readOnly={useHomeCharge}
              />
              <span className="absolute left-3 top-2.5 font-bold text-muted-foreground">¥</span>
              {useHomeCharge && (
                  <span className="absolute right-3 top-2.5 text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      Auto
                  </span>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="odometer">{t('forms.odometer')} (km) <span className="text-xs text-muted-foreground font-normal">({t('common.optional')})</span></Label>
            <div className="relative">
              <Input
                id="odometer"
                type="number"
                placeholder="e.g. 15000"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="pl-8"
              />
              <div className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-50 text-xs font-bold">Km</div>
            </div>
          </div>

          {!useHomeCharge && (
            <div className="grid gap-2">
                <Label>{t('tracker.chargeType')}</Label>
                <Select value={chargeType || "standard"} onValueChange={(val: any) => setChargeType(val)}>
                    <SelectTrigger className="h-11">
                        <SelectValue placeholder={t('tracker.chargeType')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="level1">{t('tracker.level1') || "Level 1 (120V)"}</SelectItem>
                        <SelectItem value="level2">{t('tracker.level2') || "Level 2 (240V)"}</SelectItem>
                        <SelectItem value="chademo">{t('tracker.chademo') || "CHAdeMO"}</SelectItem>
                        <SelectItem value="ccs">{t('tracker.ccs') || "CCS"}</SelectItem>
                        <SelectItem value="tesla">{t('tracker.tesla') || "Tesla Supercharger"}</SelectItem>
                        <SelectItem value="type2">{t('tracker.type2') || "Type 2"}</SelectItem>
                        <SelectItem value="standard">{t('tracker.standardStandard') || "Standard"}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          )}

          {/* New Read-only Info Section */}
          {(batteryCapacity || kwhAdded || (useHomeCharge && homeRate)) && (
              <div className="mt-2 p-3 bg-muted/30 rounded-lg text-xs space-y-1 text-muted-foreground">
                  {batteryCapacity && (
                       <div className="flex justify-between">
                         <span>{t('forms.vehicleBattery') || "Vehicle Battery"}:</span>
                         <span className="font-medium">{batteryCapacity} kWh</span>
                       </div>
                  )}
                  {kwhAdded && (
                      <div className="flex justify-between">
                        <span>{t('forms.kwhAdded') || "Energy Added"}:</span>
                        <span className="font-medium text-foreground">{Number(kwhAdded).toFixed(1)} kWh</span>
                      </div>
                  )}
                   {useHomeCharge && homeRate && (
                      <div className="flex justify-between">
                        <span>{t('forms.homeRate') || "Home Rate"}:</span>
                        <span className="font-medium">{homeRate} ¥/kWh</span>
                      </div>
                  )}
              </div>
          )}


          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? t('common.loading') : t('tracker.addSession')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
