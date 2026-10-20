# Quickstart: Inicio de Sesión de la Billetera Virtual KynWallet

Guía para ejecutar la demo localmente y comprobar que cumple la spec `002`. El README del
proyecto debe resumir las secciones 1 y 2 (FR-012a).

## 1. Requisitos y configuración

- Node.js 20 o superior y npm 10 o superior.

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y define al menos una cuenta **ficticia** en `VITE_DEMO_USERS` (formato en
[contracts/auth.md](./contracts/auth.md#configuración-vite_demo_users-sin-cambios)). Las
credenciales para probar son las que pongas ahí: no se muestran en pantalla ni se versionan.

## 2. Ejecutar

```bash
npm run dev        # http://localhost:5173
npm test           # pruebas una vez
npm run verify     # todos los controles de la Constitución (9.4)
```

## 3. Escenarios de validación manual

Abre las herramientas de desarrollo del navegador (pestaña Consola) antes de empezar.

| # | Pasos | Resultado esperado | Referencia |
|---|---|---|---|
| Q1 | Ingresa la cuenta de `.env.local` y presiona "Iniciar sesión" | Carga de ~1 s; luego "¡Bienvenido, {nombre}!" y "Cerrar sesión". En consola: `login_attempt` con `outcome: "success"` y el correo enmascarado | US1-1, FR-021 |
| Q2 | Presiona "Cerrar sesión" | Formulario vacío y sin mensajes | US1-5 |
| Q3 | Correo correcto y contraseña incorrecta | "Correo o contraseña incorrectos"; se conserva el correo, se vacía la contraseña y el foco queda en ella. En consola: `invalid-credentials` | US2-1, US2-3 |
| Q4 | Envía el formulario vacío | Los dos mensajes de campo y el foco en el correo. En consola: `validation-error` y `email: null` | US3-1 |
| Q5 | Activa "Google" y, dentro de los 4 s, "Apple" | Un solo aviso flotante abajo; desaparece 4 s después del segundo clic | US5-1, US5-2 |
| Q6 | Reduce el ancho a 767 px y luego a 320 px | Franja naranja solo con el logo y formulario debajo, sin desplazamiento horizontal | FR-019 |
| Q7 | Ancho de 768 px | Dos columnas; panel de marca con titular y tarjeta | FR-019 |
| Q8 | Compara a 1440 px con `modelobilletera.png` | Mismo estilo de paneles, campos, botones y tarjeta | FR-001, SC-006 |
| Q9 | Revisa todas las entradas de la consola | Ninguna contiene la contraseña ni el correo completo | FR-013 |
| Q10 | Borra `VITE_DEMO_USERS` de `.env.local` y reinicia `npm run dev` | "Servicio de acceso no disponible. Intenta más tarde." | Edge case |

## 4. Criterios de salida

- `npm run verify` termina sin errores (cobertura ≥ 80 %, sin secretos y sin violaciones de
  accesibilidad en las pruebas con `axe-core`).
- Los escenarios Q1 a Q10 se comportan como se describe.
