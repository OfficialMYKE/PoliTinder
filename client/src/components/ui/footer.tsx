"use client";

import * as React from "react";
import { Link } from "react-router-dom";

/**
 * Pie de página secundario con copyright y enlaces legales
 */
export function AuthFooter() {
  return (
    <div className="w-full h-20 flex flex-col items-center justify-center px-8 text-center text-xs text-slate-400 bg-white">
      <p translate="no">© 2026 PoliTinder. Todos los derechos reservados.</p>
      <div className="mt-1 flex items-center justify-center gap-3">
        <Link to="/terms" className="hover:text-slate-600 transition-colors">
          Términos de uso
        </Link>
        <span>·</span>
        <Link to="/privacy" className="hover:text-slate-600 transition-colors">
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
