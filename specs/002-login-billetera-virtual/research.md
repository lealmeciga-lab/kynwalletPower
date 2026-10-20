# Research: Inicio de Sesión de la Billetera Virtual KynWallet

**Feature**: `002-login-billetera-virtual` | **Date**: 2026-10-19

Esta feature reemplaza a `001-login-billetera`, que ya está implementada (commit `bb334ff`). Las
decisiones de la `001` que siguen vigentes se adoptan tal cual y se resumen en R1. Las
secciones R2 a R8 cubren lo nuevo o lo que cambia con la spec `002`. Todas las incógnitas del
Technical Context quedan resueltas.

## R1. Decisiones heredadas de la `001` (vigentes sin cambios)

| Tema | Decisión | Detalle en |
|---|---|---|
| Stack | React 19 + TypeScript 5 `strict` + Vite 8, Node.js ≥ 20 | `specs/001-login-billetera/research.md` R1 |
| Estilos | CSS Modules + tokens CSS en `src/ui/styles/tokens.css`, Inter autoalojada | R2 de la `001` |
| Contraste AA | Tokens derivados más oscuros (`--brand-700`, `--neutral-600`, `--neutral-border`), pendientes de aprobación de diseño | R3 de la `001` |
| Simulación | `InMemoryAuthGateway` con espera inyectable de 1000 ms | R5 de la `001` |
| Estado del formulario | `useReducer` con máquina de estados explícita, sin librerías de formularios | R6 de la `001` |
| Validación de correo | Regex simple + longitud ≤ 254; contraseña de 8 a 128 caracteres, sin recortar | R7 de la `001` |
| Pruebas y calidad | Vitest 5 + Testing Library + `axe-core`, cobertura ≥ 80 %, ESLint + Prettier | R8 de la `001` |
| Controles 9.4 | Script `npm run verify` (lint, formato, tipos, cobertura, build, auditorías, `secretlint`) | R9 de la `001` |

Cuando el plan de la `002` se apruebe, la `research.md` de la `001` queda como histórico. Las
filas de esta tabla son las que mandan.

## R2. Fuente del diseño: Figma inaccesible

- **Hallazgo**: el MCP de Figma responde "no tienes acceso de edición" para el archivo
  `f7uDsv8sh6Z0tK20itTqtg` (intentos del 2026-10-19 con `get_metadata` y `get_screenshot`). El
  pedido de "usar el MCP de Figma" no se puede cumplir en esta sesión.
- **Decision (2026-10-19, por pedido explícito)**: la **fuente principal del diseño es la imagen
  `specs/002-login-billetera-virtual/modelobilletera.png`**. Los colores, la distribución y el
  estilo de los componentes se toman de ella (ver R7, que tiene los valores medidos). Los
  tokens actuales de `tokens.css`, sacados de Figma el 2026-10-14, se usan solo para lo que la
  imagen no permite medir con precisión: tipografía, radios, alturas y espaciados.
- **Rationale**: es la única referencia visual disponible hoy y la que indica la spec (FR-001).
- **Alternatives considered**: esperar acceso a Figma (bloquea sin necesidad); mantener los
  tokens de Figma como fuente principal (contradice el pedido y la spec).
- **Acción opcional**: si más adelante se obtiene acceso a Figma, comparar con
  `get_variable_defs` sobre el nodo `2:2`. Solo hay que actualizar `tokens.css`.

## R3. Origen de las cuentas de demostración (conflicto con el pedido)

- **Conflicto**: el pedido dice "usuarios ficticios predefinidos en el código". FR-012 y la
  regla 5.3 de la Constitución prohíben credenciales en el código fuente y en archivos
  versionados. La Constitución prevalece (9.1).
- **Decision**: se mantiene lo que ya funciona. Las cuentas se leen de `VITE_DEMO_USERS` en
  `.env.local` (no versionado); `.env.example` solo lleva valores de ejemplo (FR-012a). Las
  **pruebas** sí usan cuentas ficticias definidas en código (`src/test/fixtures.ts`), porque son
  datos de prueba inyectados que no dan acceso a nada.
- **Rationale**: cumple 5.3 sin backend. Como las cuentas entran por inyección, si se aprueba
  una excepción temporal (9.1) para tenerlas en el código, solo cambia `src/main.tsx`.
- **Alternatives considered**: arreglo de cuentas en `src/` (incumple 5.3 y no pasaría
  `secretlint`).

## R4. Registro estructurado de intentos (FR-021)

- **Decision**:
  - Dominio: función pura `maskEmail(email)` en `src/domain/maskEmail.ts`. Conserva el primer
    carácter de la parte local y el dominio completo (`steven@ejemplo.com` → `s***@ejemplo.com`).
    Si no hay `@`, devuelve el primer carácter seguido de `***`; si está vacío, devuelve `null`.
  - Aplicación: puerto `LoginAttemptLog` con un solo método `record(entry)`.
  - El caso de uso pasa a ser la única entrada de cada envío del formulario: valida con
    `validateCredentials` (la misma función del dominio que usa el reducer), registra
    `validation-error` sin llamar al gateway cuando hay errores y, si no los hay, autentica y
    registra el resultado.
  - Infraestructura: `ConsoleLoginAttemptLog` escribe
    `console.info('login_attempt', { event, outcome, email, timestamp })`. Es el único archivo
    con permiso de ESLint para usar `console`.
- **Rationale**: un solo punto registra todos los resultados, lo que permite probarlo y evita
  repetir la lógica. El dominio sigue sin depender del navegador (Principio III) y la contraseña
  no llega nunca al registro.
- **Alternatives considered**: registrar desde el hook de UI (pone en la presentación una regla
  que pertenece a la aplicación, 3.3); un decorador del gateway (no ve los errores de
  validación, que nunca llegan al gateway).

## R5. Aviso flotante "Función no disponible" (FR-017)

- **Decision**: nuevo componente reutilizable `Toast` en `src/ui/components/Toast/`. Va fijo
  abajo y centrado, con `role="status"` y `aria-live="polite"`, y no recibe el foco. El estado
  pasa de `notice: string | null` a `notice: { message, id } | null`. Cada activación crea un
  `id` nuevo, y un efecto ligado a ese `id` programa `dismissNotice` a los 4000 ms. Así,
  activar otro elemento reemplaza el mensaje y reinicia el tiempo, y nunca hay dos a la vez.
  Esto reemplaza al `Alert tone="info"` en línea que usaba la `001`.
- **Rationale**: un mensaje informativo que se cierra solo y no bloquea nada es aceptable en
  WCAG 2.2.1, porque no es contenido esencial. La duración se inyecta para poder probarla con
  temporizadores falsos.
- **Alternatives considered**: una librería de toasts (agrega una dependencia para un solo
  aviso, YAGNI).

## R6. Diseño responsivo (FR-019)

- **Decision**: el punto de corte pasa de 960 px a **768 px** en `LoginScreen.module.css` y
  `BrandPanel.module.css`:
  - Menos de 768 px: franja naranja con el logo arriba y el formulario a ancho completo debajo
    (máximo 400 px). Por debajo de 480 px el margen lateral es de 16 px.
  - De 768 a 1279 px: dos columnas (marca 43 %).
  - Desde 1280 px: marca de 620 px fijos.
- **Rationale**: es el valor que fijó la aclaración de la spec. El resto del comportamiento
  responsivo ya existe.
- **Riesgo**: entre 768 y 959 px la columna del formulario mide unos 437 px. Hay que comprobar
  que no aparezca desplazamiento horizontal en 768 px.

## R7. Fidelidad visual con la imagen de referencia (FR-001, SC-006)

**Colores medidos en la imagen** (muestreo de píxeles en zonas planas, imagen de 1190 × 776).
Los colores del texto no se pudieron medir con fiabilidad porque el suavizado de bordes y la
compresión los alteran; para el texto se mantienen los tokens actuales.

| Elemento | Imagen | `tokens.css` actual | Diferencia |
|---|---|---|---|
| Degradado del panel de marca | `#ff8c48` (arriba a la izquierda) → `#fe4e01` (derecha, zona más intensa); `#ff9257` abajo | `#ff8a65` → `#ef5226` | La imagen es más saturada y tira más al amarillo |
| Botón principal | `#ff710f` | `--brand-500 #ff6b3d` | Naranja más puro |
| Fondo del panel de formulario | `#fafaf7` | `--neutral-0 #ffffff` | La imagen es blanco cálido |
| Fondo de campos y botones sociales | `#fafaf7` (igual al panel), con borde muy suave | `#ffffff` | Los campos no se distinguen del fondo |
| Tarjeta | Superficie translúcida (`#ffab7d` sobre el degradado); chip `#f4cf7a` | `--card-surface` 16 % blanco; chip `rgba(255,217,128,.9)` | Equivalentes; sin cambios |

- **Decision**:
  1. Actualizar en `tokens.css` el degradado (`#ff8c48 → #fe4e01`), `--brand-500` (`#ff710f`) y
     agregar `--surface #fafaf7` para el panel de formulario, los campos y los botones sociales.
  2. **Recalcular los tokens accesibles** (8.4), porque el nuevo fondo `#fafaf7` y el nuevo
     naranja bajan el contraste de los actuales:

     | Token | Actual | Contraste sobre `#fafaf7` | Nuevo | Contraste |
     |---|---|---|---|---|
     | `--brand-700` (botón y enlaces) | `#d04721` | 4,36:1 ❌ | `#c24f00` (mismo tono que `#ff710f`) | 4,55:1 ✅ |
     | `--brand-800` (hover del botón) | `#b03b1b` | — | `#ac4600` | 5,53:1 ✅ |
     | `--neutral-600` (textos secundarios) | `#73748b` | 4,37:1 ❌ | `#707187` | 4,56:1 ✅ |
     | `--neutral-border` (bordes de campos) | `#92949c` | 2,89:1 ❌ | `#8f919a` | 3,00:1 ✅ |

     Los demás tokens de texto siguen cumpliendo sobre `#fafaf7`: `--neutral-700` 9,73:1,
     `--neutral-900` 16,72:1, `--danger-600` 5,38:1.
  3. El botón exacto de la imagen (texto blanco sobre `#ff710f`) da 2,76:1 y no cumple AA, así
     que el botón usa `--brand-700`, como ya pasaba en la `001`. El borde de campo de la imagen
     es casi invisible (no cumple 1.4.11), así que se usa `--neutral-border`.
  4. Comparar luego la distribución punto por punto: dos paneles, tarjeta, campos, botón
     principal, separador, botones sociales y pie.
- **Rationale**: la imagen manda en lo visual (R2), pero WCAG AA es obligatorio (8.4). Se
  conserva el tono de cada color de la imagen y solo se oscurece lo mínimo necesario.
- **Riesgo heredado**: el titular blanco sobre la zona clara del degradado (`#ff8c48`) tiene un
  contraste de 2,31:1, menos del 3:1 que pide el texto grande. La versión de la `001` tenía el
  mismo problema. En la implementación hay que comprobar el contraste detrás del titular y,
  si no llega, oscurecer solo el inicio del degradado. Queda sujeto a aprobación de diseño (8.6).
- **Resultado de T036 (2026-10-19)**: contraste calculado sobre el área del texto con la geometría
  de `linear-gradient` (121,19°), con el panel a 1440 px (620 × 1024) y a 768 px (330 × 1024).
  No se midió en un navegador.

  | Texto | Requisito | Degradado de la imagen (`#ff8c48` → `#fe4e01`) | Con el inicio en `#f5732f` (aplicado) |
  |---|---|---|---|
  | Titular (44 px negrita) | 3:1 | 2,66:1 ❌ | 3,04:1 (1440 px) y 3,09:1 (768 px) ✅ |
  | Logo "KynWallet" (26 px negrita) | 3:1 | ≈ 2,3:1 ❌ | ≈ 2,9:1 ❌ |
  | Subtítulo (17 px, blanco al 85 %) | 4,5:1 | 2,37:1 ❌ | ≈ 2,6:1 ❌ |

  **Pendiente (Constitución 8.4)**: el logo, el subtítulo y los textos de la tarjeta no llegan al
  mínimo con ningún ajuste del inicio del degradado; incluso sobre el color final `#fe4e01`, el
  blanco da 3,33:1. La versión de la `001` tenía el mismo problema (≈ 2,3:1). Resolverlo exige
  oscurecer todo el panel de marca (por ejemplo, terminar en `#c24f00`) o cambiar el tratamiento
  del texto, y eso es una decisión de diseño. Queda incluido en la aprobación de T041.

## R8. Documentación (FR-012a, Constitución 8.3)

- **Decision**: actualizar `README.md` para que apunte a `specs/002-login-billetera-virtual/` y
  no a la `001`, use el enlace correcto de Figma (`...Z0tK20it...`), explique cómo definir y
  consultar las cuentas de demostración (solo valores de ejemplo) y describa el registro en
  consola de FR-021. Actualizar también los comentarios de `tokens.css` que citan la clave de
  Figma mal escrita.
