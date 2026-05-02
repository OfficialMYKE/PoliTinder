import { cn } from "@/lib/utils";
import { Mail, Lock } from "lucide-react";

export function AuthFormSplitScreen({ title, description, imageSrc }) {
  return (
    <div className="flex min-h-screen w-full bg-white text-slate-900">
      {/* Lado del Formulario (Izquierda) */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 sm:px-16 md:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex flex-col items-start">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Input Correo */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="nombre.apellido@epn.edu.ec"
                  className={cn(
                    "w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm",
                    "focus:border-[#487CFF] focus:outline-none focus:ring-1 focus:ring-[#487CFF] transition-all",
                  )}
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm",
                    "focus:border-[#487CFF] focus:outline-none focus:ring-1 focus:ring-[#487CFF] transition-all",
                  )}
                />
              </div>
            </div>

            {/* Opciones Adicionales */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-slate-300 text-[#487CFF] focus:ring-[#487CFF] accent-[#487CFF]"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-slate-600 cursor-pointer select-none"
                >
                  Recordarme
                </label>
              </div>
              <a
                href="#"
                className="text-sm font-medium hover:text-[#487CFF] hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              className="mt-6 w-full rounded-md bg-[#487CFF] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Continuar
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            ¿No tienes una cuenta?{" "}
            <a
              href="#"
              className="font-bold text-slate-900 hover:text-[#487CFF] hover:underline transition-colors"
            >
              Crea una aquí.
            </a>
          </p>
        </div>
      </div>

      {/* Lado de la Imagen (Derecha) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-100 overflow-hidden">
        <img
          src={imageSrc}
          alt="Decoración PoliTinder"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>
    </div>
  );
}
