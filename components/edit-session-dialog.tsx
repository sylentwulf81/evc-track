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
      cost: number
      start_percent: number
      end_percent: number
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
  const [cost, setCost] = useState(0)
  const [startPercent, setStartPercent] = useState(0)
  const [endPercent, setEndPercent] = useState(0)
  const [kwh, setKwh] = useState<string>("")
  const [chargeType, setChargeType] = useState<"fast" | "standard" | "">("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  // Update form when session changes
  useEffect(() => {
    if (session) {
      setCost(session.cost)
      setStartPercent(session.start_percent)
      setEndPercent(session.end_percent)
      setKwh(session.kwh?.toString() || "")
      setChargeType(session.charge_type || "")

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

    const result = await onSave(session.id, {
      cost,
      start_percent: startPercent,
      end_percent: endPercent,
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
    const result = await onDelete(session.id)
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Charging Session</DialogTitle>
            <DialogDescription>Update the details of this charging session</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cost">Cost (¥)</Label>
              <Input
                id="edit-cost"
                type="number"
                value={cost}
                onChange={(e) => setCost(Number.parseInt(e.target.value))}
                required
                min="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input id="edit-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-startPercent">Starting Charge (%)</Label>
              <Input
                id="edit-startPercent"
                type="number"
                value={startPercent}
                onChange={(e) => setStartPercent(Number.parseInt(e.target.value))}
                required
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endPercent">Ending Charge (%)</Label>
              <Input
                id="edit-endPercent"
                type="number"
                value={endPercent}
                onChange={(e) => setEndPercent(Number.parseInt(e.target.value))}
                required
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-kwh">
                Energy (kWh) <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="edit-kwh"
                type="number"
                step="0.01"
                value={kwh}
                onChange={(e) => setKwh(e.target.value)}
                placeholder="25.5"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-chargeType">
                Charge Type <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Select value={chargeType} onValueChange={(value) => setChargeType(value as "fast" | "standard")}>
                <SelectTrigger id="edit-chargeType">
                  <SelectValue placeholder="Select charge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast Charge</SelectItem>
                  <SelectItem value="standard">Standard Charge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="sm:mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
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
