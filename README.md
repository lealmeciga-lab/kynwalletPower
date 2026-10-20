# KynWallet · Inicio de sesión (demo)

Demostración funcional, solo del lado del cliente, de la pantalla de inicio de sesión de la
billetera virtual KynWallet. Sigue el estilo del prototipo de Figma
([Billetera Virtual · Prototipos](https://www.figma.com/design/f7uDsv8sh6Z0tK20itTqtg/Billetera-Virtual---Prototipos?node-id=2-2));
como el archivo no es accesible, la referencia visual vigente es
[`modelobilletera.png`](specs/002-login-billetera-virtual/modelobilletera.png). Valida los
campos y simula la autenticación contra cuentas ficticias, sin backend ni base de datos.

Especificación, plan y tareas: [`specs/002-login-billetera-virtual/`](specs/002-login-billetera-virtual/)
(reemplaza a `specs/001-login-billetera/`, que queda como histórico).

## Requisitos

- Node.js 20 LTS o superior y npm 10 o superior.

## Configuración

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y define al menos una cuenta **ficticia** en `VITE_DEMO_USERS`:

```dotenv
VITE_DEMO_USERS=[{"email":"tu.correo@example.com","password":"minimo-8-caracteres","displayName":"Tu Nombre"}]
```

- `password`: de 8 a 128 caracteres. `displayName`: de 1 a 80 caracteres. Los correos no se pueden repetir.
- `.env.local` no se versiona: la Constitución del proyecto (regla 5.3) prohíbe credenciales en el
  código fuente o en archivos versionados.
- ⚠️ Al ser una aplicación solo-cliente, el valor de `VITE_DEMO_USERS` queda incluido en el bundle
  compilado. Usa únicamente cuentas ficticias.
- Si la variable falta o es inválida, la pantalla muestra "Servicio de acceso no disponible".
- **Credenciales para probar la demo**: son las que definas en tu `.env.local`. La pantalla no las
  muestra y no se publican en ningún archivo versionado; los valores de arriba son solo un
  ejemplo (FR-012a).

## Registro de intentos

Cada envío del formulario deja una línea en la consola del navegador (FR-021):

```text
login_attempt { event: 'login_attempt', outcome: 'success', email: 's***@example.com', timestamp: '2026-10-19T15:30:00.000Z' }
```

`outcome` puede ser `success`, `invalid-credentials`, `validation-error` o `unexpected-error`.
El correo va enmascarado (primer carácter y dominio) y la contraseña nunca se registra.

## Scripts

| Comando                           | Descripción                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo en <http://localhost:5173>                                                                                                     |
| `npm run build`                   | Typecheck y build de producción en `dist/`                                                                                                            |
| `npm run preview`                 | Sirve el build de producción                                                                                                                          |
| `npm test`                        | Ejecuta las pruebas una vez                                                                                                                           |
| `npm run test:watch`              | Pruebas en modo observación                                                                                                                           |
| `npm run test:coverage`           | Pruebas con cobertura (umbral: 80 %)                                                                                                                  |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                                                                     |
| `npm run verify`                  | Todos los controles de cumplimiento: lint, formato, tipos, pruebas con cobertura, build, auditoría de dependencias y licencias, y escaneo de secretos |

## Arquitectura

Clean Architecture ligera. Las dependencias apuntan hacia el dominio y ESLint lo verifica:

```text
src/
├── domain/          # Tipos, validación, `maskEmail` y textos. Sin React.
├── application/     # Caso de uso `authenticate` y puertos `AuthGateway` y `LoginAttemptLog`
├── infrastructure/  # `InMemoryAuthGateway` (simulación, 1 s), `loadDemoAccounts` y `ConsoleLoginAttemptLog`
├── ui/
│   ├── styles/      # Tokens de diseño (`tokens.css`) y estilos globales
│   ├── components/  # Button, TextField, PasswordField, Checkbox, SocialButton, Divider, Alert, Toast
│   ├── layout/      # BrandPanel
│   └── features/login/  # LoginScreen, LoginForm, WelcomeView, reducer y hook
├── App.tsx
└── main.tsx         # Raíz de composición (inyección de dependencias)
```

Las pruebas viven junto al código (`*.test.ts(x)`). Cada caso se nombra con el escenario o
requisito que verifica (por ejemplo, `US2-1`, `FR-012`) para mantener la trazabilidad.

## Notas de diseño

- **Colores**: el degradado, el naranja de marca y el fondo `#fafaf7` se midieron en la imagen
  de referencia. El botón, los enlaces, los textos secundarios y los bordes usan variantes más
  oscuras del mismo tono para cumplir WCAG 2.1 AA (`--brand-700`, `--neutral-600`,
  `--neutral-border` en `src/ui/styles/tokens.css`). Detalle en
  `specs/002-login-billetera-virtual/research.md` (R7).
- **Pendiente de aprobación de diseño (Constitución 8.6)**: esos colores derivados y el contraste
  del logo, el subtítulo y la tarjeta del panel de marca, que todavía no cumplen AA
  (`tasks.md`, T041).
- Los iconos de Google, Apple y del control de visibilidad son los marcadores de posición del
  diseño de Figma.
- Fuera de alcance: recuperar contraseña, registro, acceso con Google/Apple, persistencia de
  "Recordarme" y bloqueo por intentos fallidos. Al activarlos se muestra un aviso flotante de 4 s.
