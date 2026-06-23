# Arquitectura de PoliTinder

## Visión General

PoliTinder es una SPA (Single Page Application) construida en React 19 con TypeScript. La aplicación se apoya en dos Backend-as-a-Service: **Firebase Auth** para autenticación y **Supabase** para base de datos (PostgreSQL) y almacenamiento de archivos (Storage).

```
┌──────────────────────────────────────────────────────────────────┐
│                       CLIENTE (React SPA)                        │
│                                                                  │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │
│  │   Pages   │  │  Hooks   │  │ Services │  │ Components (UI) │  │
│  │ (Routing) │→ │  (SRP)   │→ │ (Auth)   │→ │  shadcn/ui +    │  │
│  └───────────┘  └──────────┘  └──────────┘  │  PostCard/      │  │
│       ↓                                      │  StoryViewer   │  │
│  ┌──────────────────────────────────────┐    └────────────────┘  │
│  │     Servicios de Datos (Supabase)    │                        │
│  │  profiles  │  posts  │  stories      │                        │
│  └──────────────────────────────────────┘                        │
└──────────────────────┬───────────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │  Firebase Auth          │
          │  Supabase (DB + Storage)│
          └─────────────────────────┘
```

## Capas de la Aplicación

### 1. Capa de Presentación (Pages)

Las páginas son componentes de alto nivel que orquestan la interacción entre los servicios y los componentes UI.

| Página           | Ruta               | Propósito                                  |
| ---------------- | ------------------ | ------------------------------------------ |
| `Login`          | `/login`           | Autenticación de usuarios existentes       |
| `Register`       | `/register`        | Registro de nuevos usuarios                |
| `ForgotPassword` | `/forgot-password` | Recuperación de contraseña                 |
| `Onboarding`     | `/onboarding`      | Formulario multi-paso de datos iniciales   |
| `Welcome`        | `/welcome`         | Tutorial post-onboarding                   |
| `Feed`           | `/feed`            | Inicio: stories + publicaciones del feed   |
| `Profile`        | `/profile`         | Perfil del usuario con sus publicaciones   |
| `Matches`        | `/matches`         | Cards de potenciales matches (Tinder-like) |
| `Messages`       | `/messages`        | Bandeja de mensajes + chat en tiempo real  |
| `Terms`          | `/terms`           | Términos y condiciones legales             |
| `Privacy`        | `/privacy`         | Política de privacidad                     |

### 2. Capa de Lógica de Formularios (Hooks)

Cada hook sigue el **Principio de Responsabilidad Única (SRP)**:

- `useLoginForm`: Validación, estado de carga, visibilidad de contraseña y envío.
- `useRegisterForm`: Validación, confirmación de contraseña, términos y registro.
- `useForgotPasswordForm`: Validación de correo institucional y envío de restablecimiento.
- `useOnboardingForm`: Formulario multi-paso con validación por paso.

### 3. Capa de Servicios

#### AuthContext (Firebase Auth)

El contexto de autenticación expone: `login`, `register`, `loginWithMicrosoft`, `resetPassword`, `logout`. Los errores de Firebase se mapean a mensajes legibles en español mediante `mapFirebaseError()`.

#### Servicios de Datos (Supabase)

| Servicio   | Archivo                | Funciones principales                                                                                      |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| **profile**| `services/profile.ts`  | `createProfile`, `getProfile`, `updateProfile`, `getPotentialMatches`, `mapOnboardingToProfile`            |
| **posts**  | `services/posts.ts`    | `createPost`, `getUserPosts`, `getFeedPosts`, `likePost`, `unlikePost`, `getPostComments`, `createComment` |
| **stories**| `services/stories.ts`  | `createStory`, `getUserStories`, `getActiveStories`, `deleteStory`, `likeStory`, `replyToStory`, `muteUser`, `reportStory`, `shareStory` |
| **messages**| `services/messages.ts` | `getOrCreateConversation`, `sendMessage`, `getConversations`, `getMessages`, `subscribeToMessages`, `subscribeToConversations` |
| **friends**| `services/friends.ts`  | `getFriendshipStatus`, `sendFriendRequest`, `acceptFriendRequest`, `rejectFriendRequest`, `getIncomingRequests`, `getArchivedConversationIds`, `archiveConversation`, `unarchiveConversation` |

#### Almacenamiento (Supabase Storage)

| Bucket    | Propósito                 | Upload helper        |
| --------- | ------------------------- | -------------------- |
| `avatars` | Fotos de perfil           | `uploadAvatar()`     |
| `banners` | Banners de perfil         | `uploadBanner()`     |
| `posts`   | Imágenes en publicaciones | `uploadPostImage()`  |
| `stories` | Medios para historias     | `uploadStoryMedia()` |

#### Capa de Persistencia Local (Storage Adapter)

Implementa los principios **ISP** y **DIP** mediante el patrón **Adapter**:

```
IStorageAdapter (interfaz abstracta)
    ↑
LocalStorageAdapter (implementación concreta)
    ↑
├── TokenStorage (implementa ITokenStorage)
├── UserStorage (implementa IUserStorage)
└── OnboardingStorage (implementa IOnboardingStorage)
```

### 4. Componentes de Post e Historias

#### PostCard (`components/post/PostCard.tsx`)

Componente reutilizable que muestra una publicación con:

- Avatar, nickname, carrera y tiempo desde la creación
- Contenido de texto e imagen
- Botones de: Like (corazón), Comentar, Guardar (bookmark), Compartir
- Sección expandible de comentarios (`PostComments`)

#### PostComments (`components/post/PostComments.tsx`)

Sección de comentarios dentro de un PostCard:

- Lista de comentarios con avatar, nickname y contenido
- Input para escribir nuevo comentario (Enter para enviar)
- Actualización en tiempo real del contador de comentarios

#### StoriesBar (`components/post/StoriesBar.tsx`)

Barra horizontal de historias en el Feed:

- Botón "Tu historia" para subir nueva historia (imagen/video)
- Círculos con gradiente para cada usuario con historias activas
- Las historias expiran automáticamente a las 24 horas

#### StoryViewer (`components/post/StoryViewer.tsx`)

Visor de historias a pantalla completa:

- Navegación con tap/click (izquierda/derecha), teclado, gestos
- Barra de progreso para cada historia
- Soporte para imágenes y videos
- Botón de mute/unmute para videos
- Pausa al mantener presionado
- **Like** con contador animado
- **Reply** (responde a la historia y envía DM al creador)
- **Share** (compartir vía Web Share API)
- **Mute/Report** desde menú contextual
- **Delete** (solo historias propias)

### 5. Esquema de Base de Datos (Supabase PostgreSQL)

#### Tabla `profiles`

| Columna        | Tipo          | Descripción                      |
| -------------- | ------------- | -------------------------------- |
| `id`           | `TEXT`        | Firebase UID (PK)                |
| `nickname`     | `TEXT`        | Nombre de usuario (2-30 chars)   |
| `avatar_url`   | `TEXT?`       | URL del avatar                   |
| `banner_url`   | `TEXT?`       | URL del banner                   |
| `faculty`      | `TEXT`        | Facultad                         |
| `career`       | `TEXT`        | Carrera                          |
| `semester`     | `TEXT?`       | Semestre actual                  |
| `looking_for`  | `TEXT[]`      | Objetivos (estudio, mentoría...) |
| `bio`          | `TEXT?`       | Biografía (≤280 chars)           |
| `study_styles` | `TEXT[]`      | Estilos de estudio               |
| `interests`    | `TEXT[]`      | Intereses                        |
| `created_at`   | `TIMESTAMPTZ` | Fecha de creación                |
| `updated_at`   | `TIMESTAMPTZ` | Fecha de actualización           |

#### Tabla `posts`

| Columna      | Tipo          | Descripción            |
| ------------ | ------------- | ---------------------- |
| `id`         | `UUID`        | PK (auto-generado)     |
| `user_id`    | `TEXT`        | FK → profiles(id)      |
| `content`    | `TEXT`        | Contenido (≤500 chars) |
| `image_url`  | `TEXT?`       | URL de imagen adjunta  |
| `created_at` | `TIMESTAMPTZ` | Fecha de creación      |
| `updated_at` | `TIMESTAMPTZ` | Fecha de actualización |

#### Tabla `post_likes`

| Columna                           | Tipo          | Descripción       |
| --------------------------------- | ------------- | ----------------- |
| `user_id`                         | `TEXT`        | FK → profiles(id) |
| `post_id`                         | `UUID`        | FK → posts(id)    |
| `created_at`                      | `TIMESTAMPTZ` | Fecha del like    |
| (PK compuesta: user_id + post_id) |

#### Tabla `post_comments`

| Columna      | Tipo          | Descripción             |
| ------------ | ------------- | ----------------------- |
| `id`         | `UUID`        | PK (auto-generado)      |
| `post_id`    | `UUID`        | FK → posts(id)          |
| `user_id`    | `TEXT`        | FK → profiles(id)       |
| `content`    | `TEXT`        | Contenido (1-500 chars) |
| `created_at` | `TIMESTAMPTZ` | Fecha del comentario    |

#### Tabla `stories`

| Columna      | Tipo          | Descripción                  |
| ------------ | ------------- | ---------------------------- |
| `id`         | `UUID`        | PK (auto-generado)           |
| `user_id`    | `TEXT`        | FK → profiles(id)            |
| `media_url`  | `TEXT`        | URL del medio (imagen/video) |
| `type`       | `TEXT`        | 'image' o 'video'            |
| `created_at` | `TIMESTAMPTZ` | Fecha de creación            |
| `expires_at` | `TIMESTAMPTZ` | Expira a las 24 horas        |

#### Tabla `conversations`

| Columna                  | Tipo          | Descripción                          |
| ------------------------ | ------------- | ------------------------------------ |
| `id`                     | `UUID`        | PK (auto-generado)                   |
| `participant1_id`        | `TEXT`        | FK → profiles(id), menor ordenada    |
| `participant2_id`        | `TEXT`        | FK → profiles(id), mayor ordenada    |
| `last_message_at`        | `TIMESTAMPTZ` | Último mensaje enviado               |
| `participant1_last_read_at` | `TIMESTAMPTZ` | Última lectura del participante 1  |
| `participant2_last_read_at` | `TIMESTAMPTZ` | Última lectura del participante 2  |
| `created_at`             | `TIMESTAMPTZ` | Fecha de creación                    |
| (UC: `unique_participants`) |            | (participant1_id, participant2_id)   |

#### Vista `conversations_with_last_message`

JOIN entre `conversations`, `profiles` (ambos participantes) y `messages` (último mensaje vía LATERAL). Incluye nicknames, avatares, read timestamps y datos del último mensaje.

#### Tabla `messages`

| Columna            | Tipo          | Descripción                                |
| ------------------ | ------------- | ------------------------------------------ |
| `id`               | `UUID`        | PK (auto-generado)                         |
| `conversation_id`  | `UUID`        | FK → conversations(id) ON DELETE CASCADE   |
| `sender_id`        | `TEXT`        | FK → profiles(id)                          |
| `content`          | `TEXT`        | Contenido (1-1000 chars)                   |
| `reply_to_story_id`| `UUID?`       | FK → stories(id) (respuesta a historia)    |
| `created_at`       | `TIMESTAMPTZ` | Fecha de envío                             |

#### Tabla `story_likes`

| Columna      | Tipo          | Descripción                       |
| ------------ | ------------- | --------------------------------- |
| `user_id`    | `TEXT`        | FK → profiles(id)                 |
| `story_id`   | `UUID`        | FK → stories(id)                  |
| `created_at` | `TIMESTAMPTZ` | Fecha del like                    |
| (PK compuesta: user_id + story_id) |

#### Tabla `story_replies`

| Columna      | Tipo          | Descripción                       |
| ------------ | ------------- | --------------------------------- |
| `id`         | `UUID`        | PK (auto-generado)                |
| `story_id`   | `UUID`        | FK → stories(id)                  |
| `user_id`    | `TEXT`        | FK → profiles(id)                 |
| `content`    | `TEXT`        | Contenido (1-1000 chars)          |
| `created_at` | `TIMESTAMPTZ` | Fecha de respuesta                |

#### Tabla `user_mutes`

| Columna        | Tipo          | Descripción                       |
| -------------- | ------------- | --------------------------------- |
| `user_id`      | `TEXT`        | FK → profiles(id)                 |
| `muted_user_id`| `TEXT`        | FK → profiles(id)                 |
| `created_at`   | `TIMESTAMPTZ` | Fecha                             |
| (PK compuesta: user_id + muted_user_id) |

#### Tabla `friend_requests`

| Columna      | Tipo          | Descripción                                    |
| ------------ | ------------- | ---------------------------------------------- |
| `id`         | `UUID`        | PK (auto-generado)                             |
| `sender_id`  | `TEXT`        | FK → profiles(id)                              |
| `receiver_id`| `TEXT`        | FK → profiles(id)                              |
| `status`     | `TEXT`        | 'pending', 'accepted', 'blocked'               |
| `created_at` | `TIMESTAMPTZ` | Fecha de envío                                 |
| `updated_at` | `TIMESTAMPTZ` | Fecha de última actualización                  |
| (UC: `unique_friend_request`) |             | (sender_id, receiver_id)                       |

#### Tabla `archived_conversations`

| Columna          | Tipo          | Descripción                          |
| ---------------- | ------------- | ------------------------------------ |
| `conversation_id`| `UUID`        | FK → conversations(id) ON DELETE CASCADE |
| `user_id`        | `TEXT`        | FK → profiles(id)                    |
| `archived_at`    | `TIMESTAMPTZ` | Fecha de archivo                     |
| (PK compuesta: conversation_id + user_id) |

## Flujo de Mensajería

```
1. Usuario A envía mensaje a Usuario B
2. getOrCreateConversation() asegura que exista una conversación
3. sendMessage() inserta en tabla "messages"
4. Suscripción Realtime: subscribeToMessages() recibe el nuevo mensaje
5. subscribeToConversations() actualiza la vista con el último mensaje
6. Auto-scroll al último mensaje en Messages.tsx
```

## Flujo de Videollamada

```
1. Usuario A hace clic en Video/Phone en el header del chat
2. initiateCall() envía broadcast "incoming_call" vía Supabase Realtime
3. Usuario B recibe el broadcast → modal "Llamada entrante"
4. Al contestar: ambos lados montan VideoCallModal con la misma roomID
5. createWebRTCConnection() crea RTCPeerConnection + canal Realtime por room
6. Señalización (offer/answer/ICE) viaja por Supabase Realtime broadcast
7. Al colgar: se cierra el canal y el peer connection
```

## Flujo de Solicitudes de Amistad

```
1. Usuario A hace clic en "Conectar" (Profile o header del chat)
2. sendFriendRequest() inserta en friend_requests con status='pending'
3. Usuario B ve la solicitud en Messages?tab=solicitudes
4. Aceptar: acceptFriendRequest() → status='accepted' vía RPC
5. Rechazar: rejectFriendRequest() → status='blocked' vía RPC
```

## Flujo de Archivado

```
1. Usuario abre menú (⋮) en header del chat
2. "Archivar chat" → archiveConversation() inserta en archived_conversations
3. Chat desaparece de "recientes" y aparece en "archivados"
4. "Desarchivar chat" → unarchiveConversation() elimina el registro
```

### 6. Validación (Schemas Zod)

| Esquema                | Reglas                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `loginSchema`          | Email válido, contraseña ≥ 8 caracteres                                               |
| `registerSchema`       | Nombres ≥ 2 car., email, contraseña ≥ 8, confirmación coincidente, términos aceptados |
| `forgotPasswordSchema` | Email con dominio `@epn.edu.ec`                                                       |
| `onboardingSchema`     | 3 sub-esquemas: identity, academic, vibe                                              |

## Flujo de Autenticación

```
1. Usuario completa formulario
2. Hook valida datos con Zod
3. Hook ejecuta onSubmit → llama a AuthContext
4. AuthContext llama a Firebase Auth SDK
5. Firebase devuelve UserCredential
6. Se extrae token JWT (getIdToken)
7. Se persisten token y usuario en localStorage (via Storage layer)
8. Se actualiza el estado global (IAuthState)
9. UI se re-renderiza con isAuthenticated = true
```

## Flujo de Publicaciones

```
1. Usuario escribe contenido + opcional imagen
2. Si hay imagen: uploadPostImage() → Supabase Storage (bucket "posts")
3. createPost() → inserta en tabla "posts"
4. PostCard muestra la publicación con:
   - Like: likePost() / unlikePost() → tabla "post_likes"
   - Comentario: createComment() → tabla "post_comments"
   - Feed: getFeedPosts() con JOIN a profiles + conteos
```

## Flujo de Historias

```
1. Usuario sube imagen/video → uploadStoryMedia() → Supabase Storage (bucket "stories")
2. createStory() → inserta en tabla "stories" con expires_at = NOW + 24h
3. StoriesBar muestra getActiveStories() (solo no expiradas)
4. StoryViewer reproduce en pantalla completa
5. deleteStory() para eliminar manualmente
```

### 7. Estructura del Proyecto

```
PoliTinder/
├── client/                          # Frontend React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/                # VideoCallModal (WebRTC + Supabase Realtime)
│   │   │   ├── layouts/             # Sidebar, AppLayout
│   │   │   ├── onboarding/          # Componentes del onboarding
│   │   │   ├── post/                # PostCard, PostComments, StoriesBar, StoryViewer
│   │   │   ├── profile/             # EditProfile
│   │   │   └── ui/                  # Button, Input, Combobox, etc.
│   │   ├── contexts/                # AuthContext (Firebase)
│   │   ├── data/                    # Datos estáticos (facultades, carreras)
│   │   ├── hooks/                   # useLoginForm, useRegisterForm, etc.
│   │   ├── pages/                   # Login, Register, Feed, Profile, Messages, etc.
│   │   ├── schemas/                 # Zod validation schemas
│   │   ├── services/
│   │   │   ├── storage/             # TokenStorage, UserStorage, OnboardingStorage
│   │   │   ├── firebase.ts          # Config Firebase
│   │   │   ├── supabase.ts          # Cliente Supabase + upload helpers
│   │   │   ├── profile.ts           # CRUD perfiles
│   │   │   ├── posts.ts             # CRUD posts + likes + comentarios
│   │   │   ├── stories.ts           # CRUD stories + interacciones (like, reply, mute, report)
│   │   │   ├── messages.ts          # Mensajería en tiempo real (Supabase Realtime)
│   │   │   └── friends.ts           # Solicitudes de amistad y archivado
│   │   ├── test/                    # Tests unitarios (Vitest)
│   │   ├── types/                   # Interfaces TypeScript (incluye message.ts)
│   │   └── App.tsx                  # Router principal
│   ├── .env.local                   # Variables de entorno
│   └── package.json
├── supabase/
│   └── migrations/                  # Migraciones SQL (001 → 012)
└── docs/
    ├── ARQUITECTURA.md              # Este documento
    └── CONTRIBUIR.md                # Guía de contribución
```

### 8. Tecnologías

| Tecnología            | Propósito                         |
| --------------------- | --------------------------------- |
| React 19              | UI SPA                            |
| TypeScript            | Tipado estático                   |
| Vite                  | Build tool                        |
| Tailwind CSS          | Estilos utilitarios               |
| Framer Motion         | Animaciones                       |
| React Router DOM v7   | Enrutamiento                      |
| Firebase Auth         | Autenticación (email + Microsoft) |
| Supabase (PostgreSQL) | Base de datos                     |
| Supabase Storage      | Almacenamiento de archivos        |
| Zod                   | Validación de formularios         |
| Vitest                | Testing                           |
| Lucide React          | Iconos                            |
| Supabase Realtime (Broadcast) | Señalización WebRTC (videollamadas) |

### 9. Configuración del Entorno

Crear archivo `client/.env` con:

```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_FIREBASE_MEASUREMENT_ID=xxx
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### 10. Instalación y Ejecución

```bash
cd client
npm install
npm run dev        # Desarrollo (http://localhost:5173)
npm run build      # Producción
npm run test       # Tests
npm run lint       # Verificación de código
```

> La señalización WebRTC usa **Supabase Realtime** (canales broadcast). Asegúrate de habilitar Realtime en tu proyecto Supabase (ver configuración abajo).

## Planificación por Sprints

### Sprint 1: Autenticación y Onboarding (Completado)

**Objetivo**: Implementar registro, inicio de sesión, recuperación de contraseña y formulario de datos iniciales.

| Tarea                                                                  | Responsable       | Estado |
| ---------------------------------------------------------------------- | ----------------- | ------ |
| Configurar Firebase Auth (email + Microsoft OAuth)                     | Jennyfer Guayanay | ✅     |
| Crear capa de persistencia local (TokenStorage, UserStorage)           | Jennyfer Guayanay | ✅     |
| Implementar AuthContext con login, register, logout, resetPassword     | Michael Carrillo  | ✅     |
| Crear páginas Login, Register, ForgotPassword                          | Michael Carrillo  | ✅     |
| Implementar hooks useLoginForm, useRegisterForm, useForgotPasswordForm | Michael Carrillo  | ✅     |
| Validación con Zod (loginSchema, registerSchema, forgotPasswordSchema) | Michael Carrillo  | ✅     |
| Migración 001: tabla profiles                                          | Jennyfer Guayanay | ✅     |
| Página de Onboarding multi-paso con datos académicos                   | Michael Carrillo  | ✅     |
| Página Welcome post-onboarding con tutorial                            | Michael Carrillo  | ✅     |
| Manejo de errores de Firebase mapeados a español                       | Michael Carrillo  | ✅     |

### Sprint 2: Perfil y Matching (Completado)

**Objetivo**: Mostrar perfil de usuario, permitir edición y explorar potenciales matches.

| Tarea                                                         | Responsable       | Estado |
| ------------------------------------------------------------- | ----------------- | ------ |
| Migración 002: date_of_birth y semester como texto            | Jennyfer Guayanay | ✅     |
| Servicio profile.ts: createProfile, getProfile, updateProfile | Jennyfer Guayanay | ✅     |
| Página Profile con header, banner, avatar, ADN académico      | Michael Carrillo  | ✅     |
| Componente EditProfile para editar datos                      | Michael Carrillo  | ✅     |
| Página Matches con cards tipo Tinder                          | Michael Carrillo  | ✅     |
| Servicio getPotentialMatches con filtros                      | Jennyfer Guayanay | ✅     |
| Hook useOnboardingForm con validación por paso                | Michael Carrillo  | ✅     |

### Sprint 3: Publicaciones e Historias (En Progreso)

**Objetivo**: Permitir crear publicaciones con imágenes, dar like, comentar, y compartir historias temporales.

| Tarea                                                         | Responsable       | Estado |
| ------------------------------------------------------------- | ----------------- | ------ |
| Migración 003: tabla posts + banner_url                       | Jennyfer Guayanay | ✅     |
| Migración 004: post_likes, post_comments, stories             | Jennyfer Guayanay | ✅     |
| Servicio posts.ts: CRUD posts + likes + comentarios           | Michael Carrillo  | ✅     |
| Servicio stories.ts: CRUD stories                             | Michael Carrillo  | ✅     |
| Componente PostCard con like, comentar, bookmark, compartir   | Michael Carrillo  | ✅     |
| Componente PostComments con lista y creación de comentarios   | Michael Carrillo  | ✅     |
| Componente StoriesBar con subida y visualización              | Michael Carrillo  | ⬜     |
| Componente StoryViewer a pantalla completa                    | Michael Carrillo  | ✅     |
| Buckets de Storage: posts, stories (crear en dashboard)       | Jennyfer Guayanay | ⬜     |
| Feed con stories + publicaciones de todos los usuarios        | Michael Carrillo  | ✅     |
| Correo de verificación al registrarse (sendEmailVerification) | Michael Carrillo  | ✅     |

### Sprint 4: Mensajería y Videollamadas (Completado)

**Objetivo**: Implementar chat en tiempo real, videollamadas y gestión de contactos.

| Tarea                                                              | Responsable       | Estado |
| ------------------------------------------------------------------ | ----------------- | ------ |
| Migración 009: story_likes, story_replies, user_mutes              | Jennyfer Guayanay | ✅     |
| Migración 010: conversations, messages, Realtime publication       | Jennyfer Guayanay | ✅     |
| Servicio messages.ts con CRUD y suscripciones Realtime             | Michael Carrillo  | ✅     |
| Página Messages con lista de chats + chat en tiempo real           | Michael Carrillo  | ✅     |
| StoryViewer: like, reply (envía DM), share, mute, report, delete   | Michael Carrillo  | ✅     |
| Emoji picker y selector de archivos en input de mensajes           | Michael Carrillo  | ✅     |
| Sidebar: sub-items de Mensajes con badges de no leídos             | Michael Carrillo  | ✅     |
| Profile: botón Mensaje en perfil ajeno                              | Michael Carrillo  | ✅     |
| Búsqueda de usuarios para nuevo chat                               | Michael Carrillo  | ✅     |
| Migración 011: friend_requests, archived_conversations             | Michael Carrillo  | ✅     |
| Migración 012: read tracking (last_read_at)                        | Michael Carrillo  | ✅     |
| Servicio friends.ts: solicitudes y archivado                       | Michael Carrillo  | ✅     |
| Chat header: +Añadir amigo, menú Archivar/Desarchivar              | Michael Carrillo  | ✅     |
| Messages tabs: recientes, archivados, solicitudes                  | Michael Carrillo  | ✅     |
| VideoCallModal con ZegoCloud UIKit (video y voz)                   | Michael Carrillo  | ✅     |
| Signaling vía Supabase Realtime Broadcast (llamada entrante)       | Michael Carrillo  | ✅     |

### Sprint 5: Pulido y Despliegue (Planificado)

**Objetivo**: Mejorar UX, rendimiento y preparar para producción.

| Tarea                                                  | Responsable       | Estado |
| ------------------------------------------------------ | ----------------- | ------ |
| Diseño responsive para todas las páginas               | Michael Carrillo  | ⬜     |
| Pantallas de carga y estados vacíos/error consistentes | Michael Carrillo  | ⬜     |
| Políticas RLS en Supabase para seguridad               | Jennyfer Guayanay | ⬜     |
| Índices de rendimiento en consultas frecuentes         | Jennyfer Guayanay | ⬜     |
| Configuración de despliegue (Vercel / Netlify)         | Jennyfer Guayanay | ⬜     |
| Tests de integración para flujos críticos              | Michael Carrillo  | ⬜     |

---

## Seguridad

- Las contraseñas se manejan exclusivamente a través de Firebase Auth.
- Los tokens JWT se almacenan en localStorage mediante una capa de abstracción.
- La validación del dominio `@epn.edu.ec` se realiza con Zod en el cliente.
- Toda la comunicación con Firebase y Supabase está cifrada mediante TLS/SSL.
- RLS (Row Level Security) desactivado en producción por compatibilidad con Firebase Auth.
- Las videollamadas usan WebRTC nativo con señalización a través de Supabase Realtime (broadcast channels).
