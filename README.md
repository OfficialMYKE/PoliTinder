<div align="center">
  <img src="client/src/assets/logo.png" alt="PoliTinder" width="200" />
  <br/>
  <h1>PoliTinder</h1>
  <p><strong>Plataforma de Networking y Matchmaking Académico para la Escuela Politécnica Nacional</strong></p>
  <br/>
  <p>
    <img src="https://img.shields.io/badge/Estado-En_Desarrollo-FF8C00?style=flat-square" alt="Estado: En Desarrollo" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite" alt="Vite 8" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Firebase_Auth-FFCA28?style=flat-square&logo=firebase" alt="Firebase Auth" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
  <br/>
  <a href="https://www.figma.com/design/vV9GeAyl9bsATQKDAfl5iU/Politinder"> Prototipo en Figma</a>
</div>

---

## Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Roles del Sistema](#-roles-del-sistema)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Pruebas](#-pruebas)
- [Documentación de API (Postman)](#-documentación-de-api-postman)
- [Autenticación](#-autenticación)
- [Principios de Diseño](#-principios-de-diseño)
- [Roadmap](#-roadmap)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## Descripción

**PoliTinder** es una aplicación web full-stack diseñada para optimizar el networking académico dentro de la **Escuela Politécnica Nacional (EPN)**.

La plataforma emplea un algoritmo de emparejamiento basado en afinidad académica para conectar estudiantes con el propósito de:

- **Formar grupos de estudio** por materia o área de conocimiento.
- **Colaborar en proyectos** académicos y de investigación.
- **Ofrecer mentoría entre pares** dentro de la comunidad politécnica.

El acceso está estrictamente restringido a cuentas de correo institucional con dominio `@epn.edu.ec`, garantizando que todos los usuarios sean estudiantes activos de la institución.

---

## Características

### Implementadas

- **Autenticación segura** con Firebase Auth (email/contraseña y Microsoft OAuth).
- **Validación de dominio institucional** (`@epn.edu.ec`) en formularios.
- **Recuperación de contraseña** mediante enlace al correo institucional.
- **Persistencia local** de sesión mediante el patrón Adapter (SRP + DIP).
- **Diseño responsivo** con Tailwind CSS y shadcn/ui.
- **Animaciones fluidas** con Framer Motion.
- **Mensajes de error en español** mapeados desde códigos de Firebase.
- **Términos y Condiciones** y **Política de Privacidad** conformes a la LOPDP ecuatoriana.

### Planificadas

- Dashboard principal con perfiles de usuario.
- Confirmación de cuenta por correo electrónico.
- Algoritmo de matchmaking por afinidad académica.
- Sistema de mensajería en tiempo real (Supabase Realtime).
- Feed de actividad y notificaciones.
- Perfiles públicos con facultad, carrera y áreas de interés.
- Migración de base de datos a Supabase + PostgreSQL.

---

## Roles del Sistema

### Estudiante

- Registro e inicio de sesión con correo institucional (`@epn.edu.ec`).
- Recuperación de contraseña mediante enlace al correo.
- Gestión de perfil personal (datos académicos, intereses, foto).
- Búsqueda y matchmaking con otros estudiantes por afinidad académica.
- Participación en grupos de estudio y mensajería entre pares.

### Administrador

- Gestión de usuarios (ver, bloquear, eliminar cuentas).
- Moderación de contenido y reportes de la comunidad.
- Configuración del catálogo de facultades, carreras y áreas de interés.
- Visualización de estadísticas de uso de la plataforma.
- Administración de denuncias y soporte.

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                    Cliente (React SPA)                   │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Pages  │→│  Hooks   │→│ Services │→│   Firebase   │  │
│  │         │ │  (SRP)   │ │(Storage) │ │    Auth      │  │
│  └─────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│       ↓                                                  │
│  ┌─────────┐                                             │
│  │  UI     │ (shadcn/ui + Tailwind)                      │
│  │  Components                                           │
│  └─────────┘                                             │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│               Backend (Firebase BaaS)                    │
│  ┌─────────────────────┐  ┌────────────────────────────┐ │
│  │  Authentication     │  │  Firestore / Supabase (TBD)│ │
│  │  (email/password)   │  │  (Base de datos)           │ │
│  │  (Microsoft OAuth)  │  └────────────────────────────┘ │
│  └─────────────────────┘                                 │
└──────────────────────────────────────────────────────────┘
```

### Patrones Implementados

| Patrón                              | Aplicación                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| **SRP** (Responsabilidad Única)     | Hooks separados para cada formulario; clases de almacenamiento independientes           |
| **ISP** (Segregación de Interfaces) | Interfaces `ITokenStorage`, `IUserStorage`, `IStorageAdapter` desacopladas              |
| **DIP** (Inversión de Dependencias) | `TokenStorage`/`UserStorage` dependen de `IStorageAdapter`, no de `LocalStorageAdapter` |
| **OCP** (Abierto/Cerrado)           | Tema centralizado en `theme.ts` extensible sin modificar componentes                    |
| **Factory**                         | `createStorageServices()` en `services/storage/index.ts`                                |

---

## Stack Tecnológico

### Frontend

| Categoría     | Tecnología                                     |
| ------------- | ---------------------------------------------- |
| UI            | React 19 con TypeScript                        |
| Build         | Vite 8                                         |
| Estilos       | Tailwind CSS v4 + shadcn/ui (Radix Primitives) |
| Formularios   | React Hook Form v7 + Zod v4                    |
| Autenticación | Firebase Auth SDK                              |
| Animaciones   | Framer Motion v12                              |
| Iconos        | Lucide React                                   |

### Backend (BaaS en la Nube)

| Categoría      | Tecnología                                          |
| -------------- | --------------------------------------------------- |
| Autenticación  | Firebase Auth (email/contraseña + Microsoft OAuth)  |
| Base de Datos  | Firebase (Auth) — cloud-native, sin servidor propio |
| Almacenamiento | LocalStorage (sesión) vía patrón Adapter            |
| Futuro         | Supabase + PostgreSQL (migración planificada)       |

---

## Estructura del Proyecto

```
politinder-workspace/
├── client/                              # Frontend (React SPA)
│   ├── public/                          # Archivos estáticos
│   ├── src/
│   │   ├── assets/                      # Recursos visuales (logo, imágenes)
│   │   ├── components/
│   │   │   ├── common/                  # Componentes compartidos (WIP)
│   │   │   ├── forms/                   # Componentes de formulario (WIP)
│   │   │   ├── icons/                   # Iconos personalizados (Microsoft)
│   │   │   ├── layouts/                 # Layouts reutilizables (WIP)
│   │   │   └── ui/                      # Componentes base shadcn/ui
│   │   ├── config/                      # Configuración del tema (theme.ts)
│   │   ├── contexts/                    # Contextos de React (AuthContext)
│   │   ├── hooks/                       # Custom hooks (useLoginForm, etc.)
│   │   ├── lib/                         # Utilidades (cn)
│   │   ├── pages/                       # Vistas por ruta (5 páginas)
│   │   ├── schemas/                     # Validación Zod (3 schemas)
│   │   ├── services/                    # Lógica de negocio
│   │   │   ├── firebase.ts              # Configuración Firebase
│   │   │   └── storage/                 # Capa de persistencia (Adapter)
│   │   └── types/                       # Interfaces compartidas
│   ├── .env                             # Variables de entorno (Firebase)
│   ├── .gitignore
│   ├── components.json                  # Configuración shadcn/ui
│   ├── eslint.config.js
│   ├── index.html                       # Entry point HTML
│   ├── jsconfig.json
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.js
│
├── server/                              # Backend (pendiente de implementar)
│   └── package.json
│
├── docs/                                # Documentación
│   ├── ARQUITECTURA.md
│   ├── CONTRIBUIR.md
│   └── postman/                         # Documentación de API (Postman)
│       └── PoliTinder-API.postman_collection.json
│
└── README.md                            # Este archivo
```

---

## Requisitos Previos

- **Node.js** ≥ v18.x (recomendado: v20 LTS)
- **npm** ≥ 9.x
- Una cuenta de **Firebase** con Authentication habilitado
- (Opcional) Cuenta de **Supabase** para funcionalidades futuras

---

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/OfficialMYKE/PoliTinder.git
cd politinder-workspace
```

### 2. Configurar el frontend

```bash
cd client
npm install
```

### 3. Variables de entorno

Crear el archivo `client/.env` con la configuración de tu proyecto Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tudominio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tudominio
VITE_FIREBASE_STORAGE_BUCKET=tudominio.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> ** Importante**: No commits los valores reales de tus credenciales. Agrega `.env` a `.gitignore`.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Scripts Disponibles

### Frontend (`client/`)

| Comando              | Descripción                             |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Inicia el servidor de desarrollo (Vite) |
| `npm run build`      | Compila para producción                 |
| `npm run preview`    | Previsualiza el build de producción     |
| `npm run lint`       | Ejecuta ESLint sobre el código fuente   |
| `npm run test`       | Ejecuta los tests una vez (Vitest)      |
| `npm run test:watch` | Ejecuta los tests en modo watch         |

---

## Pruebas

El proyecto utiliza **Vitest** + **@testing-library/react** para las pruebas unitarias y de componentes.

### Tests Implementados

| Categoría   | Archivo                         | Tests | Descripción                                              |
| ----------- | ------------------------------- | ----- | -------------------------------------------------------- |
| Schemas     | `loginSchema.test.ts`           | 7     | Validación de email, password, rememberMe                |
| Schemas     | `registerSchema.test.ts`        | 10    | Validación de nombres, email, password, términos         |
| Schemas     | `forgotPasswordSchema.test.ts`  | 5     | Validación de email institucional                        |
| Hooks       | `useLoginForm.test.ts`          | 4     | Estado inicial, envío, errores                           |
| Hooks       | `useRegisterForm.test.ts`       | 5     | Estado inicial, visibilidad, envío                       |
| Hooks       | `useForgotPasswordForm.test.ts` | 3     | Estado inicial, envío, errores                           |
| AuthContext | `AuthContext.test.tsx`          | 7     | Login, registro, logout, resetPassword, errores mapeados |
| Componentes | `Login.test.tsx`                | 5     | Renderizado de título, botones, enlaces                  |
| Componentes | `Register.test.tsx`             | 4     | Renderizado de título, botones, enlaces                  |
| Componentes | `ForgotPassword.test.tsx`       | 3     | Renderizado de título, botón, enlace                     |

### Ejecutar Pruebas

```bash
cd client
npm run test        # Una vez
npm run test:watch  # Modo watch
```

---

## Documentación de API (Postman)

La documentación de los endpoints de la API está disponible como colección de **Postman** en el formato Collection v2.1.

### Colección incluida

| Archivo | Descripción |
|---|---|
| `docs/postman/PoliTinder-API.postman_collection.json` | Colección completa con 17 endpoints |

### Endpoints Documentados

| Endpoint | Método | Descripción |
|---|---|---|
| `POST /accounts:signUp` | Registro | Crear nueva cuenta |
| `POST /accounts:signInWithPassword` | Login | Iniciar sesión |
| `POST /accounts:sendOobCode` | Recuperar contraseña | Enviar enlace de restablecimiento |
| `POST /accounts:lookup` | Obtener datos del usuario | Consultar perfil |
| `POST /accounts:update` | Actualizar perfil | Cambiar nombre/foto |
| `POST /token` | Refrescar token | Renovar JWT expirado |

### Cómo Importar

1. Abre [Postman](https://www.postman.com/downloads/)
2. Haz clic en **Import** → **Upload Files**
3. Selecciona `docs/postman/PoliTinder-API.postman_collection.json`
4. Las variables (`API_KEY`, `ID_TOKEN`) están preconfiguradas

---

## Autenticación

PoliTinder utiliza **Firebase Authentication** con dos métodos de inicio de sesión:

1. **Email y Contraseña**: Validación con Zod (mín. 8 caracteres). Los errores de Firebase se mapean a mensajes en español.
2. **Microsoft OAuth**: Autenticación mediante `signInWithPopup` configurado con `tenant: "organizations"` para cuentas institucionales.

### Flujo de Autenticación

```
Usuario → Formulario → Hook (useLoginForm/useRegisterForm)
  → Validación Zod → AuthContext → Firebase Auth
  → Respuesta → TokenStorage (localStorage) → UI
```

---

## Principios de Diseño

### Separación de Responsabilidades (SoC)

- **Pages**: Orquestan la interacción entre componentes y contexto.
- **Hooks**: Encapsulan la lógica de formularios y estados.
- **Services**: Abstraen la comunicación con Firebase y almacenamiento.
- **Components**: Renderizado puro, sin lógica de negocio.

### SOLID

| Principio   | Implementación                                       |
| ----------- | ---------------------------------------------------- |
| **S** (SRP) | Cada hook maneja un único formulario                 |
| **O** (OCP) | Sistema de tema extensible                           |
| **L** (LSP) | Sustituibilidad de adaptadores de almacenamiento     |
| **I** (ISP) | Interfaces pequeñas y específicas                    |
| **D** (DIP) | Inyección de dependencias en la capa de persistencia |

---

## Roadmap

| Fase       | Funcionalidad                                                                           | Estado           |
| ---------- | --------------------------------------------------------------------------------------- | ---------------- |
| **Fase 1** | Sistema de autenticación (registro, login, recuperación de contraseña, Microsoft OAuth) | ✅ Completado    |
| **Fase 2** | Confirmación de cuenta por correo                                                       | 📝 Planificado   |
| **Fase 3** | Dashboard y perfiles de usuario (ver/editar perfil, cambiar foto)                       | 🔄 En desarrollo |
| **Fase 4** | Roles del sistema (Estudiante y Administrador)                                          | 📝 Planificado   |
| **Fase 5** | Algoritmo de matchmaking por afinidad académica                                         | 📝 Planificado   |
| **Fase 6** | Mensajería en tiempo real (Supabase Realtime)                                           | 📝 Planificado   |
| **Fase 7** | Notificaciones y feed de actividad                                                      | 📝 Planificado   |
| **Fase 8** | Migración a Supabase + PostgreSQL                                                       | 📝 Planificado   |

---

## Contribución

Las contribuciones son bienvenidas. Por favor, consulta la [guía de contribución](docs/CONTRIBUIR.md) para conocer el proceso.

### Reportar Issues

Si encuentras un bug o tienes una sugerencia, abre un [issue](https://github.com/OfficialMYKE/PoliTinder/issues) describiendo:

- Comportamiento esperado vs. real
- Pasos para reproducir
- Entorno (SO, navegador, versión)

---

## Licencia

Este proyecto es de carácter educativo y de código abierto. Desarrollado como parte de proyectos académicos de la Escuela Politécnica Nacional.

---

<div align="center">
  <p>Desarrollado con ❤️ por la comunidad politécnica | ESFOT</p>
  <p>
    <a href="https://www.epn.edu.ec">EPN</a> · 
    <a href="https://www.figma.com/design/vV9GeAyl9bsATQKDAfl5iU/Politinder">Figma</a> · 
    <a href="client/README.md">Frontend Docs</a>
  </p>
</div>
