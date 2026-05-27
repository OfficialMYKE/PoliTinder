import { MessageSquare, Search } from "lucide-react"

export default function Messages() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-slate-900 mb-3">
            Mensajes
          </h1>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              className="w-full h-10 rounded-full bg-slate-100 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#487CFF]/20"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="flex flex-col items-center text-center max-w-sm">
          <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Sin conversaciones
          </h2>
          <p className="text-sm text-slate-500">
            Conecta con otros estudiantes y empieza a chatear.
          </p>
        </div>
      </div>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} PoliTinder. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
