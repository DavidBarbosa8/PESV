# Flujo de Envío de PDFs por Correo Electrónico

## Resumen del Nuevo Flujo

Ahora, cuando un conductor complete una inspección preoperacional, el PDF se enviará automáticamente por correo electrónico al administrador de la empresa, en lugar de descargarse localmente.

## Flujo Completo

### 1. Conductor Completa la Inspección
```
Formulario → Captura datos → Genera PDF → Envía al backend
```

### 2. Backend Procesa la Inspección
```
Recibe datos → Guarda en BD → Busca admin → Envía PDF por correo
```

### 3. Administrador Recibe el Correo
```
Correo con PDF adjunto → Revisa documento → Toma decisiones
```

## Configuración Requerida

### Variables de Entorno (.env)
```env
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
```

### Configuración de Gmail
1. **Habilitar verificación en dos pasos**
2. **Generar contraseña de aplicación**
3. **Usar contraseña de aplicación en lugar de contraseña normal**

## Estructura del Correo

### Asunto
```
Inspección Preoperacional - [PLACA] - [NOMBRE_CONDUCTOR]
```

### Contenido
- 📋 Detalles de la inspección
- 📊 Información del vehículo y conductor
- 📎 PDF adjunto con nombre: `inspeccion-[PLACA]-[FECHA].pdf`
- 💬 Observaciones del conductor (si las hay)
- 🔗 Enlace al sistema administrativo

### Archivo Adjunto
- **Nombre**: `inspeccion-ABC123-2024-01-15.pdf`
- **Contenido**: PDF completo de la inspección preoperacional
- **Formato**: PDF estándar con todos los datos del formulario

## Ventajas del Nuevo Sistema

### ✅ Para el Administrador
- Recibe automáticamente todos los PDFs
- No necesita estar en el sistema para ver las inspecciones
- Puede revisar documentos offline
- Mantiene un historial en su correo

### ✅ Para el Conductor
- No necesita descargar archivos
- Proceso más simple y directo
- Confirmación inmediata de envío

### ✅ Para la Empresa
- Cumplimiento de normativas
- Trazabilidad completa
- Archivo automático de documentos

## Configuración del Servidor

### Verificación de Configuración
El servidor verifica automáticamente la configuración del correo al iniciar:

```javascript
emailService.verifyConnection().then(isConfigured => {
    if (!isConfigured) {
        console.warn('⚠️ El servicio de correo no está configurado correctamente');
    }
});
```

### Logs del Sistema
- ✅ `PDF enviado por correo a: admin@empresa.com`
- ❌ `Error al enviar PDF por correo`
- ⚠️ `No se encontró información del administrador`

## Manejo de Errores

### Si el correo no se envía:
1. La inspección se guarda correctamente en la BD
2. Se muestra un mensaje de advertencia al usuario
3. El administrador puede ver la inspección en el sistema web

### Si no hay administrador configurado:
1. Se muestra un warning en los logs
2. La inspección se guarda normalmente
3. Se puede revisar manualmente en el sistema

## Pruebas

### Para probar el sistema:
1. Configura las variables de entorno
2. Completa una inspección preoperacional
3. Verifica que el administrador reciba el correo
4. Revisa que el PDF esté adjunto correctamente

### Archivos de prueba disponibles:
- `frontend/public/debug-pdf.html` - Prueba generación de PDF
- `frontend/public/test-simple.html` - Prueba carga de scripts

## Seguridad

### Credenciales
- Nunca subir credenciales reales al repositorio
- Usar contraseñas de aplicación para Gmail
- Mantener las variables de entorno seguras

### Datos
- Los PDFs se envían por correo seguro (Gmail con SSL)
- Los datos se almacenan encriptados en la BD
- Solo el administrador autorizado recibe los documentos 