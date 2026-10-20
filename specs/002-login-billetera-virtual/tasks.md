---

description: "Lista de tareas de la feature 002-login-billetera-virtual"
---

# Tasks: Inicio de Sesión de la Billetera Virtual KynWallet

**Input**: Design documents from `/specs/002-login-billetera-virtual/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: OBLIGATORIAS. La Constitución (Principio I, TDD) exige escribir cada prueba primero y
verla fallar antes de implementar. Los nombres de las pruebas citan el ID de la spec `002`
(por ejemplo, `US2-3`, `FR-021`, `U4`).

**Contexto**: el código ya existe (feature `001`, commit `bb334ff`). Estas tareas lo
**modifican**; no lo rehacen. Antes de cambiar un archivo, léelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: historia de usuario de la spec (US1 a US5)

## Tabla de equivalencia de IDs `001` → `002` (usada en T002 y T003)

| En el código (`001`) | En la spec `002` |
|---|---|
| FR-001 a FR-009 | Iguales |
| FR-009a | FR-010 |
| FR-010 … FR-019 | FR-011 … FR-020 (sumar 1) |
| US1-1 a US1-5, US3-*, US4-* | Iguales |
| US2-3 (el error desaparece al editar) | US2-4 |
| US2-4 (se conserva el correo y el foco va a la contraseña) | US2-3 |
| US5-2 ("Recordarme") | US5-3 |
| `contracts/auth-gateway.md` C1–C6 | `contracts/auth.md` C1–C5 (C6 pasa a U5) |
| `research.md` R10 (responsivo) / R11 (iconos) | R6 / R1 (heredado de la `001`) |

---

## Phase 1: Setup

**Purpose**: partir de una base verde y con la trazabilidad apuntando a la spec `002`.

- [X] T001 Ejecutar `npm install` y `npm run verify` en la raíz del repositorio y confirmar que todo pasa antes de cambiar nada. Si `.env.local` no existe, crearlo a partir de `.env.example` con una cuenta ficticia (ver `specs/002-login-billetera-virtual/quickstart.md`, sección 1). No versionarlo.
- [X] T002 [P] Actualizar los IDs de los nombres de las pruebas en `src/**/*.test.ts` y `src/**/*.test.tsx` según la tabla de equivalencia. No cambiar el comportamiento de ninguna prueba. Ejecutar `npm test`: todo debe seguir en verde.
- [X] T003 [P] Actualizar los comentarios de producción que citan IDs o documentos de la `001` según la tabla: `src/domain/validation.ts`, `src/infrastructure/InMemoryAuthGateway.ts` (citar `contracts/auth.md`), `src/ui/components/Alert/Alert.tsx`, `src/ui/components/PasswordField/PasswordField.tsx`, `src/ui/components/SocialButton/SocialButton.tsx`, `src/ui/features/login/LoginForm.tsx`, `src/ui/features/login/loginReducer.ts`, `src/ui/features/login/LoginScreen.module.css` y `src/ui/layout/BrandPanel/BrandPanel.module.css`.

---

## Phase 2: Foundational (registro de intentos, FR-021)

**Purpose**: núcleo de registro que usan todas las historias, porque cada envío pasa por el
caso de uso (`contracts/auth.md`).

**⚠️ CRITICAL**: ninguna historia empieza hasta terminar esta fase.

- [X] T004 [P] Escribir `src/domain/maskEmail.test.ts` con los casos exactos de `data-model.md`: `"  Steven@Ejemplo.com "` → `"s***@ejemplo.com"`, `"a@b.co"` → `"a***@b.co"`, `"usuario.com"` → `"u***"`, `""` → `null`. Verificar que falla.
- [X] T005 Implementar `maskEmail(email: string): string | null` en `src/domain/maskEmail.ts`. Debe normalizar con `normalizeEmail` de `src/domain/validation.ts`, conservar el primer carácter de la parte local más `***` y el dominio completo; sin `@`, devolver el primer carácter + `***`; si está vacío tras normalizar, devolver `null`. Sin dependencias del navegador.
- [X] T006 Ampliar `src/domain/auth.ts`: agregar `{ kind: 'validation-error' }` a `AuthResult`; el tipo `LoginAttemptOutcome = 'success' | 'invalid-credentials' | 'validation-error' | 'unexpected-error'`; y `LoginAttemptLogEntry = { event: 'login_attempt'; outcome: LoginAttemptOutcome; email: string | null; timestamp: string }` (sin ningún campo de contraseña).
- [X] T007 [P] Crear el puerto `src/application/ports/LoginAttemptLog.ts` con `export interface LoginAttemptLog { record(entry: LoginAttemptLogEntry): void }`.
- [X] T008 Reescribir `src/application/authenticate.test.ts` para la nueva firma `createAuthenticate({ gateway, log, now })`, con un gateway falso, un `log` espía y `now` fijo. Casos U1–U6 de `contracts/auth.md`:
  - U1: credenciales inválidas → `validation-error`, el gateway no se llama, registro con `outcome: 'validation-error'`.
  - U2: éxito → registro `success`.
  - U3: credenciales incorrectas → registro `invalid-credentials`.
  - U4: `unavailable` o excepción del gateway → resultado `unavailable`, registro `unexpected-error`, la promesa no se rechaza.
  - U5: `email` = `maskEmail(email)`, `timestamp` = `now().toISOString()`, y `JSON.stringify(entry)` no contiene la contraseña.
  - U6: si `log.record` lanza, el resultado no cambia.
  - Exactamente una entrada por llamada. Verificar que falla.
- [X] T009 Implementar `createAuthenticate({ gateway, log, now = () => new Date() })` en `src/application/authenticate.ts`. Debe validar con `validateCredentials` (no duplicar reglas), normalizar el correo, delegar en el gateway, convertir `unavailable` y excepciones en `unavailable`, y registrar una entrada por llamada dentro de un `try/catch` que ignore los fallos del registro. Hacer pasar T008.
- [X] T010 [P] Escribir `src/infrastructure/ConsoleLoginAttemptLog.test.ts`: con `vi.spyOn(console, 'info')`, `record(entry)` llama una vez a `console.info('login_attempt', entry)`. Verificar que falla.
- [X] T011 Implementar `ConsoleLoginAttemptLog` (implementa `LoginAttemptLog`) en `src/infrastructure/ConsoleLoginAttemptLog.ts`. Hacer pasar T010.
- [X] T012 En `eslint.config.js`, mantener `no-console: 'error'` y agregar una excepción solo para `src/infrastructure/ConsoleLoginAttemptLog.ts`. `npm run lint` debe pasar.
- [X] T013 En `src/main.tsx`, construir el caso de uso con `createAuthenticate({ gateway: new InMemoryAuthGateway(accounts), log: new ConsoleLoginAttemptLog() })`. Ajustar todas las llamadas existentes a `createAuthenticate` en las pruebas (por ejemplo, `src/App.test.tsx`) a la nueva firma.
- [X] T014 En `src/ui/features/login/loginReducer.test.ts`, agregar una prueba: la acción `result` con `{ kind: 'validation-error' }` devuelve el mismo estado. Verificar que falla o que no compila.
- [X] T015 En `src/ui/features/login/loginReducer.ts`, manejar `result` con `validation-error` devolviendo `state` sin cambios. Ejecutar `npm test` y `npm run typecheck`: todo en verde.

**Checkpoint**: el registro funciona de punta a punta para los envíos válidos. La UI todavía no
llama al caso de uso cuando hay errores de validación (se cambia en US3).

---

## Phase 3: User Story 1 - Iniciar sesión con credenciales válidas (Priority: P1) 🎯 MVP

**Goal**: acceso exitoso con bienvenida, ahora con registro de `success` (FR-021).

**Independent Test**: con la cuenta de `.env.local`, iniciar sesión y ver
"¡Bienvenido, {nombre}!"; en la consola aparece una entrada `success` con el correo enmascarado
(quickstart Q1 y Q2).

- [X] T016 [P] [US1] En `src/ui/features/login/LoginForm.test.tsx`, agregar la prueba `US1-4`: presionar Enter con el foco en el campo **correo** (la `002` dice "cualquiera de los campos") envía el formulario y llama al caso de uso. La prueba del campo contraseña ya existe. Verificar si falla.
- [X] T017 [P] [US1] En `src/App.test.tsx`, agregar la prueba de integración `US1-1 / FR-021`: con el `createAuthenticate` real, `InMemoryAuthGateway` (`delayMs: 0`) y un `log` espía, un inicio de sesión correcto muestra la bienvenida y registra exactamente una entrada con `outcome: 'success'` y el correo enmascarado, sin la contraseña (FR-013). Para comprobar FR-013, espiar `console.info` y convertir cada argumento con `JSON.stringify` (no con `String`, que deja los objetos como "[object Object]"); el resultado no debe contener la contraseña ni el correo completo.
- [X] T018 [US1] Hacer pasar T016 y T017. Si T016 falla, corregir el envío con Enter en `src/ui/features/login/LoginForm.tsx` (el formulario debe enviarse desde cualquier campo).

**Checkpoint**: US1 completa y verificable sola.

---

## Phase 4: User Story 2 - Mensaje de error ante credenciales incorrectas (Priority: P1)

**Goal**: error genérico, ahora con registro de `invalid-credentials`.

**Independent Test**: correo válido con contraseña incorrecta → "Correo o contraseña
incorrectos" y en la consola `invalid-credentials` (quickstart Q3).

- [X] T019 [US2] En `src/App.test.tsx`, agregar las pruebas `US2-1 / US2-2 / FR-021`: una contraseña incorrecta y un correo no registrado producen el mismo mensaje y una entrada `invalid-credentials` cada uno, con el correo enmascarado. Usar la misma comprobación de FR-013 que T017.
- [X] T020 [US2] Confirmar que las pruebas renombradas `US2-3` (se conserva el correo, se vacía la contraseña y el foco va a ella) y `US2-4` (el error desaparece al editar) siguen pasando en `src/ui/features/login/LoginForm.test.tsx`; corregir si alguna falla.

**Checkpoint**: US1 y US2 funcionan cada una por su cuenta.

---

## Phase 5: User Story 3 - Validar los campos antes de enviar (Priority: P2)

**Goal**: cada envío con errores también pasa por el caso de uso y queda registrado como
`validation-error`, sin estado de carga (FR-006, FR-021).

**Independent Test**: enviar el formulario vacío muestra los dos mensajes y en la consola
aparece `validation-error` con `email: null` (quickstart Q4).

- [X] T021 [P] [US3] En `src/ui/features/login/LoginForm.test.tsx`, agregar la prueba `US3-1 / FR-006`: al enviar vacío, el caso de uso (stub de `src/test/authStub.ts` configurado para devolver `{ kind: 'validation-error' }`) se llama **una vez**, el botón "Iniciar sesión" **no** queda con `aria-busy=true` ni deshabilitado, y el foco va al correo. Verificar que falla.
- [X] T022 [US3] En `src/App.test.tsx`, agregar la prueba `US3-1 / US3-2 / FR-021` con el caso de uso real y un `log` espía: un envío vacío registra `validation-error` con `email: null`; un envío con correo `"usuario.com"` registra `validation-error` con `email: "u***"`. Usar la misma comprobación de FR-013 que T017.
- [X] T023 [US3] Modificar `submit` en `src/ui/features/login/useLoginForm.ts`: si no hay una llamada en curso, llamar a `authenticate(state.values)` en **cada** envío. Solo cuando no haya errores de validación se marca `inFlight` y se pasa por `submitting`. Con errores, el resultado `validation-error` se despacha y el reducer lo ignora (T015). Debe seguir devolviendo los errores para gestionar el foco. Hacer pasar T021 y T022. Actualizar en `src/ui/features/login/LoginForm.test.tsx` las tres pruebas que comprueban `expect(stub.authenticate).not.toHaveBeenCalled()` (US3-1, US3-3 y "texto pegado"): deben comprobar que el caso de uso se llamó una vez y devolvió `validation-error`, y que el botón no tiene `aria-busy=true`. Que el gateway no se llama ya lo comprueba U1 en `authenticate.test.ts`.

**Checkpoint**: US1, US2 y US3 funcionan cada una por su cuenta, y todo envío queda registrado.

---

## Phase 6: User Story 4 - Mostrar u ocultar la contraseña (Priority: P3)

**Goal**: sin cambios funcionales respecto de la `001`.

**Independent Test**: escribir una contraseña, mostrarla y ocultarla con el control, también
con teclado.

- [X] T024 [US4] Confirmar que `src/ui/components/PasswordField/PasswordField.test.tsx` cubre `US4-1`, `US4-2` y `US4-3` con los nombres de la `002` y que pasa. No hay que cambiar código.

---

## Phase 7: User Story 5 - Elementos del diseño fuera del alcance (Priority: P3)

**Goal**: aviso "Función no disponible en esta demostración" como mensaje flotante que se
cierra a los 4 s, uno solo a la vez (FR-017).

**Independent Test**: activar "Google" y luego "Apple" en menos de 4 s: hay un solo aviso y
desaparece 4 s después del segundo clic (quickstart Q5).

- [X] T025 [P] [US5] Escribir `src/ui/components/Toast/Toast.test.tsx`: la región `role="status"` con `aria-live="polite"` está en el DOM aunque no haya mensaje (vacía); cuando `message` cambia, cambia su texto sin que la región se vuelva a crear (mismo nodo del DOM); no toma el foco y no tiene violaciones de `axe-core` (helper `src/test/a11y.ts`). Verificar que falla.
- [X] T026 [P] [US5] En `src/ui/features/login/loginReducer.test.ts`, agregar pruebas: `showNotice(message)` crea `notice = { message, id: idAnterior + 1 }` (con el anterior en `null`, `id` = 1) y reemplaza un aviso existente; `dismissNotice(id)` pone `notice = null` solo si `id` coincide y, si no, deja el estado igual; `logout` lo limpia. Verificar que falla.
- [X] T027 [P] [US5] Crear `src/ui/components/Toast/Toast.tsx` y `src/ui/components/Toast/Toast.module.css`. Recibe `message: string | null`; la región de anuncios siempre se muestra y solo cambia su contenido; cuando `message` es `null`, no se ve. Va fijo abajo y centrado (`position: fixed`, `bottom: 24px`), con ancho máximo `calc(100% - 32px)` para no causar desplazamiento horizontal desde 320 px; fondo `var(--neutral-900)` y texto `var(--neutral-0)`; radio `var(--radius-control)`. Sin lógica de negocio. Hacer pasar T025.
- [X] T028 [US5] En `src/ui/features/login/loginReducer.ts`, cambiar `notice` a `{ message: string; id: number } | null` y agregar la acción `{ type: 'dismissNotice'; id: number }` según `data-model.md`. Hacer pasar T026.
- [X] T029 [US5] En `src/ui/features/login/LoginForm.test.tsx`, conservar la prueba "el aviso desaparece al enviar el formulario" con el nombre `FR-017` (adaptada a que la región `status` siempre existe: debe quedar vacía) y, con `vi.useFakeTimers()`, reemplazar la prueba de US5-1 por estas:
  - `US5-1`: activar "¿Olvidaste tu contraseña?", "Google", "Apple" y "Regístrate" muestra en el `status` el texto "Función no disponible en esta demostración", que sigue visible a los 3999 ms y desaparece a los 4000 ms; el correo escrito se conserva.
  - `US5-2`: activar "Google", avanzar 3000 ms y activar "Apple" deja un solo `status` con el mensaje; sigue visible 3999 ms después del segundo clic y desaparece a los 4000 ms. Como el texto es el mismo, la prueba comprueba que el temporizador se reinicia (no hace falta volver a anunciarlo).
  - Verificar que falla.
- [X] T030 [US5] En `src/ui/features/login/useLoginForm.ts`, aceptar un segundo parámetro opcional `noticeDurationMs = 4000` y agregar un `useEffect` que dependa de `state.notice?.id`: programa `dispatch({ type: 'dismissNotice', id })` tras `noticeDurationMs` y limpia el temporizador al cambiar el `id` o al desmontar.
- [X] T031 [US5] En `src/ui/features/login/LoginForm.tsx`, reemplazar `<Alert tone="info">{state.notice}</Alert>` por `<Toast message={state.notice?.message ?? null} />`, sin `key`. Siempre está presente. Mantener que la acción `submit` del reducer borre el aviso (FR-017). Hacer pasar T029.
- [X] T032 [US5] Si el tono `info` de `src/ui/components/Alert/Alert.tsx` ya no se usa en ningún lado, eliminarlo junto con su estilo en `Alert.module.css` y su prueba en `Alert.test.tsx` (Constitución 4.4, sin código muerto).

**Checkpoint**: las cinco historias funcionan de forma independiente.

---

## Phase 8: Fidelidad visual y diseño responsivo (FR-001, FR-019, SC-006)

**Purpose**: aplicar la imagen `modelobilletera.png` como fuente del diseño y el corte en
768 px. Afecta a todas las historias. jsdom no evalúa CSS, así que la verificación es manual
(quickstart Q6–Q8).

- [X] T033 [P] Actualizar `src/ui/styles/tokens.css` con los valores exactos de research R7:
  - `--brand-gradient: linear-gradient(121.19deg, #ff8c48 0%, #fe4e01 70.71%)`
  - `--brand-500: #ff710f`
  - nuevo `--surface: #fafaf7`
  - `--brand-700: #c24f00`
  - `--brand-800: #ac4600`
  - `--neutral-600: #707187`
  - `--neutral-border: #8f919a`

  Reescribir el comentario de cabecera: la fuente es `specs/002-login-billetera-virtual/modelobilletera.png` (research R2); los tokens de texto, radios y alturas vienen de Figma, archivo `f7uDsv8sh6Z0tK20itTqtg`; los tokens accesibles están pendientes de aprobación de diseño.
- [X] T034 Usar `var(--surface)` en lugar de `var(--neutral-0)` como fondo en: `src/ui/features/login/LoginScreen.module.css` (`.formPanel`), `src/ui/styles/global.css` (`body`), `src/ui/components/TextField/TextField.module.css` (campo; `PasswordField` lo hereda), `src/ui/components/Button/Button.module.css` (variante de fondo blanco que usan los botones sociales, línea 38) y `src/ui/components/Checkbox/Checkbox.module.css` (fondo de la casilla). **No** cambiar los usos de `--neutral-0` como color de texto o de la marca de verificación.
- [X] T035 [P] Cambiar el corte de `960px` a `768px` en `src/ui/features/login/LoginScreen.module.css` y `src/ui/layout/BrandPanel/BrandPanel.module.css`, conservando los cortes de 480 px y 1280 px. Actualizar los comentarios de cabecera para citar FR-019 y research R6.
- [X] T036 Con `npm run dev`, medir el contraste del texto blanco del titular "Tu dinero, sin fronteras." contra el color del degradado justo detrás de él a 768 px y a 1440 px. Si es menor de 3:1, oscurecer **solo** el color inicial de `--brand-gradient` en `src/ui/styles/tokens.css` hasta llegar a 3:1, y anotar el valor final en `specs/002-login-billetera-virtual/research.md` (R7, "Riesgo heredado").
- [ ] T037 Comparar la pantalla con `specs/002-login-billetera-virtual/modelobilletera.png` a 1440 px (quickstart Q8) y revisar 320, 767 y 768 px (Q6, Q7) sin desplazamiento horizontal. Corregir en los `*.module.css` las diferencias de distribución o estilo que se encuentren, sin cambiar textos.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] T038 [P] Actualizar `README.md` según research R8:
  - Enlace a `specs/002-login-billetera-virtual/` y no a la `001`.
  - Enlace de Figma corregido (`f7uDsv8sh6Z0tK20itTqtg`), indicando que la referencia visual es `modelobilletera.png`.
  - Sección de configuración con FR-012a: cómo definir las cuentas en `.env.local` y dónde consultarlas para probar, solo con valores de ejemplo.
  - Nueva nota sobre el registro `login_attempt` en la consola (FR-021).
  - Agregar `ConsoleLoginAttemptLog`, `maskEmail` y `Toast` al árbol de arquitectura.
  - En las notas de diseño, reemplazar los contrastes viejos por los de research R7.
- [X] T039 Ejecutar `npm run verify` y corregir lo que falle: lint, formato, tipos, cobertura ≥ 80 %, build, auditorías y `secretlint`.
- [ ] T040 Recorrer los escenarios Q1–Q10 de `specs/002-login-billetera-virtual/quickstart.md` en el navegador, revisando la consola (Q9: ninguna entrada contiene la contraseña ni el correo completo).
- [ ] T041 Obtener la aprobación del responsable de diseño (Constitución 8.6) para los cambios de color respecto de `modelobilletera.png`: `--brand-700 #c24f00`, `--brand-800 #ac4600`, `--neutral-600 #707187`, `--neutral-border #8f919a` y el inicio de `--brand-gradient` (T036 lo cambió a `#f5732f`). Además, **decidir cómo resolver el contraste del logo, el subtítulo y la tarjeta del panel de marca**, que no cumplen WCAG AA (research.md R7, "Resultado de T036"). Registrar quién aprueba, la fecha y el enlace en `specs/002-login-billetera-virtual/plan.md` (Complexity Tracking). **El PR no se integra sin esta aprobación** (Constitución 9.1 y 9.3).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias. T002 y T003 en paralelo después de T001.
- **Foundational (Phase 2)**: después de Setup. **Bloquea todas las historias.**
- **US1, US2 (P1)**: después de Phase 2; son independientes entre sí.
- **US3 (P2)**: después de Phase 2 (usa T015). Toca `useLoginForm.ts`, así que conviene hacerla **antes** que US5.
- **US4 (P3)**: después de Setup (no depende de Phase 2).
- **US5 (P3)**: después de Phase 2. Comparte `useLoginForm.ts`, `loginReducer.ts` y `LoginForm.test.tsx` con US3 y US1: hacerla después de US3.
- **Phase 8**: después de Setup; no depende de las historias (solo CSS). Puede ir en paralelo con las fases 3 a 7 si la hace otra persona.
- **Polish (Phase 9)**: al final. T041 bloquea la integración del PR.

### Within Phase 2

T004 → T005; T006 → (T007, T008) → T009; T010 → T011 → T012; T009 + T011 → T013; T014 → T015.

### Parallel Opportunities

- Phase 1: T002 ∥ T003.
- Phase 2: T004 ∥ T007 ∥ T010 (después de T006 para T007).
- US1: T016 ∥ T017. T017 → T019 → T022 en orden, porque las tres modifican `src/App.test.tsx`.
  US3: T021 puede ir en paralelo con T022.
- US5: T025 ∥ T026 ∥ T027.
- Phase 8: T033 ∥ T035.

---

## Parallel Example: User Story 5

```bash
Task: "T025 Pruebas de Toast en src/ui/components/Toast/Toast.test.tsx"
Task: "T026 Pruebas de showNotice/dismissNotice en src/ui/features/login/loginReducer.test.ts"
Task: "T027 Componente Toast en src/ui/components/Toast/Toast.tsx"
```

---

## Implementation Strategy

### MVP First

1. Phase 1 + Phase 2: el registro de intentos funciona.
2. Phase 3 (US1): **detenerse y validar** con quickstart Q1 y Q2.

### Incremental Delivery

1. US1 → US2 (P1) → US3 (P2) → US4 y US5 (P3), validando cada historia con su escenario del quickstart.
2. Phase 8 (visual y responsivo) en paralelo o después.
3. Phase 9: `npm run verify` y el quickstart completo antes de abrir el PR (Constitución 9.3 y 9.4).

---

## Notes

- Cada prueba nueva debe fallar antes de implementar (Principio I).
- Commit después de cada fase, citando los IDs de las tareas (Constitución 9.2).
- No escribir credenciales reales en ningún archivo versionado (FR-012).
