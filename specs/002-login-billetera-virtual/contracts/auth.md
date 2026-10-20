# Contract: autenticación y registro de intentos

Puertos entre la capa de aplicación y la infraestructura (Constitución 2.5 y 3.4). La UI recibe
el caso de uso ya armado desde la raíz de composición (`src/main.tsx`) y nunca conoce las
implementaciones concretas.

## Puertos

```ts
// src/application/ports/AuthGateway.ts  (sin cambios respecto de la 001)
export interface AuthGateway {
  authenticate(credentials: LoginCredentials): Promise<AuthResult>;
}

// src/application/ports/LoginAttemptLog.ts  (nuevo, FR-021)
export interface LoginAttemptLog {
  record(entry: LoginAttemptLogEntry): void;
}
```

`LoginCredentials`, `AuthResult` y `LoginAttemptLogEntry` están definidos en
[data-model.md](../data-model.md).

## Caso de uso: `createAuthenticate`

```ts
createAuthenticate(deps: {
  gateway: AuthGateway;
  log: LoginAttemptLog;
  now?: () => Date; // por defecto, () => new Date()
}): (credentials: LoginCredentials) => Promise<AuthResult>
```

Se llama **una vez por cada envío** del formulario, y es la única entrada para hacerlo.

| # | Dado | Resultado | Registro (`outcome`) |
|---|---|---|---|
| U1 | Credenciales con errores de `validateCredentials` | `validation-error`, sin llamar al gateway | `validation-error` |
| U2 | Gateway devuelve `success` | `success` | `success` |
| U3 | Gateway devuelve `invalid-credentials` | `invalid-credentials` | `invalid-credentials` |
| U4 | Gateway devuelve `unavailable` o lanza una excepción | `unavailable`; la promesa no se rechaza | `unexpected-error` |
| U5 | Cualquier caso | La entrada lleva `maskEmail(email)` y no tiene la contraseña | — |
| U6 | El registro lanza una excepción | Se ignora y el resultado no cambia (registrar nunca rompe el inicio de sesión) | — |

## Gateway de la demo: `InMemoryAuthGateway` (sin cambios)

| # | Dado | Resultado |
|---|---|---|
| C1 | Correo existente (sin distinguir mayúsculas ni espacios de los bordes) y contraseña exacta | `success` con `displayName` |
| C2 | Correo existente y contraseña distinta | `invalid-credentials` |
| C3 | Correo inexistente | `invalid-credentials` (igual que C2) |
| C4 | `accounts === null` (configuración inválida) | `unavailable` |
| C5 | Excepción interna | `unavailable`; nunca rechaza |

Constructor: `new InMemoryAuthGateway(accounts, { delayMs = 1000 })`.

## Registro de la demo: `ConsoleLoginAttemptLog` (nuevo)

Escribe una línea por intento: `console.info('login_attempt', entry)`. No se usa `console`
en ningún otro archivo de producción (regla de ESLint).

## Configuración: `VITE_DEMO_USERS` (sin cambios)

Arreglo JSON `[{ "email", "password", "displayName" }]` en `.env.local`, que no se versiona.
`loadDemoAccounts(raw)` devuelve `null` si falta, si el JSON es inválido, si incumple las reglas
del data model o si hay correos repetidos. `.env.example` y el README solo llevan valores de
ejemplo (FR-012a).
