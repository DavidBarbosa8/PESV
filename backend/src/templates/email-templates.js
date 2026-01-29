const getNewInspectionTemplate = (empresaNombre, placa, conductorNombre, tipoVehiculo) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Nueva Inspección Preoperacional</h2>
        </div>
        <div class="content">
            <p>Se ha registrado una nueva inspección preoperacional en <strong>${empresaNombre}</strong>.</p>
            <p><strong>Detalles de la inspección:</strong></p>
            <ul>
                <li>Vehículo: ${placa}</li>
                <li>Conductor: ${conductorNombre}</li>
                <li>Tipo de vehículo: ${tipoVehiculo}</li>
                <li>Fecha: ${new Date().toLocaleDateString()}</li>
            </ul>
            <p>Por favor, revise el sistema para aprobar o rechazar la inspección.</p>
            <a href="${getBaseUrl()}/admin/inspections.html" class="button">Ver Inspección</a>
        </div>
        <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
        </div>
    </div>
</body>
</html>
`;

const config = require('../config/app.config');

// Configuración de URL base
const getBaseUrl = () => {
    return config.baseUrl;
};

const getInspectionNotificationTemplate = (empresaNombre, placa, conductorNombre, tipoVehiculo, fechaInspeccion, kilometraje, observaciones, inspectionId) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e3f2fd; padding: 20px; border-radius: 5px; border-left: 4px solid #2196f3; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .action-notice { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px; 
            font-weight: bold;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            background-color: #ffc107;
            color: #000;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📋 Nueva Inspección Preoperacional Registrada</h2>
            <span class="status-badge">Pendiente de Revisión</span>
        </div>
        <div class="content">
            <p>Se ha registrado una nueva inspección preoperacional en <strong>${empresaNombre}</strong>.</p>
            
            <div class="details">
                <h3>📊 Detalles de la Inspección:</h3>
                <ul>
                    <li><strong>Vehículo:</strong> ${placa}</li>
                    <li><strong>Conductor:</strong> ${conductorNombre}</li>
                    <li><strong>Tipo de vehículo:</strong> ${tipoVehiculo}</li>
                    <li><strong>Fecha de inspección:</strong> ${new Date(fechaInspeccion).toLocaleDateString()}</li>
                    <li><strong>Kilometraje:</strong> ${kilometraje} km</li>
                    <li><strong>ID de Inspección:</strong> #${inspectionId}</li>
                </ul>
            </div>

            ${observaciones ? `
            <div class="details">
                <h3>💬 Observaciones del Conductor:</h3>
                <p>${observaciones}</p>
            </div>
            ` : ''}

            <div class="action-notice">
                <h3>⚠️ Acción Requerida</h3>
                <p>Esta inspección requiere su revisión y aprobación. El PDF completo de la inspección está disponible en el sistema.</p>
                <p><strong>Por favor, ingrese al sistema para:</strong></p>
                <ul>
                    <li>Revisar el PDF completo de la inspección</li>
                    <li>Evaluar los resultados de la inspección</li>
                    <li>Aprobar o rechazar la inspección</li>
                    <li>Agregar comentarios si es necesario</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${getBaseUrl()}/admin/inspections/${inspectionId}" class="button">
                    🔍 Revisar Inspección #${inspectionId}
                </a>
            </div>
            
            <p style="text-align: center; margin-top: 20px;">
                <small>O ingrese al panel administrativo: 
                <a href="${getBaseUrl()}/admin/inspections.html">Panel de Inspecciones</a></small>
            </p>
        </div>
        <div class="footer">
            <p>Este es un correo automático del sistema PESV. Por favor no responda a este mensaje.</p>
            <p>Si tiene alguna pregunta, contacte al administrador del sistema.</p>
            <p><small>Fecha de envío: ${new Date().toLocaleString()}</small></p>
        </div>
    </div>
</body>
</html>
`;

const getInspectionPDFTemplate = (empresaNombre, placa, conductorNombre, tipoVehiculo, fechaInspeccion, kilometraje, observaciones) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e3f2fd; padding: 20px; border-radius: 5px; border-left: 4px solid #2196f3; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .pdf-notice { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📋 Inspección Preoperacional Completada</h2>
        </div>
        <div class="content">
            <p>Se ha completado una nueva inspección preoperacional en <strong>${empresaNombre}</strong>.</p>
            
            <div class="details">
                <h3>📊 Detalles de la Inspección:</h3>
                <ul>
                    <li><strong>Vehículo:</strong> ${placa}</li>
                    <li><strong>Conductor:</strong> ${conductorNombre}</li>
                    <li><strong>Tipo de vehículo:</strong> ${tipoVehiculo}</li>
                    <li><strong>Fecha de inspección:</strong> ${new Date(fechaInspeccion).toLocaleDateString()}</li>
                    <li><strong>Kilometraje:</strong> ${kilometraje} km</li>
                </ul>
            </div>

            <div class="pdf-notice">
                <h3>📎 Documento Adjunto</h3>
                <p>El PDF completo de la inspección preoperacional se encuentra adjunto a este correo.</p>
                <p><strong>Nombre del archivo:</strong> inspeccion-${placa}-${fechaInspeccion}.pdf</p>
            </div>

            ${observaciones ? `
            <div class="details">
                <h3>💬 Observaciones del Conductor:</h3>
                <p>${observaciones}</p>
            </div>
            ` : ''}

            <p>Por favor, revise el documento adjunto y tome las acciones correspondientes según los resultados de la inspección.</p>
            
            <a href="${getBaseUrl()}/admin/inspections.html" class="button">Ver en el Sistema</a>
        </div>
        <div class="footer">
            <p>Este es un correo automático del sistema PESV. Por favor no responda a este mensaje.</p>
            <p>Si tiene alguna pregunta, contacte al administrador del sistema.</p>
        </div>
    </div>
</body>
</html>
`;

const getStatusUpdateTemplate = (estado, placa, conductorNombre, comentario) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
            background-color: ${estado === 'aprobada' ? '#d4edda' : '#f8d7da'}; 
            padding: 20px; 
            border-radius: 5px; 
        }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .status {
            font-size: 24px;
            font-weight: bold;
            color: ${estado === 'aprobada' ? '#155724' : '#721c24'};
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Actualización de Inspección Preoperacional</h2>
        </div>
        <div class="content">
            <p class="status">Estado: ${estado.toUpperCase()}</p>
            <p><strong>Detalles de la inspección:</strong></p>
            <ul>
                <li>Vehículo: ${placa}</li>
                <li>Conductor: ${conductorNombre}</li>
                <li>Fecha de actualización: ${new Date().toLocaleDateString()}</li>
            </ul>
            ${comentario ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p><strong>Comentario del administrador:</strong></p>
                <p>${comentario}</p>
            </div>
            ` : ''}
        </div>
        <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
        </div>
    </div>
</body>
</html>
`;

module.exports = {
    getNewInspectionTemplate,
    getInspectionNotificationTemplate,
    getStatusUpdateTemplate,
    getInspectionPDFTemplate
}; 