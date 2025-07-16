// types/workout.ts
export type UserProfile = {
  name: string
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
  currentActiveSetIndex: number // Used for session tracking
  isBodyweight?: boolean
}

export type Workout = {
  id: string
  date: string
  exercises: Exercise[]
  durationInMinutes?: number
}

export type MuscleGroup = "chest" | "back" | "legs" | "shoulders" | "arms" | "core" | "cardio"
