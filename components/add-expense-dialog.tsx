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
import { useLanguage } from "@/contexts/LanguageContext"

interface AddExpenseDialogProps {
  onAdd: (expense: Omit<VehicleExpense, "id" | "user_id">) => Promise<{ error?: string }>
  user: User | null
  trigger?: React.ReactNode
}

export function AddExpenseDialog({ onAdd, user, trigger }: AddExpenseDialogProps) {
  const { t } = useLanguage()
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
        throw new Error(t('common.error') || "Please fill in all required fields")
      }

      const expenseData = {
        title,
        amount: Number.parseFloat(amount),
        expense_date: new Date(date).toISOString(),
        category: category as any,
        description: description || null,
        odometer: odometer ? Number.parseInt(odometer) : null,
        location: location || null,
        currency: "JPY", // Default currency
      }

      // Always use onAdd, let parent handle storage logic (local vs remote)
      const result = await onAdd(expenseData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success(t('tracker.expenseAdded') || "Expense added successfully")
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
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) resetForm()
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-14 w-14 rounded-full shadow-lg p-0 bg-orange-500 hover:bg-orange-600">
            <Wrench className="h-6 w-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('tracker.addExpense')}</DialogTitle>
          <DialogDescription>{t('tracker.enterExpenseDetails') || "Log a maintenance, repair, or other vehicle cost"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('forms.title')}</Label>
            <Input
              id="title"
              placeholder={t('forms.titlePlaceholder') || "e.g. Oil Change, New Tires"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('forms.amount')} (¥)</Label>
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
              <Label htmlFor="date">{t('forms.date')}</Label>
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
            <Label htmlFor="category">{t('forms.category')}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maintenance">{t('forms.maintenance')}</SelectItem>
                <SelectItem value="repair">{t('forms.repair')}</SelectItem>
                <SelectItem value="insurance">{t('forms.insurance')}</SelectItem>
                <SelectItem value="tax">{t('forms.tax')}</SelectItem>
                <SelectItem value="other">{t('forms.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="odometer">{t('forms.odometer')} <span className="text-muted-foreground text-xs font-normal">({t('common.optional')})</span></Label>
            <Input
              id="odometer"
              type="number"
              placeholder="e.g. 15000"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('forms.location')} <span className="text-muted-foreground text-xs font-normal">({t('common.optional')})</span></Label>
            <Input
              id="location"
              placeholder="e.g. Tesla Service Center"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('forms.notes')} <span className="text-muted-foreground text-xs font-normal">({t('common.optional')})</span></Label>
            <Textarea
              id="description"
              placeholder={t('forms.notesPlaceholder') || "Additional details..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('tracker.addExpense')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
