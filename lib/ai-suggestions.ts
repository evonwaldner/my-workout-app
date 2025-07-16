import type { Exercise, Workout } from "@/app/workout/page" // Assuming Exercise and Workout types are defined here

// Define a simplified UserProfile type for this module's needs
type UserProfile = {
  name: string // Added name to UserProfile
  weight: number
  height: number
  progressiveOverload: {
    enabled: boolean
  }
}

// Helper to get all historical instances of a specific exercise
const getExerciseHistory = (
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

export const getSuggestedIncrement = (
  exercise: Exercise,
  allWorkouts: Record<string, Workout[]>,
  userProfile: UserProfile,
): { weightIncrement: number; repsIncrement: number; message: string } => {
  console.log("[AI] getSuggestedIncrement called with:", { exercise, allWorkouts, userProfile });
  if (!userProfile.progressiveOverload.enabled) {
    console.log("[AI] Progressive overload disabled for userProfile:", userProfile);
    return { weightIncrement: 0, repsIncrement: 0, message: "Progressive overload is disabled." }
  }

  const history = getExerciseHistory(exercise.id, allWorkouts)
  console.log("[AI] Exercise history:", history);

  let suggestedWeightIncrement = 0
  let suggestedRepsIncrement = 0
  let message = "Maintain current performance."

  if (exercise.muscleGroup === "cardio") {
    const lastSession = history[0]
    if (lastSession && lastSession.sets.every((set) => set.completed)) {
      suggestedWeightIncrement = 0.1
      suggestedRepsIncrement = 0
      message = `Great job! Try increasing distance by ${suggestedWeightIncrement} miles.`
      console.log("[AI] Cardio: All sets completed. Suggest increment:", { suggestedWeightIncrement, suggestedRepsIncrement, message });
    } else if (lastSession && !lastSession.sets.every((set) => set.completed)) {
      message = "Focus on completing your current cardio goal."
      console.log("[AI] Cardio: Not all sets completed.");
    } else {
      message = "No previous cardio data. Start with your target."
      console.log("[AI] Cardio: No previous data.");
    }
  } else {
    // Strength exercise logic
    const lastSession = history[0] // Most recent workout for this exercise

    if (lastSession) {
      const targetReps = exercise.sets[0]?.reps || 8 // Assuming target reps are consistent across sets

      // Handle "till failure" exercises (reps: 0) separately
      if (targetReps === 0) {
        const allSetsCompleted = lastSession.sets.every((set) => set.completed)
        if (allSetsCompleted) {
          // For till failure, if all sets were completed, suggest a small weight increase
          // For bodyweight, this means aiming for more reps or harder variations
          if (exercise.isBodyweight) {
            message = "All bodyweight sets completed! Aim for more reps or a harder variation next time."
            console.log("[AI] Bodyweight till failure: All sets completed.");
          } else if (
            exercise.muscleGroup === "legs" ||
            exercise.muscleGroup === "back" ||
            exercise.muscleGroup === "chest"
          ) {
            suggestedWeightIncrement = 2.5 // Smaller increment for bodyweight/till failure
          } else {
            suggestedWeightIncrement = 1
          }
          if (!exercise.isBodyweight) {
            message = `All sets completed (to failure)! Try increasing weight by ${suggestedWeightIncrement} lbs or aim for more reps.`
            console.log("[AI] Till failure: Suggest increment:", { suggestedWeightIncrement, message });
          }
        } else {
          message = "Focus on completing all sets to failure."
          console.log("[AI] Till failure: Not all sets completed.");
        }
      } else {
        // Standard rep-based strength exercises
        const repThresholdForIncrease = targetReps * 1.6 // 60% above minimum reps
        let shouldIncreaseWeight = false

        // Check if any completed set in the last session exceeded the 60% threshold
        for (const set of lastSession.sets) {
          if (set.completed && set.reps >= repThresholdForIncrease) {
            shouldIncreaseWeight = true
            break // Found a set that qualifies for weight increase
          }
        }

        if (shouldIncreaseWeight) {
          // Use AI's discretion for how much more to increase weight
          if (exercise.isBodyweight) {
            // For bodyweight, if reps exceeded, suggest increasing reps or moving to harder variation
            suggestedRepsIncrement = Math.max(1, Math.floor(targetReps * 0.1)) // Suggest 10% more reps, minimum 1
            message = `Excellent! You exceeded reps by 60% in a set. Try increasing reps by ${suggestedRepsIncrement} or move to a harder variation.`
            console.log("[AI] Bodyweight: Exceeded rep threshold. Suggest increment:", { suggestedRepsIncrement, message });
          } else if (
            exercise.muscleGroup === "legs" ||
            exercise.muscleGroup === "back" ||
            exercise.muscleGroup === "chest"
          ) {
            suggestedWeightIncrement = 5 // lbs for larger muscle groups/compound lifts
          } else {
            suggestedWeightIncrement = 2.5 // lbs for smaller muscle groups/isolation lifts
          }
          if (!exercise.isBodyweight) {
            message = `Excellent! You exceeded reps by 60% in a set. Try increasing weight by ${suggestedWeightIncrement} lbs.`
            console.log("[AI] Strength: Exceeded rep threshold. Suggest increment:", { suggestedWeightIncrement, message });
          }
        } else {
          // If not increasing weight, check if all sets were completed at target reps
          const allSetsCompletedAtTarget = lastSession.sets.every((set) => set.completed && set.reps >= targetReps)
          if (allSetsCompletedAtTarget) {
            message = "All sets completed at target reps. Maintain weight, focus on form or slight rep increase."
            console.log("[AI] All sets completed at target reps.");
          } else {
            message = "Focus on completing all sets at target reps."
            console.log("[AI] Not all sets completed at target reps.");
          }
        }
      }
    } else {
      message = "No previous data. Start with your planned weight/reps."
      console.log("[AI] No previous data for strength exercise.");
    }
  }

  console.log("[AI] getSuggestedIncrement returning:", { weightIncrement: suggestedWeightIncrement, repsIncrement: suggestedRepsIncrement, message });
  return { weightIncrement: suggestedWeightIncrement, repsIncrement: suggestedRepsIncrement, message }
}
