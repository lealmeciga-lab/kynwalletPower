# Data Model: Inicio de Sesión de la Billetera Virtual KynWallet

**Feature**: `002-login-billetera-virtual` | **Date**: 2026-10-19

No hay persistencia: todo vive en memoria durante la sesión del navegador. Las entidades marcadas
como **sin cambios** ya existen en el código (`src/domain/`) y se adoptan de la `001`.

## DemoAccount (dominio, sin cambios)

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | Obligatorio, formato válido, guardado normalizado (trim + minúsculas), único en el conjunto |
| `password` | string | Obligatorio, de 8 a 128 caracteres; nunca se registra ni se muestra (FR-013) |
| `displayName` | string | Obligatorio, de 1 a 80 caracteres; aparece en la bienvenida |

Se carga desde `VITE_DEMO_USERS` (FR-012, [research R3](./research.md#r3-origen-de-las-cuentas-de-demostración-conflicto-con-el-pedido)).
Una configuración ausente o inválida da `null`, que lleva al estado `unavailable`.

## LoginCredentials (dominio, sin cambios)

| Campo | Regla (FR-003, FR-004) | Mensaje |
|---|---|---|
| `email` | Vacío tras trim | "Ingresa tu correo electrónico" |
| | Formato inválido o más de 254 caracteres | "Ingresa un correo electrónico válido" |
| `password` | Vacío | "Ingresa tu contraseña" |
| | Menos de 8 caracteres | "La contraseña debe tener al menos 8 caracteres" |
| | Más de 128 caracteres | "La contraseña no puede superar 128 caracteres" |

`validateCredentials(c) → FieldErrors` es pura; `{}` significa que es válido.

## AuthResult (dominio, ampliado)

| Variante | Datos | Origen |
|---|---|---|
| `success` | `displayName` | El correo y la contraseña coinciden |
| `invalid-credentials` | — | Correo inexistente o contraseña incorrecta, sin distinguir entre ellos (FR-011) |
| `unavailable` | — | Configuración inválida o error inesperado (FR-020) |
| `validation-error` | — | **Nuevo.** El caso de uso rechazó el envío antes de llamar al gateway (FR-006) |

## LoginAttemptOutcome y LoginAttemptLogEntry (nuevo, FR-021)

```text
LoginAttemptOutcome = 'success' | 'invalid-credentials' | 'validation-error' | 'unexpected-error'
```

| Campo de la entrada | Tipo | Regla |
|---|---|---|
| `event` | `'login_attempt'` | Constante |
| `outcome` | `LoginAttemptOutcome` | `unavailable` se registra como `unexpected-error` |
| `email` | string \| null | Resultado de `maskEmail`; nunca el correo completo |
| `timestamp` | string | ISO 8601 (UTC), tomado de un reloj inyectado |

**Invariante**: la entrada no tiene ningún campo de contraseña. Las pruebas comprueban que el
texto de la contraseña no aparece en la entrada serializada (FR-013).

### maskEmail (dominio, nuevo)

| Entrada | Salida |
|---|---|
| `"  Steven@Ejemplo.com "` | `"s***@ejemplo.com"` (se normaliza antes) |
| `"a@b.co"` | `"a***@b.co"` |
| `"usuario.com"` | `"u***"` |
| `""` | `null` |

## LoginState (UI, máquina de estados, cambia `notice`)

Los estados y transiciones siguen siendo los de la `001`: `editing → submitting → welcome |
authError`, y `logout` vuelve al estado inicial. Lo que cambia:

| Campo | Antes | Ahora |
|---|---|---|
| `notice` | `string \| null` | `{ message: string; id: number } \| null` |

| Acción | Efecto |
|---|---|
| `showNotice(message)` | `notice = { message, id: anterior + 1 }`: reemplaza el aviso y reinicia el tiempo |
| `dismissNotice(id)` | **Nueva.** Pone `notice = null` solo si el `id` coincide, para que un temporizador viejo no cierre un aviso nuevo |
| `result(validation-error)` | No cambia el estado, porque el reducer ya mostró los errores en `submit` |

El aviso se cierra a los 4000 ms (FR-017), con la duración inyectada para las pruebas.
