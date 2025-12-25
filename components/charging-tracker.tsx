"use client"

import { useState, useEffect, useCallback } from "react"
import { Zap, LogOut, LogIn, Cloud, CloudOff, Settings, BarChart3, List, Menu, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChargingHistory } from "@/components/charging-history"
import { AnalyticsView } from "@/components/analytics-view"
import { AddChargeDialog } from "@/components/add-charge-dialog"
import { EditSessionDialog } from "@/components/edit-session-dialog"
import { SessionDetailsDialog } from "@/components/session-details-dialog"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { ExpenseHistory } from "@/components/expense-history"
import {
  getLocalSessions,
  addLocalSession,
  updateLocalSession,
  deleteLocalSession,
  getLocalExpenses,
  addLocalExpense,
  type ChargingSession,
  type VehicleExpense,
} from "@/lib/storage"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"

export function ChargingTracker() {
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<ChargingSession[]>([])
  const [expenses, setExpenses] = useState<VehicleExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<ChargingSession | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"charging" | "expenses" | "analytics">("charging")
  const supabase = createClient()

  const loadData = useCallback(async () => {
    if (user) {
      // Load from Supabase for authenticated users
      const { data: sessionData } = await supabase.from("charging_sessions").select("*").order("charged_at", { ascending: false })
      setSessions(sessionData || [])

      const { data: expenseData } = await supabase.from("vehicle_expenses").select("*").order("expense_date", { ascending: false })
      setExpenses(expenseData || [])
    } else {
      // Load from localStorage for guests
      setSessions(getLocalSessions())
      setExpenses(getLocalExpenses())
    }
  }, [user, supabase])

  useEffect(() => {
    // Check auth state
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!loading) {
      loadData()
    }
  }, [loading, user, loadData])

  const handleAddSession = async (data: {
    cost: number | null
    startPercent: number
    endPercent: number | null
    kwh?: number | null
    chargeType?: "fast" | "standard" | null
  }) => {
    if (user) {
      // Save to Supabase
      const { error } = await supabase.from("charging_sessions").insert({
        cost: data.cost,
        start_percent: data.startPercent,
        end_percent: data.endPercent,
        kwh: data.kwh || null,
        charge_type: data.chargeType || null,
        user_id: user.id,
      })
      if (!error) {
        loadData()
      }
      return { error: error?.message }
    } else {
      // Save to localStorage
      addLocalSession({
        cost: data.cost,
        start_percent: data.startPercent,
        end_percent: data.endPercent,
        kwh: data.kwh || null,
        charge_type: data.chargeType || null,
      })
      loadData()
      return {}
    }
  }
  
  const handleEditSession = async (
    id: string,
    updates: {
      cost: number | null
      start_percent: number
      end_percent: number | null
      kwh?: number | null
      charge_type?: "fast" | "standard" | null
      charged_at: string
    },
  ) => {
    if (user) {
      // Update in Supabase
      const { error } = await supabase.from("charging_sessions").update(updates).eq("id", id)

      if (!error) {
        loadData()
      }
      return { error: error?.message }
    } else {
      // Update in localStorage
      updateLocalSession(id, updates)
      loadData()
      return {}
    }
  }

  const handleDeleteSession = async (id: string) => {
    if (user) {
      // Delete from Supabase
      const { error } = await supabase.from("charging_sessions").delete().eq("id", id)

      if (!error) {
        loadData()
      }
      return { error: error?.message }
    } else {
      // Delete from localStorage
      deleteLocalSession(id)
      loadData()
      return {}
    }
  }

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  
  const handleSessionClick = (session: ChargingSession) => {
    setSelectedSession(session)
    setDetailsDialogOpen(true)
  }

  const handleEditClick = (session: ChargingSession) => {
    setDetailsDialogOpen(false)
    setEditDialogOpen(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSessions(getLocalSessions())
    setExpenses(getLocalExpenses())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Zap className="h-8 w-8 animate-pulse text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Zap className="h-7 w-7 text-primary drop-shadow-[0_0_8px_rgba(79,124,255,0.5)]" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  EVC Track
                </h1>
                <p className="text-xs text-muted-foreground">Track your costs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant={viewMode === "charging" ? "secondary" : "ghost"} 
                  size="sm"
                  onClick={() => setViewMode("charging")}
                >
                    Charges
                </Button>
                <Button 
                  variant={viewMode === "expenses" ? "secondary" : "ghost"} 
                  size="sm"
                  onClick={() => setViewMode("expenses")}
                >
                    Expenses
                </Button>
                 <Button 
                  variant={viewMode === "analytics" ? "secondary" : "ghost"} 
                  size="icon" 
                  onClick={() => setViewMode("analytics")}
                  title="Analytics"
                >
                    <BarChart3 className="h-5 w-5" />
                </Button>
                <Link href="/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
                {user ? (
                  <>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Cloud className="h-3 w-3" />
                      Synced
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CloudOff className="h-3 w-3" />
                      Local
                    </span>
                    <Link href="/auth/login">
                      <Button variant="outline" size="sm">
                        <LogIn className="h-4 w-4 mr-1" />
                        Sync
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Actions */}
              <div className="md:hidden flex items-center gap-2">
                 {(user) && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                      <Cloud className="h-3 w-3" />
                      Synced
                    </span>
                 )}
                 {(!user) && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
                      <CloudOff className="h-3 w-3" />
                      Local
                    </span>
                 )}

                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => setViewMode("charging")}>
                        <Zap className="mr-2 h-4 w-4" />
                        Charging History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode("expenses")}>
                        <Wrench className="mr-2 h-4 w-4" />
                        Expenses
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode("analytics")}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </DropdownMenuItem>
                      <Link href="/settings" className="w-full">
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      {user ? (
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </DropdownMenuItem>
                      ) : (
                        <Link href="/auth/login" className="w-full">
                          <DropdownMenuItem>
                            <LogIn className="mr-2 h-4 w-4" />
                            Sync / Login
                          </DropdownMenuItem>
                        </Link>
                      )}
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 pb-24">
        {viewMode === "analytics" ? (
            <AnalyticsView sessions={sessions} expenses={expenses} />
        ) : viewMode === "expenses" ? (
             <ExpenseHistory expenses={expenses} />
        ) : (
            <ChargingHistory sessions={sessions} onSessionClick={handleSessionClick} />
        )}
      </main>
      
      {viewMode === "charging" && <AddChargeDialog onAdd={handleAddSession} user={user} />}
      {viewMode === "expenses" && (
            <div className="fixed bottom-6 right-6 z-50">
                <AddExpenseDialog onAdd={async (data) => {
                    if (user) {
                        const { error } = await supabase.from("vehicle_expenses").insert({
                            ...data,
                            user_id: user.id
                        })
                        if (!error) loadData()
                        return { error: error?.message }
                    } else {
                        addLocalExpense(data)
                        loadData()
                        return {}
                    }
                }} user={user} />
            </div>
      )}
      
      <SessionDetailsDialog
        session={selectedSession}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onEdit={handleEditClick}
      />

      <EditSessionDialog
        session={selectedSession}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleEditSession}
        onDelete={handleDeleteSession}
      />
    </div>
  )
}
