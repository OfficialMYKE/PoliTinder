export interface CareerOption {
  value: string
  label: string
  semesters: number
}

export interface FacultyOption {
  value: string
  label: string
  careers: CareerOption[]
}

export const FACULTIES: FacultyOption[] = [
  {
    value: "fica",
    label: "Ingeniería Civil y Ambiental (FICA)",
    careers: [
      { value: "civil", label: "Ingeniería Civil", semesters: 9 },
      { value: "ambiental", label: "Ingeniería Ambiental", semesters: 9 },
    ],
  },
  {
    value: "fiee",
    label: "Ingeniería Eléctrica y Electrónica (FIEE)",
    careers: [
      { value: "electrica", label: "Ingeniería Eléctrica", semesters: 9 },
      { value: "electronica", label: "Ingeniería Electrónica y Control", semesters: 9 },
      { value: "telecomunicaciones", label: "Ingeniería en Telecomunicaciones", semesters: 9 },
    ],
  },
  {
    value: "fim",
    label: "Ingeniería Mecánica (FIM)",
    careers: [
      { value: "mecanica", label: "Ingeniería Mecánica", semesters: 9 },
      { value: "mecatronica", label: "Ingeniería Mecatrónica", semesters: 9 },
    ],
  },
  {
    value: "fis",
    label: "Ingeniería de Sistemas (FIS)",
    careers: [
      { value: "software", label: "Ingeniería de Software", semesters: 9 },
      { value: "computacion", label: "Ingeniería en Ciencias de la Computación", semesters: 9 },
      { value: "ti", label: "Ingeniería en Tecnologías de la Información", semesters: 9 },
    ],
  },
  {
    value: "fiqa",
    label: "Ingeniería Química y Agroindustria (FIQA)",
    careers: [
      { value: "quimica", label: "Ingeniería Química", semesters: 9 },
      { value: "agroindustrial", label: "Ingeniería Agroindustrial", semesters: 9 },
    ],
  },
  {
    value: "fc",
    label: "Ciencias (FC)",
    careers: [
      { value: "fisica", label: "Física", semesters: 9 },
      { value: "matematica", label: "Matemática", semesters: 9 },
      { value: "quimica-ciencias", label: "Química", semesters: 9 },
    ],
  },
  {
    value: "fca",
    label: "Ciencias Administrativas (FCA)",
    careers: [
      { value: "empresarial", label: "Ingeniería Empresarial", semesters: 9 },
      { value: "procesos", label: "Ingeniería en Administración de Procesos", semesters: 9 },
    ],
  },
  {
    value: "esfot",
    label: "Escuela de Formación de Tecnólogos (ESFOT)",
    careers: [
      { value: "analisis-sistemas", label: "Análisis de Sistemas Informáticos", semesters: 5 },
      { value: "desarrollo-software", label: "Desarrollo de Software", semesters: 5 },
      { value: "electronica-telecom", label: "Electrónica y Telecomunicaciones", semesters: 5 },
      { value: "mecanica-automotriz", label: "Mecánica Automotriz", semesters: 5 },
      { value: "agua-saneamiento", label: "Agua y Saneamiento Ambiental", semesters: 5 },
    ],
  },
]

export function getSemesterOptions(careerValue: string | null) {
  const career = FACULTIES.flatMap((f) => f.careers).find((c) => c.value === careerValue)
  const max = career?.semesters ?? 9
  return [
    { value: "nivelacion", label: "Nivelación" },
    ...Array.from({ length: max }, (_, i) => ({
      value: String(i + 1),
      label: `${i + 1}° Semestre`,
    })),
  ]
}

export const STUDY_STYLES = [
  { value: "biblioteca", label: "Biblioteca" },
  { value: "cafe", label: "Café" },
  { value: "grupo", label: "Grupo de estudio" },
  { value: "solo", label: "Solo/a" },
  { value: "online", label: "Online" },
  { value: "madrugador", label: "Madrugador" },
  { value: "nocturno", label: "Nocturno" },
  { value: "tutorias", label: "Tutorías" },
  { value: "musica", label: "Música" },
  { value: "silencio", label: "Silencio total" },
] as const

export const LOOKING_FOR_OPTIONS = [
  { value: "study_groups", label: "Grupos de estudio" },
  { value: "projects", label: "Proyectos académicos" },
  { value: "mentorship", label: "Mentoría" },
  { value: "networking", label: "Networking" },
  { value: "friends", label: "Hacer amigos" },
] as const

export const INTERESTS = [
  { value: "programming", label: "Programación" },
  { value: "design", label: "Diseño" },
  { value: "math", label: "Matemáticas" },
  { value: "science", label: "Ciencias" },
  { value: "sports", label: "Deportes" },
  { value: "music", label: "Música" },
  { value: "art", label: "Arte" },
  { value: "business", label: "Negocios" },
  { value: "languages", label: "Idiomas" },
  { value: "reading", label: "Lectura" },
  { value: "gaming", label: "Videojuegos" },
  { value: "photography", label: "Fotografía" },
  { value: "cinema", label: "Cine" },
  { value: "travel", label: "Viajes" },
  { value: "cooking", label: "Cocina" },
  { value: "tech", label: "Tecnología" },
  { value: "robotics", label: "Robótica" },
  { value: "ai", label: "Inteligencia Artificial" },
  { value: "cybersecurity", label: "Ciberseguridad" },
] as const
