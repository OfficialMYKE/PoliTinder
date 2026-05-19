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
            Política de Privacidad y Tratamiento de Datos
          </h1>
          <p className="mt-6 text-sm text-slate-400">
            Actualizada el 19 de mayo de 2026
          </p>

          {/* Declaración de principios */}
          <p className="mt-12 text-xl md:text-2xl leading-snug text-slate-800 font-medium">
            La privacidad es un derecho fundamental e irrenunciable. En
            PoliTinder, la protección de tu información personal constituye el
            pilar técnico y ético sobre el cual construimos nuestra comunidad
            politécnica.
          </p>

          {/* Cuerpo del documento */}
          <div className="mt-16 space-y-16 text-[17px] leading-relaxed text-slate-700">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                1. Responsable del Tratamiento
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    1.1. Identificación:
                  </strong>{" "}
                  Para los efectos de la legislación aplicable en materia de
                  protección de datos, los desarrolladores y administradores de
                  la plataforma PoliTinder actúan como el Responsable del
                  Tratamiento de los datos personales recabados a través del
                  servicio.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    1.2. Marco Normativo:
                  </strong>{" "}
                  El tratamiento de la información se rige bajo los principios
                  de juridicidad, lealtad, transparencia y minimización de
                  datos, en estricta observancia de la Ley Orgánica de
                  Protección de Datos Personales (LOPDP) de la República del
                  Ecuador y los más altos estándares internacionales de
                  privacidad.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                2. Tipología de Datos Personales Recopilados
              </h2>
              <div className="space-y-5">
                <p>
                  PoliTinder aplica el principio de minimización, recopilando
                  única y exclusivamente la información estrictamente necesaria
                  para garantizar la operatividad de la plataforma de
                  emparejamiento académico. No requerimos, procesamos ni
                  almacenamos datos superfluos o de categoría especial.
                </p>
                <ul className="list-disc pl-6 space-y-3 text-slate-600">
                  <li>
                    <strong className="text-slate-900 font-semibold">
                      Datos de Identificación y Acceso:
                    </strong>{" "}
                    Al registrarte, debes proporcionar tu nombre completo y tu
                    dirección de correo electrónico institucional. Este correo
                    debe poseer ineludiblemente el dominio{" "}
                    <span className="font-medium text-[#487CFF] bg-blue-50/50 px-1.5 py-0.5 rounded">
                      @epn.edu.ec
                    </span>
                    . Este dato es de carácter obligatorio y constituye la única
                    llave criptográfica de acceso a la comunidad.
                  </li>
                  <li>
                    <strong className="text-slate-900 font-semibold">
                      Datos de Perfilado Académico:
                    </strong>{" "}
                    Almacenamos la información que el Usuario decide compartir
                    de manera libre y voluntaria para enriquecer su perfil,
                    tales como facultad, carrera, semestre, áreas de estudio de
                    interés e historial de "matches" académicos.
                  </li>
                  <li>
                    <strong className="text-slate-900 font-semibold">
                      Exclusiones Expresas:
                    </strong>{" "}
                    Se deja constancia de que la Plataforma NO recopila, rastrea
                    ni procesa datos de geolocalización en tiempo real (GPS),
                    información biométrica, datos patrimoniales, ni solicita
                    acceso a la libreta de contactos del dispositivo del
                    Usuario.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                3. Finalidad y Base Legitimadora del Tratamiento
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    3.1. Propósito Exclusivo:
                  </strong>{" "}
                  PoliTinder existe con un único propósito fundacional: conectar
                  a estudiantes matriculados en la Escuela Politécnica Nacional
                  para conformar grupos de estudio, facilitar la colaboración en
                  proyectos académicos y fomentar la mentoría entre pares.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    3.2. Operatividad del Algoritmo:
                  </strong>{" "}
                  El tratamiento de los datos de perfil tiene como finalidad
                  exclusiva alimentar el algoritmo de emparejamiento, el cual
                  opera basándose estrictamente en la afinidad académica
                  declarada por los Usuarios.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    3.3. Base Legal:
                  </strong>{" "}
                  El tratamiento de los datos personales se legitima mediante el
                  consentimiento expreso, libre, previo, informado e inequívoco
                  otorgado por el Usuario al momento de perfeccionar su registro
                  en la plataforma, así como en la necesidad de ejecutar los
                  Términos y Condiciones pactados.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                4. Prohibición Absoluta de Comercialización
              </h2>
              <div className="space-y-5 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    4.1. Ausencia de Fines Lucrativos con Datos:
                  </strong>{" "}
                  Bajo ninguna circunstancia, escenario o coyuntura, el
                  Proveedor utilizará los datos personales, metadatos o hábitos
                  de uso de los Usuarios para fines publicitarios, de mercadeo
                  corporativo o prospección comercial.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    4.2. No Cesión a Terceros:
                  </strong>{" "}
                  Se garantiza de forma absoluta que PoliTinder no comercializa,
                  transfiere, cede ni arrienda sus bases de datos, perfiles de
                  usuarios ni listas de correos electrónicos a terceras
                  empresas, agencias de publicidad, ni a las autoridades de la
                  institución educativa. No existe ningún componente de
                  monetización de datos ni de segmentación con fines comerciales
                  en nuestra arquitectura.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                5. Infraestructura de Seguridad y Estándares Técnicos
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    5.1. Proveedores de Nivel Empresarial:
                  </strong>{" "}
                  La seguridad integral de la información es nuestra máxima
                  prioridad técnica. PoliTinder opera su arquitectura de bases
                  de datos y autenticación sobre la infraestructura de Firebase
                  Authentication y Google Cloud Platform, ecosistemas auditados
                  bajo los regímenes de seguridad más estrictos del mundo.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    5.2. Cifrado y Criptografía:
                  </strong>{" "}
                  Toda comunicación de datos entre el dispositivo del Usuario y
                  nuestros servidores en la nube está encriptada en tránsito
                  mediante protocolos de seguridad de la capa de transporte
                  (TLS/SSL).
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    5.3. Protección de Credenciales:
                  </strong>{" "}
                  Las contraseñas de los Usuarios se procesan bajo un esquema de
                  almacenamiento seguro que utiliza funciones de derivación de
                  claves (hash con sal mediante algoritmos como bcrypt/scrypt).
                  Por diseño, las contraseñas en texto plano son matemáticamente
                  inaccesibles e invisibles, incluso para los administradores de
                  bases de datos de PoliTinder.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    5.4. Cumplimiento Internacional:
                  </strong>{" "}
                  Google Cloud Platform certifica el cumplimiento con estándares
                  internacionales de ciberseguridad, incluyendo ISO/IEC 27001,
                  SOC 2 Tipo II, y los requerimientos del Reglamento General de
                  Protección de Datos (GDPR) de la Unión Europea. Además, el
                  sistema incorpora defensas automatizadas contra ataques de
                  fuerza bruta y enumeración de cuentas.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                6. Derechos del Titular (Derechos ARCO)
              </h2>
              <div className="space-y-5">
                <p>
                  En todo momento, el Usuario conserva el señorío y control
                  total sobre su información personal. Conforme a la legislación
                  vigente, le asisten los siguientes derechos inalienables:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-slate-600">
                  <li>
                    <strong className="text-slate-900 font-semibold">
                      Acceso y Rectificación:
                    </strong>{" "}
                    El Usuario puede acceder, consultar y actualizar de forma
                    autónoma la información de su perfil directamente desde la
                    interfaz de configuración de su cuenta.
                  </li>
                  <li>
                    <strong className="text-slate-900 font-semibold">
                      Oposición:
                    </strong>{" "}
                    Derecho a oponerse a que sus datos sean tratados para fines
                    específicos distintos a la operatividad esencial de la
                    plataforma.
                  </li>
                  <li>
                    <strong className="text-slate-900 font-semibold">
                      Portabilidad:
                    </strong>{" "}
                    Derecho a solicitar una copia estructurada de los datos que
                    ha proporcionado a la Plataforma.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                7. Plazos de Conservación y Derecho al Olvido
              </h2>
              <div className="space-y-5">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    7.1. Retención de Datos:
                  </strong>{" "}
                  Los datos personales se conservarán única y exclusivamente
                  durante el tiempo que la cuenta del Usuario permanezca activa
                  y sea estrictamente necesario para cumplir con las finalidades
                  descritas en esta política.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    7.2. Eliminación Irreversible:
                  </strong>{" "}
                  Si el Usuario decide ejercer su Derecho a la Cancelación
                  (Derecho al Olvido), puede utilizar la función "Eliminar
                  cuenta" integrada en la plataforma. Al ejecutar esta acción,
                  el sistema iniciará un proceso de purga lógica.
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">
                    7.3. Garantía de Destrucción:
                  </strong>{" "}
                  Procesamos las solicitudes de eliminación en un plazo máximo e
                  improrrogable de 30 días hábiles. Cumplido este plazo, la
                  información, perfiles, matches y chats asociados al Usuario
                  serán destruidos irreversiblemente de la infraestructura
                  principal y de los respaldos de Google Cloud. No conservamos
                  "copias en la sombra" (shadow copies) ni historiales ocultos
                  una vez procesada la baja, salvo que medie una obligación
                  legal expresa emanada de autoridad judicial competente.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                8. Modificaciones a la Política de Privacidad
              </h2>
              <div className="space-y-5">
                <p>
                  La evolución técnica de PoliTinder y las actualizaciones en la
                  normativa de protección de datos pueden requerir la revisión
                  de esta política. Nos reservamos el derecho de actualizar este
                  documento periódicamente. Las modificaciones sustanciales
                  relativas al tratamiento de la información personal serán
                  notificadas de manera destacada a través de la interfaz de la
                  aplicación o al correo electrónico institucional del Usuario,
                  con anterioridad a su entrada en vigor.
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
