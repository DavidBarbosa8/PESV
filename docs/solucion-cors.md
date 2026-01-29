# Solución de Problemas de CORS

## Problema
El error de CORS (Cross-Origin Resource Sharing) ocurre cuando el navegador bloquea las peticiones entre diferentes dominios o puertos por razones de seguridad.

## Error Típico
```
Access to fetch at 'http://localhost:3001/api/inspections' from origin 'http://127.0.0.1:3000' has been blocked by CORS policy
```

## Soluciones Implementadas

### 1. Configuración de CORS en el Backend
El servidor backend está configurado para permitir peticiones desde múltiples orígenes:

```javascript
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://127.0.0.1:3000', 
        'http://localhost:3001', 
        'http://127.0.0.1:3001',
        'http://localhost:8080',
        'http://127.0.0.1:8080'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### 2. Configuración Centralizada
Se creó un archivo de configuración centralizada (`frontend/public/js/config.js`) para manejar las URLs del backend:

```javascript
const CONFIG = {
    BACKEND_URL: 'http://localhost:3000',
    ENDPOINTS: {
        INSPECTIONS: '/api/inspections',
        // ... otros endpoints
    }
};
```

### 3. URLs Corregidas
Todas las URLs en los archivos del frontend han sido actualizadas para usar el puerto correcto (3000).

## Verificación de la Configuración

### 1. Verificar que el Backend esté Corriendo
```bash
cd backend
npm start
```

El servidor debe mostrar:
```
🚀 Servidor corriendo en http://localhost:3000
```

### 2. Usar la Página de Prueba
Abrir `frontend/public/test-connection.html` en el navegador para verificar:
- Conexión básica al backend
- Endpoint de inspecciones
- Configuración de CORS

### 3. Verificar Puertos
- **Backend**: Puerto 3000 (configurado en `backend/server.js`)
- **Frontend**: Puerto 3000 (servido por el backend)

## Solución de Problemas Comunes

### Problema 1: Backend no responde
**Síntomas**: Error de conexión en la página de prueba
**Solución**:
1. Verificar que el servidor esté corriendo
2. Verificar que no haya otro proceso usando el puerto 3000
3. Revisar los logs del servidor

### Problema 2: CORS sigue fallando
**Síntomas**: Error de CORS en la consola del navegador
**Solución**:
1. Verificar que el frontend y backend usen el mismo puerto
2. Limpiar caché del navegador
3. Verificar que la configuración de CORS esté correcta

### Problema 3: URLs incorrectas
**Síntomas**: Errores 404 o de conexión
**Solución**:
1. Verificar que `config.js` tenga la URL correcta
2. Asegurar que todos los archivos usen `getApiUrl()` en lugar de URLs hardcodeadas

## Comandos Útiles

### Reiniciar el Servidor
```bash
cd backend
npm start
```

### Verificar Puertos en Uso (Windows)
```cmd
netstat -ano | findstr :3000
```

### Verificar Puertos en Uso (Linux/Mac)
```bash
lsof -i :3000
```

## Configuración de Desarrollo

### Variables de Entorno
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

### Estructura de Archivos
```
frontend/public/js/
├── config.js          # Configuración centralizada
├── pdf-generator.js   # Generador de PDFs
├── preop_carro.js     # Lógica del formulario de carro
└── preop_moto.js      # Lógica del formulario de moto
```

## Notas Importantes

1. **Siempre usar `getApiUrl()`** en lugar de URLs hardcodeadas
2. **Verificar la configuración de CORS** si se cambia el puerto del backend
3. **Usar la página de prueba** para diagnosticar problemas de conexión
4. **Mantener sincronizados** los puertos del frontend y backend

## Contacto
Si persisten los problemas, revisar:
1. Logs del servidor backend
2. Consola del navegador (F12)
3. Página de prueba de conexión 