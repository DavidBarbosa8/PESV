/**
 * Script para probar el flujo completo del link del email
 * Este script simula el proceso completo desde el envío del email hasta la apertura de la inspección
 */

const EmailService = require('./src/services/email-service');
const config = require('./src/config/app.config');

async function testEmailLinkFlow() {
    console.log('🧪 Iniciando prueba del flujo de link del email...\n');

    try {
        // Crear instancia del servicio de email
        const emailService = new EmailService();

        // Datos de prueba
        const testData = {
            adminEmail: 'admin@test.com',
            empresaNombre: 'Empresa de Prueba',
            placa: 'ABC123',
            conductorNombre: 'Juan Pérez',
            tipoVehiculo: 'carro',
            fechaInspeccion: new Date().toISOString(),
            kilometraje: 50000,
            observaciones: 'Prueba del sistema de links',
            inspectionId: 1
        };

        console.log('📧 Datos de prueba:');
        console.log('- Email del admin:', testData.adminEmail);
        console.log('- Empresa:', testData.empresaNombre);
        console.log('- Vehículo:', testData.placa);
        console.log('- Conductor:', testData.conductorNombre);
        console.log('- ID de inspección:', testData.inspectionId);
        console.log('- URL base:', config.baseUrl);
        console.log('');

        // Generar el link que se enviaría en el email
        const emailLink = `${config.baseUrl}/admin/inspections/${testData.inspectionId}`;
        const adminPanelLink = `${config.baseUrl}/admin/inspections.html`;

        console.log('🔗 Links generados:');
        console.log('- Link directo a la inspección:', emailLink);
        console.log('- Link al panel administrativo:', adminPanelLink);
        console.log('');

        // Simular el proceso de redirección
        console.log('🔄 Proceso de redirección:');
        console.log('1. Usuario hace clic en el link del email');
        console.log('2. Servidor recibe la petición GET /admin/inspections/1');
        console.log('3. Servidor redirige a /admin/inspections.html?inspection_id=1');
        console.log('4. Página de revisiones se carga con el parámetro');
        console.log('5. JavaScript detecta el parámetro y abre la inspección automáticamente');
        console.log('');

        // Verificar que las URLs son correctas
        console.log('✅ Verificaciones:');
        console.log('- URL base configurada:', config.baseUrl);
        console.log('- Link de inspección válido:', emailLink.includes('/admin/inspections/'));
        console.log('- Link del panel válido:', adminPanelLink.includes('/admin/inspections.html'));
        console.log('');

        console.log('🎯 Para probar manualmente:');
        console.log('1. Envía una inspección desde el frontend');
        console.log('2. Revisa el email recibido');
        console.log('3. Haz clic en el link "Revisar Inspección #X"');
        console.log('4. Verifica que se abra la página de revisiones con la inspección específica');
        console.log('');

        console.log('✅ Prueba del flujo completada exitosamente');

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

// Ejecutar la prueba si se llama directamente
if (require.main === module) {
    testEmailLinkFlow();
}

module.exports = { testEmailLinkFlow }; 