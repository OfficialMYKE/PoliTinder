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
    <div className="min-h-screen bg-white selection:bg-[#487CFF] selection:text-white">
      {/* Barra superior sticky */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
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
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <motion.div {...fadeUp}>
          {/* Hero Legal */}
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 leading-tight mb-4">
            Términos y Condiciones Generales de Uso
          </h1>
          <p className="mt-6 text-sm text-slate-400">
            Actualizada el 19 de mayo de 2026
          </p>

          {/* Declaración de principios */}
          <p className="mt-12 text-xl md:text-2xl leading-snug text-slate-800 font-medium">
            El presente instrumento jurídico constituye un contrato vinculante y
            de adhesión que regula el acceso, navegación, provisión y uso de los
            servicios de la plataforma digital PoliTinder.
          </p>

          {/* Cuerpo del documento */}
          <div className="mt-16 space-y-16 text-[17px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                1. Objeto, Naturaleza Jurídica y Aceptación
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    1.1. Objeto del Contrato:
                  </strong>{" "}
                  Las presentes Condiciones Generales de Uso regulan la relación
                  jurídica entre los desarrolladores de PoliTinder (en adelante,
                  "la Plataforma" o "el Proveedor") y los usuarios finales (en
                  adelante, "el Usuario" o "los Usuarios"). La Plataforma actúa
                  exclusivamente como un intermediario tecnológico para
                  facilitar el networking académico y la creación de grupos de
                  estudio.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    1.2. Independencia Institucional:
                  </strong>{" "}
                  Se deja constancia expresa, ineludible y pública de que
                  PoliTinder es una iniciativa de desarrollo de software de
                  carácter privado e independiente. No existe vínculo
                  societario, laboral, de patrocinio, endoso, aval ni
                  subordinación administrativa con la Escuela Politécnica
                  Nacional.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    1.3. Perfeccionamiento del Consentimiento:
                  </strong>{" "}
                  Al hacer clic en "Crear cuenta", "Registrarse", o al acceder
                  de cualquier modo a la Plataforma, el Usuario reconoce haber
                  leído, comprendido y aceptado en su totalidad, sin reservas ni
                  modificaciones, los presentes Términos y Condiciones. Si el
                  Usuario no está de acuerdo con alguna disposición de este
                  documento, deberá abstenerse inmediatamente de utilizar la
                  Plataforma.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                2. Requisitos de Elegibilidad y Verificación
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    2.1. Capacidad Legal y Estudiantil:
                  </strong>{" "}
                  El uso de PoliTinder está restringido única y exclusivamente a
                  personas naturales que ostenten la calidad de estudiantes
                  regulares, activos y matriculados en la Escuela Politécnica
                  Nacional.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    2.2. Verificación de Dominio:
                  </strong>{" "}
                  Como mecanismo técnico de comprobación de elegibilidad, la
                  Plataforma exige el uso obligatorio e insustituible de una
                  dirección de correo electrónico provista por la institución,
                  cuyo dominio exacto sea{" "}
                  <span className="font-medium text-[#487CFF] bg-blue-50/50 px-1.5 py-0.5 rounded">
                    @epn.edu.ec
                  </span>
                  . El uso de alias, correos personales o dominios alterados
                  resultará en la denegación automática del registro.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    2.3. Auditoría de Cuentas:
                  </strong>{" "}
                  El Proveedor se reserva el derecho de auditar, suspender
                  temporalmente o requerir documentación adicional en cualquier
                  momento si existieren indicios razonables de que un Usuario ha
                  perdido su calidad de estudiante activo o ha vulnerado los
                  métodos de verificación.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                3. Licencia de Uso Limitada
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    3.1. Concesión de Licencia:
                  </strong>{" "}
                  Sujeto al cumplimiento estricto y continuo de estos Términos,
                  el Proveedor otorga al Usuario una licencia personal, no
                  exclusiva, intransferible, revocable y limitada para acceder y
                  utilizar la Plataforma con fines puramente académicos,
                  personales y no comerciales.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    3.2. Restricciones de Licencia:
                  </strong>{" "}
                  Bajo ninguna circunstancia esta licencia otorga al Usuario
                  derechos para: (i) copiar, modificar, adaptar, traducir o
                  crear obras derivadas del software; (ii) aplicar ingeniería
                  inversa, descompilar, desensamblar o intentar extraer el
                  código fuente; (iii) alquilar, arrendar, prestar, vender,
                  sublicenciar o distribuir la Plataforma; (iv) utilizar
                  spiders, robots, crawlers o cualquier herramienta automatizada
                  para extraer datos (scraping) de los perfiles de otros
                  Usuarios.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                4. Responsabilidades y Custodia de la Cuenta
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    4.1. Creación de la Cuenta:
                  </strong>{" "}
                  El Usuario se compromete a proporcionar información veraz,
                  exacta, actual y completa durante el proceso de registro.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    4.2. Custodia de Credenciales:
                  </strong>{" "}
                  El Usuario es el único y exclusivo responsable de salvaguardar
                  la confidencialidad de sus credenciales de acceso (contraseña,
                  tokens de autenticación). El Proveedor asume, de pleno
                  derecho, que cualquier actividad realizada bajo una cuenta
                  autenticada es efectuada por su titular legítimo.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    4.3. Notificación de Brechas:
                  </strong>{" "}
                  En caso de pérdida, robo o presunta vulneración de las
                  credenciales de acceso, el Usuario tiene la obligación
                  contractual de notificar inmediatamente al equipo de soporte
                  de PoliTinder y proceder con el cambio inmediato de su
                  contraseña.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                5. Usos Prohibidos y Código de Conducta
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    5.1. Prohibiciones Absolutas:
                  </strong>{" "}
                  El Usuario se obliga expresamente a NO utilizar la Plataforma
                  para las siguientes actividades, las cuales se consideran
                  infracciones graves:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-slate-600">
                  <li>
                    Cargar, publicar o transmitir contenido que sea difamatorio,
                    injurioso, calumnioso, discriminatorio, xenófobo, racista,
                    pornográfico o que atente contra la moral y el orden
                    público.
                  </li>
                  <li>
                    Incurrir en cualquier forma de acoso cibernético
                    (cyberbullying), hostigamiento o stalking hacia otros
                    Usuarios.
                  </li>
                  <li>
                    Suplantar la identidad de otro estudiante, autoridad
                    académica, docente o funcionario administrativo.
                  </li>
                  <li>
                    Promocionar bienes, servicios, eventos comerciales, esquemas
                    piramidales o proselitismo político.
                  </li>
                  <li>
                    Saturar, atacar o intentar vulnerar la infraestructura de
                    servidores de la Plataforma mediante ataques de denegación
                    de servicio (DDoS), inyección SQL, Cross-Site Scripting
                    (XSS) u otros vectores de ataque.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                6. Propiedad Intelectual e Industrial
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    6.1. Titularidad del Proveedor:
                  </strong>{" "}
                  Todo el diseño, arquitectura de software, logotipos, marcas
                  comerciales, algoritmos, interfaces gráficas (UI/UX) y textos
                  contenidos en la Plataforma son propiedad exclusiva del
                  Proveedor, amparados por las leyes nacionales e
                  internacionales de propiedad intelectual y por el Código
                  Orgánico de la Economía Social de los Conocimientos,
                  Creatividad e Innovación del Ecuador.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    6.2. Contenido del Usuario (UGC):
                  </strong>{" "}
                  El Usuario conserva los derechos de autor sobre el material
                  académico original que comparta en la Plataforma. No obstante,
                  al cargarlo, otorga al Proveedor una licencia mundial, libre
                  de regalías y transferible para alojar, reproducir y mostrar
                  dicho contenido con el único fin de operar el servicio.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                7. Disponibilidad y Continuidad del Servicio
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    7.1. Ausencia de SLA (Service Level Agreement):
                  </strong>{" "}
                  El Proveedor procurará mantener la Plataforma operativa; sin
                  embargo, no garantiza un porcentaje específico de tiempo de
                  actividad (uptime). La Plataforma puede experimentar cortes
                  temporales debido a mantenimientos programados,
                  actualizaciones, fallos de proveedores en la nube (ej. Google
                  Cloud, Vercel) o eventos de fuerza mayor.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    7.2. Modificación del Servicio:
                  </strong>{" "}
                  El Proveedor se reserva el derecho de modificar, suspender o
                  descontinuar, temporal o permanentemente, cualquier
                  característica, funcionalidad o la totalidad de la Plataforma,
                  con o sin previo aviso, sin que ello genere derecho a
                  compensación o indemnización alguna a favor del Usuario.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                8. Exclusión de Garantías y Limitación de Responsabilidad
              </h2>
              <div className="space-y-5 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                <p>
                  <strong className="text-slate-900 font-semibold tracking-wide uppercase text-sm">
                    Aviso Legal Importante:
                  </strong>
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    8.1. Provisión "Tal Cual":
                  </strong>{" "}
                  POLITINDER SE PROPORCIONA ESTRICTAMENTE "TAL CUAL" (AS IS) Y
                  "SEGÚN DISPONIBILIDAD". EL PROVEEDOR RECHAZA EXPRESAMENTE TODA
                  GARANTÍA, YA SEA EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO
                  LIMITADO A LAS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN
                  PROPÓSITO PARTICULAR Y NO INFRACCIÓN.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    8.2. Exoneración Máxima:
                  </strong>{" "}
                  BAJO NINGÚN CONCEPTO EL PROVEEDOR SERÁ RESPONSABLE POR DAÑOS
                  DIRECTOS, INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O
                  PUNITIVOS, INCLUYENDO PÉRDIDA DE BENEFICIOS, DATOS, USO, FONDO
                  DE COMERCIO, U OTRAS PÉRDIDAS INTANGIBLES, QUE RESULTEN DE:
                  (I) EL USO O LA IMPOSIBILIDAD DE USO DE LA PLATAFORMA; (II)
                  CONDUCTAS O CONTENIDOS DE TERCEROS EN LA PLATAFORMA; (III)
                  ACCESO NO AUTORIZADO A SUS DATOS.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                9. Enlaces y Servicios de Terceros
              </h2>
              <div className="space-y-5">
                <p>
                  La Plataforma puede contener enlaces a sitios web o servicios
                  de terceros que no son propiedad ni están controlados por el
                  Proveedor. PoliTinder no asume responsabilidad alguna por el
                  contenido, las políticas de privacidad o las prácticas de
                  sitios web de terceros. El Usuario reconoce y acepta que el
                  Proveedor no será responsable de ningún daño o pérdida causada
                  por el uso de bienes o servicios disponibles en dichos sitios.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                10. Suspensión, Resolución y Terminación del Contrato
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    10.1. Por parte del Usuario:
                  </strong>{" "}
                  El Usuario puede rescindir este contrato en cualquier momento
                  mediante la eliminación definitiva de su cuenta a través de
                  las herramientas proporcionadas en la interfaz de
                  configuración de la Plataforma.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    10.2. Por parte del Proveedor:
                  </strong>{" "}
                  El Proveedor puede suspender o terminar el acceso del Usuario
                  de forma inmediata, sin previo aviso ni responsabilidad, por
                  cualquier motivo, incluyendo, sin limitación, el
                  incumplimiento sustancial de los presentes Términos y
                  Condiciones Generales de Uso.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                11. Modificaciones Contractuales
              </h2>
              <div className="space-y-5">
                <p>
                  El Proveedor se reserva el derecho inalienable de enmendar,
                  modificar o sustituir unilateralmente estos Términos en
                  cualquier momento. Si una revisión es material, se intentará
                  proporcionar un aviso razonable a la entrada en vigor de los
                  nuevos términos. Lo que constituye un cambio material será
                  determinado a la entera discreción del Proveedor. Al continuar
                  accediendo o utilizando la Plataforma después de que esas
                  revisiones entren en vigencia, el Usuario acepta de manera
                  tácita e irrevocable estar sujeto a los términos revisados.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                12. Jurisdicción, Competencia y Legislación Aplicable
              </h2>
              <div className="space-y-5">
                <p>
                  Las presentes Condiciones Generales de Uso se interpretarán y
                  regirán en todas y cada una de sus cláusulas de conformidad
                  con las leyes vigentes de la República del Ecuador. Para la
                  resolución de cualquier controversia, litigio o discrepancia
                  que pudiera derivarse de la interpretación, cumplimiento o
                  ejecución del presente contrato, las partes se someterán de
                  manera expresa a la jurisdicción de los tribunales civiles
                  competentes de la ciudad de Quito, Pichincha, Ecuador,
                  renunciando expresamente a cualquier otro fuero que pudiera
                  corresponderles en razón de sus domicilios presentes o
                  futuros.
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>

      <AuthFooter />
    </div>
  );
}
