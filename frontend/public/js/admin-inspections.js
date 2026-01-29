/**
 * Admin Inspections JavaScript
 * Funcionalidad para el panel de administración de inspecciones
 */

const BACKEND_URL = 'http://localhost:3000';
let currentInspections = [];
let currentAdminId = 1; // TODO: Obtener del sistema de autenticación

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

function initializeAdminPanel() {
    // Cargar inspecciones al iniciar
    loadAllInspections();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Verificar conexión
    checkConnection();
    
    // Verificar si hay una inspección específica para abrir
    checkForSpecificInspection();
}

function checkForSpecificInspection() {
    const urlParams = new URLSearchParams(window.location.search);
    const inspectionId = urlParams.get('inspection_id');
    
    if (inspectionId) {
        console.log('🔍 Abriendo inspección específica:', inspectionId);
        // Esperar un poco para que se carguen las inspecciones
        setTimeout(() => {
            viewInspection(inspectionId);
            // Limpiar el parámetro de la URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }, 1000);
    }
}

function setupEventListeners() {
    // Filtros
    document.getElementById('filterStatus')?.addEventListener('change', applyFilters);
    document.getElementById('filterDateStart')?.addEventListener('change', applyFilters);
    document.getElementById('filterDateEnd')?.addEventListener('change', applyFilters);
    
    // Botones de acción
    document.getElementById('updateBtn')?.addEventListener('click', loadAllInspections);
}

// ===== FUNCIONES DE CARGA DE DATOS =====

async function loadAllInspections() {
    try {
        showAlert('Cargando inspecciones...', 'info');
        const response = await fetch(`${BACKEND_URL}/api/admin/inspections`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const inspections = await response.json();
        currentInspections = inspections;
        displayInspections(inspections);
        updateStatistics(inspections);
        updateLastUpdateTime();
        updateConnectionStatus(true);
        
        showAlert(`${inspections.length} inspecciones cargadas`, 'success');
    } catch (error) {
        console.error('Error al cargar inspecciones:', error);
        showAlert('Error al cargar las inspecciones: ' + error.message, 'error');
        updateConnectionStatus(false);
    }
}

async function loadPendingInspections() {
    try {
        showAlert('Cargando inspecciones pendientes...', 'info');
        const response = await fetch(`${BACKEND_URL}/api/admin/inspections/pending`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const inspections = await response.json();
        currentInspections = inspections;
        displayInspections(inspections);
        updateStatistics(inspections);
        updateLastUpdateTime();
        
        showAlert(`${inspections.length} inspecciones pendientes cargadas`, 'success');
    } catch (error) {
        console.error('Error al cargar inspecciones pendientes:', error);
        showAlert('Error al cargar las inspecciones pendientes: ' + error.message, 'error');
    }
}

// ===== FUNCIONES DE VISUALIZACIÓN =====

function displayInspections(inspections) {
    const tbody = document.getElementById('inspectionsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (inspections.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <i class="fas fa-inbox text-4xl mb-2"></i>
                        <p class="text-lg">No hay inspecciones para mostrar</p>
                        <p class="text-sm">Las inspecciones aparecerán aquí cuando los conductores las envíen</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    inspections.forEach(inspection => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        
        const statusClass = getStatusClass(inspection.estado);
        const statusText = getStatusText(inspection.estado);
        const statusIcon = getStatusIcon(inspection.estado);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #${inspection.id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(inspection.fecha_inspeccion)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center">
                    <i class="fas fa-car mr-2 text-gray-400"></i>
                    ${inspection.placa}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center">
                    <i class="fas fa-user mr-2 text-gray-400"></i>
                    ${inspection.conductor_nombre}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="capitalize">${inspection.tipo_vehiculo}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusIcon} ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="viewInspection(${inspection.id})" 
                            class="text-blue-600 hover:text-blue-900 transition-colors" 
                            title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${inspection.estado === 'pendiente' ? `
                        <button onclick="approveInspection(${inspection.id})" 
                                class="text-green-600 hover:text-green-900 transition-colors" 
                                title="Aprobar">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="rejectInspection(${inspection.id})" 
                                class="text-red-600 hover:text-red-900 transition-colors" 
                                title="Rechazar">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function updateStatistics(inspections) {
    const pending = inspections.filter(i => i.estado === 'pendiente').length;
    const approved = inspections.filter(i => i.estado === 'aprobada').length;
    const rejected = inspections.filter(i => i.estado === 'rechazada').length;
    const total = inspections.length;

    const pendingElement = document.getElementById('pendingCount');
    const approvedElement = document.getElementById('approvedCount');
    const rejectedElement = document.getElementById('rejectedCount');
    const totalElement = document.getElementById('totalCount');

    if (pendingElement) pendingElement.textContent = pending;
    if (approvedElement) approvedElement.textContent = approved;
    if (rejectedElement) rejectedElement.textContent = rejected;
    if (totalElement) totalElement.textContent = total;
}

// ===== FUNCIONES DE ESTADO =====

function getStatusClass(status) {
    switch (status) {
        case 'pendiente': return 'bg-yellow-100 text-yellow-800';
        case 'aprobada': return 'bg-green-100 text-green-800';
        case 'rechazada': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'pendiente': return 'Pendiente';
        case 'aprobada': return 'Aprobada';
        case 'rechazada': return 'Rechazada';
        default: return status;
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'pendiente': return '⏳';
        case 'aprobada': return '✅';
        case 'rechazada': return '❌';
        default: return '❓';
    }
}

// ===== FUNCIONES DE ACCIÓN =====

async function viewInspection(id) {
    try {
        showAlert('Cargando detalles...', 'info');
        const response = await fetch(`${BACKEND_URL}/api/admin/inspections/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Inspección no encontrada');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const inspection = await response.json();
        showInspectionModal(inspection);
        showAlert('Detalles cargados', 'success');
    } catch (error) {
        console.error('Error al cargar la inspección:', error);
        showAlert('Error al cargar la inspección: ' + error.message, 'error');
        
        // Si la inspección no existe, mostrar mensaje específico
        if (error.message.includes('no encontrada')) {
            showAlert('La inspección solicitada no existe o ha sido eliminada', 'warning');
        }
    }
}

async function approveInspection(id) {
    if (!confirm('¿Estás seguro de que quieres aprobar esta inspección?')) return;
    
    const comentario = prompt('Comentario de aprobación (opcional):') || null;
    
    try {
        showAlert('Aprobando inspección...', 'info');
        const response = await fetch(`${BACKEND_URL}/api/admin/inspections/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: 'aprobada',
                comentario_admin: comentario,
                admin_id: currentAdminId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        showAlert('Inspección aprobada exitosamente', 'success');
        closeInspectionModal();
        loadAllInspections();
    } catch (error) {
        console.error('Error al aprobar la inspección:', error);
        showAlert('Error al aprobar la inspección: ' + error.message, 'error');
    }
}

async function rejectInspection(id) {
    if (!confirm('¿Estás seguro de que quieres rechazar esta inspección?')) return;
    
    const comentario = prompt('Motivo del rechazo (requerido):');
    if (!comentario) {
        showAlert('Debes proporcionar un motivo para el rechazo', 'warning');
        return;
    }
    
    try {
        showAlert('Rechazando inspección...', 'info');
        const response = await fetch(`${BACKEND_URL}/api/admin/inspections/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: 'rechazada',
                comentario_admin: comentario,
                admin_id: currentAdminId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        showAlert('Inspección rechazada exitosamente', 'success');
        closeInspectionModal();
        loadAllInspections();
    } catch (error) {
        console.error('Error al rechazar la inspección:', error);
        showAlert('Error al rechazar la inspección: ' + error.message, 'error');
    }
}

// ===== FUNCIONES DE UTILIDAD =====

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateLastUpdateTime() {
    const now = new Date();
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `Última actualización: ${now.toLocaleTimeString()}`;
    }
}

function updateConnectionStatus(isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.textContent = isConnected ? 'Conectado' : 'Desconectado';
        statusElement.className = isConnected ? 'text-green-600' : 'text-red-600';
    }
}

async function checkConnection() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        updateConnectionStatus(response.ok);
    } catch (error) {
        updateConnectionStatus(false);
    }
}

function applyFilters() {
    const status = document.getElementById('filterStatus')?.value || '';
    const dateStart = document.getElementById('filterDateStart')?.value || '';
    const dateEnd = document.getElementById('filterDateEnd')?.value || '';
    
    let filtered = currentInspections;
    
    if (status) {
        filtered = filtered.filter(i => i.estado === status);
    }
    
    if (dateStart) {
        filtered = filtered.filter(i => i.fecha_inspeccion >= dateStart);
    }
    
    if (dateEnd) {
        filtered = filtered.filter(i => i.fecha_inspeccion <= dateEnd);
    }
    
    displayInspections(filtered);
    showAlert(`${filtered.length} inspecciones filtradas`, 'info');
}

// ===== FUNCIONES DE MODAL =====

function showInspectionModal(inspection) {
    const modal = document.getElementById('inspectionModal');
    const content = document.getElementById('inspectionModalContent');
    
    if (!modal || !content) return;
    
    content.innerHTML = generateInspectionModalContent(inspection);
    modal.classList.remove('hidden');
}

function closeInspectionModal() {
    const modal = document.getElementById('inspectionModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function generateInspectionModalContent(inspection) {
    const statusClass = getStatusClass(inspection.estado);
    const statusText = getStatusText(inspection.estado);
    
    return `
        <div class="space-y-6">
            <!-- Información básica -->
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">ID de Inspección</label>
                    <p class="mt-1 text-sm text-gray-900">#${inspection.id}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Fecha</label>
                    <p class="mt-1 text-sm text-gray-900">${formatDate(inspection.fecha_inspeccion)}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Vehículo</label>
                    <p class="mt-1 text-sm text-gray-900">${inspection.placa}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Conductor</label>
                    <p class="mt-1 text-sm text-gray-900">${inspection.conductor_nombre}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Tipo de Vehículo</label>
                    <p class="mt-1 text-sm text-gray-900 capitalize">${inspection.tipo_vehiculo}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Kilometraje</label>
                    <p class="mt-1 text-sm text-gray-900">${inspection.kilometraje} km</p>
                </div>
            </div>

            <!-- Estado actual -->
            <div>
                <label class="block text-sm font-medium text-gray-700">Estado Actual</label>
                <span class="mt-1 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${getStatusIcon(inspection.estado)} ${statusText}
                </span>
            </div>

            <!-- Observaciones -->
            ${inspection.observaciones ? `
            <div>
                <label class="block text-sm font-medium text-gray-700">Observaciones del Conductor</label>
                <p class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">${inspection.observaciones}</p>
            </div>
            ` : ''}

            <!-- PDF -->
            ${inspection.pdf_base64 ? `
            <div>
                <label class="block text-sm font-medium text-gray-700">PDF de la Inspección</label>
                <div class="mt-2">
                    <iframe src="data:application/pdf;base64,${inspection.pdf_base64}" 
                            width="100%" height="500" style="border: 1px solid #ddd; border-radius: 4px;">
                    </iframe>
                </div>
            </div>
            ` : '<p class="text-gray-500">No hay PDF disponible</p>'}

            <!-- Acciones para inspecciones pendientes -->
            ${inspection.estado === 'pendiente' ? `
            <div class="border-t pt-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">Acciones</h4>
                <div class="flex space-x-4">
                    <button onclick="approveInspection(${inspection.id})" 
                            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                        <i class="fas fa-check mr-2"></i>Aprobar Inspección
                    </button>
                    <button onclick="rejectInspection(${inspection.id})" 
                            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                        <i class="fas fa-times mr-2"></i>Rechazar Inspección
                    </button>
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// ===== SISTEMA DE ALERTAS =====

function showAlert(message, type = 'info') {
    // Crear elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <div class="ml-auto pl-3">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

// Exportar funciones para uso global
window.loadAllInspections = loadAllInspections;
window.loadPendingInspections = loadPendingInspections;
window.viewInspection = viewInspection;
window.approveInspection = approveInspection;
window.rejectInspection = rejectInspection;
window.closeInspectionModal = closeInspectionModal;
window.applyFilters = applyFilters;
window.showAlert = showAlert; 