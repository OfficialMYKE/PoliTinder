/**
 * Manejador global de llamadas (video/voz)
 *
 * Envuelve la aplicación para escuchar llamadas entrantes vía Supabase Realtime.
 * Expone initiateCall() a través de CallContext para que cualquier componente
 * pueda iniciar una llamada.
 */

import { useEffect, useRef, useState, createContext, useContext, useCallback } from "react"
import { supabase } from "../../services/supabase"
import { useAuth } from "../../contexts/AuthContext"
import { VideoCallModal } from "./VideoCallModal"
import { Video, Phone, X } from "lucide-react"

/** Datos de una llamada entrante recibida por Realtime */
interface IncomingCall {
  callerName: string
  callerID: string
  callType: "video" | "voice"
  roomID: string
}

interface CallContextValue {
  initiateCall: (otherId: string, roomID: string, type: "video" | "voice") => void
}

const CallContext = createContext<CallContextValue | null>(null)

export function useCallContext() {
  return useContext(CallContext)
}

export function CallHandler({ children }: { children: React.ReactNode }) {
  const { state } = useAuth()
  const user = state.user
  const [callType, setCallType] = useState<"video" | "voice" | null>(null)
  const [isCaller, setIsCaller] = useState(true)
  const [incoming, setIncoming] = useState<IncomingCall | null>(null)
  const [activeRoomID, setActiveRoomID] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Escucha llamadas entrantes en un canal personal por usuario
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase.channel("calls-" + user.id)
    channelRef.current = channel

    channel.on("broadcast", { event: "incoming_call" }, (payload) => {
      const data = payload as unknown as IncomingCall & { callerID: string }
      // Ignora los propios broadcasts (cuando llamas a otro)
      if (data.callerID !== user.id) {
        setIncoming({ callerName: data.callerName, callerID: data.callerID, callType: data.callType as "video" | "voice", roomID: data.roomID })
      }
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [user?.id])

  /** Inicia una llamada: notifica al otro usuario y abre el modal local */
  const initiateCall = useCallback((otherId: string, roomID: string, type: "video" | "voice") => {
    setActiveRoomID(roomID)
    setIsCaller(true)
    setCallType(type)

    const callerName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "Usuario"
    const callPayload = { callerName, callerID: user?.id, callType: type, roomID }
    // Canal temporal para notificar al otro usuario
    const receiverChannel = supabase.channel("calls-" + otherId)
    receiverChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        receiverChannel.send({ type: "broadcast", event: "incoming_call", payload: callPayload })
      }
      // Limpia el canal temporal después de enviar la notificación
      setTimeout(() => supabase.removeChannel(receiverChannel), 2000)
    })
  }, [user?.firstName, user?.lastName, user?.id])

  /** Acepta la llamada entrante y abre el modal como receptor */
  function handleAnswer() {
    if (!incoming) return
    setActiveRoomID(incoming.roomID)
    setIsCaller(false)
    setCallType(incoming.callType)
    setIncoming(null)
  }

  /** Cierra el modal de llamada activa y resetea el estado */
  function handleClose() {
    setCallType(null)
    setActiveRoomID(null)
    setIncoming(null)
  }

  return (
    <CallContext.Provider value={{ initiateCall }}>
      {children}

      {/* Modal de llamada entrante */}
      {incoming && !callType && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#487CFF]/20 flex items-center justify-center mb-5">
              {incoming.callType === "video" ? (
                <Video className="w-9 h-9 text-[#487CFF]" />
              ) : (
                <Phone className="w-9 h-9 text-[#487CFF]" />
              )}
            </div>
            <p className="text-lg font-semibold text-white mb-1">{incoming.callerName}</p>
            <p className="text-sm text-zinc-400 mb-8">
              {incoming.callType === "video" ? "Videollamada entrante..." : "Llamada de voz entrante..."}
            </p>
            <div className="flex items-center gap-6">
              {/* Botón verde para contestar */}
              <button
                type="button"
                onClick={handleAnswer}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-colors cursor-pointer"
              >
                <Phone className="w-7 h-7" />
              </button>
              {/* Botón rojo para rechazar */}
              <button
                type="button"
                onClick={() => setIncoming(null)}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors cursor-pointer"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de llamada activa */}
      {callType && activeRoomID && user && (
        <VideoCallModal
          callType={callType}
          roomID={activeRoomID}
          userID={user.id}
          userName={
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : "Usuario"
          }
          isCaller={isCaller}
          onClose={handleClose}
        />
      )}
    </CallContext.Provider>
  )
}
