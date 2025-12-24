"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Battery, Calendar, TrendingUp, Zap } from "lucide-react"

type ChargingSession = {
  id: string
  cost: number
  start_percent: number
  end_percent: number
  charged_at: string
  kwh?: number | null
  charge_type?: "fast" | "standard" | null
}

type MonthlyData = {
  month: string
  total: number
  sessions: ChargingSession[]
}

export function ChargingHistory({
  sessions,
  onSessionClick,
}: {
  sessions: ChargingSession[]
  onSessionClick?: (session: ChargingSession) => void
}) {
  const groupedByMonth = sessions.reduce(
    (acc, session) => {
      const date = new Date(session.charged_at)
      const monthKey = format(date, "yyyy-MM")

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: format(date, "MMMM yyyy"),
          total: 0,
          sessions: [],
        }
      }

      acc[monthKey].total += session.cost
      acc[monthKey].sessions.push(session)

      return acc
    },
    {} as Record<string, MonthlyData>,
  )

  const monthlyData = Object.values(groupedByMonth)
    .map((monthData) => ({
      ...monthData,
      sessions: monthData.sessions.sort((a, b) => new Date(b.charged_at).getTime() - new Date(a.charged_at).getTime()),
    }))
    .sort((a, b) => new Date(b.sessions[0].charged_at).getTime() - new Date(a.sessions[0].charged_at).getTime())

  const yearTotal = sessions.reduce((sum, s) => sum + s.cost, 0)
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20 shadow-lg shadow-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5" />
            </div>
            {currentYear} Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ¥{yearTotal.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{sessions.length} charging sessions</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Monthly History
        </h2>
        {monthlyData.map((month) => (
          <Card key={month.month} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{month.month}</CardTitle>
                <span className="text-xl font-bold text-primary">¥{month.total.toLocaleString()}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {month.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-card/50 border border-border/50 rounded-xl hover:bg-accent/5 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => onSessionClick?.(session)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Battery className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2 flex-wrap">
                          <span className="text-foreground">
                            {session.start_percent}% → {session.end_percent}%
                          </span>
                          {session.charge_type && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                                session.charge_type === "fast"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-200 dark:border-orange-900"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                              }`}
                            >
                              {session.charge_type === "fast" && <Zap className="h-3 w-3" />}
                              {session.charge_type === "fast" ? "Fast" : "Standard"}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(session.charged_at), "MMM d, h:mm a")}
                          </span>
                          {session.kwh && (
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {session.kwh} kWh
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-lg text-foreground ml-2">¥{session.cost.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
              <Battery className="h-12 w-12 opacity-50" />
            </div>
            <p className="text-lg font-medium mb-1">No charging sessions yet</p>
            <p className="text-sm">Tap the + button to add your first charge</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
