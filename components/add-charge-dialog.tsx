"use client"

import type React from "react"

import { useState, useRef } from "react"
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
import { Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddChargeDialogProps {
  onAdd: (data: {
    cost: number
    startPercent: number
    endPercent: number
    kwh?: number
    chargeType?: "fast" | "standard"
  }) => Promise<{ error?: string }>
}

export function AddChargeDialog({ onAdd }: AddChargeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chargeType, setChargeType] = useState<"fast" | "standard" | "">("")
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const cost = Number.parseInt(formData.get("cost") as string)
    const startPercent = Number.parseInt(formData.get("startPercent") as string)
    const endPercent = Number.parseInt(formData.get("endPercent") as string)
    const kwhValue = formData.get("kwh") as string
    const kwh = kwhValue ? Number.parseFloat(kwhValue) : undefined

    const result = await onAdd({
      cost,
      startPercent,
      endPercent,
      kwh,
      chargeType: chargeType || undefined,
    })

    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
      formRef.current?.reset()
      setChargeType("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="rounded-full h-16 w-16 fixed bottom-6 right-6 shadow-2xl shadow-primary/50 hover:shadow-primary/70 transition-all hover:scale-110 z-50"
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
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cost">Cost (¥)</Label>
            <Input id="cost" name="cost" type="number" placeholder="500" required min="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startPercent">Starting Charge (%)</Label>
            <Input id="startPercent" name="startPercent" type="number" placeholder="20" required min="0" max="100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endPercent">Ending Charge (%)</Label>
            <Input id="endPercent" name="endPercent" type="number" placeholder="80" required min="0" max="100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kwh">
              Energy (kWh) <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input id="kwh" name="kwh" type="number" step="0.01" placeholder="25.5" min="0" />
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
