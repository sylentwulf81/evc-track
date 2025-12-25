"use client"

import { useState, useEffect, useCallback } from "react"
import { Zap, LogOut, LogIn, Settings, BarChart3, Menu, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import { useLanguage } from "@/contexts/LanguageContext"

export function ChargingTracker() {
  const { t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<ChargingSession[]>([])
  const [expenses, setExpenses] = useState<VehicleExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<ChargingSession | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("tracker")
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

  const handleAddExpense = async (data: Omit<VehicleExpense, "id" | "user_id">) => {
      if (user) {
          const { error } = await supabase.from("vehicle_expenses").insert({
              ...data,
              user_id: user.id
          })
          if (!error) {
              loadData()
          }
          return { error: error?.message }
      } else {
          addLocalExpense(data as VehicleExpense) 
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

  const handleSessionClick = (session: ChargingSession) => {
    setSelectedSession(session)
    setDetailsDialogOpen(true)
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
    <div className="min-h-screen bg-background pb-20 md:pb-6 relative overflow-x-hidden">
       {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-3 mx-auto max-w-md flex items-center justify-between">
           <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary filled" />
            <h1 className="text-xl font-bold tracking-tight">EVC Track</h1>
          </div>
          
          <div className="flex items-center gap-2">
             <Link href="/settings">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
             {user ? (
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
                  <LogOut className="h-5 w-5" />
                </Button>
              ) : (
                 <Link href="/login">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <LogIn className="h-5 w-5" />
                  </Button>
                </Link>
              )}
          </div>
        </div>
      </header>

      <main className="container max-w-md mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Tabs defaultValue="tracker" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-muted/50 backdrop-blur-sm rounded-xl">
            <TabsTrigger value="tracker" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
              {t('nav.charging')}
            </TabsTrigger>
            <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
              {t('nav.expenses')}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
              {t('nav.analytics')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracker" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
             <div className="flex items-center justify-between">
                 <h2 className="text-lg font-semibold tracking-tight">{t('history.chargingHistory')}</h2>
                 <div className="hidden md:block">
                    <AddChargeDialog 
                        onAdd={handleAddSession} 
                        user={user} 
                        trigger={
                             <Button size="sm" className="gap-1">
                                <Plus className="h-4 w-4" />
                                {t('tracker.addCharge')}
                             </Button>
                        } 
                    />
                 </div>
             </div>
             <ChargingHistory 
                sessions={sessions} 
                onSessionClick={handleSessionClick} 
             />
             <div className="md:hidden">
                <AddChargeDialog 
                    onAdd={handleAddSession} 
                    user={user} 
                    // No trigger prop uses default FAB styling if we restore it, BUT 
                    // we removed fixed positioning from default in AddChargeDialog.
                    // So we must pass a FAB trigger here explicitly or restore fixed in default?
                    // Let's pass a FAB trigger explicitly for mobile.
                    trigger={
                        <Button className="rounded-full h-14 w-14 shadow-lg fixed bottom-6 right-6 z-50 p-0 hover:scale-105 transition-transform">
                             <Plus className="h-8 w-8" />
                        </Button>
                    }
                />
             </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
             <div className="flex items-center justify-between">
                 <h2 className="text-lg font-semibold tracking-tight">{t('history.expenseHistory')}</h2>
                  <div className="hidden md:block">
                     <AddExpenseDialog 
                        onAdd={handleAddExpense} 
                        user={user} 
                         trigger={
                             <Button size="sm" className="gap-1 bg-orange-500 hover:bg-orange-600">
                                <Wrench className="h-4 w-4" />
                                {t('tracker.addExpense')}
                             </Button>
                        } 
                     />
                 </div>
             </div>
             <ExpenseHistory expenses={expenses} />
              <div className="md:hidden">
                <AddExpenseDialog 
                    onAdd={handleAddExpense} 
                    user={user} 
                    trigger={
                        <Button className="h-14 w-14 rounded-full shadow-lg fixed bottom-6 right-6 z-50 p-0 bg-orange-500 hover:bg-orange-600 transition-transform hover:scale-105">
                            <Wrench className="h-6 w-6" />
                        </Button>
                    }
                />
             </div>
          </TabsContent>

          <TabsContent value="analytics" className="focus-visible:outline-none focus-visible:ring-0">
            <AnalyticsView sessions={sessions} expenses={expenses} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <SessionDetailsDialog 
        session={selectedSession} 
        open={detailsDialogOpen} 
        onOpenChange={setDetailsDialogOpen}
        onEdit={(session) => {
            setSelectedSession(session)
            setDetailsDialogOpen(false)
            setEditDialogOpen(true)
        }}
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
