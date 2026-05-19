import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthFooter } from "../components/ui/footer";

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function Privacy() {
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
            Política de privacidad
            <br />
            de PoliTinder
          </h1>
          <p className="mt-6 text-sm text-slate-400">
            Actualizada el 19 de mayo de 2026
          </p>

          {/* Declaración de principios */}
          <p className="mt-12 text-2xl leading-snug text-slate-800 font-medium">
            La privacidad es un derecho fundamental. En PoliTinder, también es
            nuestro valor principal al conectar a la comunidad politécnica.
          </p>

          {/* Cuerpo del documento */}
          <div className="mt-14 space-y-14 text-[17px] leading-relaxed text-slate-700">
            {/* 1 */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-5">
                1. Datos que recopilamos
              </h2>
              <p className="mb-4">
                PoliTinder recopila únicamente la información estrictamente
                necesaria para funcionar como plataforma de emparejamiento
                académico. No pedimos ni almacenamos datos superfluos.
              </p>
              <p className="mb-4">
                Al registrarte, debes proporcionar tu nombre completo y tu
                dirección de correo electrónico institucional con el dominio{" "}
                <span className="text-[#487CFF] font-semibold">
                  @epn.edu.ec
                </span>
                . Este correo es obligatorio y constituye la única llave de
                acceso a la comunidad: sin él no es posible crear una cuenta.
              </p>
              <p>
                Adicionalmente, almacenamos la información de perfil que decides
                compartir voluntariamente (áreas de estudio, intereses
                académicos), así como datos de uso anónimos para mejorar la
                plataforma. No recopilamos datos de ubicación en tiempo real,
                contactos del dispositivo ni información biométrica.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-5">
                2. Uso exclusivamente académico y no comercial
              </h2>
              <p className="mb-4">
                PoliTinder existe con un único propósito: conectar a estudiantes
                de la Escuela Politécnica Nacional para formar grupos de
                estudio, colaborar en proyectos académicos y encontrar mentoría
                entre pares.
              </p>
              <p className="mb-4">
                Bajo ninguna circunstancia utilizamos tus datos para fines
                publicitarios, comerciales o de mercadeo. No vendemos perfiles,
                no cedemos listas de correo a terceros y no mostramos anuncios
                personalizados basados en tu actividad dentro de la plataforma.
              </p>
              <p>
                El emparejamiento entre usuarios se basa exclusivamente en la
                afinidad académica declarada en los perfiles. No existe ningún
                componente de monetización de datos ni de segmentación con fines
                comerciales.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-5">
                3. Seguridad respaldada por Google Identity
              </h2>
              <p className="mb-4">
                Tu seguridad es nuestra prioridad técnica. PoliTinder opera
                sobre la infraestructura de Firebase Authentication y Google
                Cloud Platform, dos de los sistemas de identidad más seguros y
                auditados del mundo.
              </p>
              <p className="mb-4">
                Todas las comunicaciones entre tu dispositivo y nuestros
                servidores están cifradas mediante protocolos TLS/SSL. Las
                contraseñas se almacenan usando hash con sal (bcrypt) y nunca
                son visibles para ningún administrador de la plataforma.
              </p>
              <p className="mb-4">
                Google Cloud Platform cumple con los estándares internacionales
                más exigentes: ISO 27001, SOC 2 Tipo II y el Reglamento General
                de Protección de Datos (GDPR) de la Unión Europea. Esto
                garantiza que tus credenciales están protegidas por la misma
                infraestructura que utilizan miles de empresas Fortune 500.
              </p>
              <p>
                Adicionalmente, Firebase Authentication incorpora protección
                contra ataques de fuerza bruta, detección de accesos sospechosos
                y la opción de autenticación multifactor para recuperación de
                cuentas.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-5">
                4. Tu control y derecho al borrado permanente
              </h2>
              <p className="mb-4">
                Tienes control total sobre tus datos en todo momento. Puedes
                acceder, rectificar y actualizar la información de tu perfil
                desde la configuración de tu cuenta.
              </p>
              <p className="mb-4">
                Si en cualquier momento decides abandonar PoliTinder, puedes
                solicitar la eliminación permanente de tu cuenta y de todos tus
                datos asociados. Procesamos estas solicitudes en un plazo máximo
                de 30 días hábiles, tras los cuales tu información se borra
                irreversiblemente de nuestras bases de datos y de la
                infraestructura de Google Cloud.
              </p>
              <p>
                Para ejercer tu derecho al olvido, puedes utilizar la opción
                "Eliminar cuenta" dentro de la configuración de la plataforma o
                escribirnos directamente a nuestro correo de soporte. No
                conservamos copias de seguridad después de la eliminación salvo
                que exista una obligación legal expresa que lo requiera.
              </p>
            </section>
          </div>
        </motion.div>
      </div>

      <AuthFooter />
    </div>
  );
}
