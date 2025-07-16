// lib/workout-utils.ts
import type { Exercise, Workout } from "@/types/workout"

/**
 * Helper function to propagate weight/reps from the first set to all sets.
 * Useful when initializing an exercise or when the first set's values should apply to all.
 */
export const propagateSetDetails = (exercise: Exercise): Exercise => {
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

/**
 * Helper to get all historical instances of a specific exercise.
 */
export const getExerciseHistory = (
  exerciseId: string,
  allWorkouts: Record<string, Workout[]>,
): { date: string; sets: { weight: number; reps: number; completed: boolean }[] }[] => {
  const history: { date: string; sets: { weight: number; reps: number; completed: boolean }[] }[] = []
  Object.values(allWorkouts).forEach((dayWorkouts) => {
    dayWorkouts.forEach((workout) => {
      const foundExercise = workout.exercises.find((ex) => ex.id === exerciseId)
      if (foundExercise) {
        history.push({ date: workout.date, sets: foundExercise.sets })
      }
    })
  })
  // Sort by date descending to get most recent first
  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Calculates the estimated One-Rep Max (1RM) using the Epley formula.
 * Formula: Weight * (1 + Reps / 30)
 * Returns 0 if reps are 0 or weight is 0.
 */
export const calculate1RM = (weight: number, reps: number): number => {
  if (reps === 0 || weight === 0) return 0
  return Math.round(weight * (1 + reps / 30))
}
