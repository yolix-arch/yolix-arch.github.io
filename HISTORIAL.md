# HISTORIAL DE AVANCES DEL PROYECTO

Bitácora cronológica de todas las tareas, decisiones técnicas, configuraciones y comandos implementados.

---

### [2026-10-15] - Configuración Inicial del Entorno y Navegador Automatizado

- **Definición de Arquitectura**:
  - Se acordó utilizar un navegador automatizado basado en Chromium/Playwright con perfil persistente (`./perfil_navegador`) para almacenar cookies, cuentas (Google Drive, Gmail) y contraseñas.
  - Se estableció el sistema de **Acciones Rápidas** (`acciones.js`) para interactuar con la web de forma directa sin sobrecargar el contexto con lecturas completas de HTML (ahorro de tokens).
  - Se definió el uso de subagentes para tareas delegables.

- **Archivos y Módulos Creados**:
  - `REGLAS.md`: Normas obligatorias sobre permisos, uso de subagentes, persistencia de perfil y ahorro de tokens.
  - `HISTORIAL.md`: Registro de tareas y evolución del proyecto.
  - `inicio.html`: Interfaz inicial local que se carga al arrancar el navegador, con accesos directos a Google Drive, Gmail, Traductor y el índice de comandos.
  - `browser-daemon.js`: Proceso que mantiene la ventana del navegador visible en pantalla y expone el puerto CDP 9333.
  - `browser-service.js`: Módulo Node.js que gestiona la conexión con Google Chrome mediante Chrome DevTools Protocol (puerto 9333) y el directorio de perfil `./perfil_navegador`.
  - `acciones.js`: CLI indexado para interactuar con la web (drive, correo, traducir, buscar-imagen, ir, captura, clic, escribir, pestañas).
  - `abrir-navegador.bat`: Acceso directo por doble clic o CMD para iniciar el navegador.
  - `abrir-navegador.ps1`: Script PowerShell para arrancar el entorno rápidamente.
  - `INDICE_ACCIONES.md`: Manual de comandos rápidos sin sobrecarga de tokens.
  - `package.json`: Configurado con dependencias (`playwright-core`) y scripts `npm start`, `npm run browser`, `npm run drive`, etc.

- **Comandos de Arranque Listos**:
  - PowerShell: `.\abrir-navegador.ps1` o `npm start`
  - CMD / Doble clic: `abrir-navegador.bat`
  - Acciones rápidas: `node acciones.js <comando>`

- **Optimización de Ventanas (Sin pestañas duplicadas)**:
  - Se configuró detección de instancia activa en `browser-daemon.js` y `acciones.js`. Si el navegador ya está abierto, no abre una nueva pestaña ni ventana (tipo `Ctrl + T`); en su lugar, enfoca la ventana existente y reutiliza la misma pestaña activa.

---

### [2026-10-15] - Auditoría y Validación Completa del Sistema E-Commerce (Prompt Maestro)

- **Módulo de Gestión de Categorías**:
  - Validado en `admin.html`: Pestaña `🏷️ Categorías` con contador dinámico `countPestanaCat`.
  - Botón duplicado `+ Nuevo Producto` removido de la barra superior de pestañas (conservado sobre la tabla de productos).
  - Tabla de categorías con columnas ID (`CAT-XX`), Categoría, Subcarpeta Drive con authuser, Descripción, contador de productos asociados y botón de acción Quitar.
  - Protección de `CAT-00 Activos Web` contra eliminación.
  - Validaciones en `Codigo.gs`: `crearCategoriaAdmin` (crea subcarpeta pública en Drive, registra en Sheets 'Categorias', refresca validación desplegable en 'Productos') y `eliminarCategoriaAdmin` (bloquea si tiene productos asignados).
  - Subida de fotos (`subirFotoProductoDrive`): Mapeo dinámico leyendo la subcarpeta en la hoja 'Categorias'.

- **Tienda de Clientes Dinámica (`web/index.html`)**:
  - Pestañas de categorías generadas dinámicamente mediante `renderizarBarraCategorias` a partir de `obtenerCatalogo` / Google Sheets.
  - Asignación automática de iconos FontAwesome según palabras clave (`fa-shoe-prints`, `fa-dumbbell`, `fa-person-dress`, `fa-baby`, `fa-car`, etc.).

- **Seguridad y Reglas Estrictas**:
  - Sin contraseñas visibles por defecto ni textos sensibles en pantalla de login.
  - Sin enlaces al manual en pantallas públicas.
  - Arquitectura híbrida (`google.script.run` nativo cuando corre en Apps Script, `fetch` REST cuando corre desacoplado).

- **Integración con Google Sites**:
  - Código iframe de incrustación de alto completo y configuración de permisos sandbox/popups generado y documentado.

---

### [2026-10-15] - Inicio de la Matriz de Pruebas Exhaustivas y Asignación a Subagente

- **Documentos Creados**:
  - `PLAN_DE_PRUEBAS.md`: Matriz de 26 pruebas cubriendo Backend, Panel Admin, Catálogo de Clientes y Manejo de Errores.
  - `FALLAS_ENCONTRADAS.md`: Bitácora de seguimiento de errores e inconsistencias detectadas.

- **Subagente Invocado**:
  - Subagente de QA (`245b8c6c-a766-4211-adab-f30a62bdb782`) ejecutó de forma autónoma la **FASE 1: Backend y Google Sheets** (Pruebas P-01 a P-13).

- **Resultados de la FASE 1 (13/13 Exitosas - 100%)**:
  - `P-01` (1726 ms): Clave `admin2026` autorizada correctamente (`autorizada: true`).
  - `P-02` (973 ms): Clave falsa rechazada de inmediato (`autorizada: false`).
  - `P-03` (3167 ms): `obtenerDatosAdmin` retornó con éxito productos (9), categorías (15), pedidos y clientes.
  - `P-04` (3914 ms): Categoría `Categoría Test Alpha` creada con ID `CAT-09` y carpeta pública en Google Drive (`9. Categoría Test Alpha`, ID `1rLGokVjMFcLnOOPDSDKBJnIdX_QdFgnk`).
  - `P-05` (2094 ms): Producto `Producto Test Beta` creado con ID `P10` asignado a la categoría `Categoría Test Alpha`.
  - `P-06` (1686 ms): Precio modificado instantáneamente a `$24.50` mediante `actualizarRapidoAdmin`.
  - `P-07` (2781 ms): Cliente de prueba `V-99999999` registrado en la hoja `Clientes`.
  - `P-08` (1819 ms): Pedido `PED-261015192338` registrado en la hoja `Pedidos` e incremento de pedidos del cliente.
  - `P-09` (2343 ms): Estado del pedido cambiado a `Entregado` con `actualizarEstadoPedidoAdmin`.
  - `P-10` (2036 ms): Intento de eliminar `Categoría Test Alpha` bloqueado correctamente por tener `Producto Test Beta` asignado.
  - `P-11` (1914 ms): `Producto Test Beta` (`P10`) eliminado correctamente.
  - `P-12` (2540 ms): Categoría vacía `Categoría Test Alpha` eliminada con éxito de `Categorias`.
  - `P-13` (805 ms): Protección de `CAT-00` (`Activos Web`) validada; eliminación rechazada por seguridad.
  - **Fallas encontradas**: 0. Tiempo total de red: ~27.8s. Registro guardado en `resultado_fase1.json`.

---

### [2026-10-15] - Ejecución de la FASE 2: Panel Administrador (Pruebas P-14 a P-21)

- **Módulo de Pruebas Automatizadas de Interfaz**:
  - Se implementó el script `test_fase2.js` utilizando `playwright-core` apuntando a Google Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`) y `file:///J:/texto/web/admin.html`.
  - Se capturaron 11 evidencias fotográficas en la carpeta `./capturas/`.

- **Resultados de la FASE 2 (8/8 Exitosas - 100%)**:
  - `P-14` (7379 ms): Login exitoso con clave `admin2026`. `#pantallaLogin` se ocultó con clase `hidden`, `#panelPrincipal` se hizo visible y se cargaron todas las métricas dinámicas (9 productos, $24.50 en ventas, 1 pedido, 1 cliente, 15 categorías).
  - `P-15` (444 ms): Pestañas de navegación probadas secuencialmente (`#tabBtnProductos`, `#tabBtnCategorias`, `#tabBtnPedidos`, `#tabBtnClientes`). Se validó el aislamiento de visibilidad de cada sección y el contador numérico de categorías (`countPestanaCat = 15`).
  - `P-16` (571 ms): Botón `+ Nuevo Producto` (`#btnNuevoProducto`) abrió el formulario `#modalProducto` / `#seccionFormularioProducto` con título "Agregar Nuevo Producto". El botón `#btnCerrarModalProducto` cerró la vista y restauró `#seccionProductos`.
  - `P-17` (380 ms): Botón `+ Nueva Categoría` (`#btnNuevaCategoria`) en la pestaña de Categorías abrió `#modalNuevaCategoria` verificando los inputs de nombre y descripción. Se cerró limpiamente con `cerrarModalNuevaCategoria()`.
  - `P-18` (2187 ms): Botón `Actualizar` (`#btnActualizar`) refrescó las métricas y tablas desde la API sin recargar la página web completa y con 0 errores en la consola de JavaScript.
  - `P-19` (61 ms): Enlace `#linkGoogleSheets` validado con atributo `target="_blank"` y URL oficial con parámetro `authuser=amazoncorreohumberto@gmail.com`.
  - `P-20` (229 ms): Botón `Cambiar Clave` (`#btnCambiarClave`) abrió `#modalCambiarClave` comprobando los tres campos de entrada de contraseña y cerrándose adecuadamente.
  - `P-21` (156 ms): Botón `Cerrar Sesión` (`#btnCerrarSesion`) disparó diálogo nativo de confirmación, eliminó la clave de `sessionStorage`, restauró `#pantallaLogin` y ocultó `#panelPrincipal`.

- **Mejoras Aplicadas en `J:\texto\web\admin.html`**:
  - Identificadores añadidos para selectores estándar: `btnNuevoProducto`, `btnCerrarModalProducto`, `btnNuevaCategoria`, `btnActualizar`, `btnCambiarClave`, `btnCerrarSesion` y compatibilidad con `modalProducto`.
  - Confirmación de seguridad implementada en `cerrarSesionAdmin()`.
  - Archivo de resultados guardado en `resultado_fase2.json`.

---

### [2026-10-15] - Ejecución de la FASE 3: Catálogo Público de Clientes (Pruebas P-22 a P-26)

- **Módulo de Pruebas Automatizadas de Catálogo**:
  - Se implementó el script `test_fase3.js` con `playwright-core` conectando a Google Chrome y navegando a `file:///J:/texto/web/index.html`.
  - Se registraron 9 capturas fotográficas en la carpeta `./capturas/`.

- **Resultados de la FASE 3 (5/5 Exitosas - 100%)**:
  - `P-22` (4233 ms): Carga inicial del catálogo. `#cargando` se ocultó con clase `hidden`, `#gridProductos` renderizó 9 productos activos y `#contenedorCategorias` generó dinámicamente 15 píldoras con sus iconos correspondientes.
  - `P-23` (1191 ms): Filtro de píldoras de categorías probado con "Zapatos" (2 productos resultantes: *Zapatos Deportivos Running Pro* y *Sandalias Casuales de Verano*). Al pulsar en "Todos", el catálogo restauró los 9 productos íntegros.
  - `P-24` (914 ms): Buscador en tiempo real probado con término "zapatos". El grid filtró inmediatamente las 2 coincidencias y visibilizó `#btnLimpiarBusqueda`. Al pulsar el botón de limpieza, el input se vació y el grid volvió a mostrar los 9 productos.
  - `P-25` (627 ms): Modal de detalle de producto (`#modalProducto`) probado sobre la primera tarjeta. Se validaron título, precio ($38.00), stock ("25 disponibles"), categoría, foto principal, 5 estrellas interactivas y botón WhatsApp. El modal se cerró limpiamente con `#btnCerrarModalProducto`.
  - `P-26` (2342 ms): Flujo completo de pedido por WhatsApp. Se abrieron `#modalProducto` y `#modalPedido`, se completaron los datos del cliente ficticio (*Comprador Test QA, 04121234567, V-88888888, Calle Prueba 123*), se envió el pedido registrándose en Google Sheets con código `PED-261015193957` y se interceptó la URL generada `https://wa.me/?text=...` validando que contiene todos los datos estructurados del cliente y producto.

- **Mejoras y Correcciones Aplicadas en `J:\texto\web\index.html`**:
  - Se corrigió el bug de filtrado en `filtrarProductos()`, habilitando la coincidencia dinámica con todas las categorías de Google Sheets y resolviendo la errata `niññ`.
  - Se añadieron selectores estándar: `inputBuscador`, `gridProductos`, `btnComprarWA`, `btnCerrarModalProducto`, `btnCerrarModalPedido`, `.producto-card` y `.btn-ver-detalle` manteniendo retrocompatibilidad total con los selectores previos.
  - Archivo de resultados guardado en `resultado_fase3.json`.

---

### [2026-10-15] - Depuración de Estructura de Categorías en Google Sheets (Paso 1 Completado)

- **Limpieza de Categorías Duplicadas**:
  - Se ejecutó script `limpiar_duplicadas.js` eliminando 6 filas legacy que duplicaban nombres y causaban píldoras repetidas en la tienda:
    * `1. Zapatos y Calzado` -> Eliminada
    * `2. Ropa y Moda` -> Eliminada
    * `3. Deportes y Fitness` -> Eliminada
    * `4. Niños y Bebes` -> Eliminada
    * `5. Vehículos y Carros` -> Eliminada
    * `6. Accesorios y Tienda General` -> Eliminada
- **Estado Actual de Categorías Activas**:
  - Exactamente 8 categorías oficiales limpias y estructuradas con sus carpetas de Google Drive vinculadas:
    1. `CAT-01`: Zapatos
    2. `CAT-02`: Deportes
    3. `CAT-03`: Ropa Mujer
    4. `CAT-04`: Ropa Hombre
    5. `CAT-05`: Ropa Niños
    6. `CAT-06`: Bebés
    7. `CAT-07`: Carros
    8. `CAT-08`: Accesorios
  - Más la carpeta del sistema `CAT-00`: Activos Web y Marca.
- **Evidencia Visual**:
  - Navegador actualizado con vista limpia guardada en `capturas/categorias_limpias_tienda.png`.

---

### [2026-10-15] - Reestructuración y Ordenamiento Total del Catálogo (Plan Ejecutado al 100%)

- **Fase 1: Creación de Categoría `Juguetes`**:
  - ID asignado: `CAT-09`.
  - Subcarpeta en Google Drive creada: `9. Juguetes` (ID `1EJJ1N50Oda1pRNuew_vs3CxsDM9Figdy`) con permisos públicos.
  - Registrada en la hoja `Categorias` de Google Sheets y validación desplegable actualizada.

- **Fase 2: Reclasificación del Carro a Control Remoto (`P06`)**:
  - Producto `P06` (*Carro Control Remoto 4x4 Todo Terreno*, $35) reasignado de `Ropa Niños` a su categoría natural `Juguetes`.

- **Fase 3: Asignación de Productos Coherentes a Secciones Vacías**:
  - `P10` (*Conjunto Deportivo Infantil Franela + Short*, $18.00, Stock: 20) asignado a `Ropa Niños`.
  - `P11` (*Set de Mamelucos de Algodón para Bebé Pack x3*, $16.50, Stock: 25) asignado a `Bebés` con foto local `bebe_producto_1.jpg` subida con éxito a Google Drive (`https://lh3.googleusercontent.com/d/1H8Ony2eX9ootUSnlu9QJwKGNy0A8ZvNm`).
  - `P12` (*Lentes de Sol Polarizados Clásicos UV400*, $14.00, Stock: 30) asignado a `Accesorios`.

- **Fase 4: Auditoría Visual y Pruebas en Vivo**:
  - Total de categorías activas: **9 categorías oficiales**.
  - Total de productos activos: **12 productos**, todos con stock, fotos y categorías 100% coherentes.
  - Icono `fa-gamepad` configurado para la píldora `Juguetes` en `web/index.html` e `Index.html`.
  - Navegación y filtrado probados en vivo en Chrome; capturas guardadas en `./capturas/`:
    * `catalogo_9_categorias_reorganizado.png`
    * `categoria_juguetes_filtrada.png`
    * `categoria_bebes_filtrada.png`
    * `categoria_ropa_ninos_filtrada.png`
    * `categoria_accesorios_filtrada.png`

---

### [2026-10-15] - Despliegue de Tienda Limpia en Netlify Drop (Sin Barra Gris)

- **Fase 1: Preparación**:
  - Archivo `tienda_web.zip` empaquetado con `index.html` (WhatsApp `584120666322`), `api.js` y `_redirects`.
- **Fase 2: Despliegue Automatizado**:
  - Subida directa realizada mediante script automatizado sobre Netlify Drop en Chrome.
  - Sitio generado por Netlify con ID `aesthetic-wisp-c2488a`.
  - Captura de confirmación guardada en `capturas/netlify_drop_resultado.png`.
  - Desbloqueo de vista previa validado con clave `My-Drop-Site` (`capturas/tienda_desbloqueada_test.png`).

---

### [2026-10-15] - Implementación de Marca Dinámica, Chat Web Interno y Bandeja de Entrada ERP

- **Personalización de Marca y Cabecera Dinámica (`web/index.html` y `web/admin.html`)**:
  - Cabecera pública con soporte para Logo en imagen (`#headerLogoImg`), icono fallback (`#headerLogoIcon`), Nombre de la Tienda (`#headerTituloTienda`) y Eslogan (`#headerSloganTienda`).
  - Pestaña `🎨 Marca & Tienda` en el Panel Administrador con formulario editable para Nombre, Eslogan, Logo URL, WhatsApp (`584120666322`) y Selector de Tipografía (Inter, Poppins, Playfair, Montserrat, Oswald).
  - Guardado persistente inmediato en `localStorage` y backend.

- **Sistema de Chat Web Flotante (Soporte Directo sin requerir WhatsApp)**:
  - Botón flotante `💬` con indicador de respuestas no leídas en la esquina inferior derecha del catálogo.
  - Ventana emergente en modo oscuro con historial de conversación, reconocimiento automático del cliente y renderizado optimista instantáneo de mensajes.
  - Captura de validación generada en `capturas/test_chat_cliente.png`.

- **Bandeja de Entrada de Mensajería para el Administrador (`admin.html`)**:
  - Nueva pestaña principal `💬 Mensajes Web` con contador de mensajes no leídos.
  - Panel dividido estilo mensajería/correo: Lista de clientes a la izquierda con buscador en tiempo real, e historial completo de conversación a la derecha con caja de respuesta y botón directo de WhatsApp.
  - Capturas guardadas en `capturas/test_admin_inbox.png` y `capturas/test_admin_marca.png`.

- **Alertas Semafóricas de Inventario y Stock**:
  - Colores y badges en la tabla de productos del administrador: `En Stock` (verde), `¡Bajo!` (amarillo, stock <= 3) y `Agotado` (rojo, stock = 0).

- **Auditoría Automatizada QA**:
  - Creado script `test_evolucion.js`. Ejecutado con 100% de éxito en todas las pruebas (Cabecera dinámica, Chat Web, Panel Marca, Bandeja Inbox y Stock).
  - Archivos sincronizados en `J:\texto\web\`, `J:\texto\` y `c:\Users\x\Desktop\WebViewTienda\tienda_web.zip`.

---

### [2026-10-15] - Implementación de Motion Graphics & Micro-interacciones

- **Efectos de Motion Graphics y Estética Visual Moderna**:
  - **Orbes de Luz Ambiental Flotantes (Ambient Glow)**: Fondos dinámicos en modo oscuro con gradientes desvanecidos en movimiento lento (`@keyframes floatGlow`) sin afectar rendimiento ni eventos de clic.
  - **Cascada Animada de Productos (Staggered Entrance)**: Las tarjetas de productos entran con un efecto escalonado suave (`cardFadeUp` con curva `cubic-bezier(0.16, 1, 0.3, 1)` y retardo de 45ms por tarjeta).
  - **Física de Elevación y Zoom en Hover**: Al pasar el cursor sobre cualquier producto, la tarjeta se eleva suavemente (-8px), la foto hace zoom orgánico (`scale(1.05)`) y se activa una sombra de resplandor ambiental índigo.
  - **Micro-banner Animado de Beneficios**: Barra superior con radar ping verde intermitente indicando "Catálogo en Vivo" y propuesta de valor (despacho rápido, pedidos directos por WhatsApp, chat en web).
  - **Animación de Celebración con Confeti**: Integrada librería ultra-ligera `canvas-confetti` que dispara una lluvia de confeti al confirmar cualquier compra antes de abrir WhatsApp.
  - **Botón de Chat Flotante con Motion Pulse**: Aura de respiración pulsante (`motion-pulse-glow`) y radar ping exterior para llamar la atención del cliente de manera elegante.
  - **Panel Administrador**: Tarjetas de métricas con elevación y resplandor por color al hacer hover, y badge "En Vivo" con pulso animado.

---

### [2026-10-16] - Moderación de Clientes, Vigencia de 1 Semana y Borrado en Cascada (QA 100% Exitoso)

- **Persistencia Temporal y Expiración en Cliente (`web/index.html`)**:
  - Almacenamiento local con clave `expiraEn: Date.now() + 7*24*60*60*1000` (7 días / 1 semana).
  - Comprobación automática en `cargarClienteLocal()`: si han transcurrido más de 7 días, se purga `cliente_catalogo` de `localStorage` y se restablece la interfaz a modo invitado.
  - Indicador visual dinámico en botón de cabecera: muestra el nombre del cliente acompañado del badge de estado `(⏳)` si está pendiente o `(✅)` si está confirmado.
  - Mensaje explicativo y aviso en `modalRegistro` informando que los datos quedan registrados por 1 semana y en estado "Pendiente" de validación administrativa.

- **Panel de Moderación y Alertas para el Administrador (`web/admin.html`)**:
  - Banner de alerta animado destacado en la pestaña de Clientes: `🔔 ¡Atención Administrador! Hay X cliente(s) esperando revisión y confirmación en el sistema` con botón directo `Ver Pendientes`.
  - Píldora de alerta pulsante en la barra superior de navegación: `#badgeClientesPendientesNav`.
  - Filtros dinámicos en la tabla de clientes: `Todos (N)`, `⏳ Pendientes (P)` y `✅ Confirmados (C)`.
  - Acciones por cliente:
    * Botón `✅ Confirmar`: Aprueba y cambia el estado del cliente a `Confirmado` en la base de datos y memoria.
    * Botón `🗑️ Borrar`: Modal de confirmación explícito advirtiendo que la eliminación es irreversible y purgará en cascada todos los comentarios y rastros del cliente.

- **Backend y Borrado en Cascada (`Codigo.gs` y `api.js`)**:
  - Pestaña `Clientes`: Columna de `Estado` por defecto en `'Pendiente'`.
  - Función `confirmarClienteAdmin(clave, idCliente)`: Actualiza el estado a `'Confirmado'`.
  - Función `eliminarClienteCascadaAdmin(clave, idCliente, cedula)`:
    * Elimina la fila del cliente en `Clientes`.
    * Recorre la pestaña `Comentarios` en sentido inverso y elimina **todas las filas** donde la cédula o nombre coincidan con el cliente eliminado.
    * Reporta al administrador el número exacto de comentarios purgados.
  - Endpoints integrados tanto en `doPost` como en `doGet`.

- **Resultados de Pruebas Automatizadas QA (`test_moderacion_clientes.js`)**:
  - **7/7 pruebas superadas con éxito (100% pass rate)**:
    * `P-MOD-01`: Registro con vigencia de 7 días y estado `Pendiente` (EXITOSA).
    * `P-MOD-01B`: Indicador visual de estado Pendiente `(⏳)` en cabecera (EXITOSA).
    * `P-MOD-02`: Permitir comentar e interactuar al cliente registrado (EXITOSA).
    * `P-MOD-03`: Detección y alerta visual de registros pendientes en panel admin (EXITOSA).
    * `P-MOD-04`: Confirmación y aprobación del cliente por el administrador (EXITOSA).
    * `P-MOD-05`: Eliminación quirúrgica en cascada (Cliente + Comentarios purgados) (EXITOSA).
    * `P-MOD-06`: Limpieza automática del registro local al expirar la semana (EXITOSA).
  - Capturas de validación generadas en `./capturas/`:
    * `test_cliente_pendiente_header.png`
    * `test_admin_alerta_pendientes.png`
    * `test_admin_cliente_confirmado.png`
    * `test_admin_borrado_cascada.png`
    * `test_expiracion_7_dias.png`

---

### [2026-10-16] - Despliegue en Vivo en Netlify, Verificación Full-Stack y Código QR

- **Despliegue Automatizado a Netlify**:
  - Script `ejecutar_drop.js` ejecutado con éxito en el navegador visible.
  - Subida directa del paquete `tienda_web.zip` (`index.html`, `admin.html`, `api.js`, `manual.html`, `_redirects`).
  - Sitio generado en vivo: `https://beautiful-pothos-323fdc.netlify.app/` (ID: `beautiful-pothos-323fdc`).
- **Verificación y Pruebas en Vivo (`verificar_tienda_en_vivo.js`)**:
  - Catálogo desacoplado cargado al 100% sin barra gris de Google.
  - Conexión a Google Sheets exitosa: **12 productos renderizados** y **9 categorías oficiales** activas con iconos FontAwesome.
  - Captura de evidencia guardada en `capturas/tienda_desplegada_en_vivo.png`.
- **Generación de Código QR**:
  - Código QR generado en resolución 600x600 con enlace oficial directo a la tienda.
  - Guardado en `capturas/codigo_qr_tienda.png` listo para impresión o distribución digital.

---

### [2026-10-16] - Solución de Alojamiento Permanente en GitHub Pages y Código QR de Alta Resolución

- **Incidencia Detectada (Netlify Drop)**:
  - El despliegue temporal en Netlify Drop (`beautiful-pothos-323fdc`) expiró con mensaje de error "This project has expired" al transcurrir la ventana de gracia de 1 hora para sitios no reclamados, solicitando además contraseña de vista previa.
- **Implementación de Alojamiento Definitivo y Permanente**:
  - Despliegue estático automatizado en **GitHub Pages** (repositorio público `correo8484-arch/tienda-virtual`).
  - Plataforma permanente, gratuita de por vida, con CDN global ultrarrápido y HTTPS forzado automático con certificado SSL de alta confiabilidad.
  - Cero expiraciones temporales, cero bloqueos y sin solicitud de contraseñas de vista previa.
  - Configurada ruta de fallback SPA `404.html` para compatibilidad total con navegación cliente.
  - **URL Definitiva de la Tienda**: `https://correo8484-arch.github.io/tienda-virtual/`
  - **URL del Panel Administrador**: `https://correo8484-arch.github.io/tienda-virtual/admin.html`
- **Auditoría Automatizada QA (`test_verificar_tienda_permanente.js`)**:
  - Verificación HTTP directa: **HTTP 200 OK**.
  - Verificación con Playwright CDP: **HTTP 200**.
  - Conexión a Google Sheets exitosa: **12 productos reales cargados y renderizados** en la cuadrícula.
  - Detección de barra superior Google Apps Script: **NO EXISTE (Limpio 100%)**.
  - Filtros por categoría: **10 pestañas activas** (Todos + 9 categorías oficiales).
  - Captura de evidencia guardada en `capturas/tienda_permanente_en_vivo.png`.
  - Reporte consolidado generado en `resultado_verificacion_permanente.json`.
- **Código QR Definitivo en Alta Resolución**:
  - Generado código QR en ultra alta resolución (1000x1000 px) apuntando a la URL definitiva `https://correo8484-arch.github.io/tienda-virtual/`.
  - Guardado en `capturas/codigo_qr_tienda_permanente.png` listo para impresión comercial, banners o tarjetas.

---

### [2026-10-16] - Despliegue Automatizado de Google Apps Script (Versión 18 en Vivo)

- **Actualización Total del Backend en la Nube**:
  - Script automatizado `ejecutar_despliegue_total.js` ejecutado con éxito conectando con el perfil autorizado del usuario (`amazoncorreohumberto@gmail.com`).
  - Inyectado el código completo de `J:\texto\Codigo.gs` (1.524 líneas, 54.157 caracteres) en el editor de Apps Script (`file:///editor-1/file_1.js`).
  - Guardado persistente en Google Drive mediante `Ctrl + S`.
  - Desplegada la **Versión 18** oficial en la implementación activa (`AKfycbyDNwrX4Q4yZ1IQAL_xN1m4l-sauRXpe-cqpZAChMMb89S9NuGAJpg_EgXsi0i3w2meug`).
- **Verificación en Vivo de Endpoints de Moderación**:
  - `confirmarClienteAdmin`: Reconocido y activo al 100%. Valida clave de administrador y procesa aprobación de clientes en Google Sheets.
  - `eliminarClienteCascadaAdmin`: Reconocido y activo al 100%. Valida permisos y ejecuta la purga en cascada en las pestañas `Clientes` y `Comentarios`.
  - Evidencia visual capturada en `capturas/step8_despliegue_confirmado.png`.
- **Ecosistema Completo Sincronizado**:
  - Catálogo online en GitHub Pages, Panel Administrador, Manual de Usuario, Google Sheets ERP, Google Drive de imágenes y Backend Apps Script operando en sincronía perfecta al 100%.

---

### [2026-10-16] - Cambio de Nombre de Marca y Repositorio Oficial a "Yolix"

- **Renombramiento de Repositorio GitHub**:
  - Repositorio migrado de `correo8484-arch/tienda-virtual` a **`correo8484-arch/yolix`** mediante GitHub CLI.
  - Nueva URL permanente y definitiva de la tienda: **`https://correo8484-arch.github.io/yolix/`**.
  - Nueva URL del Panel Administrador: **`https://correo8484-arch.github.io/yolix/admin.html`**.
  - Nueva URL del Manual: **`https://correo8484-arch.github.io/yolix/manual.html`**.
- **Actualización de Branding e Interfaz Web**:
  - Nombre oficial en cabecera actualizado a **`Yolix`** con tipografía moderna y efecto gradiente.
  - Configuración por defecto de marca adaptada a `Yolix` en `index.html` y `admin.html`.
  - Títulos de página actualizados: `Yolix - Catálogo Online` y `Panel de Administración - Yolix`.
- **Nuevo Código QR en Alta Definición**:
  - Generado código QR oficial (1000x1000 px) vinculado directamente a `https://correo8484-arch.github.io/yolix/`.
  - Guardado en `capturas/codigo_qr_yolix.png` y `capturas/codigo_qr_tienda_permanente.png`.
- **Auditoría en Vivo**:
  - HTTP 200 OK verificado en la nueva URL.
  - Renderizado completo confirmado con los 12 productos reales de Google Sheets y 10 filtros de categorías.
  - Captura de evidencia guardada en `capturas/yolix_en_vivo.png`.
---

### [2026-10-16] - Despliegue Definitivo y Exitoso en la Raíz Limpia: https://yolix-arch.github.io/

- **Objetivo Cumplido al 100%**:
  - Tienda virtual **Yolix** desplegada de manera impecable en la raíz personalizada exacta: **`https://yolix-arch.github.io/`** (sin subcarpetas, sin barras de advertencia y con conexión en vivo a Google Sheets).
  - Panel administrativo funcional en: **`https://yolix-arch.github.io/admin.html`** (protegido con clave `admin2026`).

- **Acciones y Automatizaciones Realizadas**:
  - Identificación y conexión con la sesión activa del usuario.
  - Renombramiento de la cuenta de usuario de GitHub a **`yolix-arch`** (ID: 284934360).
  - Creación del repositorio público raíz: `yolix-arch/yolix-arch.github.io`.
  - Generación de Personal Access Token (`ghp_...`) y sincronización remota con rama `main`.
  - Configuración y activación inmediata de GitHub Pages en raíz `/` con HTTPS forzado.
  - Verificación en vivo: Respuesta HTTP 200 OK con carga completa de 12 productos e inventario desde Google Apps Script Versión 18.
  - Acceso directo actualizado en el Escritorio: `C:\Users\x\Desktop\TIENDA_YOLIX.url`.
  - Código QR de alta resolución (1000x1000) generado y guardado en `C:\Users\x\Desktop\CODIGO_QR_YOLIX.png`.
  - Ventana de `Navegador_WebView2` actualizada con la tienda en vivo.
---

### [2026-10-16] - Refactorización de UI, Chat Multiusuario en Sheets, Edición Avanzada y Seguridad

- **Cabecera Compacta y Navegación Adaptable**:
  - Rediseño integral de la cabecera superior en `index.html` y `404.html` (commit `bfe1e84`): unificación en una sola línea horizontal (`max-w-7xl`, `py-2.5`) integrando el logotipo, nombre de la marca `Yolix`, badge animado de estado en vivo (`En Vivo` pulsante en verde esmeralda), buscador central expandible (`flex-1 max-w-xl`, `#inputBuscador`), acceso directo al chat y botón de registro de clientes (`#txtBtnRegistro`). Reducción drástica del espacio vertical consumido y eliminación de barras redundantes.
  - Barra de categorías dinámica con `flex-wrap` (commit `67d136c`): reemplazo del contenedor con desbordamiento horizontal y scrollbar por una botonera adaptable (`flex flex-wrap items-center gap-2 py-2`, `#contenedorCategorias`). Todas las píldoras de categorías (`Todos`, `Zapatos`, `Deportes`, `Ropa Mujer`, `Ropa Hombre`, `Ropa Niños`, `Bebés`, `Carros`, `Accesorios`, `Juguetes`) se ajustan automáticamente a cualquier resolución móvil, tablet o monitor de escritorio sin truncamiento ni desplazamiento lateral incómodo.
  - Limpieza de interfaz en el Panel Administrador (`admin.html`, commits `a325f3b` y `6ea1e7a`): remoción de tarjetas métricas duplicadas en la zona superior y corrección de sintaxis de comillas en invocaciones inline de botones de acción en tablas.

- **Ventana Modal Dedicada para Edición de Productos y Moderación de Reseñas**:
  - Implementación de ventana modal flotante de alta resolución (`#modalEdicionProducto` en `admin.html`, commits `f8f0630` y `5619713`): interfaz completa de gestión avanzada por producto sin recargar la página.
  - Ajuste instantáneo de inventario y stock: controles interactivos de suma y resta rápida de existencias conectadas en vivo con el backend mediante `actualizarRapidoAdmin`.
  - Gestión fotográfica centralizada en Google Drive: previsualización en tiempo real de la imagen en uso y módulo de subida directa de nuevos archivos locales codificados en Base64 (`subirFotoProductoDrive`), ubicándolos automáticamente en la subcarpeta correspondiente de la categoría en Drive y actualizando la URL optimizada CDN (`lh3.googleusercontent.com/d/...`).
  - Moderación quirúrgica de comentarios: bandeja integrada por producto (`#listaComentariosProductoModal`) que lista valoraciones, estrellas interactivas, autor, fecha y contenido de opiniones, dotada de botón de borrado individual (`eliminarComentarioAdmin` en `Codigo.gs` y `eliminarComentarioAPI` en `api.js`) para depurar filas puntuales en Google Sheets sin afectar las demás evaluaciones del catálogo.
  - Acceso directo y contextual a la fila del producto en Google Sheets con autenticación multiusuario (`authuser=amazoncorreohumberto@gmail.com`).

- **Chat Multiusuario en Tiempo Real Sincronizado con Google Sheets (`Mensajes_Chat`)**:
  - Arquitectura backend en Google Apps Script (`J:\texto\Codigo.gs`, commit `a178489`):
    * Creación automatizada y formateo de la hoja de cálculo ERP **`Mensajes_Chat`** con encabezado estilizado en azul Messenger (`#0284c7`) y tipografía blanca: `ID_Mensaje`, `Fecha_Hora`, `ID_Cliente`, `Cedula_Cliente`, `Nombre_Cliente`, `Telefono`, `Remitente`, `Mensaje`, `Leido`.
    * Funciones de gestión en la nube: `obtenerSheetMensajesChat(ss)`, `enviarMensajeChatSheet(datos)`, `obtenerMensajesClienteSheet(clienteId)`, `obtenerTodosChatsAdminSheet(clave)`, `responderChatAdminSheet(clave, clienteId, mensajeAdmin)` y `marcarLeidoChatAdminSheet(clave, clienteId)`.
    * Generación de identificadores de mensaje de alta precisión (`MSG-yyyyMMddHHmmss-XXX`) con marcas de tiempo en formato `yyyy-MM-dd HH:mm:ss` (zona horaria GMT-4).
  - Bandeja ERP de Mensajería para el Administrador (`admin.html`):
    * Pestaña principal `💬 Mensajes Web` con interfaz dividida de dos paneles estilo mensajería/correo: panel izquierdo con listado de clientes ordenado cronológicamente, búsqueda en tiempo real (por nombre, cédula, teléfono o contenido) e insignias pulsantes de mensajes no leídos (`animate-pulse`); panel derecho con historial completo de conversación, diferenciación visual de burbujas (Admin en índigo vs. Cliente en pizarra), persistencia de scroll automático y caja de respuesta rápida con tecla `Enter`.
    * Botón directo con enlace dinámico hacia WhatsApp (`https://wa.me/58...`) formateando automáticamente el código internacional del cliente.
  - Experiencia de Chat en Tienda Pública (`index.html`, `404.html`):
    * Modal emergente (`#modalChatTienda`) con flujo de bienvenida automatizado, auto-reconocimiento para compradores previamente registrados y soporte para visitantes anónimos mediante ingreso rápido de nombre y teléfono/cédula.
    * Renderizado optimista instantáneo de mensajes enviados y sincronización periódica en segundo plano.

- **Reubicación Ergonómica del Botón de Chat Web (Eliminación de Elementos Flotantes Invasivos)**:
  - Supresión definitiva del botón flotante circular (`#btnChatFlotante`, commit `5d3167f`) que obstaculizaba la navegación en la esquina inferior derecha de la pantalla y colisionaba con otros elementos táctiles.
  - Reubicación contextual dual:
    * En el modal de producto (`#modalProducto`): botón dedicado `Chatear / Preguntar` (`#btnChatearDesdeProducto`, `abrirChatDesdeProducto()`) posicionado armónicamente junto al botón principal `Pedir por WhatsApp`, que pre-carga automáticamente una consulta personalizada con el nombre y precio del producto consultado.
    * En la barra de navegación superior: botón compacto de chat (`#abrirChatModal`) con contador badge dinámico de mensajes no leídos (`#badgeChatNav`).

- **Campo y Columna Obligatoria de Correo Electrónico en Clientes**:
  - Incorporación en la tienda pública (`index.html`, `404.html`, commit `57fbadd`): nuevo campo obligatorio de Correo Electrónico (`#regCorreoCliente`) en el formulario modal de registro de compradores.
  - Actualización estructural en backend (`Codigo.gs`): adición de la columna `Correo_Electronico` (Columna J / índice 9) con estilo esmeralda institucional (`#065f46`) en la hoja `Clientes` dentro de la función `registrarClienteEnSheet(datos)`.
  - Visualización en Panel Administrador (`admin.html`): actualización de la tabla de clientes con la columna combinada "Contacto / Correo", generando enlaces directos `mailto:` para comunicación directa por correo electrónico y acceso complementario a WhatsApp.

- **Trazabilidad en Opiniones: Columna `Nombre_Producto` en Google Sheets**:
  - Evolución del esquema de base de datos (`Codigo.gs`, commit `b893103`): creación de la función `actualizarEstructuraComentariosConNombre(ss)` que inserta la columna `Nombre_Producto` (columna B) en la hoja `Comentarios`.
  - Sincronización en `guardarComentarioEnSheet`: registro del nombre comercial exacto del producto junto con su ID (`P01`, `P02`, etc.), autor, texto, fecha, calificación (1-5 estrellas) y cédula del cliente.
  - Visualización en Panel Administrador (`admin.html`): visualización de insignias distintivas con icono de producto (`fa-solid fa-box`) en la lista de opiniones moderadas, facilitando la identificación inmediata del artículo reseñado.

- **Endurecimiento de Seguridad: Eliminación de Acceso Administrativo en Footer Público**:
  - Saneamiento de seguridad en `index.html` y `404.html` (commit `37f34f9`): erradicación del enlace visible "Acceso Administrativo" (`#linkFooterAdmin`) y del script anónimo que inyectaba la URL de administración en entornos Google.
  - Ocultamiento de la ruta `/admin.html` frente a clientes regulares, motores de búsqueda y rastreadores web, restringiendo el conocimiento de la consola administrativa únicamente a operadores autorizados.

---

### [2026-10-16] - Automatización de Carga de Productos y Preparación de Catálogo Extendido

- **Módulo de Carga Automática de Productos (`subir_producto.js` y `subir_producto.ps1`)**:
  - Desarrollo de herramienta de ingesta por línea de comandos (commits `a68e6ba` y scripts del entorno) diseñada para agilizar la publicación masiva o unitaria de artículos hacia el ecosistema en vivo.
  - Flujo end-to-end automatizado:
    * Entrada multimodal: admite rutas de imágenes locales (`.jpg`, `.png`, `.webp`) con conversión automática a Base64, o URLs remotas descargadas en memoria.
    * Despacho a Google Drive (`subirFotoDrive`): ubicación autónoma de la carpeta correspondiente a la categoría del producto (`1. Zapatos y Calzado`, `2. Deportes y Fitness`, `3. Ropa para Mujer`, `2. Ropa y Moda`, `4. Niños y Bebes`, `5. Carros y Repuestos`, `6. Accesorios Generales`, `9. Juguetes`) y generación del enlace público CDN sin barreras de autenticación (`https://lh3.googleusercontent.com/d/...`).
    * Registro en Google Sheets (`guardarProductoAdmin`): cálculo y asignación correlativa del próximo ID (`P13`, `P14`, etc.), almacenamiento de campos (nombre, categoría, precio, stock, descripción, género, estado) y actualización instantánea en la tienda sin requerir compilación ni redeploy.
  - Interfaz PowerShell (`subir_producto.ps1`) para ejecución nativa en terminales Windows con parámetros tipados (`-Imagen`, `-Nombre`, `-Categoria`, `-Precio`, `-Stock`).
  - Documentación técnica exhaustiva consolidada en `COMO_SUBIR_PRODUCTO.md`: parámetros obligatorios y opcionales, diagrama de arquitectura Mermaid, mapeo de carpetas en Google Drive y protocolos de invocación para agentes inteligentes.

- **Preparación y Catalogación de 25 Nuevos Productos (`./nuevos productos`)**:
  - Recopilación, normalización y optimización de 25 activos fotográficos en formato WebP ubicados en la carpeta local `c:\Users\x\Desktop\WebViewTienda\nuevos productos`, clasificados y listos con sus precios preliminares para la fase final de inyección masiva:
    1. `Alfombras Para Carro Universal Juego De 3 Piezas Negro (Variante 1)` - $20.00 (Categoría: Carros)
    2. `Alfombras Para Carro Universal Juego De 3 Piezas Negro (Variante 2)` - $20.00 (Categoría: Carros)
    3. `Bolso Cartera Bandolero Para Dama Cartera Set De 3 Piezas` - $21.00 (Categoría: Accesorios / Ropa Mujer)
    4. `Bolso Cartera Bandolero Cruzado Corazón Jinping Para Dama` - $13.00 (Categoría: Accesorios / Ropa Mujer)
    5. `Boxer Bañador Natacion Piscina Niños talla de 2 a 16` - $13.00 (Categoría: Ropa Niños / Deportes)
    6. `Conjuntos Ropa Interior Femenina Lencería Erotica (lingerie)` - $15.00 (Categoría: Ropa Mujer)
    7. `Forros De Asientos Universal Semicuero Con Cierres` - $39.00 (Categoría: Carros)
    8. `Franelas Unicolores En Algodón (Muestra 1)` - $9.00 (Categoría: Ropa Hombre / Ropa Mujer)
    9. `Franelas Unicolores En Algodón (Muestra 2)` - $9.00 (Categoría: Ropa Hombre / Ropa Mujer)
    10. `Franelas Unicolores En Algodón (Muestra 3)` - $9.00 (Categoría: Ropa Hombre / Ropa Mujer)
    11. `Licras Leggins Deportiva Para Mujer Run Gym Crossfit` - $16.00 (Categoría: Deportes / Ropa Mujer)
    12. `Medias Tobilleras Algodón Caballero Dama Niño Negro Estampado Variado` - $4.00 (Categoría: Accesorios / Ropa Hombre)
    13. `Shorts Deportivo Shein Con Efecto Push-up Levanta Cola` - $10.00 (Categoría: Deportes / Ropa Mujer)
    14. `Sostén Sin Varilla De Dama, Microfibra, Brasier Rojo Liso G, Gg` - $9.00 (Categoría: Ropa Mujer)
    15. `Sudadera Deportiva Manga Larga Masculina` - $17.00 (Categoría: Deportes / Ropa Hombre)
    16. `Sudadera Deportiva Tela Muselina Manga Larga Sublimable Blanco L (Muestra 1)` - $9.00 (Categoría: Deportes / Ropa Hombre)
    17. `Sudadera Deportiva Tela Muselina Manga Larga Sublimable Blanco L (Muestra 2)` - $9.00 (Categoría: Deportes / Ropa Hombre)
    18. `Sudadera Playera Para Caballero Manga Larga En Tela Lycra` - $15.00 (Categoría: Deportes / Ropa Hombre)
    19. `Sudadera Tiburones De La Guaira Full Color Talla S M L` - $17.00 (Categoría: Deportes / Ropa Hombre)
    20. `Sueteres Manga Larga Con Capucha Variedad De Colores` - $25.00 (Categoría: Ropa Hombre / Ropa Mujer)
    21. `Tres Unidad De Sostén Para Dama Copa B Marca Sensación` - $14.00 (Categoría: Ropa Mujer)
    22. `Vestidos De Dama, Vestidos Cortos, Casuales` - $14.00 (Categoría: Ropa Mujer)
    23. `Vestidos De Dama, Vestidos Cortos, Vestidos Largos Y Corto` - $14.00 (Categoría: Ropa Mujer)
    24. `Zapatos Amiri Dama Y Caballero Unisex Tallas 35 A La 43` - $38.00 (Categoría: Zapatos)
    25. `Zapatos Deportivos Oncloud De Alta Gama Unisex` - $35.00 (Categoría: Zapatos / Deportes)
  - Banco de catálogo preparado y verificado en almacenamiento local a la espera de la fase de sincronización programada hacia Google Drive y Google Sheets.

---

### [2026-10-17] - Gestión de Teléfonos WhatsApp (1 y 2) en Panel Administrador y Sincronización de Catálogo

- **Botón y Modal Dedicado de WhatsApp en Panel Administrador (`admin.html`)**:
  - Incorporación en la barra superior de acciones, inmediatamente al lado del botón `#btnCambiarClave`, del botón `#btnConfigurarWhatsApp` con icono oficial de WhatsApp y diseño ergonómico dark mode.
  - Creación del modal emergente `#modalConfigurarWhatsApp` (`abrirModalConfigurarWhatsApp`, `cerrarModalConfigurarWhatsApp`, `guardarTelefonosAdmin`) que permite configurar:
    * **Teléfono Principal WhatsApp (`inputTel1WA`)**: Línea obligatoria oficial para la recepción de pedidos directos y órdenes de compra automáticas (ej. `584120666322`).
    * **Teléfono Secundario / Soporte (`inputTel2WA`)**: Línea opcional para atención de dudas, soporte al cliente y respaldo alternativo.
    * Nota informativa clara explicando el impacto de estos números en los enlaces `wa.me` de todo el catálogo.
    * Botón de guardado con feedback interactivo (`Guardando...` con spinner) y confirmación flotante con `mostrarToastAdmin`.
    * Pre-carga automática de los números activos desde la respuesta administrativa del ERP y desde `localStorage`.

- **Backend y Persistencia en la Nube (`Codigo.gs` y `api.js`)**:
  - Implementación en `J:\texto\Codigo.gs` de las funciones de gestión y persistencia:
    * `obtenerTelefonosConfigurados()`: Lectura desde `PropertiesService` con fallback predeterminado (`584120666322`).
    * `guardarTelefonosAdmin(clave, tel1, tel2)`: Validación de autenticación de administrador, sanitización estricta de dígitos numéricos y persistencia en `PropertiesService`.
    * Exposición de endpoints `obtenerTelefonosWA` y `guardarTelefonosAdmin` en `doGet` y `doPost`.
    * Inclusión del objeto `telefonosWA` dentro de los resultados de `obtenerCatalogo` y `obtenerDatosAdmin`.
  - Integración en `tienda_gh_pages/api.js` de las funciones de comunicación:
    * `obtenerTelefonosWA()`: Obtención asíncrona con sincronización automática en `localStorage` (`tienda_telefonos_whatsapp_v1`).
    * `guardarTelefonosAdminAPI(claveAdmin, tel1, tel2)`: Despacho a la API con almacenamiento local inmediato y soporte de contingencia offline/optimista.

- **Sincronización en Tienda de Clientes (`index.html` y `404.html`)**:
  - Integración dinámica de los teléfonos en la lectura del catálogo (`cargarCatalogo`) y en la configuración de marca (`aplicarConfiguracionMarcaUI`).
  - Direccionamiento garantizado de la orden de compra (`#btnConfirmarPedido`) al teléfono principal activo vía `https://wa.me/`.
  - Habilitación del enlace de soporte directo a WhatsApp secundario (`#btnChatWASoporte` y `#linkSoporteSecundarioWA`) cuando se encuentra configurado un segundo número.
  - Preservación estricta de la proximidad física entre el botón de WhatsApp (`#btnComprarWA`) y el botón de Chat Web (`#btnChatearDesdeProducto`) en la ficha de detalle de producto.
  - Sincronización idéntica byte-por-byte entre `index.html` y `404.html` para la arquitectura GitHub Pages SPA.

- **Despliegue y Publicación en Vivo**:
  - Commit y push exitoso a la rama `main` del repositorio `yolix-arch/yolix-arch.github.io` utilizando el token de despliegue de `yolix_token.txt`.
  - Disponibilidad inmediata en producción en `https://yolix-arch.github.io/` y `https://yolix-arch.github.io/admin.html`.

---

### [2026-10-17] - Sistema Integral y Sincronizado de Tallas y Variantes Ajustables (Plan de Acción 3 Ejecutado al 100%)

- **Arquitectura Tripartita y Base de Datos ERP en Google Sheets (`Codigo.gs`)**:
  - Incorporación oficial de la columna `Tallas` (Columna 13 / M) en la pestaña `Productos` de Google Sheets.
  - Actualización de `iniciarEstructura` con encabezado `Tallas` y tallas preconfiguradas para los productos de muestra (ej. calzados `38, 39, 40, 41, 42, 43`, ropa `S, M, L, XL`, `Talla Única`).
  - Actualización de `embellecerYFormatearSheets` para asegurar la existencia automática de la columna 13 y asignarle formato de texto plano `@`.
  - Exposición del campo `tallas` en `obtenerDatosCatalogo()` y `obtenerDatosAdmin(clave)`.
  - Soporte de guardado en `guardarProductoAdmin(clave, p)` garantizando 13 columnas sincronizadas.
  - Extensión de `actualizarRapidoAdmin(clave, id, 'tallas', valor)` para permitir actualización instantánea de tallas por producto sin recargar la página.
  - En `tienda_gh_pages/api.js`: adición de funciones clientes `actualizarTallasAdminAPI(claveAdmin, idProducto, tallas)` y `actualizarRapidoAdminAPI(claveAdmin, idProducto, campo, valor)` con soporte optimista y offline.

- **Panel Administrador: Gestión Manual y Plantillas de Rango (`admin.html`)**:
  - Wrapper `#modalEdicionProducto` integrado para referencia e inspección directa del modal de producto.
  - Bloque visual destacado: `👟 Tallas y Variantes Disponibles` con input editable `<input type="text" id="editProductoTallas">` (y respaldo en `formProdTallas`).
  - Botón de guardado rápido `[Guardar Tallas]` (`guardarTallasRapidoModal()`) que persiste únicamente las tallas en Google Sheets de forma instantánea con confirmación toast esmeralda.
  - Botones de inserción rápida de 1 clic (Plantillas de Rango):
    * `[👟 Calzado 35-43]` ➡️ rellena `"35, 36, 37, 38, 39, 40, 41, 42, 43"`.
    * `[👟 Calzado 38-44]` ➡️ rellena `"38, 39, 40, 41, 42, 43, 44"`.
    * `[👕 Ropa S a XL]` ➡️ rellena `"S, M, L, XL"`.
    * `[👕 Ropa M a XXL]` ➡️ rellena `"M, L, XL, XXL"`.
    * `[🧒 Niños 2-16]` ➡️ rellena `"2, 4, 6, 8, 10, 12, 14, 16"`.
    * `[✨ Talla Única / Universal]` ➡️ rellena `"Talla Única"`.
    * `[Limpiar]` ➡️ vacía el campo de tallas.
  - Integración en `editarProducto(id)` para cargar las tallas existentes y en `guardarFormularioProducto()` para enviarlas en el payload.
  - Enriquecimiento de la tabla de productos (`renderizarTablaProductos`) mostrando una insignia distintiva con las tallas activas bajo el identificador del producto.

- **Catálogo de Clientes: Experiencia de Compra Interactiva (`index.html` y `404.html`)**:
  - Ficha de detalle de producto (`#modalProducto`):
    * Contenedor `#modalSeccionTallas` con selector interactivo `Selecciona tu Talla:`.
    * Si el producto es `"Talla Única"` o no tiene tallas, el selector permanece oculto para mantener la interfaz limpia.
    * Si tiene tallas definidas, renderiza dinámicamente píldoras estéticas (`.btn-talla-pildora`) con microinteracciones y resaltado activo (`bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-500/30 scale-105`).
    * Al hacer clic, se almacena en `tallaSeleccionada` y se muestra la insignia de confirmación `#modalTallaSeleccionadaBadge`.
  - Validación y Enlace Automatizado con WhatsApp:
    * Si el producto requiere talla y el usuario presiona `Pedir por WhatsApp` sin elegir una, se bloquea el pedido, se animan las píldoras y se muestra el aviso `#modalAvisoTallaRequerida`: *"Por favor elige tu talla para procesar tu orden"*.
    * Al ordenar, el modal de confirmación `#modalPedido` y el mensaje estructurado de WhatsApp incluyen la talla elegida:
      `Hola Yolix, deseo ordenar el siguiente producto:`
      `📦 Producto: [Nombre]`
      `📏 Talla: [Talla Seleccionada]`
      `💵 Precio: $[Precio]`
      `👤 Comprador: [Nombre] (Tel: [Teléfono])`
      `📍 Dirección: [Dirección]`
      `🔖 Código: [ID_Pedido]`
  - Enlace con Chat Web 1-a-1:
    * Botón `Chatear / Preguntar` (`#btnChatearDesdeProducto`) pre-carga automáticamente la consulta incluyendo la talla seleccionada:
      `Hola, tengo una pregunta sobre: [Nombre] (Talla [Talla], $[Precio])`
    * Permite que el administrador identifique en su bandeja de mensajes qué producto y qué talla exacta está consultando el visitante.
  - Sincronización idéntica y paridad total mantenida en `404.html` para la arquitectura SPA de GitHub Pages.

---

### [2026-10-17] - Carga Masiva a Google Drive, ERP Sheets y Drenaje Seguro de Nuevos Productos (P15 a P35)

- **Carga y Sincronización Masiva en Google Drive**:
  - Procesamiento secuencial y subida en Base64 de los 25 archivos de imágenes correspondientes a los 21 nuevos productos de la carpeta `./nuevos productos` a las subcarpetas oficiales de categoría en Google Drive (`Zapatos`, `Deportes`, `Ropa Hombre`, `Ropa Mujer`, `Ropa Niños`, `Carros`, `Accesorios`, `Juguetes`).
  - Generación automática de identificadores de CDN con enlaces de visualización pública `https://lh3.googleusercontent.com/d/ID`.
  - Agrupación inteligente de fotos múltiples para un mismo producto según sufijos numéricos (ej. `...1.png`, `...2.png`).
- **Registro en Google Sheets ERP (Columnas 1 a 13)**:
  - Registro de los 21 productos (identificadores `P15` hasta `P35`) con 13 columnas completas: ID, Nombre, Categoría, Subcategoría, Género, Precio ($), Foto1, Foto2, Foto3, Descripción, Stock (10 unidades por defecto), Estado ('Disponible'), Tallas.
  - Detección automática y asignación inteligente de rangos de tallas en función del nombre y la categoría (ej. calzados con tallas `35 a 43` o `38 a 43`, prendas con `S, M, L, XL`, `Talla Única`).
- **Drenaje Seguro Local (Zero-Data-Loss)**:
  - Eliminación local de cada archivo únicamente tras recibir confirmación explícita `{ exito: true }` del backend en Google Sheets, garantizando tolerancia absoluta ante cortes de energía o interrupciones de red.
  - Total de productos activos en el catálogo elevado de 14 a 35 productos en producción.

---

### [2026-10-17] - Emparejamiento Total de Botones (WhatsApp + Chat Web) y Validación Numérica Estricta

- **Botones de WhatsApp y Chat Web Juntos en Todo Momento**:
  - Inclusión del contenedor dinámico `#contenedorBtnWhatsappHeader` en la barra superior de navegación de la tienda (`index.html` y `404.html`), posicionado inmediatamente al lado del botón de Chat Web `#btnAbrirChat`.
  - Comportamiento reactivo uniforme:
    * **0 Teléfonos**: Oculta los botones de WhatsApp; se mantiene visible y activo únicamente el botón de Chat Web.
    * **1 Teléfono**: Muestra 1 botón verde de WhatsApp (`[📱 WhatsApp]`) junto al botón de Chat Web (`[💬 Chat]`).
    * **2 Teléfonos**: Muestra 2 botones de WhatsApp (`[📱 WA 1 (Pedidos)]` y `[📱 WA 2 (Soporte)]`) junto al botón de Chat Web.
  - Paridad garantizada tanto en la cabecera general como dentro de la ficha de detalle de producto (`#contenedorBotonesAccionProducto`).
- **Formularios con Selector de Prefijos y Filtrado Numérico Estricto**:
  - Implementación de selectores desplegables para código de país telefónico (`🇻🇪 +58`, `🇨🇴 +57`, `🇨🇱 +56`, `🇪🇸 +34`, `🇺🇸 +1`, etc.) y tipo de documento de identidad (`V-`, `E-`, `J-`, `G-`, `DNI`).
  - Funciones de validación en tiempo real `formatearCedulaInput` y `formatearTelefonoInput` que eliminan instantáneamente cualquier carácter no numérico (bloqueando ingresos erróneos de letras como `asd`/`hhh`) y aplican formateo estético automático con puntos (`12.345.678`) y espacios (`412 1234567`).

---

### [2026-10-17] - Auditoría Exhaustiva Zero-Bugs con Playwright (10/10 Pruebas Exitosas, 0 Errores en Consola)

- **Script de Pruebas Automatizadas en Navegador (`test_auditoria_completa_comunicacion.js`)**:
  - Ejecución de suite de pruebas end-to-end con Microsoft Edge headless conectándose a la URL de producción en vivo `https://yolix-arch.github.io/`.
  - **Fase 1: Catálogo y Carga Inicial**: Verificación de título oficial y carga exitosa de los 35 productos en el grid.
  - **Fase 2: Comunicación en Cabecera**: Comprobación de visibilidad de WhatsApp y Chat Web juntos con enlace `wa.me` parametrizado.
  - **Fase 3: Filtros y Buscador**: Clic secuencial en filtros (`Zapatos` [5], `Deportes` [9], `Ropa Hombre` [3], `Todos` [35]), prueba de búsqueda en vivo con `"zapato"` y botón de limpieza `[✖]`.
  - **Fase 4: Modal de Producto y Tallas**: Apertura de ficha, selección interactiva de tallas, enlace WhatsApp con talla y prueba de "Consultar por Chat" con pre-carga automática: `"Hola, tengo una pregunta sobre: Zapatos Deportivos Running Pro ($10.00)"`.
  - **Fase 5: Registro de Cliente**: Validación de selectores de prefijo y formateo numérico forzado (letras eliminadas automáticamente).
  - **Fase 6: Panel Administrador**: Login seguro con clave autorizada y protección de sesión.
  - **Fase 7: Modal de Configuración WhatsApp**: Apertura de `#modalConfigurarWhatsApp` y verificación de números cargados.
  - **Fase 8: Navegación por Pestañas**: Clic verificado en pestañas `Productos`, `Categorías`, `Pedidos`, `Clientes` y `Mensajes Web (Chat en Vivo)` con visualización de conversaciones entrantes.
  - **Fase 9: Modal de Edición de Producto y Tallas**: Apertura de modal de edición, inspección de tallas y prueba de preset rápido `[👟 Calzado 38-44]` completando `"38, 39, 40, 41, 42, 43, 44"`.
  - **Fase 10: Diagnóstico Zero-Bugs**: Eliminación de bloqueos CORS en configuración de marca, adición de favicon SVG integrado para evitar 404s y métrica final: **0 errores en consola (`console.error = 0`)**.
- **Dossier de Evidencias Fotográficas Generadas en `./capturas/`**:
  - `audit_01_tienda_inicial.png`: Vista completa de la tienda con WhatsApp y Chat juntos en la barra superior.
  - `audit_02_filtro_buscador.png`: Filtrado en tiempo real con término de búsqueda.
  - `audit_03_modal_producto.png`: Ficha de producto con botones de WhatsApp y Chat Web adyacentes.
  - `audit_04_chat_desde_producto.png`: Chat Web abierto desde el producto con consulta contextual.
  - `audit_05_modal_registro_formato.png`: Modal de registro con selectores de prefijo y números limpios.
  - `audit_06_admin_dashboard.png`: Panel administrador con inventario de 35 productos.
  - `audit_07_admin_modal_whatsapp.png`: Modal de configuración de teléfonos 1 y 2 de WhatsApp.
  - `audit_08_admin_pestanas.png`: Pestaña de Mensajes Web con bandeja de chats en tiempo real.
  - `audit_09_admin_edicion_producto.png`: Modal de edición de producto con botones rápidos de tallas y variantes.
  - `audit_10_resumen_final.png`: Resumen del panel tras auditoría exitosa.
  - Archivo de resultados estructurado guardado en `resultado_auditoria_zerobugs.json`.




---

### [2026-10-17] - Verificación de Correo Electrónico con Serial OTP Nativo MailApp y Matriz de Calidad 10/10

- **Backend Google Apps Script (`J:\texto\Codigo.gs`)**:
  - Ampliación de la estructura de la hoja 'Clientes' a 13 columnas agregando: `Correo_Electronico` (Col 10), `Codigo_OTP` (Col 11), `Estado_Correo` (Col 12), `Fecha_OTP` (Col 13).
  - Formateo visual automático en `embellecerYFormatearSheets` (@ para texto y yyyy-mm-dd hh:mm para fechas).
  - Generador de código serial seguro `generarCodigoSerialOTP()` con formato `YLX-XXXX` (8 caracteres, números y mayúsculas, sin caracteres ambiguos 0/O, 1/I).
  - Envío transaccional HTML nativo con `MailApp.sendEmail` y plantilla responsiva Yolix en bloque `try/catch` blindado contra agotamiento de cuotas y fallos de red (sin caídas HTTP 500).
  - Endpoints REST en `doGet` y `doPost` para `solicitarCodigoOTP`, `validarCodigoOTP` y `validarCorreoAdmin`.
  - Mapeo completo en `obtenerDatosAdmin` de los nuevos campos de verificación.
- **Frontend y UX de Clientes (`tienda_gh_pages/index.html`, `404.html`, `api.js`)**:
  - Flujo de registro en dos pasos (`#pasoRegistro1` y `#pasoRegistro2` en `#modalRegistro`) con transición fluida sin recargas.
  - Temporizador interactivo de cuenta regresiva de 45 segundos para reenvío de OTP con botón `[Reenviar código]`.
  - Alertas visuales dinámicas de código erróneo con preservación estricta de inputs (cero reseteos involuntarios).
  - Sincronización en `localStorage` con retrocompatibilidad para clientes antiguos (`tienda_cliente_sesion_v1` y `cliente_catalogo`).
  - Gating de seguridad para WhatsApp con modal protector amigable `#modalAvisoVerificacionWhatsApp` y acceso de 1 clic a verificar.
  - Libertad absoluta de navegación y Chat Web sin restricciones para visitantes no verificados.
  - Distintivo `[✓ Verificado]` en reseñas y cabecera para clientes confirmados; clientes no confirmados llevan `(No Confirmado)`.
- **Panel de Administración (`tienda_gh_pages/admin.html`)**:
  - Filtros rápidos en la tabla de clientes: `Todos`, `✉️ Verificados`, `⏳ Pendientes` y `✅ Confirmados`.
  - Badges visuales de estado `[✉️ Verificado]` (verde esmeralda) y `[⏳ Correo Pendiente]` (ámbar) con chip de código OTP.
  - Botones de acción rápida `[Validar Manual]` y `[Reenviar OTP]`, manteniendo siempre emparejados los botones `[💬 Chat]` y `[📱 WhatsApp]`.
- **Suite de Pruebas Automatizadas Playwright (`test_suite_verificacion_otp.js`)**:
  - 10 de 10 comprobaciones superadas con éxito con **cero errores en consola (`console.error === 0`)**.
  - Evidencia estructurada guardada en `resultado_verificacion_correo_otp.json`.

---

### [2026-10-17] - Sistema Dual de Modo Claro ☀️ / Modo Oscuro 🌙 con Arquitectura Cero Roturas (Zero-Breakage)

- **Frontend Catálogo (`tienda_gh_pages/index.html` y `tienda_gh_pages/404.html`)**:
  - **Arranque en Modo Claro por Defecto**: La tienda inicia normalmente en Modo Claro (`theme-light`) para cualquier visitante nuevo sin preferencia almacenada previa, satisfaciendo estrictamente el requerimiento del cliente.
  - **Preservación Total del Modo Oscuro**: Arquitectura modular no destructiva basada en `html.theme-light` y `body.theme-light`. Al alternar a Modo Oscuro, todas las clases Tailwind base (`bg-slate-900`, `text-slate-100`, etc.) se mantienen al 100% idénticas al diseño original sin roturas ni colisiones.
  - **Micro-Script Anti-FOUC**: Inserción síncrona en `<head>` para inspeccionar `localStorage.getItem('tienda_tema_visual')` y aplicar `theme-light` antes del primer render de los estilos, eliminando parpadeos molestos de pantalla.
  - **Botón Conmutador Sol/Luna (`#btnToggleTema`)**: Incorporado armoniosamente en la barra de navegación superior junto a WhatsApp y Chat Web, con cambio dinámico de iconos (`fa-moon` con tooltip 'Cambiar a Modo Oscuro' en tema claro, y `fa-sun` con tooltip 'Cambiar a Modo Claro' en tema oscuro).
  - **Adaptación Cromática de Modales Críticas (WCAG AA)**:
    - *Ficha de Producto (`#modalProducto`)*: Contenedor en blanco puro `#ffffff`, títulos en azul pizarra profundo `#0f172a`, precio esmeralda de alto contraste `#059669`, miniaturas enmarcadas en `#cbd5e1`, y selector de tallas con contraste óptimo.
    - *Registro de Clientes y OTP (`#modalRegistro`)*: Formulario con inputs blancos nítidos, bordes `#cbd5e1`, etiquetas oscuras legibles y pantalla OTP contrastada con input `#f8fafc` e icono protector violeta.
    - *Chat Web en Vivo (`#modalChatTienda`)*: Fondo de conversación blanco marfil `#f8fafc`, burbujas de asesor en blanco `#ffffff` con borde `#e2e8f0` y texto `#0f172a`, y burbujas de cliente en índigo vibrante `#4f46e5` con texto blanco.
- **Suite de Pruebas Automatizadas Playwright (`test_modo_claro_oscuro.js`)**:
  - 7 de 7 comprobaciones críticas superadas con éxito con **cero errores en consola (`console.error === 0`)**:
    - **P1**: Carga Inicial por Defecto (Modo Claro activo sin configuración previa).
    - **P2**: Conmutación Dinámica (Click Sol/Luna en `#btnToggleTema` sin recargas).
    - **P3**: Preservación del Modo Oscuro (Fidelidad cromática original intacta).
    - **P4**: Persistencia tras Recarga (F5 bidireccional consistente con `localStorage`).
    - **P5**: Legibilidad de Textos en Modales (Contraste de alto impacto en Producto, Registro y Chat).
    - **P6**: Cero Errores en Consola del Navegador (`console.error === 0`).
    - **P7**: Evidencia Visual Generada (5 capturas de alta definición en `./capturas/`).
  - Evidencia estructurada guardada en `resultado_modo_claro_oscuro.json`.
