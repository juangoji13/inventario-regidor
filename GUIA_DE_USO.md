# 🏗️ GUÍA DE USO - INVENTARIO REGIDOR

Bienvenido a la guía oficial de **Inventario Regidor**, tu herramienta premium para la gestión y control logístico de obra. Esta aplicación ha sido diseñada para ser rápida, segura y fácil de usar directamente desde el campo.

---

## 🚀 1. ACCESO AL SISTEMA
La aplicación está protegida por un sistema de autenticación.
- **Acceso**: Usa tu nombre de usuario y contraseña asignados.
- **Seguridad**: La sesión se mantiene activa para que no tengas que loguearte cada vez que abras la app en el celular, pero puedes cerrar sesión en cualquier momento desde el botón superior.

---

## 📊 2. PANEL PRINCIPAL (DASHBOARD)
Es tu centro de control. Aquí verás:
- **Resumen del Día**: Indica cuántas entradas y salidas se han registrado hoy.
- **Actividad Reciente**: Una lista rápida de los últimos movimientos realizados con su hora exacta.
- **Gráfico de Consumo**: Una visualización de los 5 materiales más usados en los últimos 7 días. Esto te ayuda a planificar compras.

---

## 📦 3. GESTIÓN DE MATERIALES (CATÁLOGO)
Accede desde el botón **"Ver Inventario"**.
- **Buscador**: Usa la barra de búsqueda para encontrar materiales por nombre al instante.
- **Crear Nuevo**: Usa el botón **"+ Nuevo"** para registrar materiales que no existan (ej: Cemento, Varilla, Arena).
- **Detalle**: Al tocar un material, verás su saldo actual en obra y su historial específico de movimientos.
- **Edición**: Puedes corregir el nombre o la unidad (kg, bultos, m3) de cualquier material.
- **Eliminación**: ¡Cuidado! Eliminar un material borrará también todo su historial de movimientos permanentemente.

---

## 📥 4. ENTRADAS Y SALIDAS
Son las acciones principales para mantener el stock al día:
- **Cargar Entrada**: Úsalo cuando llegue un camión o proveedor. El stock del material subirá.
- **Registrar Salida**: Úsalo cuando el material se entregue a la cuadrilla o se use en la obra. El stock bajará.
- **⚠️ Bloqueo de Seguridad**: La app **no permite salidas negativas**. Si intentas sacar más material del que hay en stock, el sistema te detendrá con un aviso de error.
- **Fechas**: Por defecto usa la fecha y hora actual, pero puedes seleccionar fechas pasadas si olvidaste registrar algo.

---

## 📂 5. ARCHIVO Y REPORTES
- **Historial Completo**: Accede para ver absolutamente todos los movimientos desde que se inició el período.
- **Exportar a Excel**: Descarga un archivo compatible con Excel con todo el registro para tus informes administrativos.
- **Cierre de Período**: Una función administrativa para limpiar el historial y arrancar un nuevo mes o etapa de obra. **Nota: Siempre descarga el reporte antes de borrar.**

---

## 🛠️ 6. FICHA TÉCNICA
- **Base de Datos**: Supabase (Nube - Sincronización en tiempo real).
- **Alojamiento**: Vercel (Acceso rápido desde cualquier lugar).
- **Seguridad**: Protección contra inyección de código (XSS) y validación de integridad en base de datos.
- **Diseño**: Optimizado para dispositivos móviles con estética "Industrial Premium".

---
*Inventario Regidor - Control total en la palma de tu mano.*
