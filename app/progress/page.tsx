"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LineChart, BarChart } from "lucide-react"

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

// Define the default exercises available in the app (duplicated for simplicity in this project structure)
const defaultExercises: Exercise[] = [
  { id: "leg-press", name: "Leg Press", muscleGroup: "legs", sets: [{ weight: 0, reps: 5, completed: false }] },
  {
    id: "pull-ups",
    name: "Pull ups",
    muscleGroup: "back",
    sets: [{ weight: 0, reps: 0, completed: false }],
    isBodyweight: true,
  }, // reps 0 for till failure
  {
    id: "incline-bench",
    name: "Incline Bench",
    muscleGroup: "chest",
    sets: [{ weight: 0, reps: 5, completed: false }],
  },
  {
    id: "cuban-press",
    name: "Cuban Press",
    muscleGroup: "shoulders",
    sets: [{ weight: 0, reps: 8, completed: false }],
  },
  { id: "preacher-curl", name: "Preacher Curl", muscleGroup: "arms", sets: [{ weight: 0, reps: 5, completed: false }] },
  { id: "run-5k", name: "Run 5k", muscleGroup: "cardio", sets: [{ weight: 5, reps: 0, completed: false }] }, // weight for distance (miles), reps for time (minutes)
  { id: "deadlift", name: "Deadlift", muscleGroup: "back", sets: [{ weight: 0, reps: 5, completed: false }] },
  {
    id: "overhead-press",
    name: "Overhead press",
    muscleGroup: "shoulders",
    sets: [{ weight: 0, reps: 5, completed: false }],
  },
  {
    id: "deficit-pushups",
    name: "Deficit Pushups",
    muscleGroup: "chest",
    sets: [{ weight: 0, reps: 0, completed: false }],
    isBodyweight: true,
  }, // reps 0 for till failure
  { id: "leg-extension", name: "Leg Extension", muscleGroup: "legs", sets: [{ weight: 0, reps: 5, completed: false }] },
  { id: "calf-raises", name: "Calf Raises", muscleGroup: "legs", sets: [{ weight: 0, reps: 5, completed: false }] },
  {
    id: "lateral-raises",
    name: "Lateral Raises",
    muscleGroup: "shoulders",
    sets: [{ weight: 0, reps: 0, completed: false }],
  }, // reps 0 for till failure
  {
    id: "tricep-extensions",
    name: "Tricep extensions",
    muscleGroup: "arms",
    sets: [{ weight: 0, reps: 5, completed: false }],
  },
]

// Define a simplified UserProfile type for this module's needs
type UserProfile = {
  name: string
  weight: number
  height: number
  progressiveOverload: {
    enabled: boolean
  }
}

export default function ProgressPage() {
  const [workouts, setWorkouts] = useLocalStorage<Record<string, Workout[]>>("workouts", {})
  // Initialize exercises with defaultExercises so they are always available
  const [exercises, setExercises] = useLocalStorage<Exercise[]>("exercises", defaultExercises)
  const [userProfile] = useLocalStorage<UserProfile>("user-profile", {
    name: "",
    weight: 0,
    height: 0,
    progressiveOverload: { enabled: true },
  })
  const [selectedExercise, setSelectedExercise] = useState<string>("")

  // Now, exerciseOptions will simply be all exercises, regardless of whether they've been used
  const exerciseOptions = exercises

  // Get progress data for selected exercise
  const getProgressData = () => {
    if (!selectedExercise) return []

    const data: {
      date: string
      primaryValue: number
      secondaryValue: number | string
      type: "strength" | "cardio"
      estimated1RM?: number
    }[] = []
    const selectedExerciseDetails = exercises.find((e) => e.id === selectedExercise)

    const calculate1RM = (weight: number, reps: number): number => {
      if (reps <= 0) return weight // Avoid division by zero
      return Math.round(weight * (1 + reps / 30))
    }

    Object.values(workouts).forEach((dayWorkouts) => {
      dayWorkouts.forEach((workout) => {
        const exercise = workout.exercises.find((e) => e.id === selectedExercise)
        if (exercise && exercise.sets.length > 0) {
          const completedSet = exercise.sets.find((set) => set.completed) // Use the first completed set for simplicity

          if (completedSet) {
            if (selectedExerciseDetails?.muscleGroup === "cardio") {
              data.push({
                date: new Date(workout.date).toLocaleDateString(),
                primaryValue: completedSet.weight, // distance
                secondaryValue: completedSet.reps, // time in minutes
                type: "cardio",
              })
            } else {
              // Strength exercise
              const weightUsed = exercise.isBodyweight ? userProfile.weight : completedSet.weight
              const estimated1RM = calculate1RM(weightUsed, completedSet.reps)
              data.push({
                date: new Date(workout.date).toLocaleDateString(),
                primaryValue: weightUsed,
                secondaryValue: completedSet.reps,
                estimated1RM: estimated1RM, // Add estimated 1RM
                type: "strength",
              })
            }
          }
        }
      })
    })

    // Sort by date
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const progressData = getProgressData()
  const selectedExerciseType =
    exercises.find((e) => e.id === selectedExercise)?.muscleGroup === "cardio" ? "cardio" : "strength"

  // Calculate volume (weight × reps × sets) for each workout day
  const getVolumeByDay = () => {
    const volumeByDay: Record<string, number> = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    }

    Object.entries(workouts).forEach(([day, dayWorkouts]) => {
      if (dayWorkouts.length === 0) return

      // Get the latest workout for this day
      const latestWorkout = dayWorkouts[dayWorkouts.length - 1]

      // Calculate total volume
      let totalVolume = 0
      latestWorkout.exercises.forEach((exercise) => {
        // Only sum volume for strength exercises
        if (exercise.muscleGroup !== "cardio") {
          exercise.sets.forEach((set) => {
            if (set.completed) {
              const weightUsed = exercise.isBodyweight ? userProfile.weight : set.weight
              totalVolume += weightUsed * set.reps
            }
          })
        }
      })

      volumeByDay[day] = totalVolume
    })

    return volumeByDay
  }

  const volumeData = getVolumeByDay()

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Progress Tracking</h1>

      <Tabs defaultValue="strength" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="strength">
            <LineChart className="h-4 w-4 mr-2" />
            Strength
          </TabsTrigger>
          <TabsTrigger value="volume">
            <BarChart className="h-4 w-4 mr-2" />
            Volume
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strength">
          <Card>
            <CardHeader>
              <CardTitle>Strength Progress</CardTitle>
              <CardDescription>Track your strength gains or cardio performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseOptions.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name} ({exercise.muscleGroup})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedExercise && progressData.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-[200px] flex items-end justify-between">
                    {progressData.map((entry, index) => {
                      // Find max primary value to normalize the chart
                      const maxPrimaryValue = Math.max(...progressData.map((d) => d.primaryValue))
                      const heightPercentage = maxPrimaryValue > 0 ? (entry.primaryValue / maxPrimaryValue) * 100 : 0

                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className="w-8 bg-primary rounded-t" style={{ height: `${heightPercentage}%` }}></div>
                          <div className="text-xs mt-1 text-muted-foreground">{entry.date}</div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="space-y-2">
                    {progressData.map((entry, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{entry.date}</span>
                        <span>
                          {entry.type === "cardio"
                            ? `${entry.primaryValue} miles in ${entry.secondaryValue} mins`
                            : `${entry.primaryValue} lbs × ${entry.secondaryValue} reps` +
                              (entry.estimated1RM ? ` (Est. 1RM: ${entry.estimated1RM} lbs)` : "")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedExercise
                    ? "No progress data available yet. Complete workouts to see your progress."
                    : "Select an exercise to view progress"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Volume</CardTitle>
              <CardDescription>Total weight lifted per workout day (excluding cardio)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end justify-between">
                {Object.entries(volumeData).map(([day, volume]) => {
                  // Find max volume to normalize the chart
                  const maxVolume = Math.max(...Object.values(volumeData))
                  const heightPercentage = maxVolume > 0 ? (volume / maxVolume) * 100 : 0

                  const dayLabel = day.charAt(0).toUpperCase() + day.slice(1, 3)

                  return (
                    <div key={day} className="flex flex-col items-center">
                      <div className="w-8 bg-primary rounded-t" style={{ height: `${heightPercentage}%` }}></div>
                      <div className="text-xs mt-1 text-muted-foreground">{dayLabel}</div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2 mt-4">
                {Object.entries(volumeData).map(([day, volume]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                    <span>{volume.toLocaleString()} lbs</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
