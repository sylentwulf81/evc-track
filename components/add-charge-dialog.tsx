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
import { Plus, Home, Zap } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProfile } from "@/app/actions"
import type { User } from "@supabase/supabase-js"

interface AddChargeDialogProps {
  onAdd: (data: {
    cost: number
    startPercent: number
    endPercent: number
    kwh?: number
    chargeType?: "fast" | "standard"
  }) => Promise<{ error?: string }>
  user: User | null
}

// Local storage keys (matching settings page)
const LOCAL_STORAGE_BATTERY = "evc_battery_capacity"
const LOCAL_STORAGE_RATE = "evc_home_rate"

export function AddChargeDialog({ onAdd, user }: AddChargeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form State
  const [cost, setCost] = useState("")
  const [startPercent, setStartPercent] = useState("")
  const [endPercent, setEndPercent] = useState("")
  const [kwh, setKwh] = useState("")
  const [chargeType, setChargeType] = useState<"fast" | "standard" | "">("")
  
  // Smart Logic State
  const [isHomeCharge, setIsHomeCharge] = useState(false)
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
        setKwh(calculatedKwh.toFixed(2))

        // Calculate Cost if Home Charge
        if (isHomeCharge && homeRate) {
           const calculatedCost = calculatedKwh * homeRate
           setCost(Math.round(calculatedCost).toString())
        }
      }
    }
  }, [startPercent, endPercent, batteryCapacity, isHomeCharge, homeRate])

  // Auto-set charge type when toggling home charge
  useEffect(() => {
    if (isHomeCharge) {
      setChargeType("standard")
    }
  }, [isHomeCharge])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await onAdd({
      cost: Number(cost),
      startPercent: Number(startPercent),
      endPercent: Number(endPercent),
      kwh: kwh ? Number(kwh) : undefined,
      chargeType: chargeType || undefined,
    })

    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      resetForm()
    }
  }

  function resetForm() {
    setCost("")
    setStartPercent("")
    setEndPercent("")
    setKwh("")
    setChargeType("")
    setIsHomeCharge(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
        setOpen(val)
        if (!val) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="rounded-full h-16 w-16 fixed bottom-6 left-6 shadow-2xl shadow-primary/50 hover:shadow-primary/70 transition-all hover:scale-110 z-50"
        >
          <Plus className="h-7 w-7" />
          <span className="sr-only">Add charge</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Charging Session</DialogTitle>
          <DialogDescription>Enter the details of your charging session</DialogDescription>
        </DialogHeader>
        
        {/* Home Charge Toggle */}
        {(homeRate || batteryCapacity) && (
            <div className="bg-primary/5 p-3 rounded-lg flex items-center justify-between cursor-pointer border border-primary/10" onClick={() => setIsHomeCharge(!isHomeCharge)}>
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full ${isHomeCharge ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <Home className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="font-medium text-sm">Home Charge</div>
                        <div className="text-xs text-muted-foreground">Auto-calculate using {homeRate ? `¥${homeRate}/kWh` : 'saved settings'}</div>
                    </div>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors relative ${isHomeCharge ? 'bg-primary' : 'bg-muted'}`}>
                     <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isHomeCharge ? 'left-5' : 'left-1'}`} />
                </div>
            </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="startPercent">Start %</Label>
                <Input 
                    id="startPercent" 
                    type="number" 
                    placeholder="20" 
                    required 
                    min="0" 
                    max="100"
                    value={startPercent}
                    onChange={(e) => setStartPercent(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="endPercent">End %</Label>
                <Input 
                    id="endPercent" 
                    type="number" 
                    placeholder="80" 
                    required 
                    min="0" 
                    max="100"
                    value={endPercent}
                    onChange={(e) => setEndPercent(e.target.value)}
                />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost (¥)</Label>
            <div className="relative">
                <Input 
                    id="cost" 
                    type="number" 
                    placeholder="500" 
                    required 
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className={isHomeCharge ? "border-primary/50 bg-primary/5" : ""}
                />
                 {isHomeCharge && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>Auto</span>
                    </div>
                 )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kwh">
              Energy (kWh) <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
             <div className="relative">
                <Input 
                    id="kwh" 
                    type="number" 
                    step="0.01" 
                    placeholder="25.5" 
                    min="0"
                    value={kwh}
                    onChange={(e) => setKwh(e.target.value)}
                />
                 {batteryCapacity && startPercent && endPercent && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {batteryCapacity}kWh Battery
                    </div>
                 )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chargeType">
              Charge Type <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Select value={chargeType} onValueChange={(value) => setChargeType(value as "fast" | "standard")}>
              <SelectTrigger id="chargeType">
                <SelectValue placeholder="Select charge type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast Charge</SelectItem>
                <SelectItem value="standard">Standard Charge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => {
                setOpen(false)
                resetForm()
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? "Adding..." : "Add Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
