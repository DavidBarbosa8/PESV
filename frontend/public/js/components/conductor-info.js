// Componente para mostrar información del conductor
class ConductorInfo {
    constructor(containerId, conductorService) {
        this.container = document.getElementById(containerId);
        this.conductorService = conductorService;
        this.conductor = null;
        this.vehiculos = [];
    }

    // Renderizar información del conductor
    render(conductor, vehiculos = []) {
        this.conductor = conductor;
        this.vehiculos = vehiculos;

        if (!this.container) {
            console.error('Contenedor no encontrado:', containerId);
            return;
        }

        const stats = this.conductorService.getEstadisticasConductor(conductor);
        
        this.container.innerHTML = `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 class="text-lg font-semibold text-blue-800 mb-3">Información del Conductor</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Información básica -->
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-700">Nombre:</span>
                            <span class="text-gray-900">${conductor.nombre}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-700">Identificación:</span>
                            <span class="text-gray-900">${conductor.identificacion}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-700">Licencia:</span>
                            <span class="text-gray-900">${conductor.numero_licencia} (${conductor.categoria_licencia})</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="font-medium text-gray-700">Ingreso:</span>
                            <span class="text-gray-900">${conductor.fecha_ingreso_empresa ? new Date(conductor.fecha_ingreso_empresa).toLocaleDateString() : 'No registrado'}</span>
                        </div>
                    </div>

                    <!-- Estado de validaciones -->
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-700">Estado Licencia:</span>
                            <span class="px-2 py-1 rounded text-sm font-medium ${stats.licencia.valida ? (stats.licencia.advertencia ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800') : 'bg-red-100 text-red-800'}">
                                ${stats.licencia.valida ? '✓' : '✗'} ${stats.licencia.mensaje}
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-700">Capacitación PESV:</span>
                            <span class="px-2 py-1 rounded text-sm font-medium ${stats.capacitacion.valida ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${stats.capacitacion.valida ? '✓' : '✗'} ${stats.capacitacion.mensaje}
                            </span>
                        </div>
                    </div>
                </div>

                ${this.renderVehiculos()}
            </div>
        `;

        // Agregar eventos para selección de vehículo
        this.addVehiculoEvents();
    }

    // Renderizar lista de vehículos
    renderVehiculos() {
        if (!this.vehiculos || this.vehiculos.length === 0) {
            return `
                <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p class="text-yellow-800 text-sm">No hay vehículos asignados a este conductor.</p>
                </div>
            `;
        }

        return `
            <div class="mt-4">
                <h4 class="font-medium text-blue-800 mb-2">Vehículos Asignados:</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${this.vehiculos.map(vehiculo => `
                        <div class="border border-gray-200 rounded p-3 hover:bg-gray-50 cursor-pointer vehiculo-item" data-vehiculo-id="${vehiculo.id}">
                            <div class="flex justify-between items-center">
                                <div>
                                    <span class="font-medium text-gray-900">${vehiculo.placa}</span>
                                    <span class="text-sm text-gray-600 ml-2">${vehiculo.marca} ${vehiculo.modelo}</span>
                                </div>
                                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${vehiculo.tipo_vehiculo}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Agregar eventos para selección de vehículo
    addVehiculoEvents() {
        const vehiculoItems = this.container.querySelectorAll('.vehiculo-item');
        
        vehiculoItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remover selección previa
                vehiculoItems.forEach(i => i.classList.remove('ring-2', 'ring-blue-500'));
                
                // Seleccionar el actual
                item.classList.add('ring-2', 'ring-blue-500');
                
                // Obtener datos del vehículo
                const vehiculoId = item.dataset.vehiculoId;
                const vehiculo = this.vehiculos.find(v => v.id == vehiculoId);
                
                if (vehiculo) {
                    this.onVehiculoSelected(vehiculo);
                }
            });
        });
    }

    // Callback cuando se selecciona un vehículo
    onVehiculoSelected(vehiculo) {
        // Llenar automáticamente los campos del formulario
        const placaInput = document.getElementById('placa');
        if (placaInput) {
            placaInput.value = vehiculo.placa;
        }

        // Disparar evento personalizado
        const event = new CustomEvent('vehiculoSelected', {
            detail: { vehiculo, conductor: this.conductor }
        });
        document.dispatchEvent(event);
    }

    // Mostrar alertas de validación
    showAlertas() {
        const stats = this.conductorService.getEstadisticasConductor(this.conductor);
        const alertas = [];

        if (!stats.licencia.valida) {
            alertas.push(`⚠️ ${stats.licencia.mensaje}`);
        } else if (stats.licencia.advertencia) {
            alertas.push(`⚠️ ${stats.licencia.mensaje}`);
        }

        if (!stats.capacitacion.valida) {
            alertas.push(`⚠️ ${stats.capacitacion.mensaje}`);
        }

        if (alertas.length > 0) {
            this.mostrarModalAlertas(alertas);
        }
    }

    // Mostrar modal de alertas
    mostrarModalAlertas(alertas) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const modalContent = `
            <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                <h3 class="text-xl font-bold text-yellow-600 mb-4">⚠️ Alertas del Conductor</h3>
                <div class="mb-4">
                    <p class="text-gray-700 mb-2">Se han detectado las siguientes alertas:</p>
                    <ul class="list-disc list-inside text-gray-600 mb-4">
                        ${alertas.map(alerta => `<li>${alerta}</li>`).join('')}
                    </ul>
                    <p class="text-gray-700">¿Desea continuar con la inspección?</p>
                </div>
                <div class="flex justify-end space-x-4">
                    <button id="cancel-inspection" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        Cancelar
                    </button>
                    <button id="continue-inspection" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Continuar
                    </button>
                </div>
            </div>
        `;
        
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);

        // Eventos del modal
        document.getElementById('cancel-inspection').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.getElementById('continue-inspection').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    // Limpiar información
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.conductor = null;
        this.vehiculos = [];
    }
}

// Exportar para uso global
window.ConductorInfo = ConductorInfo; 