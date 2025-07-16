import { supabase } from "@/lib/supabaseClient";

export async function getAISuggestions(userId: string) {
  console.log("[Supabase] getAISuggestions called with userId:", userId);
  const { data, error } = await supabase
    .from("ai_suggestions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[Supabase] getAISuggestions error:", error);
    throw error;
  }
  console.log("[Supabase] getAISuggestions result:", data);
  return data;
}

export async function insertAISuggestion(suggestion: any) {
  console.log("[Supabase] insertAISuggestion called with:", suggestion);
  const { data, error } = await supabase
    .from("ai_suggestions")
    .insert([suggestion]);
  if (error) {
    console.error("[Supabase] insertAISuggestion error:", error);
    throw error;
  }
  console.log("[Supabase] insertAISuggestion result:", data);
  return data;
} 