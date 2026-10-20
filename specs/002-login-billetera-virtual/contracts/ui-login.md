# Contract: interfaz de la pantalla de login

Contrato que ven el usuario y las pruebas (Testing Library consulta por rol y nombre
accesible). Los textos van en español, tal como aparecen en la spec. Los cambios respecto de la
`001` están marcados con **(cambia)** o **(nuevo)**.

## Vista de inicio de sesión

| Elemento | Rol / nombre accesible | Notas |
|---|---|---|
| Título | `heading` nivel 1 "Bienvenido de nuevo" | Subtítulo "Ingresa a tu cuenta para continuar" |
| Correo | `textbox` "Correo electrónico" | `type=email`, `autocomplete=username`, placeholder "tucorreo@ejemplo.com" |
| Contraseña | campo con etiqueta "Contraseña" | `type=password` (o `text` si está visible), `autocomplete=current-password` |
| Visibilidad | `button` "Mostrar contraseña" / "Ocultar contraseña" | `aria-pressed` refleja el estado |
| Recordarme | `checkbox` "Recordarme" | No guarda nada |
| Recuperar contraseña | `button` "¿Olvidaste tu contraseña?" | Muestra el aviso flotante |
| Enviar | `button` "Iniciar sesión" | Mientras carga: `aria-busy=true`, deshabilitado, texto "Iniciando sesión…" |
| Separador | texto "o continúa con" | Decorativo |
| Google / Apple | `button` "Google", `button` "Apple" | Muestran el aviso flotante |
| Registro | `button` "Regístrate", precedido de "¿No tienes cuenta?" | Muestra el aviso flotante |

**Errores por campo**: texto debajo del campo, enlazado con `aria-describedby`, y el campo lleva
`aria-invalid=true`.

## Mensajes globales

| Caso | Rol | Texto | Ubicación |
|---|---|---|---|
| Credenciales incorrectas | `alert` | "Correo o contraseña incorrectos" | En el formulario |
| No disponible | `alert` | "Servicio de acceso no disponible. Intenta más tarde." | En el formulario |
| Función fuera de alcance **(cambia)** | `status` (`aria-live=polite`) | "Función no disponible en esta demostración" | Mensaje flotante abajo y centrado; desaparece a los 4 s o al enviar el formulario; uno solo a la vez y el tiempo se reinicia al volver a activarlo; no toma el foco. La región `status` está siempre en el DOM y solo cambia su texto |

## Vista de bienvenida

| Elemento | Rol / nombre accesible | Notas |
|---|---|---|
| Mensaje | `heading` nivel 1 "¡Bienvenido, {displayName}!" | Recibe el foco al aparecer (`tabIndex=-1`) |
| Cerrar sesión | `button` "Cerrar sesión" | Vuelve al login con todo vacío |

## Panel de marca y tamaños de pantalla **(cambia)**

| Ancho | Panel de marca | Formulario |
|---|---|---|
| < 768 px | Franja naranja superior, solo el logo "KynWallet" | Debajo, ancho completo (máx. 400 px); margen de 16 px por debajo de 480 px |
| 768–1279 px | Columna izquierda del 43 %: logo, titular "Tu dinero, sin fronteras.", texto de apoyo y tarjeta (`aria-hidden=true`) | Columna derecha, centrado |
| ≥ 1280 px | Columna de 620 px | Columna derecha, centrado |

En ningún ancho desde 320 px debe aparecer desplazamiento horizontal.

## Teclado

Orden de tabulación: correo → contraseña → visibilidad → recordarme → recuperar contraseña →
iniciar sesión → Google → Apple → regístrate. Enter en cualquier campo envía el formulario. El
foco siempre es visible (anillo de 2 px con contraste de al menos 3:1).

## Consola del navegador **(nuevo)**

Cada envío deja exactamente una entrada `login_attempt` según [auth.md](./auth.md). Ninguna
entrada contiene la contraseña ni el correo completo.
