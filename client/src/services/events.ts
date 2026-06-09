import { supabase } from "./supabase"

export interface EventData {
  id: string
  title: string
  date: string
  location: string
  description: string | null
  created_at: string
}

export async function getUpcomingEvents(): Promise<EventData[]> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(5)

    if (error) {
      if (!error.message?.includes("relation") && !error.message?.includes("does not exist")) {
        console.error("Error fetching events:", error)
      }
      return []
    }

    return (data as EventData[]) ?? []
  } catch {
    return []
  }
}

export async function createEvent(event: Omit<EventData, "id" | "created_at">): Promise<EventData | null> {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert(event)
      .select()
      .single()

    if (error) {
      console.error("Error creating event:", error)
      return null
    }

    return data as EventData
  } catch (e) {
    console.error("Error creating event:", e)
    return null
  }
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)

    if (error) {
      console.error("Error deleting event:", error)
      return false
    }

    return true
  } catch (e) {
    console.error("Error deleting event:", e)
    return false
  }
}
