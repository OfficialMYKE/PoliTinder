"use client";

import * as React from "react";
import { Link } from "react-router-dom";

export function AuthFooter() {
  return (
    // absolute bottom-0 left-0: Lo ancla a la parte inferior izquierda del panel.
    // bg-white z-10: Garantiza que tenga fondo y no se mezcle si el contenido pasa por detrás en celulares pequeños.
    <div className="absolute bottom-0 left-0 w-full h-20 flex flex-col items-center justify-center px-8 text-center text-xs text-slate-400 bg-white z-10">
      <p translate="no">© 2026 PoliTinder. Todos los derechos reservados.</p>
      <div className="mt-1 flex items-center justify-center gap-3">
        <Link to="#" className="hover:text-slate-600 transition-colors">
          Términos de uso
        </Link>
        <span>·</span>
        <Link to="#" className="hover:text-slate-600 transition-colors">
          Privacidad
        </Link>
        <span>·</span>
        <Link to="#" className="hover:text-slate-600 transition-colors">
          Soporte
        </Link>
      </div>
    </div>
  );
}
