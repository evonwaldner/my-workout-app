import { supabase } from "@/lib/supabaseClient";

export async function getWorkouts(userId: string) {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertWorkout(workout: any) {
  const { data, error } = await supabase
    .from("workouts")
    .insert([workout]);
  if (error) throw error;
  return data;
}

export async function updateWorkout(id: number, updates: any) {
  const { data, error } = await supabase
    .from("workouts")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
  return data;
} 