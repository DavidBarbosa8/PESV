# Solución del Error 500 (Internal Server Error)

## Problema
El servidor está devolviendo un error 500 (Internal Server Error) cuando se intenta enviar una inspección.

## Diagnóstico

### 1. Verificar la Base de Datos
Ejecuta el script de verificación para diagnosticar problemas:

```bash
cd backend
node check-database.js
```

Este script verificará:
- Conexión a la base de datos
- Estructura de las tablas
- Existencia de datos mínimos

### 2. Insertar Datos de Prueba
Si no hay datos en la base de datos, ejecuta:

```bash
cd backend
node insert-test-data.js
```

Este script insertará:
- 1 empresa de prueba
- 1 administrador (admin@empresaprueba.com / admin123)
- 1 conductor (conductor@empresaprueba.com / conductor123)
- 1 carro (ABC123)
- 1 moto (XYZ789)

### 3. Usar la Página de Prueba
Abre `http://localhost:3000/test-inspection.html` para:
- Verificar conexión al servidor
- Probar endpoints individualmente
- Ver errores específicos

## Soluciones Implementadas

### 1. Corrección del Nombre de la Tabla
- **Problema**: El código intentaba insertar en `inspecciones_preoperacionales`
- **Solución**: Corregido para usar `inspecciones` (nombre real de la tabla)

### 2. Mejora del Manejo de Errores
- Agregados logs detallados
- Validación de datos requeridos
- Manejo robusto de errores de email

### 3. Estructura de Datos Corregida
La tabla `inspecciones` tiene esta estructura:
```sql
- id (AUTO_INCREMENT)
- usuario_id (conductor)
- vehiculo_id
- fecha
- kilometraje
- observaciones (JSON con datos adicionales)
```

## Pasos para Solucionar

### Paso 1: Verificar el Servidor
```bash
cd backend
npm start
```

Verifica que aparezca:
```
🚀 Servidor corriendo en http://localhost:3000
✅ Conectado a la base de datos MySQL
```

### Paso 2: Verificar la Base de Datos
```bash
node check-database.js
```

### Paso 3: Insertar Datos de Prueba (si es necesario)
```bash
node insert-test-data.js
```

### Paso 4: Probar el Endpoint
1. Abre `http://localhost:3000/test-inspection.html`
2. Haz clic en "Probar Endpoint de Inspecciones"
3. Verifica que no haya errores

### Paso 5: Probar Formularios
1. Abre `http://localhost:3000/preoperacional_carro.html`
2. Completa el formulario
3. Envía la inspección

## Errores Comunes y Soluciones

### Error: "Table doesn't exist"
**Solución**: Ejecutar los scripts SQL de la carpeta `DB/`

### Error: "Column doesn't exist"
**Solución**: Verificar que la estructura de la tabla coincida con el código

### Error: "Foreign key constraint fails"
**Solución**: Asegurar que existan los registros referenciados (usuario, vehículo)

### Error: "Connection refused"
**Solución**: Verificar que MySQL esté corriendo y las credenciales sean correctas

## Configuración de Variables de Entorno

Crear archivo `.env` en la carpeta `backend`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=DavidB
DB_PASSWORD=
DB_NAME=pesv_db
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
```

## Logs del Servidor

El servidor ahora incluye logs detallados:
- `📝 Recibiendo nueva inspección`: Datos recibidos
- `🔍 Ejecutando query`: Parámetros de la consulta
- `✅ Inspección guardada`: Confirmación de éxito
- `❌ Error`: Detalles del error

## Verificación Final

1. **Servidor corriendo**: `http://localhost:3000/api/health`
2. **Base de datos conectada**: Logs del servidor
3. **Datos de prueba**: Script de verificación
4. **Endpoint funcionando**: Página de prueba
5. **Formularios funcionando**: Envío de inspecciones

## Contacto
Si persisten los problemas:
1. Revisar logs del servidor
2. Verificar consola del navegador (F12)
3. Usar la página de prueba para diagnóstico
4. Ejecutar scripts de verificación 