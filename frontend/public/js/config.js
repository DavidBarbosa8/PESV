// Configuración centralizada para las URLs del backend
const CONFIG = {
    // URL del backend - cambiar según el entorno
    BACKEND_URL: 'http://localhost:3000',
    
    // Endpoints de la API
    ENDPOINTS: {
        INSPECTIONS: '/api/inspections',
        LOGIN: '/api/login',
        REGISTER_COMPANY: '/api/register-company',
        REGISTER_DRIVER: '/api/register-driver',
        CHECK_TABLE: '/api/check-table'
    },
    
    // Configuración de la aplicación
    APP: {
        NAME: 'Sistema PESV',
        VERSION: '1.0.0'
    }
};

// Función para obtener la URL completa de un endpoint
function getApiUrl(endpoint) {
    return CONFIG.BACKEND_URL + endpoint;
}

// Función para hacer peticiones a la API
async function apiRequest(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        credentials: 'include'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en petición API:', error);
        throw error;
    }
}

// Exportar configuración para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiUrl, apiRequest };
} else {
    // Para uso en navegador
    window.CONFIG = CONFIG;
    window.getApiUrl = getApiUrl;
    window.apiRequest = apiRequest;
} 