# 🏗️ Inventario Regidor

Sistema de gestión de inventario para obras civiles - PWA con sincronización en la nube.

## 📋 Características

✅ **Progressive Web App (PWA)** - Instalable en móviles y tablets  
✅ **Modo Offline** - Funciona sin conexión  
✅ **Sincronización en tiempo real** - Supabase backend  
✅ **Autenticación segura** - Sistema de usuarios  
✅ **Export a CSV/Excel** - Reportes descargables  
✅ **Diseño Premium** - UI moderna con glassmorphism  

---

## 🚀 Instalación Local

### 1. Prerequisitos
- Node.js 18+ instalado
- Cuenta de Supabase configurada
- Git (opcional)

### 2. Clonar el proyecto
```bash
git clone <repository-url>
cd inventario
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar variables de entorno

#### Opción A: Desarrollo Local (variables en HTML)
Crea un archivo `env.js` en la raíz del proyecto:

```javascript
// env.js - NO SUBIR A GIT
window.SUPABASE_URL = 'https://tu-proyecto.supabase.co';
window.SUPABASE_KEY = 'tu-anon-key-aqui';
```

Luego agrégalo en `index.html` antes de `app.js`:
```html
<script src="env.js"></script>
<script src="app.js"></script>
```

⚠️ **IMPORTANTE**: Agrega `env.js` a `.gitignore`

#### Opción B: Producción (Vercel)
Configura las variables de entorno en Vercel:
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key-aqui
```

### 5. Ejecutar localmente
```bash
npm run dev
```

Abre http://localhost:3000

---

## 🗄️ Configuración de Supabase

### 1. Crear tablas

Ejecuta este SQL en el editor de Supabase:

```sql
-- Tabla de materiales
CREATE TABLE materiales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    unidad_principal TEXT NOT NULL,
    stock_actual NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de movimientos
CREATE TABLE movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES materiales(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida')),
    cantidad NUMERIC NOT NULL,
    unidad TEXT NOT NULL,
    fecha_operacion TIMESTAMP WITH TIME ZONE NOT NULL,
    nota TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para actualizar stock automáticamente
CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.tipo = 'entrada' THEN
            UPDATE materiales 
            SET stock_actual = stock_actual + NEW.cantidad 
            WHERE id = NEW.material_id;
        ELSIF NEW.tipo = 'salida' THEN
            UPDATE materiales 
            SET stock_actual = stock_actual - NEW.cantidad 
            WHERE id = NEW.material_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON movimientos
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();

-- Habilitar Row Level Security (RLS)
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (usuarios autenticados pueden ver/editar todo)
CREATE POLICY "Usuarios autenticados pueden ver materiales"
ON materiales FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar materiales"
ON materiales FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden ver movimientos"
ON movimientos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar movimientos"
ON movimientos FOR INSERT
TO authenticated
WITH CHECK (true);
```

### 2. Crear usuarios

En Supabase Dashboard > Authentication > Users, crea usuarios manualmente con este formato:

- **Email**: `usuario@regidor.local` (ej: `mauricio@regidor.local`)
- **Password**: La contraseña que elijas

> ⚠️ **Importante**: El sistema convierte automáticamente el nombre de usuario a formato email. Si el usuario ingresa "mauricio", el sistema busca "mauricio@regidor.local".

---

## 📱 Iconos PWA

El proyecto necesita los siguientes iconos en la raíz:

- `icon-192.png` (192x192 px)
- `icon-512.png` (512x512 px)
- `favicon.ico` (64x64 px)

**Recomendación**: Usa [Favicon Generator](https://realfavicongenerator.net/) para generar todos los tamaños.

**Diseño sugerido**: 
- Fondo: #4c6194 (azul industrial)
- Icono: Símbolo de almacén/construcción en blanco y dorado
- Estilo: Minimalista, flat design

---

## 🌐 Deploy a Vercel

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy
```bash
vercel --prod
```

### 4. Configurar variables de entorno
En Vercel Dashboard > Settings > Environment Variables:

```
SUPABASE_URL = https://tu-proyecto.supabase.co
SUPABASE_KEY = tu-anon-key-aqui
```

---

## 📂 Estructura del Proyecto

```
inventario/
├── index.html          # Página principal
├── app.js              # Lógica de la aplicación
├── style.css           # Estilos premium
├── sw.js               # Service Worker (PWA)
├── manifest.json       # Configuración PWA
├── api/
│   └── config.js       # API para variables de entorno
├── package.json
├── vercel.json        # Configuración de Vercel
└── README.md
```

---

## 🛠️ Desarrollo

### Comandos disponibles
```bash
npm run dev    # Servidor local
npm start      # Alias de dev
```

### Features pendientes
- [ ] Búsqueda y filtros en inventario
- [ ] Modo oscuro/claro
- [ ] Notificaciones push
- [ ] Gráficos y estadísticas
- [ ] Múltiples proyectos

---

## 📄 Licencia

ISC - Ing. Mauricio Gonzalez

---

## 🐛 Troubleshooting

### "Error: Configuración de Supabase no encontrada"
- Verifica que las variables de entorno estén configuradas
- En local: asegúrate de que `env.js` existe y está cargado
- En Vercel: verifica las environment variables

### "Service Worker no se registra"
- Debe usarse HTTPS o localhost
- Limpia caché del navegador
- Verifica que `sw.js` esté en la raíz del proyecto

### "Usuario o contraseña incorrectos"
- Verifica que el usuario existe en Supabase Auth
- El formato debe ser `usuario@regidor.local`
- Verifica las políticas RLS de Supabase

---

**Version**: 1.0.0  
**Última actualización**: Febrero 2026
