# Implementation Plan: Inicio de Sesión de la Billetera Virtual KynWallet

**Branch**: `feature/registro-eduardo-almeciga` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-login-billetera-virtual/spec.md`

## Summary

Demo web de la pantalla de login de KynWallet que funciona solo en el navegador. Valida correo
y contraseña, simula la autenticación contra cuentas ficticias y muestra una bienvenida o un
error genérico. La spec `002` reemplaza a la `001`, que ya está implementada (commit `bb334ff`)
con React + TypeScript + Vite, una Clean Architecture ligera y componentes reutilizables.

Por eso este plan **evoluciona el código existente** en lugar de rehacerlo (Principio IV). Los
cambios son:

1. Registro estructurado de cada intento en la consola, con el correo enmascarado (FR-021).
2. Aviso "Función no disponible" como mensaje flotante de 4 s (FR-017).
3. Punto de corte responsivo en 768 px, en vez de 960 px (FR-019).
4. La imagen `modelobilletera.png` pasa a ser la fuente principal del diseño: degradado, naranja
   del botón y fondo cálido `#fafaf7` medidos en ella, con los tokens accesibles recalculados
   para ese fondo (FR-001, SC-006; research R2 y R7).
5. README y documentación apuntando a la `002` (FR-012a, 8.3).

## Technical Context

**Language/Version**: TypeScript 5.9 (`strict`); Node.js ≥ 20 LTS para las herramientas

**Primary Dependencies**: React 19, Vite 8, `@fontsource-variable/inter` (sin dependencias nuevas)

**Storage**: N/A (estado en memoria, sin persistencia)

**Testing**: Vitest 5, React Testing Library, `@testing-library/user-event`, jsdom, `axe-core`,
`@vitest/coverage-v8` (umbral del 80 %)

**Target Platform**: las dos últimas versiones de Chrome, Firefox, Safari y Edge, desde 320 px
hasta escritorio

**Project Type**: aplicación web de una sola página, solo frontend

**Performance Goals**: resultado en 2 s o menos (SC-002), con una espera simulada de 1 s

**Constraints**: sin backend, base de datos ni APIs externas; WCAG 2.1 AA; sin credenciales en
archivos versionados; sin desplazamiento horizontal desde 320 px

**Scale/Scope**: 1 pantalla con 2 vistas; 1 componente nuevo (`Toast`), 1 puerto nuevo, 1
adaptador nuevo y 1 función de dominio nueva

Sin incógnitas: todas quedaron resueltas en [research.md](./research.md).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Regla | Cumplimiento en el diseño | Estado |
|---|---|---|
| I. TDD | Cada cambio empieza con una prueba que falla: `maskEmail`, el caso de uso con registro (U1–U6), `ConsoleLoginAttemptLog`, el reducer (`dismissNotice`), `Toast` y `LoginForm`. Los nombres de las pruebas citan US/FR | ✅ |
| II. SOLID | Puerto nuevo `LoginAttemptLog` con un solo método (ISP), inyectado en el caso de uso (DIP); `Toast` reutilizable sin lógica de negocio | ✅ |
| III. Clean Architecture | `maskEmail` en el dominio (puro); el registro lo decide la aplicación; `console` solo en infraestructura. La regla de capas de ESLint sigue vigente | ✅ |
| IV. DRY/KISS/YAGNI | Se reutiliza todo lo existente. La validación sigue en una sola función del dominio, usada por el reducer y por el caso de uso. Sin librerías de toasts ni de registro | ✅ |
| V. Seguridad | Mensaje genérico; contraseña nunca registrada; correo enmascarado (5.4); cuentas en `.env.local` no versionado (5.3); `secretlint` en `verify` | ✅ con desviación del pedido (ver Complexity Tracking) |
| VI. BRD/ARD | No existen (supuesto de la spec) | ✅ N/A |
| 7. Dependencias | No se agregan dependencias | ✅ |
| 8.1 Pruebas | Unitarias y de integración de componentes; cobertura ≥ 80 % | ✅ |
| 8.2 Convenciones | ESLint + Prettier + `tsc`; excepción de `no-console` limitada a un archivo | ✅ |
| 8.3 Documentación | README actualizado con la ejecución local y FR-012a; contratos en `contracts/` | ✅ |
| 8.4 Accesibilidad AA | `Toast` con `role=status`; tokens accesibles recalculados para el fondo `#fafaf7` (R7) | ⚠️ los tokens derivados y el titular sobre el degradado necesitan aprobación de diseño |
| 8.6 Sistema de diseño | No hay sistema de diseño corporativo accesible; la fuente es la imagen de referencia (R2) | ⚠️ ver Complexity Tracking |
| 8.7 Observabilidad | Registro estructurado por intento (FR-021) | ✅ (resuelto en esta feature) |
| 9.2 Trazabilidad | Pruebas y tareas citan los IDs de la spec `002` | ✅ |
| 9.3/9.4 Revisión y controles | El repositorio ya es git; `npm run verify` cubre los controles; integración por PR | ✅ |

**Resultado del gate**: APROBADO. Hay tres desviaciones justificadas en Complexity Tracking y
ninguna violación sin justificar.

**Re-check post-diseño (Phase 1)**: data-model y contratos no agregan capas ni dependencias.
El caso de uso amplía su firma (`{ gateway, log, now }`), y eso solo afecta a `main.tsx` y a
sus pruebas. Las conclusiones no cambian.

## Project Structure

### Documentation (this feature)

```text
specs/002-login-billetera-virtual/
├── plan.md              # Este archivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── auth.md          # Puertos AuthGateway y LoginAttemptLog, caso de uso
│   └── ui-login.md      # Contrato observable de la UI
├── modelobilletera.png  # Referencia visual
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

Solo se listan los archivos nuevos (+) y modificados (~); el resto se conserva.

```text
README.md                                  ~ apunta a la 002; FR-012a; registro en consola
eslint.config.js                           ~ no-console, con excepción solo para ConsoleLoginAttemptLog
src/
├── main.tsx                               ~ inyecta ConsoleLoginAttemptLog en createAuthenticate
├── domain/
│   ├── auth.ts                            ~ AuthResult + 'validation-error'; tipos del registro
│   ├── maskEmail.ts                       + función pura
│   └── maskEmail.test.ts                  +
├── application/
│   ├── ports/LoginAttemptLog.ts           + puerto
│   ├── authenticate.ts                    ~ valida, registra y delega (contrato U1–U6)
│   └── authenticate.test.ts               ~
├── infrastructure/
│   ├── ConsoleLoginAttemptLog.ts          + adaptador
│   └── ConsoleLoginAttemptLog.test.ts     +
├── ui/
│   ├── styles/tokens.css                  ~ colores de la imagen (degradado, --brand-500, --surface) y tokens accesibles recalculados (R7)
│   ├── components/TextField, PasswordField, SocialButton   ~ fondo --surface
│   ├── components/Toast/                  + Toast.tsx, Toast.module.css, Toast.test.tsx
│   ├── layout/BrandPanel/BrandPanel.module.css     ~ corte en 768 px
│   └── features/login/
│       ├── LoginScreen.module.css         ~ corte en 768 px
│       ├── loginReducer.ts / .test.ts     ~ notice { message, id }, dismissNotice, validation-error
│       ├── useLoginForm.ts                ~ llama al caso de uso en cada envío; temporizador del aviso
│       └── LoginForm.tsx / .test.tsx      ~ Toast (posición fija) en lugar de Alert informativo
└── test/authStub.ts                       ~ admite validation-error
```

**Structure Decision**: un único proyecto de frontend en la raíz, con capas por carpeta
(`domain`, `application`, `infrastructure`, `ui`) y pruebas junto al código. Es la misma
estructura de la `001`, que ya cumple el Principio III, así que no se reorganiza nada.

## Complexity Tracking

| Violación / desviación | Por qué es necesaria | Alternativa más simple rechazada porque |
|---|---|---|
| Cuentas de demostración en `.env.local` en lugar de "predefinidas en el código", como dice el pedido | La regla 5.3 y FR-012 prohíben credenciales en el código y en archivos versionados; la Constitución prevalece (9.1). Las pruebas sí usan cuentas ficticias en código | Un arreglo en `src/` solo sería posible con una excepción temporal aprobada (9.1), y además fallaría `secretlint`. Si se aprueba, solo cambia `main.tsx` |
| Diseño tomado de `modelobilletera.png` y no del MCP de Figma | El archivo de Figma no es accesible con la cuenta actual; por pedido explícito, la imagen es la fuente (research R2) | Esperar acceso a Figma bloquea sin aportar valor |
| Botón, enlaces, textos secundarios y bordes más oscuros que en la imagen | WCAG AA es obligatorio (8.4): el botón de la imagen da 2,76:1 y su borde de campo es casi invisible. Se conserva el tono y solo se oscurece (R7). **Requiere aprobación del responsable de diseño (8.6)** | Usar los colores exactos de la imagen incumple 8.4 y SC-005 |

## Implementation Notes (2026-10-19)

- **Entorno**: el equipo no tenía Node.js; se instaló Node 24 LTS (`winget install OpenJS.NodeJS.LTS`).
- **Finales de línea**: con `core.autocrlf=true`, Git en Windows saca los archivos con CRLF y
  Prettier fallaba en los 62 archivos sin que hubiera cambios de contenido. Se agregó
  `.gitattributes` (`* text=auto eol=lf`) para que `npm run verify` dé el mismo resultado en
  cualquier sistema.
- **`Alert`**: al pasar el aviso a `Toast`, el tono `info` quedó sin uso y se eliminó junto con
  la prop `tone` (Constitución 4.4). `Alert` es ahora solo el mensaje de error.
- **Pruebas del aviso**: las pruebas con temporizadores falsos usan `fireEvent`, porque
  `userEvent` y Testing Library esperan con `setTimeout` y se cuelgan con `vi.useFakeTimers()`.
- **T023**: de las tres pruebas con `not.toHaveBeenCalled()`, solo US3-1 y US3-3 cambiaron. La
  tercera (US5-1) sigue siendo correcta, porque los botones fuera de alcance no envían el
  formulario.
- **T036**: el contraste se calculó con la geometría del degradado, no en un navegador. El
  inicio pasó a `#f5732f`. El logo, el subtítulo y la tarjeta siguen sin cumplir AA y quedan
  para la decisión de diseño de T041 (research R7).
- **Seguimiento fuera de alcance**: npm avisa que ESLint 9.39 ya no tiene soporte
  (Constitución 7.1.b y 7.5). Conviene planificar la actualización a ESLint 10 en otra feature.
