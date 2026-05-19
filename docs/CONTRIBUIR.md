# Guía de Contribución

Gracias por tu interés en contribuir a **PoliTinder**. Este documento establece los lineamientos para realizar contribuciones al proyecto de manera organizada y consistente.

## Índice

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Contribuir?](#cómo-contribuir)
- [Flujo de Trabajo Git](#flujo-de-trabajo-git)
- [Estándares de Código](#estándares-de-código)
- [Convenciones de Commits](#convenciones-de-commits)
- [Reportar Issues](#reportar-issues)
- [Pull Requests](#pull-requests)

## Código de Conducta

Al participar en este proyecto, te comprometes a mantener un ambiente respetuoso e inclusivo. No se tolerará:

- Comentarios ofensivos o discriminatorios.
- Acoso de cualquier tipo.
- Publicación de información privada sin consentimiento.
- Cualquier conducta inapropiada en un entorno académico y profesional.

## ¿Cómo Contribuir?

### 1. Reportar Bugs

Si encuentras un error, abre un [issue](https://github.com/OfficialMYKE/PoliTinder/issues) e incluye:

- **Resumen**: Descripción clara y concisa del bug.
- **Pasos para reproducir**: Secuencia exacta de acciones.
- **Comportamiento esperado**: Qué debería ocurrir.
- **Comportamiento actual**: Qué ocurre en su lugar.
- **Entorno**: Sistema operativo, navegador, versión de Node.js.
- **Capturas de pantalla**: Si aplica.

### 2. Sugerir Mejoras

Para sugerir una mejora o nueva funcionalidad:

1. Verifica que no exista un issue similar abierto.
2. Describe el problema que resuelve la mejora.
3. Explica cómo beneficiaría a los usuarios de PoliTinder.
4. Si es posible, esboza una implementación técnica.

### 3. Contribuir Código

Sigue el flujo de trabajo descrito a continuación.

## Flujo de Trabajo Git

### 1. Crear un Fork

Haz un fork del repositorio principal a tu cuenta de GitHub.

### 2. Clonar tu Fork

```bash
git clone https://github.com/TU_USUARIO/PoliTinder.git
cd PoliTinder
```

### 3. Agregar el Repositorio Upstream

```bash
git remote add upstream https://github.com/OfficialMYKE/PoliTinder.git
```

### 4. Crear una Rama

Las ramas deben tener nombres descriptivos:

```bash
git checkout -b feature/nombre-de-la-caracteristica
# o
git checkout -b fix/descripcion-del-bug
```

### 5. Mantener tu Rama Actualizada

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Hacer Commits

Sigue las [convenciones de commits](#convenciones-de-commits).

### 7. Crear un Pull Request

Empuja tu rama y crea un PR contra `main` del repositorio upstream.

## Estándares de Código

### TypeScript / JavaScript

- **Lenguaje**: TypeScript estricto para todo el código nuevo.
- **Formato**: ESLint + Prettier (configuración incluida en el proyecto).
- **Nombres**: 
  - Componentes: `PascalCase` (e.g., `AuthFormSplitScreen`)
  - Hooks: `camelCase` con prefijo `use` (e.g., `useLoginForm`)
  - Interfaces: Prefijo `I` (e.g., `IAuthUser`, `ITokenStorage`)
  - Archivos: `camelCase` con extensión `.ts`/`.tsx`
- **Tipado**: Evitar `any` siempre que sea posible. Usar genéricos y tipos inferidos.

### React

- Componentes funcionales con hooks (no class components).
- Props tipadas con TypeScript (usar `interface` sobre `type` para props).
- Desestructurar props en la firma del componente.
- Un componente por archivo.

### Estilos

- Tailwind CSS para estilos utilitarios.
- Clases personalizadas solo si la combinación de utilidades se repite 3+ veces.
- Tema centralizado en `config/theme.ts`.

### Principios de Diseño

- **SRP**: Cada hook/clase debe tener una única responsabilidad.
- **ISP**: Interfaces pequeñas y específicas.
- **DIP**: Depender de abstracciones, no de implementaciones concretas.
- **DRY**: No repetir lógica; extraer a hooks o servicios.

## Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<alcance opcional>): <descripción>

[ cuerpo opcional ]

[ pie opcional ]
```

### Tipos

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Cambios de formato (espacios, comas, etc.) |
| `refactor` | Cambio en código que no corrige bugs ni añade features |
| `test` | Añadir o modificar tests |
| `chore` | Cambios en build, configuraciones, dependencias |
| `perf` | Mejora de rendimiento |

### Ejemplos

```
feat(auth): agregar autenticación con Microsoft OAuth
fix(storage): corregir persistencia de token en localStorage
docs: actualizar README con instrucciones de instalación
refactor(hooks): unificar manejo de estados de carga
```

## Pull Requests

### Requisitos

- [ ] El código sigue los estándares del proyecto.
- [ ] Se han probado los cambios manualmente.
- [ ] No hay conflictos con la rama `main`.
- [ ] Los commits siguen las convenciones establecidas.

### Proceso de Revisión

1. Al menos un mantenedor revisará el PR.
2. Se pueden solicitar cambios o aclaraciones.
3. Una vez aprobado, el mantenedor hará merge.

### Checklist para PRs

- [ ] ¿El código compila sin errores?
- [ ] ¿Se ejecuta `npm run lint` sin advertencias?
- [ ] ¿Los mensajes de error/éxito están en español?
- [ ] ¿Se añadieron comentarios JSDoc en funciones públicas?
- [ ] ¿Las interfaces/ tipos están correctamente definidos?

## Ambiente de Desarrollo

### Setup Inicial

```bash
cd client
npm install
npm run dev
```

### Verificación

```bash
npm run lint    # Verificar estilo de código
npm run build   # Verificar que compila correctamente
```

---

¡Gracias por contribuir a hacer de PoliTinder una mejor plataforma para la comunidad politécnica!
