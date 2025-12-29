"use client"

import { useState, useEffect, useMemo } from "react"
import { Zap, LogOut, LogIn, Settings, BarChart3, Menu, Wrench, Plus, User as UserIcon, Play, Square } from "lucide-react"
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
import { SettingsView } from "@/components/settings-view"
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
import { useSearchParams, useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ActiveSessionTimer } from "@/components/active-session-timer"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"

export function ChargingTracker() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<ChargingSession[]>([])
  const [expenses, setExpenses] = useState<VehicleExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<ChargingSession | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("tracker")
  const supabase = useMemo(() => createClient(), [])

  // Active Session State
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null)
  const [startSessionDialogOpen, setStartSessionDialogOpen] = useState(false) // Re-using AddDialog for "Complete"

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["tracker", "expenses", "analytics", "settings"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.replace(`?${params.toString()}`)
  }

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

  // Load data when user or loading state changes
  useEffect(() => {
    if (loading) return

    const loadData = async () => {
      if (user) {
        // Load from Supabase for authenticated users
        const { data: sessionData } = await supabase
          .from("charging_sessions")
          .select("*")
          .order("charged_at", { ascending: false })

        // Split active vs completed
        const active = sessionData?.find((s: any) => s.status === 'active') || null
        const history = sessionData?.filter((s: any) => s.status !== 'active') || []

        setActiveSession(active)
        setSessions(history)

        const { data: expenseData } = await supabase.from("vehicle_expenses").select("*").order("expense_date", { ascending: false })
        setExpenses(expenseData || [])
      } else {
        // Load from localStorage for guests
        const allSessions = getLocalSessions()
        setActiveSession(allSessions.find(s => s.status === 'active') || null)
        setSessions(allSessions.filter(s => s.status !== 'active'))

        setExpenses(getLocalExpenses())
      }
    }

    loadData()
  }, [loading, user, supabase])

  const handleStartSession = async () => {
    const newSessionPart = {
      start_percent: 0, // Placeholder, can be updated later if we want a "Start Dialog"
      charged_at: new Date().toISOString(),
      status: 'active' as const,
      session_start: new Date().toISOString(),
      cost: null,
      end_percent: null
    }

    if (user) {
      const { data, error } = await supabase.from("charging_sessions").insert({
        ...newSessionPart,
        user_id: user.id
      }).select().single()

      if (!error && data) {
        setActiveSession(data)
      }
    } else {
      // Local Storage
      const newSession = addLocalSession({
        ...newSessionPart,
        // @ts-ignore - addLocalSession handles defaults
        status: 'active'
      })
      setActiveSession(newSession)
    }
  }

  const handleCompleteSession = async (data: {
    cost: number | null
    startPercent: number
    endPercent: number | null
    kwh?: number | null
    chargeType?: ChargingSession["charge_type"]
    odometer?: number | null
  }) => {
    if (!activeSession) return { error: "No active session" }

    const updates = {
      cost: data.cost,
      start_percent: data.startPercent,
      end_percent: data.endPercent,
      kwh: data.kwh,
      charge_type: data.chargeType,
      status: 'completed' as const,
      // usage of session_start as the official date for "charged_at" when completed? 
      // Or keep charged_at as creation time? usually charged_at is fine.
      // Let's keep charged_at as the "date" of the session.
    }

    if (user) {
      // Save to Supabase
      const { error } = await supabase.from("charging_sessions").update(updates).eq('id', activeSession.id)

      if (!error) {
        // Reload data
        setActiveSession(null)
        // Refresh list
        const { data: sessionData } = await supabase.from("charging_sessions").select("*").neq('status', 'active').order("charged_at", { ascending: false })
        setSessions(sessionData || [])
      }
      return { error: error?.message }
    } else {
      // Save to localStorage
      updateLocalSession(activeSession.id, updates)
      setActiveSession(null)
      setSessions(getLocalSessions().filter(s => s.status !== 'active'))
      return {}
    }
  }


  const handleAddSession = async (data: {
    cost: number | null
    startPercent: number
    endPercent: number | null
    kwh?: number | null
    chargeType?: ChargingSession["charge_type"]
  }) => {
    // ... existing handleAddSession logic (for manual add)
    if (user) {
      // Save to Supabase
      const { error } = await supabase.from("charging_sessions").insert({
        cost: data.cost,
        start_percent: data.startPercent,
        end_percent: data.endPercent,
        kwh: data.kwh || null,
        charge_type: data.chargeType || null,
        user_id: user.id,
        status: 'completed'
      })
      if (!error) {
        // Reload data
        const { data: sessionData } = await supabase.from("charging_sessions").select("*").neq('status', 'active').order("charged_at", { ascending: false })
        setSessions(sessionData || [])
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
        status: 'completed'
      })
      setSessions(getLocalSessions().filter(s => s.status !== 'active'))
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
        // Reload data
        const { data: expenseData } = await supabase.from("vehicle_expenses").select("*").order("expense_date", { ascending: false })
        setExpenses(expenseData || [])
      }
      return { error: error?.message }
    } else {
      addLocalExpense(data as VehicleExpense)
      setExpenses(getLocalExpenses())
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
      charge_type?: ChargingSession["charge_type"]
      charged_at: string
    },
  ) => {
    if (user) {
      // Update in Supabase
      const { error } = await supabase.from("charging_sessions").update(updates).eq("id", id)

      if (!error) {
        // Reload data
        const { data: sessionData } = await supabase.from("charging_sessions").select("*").order("charged_at", { ascending: false })
        setSessions(sessionData || [])
      }
      return { error: error?.message }
    } else {
      // Update in localStorage
      updateLocalSession(id, updates)
      setSessions(getLocalSessions())
      return {}
    }
  }

  const handleDeleteSession = async (id: string) => {
    if (user) {
      // Delete from Supabase
      const { error } = await supabase.from("charging_sessions").delete().eq("id", id)

      if (!error) {
        // Reload data
        const { data: sessionData } = await supabase.from("charging_sessions").select("*").order("charged_at", { ascending: false })
        setSessions(sessionData || [])
      }
      return { error: error?.message }
    } else {
      // Delete from localStorage
      deleteLocalSession(id)
      setSessions(getLocalSessions())
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
        <div className="container px-4 py-3 mx-auto md:max-w-5xl lg:max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary filled" />
            <h1 className="text-xl font-bold tracking-tight">EVC Track</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/?tab=settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container md:max-w-5xl lg:max-w-6xl mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Tabs defaultValue="tracker" value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Desktop Top Nav */}
          <TabsList className="hidden md:grid w-full max-w-lg mx-auto grid-cols-4 mb-8 p-1 bg-muted/50 backdrop-blur-sm rounded-xl">
            <TabsTrigger value="tracker" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
              {t('nav.charging')}
            </TabsTrigger>
            <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
              {t('nav.expenses')}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
              {t('nav.analytics')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
              {t('settings.title')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="space-y-6 focus-visible:outline-none focus-visible:ring-0 pb-20 md:pb-0">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">{t('history.chargingHistory')}</h2>
              <div className="hidden md:block">
                {/* Only show Add button if no active session, or keep it for manual adds */}
                <AddChargeDialog
                  onAdd={handleAddSession}
                  user={user}
                  trigger={
                    <Button variant="outline" size="sm" className="gap-1">
                      <Plus className="h-4 w-4" />
                      {t('tracker.addCharge')}
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Active Session Card */}
            {activeSession ? (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Zap className="h-4 w-4 fill-primary animate-pulse" />
                        <span>Session Active</span>
                      </div>
                      <div className="text-3xl font-bold font-mono">
                        <ActiveSessionTimer startTime={activeSession.session_start || activeSession.charged_at} />
                      </div>
                      <p className="text-xs text-muted-foreground">Started at {new Date(activeSession.session_start || activeSession.charged_at).toLocaleTimeString()}</p>
                    </div>
                    <AddChargeDialog
                      onAdd={handleCompleteSession}
                      user={user}
                      initialData={{
                        startPercent: activeSession.start_percent,
                        startTime: activeSession.session_start || activeSession.charged_at
                      }}
                      trigger={
                        <Button size="lg" className="rounded-full h-16 w-16 shadow-lg bg-destructive hover:bg-destructive/90 p-0 hover:scale-105 transition-transform">
                          <Square className="h-6 w-6 fill-current" />
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-primary/10 to-transparent border-none shadow-sm">
                <CardContent className="pt-6 flex flex-col items-center justify-center gap-4 py-8">
                  <Button
                    size="lg"
                    className="rounded-full h-24 w-24 shadow-xl text-lg font-bold hover:scale-105 transition-transform"
                    onClick={handleStartSession}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Play className="h-8 w-8 fill-current ml-1" />
                      <span className="text-xs font-normal">START</span>
                    </div>
                  </Button>
                  <p className="text-sm text-muted-foreground font-medium">Tap to start charging</p>
                </CardContent>
              </Card>
            )}

            <ChargingHistory
              sessions={sessions}
              onSessionClick={handleSessionClick}
            />
            <div className="md:hidden">
              {!activeSession && (
                <AddChargeDialog
                  onAdd={handleAddSession}
                  user={user}
                  trigger={
                    <Button className="rounded-full h-14 w-14 shadow-lg fixed bottom-24 right-6 z-50 p-0 hover:scale-105 transition-transform">
                      <Plus className="h-8 w-8" />
                    </Button>
                  }
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6 focus-visible:outline-none focus-visible:ring-0 pb-20 md:pb-0">
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
                  <Button className="h-14 w-14 rounded-full shadow-lg fixed bottom-24 right-6 z-50 p-0 bg-orange-500 hover:bg-orange-600 transition-transform hover:scale-105">
                    <Wrench className="h-6 w-6" />
                  </Button>
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="focus-visible:outline-none focus-visible:ring-0 pb-20 md:pb-0">
            <AnalyticsView sessions={sessions} expenses={expenses} />
          </TabsContent>

          <TabsContent value="settings" className="focus-visible:outline-none focus-visible:ring-0 pb-20 md:pb-0">
            <SettingsView user={user} />
          </TabsContent>

          {/* Mobile Bottom Nav */}
          <TabsList className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t grid grid-cols-4 gap-1 p-2 pb-6 z-40 rounded-none shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <TabsTrigger
              value="tracker"
              className="flex flex-col gap-1 h-auto py-2 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
            >
              <Zap className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t('nav.charging')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="flex flex-col gap-1 h-auto py-2 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
            >
              <Wrench className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t('nav.expenses')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex flex-col gap-1 h-auto py-2 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t('nav.analytics')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex flex-col gap-1 h-auto py-2 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
            >
              <Settings className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t('settings.title')}</span>
            </TabsTrigger>
          </TabsList>
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
