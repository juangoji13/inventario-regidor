# 🏗️ Inventario Regidor - Control Logístico de Obra

**Inventario Regidor** es una solución web de alto nivel diseñada específicamente para el control de materiales en proyectos de construcción. Enfocada en la simplicidad, la seguridad y una estética "Industrial Premium", permite a los ingenieros y encargados de obra tener el control total de los insumos en la palma de su mano.

---

## ✨ Características Principales

- **📊 Dashboard de Inteligencia**: Visualiza el consumo semanal de materiales mediante gráficos dinámicos (Chart.js) y mantente al tanto de la actividad diaria.
- **🛡️ Validación de Stock Inteligente**: El sistema impide automáticamente el registro de salidas que excedan el stock disponible en obra. ¡Adiós a los inventarios negativos!
- **🔍 Buscador de Materiales**: Filtro en tiempo real para localizar cualquier insumo en segundos dentro del catálogo.
- **📝 Gestión Completa (CRUD)**: Crea, edita y elimina materiales y unidades de medida con confirmación de seguridad.
- **🕒 Precisión Temporal**: Registro exacto de horas de operación para movimientos del día de hoy, asegurando un historial fidedigno.
- **📂 Reportes Operativos**: Exportación de todo el historial a formato CSV (Excel) para auditorías y cierres de período.
- **💎 Estética Industrial Fusion**: Interfaz optimizada para dispositivos móviles con un diseño oscuro, profesional y limpio.

---

## 🛠️ Stack Tecnológico

- **Frontend**: Vanilla Javascript (ES6+), HTML5 Semántico, CSS3 Personalizado.
- **Backend & DB**: [Supabase](https://supabase.com/) (PostgreSQL con RLS).
- **Despliegue**: [Vercel](https://vercel.com/) (Serverless config).
- **Librerías**: 
  - [Chart.js](https://www.chartjs.org/) para visualización de datos.
  - [FontAwesome](https://fontawesome.com/) para iconografía industrial.
  - [Flatpickr](https://flatpickr.js.org/) para gestión de fechas.

---

## 🚀 Despliegue en Producción

La aplicación se encuentra desplegada y operativa en la siguiente URL:
🔗 **[https://inventario-regidor.vercel.app](https://inventario-regidor.vercel.app)**

---

## 🛠️ Para Desarrolladores

### Configuración de Supabase
El sistema requiere una base de datos PostgreSQL con las siguientes políticas habilitadas:
- **Enable RLS** en las tablas `materiales` y `movimientos`.
- **Políticas de Seguridad**: SELECT, INSERT, UPDATE y DELETE permitidos para usuarios `authenticated`.
- **Triggers**: Cálculo automático de stock mediante funciones en PL/pgSQL.

### Variables de Entorno
Configurar en Vercel o localmente:
- `SUPABASE_URL`: Tu endpoint de Supabase.
- `SUPABASE_KEY`: Tu clave pública anónima.

---

## 📘 Guía de Usuario
Para más detalles sobre el funcionamiento de la app, consulta la [Guía de Uso](./GUIA_DE_USO.md).

---
*Desarrollado para el Ing. Mauricio Gonzalez - 2026*
