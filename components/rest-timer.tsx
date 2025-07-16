"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Pause, Play, Volume2, VolumeX } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

type RestTimerProps = {
  muscleGroup: string
  exerciseName: string
  onClose: () => void
}

// AI-suggested rest times based on muscle group and exercise type
const getRecommendedRestTime = (muscleGroup: string, exerciseName: string): number => {
  // Compound exercises generally need more rest
  const isCompound = ["Squat", "Deadlift", "Bench Press", "Shoulder Press", "Barbell Row", "Pull-up"].some((name) =>
    exerciseName.includes(name),
  )

  // Large muscle groups need more rest
  const isLargeMuscleGroup = ["legs", "back", "chest"].includes(muscleGroup.toLowerCase())

  if (isCompound && isLargeMuscleGroup) {
    return 180 // 3 minutes for compound exercises targeting large muscle groups
  } else if (isCompound) {
    return 150 // 2.5 minutes for compound exercises
  } else if (isLargeMuscleGroup) {
    return 120 // 2 minutes for large muscle groups
  } else {
    return 90 // 1.5 minutes for isolation exercises and smaller muscle groups
  }
}

export function RestTimer({ muscleGroup, exerciseName, onClose }: RestTimerProps) {
  const [timerSettings, setTimerSettings] = useLocalStorage<Record<string, number>>("timer-settings", {})

  // Get recommended rest time or use saved setting if available
  const recommendedTime = getRecommendedRestTime(muscleGroup, exerciseName)
  const savedTime = timerSettings[`${muscleGroup}-${exerciseName}`]

  const [timeLeft, setTimeLeft] = useState(savedTime || recommendedTime)
  const [initialTime] = useState(savedTime || recommendedTime)
  const [isRunning, setIsRunning] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [customTime, setCustomTime] = useState(savedTime || recommendedTime)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0 && !isMuted) {
      // Play sound when timer ends
      const audio = new Audio("/timer-end.mp3")
      audio.play().catch((err) => console.error("Could not play sound:", err))
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, isMuted])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setTimeLeft(initialTime)
    setIsRunning(true)
  }

  const saveCustomTime = () => {
    // Save this custom time for this specific exercise/muscle group
    const updatedSettings = { ...timerSettings, [`${muscleGroup}-${exerciseName}`]: customTime }
    setTimerSettings(updatedSettings)
    setTimeLeft(customTime)
    setIsRunning(true)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const progressPercentage = (timeLeft / initialTime) * 100

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        {/* Moved the close button to the very top */}
        <Button className="w-full rounded-b-none" size="lg" onClick={onClose}>
          Close
        </Button>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Rest Timer</CardTitle>
              <CardDescription>
                AI-suggested rest for {exerciseName} ({muscleGroup})
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{formatTime(timeLeft)}</div>
            <p className="text-sm text-muted-foreground">{isRunning ? "Rest in progress..." : "Timer paused"}</p>
          </div>

          <Progress value={progressPercentage} className="h-2" />

          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="icon" onClick={toggleTimer}>
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={resetTimer}>
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Customize Rest Time</p>
            <div className="flex gap-2">
              <div className="grid grid-cols-3 gap-2 flex-1">
                {[60, 90, 120, 150, 180, 240].map((seconds) => (
                  <Button
                    key={seconds}
                    variant="outline"
                    size="sm"
                    className={customTime === seconds ? "border-primary" : ""}
                    onClick={() => setCustomTime(seconds)}
                  >
                    {formatTime(seconds)}
                  </Button>
                ))}
              </div>
              <Button onClick={saveCustomTime}>Apply</Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Why this rest time?</p>
            <p>
              {muscleGroup === "legs" || muscleGroup === "back"
                ? "Larger muscle groups like legs and back typically need more rest between sets."
                : muscleGroup === "chest" || muscleGroup === "shoulders"
                  ? "Chest and shoulder exercises benefit from adequate rest to maintain proper form."
                  : "Smaller muscle groups typically require less rest between sets."}
            </p>
            <p className="mt-1">
              {exerciseName.includes("Squat") ||
              exerciseName.includes("Deadlift") ||
              exerciseName.includes("Bench Press")
                ? "Compound movements like this require more recovery between sets for optimal performance."
                : "Adjust the timer based on your training intensity and goals."}
            </p>
          </div>
        </CardContent>
        {/* Removed CardFooter as the button is now at the top */}
      </Card>
    </div>
  )
}
