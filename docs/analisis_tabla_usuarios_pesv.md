# Análisis de la Tabla `usuarios` para Sistema PESV

## 📋 Resumen Ejecutivo

La tabla `usuarios` actual del sistema PESV necesita ser adaptada para cumplir con los requisitos específicos de gestión de conductores y cumplimiento normativo. Este documento presenta el análisis completo y las recomendaciones de mejora.

## 🔍 Estado Actual

### Estructura Actual de la Tabla `usuarios`:

```sql
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('superadmin','admin_empresa','conductor') NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `empresa_id` int NOT NULL
)
```

### Problemas Identificados:

1. **Falta información específica para conductores**
2. **No hay seguimiento de licencias de conducción**
3. **Ausencia de control de capacitación PESV**
4. **Falta de fechas importantes para cumplimiento normativo**

## 🎯 Propuesta de Mejora

### Campos Adicionales para Conductores:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `numero_licencia` | varchar(20) | Número de licencia de conducción | Sí |
| `categoria_licencia` | varchar(10) | Categoría de la licencia (A1, B1, C1, etc.) | Sí |
| `fecha_vencimiento_licencia` | date | Fecha de vencimiento de la licencia | Sí |
| `fecha_ingreso_empresa` | date | Fecha de ingreso del conductor a la empresa | Sí |
| `estado_capacitacion_pesv` | enum | Estado de la capacitación PESV | Sí |
| `fecha_ultima_capacitacion` | date | Fecha de la última capacitación PESV | No |
| `fecha_proxima_capacitacion` | date | Fecha de la próxima capacitación PESV | No |

### Estados de Capacitación PESV:

- `pendiente`: Conductor sin capacitación inicial
- `en_proceso`: Capacitación en curso
- `completada`: Capacitación vigente
- `vencida`: Capacitación vencida, requiere renovación

## 🔧 Implementación

### 1. Script de Migración

Se ha creado el archivo `DB/migracion_usuarios_pesv.sql` que:

- Agrega los nuevos campos a la tabla existente
- Crea índices para optimizar consultas
- Actualiza usuarios existentes con rol 'conductor'
- Verifica la migración

### 2. Script de Datos de Prueba Mejorado

Se ha creado `backend/insert-test-data-mejorado.js` que:

- Crea conductores con información PESV completa
- Incluye fechas realistas para licencias y capacitaciones
- Proporciona datos de prueba más realistas

### 3. Estructura Final Propuesta

```sql
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('superadmin','admin_empresa','conductor') NOT NULL,
  
  -- Campos específicos para conductores
  `numero_licencia` varchar(20) DEFAULT NULL,
  `categoria_licencia` varchar(10) DEFAULT NULL,
  `fecha_vencimiento_licencia` date DEFAULT NULL,
  `fecha_ingreso_empresa` date DEFAULT NULL,
  `estado_capacitacion_pesv` enum('pendiente','en_proceso','completada','vencida') DEFAULT 'pendiente',
  `fecha_ultima_capacitacion` date DEFAULT NULL,
  `fecha_proxima_capacitacion` date DEFAULT NULL,
  
  -- Campos generales
  `estado` tinyint(1) DEFAULT '1',
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `empresa_id` int NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `identificacion` (`identificacion`),
  UNIQUE KEY `numero_licencia` (`numero_licencia`),
  KEY `fk_usuarios_empresa` (`empresa_id`),
  KEY `idx_rol` (`rol`),
  KEY `idx_estado_capacitacion` (`estado_capacitacion_pesv`),
  KEY `idx_fecha_vencimiento_licencia` (`fecha_vencimiento_licencia`)
)
```

## 📊 Beneficios de la Adaptación

### 1. Cumplimiento Normativo
- Seguimiento de licencias de conducción
- Control de capacitaciones PESV obligatorias
- Alertas de vencimientos próximos

### 2. Gestión Operativa
- Información completa de conductores en una sola tabla
- Consultas optimizadas con índices específicos
- Trazabilidad de fechas importantes

### 3. Reportes y Analytics
- Reportes de conductores con licencias vencidas
- Seguimiento de capacitaciones PESV
- Estadísticas de cumplimiento por empresa

## 🚀 Pasos para Implementar

### Paso 1: Ejecutar Migración
```bash
mysql -u [usuario] -p pesv_db < DB/migracion_usuarios_pesv.sql
```

### Paso 2: Insertar Datos de Prueba
```bash
cd backend
node insert-test-data-mejorado.js
```

### Paso 3: Verificar Implementación
- Revisar que los nuevos campos estén disponibles
- Confirmar que los datos de prueba se insertaron correctamente
- Probar formularios de inspección con los nuevos datos

## 🔍 Consultas Útiles

### Conductores con Licencias por Vencer (30 días)
```sql
SELECT nombre, numero_licencia, fecha_vencimiento_licencia 
FROM usuarios 
WHERE rol = 'conductor' 
AND fecha_vencimiento_licencia <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
AND fecha_vencimiento_licencia >= CURDATE();
```

### Conductores con Capacitación PESV Vencida
```sql
SELECT nombre, estado_capacitacion_pesv, fecha_proxima_capacitacion 
FROM usuarios 
WHERE rol = 'conductor' 
AND estado_capacitacion_pesv = 'vencida';
```

### Estadísticas por Empresa
```sql
SELECT 
    e.nombre as empresa,
    COUNT(CASE WHEN u.rol = 'conductor' THEN 1 END) as total_conductores,
    COUNT(CASE WHEN u.estado_capacitacion_pesv = 'completada' THEN 1 END) as capacitados,
    COUNT(CASE WHEN u.fecha_vencimiento_licencia <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as licencias_por_vencer
FROM empresa e
LEFT JOIN usuarios u ON e.empresa_id = u.empresa_id
GROUP BY e.empresa_id, e.nombre;
```

## 📝 Notas Importantes

1. **Compatibilidad**: La migración es compatible con la estructura actual
2. **Datos Existentes**: Los usuarios existentes mantendrán su información
3. **Rendimiento**: Los nuevos índices mejorarán el rendimiento de consultas
4. **Seguridad**: Se mantienen las restricciones de integridad referencial

## 🎯 Próximos Pasos

1. Implementar la migración en el entorno de desarrollo
2. Actualizar los formularios frontend para usar los nuevos campos
3. Crear reportes y dashboards con la nueva información
4. Implementar alertas automáticas para vencimientos
5. Documentar las nuevas funcionalidades para usuarios finales 