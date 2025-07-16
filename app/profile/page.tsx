"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabaseClient"
import { getProfile, upsertProfile } from "@/lib/supabaseProfile"

type UserProfile = {
  name: string
  weight: number
  height: {
    feet: number
    inches: number
  }
  progressiveOverload: {
    enabled: boolean
    // weightIncrement: number; // Removed: This will now be AI-driven
  }
}

export default function ProfilePage() {
  const { toast } = useToast()
  const [profile, setProfile] = useLocalStorage<UserProfile>("user-profile", {
    name: "",
    weight: 0,
    height: { feet: 0, inches: 0 },
    progressiveOverload: {
      enabled: true,
    },
  })
  const [restDays, setRestDays] = useLocalStorage<string[]>("rest-days", ["saturday", "sunday"])
  const [formData, setFormData] = useState<UserProfile>(profile)
  const [user, setUser] = useState<any>(null)
  // Load user and profile from Supabase on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        getProfile(data.user.id)
          .then((dbProfile) => {
            if (dbProfile) {
              setFormData({
                name: dbProfile.name || "",
                weight: dbProfile.weight || 0,
                height: {
                  feet: dbProfile.height_feet || 0,
                  inches: dbProfile.height_inches || 0,
                },
                progressiveOverload: {
                  enabled: dbProfile.progressive_overload_enabled ?? true,
                },
              })
            }
          })
          .catch(() => {})
      }
    })
  }, [])

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleHeightChange = (subfield: 'feet' | 'inches', value: number) => {
    setFormData({
      ...formData,
      height: {
        ...formData.height,
        [subfield]: value,
      },
    })
  }

  const handleProgressiveOverloadChange = (field: keyof typeof formData.progressiveOverload, value: any) => {
    setFormData({
      ...formData,
      progressiveOverload: {
        ...formData.progressiveOverload,
        [field]: value,
      },
    })
  }

  const toggleRestDay = (day: string) => {
    if (restDays.includes(day)) {
      setRestDays(restDays.filter((d) => d !== day))
    } else {
      setRestDays([...restDays, day])
    }
  }

  const saveProfile = async () => {
    if (user) {
      // Save to Supabase
      try {
        await upsertProfile({
          user_id: user.id,
          name: formData.name,
          weight: formData.weight,
          height_feet: formData.height.feet,
          height_inches: formData.height.inches,
          progressive_overload_enabled: formData.progressiveOverload.enabled,
        })
        toast({
          title: "Profile saved",
          description: "Your profile has been updated to the cloud.",
          variant: "success",
        })
      } catch (e) {
        toast({
          title: "Error",
          description: "Failed to save profile to Supabase.",
          variant: "destructive",
        })
      }
    } else {
      // Fallback to local storage
      setProfile(formData)
      toast({
        title: "Profile saved locally",
        description: "Sign in to sync your profile to the cloud.",
        variant: "success",
      })
    }
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight || ""}
              onChange={(e) => handleChange("weight", Number(e.target.value))}
              placeholder="Your weight in pounds"
            />
          </div>

          <div className="space-y-2">
            <Label>Height</Label>
            <div className="flex gap-2">
              <div className="flex items-center">
                <Input
                  id="height-feet"
                  type="number"
                  min={0}
                  value={formData.height.feet || ""}
                  onChange={(e) => handleHeightChange("feet", Number(e.target.value))}
                  placeholder="feet"
                  className="w-20"
                />
                <span className="ml-2">ft</span>
              </div>
              <div className="flex items-center">
                <Input
                  id="height-inches"
                  type="number"
                  min={0}
                  max={11}
                  value={formData.height.inches || ""}
                  onChange={(e) => handleHeightChange("inches", Number(e.target.value))}
                  placeholder="inches"
                  className="w-24"
                />
                <span className="ml-2">in</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Progressive Overload Settings</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="progressive-overload">Enable Progressive Overload</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically suggest weight/distance increments based on performance
                </p>
              </div>
              <Switch
                id="progressive-overload"
                checked={formData.progressiveOverload.enabled}
                onCheckedChange={(checked) => handleProgressiveOverloadChange("enabled", checked)}
              />
            </div>

            {/* New explanation for progressive overload logic */}
            <p className="text-xs text-muted-foreground mt-2">
              The model suggests weight increases for strength exercises if you exceed your target reps by 60% in any
              set. For cardio, it suggests increasing distance if your previous goal was met. This helps ensure optimal
              muscle growth over time.
            </p>

            {/* Removed weight-increment input as it's now AI-driven */}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={saveProfile}>
            Save Profile
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rest Days</CardTitle>
          <CardDescription>Configure your weekly rest days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Rest days are essential for recovery and muscle growth. Select the days you want to designate as rest
              days.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rest-day-${day}`}
                    checked={restDays.includes(day)}
                    onCheckedChange={() => toggleRestDay(day)}
                  />
                  <Label htmlFor={`rest-day-${day}`} className="capitalize">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
