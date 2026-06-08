import { Save } from "lucide-react"

export default function AdminSettings() {
  return (
    <div className="p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Configuración General</h1>

      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Parámetros del Sistema</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Nombre de la plataforma
              </label>
              <input
                type="text"
                defaultValue="PoliTinder"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Correo de soporte
              </label>
              <input
                type="email"
                defaultValue="soporte@politinder.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="maintenance" className="rounded border-slate-300" />
              <label htmlFor="maintenance" className="text-sm text-slate-700">
                Modo mantenimiento
              </label>
            </div>
          </div>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Estadísticas</h2>
          <p className="text-sm text-slate-500">
            Conéctate a Supabase para visualizar estadísticas de usuarios activos, reportes y
            contenido generado.
          </p>
        </div>
      </div>
    </div>
  )
}
