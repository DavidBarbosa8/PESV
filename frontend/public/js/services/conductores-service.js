// Servicio para manejar datos de conductores y vehículos
class ConductoresService {
    constructor() {
        this.baseUrl = getApiUrl('/api');
    }

    // Obtener todos los conductores
    async getConductores() {
        try {
            const response = await fetch(`${this.baseUrl}/conductores`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener conductores:', error);
            throw error;
        }
    }

    // Obtener un conductor específico por ID
    async getConductor(id) {
        try {
            const response = await fetch(`${this.baseUrl}/conductores/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener conductor:', error);
            throw error;
        }
    }

    // Obtener vehículos de un conductor
    async getVehiculosConductor(conductorId) {
        try {
            const response = await fetch(`${this.baseUrl}/conductores/${conductorId}/vehiculos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener vehículos del conductor:', error);
            throw error;
        }
    }

    // Obtener todos los vehículos
    async getVehiculos() {
        try {
            const response = await fetch(`${this.baseUrl}/vehiculos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener vehículos:', error);
            throw error;
        }
    }

    // Obtener un vehículo específico por ID
    async getVehiculo(id) {
        try {
            const response = await fetch(`${this.baseUrl}/vehiculos/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener vehículo:', error);
            throw error;
        }
    }

    // Obtener vehículos por tipo (carro/moto)
    async getVehiculosPorTipo(tipo) {
        try {
            const response = await fetch(`${this.baseUrl}/vehiculos?tipo=${tipo}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener vehículos por tipo:', error);
            throw error;
        }
    }

    // Obtener información completa de un conductor con sus vehículos
    async getConductorCompleto(id) {
        try {
            const [conductor, vehiculos] = await Promise.all([
                this.getConductor(id),
                this.getVehiculosConductor(id)
            ]);

            return {
                conductor,
                vehiculos
            };
        } catch (error) {
            console.error('Error al obtener información completa del conductor:', error);
            throw error;
        }
    }

    // Validar licencia del conductor
    validarLicencia(conductor) {
        if (!conductor.fecha_vencimiento_licencia) {
            return { valida: false, mensaje: 'No hay fecha de vencimiento registrada' };
        }

        const fechaVencimiento = new Date(conductor.fecha_vencimiento_licencia);
        const hoy = new Date();
        const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) {
            return { 
                valida: false, 
                mensaje: `Licencia vencida hace ${Math.abs(diasRestantes)} días`,
                diasRestantes: diasRestantes
            };
        } else if (diasRestantes <= 30) {
            return { 
                valida: true, 
                mensaje: `Licencia vence en ${diasRestantes} días`,
                diasRestantes: diasRestantes,
                advertencia: true
            };
        } else {
            return { 
                valida: true, 
                mensaje: `Licencia válida hasta ${fechaVencimiento.toLocaleDateString()}`,
                diasRestantes: diasRestantes
            };
        }
    }

    // Validar capacitación PESV del conductor
    validarCapacitacionPESV(conductor) {
        const estado = conductor.estado_capacitacion_pesv;
        
        switch (estado) {
            case 'completada':
                return { 
                    valida: true, 
                    mensaje: 'Capacitación PESV completada',
                    estado: estado
                };
            case 'en_proceso':
                return { 
                    valida: false, 
                    mensaje: 'Capacitación PESV en proceso',
                    estado: estado
                };
            case 'vencida':
                return { 
                    valida: false, 
                    mensaje: 'Capacitación PESV vencida',
                    estado: estado
                };
            case 'pendiente':
            default:
                return { 
                    valida: false, 
                    mensaje: 'Capacitación PESV pendiente',
                    estado: estado
                };
        }
    }

    // Obtener estadísticas del conductor
    getEstadisticasConductor(conductor) {
        const licencia = this.validarLicencia(conductor);
        const capacitacion = this.validarCapacitacionPESV(conductor);
        
        return {
            licencia,
            capacitacion,
            conductor: {
                nombre: conductor.nombre,
                identificacion: conductor.identificacion,
                numero_licencia: conductor.numero_licencia,
                categoria_licencia: conductor.categoria_licencia,
                fecha_ingreso: conductor.fecha_ingreso_empresa
            }
        };
    }
}

// Exportar para uso global
window.ConductoresService = ConductoresService; 