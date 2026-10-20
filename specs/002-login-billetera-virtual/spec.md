# Feature Specification: Inicio de Sesión de la Billetera Virtual KynWallet

**Feature Branch**: `feature/registro-eduardo-almeciga`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "Necesito construir una pantalla web de inicio de sesión para una
billetera virtual, con el objetivo de permitir que los usuarios accedan a la aplicación de manera
sencilla. El diseño de referencia se encuentra en Figma:
https://www.figma.com/design/f7uDsv8sh6Z0tK20itTqtg/Billetera-Virtual---Prototipos?node-id=2-2.
La pantalla debe permitir ingresar correo y contraseña, validar los campos y simular una
autenticación. Si las credenciales son correctas, debe mostrar un mensaje de bienvenida; de lo
contrario, un mensaje de error. El alcance se delimita a una demostración funcional del login,
sin servicios backend ni base de datos. Genera historias de usuario y criterios de aceptación,
respetando la Constitución del proyecto."

**Diseño de referencia**: el archivo de Figma no está accesible, así que la referencia visual es
la imagen [`modelobilletera.png`](modelobilletera.png), guardada junto a esta especificación. Esa imagen muestra la pantalla hermana
`04 · Registro` del mismo prototipo y se usa solo para el lenguaje visual compartido:

- **Panel de marca (izquierda, aproximadamente 43 % del ancho)**: degradado naranja, logo
  "KynWallet" en blanco arriba a la izquierda, titular grande en blanco con texto de apoyo debajo,
  y una tarjeta ilustrativa translúcida abajo ("Kyn Card", chip dorado, número "5294 •••• ••••
  4827", titular "STEVEN LUNA", vencimiento "12/29").
- **Panel de formulario (derecha)**: fondo claro casi blanco y el formulario centrado. Tiene un
  título en negrita oscuro con subtítulo gris, etiquetas encima de cada campo, campos con borde
  suave, esquinas redondeadas y texto de ejemplo gris, y un ícono de ojo dentro de los campos de
  contraseña. Debajo están la casilla con enlace en naranja, el botón principal naranja de ancho
  completo con texto blanco, un separador con texto gris centrado, los botones secundarios
  "Google" y "Apple" lado a lado con borde, y un enlace al pie con la acción en naranja.

**Contenido de la pantalla de login**: se aplica ese mismo lenguaje visual. El panel de marca
lleva el titular "Tu dinero, sin fronteras." y su texto de apoyo. El panel de formulario muestra
"Bienvenido de nuevo", los campos "Correo electrónico" y "Contraseña" (con control de
visibilidad), la casilla "Recordarme", el enlace "¿Olvidaste tu contraseña?", el botón "Iniciar
sesión", el acceso con Google y Apple, y el pie "¿No tienes cuenta? Regístrate".

**Relación con otras features**: esta especificación es la fuente autorizada de las reglas de
inicio de sesión y reemplaza a `specs/001-login-billetera`, que queda solo como histórico
(Constitución, regla 4.1). La implementación actual del commit `bb334ff` se construyó con la
`001` y DEBE ajustarse a esta especificación en la fase de planificación.

## Clarifications

### Session 2026-10-19

- Q: ¿Qué debe registrar la demo sobre cada intento de inicio de sesión, ya que no hay backend?
  → A: Un registro estructurado por intento en la consola del navegador con el resultado, la hora
  y el correo enmascarado (por ejemplo, `s***@ejemplo.com`); nunca la contraseña.
- Q: En pantallas angostas (celular), ¿qué pasa con el panel naranja de marca? → A: Se reduce a
  una franja superior naranja con el logo; se ocultan el titular, el texto de apoyo y la tarjeta.
- Q: ¿Cómo sabe quien prueba la demo qué correo y contraseña usar? → A: La guía de ejecución del
  proyecto (README) explica dónde definir y consultar las cuentas en la configuración externa; la
  pantalla no las muestra y los valores reales no se escriben en archivos versionados.
- Q: ¿Cómo debe mostrarse el aviso "Función no disponible en esta demostración" y cuándo
  desaparece? → A: Mensaje flotante breve en la parte inferior, anunciado por lectores de
  pantalla, que desaparece a los 4 segundos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Iniciar sesión con credenciales válidas (Priority: P1)

**Como** usuario de la billetera virtual, **quiero** ingresar mi correo electrónico y mi
contraseña, **para** acceder a la aplicación de forma sencilla y recibir confirmación de que
ingresé correctamente.

**Why this priority**: es el propósito central de la pantalla; sin este flujo la demostración no
aporta valor.

**Independent Test**: se ingresan el correo y la contraseña de una cuenta de demostración, se
presiona "Iniciar sesión" y se verifica que aparece el mensaje de bienvenida con el nombre del
titular.

**Acceptance Scenarios**:

1. **Given** la pantalla de inicio de sesión cargada, **When** el usuario ingresa el correo y la
   contraseña de una cuenta de demostración válida y presiona "Iniciar sesión", **Then** el
   formulario se reemplaza por una vista de bienvenida con el mensaje "¡Bienvenido, {nombre del
   titular}!" y un botón "Cerrar sesión".
2. **Given** el usuario envió el formulario con datos válidos, **When** la autenticación simulada
   está en curso, **Then** el botón "Iniciar sesión" muestra un indicador de carga, queda
   deshabilitado y no acepta envíos adicionales.
3. **Given** el usuario escribe el correo con mayúsculas o con espacios al inicio o al final,
   **When** envía credenciales correctas, **Then** el sistema lo autentica igualmente.
4. **Given** el foco en cualquiera de los campos, **When** el usuario presiona Enter, **Then** el
   formulario se envía igual que al presionar "Iniciar sesión".
5. **Given** la vista de bienvenida, **When** el usuario presiona "Cerrar sesión", **Then** se
   vuelve al formulario de inicio de sesión con los campos vacíos y sin mensajes.

---

### User Story 2 - Recibir un mensaje de error ante credenciales incorrectas (Priority: P1)

**Como** usuario, **quiero** que se me informe claramente cuando mis credenciales no son
correctas, **para** corregirlas e intentarlo de nuevo.

**Why this priority**: el requerimiento exige explícitamente el mensaje de error; sin él la
demostración no representa un inicio de sesión completo ni seguro.

**Independent Test**: se ingresa un correo con formato válido y una contraseña incorrecta, se
envía el formulario y se verifica el mensaje de error genérico.

**Acceptance Scenarios**:

1. **Given** la pantalla de inicio de sesión, **When** el usuario envía un correo registrado con
   una contraseña incorrecta, **Then** se muestra el mensaje "Correo o contraseña incorrectos" y no
   se muestra la bienvenida.
2. **Given** la pantalla de inicio de sesión, **When** el usuario envía un correo no registrado,
   **Then** se muestra exactamente el mismo mensaje genérico, sin revelar si el correo existe.
3. **Given** un intento fallido, **When** se muestra el error, **Then** el correo ingresado se
   conserva, la contraseña se vacía y el foco se coloca en el campo de contraseña.
4. **Given** el mensaje de error visible, **When** el usuario modifica cualquiera de los campos,
   **Then** el mensaje de error desaparece.

---

### User Story 3 - Validar los campos antes de enviar (Priority: P2)

**Como** usuario, **quiero** que el formulario me indique qué datos faltan o tienen formato
incorrecto antes de intentar el acceso, **para** corregir los errores rápidamente.

**Why this priority**: mejora la usabilidad y evita intentos innecesarios, pero el flujo
principal (P1) puede demostrarse sin ella.

**Independent Test**: se envía el formulario vacío y luego con un correo mal formado, y se
verifican los mensajes de cada campo.

**Acceptance Scenarios**:

1. **Given** ambos campos vacíos, **When** el usuario presiona "Iniciar sesión", **Then** se
   muestran "Ingresa tu correo electrónico" e "Ingresa tu contraseña" junto a cada campo, no se
   comparan las credenciales ni se muestra el estado de carga, y el foco pasa al primer campo con
   error.
2. **Given** un correo sin formato válido (por ejemplo "usuario@" o "usuario.com"), **When** el
   usuario sale del campo o envía el formulario, **Then** se muestra "Ingresa un correo
   electrónico válido".
3. **Given** una contraseña de menos de 8 caracteres, **When** el usuario envía el formulario,
   **Then** se muestra "La contraseña debe tener al menos 8 caracteres" y no se comparan las
   credenciales ni se muestra el estado de carga.
4. **Given** un campo con mensaje de validación, **When** el usuario corrige el valor, **Then** el
   mensaje de ese campo desaparece.
5. **Given** un campo con error, **When** un lector de pantalla lo recorre, **Then** se anuncia el
   mensaje de error asociado a ese campo.

---

### User Story 4 - Mostrar u ocultar la contraseña (Priority: P3)

**Como** usuario, **quiero** ver temporalmente la contraseña que escribí, **para** confirmar que la
ingresé correctamente.

**Why this priority**: es una conveniencia presente en el diseño, no imprescindible para acceder.

**Independent Test**: se escribe una contraseña, se activa el control de visibilidad y se
verifica que el texto se muestra; al activarlo de nuevo, se oculta.

**Acceptance Scenarios**:

1. **Given** una contraseña oculta, **When** el usuario activa el control de visibilidad, **Then**
   la contraseña se muestra en texto legible y el control indica "Ocultar contraseña".
2. **Given** la contraseña visible, **When** el usuario activa el control de nuevo, **Then** la
   contraseña se oculta y el control indica "Mostrar contraseña".
3. **Given** el control de visibilidad, **When** el usuario lo opera solo con teclado, **Then**
   puede alcanzarlo y activarlo, y su estado se anuncia a las tecnologías de asistencia.

---

### User Story 5 - Elementos del diseño fuera del alcance (Priority: P3)

**Como** usuario de la demostración, **quiero** que los elementos del diseño que no forman parte
del alcance me informen que no están disponibles, **para** no confundirlos con un error.

**Why this priority**: mantiene la fidelidad al diseño sin ampliar el alcance funcional (YAGNI).

**Independent Test**: se activa cada elemento fuera de alcance y se verifica el aviso
informativo.

**Acceptance Scenarios**:

1. **Given** la pantalla de inicio de sesión, **When** el usuario activa "¿Olvidaste tu
   contraseña?", "Google", "Apple" o "Regístrate", **Then** aparece en la parte inferior un
   mensaje flotante "Función no disponible en esta demostración", anunciado por lectores de
   pantalla, que desaparece a los 4 segundos, y se conservan los datos ingresados.
2. **Given** el mensaje flotante visible, **When** el usuario activa otro elemento fuera de
   alcance, **Then** se muestra un solo mensaje y su tiempo de 4 segundos vuelve a empezar.
3. **Given** la casilla "Recordarme", **When** el usuario la marca o desmarca, **Then** cambia de
   estado visualmente sin almacenar ningún dato.

---

### Edge Cases

- El usuario presiona "Iniciar sesión" varias veces seguidas: solo se procesa un intento.
- El correo tiene espacios al inicio o al final: se ignoran al validar y al comparar.
- La contraseña contiene espacios: se respetan tal cual, sin recortarlos.
- El correo supera 254 caracteres o la contraseña supera 128: se muestra un mensaje de
  validación y no se ejecuta la autenticación.
- El usuario pega texto en los campos: se valida igual que el texto escrito.
- La configuración de cuentas de demostración no está disponible: se muestra "Servicio de acceso
  no disponible. Intenta más tarde." sin detalles técnicos.
- El usuario recarga la página después de un acceso exitoso: vuelve al formulario de inicio de
  sesión, porque no existe sesión persistente.
- Ventana estrecha (móvil, de 320 a 767 px): se ve la franja naranja con el logo y, debajo, el
  formulario completo, utilizable sin desplazamiento horizontal.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La pantalla DEBE seguir el lenguaje visual de la referencia
  `modelobilletera.png` (estructura de dos paneles, colores, tipografía, estilo de campos,
  botones y tarjeta ilustrativa) con el contenido de login descrito en "Contenido de la pantalla
  de login", aplicando el sistema de diseño corporativo cuando exista (Constitución, regla 8.6).
- **FR-002**: La pantalla DEBE permitir ingresar un correo electrónico y una contraseña.
- **FR-003**: El sistema DEBE validar que el correo sea obligatorio, tenga formato de correo
  válido y no supere 254 caracteres.
- **FR-004**: El sistema DEBE validar que la contraseña sea obligatoria y tenga entre 8 y 128
  caracteres.
- **FR-005**: El sistema DEBE mostrar los mensajes de validación junto al campo correspondiente,
  al salir del campo y al intentar enviar, y DEBE ocultarlos cuando el valor se corrija.
- **FR-006**: El sistema NO DEBE comparar las credenciales con las cuentas de demostración ni
  mostrar el estado de carga mientras haya errores de validación. El intento sí queda registrado
  como error de validación (FR-021).
- **FR-007**: El sistema DEBE simular la autenticación comparando las credenciales ingresadas con
  un conjunto de cuentas de demostración, sin servicios backend ni base de datos.
- **FR-008**: La autenticación simulada DEBE incluir una espera breve (alrededor de 1 segundo) con
  indicador de carga, durante la cual no se aceptan nuevos envíos.
- **FR-009**: Ante credenciales correctas, el sistema DEBE reemplazar el formulario por una vista
  de bienvenida con el nombre del titular y un botón "Cerrar sesión", y DEBE mover el foco al
  mensaje de bienvenida.
- **FR-010**: El botón "Cerrar sesión" DEBE volver al formulario con los campos vacíos y sin
  mensajes ni datos del acceso anterior.
- **FR-011**: Ante credenciales incorrectas, el sistema DEBE mostrar un único mensaje genérico
  ("Correo o contraseña incorrectos") que no revele si el correo existe.
- **FR-012**: Las cuentas y credenciales de demostración NO DEBEN estar escritas en el código
  fuente ni en archivos versionados; DEBEN provenir de configuración externa no versionada
  (Constitución, regla 5.3). La pantalla NO DEBE mostrarlas.
- **FR-012a**: La guía de ejecución del proyecto (README) DEBE explicar cómo definir las cuentas
  de demostración en la configuración externa y dónde consultarlas para probar la demo, usando
  solo valores de ejemplo, nunca los reales (Constitución, regla 8.3).
- **FR-013**: El sistema NO DEBE mostrar ni registrar la contraseña en mensajes, registros de
  diagnóstico, URL ni almacenamiento del navegador, y NO DEBE registrar el correo completo
  (Constitución, regla 5.4).
- **FR-014**: El campo de contraseña DEBE ocultar los caracteres por defecto y ofrecer un control
  accesible para mostrarlos u ocultarlos.
- **FR-015**: El formulario DEBE poder enviarse con Enter y operarse completamente con teclado,
  con orden de foco lógico y foco visible.
- **FR-016**: La pantalla DEBE cumplir WCAG 2.1 nivel AA: etiquetas asociadas a cada campo,
  errores anunciados por tecnologías de asistencia, resultados anunciados automáticamente y
  contraste suficiente (Constitución, regla 8.4).
- **FR-017**: "¿Olvidaste tu contraseña?", "Google", "Apple" y "Regístrate" DEBEN mostrarse según
  el diseño y, al activarse, mostrar en la parte inferior un mensaje flotante "Función no
  disponible en esta demostración", anunciado automáticamente por tecnologías de asistencia, que
  desaparece a los 4 segundos sin bloquear el formulario. Solo puede haber un mensaje a la vez.
  El mensaje también desaparece si el usuario envía el formulario.
- **FR-018**: La casilla "Recordarme" DEBE mostrarse y cambiar de estado sin guardar datos.
- **FR-019**: La pantalla DEBE adaptarse a anchos desde 320 px hasta escritorio sin
  desplazamiento horizontal. En anchos menores de 768 px, el panel de marca DEBE reducirse a una
  franja superior naranja que muestra solo el logo, ocultando el titular, el texto de apoyo y la
  tarjeta ilustrativa; el formulario se muestra debajo, a ancho completo.
- **FR-020**: Los errores inesperados DEBEN mostrarse con un mensaje comprensible, sin revelar
  detalles técnicos (Constitución, regla 5.5).
- **FR-021**: El sistema DEBE emitir un registro estructurado en la consola del navegador por
  cada intento de inicio de sesión, con el resultado (éxito, credenciales incorrectas, error de
  validación o error inesperado), la fecha y hora, y el correo enmascarado: se conserva el primer
  carácter de la parte local y el dominio completo (por ejemplo, `s***@ejemplo.com`)
  (Constitución, reglas 5.5 y 8.7).

### Key Entities

- **Cuenta de demostración**: usuario habilitado para la demo. Atributos: correo electrónico
  (identificador único, sin distinguir mayúsculas), contraseña y nombre del titular que aparece en
  la bienvenida.
- **Intento de inicio de sesión**: correo y contraseña ingresados y su resultado (error de
  validación, credenciales incorrectas, acceso exitoso o error inesperado). No se guarda; solo
  deja un registro de diagnóstico según FR-021.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario con credenciales de demostración completa el inicio de sesión en menos
  de 30 segundos desde que ve la pantalla.
- **SC-002**: El resultado de un intento (bienvenida o error) aparece en 2 segundos o menos tras
  presionar "Iniciar sesión".
- **SC-003**: El 100 % de los escenarios de aceptación de las historias P1 y P2 está cubierto por
  pruebas automatizadas que pasan (Constitución, Principio I y regla 9.2).
- **SC-004**: El 90 % de los participantes de una prueba de usabilidad accede en el primer
  intento sin ayuda.
- **SC-005**: Una auditoría automatizada de accesibilidad no encuentra incumplimientos de WCAG
  2.1 AA, y la pantalla puede usarse solo con teclado.
- **SC-006**: La revisión visual frente a la imagen de referencia no encuentra diferencias en la
  estructura de paneles, los colores, el estilo de los componentes ni la jerarquía visual, y los
  textos coinciden con el contenido de login especificado.
- **SC-007**: El análisis de secretos no encuentra credenciales en el código versionado.

## Assumptions

- La demostración funciona solo en el navegador: no hay backend, base de datos, sesión
  persistente ni otras pantallas de la aplicación; la vista de bienvenida es el final del flujo.
- Existe al menos una cuenta de demostración (por ejemplo, la del titular que aparece en el
  diseño, "Steven Luna"), definida en configuración externa no versionada según FR-012 y
  FR-012a.
- La regla de 8 a 128 caracteres solo valida el formato; la demo no exige reglas adicionales de
  complejidad de contraseña.
- Quedan fuera del alcance: bloqueo por intentos fallidos, recuperación de contraseña, registro,
  acceso con Google o Apple y persistencia de "Recordarme". Esos elementos se muestran solo por
  fidelidad al diseño.
- La interfaz está en español.
- No existen BRD ni ARD para esta funcionalidad; si se incorporan, esta especificación DEBE
  alinearse con ellos (Constitución, Principio VI).
- La imagen de referencia es de escritorio; la versión móvil se deriva de ese mismo diseño según
  FR-019. El corte en 768 px es un valor estándar de tableta elegido como supuesto.
- El archivo de Figma no es accesible con la cuenta usada. Por decisión de quien solicita la
  feature, la referencia visual es `modelobilletera.png` (copiada de
  `C:\Temp\modelobilletera.png` al repositorio para mantener la trazabilidad, Constitución regla
  9.2). Esa imagen corresponde a la pantalla "Registro" y solo aporta el estilo; los textos
  específicos del login se heredan de la especificación `001-login-billetera`, ya reemplazada.
