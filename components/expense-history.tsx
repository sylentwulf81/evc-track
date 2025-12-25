"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Wrench, Calendar, FileText, AlertTriangle, Shield, Archive, MapPin } from "lucide-react"
import type { VehicleExpense } from "@/lib/storage"

type MonthlyData = {
  month: string
  total: number
  expenses: VehicleExpense[]
}

import { useLanguage } from "@/contexts/LanguageContext"

export function ExpenseHistory({ expenses }: { expenses: VehicleExpense[] }) {
  const { t } = useLanguage()
  const groupedByMonth = expenses.reduce(
    (acc, expense) => {
      const date = new Date(expense.expense_date)
      const monthKey = format(date, "yyyy-MM")

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: format(date, "MMMM yyyy"),
          total: 0,
          expenses: [],
        }
      }

      acc[monthKey].total += expense.amount
      acc[monthKey].expenses.push(expense)

      return acc
    },
    {} as Record<string, MonthlyData>,
  )

  const monthlyData = Object.values(groupedByMonth)
    .map((monthData) => ({
      ...monthData,
      expenses: monthData.expenses.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()),
    }))
    .sort((a, b) => new Date(b.expenses[0].expense_date).getTime() - new Date(a.expenses[0].expense_date).getTime())

  // Calculate year totals by currency
  const yearTotals = expenses.reduce((acc, e) => {
      const currency = e.currency || "JPY"
      acc[currency] = (acc[currency] || 0) + e.amount
      return acc
  }, {} as Record<string, number>)
  
  const currentYear = new Date().getFullYear()

  const formatCurrency = (amount: number, currency: string) => {
      const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "¥"
      return `${symbol}${amount.toLocaleString()}`
  }

  // Format year total string
  const totalString = Object.entries(yearTotals)
      .map(([curr, amount]) => formatCurrency(amount, curr))
      .join(" + ") || "¥0"

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "repair":
        return <AlertTriangle className="h-4 w-4" />
      case "insurance":
        return <Shield className="h-4 w-4" />
      case "tax":
        return <FileText className="h-4 w-4" />
      default:
        return <Archive className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "maintenance":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900"
      case "repair":
        return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900"
      case "insurance":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-900"
      case "tax":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400 border-gray-200 dark:border-gray-900"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background border-orange-500/20 shadow-lg shadow-orange-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Wrench className="h-5 w-5" />
            </div>
            {currentYear} {t('history.total')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            {totalString}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{expenses.length} records</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {monthlyData.map((month) => {
            // Calculate monthly total per currency
           const monthTotals = month.expenses.reduce((acc, e) => {
                const currency = e.currency || "JPY"
                acc[currency] = (acc[currency] || 0) + e.amount
                return acc
            }, {} as Record<string, number>)
            
            const monthTotalString = Object.entries(monthTotals)
                .map(([curr, amount]) => formatCurrency(amount, curr))
                .join(" + ")

            return (
              <Card key={month.month} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">{month.month}</CardTitle>
                    <span className="text-sm sm:text-lg font-bold text-muted-foreground">{monthTotalString}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {month.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 bg-card/50 border border-border/50 rounded-xl hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          <div className={`p-2 rounded-lg border ${getCategoryColor(expense.category)} bg-opacity-20`}>
                            {getCategoryIcon(expense.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{expense.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(expense.expense_date), "MMM d")}
                              </span>
                              {expense.odometer && (
                                <span className="flex items-center gap-1">
                                    <span className="text-xs">Dashboard:</span> {expense.odometer.toLocaleString()} km
                                </span>
                              )}
                              {expense.location && (
                                <span className="flex items-center gap-1 truncate max-w-[120px]">
                                    <MapPin className="h-3 w-3" />
                                    {expense.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-lg text-foreground ml-2 whitespace-nowrap">
                            {formatCurrency(expense.amount, expense.currency || "JPY")}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
        })}
      </div>

       {expenses.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
              <Wrench className="h-12 w-12 opacity-50" />
            </div>
            <p className="text-lg font-medium mb-1">No expenses recorded</p>
            <p className="text-sm">Log maintenance, repairs, or other costs here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
