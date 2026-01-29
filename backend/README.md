# Backend PESV - Sistema de Inspecciones

## 📁 Estructura del Proyecto

### Archivos Principales
- `server.js` - Servidor principal con todos los endpoints
- `package.json` - Dependencias y scripts
- `setup_backend.js` - Script de configuración inicial
- `setup-database.js` - Script de configuración de base de datos

### Scripts de Migración
- `migrate-usuarios-pesv.js` - Migración de usuarios PESV
- `migrate-vehiculos-pesv.js` - Migración de vehículos PESV

### Scripts de Verificación
- `verify-inspecciones-table.js` - Verifica la tabla de inspecciones

### Directorios
- `src/` - Código fuente organizado
  - `config/` - Configuraciones
  - `controllers/` - Controladores
  - `middleware/` - Middlewares
  - `routes/` - Rutas
  - `services/` - Servicios (email, etc.)
  - `templates/` - Plantillas de email
- `config/` - Archivos de configuración

## 🚀 Instalación y Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Crear archivo `.env` con:
```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=pesv_db
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_de_aplicacion
```

3. **Configurar base de datos:**
```bash
node setup-database.js
```

4. **Verificar tabla de inspecciones:**
```bash
node verify-inspecciones-table.js
```

5. **Iniciar servidor:**
```bash
npm run dev
```

## 📋 Endpoints Principales

### Inspecciones
- `POST /api/inspections` - Crear nueva inspección
- `GET /api/admin/inspections` - Listar inspecciones (admin)
- `GET /api/admin/inspections/pending` - Inspecciones pendientes
- `GET /api/admin/inspections/:id` - Detalle de inspección
- `PUT /api/admin/inspections/:id/status` - Aprobar/rechazar inspección

### Usuarios y Empresas
- `POST /api/register-company` - Registrar empresa y admin
- `POST /api/register-driver` - Registrar conductor y vehículo
- `GET /api/conductores` - Listar conductores
- `GET /api/vehiculos` - Listar vehículos

### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/send-verification-code` - Enviar código de verificación
- `POST /api/verify-code-and-update-password` - Cambiar contraseña

## 🔧 Funcionalidades

- ✅ Sistema de inspecciones preoperacionales
- ✅ Generación de PDFs
- ✅ Notificaciones por email
- ✅ Panel de administración
- ✅ Gestión de usuarios y vehículos
- ✅ Sistema de roles (admin, conductor)
- ✅ Recuperación de contraseñas

## 📊 Base de Datos

El sistema usa la tabla `inspecciones_preoperacionales` para almacenar las inspecciones con las siguientes columnas principales:
- `vehiculo_id`, `conductor_id`
- `fecha_inspeccion`, `kilometraje`
- `resultados` (JSON), `pdf_base64`
- `estado` (pendiente/aprobada/rechazada)
- `comentario_admin`, `admin_id` 