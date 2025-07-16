"use client"

import { useSearchParams } from "next/navigation"

import { useState, useEffect, useRef } from "react" // Import useRef
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, Coffee, Plus, Timer, Check, Save } from "lucide-react" // Import Save icon
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useRouter } from "next/navigation"
import { RestTimer } from "@/components/rest-timer"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area" // Import ScrollArea
import { getSuggestedIncrement } from "@/lib/ai-suggestions" // Import AI suggestion helper

// Define a simplified UserProfile type for this module's needs
type UserProfile = {
  name: string // Added name to UserProfile
  weight: number
  height: number
  progressiveOverload: {
    enabled: boolean
  }
}

export type Exercise = {
  id: string
  name: string
  muscleGroup: string
  sets: {
    weight: number
    reps: number
    completed: boolean
  }[]
  custom?: boolean
  currentActiveSetIndex: number // New: Track the active set index for this specific exercise
  isBodyweight?: boolean // Added isBodyweight
}

export type Workout = {
  id: string
  date: string
  exercises: Exercise[]
  durationInMinutes?: number // Added for session duration
}

// Define the default exercises available in the app (duplicated for simplicity in this project structure)
const defaultExercises: Exercise[] = [
  {
    id: "leg-press",
    name: "Leg Press",
    muscleGroup: "legs",
    sets: [{ weight: 0, reps: 5, completed: false }],
    currentActiveSetIndex: 0,
  },
  {
    id: "pull-ups",
    name: "Pull ups",
    muscleGroup: "back",
    sets: [{ weight: 0, reps: 0, completed: false }],
    currentActiveSetIndex: 0,
    isBodyweight: true,
  }, // reps 0 for till failure
  {
    id: "incline-bench",
    name: "Incline Bench",
    muscleGroup: "chest",
    sets: [{ weight: 0, reps: 5, completed: false }],
    currentActiveSetIndex: 0,
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
    currentActiveSetIndex: 0,
  },
  {
    id: "preacher-curl",
    name: "Preacher Curl",
    muscleGroup: "arms",
    sets: [
      { weight: 0, reps: 5, completed: false },
      { weight: 0, reps: 5, completed: false },
    ],
    currentActiveSetIndex: 0,
  },
  {
    id: "run-5k",
    name: "Run 5k",
    muscleGroup: "cardio",
    sets: [{ weight: 5, reps: 0, completed: false }],
    currentActiveSetIndex: 0,
  }, // weight for distance (miles), reps for time (minutes)
  {
    id: "deadlift",
    name: "Deadlift",
    muscleGroup: "back",
    sets: [
      { weight: 0, reps: 5, completed: false },
      { weight: 0, reps: 5, completed: false },
    ],
    currentActiveSetIndex: 0,
  },
  {
    id: "overhead-press",
    name: "Overhead press",
    muscleGroup: "shoulders",
    sets: [
      { weight: 0, reps: 5, completed: false },
      { weight: 0, reps: 5, completed: false },
    ],
    currentActiveSetIndex: 0,
  },
  {
    id: "deficit-pushups",
    name: "Deficit Pushups",
    muscleGroup: "chest",
    sets: [
      { weight: 0, reps: 0, completed: false },
      { weight: 0, reps: 0, completed: false },
    ],
    currentActiveSetIndex: 0,
    isBodyweight: true,
  }, // reps 0 for till failure
  {
    id: "leg-extension",
    name: "Leg Extension",
    muscleGroup: "legs",
    sets: [
      { weight: 0, reps: 5, completed: false },
      { weight: 0, reps: 5, completed: false },
    ],
    currentActiveSetIndex: 0,
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
    currentActiveSetIndex: 0,
  },
  {
    id: "lateral-raises",
    name: "Lateral Raises",
    muscleGroup: "shoulders",
    sets: [
      { weight: 0, reps: 0, completed: false },
      { weight: 0, reps: 0, completed: false },
    ],
    currentActiveSetIndex: 0,
  }, // reps 0 for till failure
  {
    id: "tricep-extensions",
    name: "Tricep extensions",
    muscleGroup: "arms",
    sets: [
      { weight: 0, reps: 5, completed: false },
      { weight: 0, reps: 5, completed: false },
    ],
    currentActiveSetIndex: 0,
  },
]

// Define the initial pre-set workouts for each day (duplicated for simplicity in this project structure)
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
          currentActiveSetIndex: 0,
        },
        {
          id: "pull-ups",
          name: "Pull ups",
          muscleGroup: "back",
          sets: [
            { weight: 0, reps: 0, completed: false },
            { weight: 0, reps: 0, completed: false },
          ],
          currentActiveSetIndex: 0,
          isBodyweight: true,
        },
        {
          id: "incline-bench",
          name: "Incline Bench",
          muscleGroup: "chest",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
          currentActiveSetIndex: 0,
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
          currentActiveSetIndex: 0,
        },
        {
          id: "preacher-curl",
          name: "Preacher Curl",
          muscleGroup: "arms",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
          currentActiveSetIndex: 0,
        },
      ],
    },
  ],
  tuesday: [
    {
      id: "initial-tuesday-workout",
      date: new Date().toISOString(),
      exercises: [
        {
          id: "run-5k",
          name: "Run 5k",
          muscleGroup: "cardio",
          sets: [{ weight: 5, reps: 0, completed: false }],
          currentActiveSetIndex: 0,
        },
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
          currentActiveSetIndex: 0,
        },
        {
          id: "overhead-press",
          name: "Overhead press",
          muscleGroup: "shoulders",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
          currentActiveSetIndex: 0,
        },
        {
          id: "deficit-pushups",
          name: "Deficit Pushups",
          muscleGroup: "chest",
          sets: [
            { weight: 0, reps: 0, completed: false },
            { weight: 0, reps: 0, completed: false },
          ],
          currentActiveSetIndex: 0,
          isBodyweight: true,
        },
        {
          id: "leg-extension",
          name: "Leg Extension",
          muscleGroup: "legs",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
          currentActiveSetIndex: 0,
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
          currentActiveSetIndex: 0,
        },
      ],
    },
  ],
  thursday: [
    {
      id: "initial-thursday-workout",
      date: new Date().toISOString(),
      exercises: [
        {
          id: "run-5k",
          name: "Run 5k",
          muscleGroup: "cardio",
          sets: [{ weight: 5, reps: 0, completed: false }],
          currentActiveSetIndex: 0,
        },
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
          currentActiveSetIndex: 0,
          isBodyweight: true,
        },
        {
          id: "incline-bench",
          name: "Incline Bench",
          muscleGroup: "chest",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
          currentActiveSetIndex: 0,
        },
        {
          id: "lateral-raises",
          name: "Lateral Raises",
          muscleGroup: "shoulders",
          sets: [
            { weight: 0, reps: 0, completed: false },
            { weight: 0, reps: 0, completed: false },
          ],
          currentActiveSetIndex: 0,
        },
        {
          id: "tricep-extensions",
          name: "Tricep extensions",
          muscleGroup: "arms",
          sets: [
            { weight: 0, reps: 5, completed: false },
            { weight: 0, reps: 5, completed: false },
          ],
          currentActiveSetIndex: 0,
        },
      ],
    },
  ],
  saturday: [], // Rest day
  sunday: [], // Rest day
}

// Helper function to propagate weight/reps from the first set to all sets
const propagateSetDetails = (exercise: Exercise): Exercise => {
  if (exercise.sets.length === 0) return exercise
  const firstSet = exercise.sets[0]
  return {
    ...exercise,
    sets: exercise.sets.map((set) => ({
      ...set,
      weight: firstSet.weight,
      reps: firstSet.reps,
    })),
    currentActiveSetIndex: 0, // Always initialize to 0 for new exercises
  }
}

export default function WorkoutSessionPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dayParam = searchParams.get("day")

  const [selectedDay, setSelectedDay] = useState<string>(dayParam || "monday")
  const [workouts, setWorkouts] = useLocalStorage<Record<string, Workout[]>>("workouts", initialWorkouts)
  const [restDays] = useLocalStorage<string[]>("rest-days", ["saturday", "sunday"])
  const [userProfile] = useLocalStorage<UserProfile>("user-profile", {
    name: "",
    weight: 0,
    height: 0,
    progressiveOverload: { enabled: true },
  })

  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>([])
  const [showRestTimer, setShowRestTimer] = useState<boolean>(false)
  const [restTimerExerciseDetails, setRestTimerExerciseDetails] = useState<{
    muscleGroup: string
    exerciseName: string
  } | null>(null)
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState<boolean>(false)

  const startTimeRef = useRef<number | null>(null) // Ref to store workout start time

  useEffect(() => {
    if (!dayParam) {
      router.push("/")
      return
    }

    setSelectedDay(dayParam)

    if (restDays.includes(dayParam)) {
      setIsWorkoutCompleted(true)
      return
    }

    const dayWorkouts = workouts[dayParam] || []
    let exercisesForSession: Exercise[] = []

    if (dayWorkouts.length > 0) {
      const lastWorkout = dayWorkouts[dayWorkouts.length - 1]
      exercisesForSession = lastWorkout.exercises.map((exercise) => {
        const { weightIncrement, repsIncrement } = getSuggestedIncrement(exercise, workouts, userProfile)
        const newSets = exercise.sets.map((set) => ({ ...set, completed: false })) // Reset completion status for new session

        if (exercise.muscleGroup === "cardio") {
          return {
            ...exercise,
            sets: newSets.map((set) => ({
              ...set,
              weight: set.weight + weightIncrement, // Apply distance increment
              reps: set.reps + repsIncrement, // Apply time decrement (if repsIncrement is negative)
            })),
            currentActiveSetIndex: 0, // Always start at the first set for the new session
          }
        } else {
          return {
            ...exercise,
            sets: newSets.map((set) => ({
              ...set,
              weight: set.weight + weightIncrement, // Apply weight increment
            })),
            currentActiveSetIndex: 0, // Always start at the first set for the new session
          }
        }
      })
    } else {
      const initialDayExercises = initialWorkouts[dayParam]?.[0]?.exercises || []
      exercisesForSession = initialDayExercises.map(propagateSetDetails)
    }

    setCurrentWorkout(exercisesForSession)
    startTimeRef.current = Date.now() // Set start time when workout session begins
  }, [dayParam, workouts, restDays, router, userProfile])

  const handleConfirmSet = (exerciseIndex: number, setIndex: number) => {
    const updatedWorkout = [...currentWorkout]
    const exercise = updatedWorkout[exerciseIndex]

    // Only allow confirming the currently active set for this exercise
    if (setIndex !== exercise.currentActiveSetIndex) {
      return
    }

    const updatedSets = [...exercise.sets]
    updatedSets[setIndex].completed = true
    exercise.sets = updatedSets

    // Increment the active set index for this exercise
    exercise.currentActiveSetIndex++

    setCurrentWorkout(updatedWorkout)

    // Always show rest timer when a strength set is completed
    if (exercise.muscleGroup !== "cardio") {
      setRestTimerExerciseDetails({
        muscleGroup: exercise.muscleGroup,
        exerciseName: exercise.name,
      })
      setShowRestTimer(true)
    }
    // No automatic progression to next exercise here. User completes workout manually.
  }

  const handleRestTimerEnd = () => {
    setShowRestTimer(false)
    setRestTimerExerciseDetails(null)
    // No automatic progression to next set/exercise from here. User continues manually.
  }

  const updateSetValue = (exerciseIndex: number, setIndex: number, field: "weight" | "reps", value: number) => {
    const updatedWorkout = [...currentWorkout]
    const currentExercise = updatedWorkout[exerciseIndex]

    // If the first set is being updated and it's not a cardio exercise, propagate the value to all other sets
    if (setIndex === 0 && currentExercise.muscleGroup !== "cardio") {
      currentExercise.sets.forEach((set) => {
        set[field] = value
      })
    } else {
      // Otherwise, just update the specific set
      currentExercise.sets[setIndex][field] = value
    }
    setCurrentWorkout(updatedWorkout)
  }

  const addSet = (exerciseIndex: number) => {
    const updatedWorkout = [...currentWorkout]
    const currentExercise = updatedWorkout[exerciseIndex]

    if (currentExercise.muscleGroup === "cardio") return // Cannot add sets to cardio exercises

    const lastSet = currentExercise.sets[currentExercise.sets.length - 1]
    updatedWorkout[exerciseIndex].sets.push({ ...lastSet, completed: false })
    setCurrentWorkout(updatedWorkout)
  }

  const completeWorkout = () => {
    if (!startTimeRef.current) {
      toast({
        title: "Error",
        description: "Workout start time not recorded.",
        variant: "destructive",
      })
      return
    }

    const endTime = Date.now()
    const durationInMinutes = Math.round((endTime - startTimeRef.current) / (1000 * 60))

    const newWorkout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exercises: currentWorkout,
      durationInMinutes: durationInMinutes,
    }

    const updatedWorkouts = { ...workouts }
    if (!updatedWorkouts[selectedDay]) {
      updatedWorkouts[selectedDay] = []
    }
    updatedWorkouts[selectedDay].push(newWorkout)

    setWorkouts(updatedWorkouts)

    toast({
      title: "Workout Completed!",
      description: `Your workout for ${selectedDay} has been saved. Duration: ${durationInMinutes} minutes.`,
    })
    setIsWorkoutCompleted(true)
  }

  if (!dayParam) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Workout...</h1>
        <p className="text-muted-foreground">Please select a day from the home page.</p>
        <Link href="/">
          <Button className="mt-4">Go to Home</Button>
        </Link>
      </div>
    )
  }

  if (restDays.includes(selectedDay)) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Rest Day</CardTitle>
            <CardDescription>Today is a scheduled rest day</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-amber-500 mb-4">
              <Coffee className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-center mb-2">Today is a scheduled rest day.</p>
            <p className="text-center text-sm text-muted-foreground">
              Rest days are essential for recovery and muscle growth. Take time to stretch, hydrate, and prepare for
              your next workout.
            </p>
            <Link href="/">
              <Button className="mt-4">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isWorkoutCompleted) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Workout Completed!</h1>
        <p className="text-muted-foreground mb-6">Great job! Your workout for {selectedDay} has been saved.</p>
        <Link href="/">
          <Button className="w-full">Back to Home</Button>
        </Link>
        <Link href="/progress">
          <Button variant="outline" className="w-full mt-2 bg-transparent">
            View Progress
          </Button>
        </Link>
      </div>
    )
  }

  if (!currentWorkout || currentWorkout.length === 0) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">No Exercises for {selectedDay}</h1>
        <p className="text-muted-foreground">Please configure your workout plan for this day.</p>
        <Link href={`/plans`}>
          <Button className="mt-4">Go to Plans</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 capitalize">{selectedDay}'s Workout</h1>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          {currentWorkout.map((exercise, exerciseIndex) => (
            <Card key={`${exercise.id}-${exerciseIndex}`}>
              <CardHeader>
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription>
                  {exercise.sets.length} {exercise.sets.length === 1 ? "set" : "sets"} • {exercise.muscleGroup}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`}>
                          {exercise.muscleGroup === "cardio"
                            ? "Distance (miles)"
                            : exercise.isBodyweight
                              ? "Weight (Body Weight)"
                              : "Weight (lbs)"}
                        </Label>
                        <Input
                          id={`weight-${exerciseIndex}-${setIndex}`}
                          type="number"
                          value={exercise.isBodyweight ? userProfile.weight : set.weight}
                          onChange={(e) => updateSetValue(exerciseIndex, setIndex, "weight", Number(e.target.value))}
                          disabled={
                            set.completed || // If set is completed, disable
                            showRestTimer || // If global rest timer is active, disable all inputs
                            setIndex !== exercise.currentActiveSetIndex || // If not the active set for THIS exercise, disable
                            exercise.isBodyweight // Disable if it's a bodyweight exercise
                          }
                          placeholder={exercise.isBodyweight ? "Body Weight" : "Enter weight"}
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`}>
                          {exercise.muscleGroup === "cardio" ? "Time (minutes)" : "Reps"}
                        </Label>
                        <Input
                          id={`reps-${exerciseIndex}-${setIndex}`}
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSetValue(exerciseIndex, setIndex, "reps", Number(e.target.value))}
                          disabled={
                            set.completed || // If set is completed, disable
                            showRestTimer || // If global rest timer is active, disable all inputs
                            setIndex !== exercise.currentActiveSetIndex // If not the active set for THIS exercise, disable
                          }
                        />
                      </div>
                      {!set.completed && !showRestTimer && setIndex === exercise.currentActiveSetIndex ? (
                        <Button
                          variant="default"
                          size="icon"
                          className="mt-6"
                          onClick={() => handleConfirmSet(exerciseIndex, setIndex)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        set.completed && <CheckCircle className="h-6 w-6 text-green-500 mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {exercise.muscleGroup !== "cardio" && (
                  <Button variant="outline" size="sm" onClick={() => addSet(exerciseIndex)} disabled={showRestTimer}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Set
                  </Button>
                )}
                {exercise.muscleGroup !== "cardio" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRestTimerExerciseDetails({
                        muscleGroup: exercise.muscleGroup,
                        exerciseName: exercise.name,
                      })
                      setShowRestTimer(true)
                    }}
                    disabled={showRestTimer}
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Rest Timer
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-6">
        <Button className="w-full" onClick={completeWorkout} disabled={showRestTimer}>
          <Save className="h-4 w-4 mr-2" />
          Complete Workout
        </Button>
      </div>

      {showRestTimer && restTimerExerciseDetails && (
        <RestTimer
          muscleGroup={restTimerExerciseDetails.muscleGroup}
          exerciseName={restTimerExerciseDetails.exerciseName}
          onClose={handleRestTimerEnd}
        />
      )}
    </div>
  )
}
