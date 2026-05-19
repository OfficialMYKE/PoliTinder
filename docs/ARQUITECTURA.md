# Arquitectura de PoliTinder

## Visión General

PoliTinder sigue una arquitectura **cliente-servidor** con un frontend SPA (Single Page Application) construido en React y un backend actualmente apoyado en Firebase como Backend-as-a-Service (BaaS). La comunicación entre cliente y servicios externos se realiza mediante las SDKs oficiales de Firebase.

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (React SPA)                    │
│                                                             │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐   │
│  │   Pages   │  │  Hooks   │  │ Services │  │   Storage │   │
│  │ (Routing) │→ │  (SRP)   │→ │ (Auth)   │→ │ (Adapter) │   │
│  └───────────┘  └──────────┘  └──────────┘  └───────────┘   │
│       ↓                                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              UI Components (shadcn/ui)               │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  Firebase   │
                    │    Auth     │
                    └─────────────┘
```

## Capas de la Aplicación

### 1. Capa de Presentación (Pages)

Las páginas son componentes de alto nivel que orquestan la interacción entre el contexto de autenticación y los componentes UI. Cada página gestiona su propio estado de alertas y delega la lógica de formularios a hooks personalizados.

| Página           | Ruta               | Propósito                            |
| ---------------- | ------------------ | ------------------------------------ |
| `Login`          | `/login`           | Autenticación de usuarios existentes |
| `Register`       | `/register`        | Registro de nuevos usuarios          |
| `ForgotPassword` | `/forgot-password` | Recuperación de contraseña           |
| `Terms`          | `/terms`           | Términos y condiciones legales       |
| `Privacy`        | `/privacy`         | Política de privacidad               |

### 2. Capa de Lógica de Formularios (Hooks)

Cada hook sigue el **Principio de Responsabilidad Única (SRP)**, encapsulando la lógica completa de un formulario:

- `useLoginForm`: Validación, estado de carga, visibilidad de contraseña y envío.
- `useRegisterForm`: Validación, confirmación de contraseña, términos y registro.
- `useForgotPasswordForm`: Validación de correo institucional y envío de restablecimiento.

### 3. Capa de Servicios

#### AuthContext

El contexto de autenticación (`AuthContext`) expone las siguientes funciones:

| Función                                          | Descripción                                       |
| ------------------------------------------------ | ------------------------------------------------- |
| `login(email, password)`                         | Inicia sesión con email y contraseña              |
| `register(firstName, lastName, email, password)` | Crea una cuenta nueva                             |
| `loginWithMicrosoft()`                           | Autenticación mediante Microsoft OAuth            |
| `resetPassword(email)`                           | Envía un enlace de restablecimiento               |
| `logout()`                                       | Cierra la sesión y limpia el almacenamiento local |

Los errores de Firebase se mapean a mensajes legibles en español mediante `mapFirebaseError()`.

#### Capa de Persistencia (Storage)

Implementa los principios **ISP** y **DIP** mediante el patrón **Adapter**:

```
IStorageAdapter (interfaz abstracta)
    ↑
LocalStorageAdapter (implementación concreta)
    ↑
├── TokenStorage (implementa ITokenStorage)
└── UserStorage (implementa IUserStorage)
```

- **IStorageAdapter**: Define las operaciones básicas de almacenamiento (getItem, setItem, removeItem, clear).
- **LocalStorageAdapter**: Implementa `IStorageAdapter` usando la API de `localStorage`.
- **TokenStorage**: Persiste el token JWT de autenticación.
- **UserStorage**: Persiste los datos del usuario autenticado (serializados como JSON).

La función `createStorageServices()` actúa como **Factory** para crear las instencias conectadas.

### 4. Capa de Validación (Schemas)

Los esquemas de Zod definen las reglas de validación para cada formulario:

| Esquema                | Reglas                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `loginSchema`          | Email válido, contraseña ≥ 8 caracteres                                               |
| `registerSchema`       | Nombres ≥ 2 car., email, contraseña ≥ 8, confirmación coincidente, términos aceptados |
| `forgotPasswordSchema` | Email con dominio `@epn.edu.ec`                                                       |

### 5. Configuración Centralizada (Theme)

El archivo `config/theme.ts` centraliza los valores de diseño (colores, animaciones, estilos de formularios) siguiendo el **Principio Abierto/Cerrado (OCP)**. Esto permite modificar la apariencia global sin alterar los componentes.

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

## Manejo de Errores

Los errores de Firebase se traducen a mensajes en español en `mapFirebaseError()`:

| Código Firebase               | Mensaje                                           |
| ----------------------------- | ------------------------------------------------- |
| `auth/user-not-found`         | "No se encontró una cuenta con este correo."      |
| `auth/wrong-password`         | "Contraseña incorrecta."                          |
| `auth/email-already-in-use`   | "Este correo ya está registrado."                 |
| `auth/weak-password`          | "La contraseña debe tener al menos 6 caracteres." |
| `auth/too-many-requests`      | "Demasiados intentos. Intenta más tarde."         |
| `auth/network-request-failed` | "Error de conexión. Verifica tu internet."        |

## Seguridad

- Las contraseñas se manejan exclusivamente a través de Firebase Auth; nunca se almacenan en texto plano en el cliente.
- Los tokens JWT se almacenan en `localStorage` mediante una capa de abstracción que facilita migrar a almacenamiento seguro (cookies HttpOnly, Secure).
- La validación del dominio `@epn.edu.ec` se realiza tanto en el cliente (Zod) como en el servidor (Firebase).
- Toda la comunicación con Firebase está cifrada mediante TLS/SSL.
