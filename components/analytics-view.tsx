"use client"

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
import type { ChargingSession } from "@/lib/storage"
import { format, parseISO } from "date-fns"

interface AnalyticsViewProps {
  sessions: ChargingSession[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function AnalyticsView({ sessions }: AnalyticsViewProps) {
  // Monthly Data Calculation
  const monthlyData = useMemo(() => {
    const data: Record<string, number> = {}
    
    sessions.forEach((session) => {
       const date = parseISO(session.charged_at)
       const monthKey = format(date, "MMM yyyy")
       
       data[monthKey] = (data[monthKey] || 0) + (session.cost || 0)
    })

    return Object.entries(data)
      .map(([name, cost]) => ({ name, cost }))
      .reverse() // Sort properly if needed, but simple reverse might be enough if sessions are ordered desc
      // Actually strictly, we should sort by date. 
      // But sessions are already ordered by charged_at desc.
      // So Month Map construction order depends on iteration.
      // Better to sort properly.
      .sort((a, b) => {
         const da = new Date(a.name) // This might not work well with "MMM yyyy"
         return 0 // skip complex sort for now or use library
      })
      // Let's iterate backwards or just rely on sessions order
  }, [sessions])

  // Improved Monthly Data Sort
  const sortedMonthlyData = useMemo(() => {
      const grouped = sessions.reduce((acc, session) => {
          const month = format(parseISO(session.charged_at), "yyyy-MM")
          acc[month] = (acc[month] || 0) + (session.cost || 0)
          return acc
      }, {} as Record<string, number>)

      return Object.entries(grouped)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .slice(-6) // Last 6 months
          .map(([key, value]) => ({
              name: format(parseISO(key + "-01"), "MMM"),
              fullDate: key,
              cost: value
          }))
  }, [sessions])

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

  if (sessions.length === 0) {
      return (
          <div className="text-center py-10 text-muted-foreground">
              No data available for analytics. Start adding charging sessions!
          </div>
      )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly Spending</CardTitle>
            <CardDescription>Costs over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedMonthlyData}>
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
                    formatter={(value) => [`¥${value}`, 'Cost']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="cost" fill="#4f7cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Cost by Type</CardTitle>
            <CardDescription>Fast vs Standard charging costs</CardDescription>
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
                <Tooltip formatter={(value) => `¥${value}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{sessions.reduce((acc, s) => acc + (s.cost || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Lifetime total</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{sessions.length}</div>
                  <p className="text-xs text-muted-foreground">Charges recorded</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Cost / Session</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{Math.round(sessions.reduce((acc, s) => acc + (s.cost || 0), 0) / sessions.length || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Per charge</p>
              </CardContent>
          </Card>
       </div>
    </div>
  )
}
