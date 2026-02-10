-- ============================================
-- ESQUEMA DE BASE DE DATOS - INVENTARIO REGIDOR
-- Supabase PostgreSQL
-- ============================================

-- ============================================
-- 1. TABLAS PRINCIPALES
-- ============================================

-- Tabla de materiales de construcción
CREATE TABLE IF NOT EXISTS materiales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    unidad_principal TEXT NOT NULL, -- Ej: "kg", "m3", "unidades", "bultos"
    stock_actual NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES materiales(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida')),
    cantidad NUMERIC NOT NULL CHECK (cantidad > 0),
    unidad TEXT NOT NULL,
    fecha_operacion TIMESTAMP WITH TIME ZONE NOT NULL,
    nota TEXT,
    usuario_email TEXT, -- Email del usuario que realizó la operación
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX IF NOT EXISTS idx_materiales_nombre ON materiales(nombre);
CREATE INDEX IF NOT EXISTS idx_movimientos_material_id ON movimientos(material_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha_operacion DESC);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos(tipo);

-- ============================================
-- 3. TRIGGERS Y FUNCIONES
-- ============================================

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para materiales
CREATE TRIGGER trigger_materiales_updated_at
BEFORE UPDATE ON materiales
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp();

-- Función para actualizar stock automáticamente al insertar movimiento
CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo = 'entrada' THEN
        UPDATE materiales 
        SET stock_actual = stock_actual + NEW.cantidad 
        WHERE id = NEW.material_id;
    ELSIF NEW.tipo = 'salida' THEN
        UPDATE materiales 
        SET stock_actual = GREATEST(0, stock_actual - NEW.cantidad)
        WHERE id = NEW.material_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stock
CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON movimientos
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si hay (para re-ejecución del script)
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver materiales" ON materiales;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar materiales" ON materiales;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar materiales" ON materiales;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver movimientos" ON movimientos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar movimientos" ON movimientos;

-- Políticas para materiales
CREATE POLICY "Usuarios autenticados pueden ver materiales"
ON materiales FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar materiales"
ON materiales FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar materiales"
ON materiales FOR UPDATE
TO authenticated
USING (true);

-- Políticas para movimientos
CREATE POLICY "Usuarios autenticados pueden ver movimientos"
ON movimientos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar movimientos"
ON movimientos FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- 5. DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

-- Descomentar para insertar datos de prueba
/*
INSERT INTO materiales (nombre, unidad_principal, stock_actual) VALUES
('Cemento Portland', 'bultos', 50),
('Arena', 'm3', 10),
('Grava', 'm3', 8),
('Varilla 3/8"', 'kg', 500),
('Varilla 1/2"', 'kg', 300),
('Alambre recocido', 'kg', 25),
('Clavos', 'kg', 15),
('Madera 2x4', 'unidades', 100);

-- Movimientos de ejemplo
INSERT INTO movimientos (material_id, tipo, cantidad, unidad, fecha_operacion, nota)
SELECT 
    id,
    'entrada',
    stock_actual,
    unidad_principal,
    NOW() - INTERVAL '7 days',
    'Inventario inicial'
FROM materiales;
*/

-- ============================================
-- 6. VISTAS ÚTILES (OPCIONAL)
-- ============================================

-- Vista de resumen de inventario
CREATE OR REPLACE VIEW vista_inventario AS
SELECT 
    m.id,
    m.nombre,
    m.unidad_principal,
    m.stock_actual,
    COUNT(mov.id) as total_movimientos,
    SUM(CASE WHEN mov.tipo = 'entrada' THEN mov.cantidad ELSE 0 END) as total_entradas,
    SUM(CASE WHEN mov.tipo = 'salida' THEN mov.cantidad ELSE 0 END) as total_salidas,
    MAX(mov.fecha_operacion) as ultimo_movimiento
FROM materiales m
LEFT JOIN movimientos mov ON m.id = mov.material_id
GROUP BY m.id, m.nombre, m.unidad_principal, m.stock_actual;

-- ============================================
-- 7. VERIFICACIÓN
-- ============================================

-- Verificar que las tablas fueron creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('materiales', 'movimientos');

-- Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verificar políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. CREACIÓN DE USUARIOS:
   - Los usuarios deben crearse en Supabase Dashboard > Authentication
   - Formato de email: usuario@regidor.local
   - Ejemplo: mauricio@regidor.local
   
2. SEGURIDAD:
   - RLS está habilitado en todas las tablas
   - Solo usuarios autenticados pueden acceder a los datos
   - Para producción, considera agregar políticas más restrictivas
   
3. MANTENIMIENTO:
   - El trigger actualiza el stock automáticamente
   - No se permite stock negativo (usa GREATEST(0, ...))
   - Los movimientos están vinculados a materiales (ON DELETE CASCADE)
   
4. PERFORMANCE:
   - Se crearon índices en columnas frecuentemente consultadas
   - La vista 'vista_inventario' facilita consultas de resumen
*/
