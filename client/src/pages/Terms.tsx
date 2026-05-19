import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthFooter } from "../components/ui/footer";

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      {/* Barra superior sticky */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#487CFF] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <motion.div {...fadeUp}>
          {/* Hero */}
          <h1 className="text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
            Términos y Condiciones
            <br />
            de Uso
          </h1>
          <p className="mt-6 text-sm text-slate-400">
            Actualizados el 19 de mayo de 2026
          </p>

          {/* Declaración de principios */}
          <p className="mt-12 text-2xl leading-snug text-slate-800 font-medium">
            Al unirte a PoliTinder, aceptas mantener un entorno seguro y de
            respeto mutuo para todos los estudiantes de la EPN.
          </p>

          {/* Cuerpo del documento */}
          <div className="mt-14 space-y-14 text-[17px] leading-relaxed text-slate-700">
            {/* 1 */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-5">
                1. Elegibilidad
              </h2>
              <p className="mb-4">
                El acceso y uso de PoliTinder está reservado exclusivamente a
                estudiantes activos de la Escuela Politécnica Nacional (EPN).
                Para verificarlo, exigimos una dirección de correo electrónico
                institucional con el dominio{" "}
                <span className="text-[#487CFF] font-semibold">
                  @epn.edu.ec
                </span>
                durante el registro.
              </p>
              <p className="mb-4">
                Al crear una cuenta, declaras bajo tu responsabilidad que eres
                un miembro activo de la comunidad EPN. La plataforma se reserva
                el derecho de verificar esta condición en cualquier momento y de
                suspender cuentas que no acrediten su elegibilidad.
              </p>
              <p>
                No está permitido registrar cuentas para terceros, crear
                múltiples cuentas ni utilizar la plataforma si has sido
                suspendido previamente por violar estos términos.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-5">
                2. Código de conducta
              </h2>
              <p className="mb-4">
                PoliTinder es un espacio diseñado para la colaboración académica
                y el networking profesional entre politécnicos. Exigimos que
                todos los miembros se traten con respeto, dignidad y civilidad
                en todo momento.
              </p>
              <p className="mb-4 font-medium text-slate-900">
                Existe tolerancia cero para las siguientes conductas:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>
                  <span className="text-slate-900 font-medium ">Acoso:</span>{" "}
                  cualquier forma de hostigamiento, intimidación, discriminación
                  o comunicación no deseada de carácter sexual, político o
                  personal.
                </li>
                <li>
                  <span className="text-slate-900 font-medium ">
                    Suplantación de identidad:
                  </span>{" "}
                  hacerse pasar por otro estudiante, docente o miembro de la
                  comunidad EPN, o falsificar información del perfil.
                </li>
                <li>
                  <span className="text-slate-900 font-medium ">
                    Spam y uso indebido:
                  </span>{" "}
                  enviar mensajes masivos no solicitados, promocionar productos
                  o servicios, compartir enlaces maliciosos o utilizar la
                  plataforma para fines políticos o comerciales.
                </li>
                <li>
                  <span className="text-slate-900 font-medium ">
                    Contenido inapropiado:
                  </span>{" "}
                  publicar o compartir material ilegal, ofensivo, violento,
                  obsceno o que infrinja derechos de propiedad intelectual.
                </li>
              </ul>
              <p>
                Consideramos que la comunidad politécnica merece un entorno
                digital seguro. Cualquier infracción a este código de conducta
                será investigada y, de confirmarse, tendrá consecuencias que
                pueden incluir la suspensión inmediata de la cuenta.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-5">
                3. Responsabilidad sobre tu cuenta
              </h2>
              <p className="mb-4">
                Eres el único responsable de mantener la confidencialidad de tus
                credenciales de acceso. PoliTinder no será responsable por
                actividades realizadas desde tu cuenta como consecuencia del uso
                compartido o la pérdida de tu contraseña.
              </p>
              <p className="mb-4">
                Te comprometes a notificar inmediatamente a PoliTinder si
                sospechas que tu cuenta ha sido comprometida o si detectas
                actividad no autorizada. Mientras no lo hagas, asumes toda la
                responsabilidad por las acciones realizadas desde tu cuenta.
              </p>
              <p>
                No está permitido ceder, transferir o prestar tu cuenta a
                terceros. Cada cuenta es personal e intransferible.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-5">
                4. Terminación y suspensión del servicio
              </h2>
              <p className="mb-4">
                PoliTinder se reserva el derecho de suspender o cancelar cuentas
                de forma inmediata y sin previo aviso cuando se detecten
                infracciones graves a estos términos.
              </p>
              <p className="mb-4">
                Las infracciones que pueden resultar en la terminación inmediata
                incluyen, de manera enunciativa más no limitativa: acoso
                comprobado a otros usuarios, suplantación de identidad, intentos
                de vulnerar la seguridad del sistema, uso de la plataforma para
                actividades ilegales, o la creación de múltiples cuentas después
                de una suspensión previa.
              </p>
              <p className="mb-4">
                En casos de infracciones menores, PoliTinder podrá emitir una
                advertencia antes de proceder con medidas más severas. Sin
                embargo, la reincidencia en conductas prohibidas será causal de
                suspensión definitiva.
              </p>
              <p>
                Los usuarios afectados por una suspensión pueden contactar a
                soporte para apelar la decisión. PoliTinder evaluará cada caso
                de forma individual y notificará su resolución en un plazo
                razonable.
              </p>
            </section>
          </div>
        </motion.div>
      </div>

      <AuthFooter />
    </div>
  );
}
