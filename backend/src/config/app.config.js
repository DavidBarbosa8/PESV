/**
 * Configuración de la aplicación
 */

const config = {
    // URL base de la aplicación
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    
    // URLs específicas
    urls: {
        adminInspections: '/admin/inspections.html',
        adminInspectionDetail: (id) => `/admin/inspections/${id}`,
        dashboard: '/dashboard.html'
    },
    
    // Configuración de email
    email: {
        from: process.env.EMAIL_USER,
        templates: {
            inspectionNotification: true,
            statusUpdate: true
        }
    },
    
    // Configuración de la base de datos
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pesv_db'
    }
};

module.exports = config; 