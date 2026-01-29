-- Script de migración para mejorar la tabla vehiculos para PESV
-- Ejecutar este script para agregar campos específicos para gestión PESV

USE pesv_db;

-- Agregar campos específicos para PESV
ALTER TABLE `vehiculos` 
ADD COLUMN `empresa_id` int DEFAULT NULL AFTER `usuario_id`,
ADD COLUMN `anio` int DEFAULT NULL AFTER `modelo`,
ADD COLUMN `color` varchar(30) DEFAULT NULL AFTER `anio`,
ADD COLUMN `numero_motor` varchar(50) DEFAULT NULL AFTER `color`,
ADD COLUMN `numero_chasis` varchar(50) DEFAULT NULL AFTER `numero_motor`,
ADD COLUMN `cilindraje` varchar(20) DEFAULT NULL AFTER `numero_chasis`,
ADD COLUMN `capacidad_pasajeros` int DEFAULT NULL AFTER `cilindraje`,
ADD COLUMN `capacidad_carga` decimal(8,2) DEFAULT NULL AFTER `capacidad_pasajeros`,
ADD COLUMN `fecha_adquisicion` date DEFAULT NULL AFTER `capacidad_carga`,
ADD COLUMN `fecha_ultimo_mantenimiento` date DEFAULT NULL AFTER `fecha_adquisicion`,
ADD COLUMN `proximo_mantenimiento` date DEFAULT NULL AFTER `fecha_ultimo_mantenimiento`,
ADD COLUMN `estado_tecnomecanica` enum('vigente','por_vencer','vencida','no_aplica') DEFAULT 'no_aplica' AFTER `proximo_mantenimiento`,
ADD COLUMN `fecha_vencimiento_tecnomecanica` date DEFAULT NULL AFTER `estado_tecnomecanica`,
ADD COLUMN `estado_soat` enum('vigente','por_vencer','vencido','no_aplica') DEFAULT 'no_aplica' AFTER `fecha_vencimiento_tecnomecanica`,
ADD COLUMN `fecha_vencimiento_soat` date DEFAULT NULL AFTER `estado_soat`,
ADD COLUMN `estado_seguro` enum('vigente','por_vencer','vencido','no_aplica') DEFAULT 'no_aplica' AFTER `fecha_vencimiento_soat`,
ADD COLUMN `fecha_vencimiento_seguro` date DEFAULT NULL AFTER `estado_seguro`,
ADD COLUMN `kilometraje_actual` decimal(10,2) DEFAULT '0.00' AFTER `fecha_vencimiento_seguro`,
ADD COLUMN `ultima_inspeccion` date DEFAULT NULL AFTER `kilometraje_actual`,
ADD COLUMN `observaciones` text DEFAULT NULL AFTER `ultima_inspeccion`,
ADD COLUMN `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP AFTER `observaciones`,
ADD COLUMN `actualizado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `creado_en`;

-- Agregar índices para mejorar rendimiento
ALTER TABLE `vehiculos` 
ADD INDEX `idx_empresa_id` (`empresa_id`),
ADD INDEX `idx_tipo_vehiculo` (`tipo_vehiculo`),
ADD INDEX `idx_activo` (`activo`),
ADD INDEX `idx_estado_tecnomecanica` (`estado_tecnomecanica`),
ADD INDEX `idx_estado_soat` (`estado_soat`),
ADD INDEX `idx_fecha_vencimiento_tecnomecanica` (`fecha_vencimiento_tecnomecanica`),
ADD INDEX `idx_fecha_vencimiento_soat` (`fecha_vencimiento_soat`);

-- Agregar foreign key para empresa_id
ALTER TABLE `vehiculos` 
ADD CONSTRAINT `fk_vehiculos_empresa` 
FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`empresa_id`) ON DELETE SET NULL;

-- Limpiar campos redundantes (opcional - comentar si se quiere mantener compatibilidad)
-- ALTER TABLE `vehiculos` DROP COLUMN `empresa`;
-- ALTER TABLE `vehiculos` DROP COLUMN `conductor`;
-- ALTER TABLE `vehiculos` DROP COLUMN `tipo`;

-- Comentarios sobre la estructura mejorada
-- La tabla vehiculos ahora incluye:
-- 1. Información básica del vehículo (año, color, motor, chasis)
-- 2. Capacidades (pasajeros, carga)
-- 3. Fechas de mantenimiento
-- 4. Estados de documentación (tecnomecánica, SOAT, seguro)
-- 5. Información de kilometraje e inspecciones
-- 6. Trazabilidad temporal (creado_en, actualizado_en)

SELECT 'Migración de tabla vehiculos completada exitosamente' as resultado; 