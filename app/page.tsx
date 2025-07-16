"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Calendar, Dumbbell, LineChart, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [showStartWorkoutDialog, setShowStartWorkoutDialog] = useState(false)
  const currentDay = format(new Date(), "EEEE").toLowerCase()
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(currentDay)

  const [user, setUser] = useState<any>(null)

  // Helper function to get user's first name
  const getUserFirstName = (user: any) => {
    if (!user) return null
    
    // Try to get name from user metadata (Google OAuth)
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name
    if (fullName) {
      return fullName.split(' ')[0]
    }
    
    // Fallback to email if no name is available
    return user.email?.split('@')[0] || 'User'
  }

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()

    // Listen for sign in/out changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" })
    if (error) alert("Error signing in: " + error.message)
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) alert("Error signing out: " + error.message)
  }

  return (
    <main className="container max-w-md mx-auto px-4 py-8">
      <div className="flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold">Workout Tracker</h1>
        <p className="text-center text-muted-foreground">
          Track your workouts, monitor progress, and achieve your fitness goals with progressive overload.
        </p>

        {!user ? (
          <Button onClick={signInWithGoogle} className="mb-4">
            Sign In with Google
          </Button>
        ) : (
          <>
            <p>Welcome, {getUserFirstName(user)}</p>
            <Button variant="outline" onClick={signOut} className="mb-4">
              Sign Out
            </Button>
          </>
        )}

        <div className="grid grid-cols-2 gap-4 w-full">
          <Button
            variant="default"
            size="lg"
            className="w-full h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => {
              setSelectedWorkoutDay(currentDay)
              setShowStartWorkoutDialog(true)
            }}
            disabled={!user}
          >
            <Dumbbell className="h-6 w-6" />
            <span>Start Workout</span>
          </Button>

          <Link href="/plans" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
              disabled={!user}
            >
              <Calendar className="h-6 w-6" />
              <span>Weekly Plan</span>
            </Button>
          </Link>

          <Link href="/progress" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
              disabled={!user}
            >
              <LineChart className="h-6 w-6" />
              <span>Progress</span>
            </Button>
          </Link>

          <Link href="/profile" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
              disabled={!user}
            >
              <User className="h-6 w-6" />
              <span>Profile</span>
            </Button>
          </Link>
        </div>

        <div className="flex justify-center items-center pt-4">
          <span className="text-xs text-muted-foreground/60">Created by Evan Von Waldner 2025</span>
        </div>
      </div>

      <Dialog open={showStartWorkoutDialog} onOpenChange={setShowStartWorkoutDialog}>
        <DialogContent>
          <DialogTitle>Start Workout</DialogTitle>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workout-day-select">Workout Day</Label>
              <Select value={selectedWorkoutDay} onValueChange={setSelectedWorkoutDay}>
                <SelectTrigger id="workout-day-select">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                    <SelectItem key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartWorkoutDialog(false)}>
              Cancel
            </Button>
            <Link href={`/workout/session?day=${selectedWorkoutDay}`}>
              <Button>Start Workout</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
