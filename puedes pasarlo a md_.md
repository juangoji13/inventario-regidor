<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# puedes pasarlo a md?

Aquí tienes el contenido del PRD pasado a Markdown:[^1]

***

# Product Requirements Document (PRD)

## App Web de Inventario de Materiales para Obra de Construcción


***

## 1. Resumen Ejecutivo

**Proyecto:** Sistema web de gestión de inventario de materiales para obra de construcción.

**Problema:** Actualmente no existe un registro ordenado y auditable de entradas y salidas de materiales en la obra. Esto genera:

- Riesgo de pérdida y desorden de materiales.
- Discusiones sobre cuánto material se gastó realmente vs. lo que se reporta.
- Falta de trazabilidad para justificar ante el ingeniero jefe.

**Solución:** Una app web responsive (enfoque móvil) donde se registren movimientos de materiales (entradas/salidas) con fecha, cantidad y unidad. El usuario accede mediante login sencillo, ve un resumen diario, puede buscar materiales, consultar saldo y generar un Excel auditable.

**Objetivo principal:** Tener un registro claro, inmutable y con trazabilidad completa que evite pérdidas y permita justificar el uso de materiales ante el ingeniero jefe.

**Alcance MVP (v1):** Gestión básica de materiales, registro de movimientos, resumen diario, búsqueda, detalle de material con últimos movimientos y exportación a Excel.

***

## 2. Usuarios y Casos de Uso

### 2.1 Usuarios Principales

| Usuario | Rol | Responsabilidad |
| :-- | :-- | :-- |
| **Responsable de bodega/obra** | Usuario principal | Registra entradas y salidas diariamente; consulta saldo en tiempo real; genera reportes para el ingeniero. |
| **Ingeniero jefe** | Usuario secundario (consulta) | Revisa reportes en Excel; valida el uso de materiales. |

### 2.2 Casos de Uso Clave

| \# | Caso de Uso | Descripción |
| :-- | :-- | :-- |
| UC1 | Crear/gestionar materiales | El usuario puede crear nuevos materiales y asociarles unidades de medida. |
| UC2 | Registrar entrada de material | El usuario registra que ingresa X cantidad de un material con fecha y nota. |
| UC3 | Registrar salida de material | El usuario registra que entrega X cantidad de un material a un equipo/actividad. |
| UC4 | Consultar saldo en tiempo real | El usuario ve cuánto queda disponible de cada material (suma entradas - suma salidas). |
| UC5 | Ver resumen del día | En la pantalla de inicio, el usuario ve los movimientos registrados hoy. |
| UC6 | Buscar material rápidamente | El usuario escribe el nombre de un material y ve sugerencias inmediatas. |
| UC7 | Consultar historial de un material | El usuario entra en un material y ve su saldo actual y los últimos movimientos. |
| UC8 | Exportar historial a Excel | El usuario descarga un archivo Excel con todos los movimientos (filtrable por rango de fechas, material, tipo). |


***

## 3. Alcance del MVP (v1)

### 3.1 Incluye

- ✅ Autenticación básica con usuario/contraseña.
- ✅ Gestión de materiales: crear, editar nombre, asociar unidades.
- ✅ Registro de movimientos (entrada/salida) con tipo, cantidad, unidad, fecha editable y nota opcional.
- ✅ Cálculo automático de saldo por material.
- ✅ Pantalla de inicio con resumen del día.
- ✅ Buscador rápido de materiales por nombre.
- ✅ Pantalla de detalle de material con saldo actual y últimos movimientos.
- ✅ Exportación a Excel del historial completo con filtros básicos.
- ✅ Diseño responsive enfocado en móvil.


### 3.2 No incluye (roadmap futuro)

- ❌ Alertas automáticas cuando el stock sea bajo.
- ❌ Multi-usuario con permisos avanzados (roles: admin, viewer, editor).
- ❌ Integración con proveedores o facturación.
- ❌ Conversión automática entre unidades de medida.
- ❌ Análisis y reportes gráficos complejos.
- ❌ Soporte offline (por ahora, requiere conexión).

***

## 4. Requisitos Funcionales

| \# | Requisito | Descripción |
| :-- | :-- | :-- |
| **RF1** | Autenticación básica | El sistema debe solicitar usuario y contraseña antes de acceder. Sin credenciales válidas, bloquea acceso. |
| **RF2** | Crear material | El usuario puede crear un nuevo material con: nombre, y al menos una unidad de medida. |
| **RF3** | Editar material | El usuario puede editar el nombre y las unidades asociadas a un material existente. |
| **RF4** | Registrar entrada | El usuario registra una entrada indicando: material, cantidad, unidad, fecha (editable), nota (opcional). |
| **RF5** | Registrar salida | El usuario registra una salida indicando: material, cantidad, unidad, fecha (editable), nota (opcional). |
| **RF6** | Calcular saldo | El sistema calcula automáticamente: Saldo = Σ(Entradas) - Σ(Salidas) por material. |
| **RF7** | Inmutabilidad de movimientos | Los movimientos registrados NO se pueden editar ni eliminar; solo se pueden consultar. |
| **RF8** | Resumen del día | La pantalla de inicio muestra los movimientos registrados hoy (tipo, material, cantidad, unidad, hora). |
| **RF9** | Buscar material rápidamente | Campo de búsqueda que filtra materiales por nombre en tiempo real; al seleccionar, va a detalle. |
| **RF10** | Detalle de material | Pantalla que muestra: saldo actual, últimos N movimientos (fecha/hora, tipo, cantidad, unidad, nota). |
| **RF11** | Historial completo | Pantalla con listado de todos los movimientos; soporta filtros básicos (fecha, material, tipo). |
| **RF12** | Exportar a Excel | Botón que descarga un archivo Excel con columnas: Fecha, Material, Tipo, Cantidad, Unidad, Nota. |


***

## 5. Reglas de Negocio y Validaciones

### 5.1 Reglas Generales

- **Movimientos inmutables:** Toda entrada o salida registrada es permanente. No se puede editar ni borrar. Si hay error, la corrección se hace con un nuevo movimiento compensatorio (por ejemplo, una entrada negativa o salida negativa).
- **Saldo no negativo (por defecto):** El sistema no permite crear una salida que deje el saldo en negativo, a menos que se explicite en una futura regla. Si sucede, mostrará un error claro.
- **Campos obligatorios en movimientos:** Material, cantidad, unidad, fecha y tipo (entrada/salida) son obligatorios. Nota es opcional.
- **Unidades por material:** Cada material tiene asociada una lista de unidades posibles (por ejemplo, cemento → "bultos"; arena → "m³", "carretadas").


### 5.2 Catálogo de Unidades Estándar por Tipo de Material

| Material | Unidades Asociadas |
| :-- | :-- |
| Cemento | Bultos, kg |
| Arena | m³, Carretadas, Toneladas |
| Varilla de hierro | Varillas, kg |
| Bloques/Ladrillos | Unidades, Docenas |
| Tubería (PVC/hierro) | Metros, Piezas |
| Acero estructural | kg, Toneladas |
| Madera | Metros cúbicos (m³), Piezas |
| Grava/Piedra | m³, Toneladas, Carretadas |
| Alambre | kg, Rollos |
| Tornillos/Pernos | Kilos, Cajas |

*Nota: Esta lista es orientativa. El usuario puede agregar materiales y unidades personalizadas según su necesidad.*

### 5.3 Validaciones de Entrada

- **Cantidad:** Debe ser un número positivo (mayor a 0).
- **Fecha:** No puede ser mayor a hoy; formato editable (por si se registra un movimiento pasado).
- **Material:** Debe existir en la base de datos o se debe crear nuevo antes de registrar el movimiento.
- **Unidad:** Debe corresponder a las unidades permitidas del material seleccionado.

***

## 6. Requisitos No Funcionales

| Aspecto | Requisito |
| :-- | :-- |
| **Responsividad** | La app se ve correctamente en móvil (viewport mínimo 320px) y escritorio. Prioridad: móvil. |
| **Performance** | Las pantallas cargan en menos de 2 segundos; listados de hasta 1000 movimientos sin lag notorio. |
| **Compatibilidad** | Compatible con navegadores modernos: Chrome, Safari, Firefox (últimas 2 versiones). |
| **Seguridad** | Contraseñas almacenadas de forma segura (hash). Sesión persiste pero con opción de logout manual. |
| **Disponibilidad** | Por ahora, requiere conexión a internet. No hay soporte offline en MVP. |


***

## 7. Descripción de Pantallas (UX/UI)

### 7.1 Pantalla de Login

- Campos: Usuario, Contraseña.
- Botón: Iniciar sesión.
- Mensaje de error si credenciales son inválidas.
- Responsive: se ve bien en móvil sin zoom.


### 7.2 Pantalla de Inicio (Home)

**Secciones:**

1. **Header:** Logo/título de la app, botón de logout.
2. **Resumen del día:** Título "Resumen de hoy" + listado de movimientos del día (material, cantidad, unidad, hora).
3. **Buscador rápido:** Campo de texto "Buscar material..." que filtra y sugiere materiales.
4. **Botones de acción:**
    - "Registrar entrada" (verde, destacado).
    - "Registrar salida" (naranja, destacado).
    - "Ver historial completo" (secundario).
    - "Gestionar materiales" (secundario).

### 7.3 Pantalla: Registrar Entrada / Salida

- **Formulario con campos:**
    - Material (select/dropdown).
    - Cantidad (número, positivo).
    - Unidad (select, filtrado según material).
    - Fecha (date picker, por defecto hoy, editable).
    - Nota (texto, opcional, max 200 caracteres).
- **Botones:** Guardar, Cancelar.
- **Validaciones:** Si falta algo o hay error (ej: saldo negativo), mostrar mensaje claro.


### 7.4 Pantalla: Detalle de Material

- **Encabezado:** Nombre del material.
- **Saldo actual (destacado):** "Tienes X [unidad] disponibles" (tipografía grande).
- **Últimos movimientos:** Tabla/lista con: Fecha/Hora, Tipo (entrada/salida), Cantidad, Unidad, Nota.
- **Botones:**
    - "Registrar entrada".
    - "Registrar salida".
    - "Ver historial completo de este material".


### 7.5 Pantalla: Historial Completo

- **Filtros (opcionales):**
    - Rango de fechas (desde/hasta).
    - Material (select o búsqueda).
    - Tipo (entrada, salida, todos).
- **Tabla:** Columnas: Fecha, Material, Tipo, Cantidad, Unidad, Nota.
- **Botón:** "Exportar a Excel" (descarga el archivo).


### 7.6 Pantalla: Gestionar Materiales

- **Lista de materiales:** Nombre + saldo actual + opciones (editar, eliminar).
- **Botón:** "Crear nuevo material".
- **Al crear/editar:**
    - Nombre del material.
    - Seleccionar unidades (al menos una).

***

## 8. Criterios de Éxito (MVP)

1. ✅ El usuario logra registrar entradas y salidas de materiales diariamente sin dificultad.
2. ✅ El sistema calcula correctamente el saldo disponible de cada material.
3. ✅ El ingeniero jefe puede descargar un Excel limpio y auditable con todos los movimientos.
4. ✅ La app es usable desde un móvil en contexto de obra (sin necesidad de escribir mucho, botones grandes).
5. ✅ No hay pérdida de datos; cada movimiento queda registrado permanentemente.
6. ✅ El usuario puede encontrar rápidamente un material y ver su historial en menos de 3 clics.

***

## 9. Roadmap Futuro (v2 en adelante)

- [ ] **Multi-obra:** Permitir crear proyectos/obras distintas y cambiar entre ellas.
- [ ] **Alertas de stock bajo:** Notificación cuando un material cae por debajo de un umbral definido.
- [ ] **Usuarios con permisos:** Admin (crea materiales, autoriza movimientos), Bodeguero (registra), Supervisor (solo consulta).
- [ ] **Conversión de unidades:** Si un material tiene varias unidades, convertir automáticamente entre ellas.
- [ ] **Reportes gráficos:** Gráficos de consumo por semana/mes.
- [ ] **Integración con proveedores:** Conectar con órdenes de compra y recepción automática.

***

## 10. Backlog de Tickets para Desarrollo

**Epic: App Web de Inventario de Materiales para Obra**

### Ticket 1 – Configurar proyecto base web responsive

**Tipo:** Story
**Descripción:**
Crear el proyecto base de la app web con soporte responsive y enfoque mobile-first. Incluir routing mínimo y estructura para futuras pantallas.

**Criterios de aceptación:**

- La app carga una pantalla inicial vacía con header simple.
- El layout se ve correctamente en móvil y escritorio (sin scroll horizontal).
- Estructura preparada para añadir vistas: Inicio, Materiales, Historial.


### Ticket 2 – Modelo de datos y almacenamiento inicial

**Tipo:** Story
**Descripción:**
Definir e implementar el modelo de datos para materiales y movimientos (entrada/salida), con soporte para múltiples unidades por material.

**Criterios de aceptación:**

- Existe entidad "Material" con: id, nombre, unidades posibles, estado (activo).
- Existe entidad "Movimiento" con: id, materialId, tipo (entrada/salida), cantidad, unidad, fecha, nota opcional.
- El saldo de un material se calcula como suma(entradas) – suma(salidas) de sus movimientos.


### Ticket 3 – Implementar autenticación básica (login)

**Tipo:** Story
**Descripción:**
Añadir login sencillo con usuario/contraseña para acceder a la app.

**Criterios de aceptación:**

- Hay pantalla de login con campos usuario y contraseña.
- Sin credenciales válidas no se puede acceder a las pantallas internas.
- Sesión persiste mientras el usuario no cierre sesión manualmente (o haya expiración básica).


### Ticket 4 – Pantalla de inicio con resumen del día

**Tipo:** Story
**Descripción:**
Implementar pantalla de inicio que muestre un resumen de los movimientos del día y accesos rápidos.

**Criterios de aceptación:**

- En la parte superior se muestra "Resumen del día" con lista de movimientos de hoy (material, cantidad, unidad, hora).
- Hay botones visibles para "Registrar entrada" y "Registrar salida".
- Hay un campo de búsqueda rápida de material en la misma pantalla.


### Ticket 5 – Crear/gestionar materiales

**Tipo:** Story
**Descripción:**
Permitir crear y gestionar la lista de materiales, incluyendo unidades más usadas por material.

**Criterios de aceptación:**

- Existe pantalla/lista de materiales con: nombre y saldo actual.
- Se puede crear un nuevo material indicando nombre y al menos una unidad principal (ej: "bultos", "m³").
- Se puede añadir/eliminar unidades adicionales asociadas a un material (solo gestión, aún sin conversión entre unidades).


### Ticket 6 – Registrar entrada de material

**Tipo:** Story
**Descripción:**
Implementar flujo para registrar una entrada de material.

**Criterios de aceptación:**

- Desde inicio o desde el detalle de un material se puede abrir un formulario "Registrar entrada".
- Campos: material (select), cantidad, unidad (lista filtrada por el material), fecha (por defecto hoy, editable), nota opcional.
- Al guardar, se crea un movimiento tipo "entrada" inmutable.
- El saldo del material se actualiza correctamente.


### Ticket 7 – Registrar salida de material

**Tipo:** Story
**Descripción:**
Implementar flujo para registrar una salida de material.

**Criterios de aceptación:**

- Desde inicio o desde el detalle de un material se puede abrir "Registrar salida".
- Campos iguales a entrada: material, cantidad, unidad, fecha, nota opcional.
- Al guardar, se crea un movimiento tipo "salida" inmutable.
- El saldo del material refleja la salida (disminuye).
- Si el saldo quedara negativo, se permite solo si así se definió; si no, mostrar mensaje de error y bloquear guardado.


### Ticket 8 – Búsqueda rápida de materiales

**Tipo:** Story
**Descripción:**
Implementar buscador rápido en la pantalla de inicio para localizar materiales por nombre.

**Criterios de aceptación:**

- Al escribir texto en el buscador, se sugieren materiales cuyo nombre contenga ese texto.
- Al seleccionar un material, se navega a la pantalla de detalle de ese material.
- Búsqueda usable en móvil (teclado, foco correcto).


### Ticket 9 – Pantalla de detalle de material

**Tipo:** Story
**Descripción:**
Crear pantalla de detalle donde se vea el saldo actual y un pequeño historial de últimos movimientos.

**Criterios de aceptación:**

- Se muestra en grande el saldo actual (cantidad + unidad principal).
- Debajo se listan los últimos N movimientos (ej: 10): fecha/hora, tipo, cantidad, unidad, nota.
- Desde esta pantalla se puede: registrar entrada, registrar salida, ir al historial completo.


### Ticket 10 – Historial completo y exportación a Excel

**Tipo:** Story
**Descripción:**
Implementar vista de historial completo de movimientos y función de exportación a Excel.

**Criterios de aceptación:**

- Existe pantalla de historial con filtros simples (por rango de fechas, por material, por tipo entrada/salida).
- Al pulsar "Exportar a Excel", se descarga un archivo con columnas: Fecha, Material, Tipo, Cantidad, Unidad, Nota.
- El Excel incluye todos los registros que cumplen los filtros aplicados.


### Ticket 11 – Manejo de errores y validaciones

**Tipo:** Story
**Descripción:**
Añadir validaciones de datos y mensajes de error claros en formularios.

**Criterios de aceptación:**

- No se permiten cantidades vacías, cero o negativas (según reglas decididas).
- No se permiten materiales sin nombre ni sin al menos una unidad.
- En caso de error al guardar, se muestra mensaje entendible y el usuario no pierde lo que ya escribió.


### Ticket 12 – Ajustes de responsive y pruebas en móvil

**Tipo:** Story
**Descripción:**
Revisar y ajustar la app para que se use cómodamente desde un móvil en obra.

**Criterios de aceptación:**

- Todos los formularios se usan cómodamente en pantalla pequeña (sin zoom, sin scroll lateral).
- Botones principales (entrada/salida/guardar) son fácilmente clicables con el pulgar.
- Flujo completo (login → resumen → registro de movimiento → detalle → exportar) probado en al menos un móvil Android y un navegador de escritorio.

***

## 11. Notas Finales

- **Iteración rápida:** Este PRD define el MVP. Después de un sprint inicial, recopilar feedback del usuario (tú) y ajustar según uso real.
- **Priorización:** Se sugiere desarrollar los tickets en orden: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12.
- **Stakeholders:** Usuario principal: Responsable de bodega/obra. Stakeholder secundario: Ingeniero jefe (solo revisión de reportes).
- **Contacto:** Para cambios o aclaraciones, comunicar directamente con el usuario principal.

**Versión:** 1.0
**Fecha de creación:** Febrero 6, 2026
**Última actualización:** Febrero 6, 2026
**Estado:** Aprobado para desarrollo MVP

<div align="center">⁂</div>

[^1]: Inventory-App-PRD.docx

