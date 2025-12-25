"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import type { ChargingSession } from "@/lib/storage"

interface EditSessionDialogProps {
  session: ChargingSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (
    id: string,
    updates: {
      cost: number | null
      start_percent: number
      end_percent: number | null
      kwh?: number | null
      charge_type?: "fast" | "standard" | null
      charged_at: string
    },
  ) => Promise<{ error?: string }>
  onDelete: (id: string) => Promise<{ error?: string }>
}

export function EditSessionDialog({ session, open, onOpenChange, onSave, onDelete }: EditSessionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Form state
  const [cost, setCost] = useState("")
  const [startPercent, setStartPercent] = useState("")
  const [endPercent, setEndPercent] = useState("")
  const [kwh, setKwh] = useState<string>("")
  const [chargeType, setChargeType] = useState<"fast" | "standard" | null>(null)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  // Update form when session changes
  useEffect(() => {
    if (session) {
      setCost(session.cost !== null ? session.cost.toString() : "")
      setStartPercent(session.start_percent.toString())
      setEndPercent(session.end_percent !== null ? session.end_percent.toString() : "")
      setKwh(session.kwh?.toString() || "")
      setChargeType(session.charge_type || null)

      const chargedDate = new Date(session.charged_at)
      setDate(format(chargedDate, "yyyy-MM-dd"))
      setTime(format(chargedDate, "HH:mm"))
    }
  }, [session])

  if (!session) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Combine date and time into ISO string
    const chargedAt = new Date(`${date}T${time}`).toISOString()

    const result = await onSave(session!.id, {
      cost: cost ? Number.parseFloat(cost) : null,
      start_percent: Number.parseFloat(startPercent),
      end_percent: endPercent ? Number.parseFloat(endPercent) : null,
      kwh: kwh ? Number.parseFloat(kwh) : null,
      charge_type: chargeType || null,
      charged_at: chargedAt,
    })

    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      onOpenChange(false)
    }
  }

  async function handleDelete() {
    setIsLoading(true)
    const result = await onDelete(session!.id)
    setIsLoading(false)

    if (result.error) {
      setError(result.error)
      setShowDeleteDialog(false)
    } else {
      setShowDeleteDialog(false)
      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Charging Session</DialogTitle>
            <DialogDescription>Update the details of this charging session</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-6 py-4">
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input id="edit-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="h-11" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="edit-startPercent">Start %</Label>
                <Input
                    id="edit-startPercent"
                    type="number"
                    value={startPercent}
                    onChange={(e) => setStartPercent(e.target.value)}
                    required
                    min="0"
                    max="100"
                    className="h-11"
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="edit-endPercent">End %</Label>
                <Input
                    id="edit-endPercent"
                    type="number"
                    value={endPercent}
                    onChange={(e) => setEndPercent(e.target.value)}
                    min="0"
                    max="100"
                    placeholder="Optional"
                    className="h-11"
                />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cost">Cost (¥)</Label>
              <Input
                id="edit-cost"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min="0"
                placeholder="Optional"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-kwh">
                Energy (kWh) <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="edit-kwh"
                type="number"
                step="0.01"
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
                placeholder="25.5"
                min="0"
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-chargeType">
                Charge Type <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </Label>
              <Select value={chargeType || ""} onValueChange={(value: "fast" | "standard") => setChargeType(value)}>
                <SelectTrigger id="edit-chargeType" className="h-11">
                  <SelectValue placeholder="Select charge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast Charge</SelectItem>
                  <SelectItem value="standard">Standard Charge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {error && <p className="text-sm text-destructive">{error}</p>}
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4">
                 <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto mt-2 sm:mt-0"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Session
                </Button>

               <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 flex-1 sm:flex-none">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="h-11 flex-1 sm:flex-none min-w-[120px]">
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
               </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete charging session?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this charging session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
