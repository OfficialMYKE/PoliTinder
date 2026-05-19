/**
 * Configuración del tema - OCP (Principio Abierto/Cerrado)
 * Valores centralizados del tema que pueden extenderse sin modificar componentes
 */

export const theme = {
  colors: {
    primary: "#487CFF",
    primaryHover: "#3a6ae0",
    primaryForeground: "text-white",
  },
  animation: {
    containerVariants: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    },
    itemVariants: {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    },
  },
  form: {
    input: {
      height: "h-12",
      rounded: "rounded-full",
      bg: "bg-white",
      border: "border-slate-300",
      focusRing:
        "focus-visible:ring-1 focus-visible:ring-[#487CFF] focus-visible:border-[#487CFF] focus-visible:ring-offset-0",
      pl: "pl-12",
      plIcon: "pl-10",
    },
    button: {
      height: "h-12",
      rounded: "rounded-full",
    },
  },
} as const;

export type Theme = typeof theme;
