"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Edit, Plus, Coffee } from "lucide-react"
import Link from "next/link"

type Exercise = {
  id: string
  name: string
  muscleGroup: string // Added muscleGroup to Exercise type for consistency
  sets: {
    weight: number
    reps: number
    completed: boolean
  }[]
  isBodyweight?: boolean // Added isBodyweight
}

type Workout = {
  id: string
  date: string
  exercises: Exercise[]
  durationInMinutes?: number // Added for session duration
}

// Define the initial pre-set workouts for each day (same as in workout/page.tsx)
const initialWorkouts: Record<string, Workout[]> = {
  monday: [
    {
      id: "initial-monday-workout",
      date: new Date().toISOString(),
      exercises: [
        {
          id: "leg-press",
          name: "Leg Press",
          muscleGroup: "legs",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
        },
        {
          id: "pull-ups",
          name: "Pull ups",
          muscleGroup: "back",
          sets: [
            { weight: 0, reps: 0, completed: false },
            { weight: 0, reps: 0, completed: false },
          ],
          isBodyweight: true, // Marked as bodyweight
        },
        {
          id: "incline-bench",
          name: "Incline Bench",
          muscleGroup: "chest",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
        },
        {
          id: "cuban-press",
          name: "Cuban Press",
          muscleGroup: "shoulders",
          sets: [
            { weight: 0, reps: 8, completed: false },
            { weight: 0, reps: 8, completed: false },
            { weight: 0, reps: 8, completed: false },
          ],
        },
        {
          id: "preacher-curl",
          name: "Preacher Curl",
          muscleGroup: "arms",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
        },
      ],
    },
  ],
  tuesday: [
    {
      id: "initial-tuesday-workout",
      date: new Date().toISOString(),
      exercises: [
        { id: "run-5k", name: "Run 5k", muscleGroup: "cardio", sets: [{ weight: 5, reps: 0, completed: false }] },
      ],
    },
  ],
  wednesday: [
    {
      id: "initial-wednesday-workout",
      date: new Date().toISOString(),
      exercises: [
        {
          id: "deadlift",
          name: "Deadlift",
          muscleGroup: "back",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
        },
        {
          id: "overhead-press",
          name: "Overhead press",
          muscleGroup: "shoulders",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
        },
        {
          id: "deficit-pushups",
          name: "Deficit Pushups",
          muscleGroup: "chest",
          sets: [
            { weight: 0, reps: 0, completed: false },
            { weight: 0, reps: 0, completed: false },
          ],
          isBodyweight: true, // Marked as bodyweight
        },
        {
          id: "leg-extension",
          name: "Leg Extension",
          muscleGroup: "legs",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
        },
        {
          id: "calf-raises",
          name: "Calf Raises",
          muscleGroup: "legs",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
        },
      ],
    },
  ],
  thursday: [
    {
      id: "initial-thursday-workout",
      date: new Date().toISOString(),
      exercises: [
        { id: "run-5k", name: "Run 5k", muscleGroup: "cardio", sets: [{ weight: 5, reps: 0, completed: false }] },
      ],
    },
  ],
  friday: [
    {
      id: "initial-friday-workout",
      date: new Date().toISOString(),
      exercises: [
        {
          id: "pull-ups",
          name: "Pull Ups",
          muscleGroup: "back",
          sets: [
            { weight: 0, reps: 0, completed: false },
            { weight: 0, reps: 0, completed: false },
          ],
          isBodyweight: true, // Marked as bodyweight
        },
        {
          id: "incline-bench",
          name: "Incline Bench",
          muscleGroup: "chest",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
        },
        {
          id: "lateral-raises",
          name: "Lateral Raises",
          muscleGroup: "shoulders",
          sets: [
            { weight: 0, reps: 0, completed: false },
            { weight: 0, reps: 0, completed: false },
          ],
        },
        {
          id: "tricep-extensions",
          name: "Tricep extensions",
          muscleGroup: "arms",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
        },
      ],
    },
  ],
  saturday: [], // Rest day
  sunday: [], // Rest day
}

export default function PlansPage() {
  const [workouts, setWorkouts] = useLocalStorage<Record<string, Workout[]>>("workouts", initialWorkouts)
  const [restDays, setRestDays] = useLocalStorage<string[]>("rest-days", ["saturday", "sunday"])
  const [activeTab, setActiveTab] = useState("monday")

  const days = [
    { id: "monday", label: "Mon" },
    { id: "tuesday", label: "Tue" },
    { id: "wednesday", label: "Wed" },
    { id: "thursday", label: "Thu" },
    { id: "friday", label: "Fri" },
    { id: "saturday", label: "Sat" },
    { id: "sunday", label: "Sun" },
  ]

  const getLastWorkout = (day: string): Workout | null => {
    const dayWorkouts = workouts[day] || []
    return dayWorkouts.length > 0 ? dayWorkouts[dayWorkouts.length - 1] : null
  }

  const toggleRestDay = (day: string) => {
    if (restDays.includes(day)) {
      setRestDays(restDays.filter((d) => d !== day))
    } else {
      setRestDays([...restDays, day])
    }
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Weekly Plan</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 h-auto">
          {days.map((day) => (
            <TabsTrigger
              key={day.id}
              value={day.id}
              className={`py-2 ${restDays.includes(day.id) ? "text-amber-500" : ""}`}
            >
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => {
          const lastWorkout = getLastWorkout(day.id)
          const isRestDay = restDays.includes(day.id)

          return (
            <TabsContent key={day.id} value={day.id} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {day.label} {isRestDay ? "Rest Day" : "Workout"}
                    <Link href={`/workout?day=${day.id}`}>
                      <Button variant="outline" size="sm">
                        {isRestDay ? (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Configure
                          </>
                        ) : lastWorkout ? (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Create
                          </>
                        )}
                      </Button>
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {isRestDay
                      ? "Rest and recovery day"
                      : lastWorkout
                        ? `Last updated: ${new Date(lastWorkout.date).toLocaleDateString()}${lastWorkout.durationInMinutes ? ` (${lastWorkout.durationInMinutes} mins)` : ""}`
                        : "No workout planned yet"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isRestDay ? (
                    <div className="flex items-center justify-center py-8">
                      <Coffee className="h-12 w-12 text-amber-500 mr-3" />
                      <div>
                        <p className="font-medium">Rest Day</p>
                        <p className="text-sm text-muted-foreground">Recovery is essential for muscle growth</p>
                      </div>
                    </div>
                  ) : lastWorkout ? (
                    <ul className="space-y-2">
                      {lastWorkout.exercises.map((exercise, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{exercise.name}</span>
                          <span className="text-muted-foreground">
                            {exercise.muscleGroup === "cardio"
                              ? `1 run (${exercise.sets[0].weight} miles)`
                              : `${exercise.sets.length} ${exercise.sets.length === 1 ? "set" : "sets"}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Click create to plan your workout for this day.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
