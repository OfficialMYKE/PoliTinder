/**
 * Layout principal con sidebar colapsable
 *
 * La sidebar se puede ocultar/mostrar con el botón de toggle.
 * En pantallas pequeñas (< md) se oculta por defecto y se superpone
 * como un drawer con backdrop.
 */

import { useState, useEffect, type ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  function toggle() {
    setSidebarOpen((o) => !o)
  }

  function close() {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Botón toggle fijo (visible cuando la sidebar está cerrada en desktop) */}
      {!sidebarOpen && !isMobile && (
        <button
          type="button"
          onClick={toggle}
          className="fixed left-3 top-3 z-50 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 shadow-sm transition-colors cursor-pointer"
          title="Mostrar sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      )}

      {/* Backdrop en móvil */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-full w-60
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${!isMobile && !sidebarOpen ? "invisible" : ""}
        `}
      >
        <Sidebar onClose={close} />

        {/* Botón para cerrar sidebar (dentro de la sidebar, cerca del borde) */}
        {sidebarOpen && (
          <button
            type="button"
            onClick={toggle}
            className="absolute top-3 -right-3 z-50 p-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 shadow-sm transition-colors cursor-pointer"
            title="Ocultar sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </aside>

      {/* Contenido principal */}
      <main
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarOpen && !isMobile ? "pl-60" : "pl-0"}
        `}
      >
        {children}
      </main>
    </div>
  )
}
