import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChargingSession, VehicleExpense } from "@/lib/storage"
import { format, parseISO, startOfMonth, subMonths } from "date-fns"
import { useLanguage } from "@/contexts/LanguageContext"
import { ROICalculator } from "@/components/roi-calculator"

interface AnalyticsViewProps {
  sessions: ChargingSession[]
  expenses?: VehicleExpense[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]
const EXPENSE_COLORS = ["#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#a4de6c"]

export function AnalyticsView({ sessions, expenses = [] }: AnalyticsViewProps) {
  const { t } = useLanguage()

  // Helpers
  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "¥"
    return `${symbol}${amount.toLocaleString()}`
  }
  
  // Note for Charting: Recharts doesn't handle mixed currencies well. 
  // We will normalize everything to JPY for the chart height visualization if multiple exist, 
  // OR just assume single currency for charts for now but label correctly if consistent.
  // Actually, simplest approach for V1 multi-currency is:
  // Charts just show raw numbers (mixed). 
  // Tooltips show formatted value based on the dominant currency or just a generic symbol?
  // Let's improve the total cards to show mixed sums.

  // Helper to sum by currency
  const sumByCurrency = (items: { amount: number, currency: string }[]) => {
      return items.reduce((acc, item) => {
          const curr = item.currency || "JPY"
          acc[curr] = (acc[curr] || 0) + item.amount
          return acc
      }, {} as Record<string, number>)
  }
  
  const chargingTotals = sumByCurrency(sessions.map(s => ({ amount: s.cost || 0, currency: s.currency || "JPY" })))
  const expenseTotals = sumByCurrency(expenses.map(e => ({ amount: e.amount, currency: e.currency || "JPY" })))

  const grandTotals: Record<string, number> = {}
  Object.keys(chargingTotals).forEach(k => grandTotals[k] = (grandTotals[k] || 0) + chargingTotals[k])
  Object.keys(expenseTotals).forEach(k => grandTotals[k] = (grandTotals[k] || 0) + expenseTotals[k])

  const formatTotalString = (totals: Record<string, number>) => {
      const parts = Object.entries(totals).map(([curr, amt]) => formatCurrency(amt, curr))
      return parts.join(" + ") || "¥0"
  }

  // Monthly Data Calculation
  const monthlyData = useMemo(() => {
    const data: Record<string, { charging: number; expenses: number; total: number }> = {}
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
        const d = subMonths(new Date(), i)
        const key = format(d, "MMM yyyy")
        data[key] = { charging: 0, expenses: 0, total: 0 }
    }

    sessions.forEach((session) => {
       const date = parseISO(session.charged_at)
       const monthKey = format(date, "MMM yyyy")
       if (data[monthKey]) {
          data[monthKey].charging += (session.cost || 0)
          data[monthKey].total += (session.cost || 0)
       }
    })

    expenses.forEach((expense) => {
        const date = parseISO(expense.expense_date)
        const monthKey = format(date, "MMM yyyy")
        if (data[monthKey]) {
            data[monthKey].expenses += expense.amount
            data[monthKey].total += expense.amount
        }
    })

    return Object.entries(data)
      .map(([name, values]) => ({ name, ...values }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
  }, [sessions, expenses])

  // Home vs External Charging
  const homeVsExternalData = useMemo(() => {
    let homeTotal = 0
    let externalTotal = 0

    sessions.forEach(s => {
        const cost = s.cost || 0
        // Use is_home if available, otherwise infer from charge_type (level1/level2 are typically home)
        const isHome = s.is_home ?? (s.charge_type === "level1" || s.charge_type === "level2")
        if (isHome) {
          homeTotal += cost
        } else {
          externalTotal += cost
        }
    })

    const data = []
    if (homeTotal > 0) data.push({ name: t('analytics.home') || "Home", value: homeTotal })
    if (externalTotal > 0) data.push({ name: t('analytics.external') || "External", value: externalTotal })

    return data
  }, [sessions, t])
  
  // Expenses Breakdown
  const expensesBreakdown = useMemo(() => {
      const data: Record<string, number> = {}
      expenses.forEach(e => {
          data[e.category] = (data[e.category] || 0) + e.amount
      })
      return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [expenses])


  if (sessions.length === 0 && expenses.length === 0) {
      return (
          <div className="text-center py-10 text-muted-foreground">
              {t('analytics.noData')}
          </div>
      )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('history.chargingHistory')}</CardTitle>
            <CardDescription>{t('analytics.monthlySpending')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: number) => [`${value.toLocaleString()}`, t('forms.cost')]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="charging" name={t('nav.charging')} fill="#4f7cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('history.expenseHistory')}</CardTitle>
            <CardDescription>{t('analytics.monthlySpending')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: number) => [`${value.toLocaleString()}`, t('forms.cost')]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="expenses" name={t('nav.expenses')} fill="#ff8042" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('analytics.chargingCosts')}</CardTitle>
            <CardDescription>{t('analytics.homeVsExternal') || "Home vs External Charging"}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {homeVsExternalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={homeVsExternalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {homeVsExternalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {t('analytics.noChargingData') || "No charging data"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('analytics.vehicleExpenses')}</CardTitle>
            <CardDescription>{t('analytics.byCategory')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {expenses.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={expensesBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {expensesBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    {t('analytics.noExpenseData')}
                </div>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t('analytics.grandTotal')}</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTotalString(grandTotals)}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('analytics.chargingPlusExpenses')}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t('analytics.chargingTotal')}</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{formatTotalString(chargingTotals)}</div>
                  <p className="text-xs text-muted-foreground">{sessions.length} {t('common.sessions') || 'sessions'}</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t('analytics.expensesTotal')}</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTotalString(expenseTotals)}
                  </div>
                  <p className="text-xs text-muted-foreground">{expenses.length} {t('common.records') || 'records'}</p>
              </CardContent>
          </Card>
       </div>

      {/* ROI Calculator */}
      <ROICalculator sessions={sessions} />
    </div>
  )
}
