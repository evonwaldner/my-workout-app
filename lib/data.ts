// lib/data.ts
import type { Exercise, Workout } from "@/types/workout"

export const defaultExercises: Exercise[] = [
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
  },
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
  },
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
]

export const initialWorkouts: Record<string, Workout[]> = {
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
  saturday: [],
  sunday: [],
}
