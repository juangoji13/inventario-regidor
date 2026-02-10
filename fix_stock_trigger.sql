-- ============================================
-- DIAGNÓSTICO Y SOLUCIÓN - PROBLEMA DE STOCK
-- ============================================
-- Este script verifica y corrige el problema de actualización de stock

-- ============================================
-- 1. VERIFICAR SI EXISTEN LOS TRIGGERS
-- ============================================

-- Ver todos los triggers en la base de datos
SELECT 
    trigger_name, 
    event_object_table as tabla,
    action_timing as momento,
    event_manipulation as evento
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Ver funciones relacionadas con stock
SELECT 
    routine_name as funcion,
    routine_type as tipo
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%stock%';

-- ============================================
-- 2. ELIMINAR TRIGGERS Y FUNCIONES EXISTENTES (SI HAY)
-- ============================================

-- Esto es seguro, los recrearemos inmediatamente
DROP TRIGGER IF EXISTS trigger_actualizar_stock ON movimientos;
DROP FUNCTION IF EXISTS actualizar_stock();

-- ============================================
-- 3. RECREAR LA FUNCIÓN DE ACTUALIZACIÓN DE STOCK
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando se inserta un movimiento de ENTRADA
    IF NEW.tipo = 'entrada' THEN
        UPDATE materiales 
        SET stock_actual = stock_actual + NEW.cantidad 
        WHERE id = NEW.material_id;
        
        RAISE NOTICE 'Stock actualizado: +% para material %', NEW.cantidad, NEW.material_id;
    
    -- Cuando se inserta un movimiento de SALIDA
    ELSIF NEW.tipo = 'salida' THEN
        UPDATE materiales 
        SET stock_actual = GREATEST(0, stock_actual - NEW.cantidad)
        WHERE id = NEW.material_id;
        
        RAISE NOTICE 'Stock actualizado: -% para material %', NEW.cantidad, NEW.material_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. RECREAR EL TRIGGER
-- ============================================

CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON movimientos
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();

-- ============================================
-- 5. VERIFICAR QUE TODO ESTÉ CORRECTO
-- ============================================

-- Verificar que el trigger se creó
SELECT 
    trigger_name, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_actualizar_stock';

-- ============================================
-- 6. RECALCULAR STOCK ACTUAL (OPCIONAL)
-- ============================================
-- Este paso recalcula el stock existente basándose en los movimientos
-- Solo ejecuta esto si ya tienes datos y el stock está desincronizado

-- Ver stock actual vs movimientos
SELECT 
    m.id,
    m.nombre,
    m.stock_actual as stock_registrado,
    COALESCE(
        SUM(CASE WHEN mov.tipo = 'entrada' THEN mov.cantidad ELSE 0 END) -
        SUM(CASE WHEN mov.tipo = 'salida' THEN mov.cantidad ELSE 0 END),
        0
    ) as stock_calculado
FROM materiales m
LEFT JOIN movimientos mov ON m.id = mov.material_id
GROUP BY m.id, m.nombre, m.stock_actual
ORDER BY m.nombre;

-- Si encuentras diferencias, ejecuta esto para RECALCULAR:
/*
UPDATE materiales m
SET stock_actual = (
    SELECT COALESCE(
        SUM(CASE WHEN mov.tipo = 'entrada' THEN mov.cantidad ELSE 0 END) -
        SUM(CASE WHEN mov.tipo = 'salida' THEN mov.cantidad ELSE 0 END),
        0
    )
    FROM movimientos mov
    WHERE mov.material_id = m.id
);
*/

-- ============================================
-- 7. PRUEBA DEL TRIGGER
-- ============================================
-- Ejecuta estos comandos para probar que funciona:

-- Crear un material de prueba
/*
INSERT INTO materiales (nombre, unidad_principal, stock_actual)
VALUES ('TEST Material', 'unidades', 0)
RETURNING id, nombre, stock_actual;

-- Anota el ID que te devuelve, reemplaza 'ID-DEL-MATERIAL' con ese ID

-- Insertar una entrada (debería sumar 10)
INSERT INTO movimientos (material_id, tipo, cantidad, unidad, fecha_operacion, nota)
VALUES ('ID-DEL-MATERIAL', 'entrada', 10, 'unidades', NOW(), 'Prueba de trigger');

-- Verificar que el stock aumentó
SELECT id, nombre, stock_actual FROM materiales WHERE id = 'ID-DEL-MATERIAL';
-- Debería mostrar stock_actual = 10

-- Insertar una salida (debería restar 3)
INSERT INTO movimientos (material_id, tipo, cantidad, unidad, fecha_operacion, nota)
VALUES ('ID-DEL-MATERIAL', 'salida', 3, 'unidades', NOW(), 'Prueba de salida');

-- Verificar que el stock disminuyó
SELECT id, nombre, stock_actual FROM materiales WHERE id = 'ID-DEL-MATERIAL';
-- Debería mostrar stock_actual = 7

-- Eliminar el material de prueba
DELETE FROM materiales WHERE id = 'ID-DEL-MATERIAL';
*/

-- ============================================
-- RESUMEN DE LO QUE HACE ESTE SCRIPT
-- ============================================
/*
1. Verifica si existen triggers y funciones
2. Elimina triggers antiguos/corruptos
3. Crea la función actualizar_stock() correctamente
4. Crea el trigger que se ejecuta DESPUÉS de cada INSERT en movimientos
5. Provee queries para verificar y recalcular stock si es necesario
6. Incluye pruebas para validar funcionamiento

IMPORTANTE: 
- Ejecuta este script completo en Supabase SQL Editor
- Si ya tienes datos, ejecuta el UPDATE de recalcular stock
- Después de esto, cada nuevo movimiento actualizará el stock automáticamente
*/
