import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useAuth } from "../../contexts/AuthContext";
import { VideoCallModal } from "./VideoCallModal";
import { Video, Phone, X } from "lucide-react";
import { connect, disconnect, send, onMessage } from "../../services/ws";

interface IncomingCall {
  callerName: string;
  callerID: string;
  callType: "video" | "voice";
  roomID: string;
}

interface CallContextValue {
  initiateCall: (
    otherId: string,
    roomID: string,
    type: "video" | "voice",
  ) => void;
}

const CallContext = createContext<CallContextValue | null>(null);

export function useCallContext() {
  return useContext(CallContext);
}

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";

export function CallHandler({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const user = state.user;
  const [callType, setCallType] = useState<"video" | "voice" | null>(null);
  const [isCaller, setIsCaller] = useState(true);
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [activeRoomID, setActiveRoomID] = useState<string | null>(null);
  const [activeOtherId, setActiveOtherId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    connect(WS_URL, user.id);

    return () => {
      disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const unsub = onMessage((data) => {
      if (data.type === "incoming_call") {
        const call = data as unknown as IncomingCall;
        if (call.callerID !== user.id) {
          setIncoming({
            callerName: call.callerName,
            callerID: call.callerID,
            callType: call.callType,
            roomID: call.roomID,
          });
        }
      }
    });

    return unsub;
  }, [user?.id]);

  const initiateCall = useCallback(
    (otherId: string, roomID: string, type: "video" | "voice") => {
      setActiveRoomID(roomID);
      setActiveOtherId(otherId);
      setIsCaller(true);
      setCallType(type);

      const callerName =
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : "Usuario";

      send({
        type: "incoming_call",
        targetUserId: otherId,
        callerName,
        callType: type,
        roomID,
      });
    },
    [user?.firstName, user?.lastName, user?.id],
  );

  function handleAnswer() {
    if (!incoming) return;
    setActiveRoomID(incoming.roomID);
    setActiveOtherId(incoming.callerID);
    setIsCaller(false);
    setCallType(incoming.callType);
    setIncoming(null);
  }

  function handleClose() {
    if (activeRoomID && activeOtherId) {
      send({
        type: "call_ended",
        targetUserId: activeOtherId,
        roomID: activeRoomID,
      });
    }
    setCallType(null);
    setActiveRoomID(null);
    setActiveOtherId(null);
    setIncoming(null);
  }

  return (
    <CallContext.Provider value={{ initiateCall }}>
      {children}

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
            <p className="text-lg font-semibold text-white mb-1">
              {incoming.callerName}
            </p>
            <p className="text-sm text-zinc-400 mb-8">
              {incoming.callType === "video"
                ? "Videollamada entrante..."
                : "Llamada de voz entrante..."}
            </p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={handleAnswer}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-colors cursor-pointer"
              >
                <Phone className="w-7 h-7" />
              </button>
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

      {callType && activeRoomID && user && activeOtherId && (
        <VideoCallModal
          callType={callType}
          roomID={activeRoomID}
          userID={user.id}
          otherUserId={activeOtherId}
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
  );
}
