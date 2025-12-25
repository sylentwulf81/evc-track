"use client"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Wrench } from "lucide-react"
import { toast } from "sonner"
import { addVehicleExpense } from "@/app/actions"
import type { User } from "@supabase/supabase-js"
import type { VehicleExpense } from "@/lib/storage"

interface AddExpenseDialogProps {
  onAdd: (expense: Omit<VehicleExpense, "id" | "user_id">) => Promise<{ error?: string }>
  user: User | null
}

export function AddExpenseDialog({ onAdd, user }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [category, setCategory] = useState<string>("maintenance")
  const [description, setDescription] = useState("")
  const [odometer, setOdometer] = useState("")
  const [location, setLocation] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!title || !amount) {
        throw new Error("Please fill in all required fields")
      }

      const expenseData = {
        title,
        amount: Number.parseFloat(amount),
        expense_date: new Date(date).toISOString(),
        category: category as any,
        description: description || null,
        odometer: odometer ? Number.parseInt(odometer) : null,
        location: location || null,
      }

      let result
      if (user) {
        result = await addVehicleExpense(expenseData)
      } else {
        result = await onAdd(expenseData)
      }

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success("Expense added successfully")
      setOpen(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setAmount("")
    setDate(new Date().toISOString().split("T")[0])
    setCategory("maintenance")
    setDescription("")
    setOdometer("")
    setLocation("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-14 w-14 rounded-full shadow-lg p-0 bg-orange-500 hover:bg-orange-600">
          <Wrench className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Log a maintenance, repair, or other vehicle cost</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Oil Change, New Tires"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (¥)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="tax">Tax</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="odometer">Odometer (km) <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
            <Input
              id="odometer"
              type="number"
              placeholder="e.g. 15000"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location / Provider <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
            <Input
              id="location"
              placeholder="e.g. Tesla Service Center"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
            <Textarea
              id="description"
              placeholder="Additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
