"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Save, Timer, Coffee, Trash2, Edit, ArrowUp, ArrowDown } from "lucide-react" // Added Trash2, Edit, ArrowUp, ArrowDown icons
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSearchParams } from "next/navigation"
import { RestTimer } from "@/components/rest-timer"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getSuggestedIncrement } from "@/lib/ai-suggestions" // Import AI suggestion helper
import { supabase } from "@/lib/supabaseClient";
import { getWorkouts, insertWorkout } from "@/lib/supabaseWorkouts";
import { getAISuggestions, insertAISuggestion } from "@/lib/supabaseAISuggestions";

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
  currentActiveSetIndex: number // Added for session tracking, initialized to 0 here
  isBodyweight?: boolean // Added isBodyweight
}

export type Workout = {
  id: string
  date: string
  exercises: Exercise[]
  durationInMinutes?: number
}

// Define the default exercises available in the app
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
    isBodyweight: true, // Marked as bodyweight
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
    isBodyweight: true, // Marked as bodyweight
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

// Define the initial pre-set workouts for each day
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

export default function WorkoutPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const dayParam = searchParams.get("day");

  const defaultDayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  // User state
  const [user, setUser] = useState<any>(null);
  // Cloud state
  const [cloudWorkouts, setCloudWorkouts] = useState<any[]>([]);
  const [cloudAISuggestions, setCloudAISuggestions] = useState<any[]>([]);
  // Local fallback state
  const [workouts, setWorkouts] = useLocalStorage<Record<string, Workout[]>>("workouts", initialWorkouts);
  const [restDays, setRestDays] = useLocalStorage<string[]>("rest-days", ["saturday", "sunday"]);
  const [exercises, setExercises] = useLocalStorage<Exercise[]>("exercises", defaultExercises);
  const [userProfile] = useLocalStorage<UserProfile>("user-profile", {
    name: "",
    weight: 0,
    height: 0,
    progressiveOverload: { enabled: true },
  });
  const [orderedDays, setOrderedDays] = useLocalStorage<string[]>("ordered-workout-days", defaultDayOrder);

  // On mount, get user and fetch cloud data if signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        getWorkouts(data.user.id).then((data) => setCloudWorkouts(data || []));
        getAISuggestions(data.user.id).then((data) => setCloudAISuggestions(data || []));
      }
    });
  }, []);

  const [selectedDay, setSelectedDay] = useState<string>(dayParam || orderedDays[0] || "monday")

  // State for the current day's rest status (independent of global rest days)
  const [isDayRest, setIsDayRest] = useState<boolean>(restDays.includes(selectedDay))

  // State for new custom exercise
  const [newExercise, setNewExercise] = useState<{
    name: string
    muscleGroup: string
    weight: number
    reps: number
    numSets: number // Added for custom exercise creation
    isBodyweight: boolean // Added for custom exercise creation
  }>({
    name: "",
    muscleGroup: "chest",
    weight: 0,
    reps: 8,
    numSets: 3, // Default to 3 sets for new custom exercises
    isBodyweight: false, // Default to not bodyweight
  })

  const [currentWorkout, setCurrentWorkout] = useState<Exercise[]>(() => {
    // Get the last workout for this day or use default exercises
    const dayWorkouts = workouts[selectedDay] || [];
    if (dayWorkouts.length > 0) {
      const lastWorkout = dayWorkouts[dayWorkouts.length - 1];
      // Apply progressive overload based on AI suggestion
      return lastWorkout.exercises.map((exercise) => {
        const { weightIncrement, repsIncrement } = getSuggestedIncrement(exercise, workouts, userProfile);
        const newSets = exercise.sets.map((set) => ({ ...set, completed: false })); // Reset completion status
        if (exercise.muscleGroup === "cardio") {
          return {
            ...exercise,
            sets: newSets.map((set) => ({
              ...set,
              weight: set.weight + weightIncrement, // Apply distance increment
              reps: set.reps + repsIncrement, // Apply time decrement (if repsIncrement is negative)
            })),
            currentActiveSetIndex: 0,
          };
        } else {
          return {
            ...exercise,
            sets: newSets.map((set) => ({
              ...set,
              weight: set.weight + weightIncrement, // Apply weight increment
            })),
            currentActiveSetIndex: 0,
          };
        }
      });
    }
    // If no previous workout, use the initial pre-set workout for this day and propagate
    const initialDayExercises = initialWorkouts[selectedDay]?.[0]?.exercises || [];
    return initialDayExercises.map(propagateSetDetails);
  });

  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [showRestTimer, setShowRestTimer] = useState<boolean>(false)
  const [showNewExerciseDialog, setShowNewExerciseDialog] = useState<boolean>(false)
  const [restTimerExerciseDetails, setRestTimerExerciseDetails] = useState<{
    muscleGroup: string
    exerciseName: string
  } | null>(null)

  // States for day management dialogs
  const [showManageDaysDialog, setShowManageDaysDialog] = useState(false)
  const [editingDayName, setEditingDayName] = useState<string | null>(null)
  const [editingDayNewValue, setEditingDayNewValue] = useState<string>("")

  useEffect(() => {
    if (dayParam) {
      setSelectedDay(dayParam)
      setIsDayRest(restDays.includes(dayParam))
    }
  }, [dayParam, restDays])

  // Update rest day status and current workout when day changes
  useEffect(() => {
    setIsDayRest(restDays.includes(selectedDay))
    const dayWorkouts = workouts[selectedDay] || []
    if (dayWorkouts.length > 0) {
      const lastWorkout = dayWorkouts[dayWorkouts.length - 1];
      const newWorkout = lastWorkout.exercises.map((exercise) => {
        const { weightIncrement, repsIncrement } = getSuggestedIncrement(exercise, workouts, userProfile);
        console.log("[App] getSuggestedIncrement result for exercise", exercise.id, ":", { weightIncrement, repsIncrement });
        const newSets = exercise.sets.map((set) => ({ ...set, completed: false }));
        if (exercise.muscleGroup === "cardio") {
          return {
            ...exercise,
            sets: newSets.map((set) => ({
              ...set,
              weight: set.weight + weightIncrement,
              reps: set.reps + repsIncrement,
            })),
            currentActiveSetIndex: 0,
          };
        } else {
          return {
            ...exercise,
            sets: newSets.map((set) => ({
              ...set,
              weight: set.weight + weightIncrement,
            })),
            currentActiveSetIndex: 0,
          };
        }
      });
      setCurrentWorkout(newWorkout);
      // Save AI suggestions for each exercise
      lastWorkout.exercises.forEach((exercise) => {
        const { weightIncrement, repsIncrement } = getSuggestedIncrement(exercise, workouts, userProfile);
        console.log("[App] Calling saveAISuggestion for exercise", exercise.id, "with:", { weightIncrement, repsIncrement });
        saveAISuggestion({
          exerciseId: exercise.id,
          weightIncrement,
          repsIncrement,
          day: selectedDay,
          timestamp: new Date().toISOString(),
        });
      });
    } else {
      // If no previous workout, use the initial pre-set workout for this day and propagate
      const initialDayExercises = initialWorkouts[selectedDay]?.[0]?.exercises || []
      setCurrentWorkout(initialDayExercises.map(propagateSetDetails))
    }
  }, [selectedDay, restDays, workouts, userProfile])

  const addExerciseToWorkout = () => {
    if (!selectedExercise) return

    const exercise = exercises.find((e) => e.id === selectedExercise)
    if (!exercise) return

    // Propagate weight/reps from the first set of the selected exercise
    const propagatedExercise = propagateSetDetails(exercise)
    setCurrentWorkout([...currentWorkout, { ...propagatedExercise, sets: [...propagatedExercise.sets] }])
    setSelectedExercise("")
  }

  const removeExerciseFromWorkout = (exerciseIndex: number) => {
    const updatedWorkout = currentWorkout.filter((_, index) => index !== exerciseIndex)
    setCurrentWorkout(updatedWorkout)
    toast({
      title: "Exercise removed",
      description: "The exercise has been removed from this day's workout.",
    })
  }

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    const updatedWorkout = [...currentWorkout]
    updatedWorkout[exerciseIndex].sets[setIndex].completed = !updatedWorkout[exerciseIndex].sets[setIndex].completed
    setCurrentWorkout(updatedWorkout)

    // Show rest timer when a set is completed and it's not a cardio exercise
    if (
      updatedWorkout[exerciseIndex].sets[setIndex].completed &&
      updatedWorkout[exerciseIndex].muscleGroup !== "cardio"
    ) {
      setRestTimerExerciseDetails({
        muscleGroup: updatedWorkout[exerciseIndex].muscleGroup,
        exerciseName: updatedWorkout[exerciseIndex].name,
      })
      setShowRestTimer(true)
    }
  }

  const updateSetValue = (exerciseIndex: number, setIndex: number, field: "weight" | "reps", value: number) => {
    const updatedWorkout = [...currentWorkout]
    const currentExercise = updatedWorkout[exerciseIndex]

    // If it's a bodyweight exercise, weight cannot be changed via input
    if (currentExercise.isBodyweight && field === "weight") {
      return
    }

    // If the first set is being updated, propagate the value to all other sets
    // This logic is now handled by the toggleBodyweight function for weight,
    // but remains for reps if needed.
    if (setIndex === 0 && field === "reps") {
      updatedWorkout[exerciseIndex].sets.forEach((set) => {
        set[field] = value
      })
    } else if (field === "reps") {
      // Otherwise, just update the specific set for reps
      updatedWorkout[exerciseIndex].sets[setIndex][field] = value
    } else if (field === "weight") {
      // For weight, if it's not bodyweight, update all sets from the first set's input
      if (!currentExercise.isBodyweight && setIndex === 0) {
        updatedWorkout[exerciseIndex].sets.forEach((set) => {
          set.weight = value
        })
      } else if (!currentExercise.isBodyweight) {
        // If not bodyweight and not the first set, update only this specific set
        updatedWorkout[exerciseIndex].sets[setIndex].weight = value
      }
    }
    setCurrentWorkout(updatedWorkout)
  }

  const toggleBodyweight = (exerciseIndex: number, checked: boolean) => {
    const updatedWorkout = [...currentWorkout]
    const exerciseToUpdate = updatedWorkout[exerciseIndex]

    exerciseToUpdate.isBodyweight = checked
    // If setting to bodyweight, set weight to user's bodyweight from profile for all sets
    // If unsetting, reset weight to 0 or previous value (here, 0 for simplicity)
    exerciseToUpdate.sets.forEach((set) => {
      set.weight = checked ? userProfile.weight : 0 // Set to user's body weight or 0
    })
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

  const saveWorkout = async () => {
    const newWorkout: any = {
      date: new Date().toISOString(),
      exercises: currentWorkout, // Will be stored as JSONB
      type: "workout", // You can adjust this as needed
      notes: "", // Add notes if needed
      created_at: new Date().toISOString(),
    };
    if (user) {
      try {
        await insertWorkout({ ...newWorkout, user_id: user.id });
        toast({
          title: "Workout saved",
          description: "Your workout has been saved to the cloud.",
          variant: "success",
        });
        // Refetch workouts
        getWorkouts(user.id).then((data) => setCloudWorkouts(data || []));
      } catch (e) {
        toast({
          title: "Error",
          description: "Failed to save workout to Supabase.",
          variant: "destructive",
        });
      }
    } else {
      // Fallback to local storage
      const updatedWorkouts = { ...workouts };
      if (!updatedWorkouts[selectedDay]) {
        updatedWorkouts[selectedDay] = [];
      }
      updatedWorkouts[selectedDay].push({ ...newWorkout, id: Date.now().toString() });
      setWorkouts(updatedWorkouts);
      toast({
        title: "Workout saved locally",
        description: "Sign in to sync your workouts to the cloud.",
        variant: "success",
      });
    }
  };

  // Save an AI suggestion to Supabase
  const saveAISuggestion = async (suggestionData: any) => {
    console.log("[App] saveAISuggestion called with:", suggestionData);
    if (user) {
      try {
        await insertAISuggestion({
          user_id: user.id,
          suggestion_data: suggestionData,
          created_at: new Date().toISOString(),
        });
        console.log("[App] AI suggestion saved to Supabase!");
        getAISuggestions(user.id).then((data) => {
          setCloudAISuggestions(data || []);
          console.log("[App] Fetched AI suggestions from Supabase:", data);
        });
      } catch (e) {
        console.error("[App] Error saving AI suggestion to Supabase:", e);
      }
    } else {
      console.warn("[App] User not signed in, AI suggestion not saved to Supabase.");
    }
  };

  // Example: Call saveAISuggestion when a new AI suggestion is generated
  // You should call this wherever your AI logic generates a new suggestion
  // For example, after getSuggestedIncrement is called and a new suggestion is made:
  // const { weightIncrement, repsIncrement } = getSuggestedIncrement(...);
  // saveAISuggestion({ exerciseId, weightIncrement, repsIncrement, ... });

  const toggleDayRest = (checked: boolean) => {
    setIsDayRest(checked)

    // Update global rest days if needed
    if (checked && !restDays.includes(selectedDay)) {
      setRestDays([...restDays, selectedDay])
    } else if (!checked && restDays.includes(selectedDay)) {
      setRestDays(restDays.filter((day) => day !== selectedDay))
    }
  }

  const handleCreateCustomExercise = () => {
    if (!newExercise.name.trim()) {
      toast({
        title: "Error",
        description: "Exercise name is required",
        variant: "destructive",
      })
      return
    }

    // Create new exercise with specified number of sets and propagate initial weight/reps
    const newExerciseId = `custom-${Date.now()}`
    let customExercise: Exercise

    if (newExercise.muscleGroup === "cardio") {
      customExercise = {
        id: newExerciseId,
        name: newExercise.name,
        muscleGroup: newExercise.muscleGroup,
        sets: [{ weight: newExercise.weight, reps: newExercise.reps, completed: false }], // weight for distance, reps for time
        custom: true,
        currentActiveSetIndex: 0,
        isBodyweight: newExercise.isBodyweight,
      }
    } else {
      customExercise = {
        id: newExerciseId,
        name: newExercise.name,
        muscleGroup: newExercise.muscleGroup,
        sets: Array.from({ length: newExercise.numSets }).map(() => ({
          weight: newExercise.isBodyweight ? userProfile.weight : newExercise.weight, // Use user's bodyweight if checked
          reps: newExercise.reps,
          completed: false,
        })),
        custom: true,
        isBodyweight: newExercise.isBodyweight,
        currentActiveSetIndex: 0,
      }
    }

    // Add to exercises list
    setExercises([...exercises, customExercise])

    // Add to current workout
    setCurrentWorkout([...currentWorkout, customExercise])

    // Reset form
    setNewExercise({
      name: "",
      muscleGroup: "chest",
      weight: 0,
      reps: 8,
      numSets: 3,
      isBodyweight: false,
    })

    setShowNewExerciseDialog(false)

    toast({
      title: "Exercise created",
      description: `${newExercise.name} has been added to your workout.`,
    })
  }

  // Day Management Functions
  const handleAddDay = () => {
    const trimmedName = newExercise.name.trim().toLowerCase() // Reusing newExercise.name for new day input
    if (!trimmedName) {
      toast({ title: "Error", description: "Day name cannot be empty.", variant: "destructive" })
      return
    }
    if (orderedDays.includes(trimmedName)) {
      toast({ title: "Error", description: "Day with this name already exists.", variant: "destructive" })
      return
    }

    setWorkouts((prev) => ({ ...prev, [trimmedName]: [] }))
    setRestDays((prev) => prev.filter((day) => day !== trimmedName)) // New days are not rest days by default
    setOrderedDays((prev) => [...prev, trimmedName]) // Add to the end of ordered days
    setNewExercise((prev) => ({ ...prev, name: "" })) // Clear the input
    toast({ title: "Day Added", description: `"${trimmedName}" has been added to your workout days.` })
  }

  const handleRemoveDay = (dayToRemove: string) => {
    if (defaultDayOrder.includes(dayToRemove)) {
      toast({
        title: "Error",
        description: "Default days (Monday-Sunday) cannot be removed.",
        variant: "destructive",
      })
      return
    }

    const updatedWorkouts = { ...workouts }
    delete updatedWorkouts[dayToRemove]
    setWorkouts(updatedWorkouts)

    setRestDays((prev) => prev.filter((day) => day !== dayToRemove))
    setOrderedDays((prev) => prev.filter((day) => day !== dayToRemove))

    if (selectedDay === dayToRemove) {
      setSelectedDay(orderedDays[0] || "monday") // Fallback to first available or Monday
    }
    toast({ title: "Day Removed", description: `"${dayToRemove}" has been removed.` })
  }

  const handleRenameDay = (oldName: string) => {
    const trimmedNewName = editingDayNewValue.trim().toLowerCase()

    if (!trimmedNewName) {
      toast({ title: "Error", description: "New day name cannot be empty.", variant: "destructive" })
      return
    }
    if (oldName === trimmedNewName) {
      toast({ title: "Error", description: "New name is the same as the old name.", variant: "destructive" })
      return
    }
    if (orderedDays.includes(trimmedNewName) && trimmedNewName !== oldName) {
      toast({ title: "Error", description: "New day name already exists.", variant: "destructive" })
      return
    }
    if (defaultDayOrder.includes(oldName) && defaultDayOrder.includes(trimmedNewName) && oldName !== trimmedNewName) {
      toast({
        title: "Error",
        description: "Cannot rename a default day to another default day's name.",
        variant: "destructive",
      })
      return
    }

    const updatedWorkouts = { ...workouts }
    updatedWorkouts[trimmedNewName] = updatedWorkouts[oldName]
    delete updatedWorkouts[oldName]
    setWorkouts(updatedWorkouts)

    setRestDays((prev) => {
      if (prev.includes(oldName)) {
        return [...prev.filter((day) => day !== oldName), trimmedNewName]
      }
      return prev
    })

    setOrderedDays((prev) => prev.map((day) => (day === oldName ? trimmedNewName : day)))

    if (selectedDay === oldName) {
      setSelectedDay(trimmedNewName)
    }
    setEditingDayName(null)
    setEditingDayNewValue("")
    toast({ title: "Day Renamed", description: `"${oldName}" renamed to "${trimmedNewName}".` })
  }

  const moveDay = (index: number, direction: "up" | "down") => {
    const newOrderedDays = [...orderedDays]
    const newIndex = direction === "up" ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < newOrderedDays.length) {
      // Swap elements
      ;[newOrderedDays[index], newOrderedDays[newIndex]] = [newOrderedDays[newIndex], newOrderedDays[index]]
      setOrderedDays(newOrderedDays)
    }
  }

  // Use cloudWorkouts if signed in, otherwise use local workouts
  const displayedWorkouts = user
    ? (cloudWorkouts.filter(w => w.date && w.exercises)
        .map(w => ({ ...w, exercises: typeof w.exercises === 'string' ? JSON.parse(w.exercises) : w.exercises }))
        .filter(w => w)
        .filter(w => {
            // Filter by selectedDay if you want only that day's workouts
            // Uncomment the next line to filter by selectedDay:
            // return w.day === selectedDay;
            return true;
        })
      )
    : (workouts[selectedDay] || []);

  // Use cloudAISuggestions if signed in, otherwise use local fallback (if any)
  const displayedAISuggestions = user ? cloudAISuggestions : [];

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Today's Workout</h1>

      <div className="mb-6">
        <Label htmlFor="day">Workout Day</Label>
        <Select
          value={selectedDay}
          onValueChange={(value) => {
            setSelectedDay(value)
            // The useEffect will handle updating isDayRest and currentWorkout based on the new selectedDay
          }}
        >
          <SelectTrigger id="day">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {orderedDays.map((day) => (
              <SelectItem key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)} {restDays.includes(day) ? "(Rest Day)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <Checkbox id="rest-day-toggle" checked={isDayRest} onCheckedChange={toggleDayRest} />
        <Label htmlFor="rest-day-toggle" className="font-medium cursor-pointer">
          Rest Day
        </Label>
      </div>

      {isDayRest ? (
        <Card>
          <CardHeader>
            <CardTitle>Rest Day</CardTitle>
            <CardDescription>This is a scheduled rest day</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-amber-500 mb-4">
              <Coffee className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-center mb-2">Today is a scheduled rest day.</p>
            <p className="text-center text-sm text-muted-foreground">
              Recovery is essential for muscle growth. Take time to stretch, hydrate, and prepare for your next workout.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6">
              {displayedWorkouts.length === 0 ? (
                <div className="text-center text-muted-foreground">No workouts found.</div>
              ) : (
                displayedWorkouts.map((workout: Workout, workoutIndex: number) => (
                  <div key={workout.id || workoutIndex} className="mb-6">
                    <div className="font-semibold mb-2">{workout.date ? new Date(workout.date).toLocaleString() : ""}</div>
                    {workout.exercises && workout.exercises.length > 0 ? (
                      workout.exercises.map((exercise: Exercise, exerciseIndex: number) => (
                        <Card key={`${exercise.id}-${exerciseIndex}`}>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle>{exercise.name}</CardTitle>
                              <Button variant="ghost" size="icon" onClick={() => removeExerciseFromWorkout(exerciseIndex)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardDescription>
                              {exercise.sets.length} {exercise.sets.length === 1 ? "set" : "sets"} • {exercise.muscleGroup}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {exercise.sets.map((set: { weight: number; reps: number; completed: boolean }, setIndex: number) => (
                                <div key={setIndex} className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`}>
                                        {exercise.muscleGroup === "cardio" ? "Distance (miles)" : "Weight (lbs)"}
                                      </Label>
                                      {exercise.muscleGroup !== "cardio" && setIndex === 0 && (
                                        <div className="flex items-center space-x-1">
                                          <Label
                                            htmlFor={`bodyweight-${exerciseIndex}-${setIndex}`}
                                            className="text-xs text-muted-foreground"
                                          >
                                            Body Weight
                                          </Label>
                                          <Checkbox
                                            id={`bodyweight-${exerciseIndex}-${setIndex}`}
                                            checked={exercise.isBodyweight || false}
                                            onCheckedChange={(checked) => toggleBodyweight(exerciseIndex, checked as boolean)}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <Input
                                      id={`weight-${exerciseIndex}-${setIndex}`}
                                      type="number"
                                      value={exercise.isBodyweight ? userProfile.weight : set.weight}
                                      onChange={(e) =>
                                        updateSetValue(exerciseIndex, setIndex, "weight", Number(e.target.value))
                                      }
                                      disabled={exercise.isBodyweight} // Disable if it's a bodyweight exercise
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
                                    />
                                  </div>
                                  {/* Removed set completion button from here as it's only in session page */}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            {exercise.muscleGroup !== "cardio" && (
                              <Button variant="outline" size="sm" onClick={() => addSet(exerciseIndex)}>
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
                              >
                                <Timer className="h-4 w-4 mr-2" />
                                Rest Timer
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="text-muted-foreground">No exercises in this workout.</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* AI Suggestions Section */}
          {displayedAISuggestions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-2">AI Suggestions</h2>
              <div className="space-y-2">
                {displayedAISuggestions.map((s, i) => (
                  <Card key={s.id || i}>
                    <CardContent>
                      <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(s.suggestion_data, null, 2)}</pre>
                      <div className="text-muted-foreground text-xs mt-1">
                        {s.created_at ? new Date(s.created_at).toLocaleString() : ""}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="add-exercise">Add Exercise</Label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger id="add-exercise">
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises
                      .filter((e) => !currentWorkout.some((ce) => ce.id === e.id))
                      .map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name} ({exercise.muscleGroup}) {exercise.custom ? "• Custom" : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addExerciseToWorkout}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setShowNewExerciseDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Exercise
              </Button>

              <Button className="flex-1" onClick={saveWorkout}>
                <Save className="h-4 w-4 mr-2" />
                Save Workout
              </Button>
            </div>

            <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowManageDaysDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Manage Workout Days
            </Button>
          </div>
        </>
      )}

      {showRestTimer && restTimerExerciseDetails && (
        <RestTimer
          muscleGroup={restTimerExerciseDetails.muscleGroup}
          exerciseName={restTimerExerciseDetails.exerciseName}
          onClose={() => setShowRestTimer(false)}
        />
      )}

      <Dialog open={showNewExerciseDialog} onOpenChange={setShowNewExerciseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Exercise</DialogTitle>
            <DialogDescription>
              Add a new exercise to your workout routine. This will be saved for future workouts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exercise-name">Exercise Name</Label>
              <Input
                id="exercise-name"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="e.g., Cable Fly, Lateral Raise"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="muscle-group">Muscle Group</Label>
              <Select
                value={newExercise.muscleGroup}
                onValueChange={(value) => {
                  setNewExercise({
                    ...newExercise,
                    muscleGroup: value,
                    numSets: value === "cardio" ? 1 : 3, // Default sets for cardio is 1
                  })
                }}
              >
                <SelectTrigger id="muscle-group">
                  <SelectValue placeholder="Select muscle group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chest">Chest</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                  <SelectItem value="legs">Legs</SelectItem>
                  <SelectItem value="shoulders">Shoulders</SelectItem>
                  <SelectItem value="arms">Arms</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-weight">
                  {newExercise.muscleGroup === "cardio" ? "Default Distance (miles)" : "Default Weight (lbs)"}
                </Label>
                <Input
                  id="default-weight"
                  type="number"
                  value={newExercise.weight}
                  onChange={(e) => setNewExercise({ ...newExercise, weight: Number(e.target.value) })}
                  disabled={newExercise.isBodyweight} // Disable if bodyweight is checked
                  placeholder={newExercise.isBodyweight ? "Body Weight" : "Enter weight"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-reps">
                  {newExercise.muscleGroup === "cardio" ? "Default Time (minutes)" : "Default Reps"}
                </Label>
                <Input
                  id="default-reps"
                  type="number"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: Number(e.target.value) })}
                />
              </div>
            </div>

            {newExercise.muscleGroup !== "cardio" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-bodyweight"
                  checked={newExercise.isBodyweight}
                  onCheckedChange={(checked) => setNewExercise({ ...newExercise, isBodyweight: checked as boolean })}
                />
                <Label htmlFor="is-bodyweight">Body Weight Exercise</Label>
              </div>
            )}

            {newExercise.muscleGroup !== "cardio" && (
              <div className="space-y-2">
                <Label htmlFor="num-sets">Number of Sets</Label>
                <Input
                  id="num-sets"
                  type="number"
                  value={newExercise.numSets}
                  onChange={(e) => setNewExercise({ ...newExercise, numSets: Number(e.target.value) })}
                  min={1}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewExerciseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomExercise}>Create Exercise</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Days Dialog */}
      <Dialog open={showManageDaysDialog} onOpenChange={setShowManageDaysDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Workout Days</DialogTitle>
            <DialogDescription>Organize your workout days: reorder, rename, add, or remove.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-2">
              {orderedDays.map((day, index) => (
                <div key={day} className="flex items-center gap-2 p-2 border rounded-md">
                  {editingDayName === day ? (
                    <Input
                      value={editingDayNewValue}
                      onChange={(e) => setEditingDayNewValue(e.target.value)}
                      onBlur={() => handleRenameDay(day)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRenameDay(day)
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 capitalize">{day}</span>
                  )}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingDayName(day)
                        setEditingDayNewValue(day)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => moveDay(index, "up")} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveDay(index, "down")}
                      disabled={index === orderedDays.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDay(day)}
                      disabled={defaultDayOrder.includes(day)} // Disable removal of default days
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-end gap-2 pt-4 border-t">
            <div className="flex-1">
              <Label htmlFor="new-day-name-input">New Day Name</Label>
              <Input
                id="new-day-name-input"
                value={newExercise.name} // Reusing newExercise.name for new day input
                onChange={(e) => setNewExercise((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Push Day"
              />
            </div>
            <Button onClick={handleAddDay} disabled={!newExercise.name.trim()}>
              <Plus className="h-4 w-4 mr-2" /> Add Day
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageDaysDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
