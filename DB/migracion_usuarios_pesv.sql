-- Script de migración para adaptar la tabla usuarios a las necesidades PESV
-- Ejecutar este script para agregar campos específicos para conductores

USE pesv_db;

-- Agregar campos específicos para conductores
ALTER TABLE `usuarios` 
ADD COLUMN `numero_licencia` varchar(20) DEFAULT NULL AFTER `rol`,
ADD COLUMN `categoria_licencia` varchar(10) DEFAULT NULL AFTER `numero_licencia`,
ADD COLUMN `fecha_vencimiento_licencia` date DEFAULT NULL AFTER `categoria_licencia`,
ADD COLUMN `fecha_ingreso_empresa` date DEFAULT NULL AFTER `fecha_vencimiento_licencia`,
ADD COLUMN `estado_capacitacion_pesv` enum('pendiente','en_proceso','completada','vencida') DEFAULT 'pendiente' AFTER `fecha_ingreso_empresa`,
ADD COLUMN `fecha_ultima_capacitacion` date DEFAULT NULL AFTER `estado_capacitacion_pesv`,
ADD COLUMN `fecha_proxima_capacitacion` date DEFAULT NULL AFTER `fecha_ultima_capacitacion`;

-- Agregar índices para mejorar el rendimiento
ALTER TABLE `usuarios` 
ADD UNIQUE KEY `numero_licencia` (`numero_licencia`),
ADD KEY `idx_rol` (`rol`),
ADD KEY `idx_estado_capacitacion` (`estado_capacitacion_pesv`),
ADD KEY `idx_fecha_vencimiento_licencia` (`fecha_vencimiento_licencia`);

-- Actualizar usuarios existentes con rol 'conductor' si no tienen rol asignado
UPDATE `usuarios` 
SET `rol` = 'conductor' 
WHERE `rol` IS NULL OR `rol` = '';

-- Verificar la migración
SELECT 
    'Migración completada' as status,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN rol = 'conductor' THEN 1 END) as conductores,
    COUNT(CASE WHEN rol = 'admin_empresa' THEN 1 END) as admins_empresa,
    COUNT(CASE WHEN rol = 'superadmin' THEN 1 END) as superadmins
FROM `usuarios`;

-- Mostrar estructura final de la tabla
DESCRIBE `usuarios`; 