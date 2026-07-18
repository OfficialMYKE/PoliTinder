import { supabase } from "./supabase"

const API_URL = import.meta.env.VITE_API_URL || ""

export interface PremiumPlan {
  id: string
  name: string
  price: number
  priceFrequency: string
  description: string
  features: string[]
  ctaText: string
  isFeatured?: boolean
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: "basic",
    name: "Básico",
    price: 0,
    priceFrequency: "",
    description: "Todo lo que necesitas para empezar a conectar con compañeros.",
    features: [
      "Perfil personalizado",
      "Hasta 10 matches por día",
      "Mensajes ilimitados con matches",
      "Publicar en el feed",
      "Unirse a grupos de estudio",
    ],
    ctaText: "Tu plan actual",
  },
  {
    id: "premium",
    name: "Premium",
    price: 4.99,
    priceFrequency: "/mes",
    description: "Para quienes quieren destacar y conectar más rápido.",
    features: [
      "Todo lo del plan Básico",
      "Matches ilimitados",
      "Perfil destacado en descubrimiento",
      "Ver quién reaccionó a tu perfil",
      "Mensajes prioritarios",
      "Sin publicidad",
      "Soporte prioritario",
    ],
    ctaText: "Elegir Premium",
    isFeatured: true,
  },
  {
    id: "premium_plus",
    name: "Premium+",
    price: 9.99,
    priceFrequency: "/mes",
    description: "La experiencia completa para los más ambiciosos académicamente.",
    features: [
      "Todo lo del plan Premium",
      "Acceso anticipado a nuevas funciones",
      "Badges exclusivos de perfil",
      "Análisis de compatibilidad avanzado",
      "Creación de grupos exclusivos",
      "Acceso a eventos VIP",
      "Soporte 24/7",
    ],
    ctaText: "Elegir Premium+",
  },
]

export async function createCheckoutSession(
  userId: string,
  planId: string
): Promise<string> {
  const response = await fetch(`${API_URL}/api/stripe/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, planId }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Error al crear sesión de pago")
  }

  if (!data.url) {
    throw new Error("No se recibió URL de pago")
  }

  return data.url
}

export async function verifyCheckoutSession(
  sessionId: string
): Promise<{ paid: boolean; planId?: string; amount?: number }> {
  const response = await fetch(`${API_URL}/api/stripe/verify?sessionId=${sessionId}`)

  if (!response.ok) {
    throw new Error("Error al verificar la sesión de pago")
  }

  return response.json()
}

export async function getUserPremiumStatus(
  userId: string
): Promise<{ isPremium: boolean; plan: string | null }> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_premium, premium_plan")
      .eq("id", userId)
      .single()

    if (error) throw error

    return {
      isPremium: data?.is_premium ?? false,
      plan: data?.premium_plan ?? null,
    }
  } catch (error) {
    console.error("Error fetching premium status:", error)
    return { isPremium: false, plan: null }
  }
}

export async function cancelPremium(
  userId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/api/stripe/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Error al cancelar premium")
  }

  return data
}
