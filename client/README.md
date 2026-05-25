# PoliTinder — Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite" alt="Vite 8">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/Firebase_Auth-FFCA28?style=flat-square&logo=firebase" alt="Firebase Auth">
</p>

Aplicación frontend del sistema de matchmaking académico **PoliTinder**, construida con React 19, TypeScript, Vite y Tailwind CSS v4.

## Stack Tecnológico

| Categoría     | Tecnología                                       |
| ------------- | ------------------------------------------------ |
| UI            | React 19 + TypeScript                            |
| Build         | Vite 8                                           |
| Estilos       | Tailwind CSS v4 + shadcn/ui (Radix Primitives)   |
| Formularios   | React Hook Form v7 + Zod v4                      |
| Autenticación | Firebase Auth (email/password + Microsoft OAuth) |
| Animaciones   | Framer Motion v12                                |
| Iconos        | Lucide React                                     |

## Arquitectura

```
src/
├── assets/           # Recursos estáticos (imágenes)
├── components/       # Componentes UI
│   ├── icons/        # Iconos personalizados (Microsoft)
│   └── ui/           # Componentes base (shadcn/ui)
├── config/           # Configuración centralizada (tema)
├── contexts/         # Contextos de React (AuthContext)
├── hooks/            # Hooks personalizados (SRP)
├── lib/              # Utilidades (cn)
├── pages/            # Vistas de cada ruta
├── schemas/          # Esquemas de validación Zod
├── services/         # Lógica de negocio
│   ├── storage/      # Capa de persistencia local
│   └── firebase.ts   # Inicialización de Firebase
└── types/            # Interfaces y tipos compartidos
```

## Requisitos

- Node.js ≥ 18.x
- NPM ≥ 9.x

## Instalación

```bash
git clone <repo-url>
cd client
npm install
```

## Variables de Entorno

Crear un archivo `.env` en la raíz de `client/` con las siguientes variables:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

## Scripts

| Comando              | Descripción                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Inicia el servidor de desarrollo         |
| `npm run build`      | Compila la aplicación para producción    |
| `npm run preview`    | Previsualiza el build de producción      |
| `npm run lint`       | Ejecuta ESLint sobre el código           |
| `npm run test`       | Ejecuta los tests unitarios (Vitest)     |
| `npm run test:watch` | Ejecuta los tests en modo watch          |

## Principios de Diseño

- **SRP**: Cada hook encapsula la lógica de un único formulario.
- **ISP**: Interfaces segregadas para token, usuario y almacenamiento.
- **DIP**: Los módulos de alto nivel dependen de abstracciones (`IStorageAdapter`), no de implementaciones concretas.
- **OCP**: La configuración del tema permite extender estilos sin modificar componentes.
