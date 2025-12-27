"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ChargingSession } from "@/lib/storage"
import { format } from "date-fns"
import { Calendar, Battery, Zap, Edit, X } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface SessionDetailsDialogProps {
  session: ChargingSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (session: ChargingSession) => void
}

export function SessionDetailsDialog({
  session,
  open,
  onOpenChange,
  onEdit,
}: SessionDetailsDialogProps) {
  const { t } = useLanguage()

  if (!session) return null

  // Helper to format currency
  const formatCost = (cost: number | null, currency?: string) => {
      if (cost === null) return '—'
      const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "¥"
      return `${symbol}${cost.toLocaleString()}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('tracker.sessionDetails') || "Session Details"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
            {/* Header Stats */}
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('forms.cost')}</span>
                    <span className="text-3xl font-bold text-primary">
                        {formatCost(session.cost, session.currency)}
                    </span>
                </div>
                 <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('forms.energy') || "Energy"}</span>
                     <span className="text-xl font-semibold flex items-center gap-1">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        {session.kwh ? `${session.kwh} kWh` : '—'}
                    </span>
                </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent/10 rounded-full text-accent-foreground">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">{t('forms.dateTime') || "Date & Time"}</div>
                        <div className="font-medium">
                            {format(new Date(session.charged_at), "PPP p")}
                        </div>
                    </div>
                </div>
                
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400">
                        <Battery className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-muted-foreground">{t('forms.chargingProgress') || "Charging Progress"}</div>
                        <div className="font-medium flex items-center gap-2">
                            <span>{session.start_percent}% → {session.end_percent !== null ? `${session.end_percent}%` : '...'}</span>
                            {session.end_percent !== null && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                                    +{session.end_percent - session.start_percent}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-yellow-500/10 rounded-full text-yellow-600 dark:text-yellow-400">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">{t('tracker.chargeType')}</div>
                        <div className="font-medium capitalize">
                            {session.charge_type ? t(`tracker.${session.charge_type}`) : '—'}
                        </div>
                    </div>
                </div>
            
                {session.odometer && (
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-500/10 rounded-full text-purple-600 dark:text-purple-400">
                             <span className="font-bold text-xs">KM</span>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">{t('forms.odometer')}</div>
                            <div className="font-medium">
                                {session.odometer.toLocaleString()} km
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-2">
                <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => onOpenChange(false)}
                >
                    {t('common.close')}
                </Button>
                 <Button 
                    className="flex-1 gap-2" 
                    onClick={() => {
                        onOpenChange(false)
                        onEdit(session)
                    }}
                >
                    <Edit className="h-4 w-4" />
                    {t('tracker.editSession')}
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
