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

interface AnalyticsViewProps {
  sessions: ChargingSession[]
  expenses?: VehicleExpense[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]
const EXPENSE_COLORS = ["#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#a4de6c"]

export function AnalyticsView({ sessions, expenses = [] }: AnalyticsViewProps) {
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

  // Charge Type Distribution
  const typeData = useMemo(() => {
    const data = [
        { name: "Fast", value: 0 },
        { name: "Standard", value: 0 },
        { name: "Other", value: 0 }
    ]

    sessions.forEach(s => {
        const cost = s.cost || 0
        if (s.charge_type === "fast") data[0].value += cost
        else if (s.charge_type === "standard") data[1].value += cost
        else data[2].value += cost
    })

    return data.filter(d => d.value > 0)
  }, [sessions])
  
  // Expenses Breakdown
  const expensesBreakdown = useMemo(() => {
      const data: Record<string, number> = {}
      expenses.forEach(e => {
          data[e.category] = (data[e.category] || 0) + e.amount
      })
      return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [expenses])

  const totalChargingCost = sessions.reduce((acc, s) => acc + (s.cost || 0), 0)
  const totalExpensesCost = expenses.reduce((acc, e) => acc + e.amount, 0)
  const grandTotal = totalChargingCost + totalExpensesCost

  if (sessions.length === 0 && expenses.length === 0) {
      return (
          <div className="text-center py-10 text-muted-foreground">
              No data available for analytics. Start adding charging sessions or expenses!
          </div>
      )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Total Monthly Spending</CardTitle>
            <CardDescription>Combined charging and maintenance costs</CardDescription>
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
                    tickFormatter={(value) => `¥${value}`} 
                />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, 'Cost']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="charging" name="Charging" stackId="a" fill="#4f7cff" radius={[0, 0, 4, 4]} />
                <Bar dataKey="expenses" name="Expenses" stackId="a" fill="#ff8042" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Charging Costs</CardTitle>
            <CardDescription>By Charge Type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Vehicle Expenses</CardTitle>
            <CardDescription>By Category</CardDescription>
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
                    <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    No expense data
                </div>
            )}
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Grand Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{grandTotal.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Charging + Expenses</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Charging Total</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">¥{totalChargingCost.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{sessions.length} sessions</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Expenses Total</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{totalExpensesCost.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">{expenses.length} records</p>
              </CardContent>
          </Card>
       </div>
    </div>
  )
}
