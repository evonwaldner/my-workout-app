import { supabase } from "@/lib/supabaseClient";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertProfile(profile: {
  user_id: string,
  name: string,
  weight: number,
  height_feet: number,
  height_inches: number,
  progressive_overload_enabled: boolean
}) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert([profile]);
  if (error) throw error;
  return data;
} 