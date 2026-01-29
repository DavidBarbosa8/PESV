const nodemailer = require('nodemailer');
const { getNewInspectionTemplate, getInspectionNotificationTemplate, getStatusUpdateTemplate, getInspectionPDFTemplate } = require('../templates/email-templates');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async sendInspectionPDFToAdmin(adminEmail, empresaNombre, placa, conductorNombre, tipoVehiculo, pdfBase64, fechaInspeccion, kilometraje, observaciones) {
        try {
            // Convertir base64 a buffer
            const pdfBuffer = Buffer.from(pdfBase64.replace('data:application/pdf;base64,', ''), 'base64');
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmail,
                subject: `Inspección Preoperacional - ${placa} - ${conductorNombre}`,
                html: getInspectionPDFTemplate(empresaNombre, placa, conductorNombre, tipoVehiculo, fechaInspeccion, kilometraje, observaciones),
                attachments: [
                    {
                        filename: `inspeccion-${placa}-${fechaInspeccion}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ PDF de inspección enviado al administrador:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar PDF de inspección:', error);
            return false;
        }
    }

    // Nuevo método: Enviar notificación sin PDF adjunto
    async sendInspectionNotificationToAdmin(adminEmail, empresaNombre, placa, conductorNombre, tipoVehiculo, fechaInspeccion, kilometraje, observaciones, inspectionId) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmail,
                subject: `📋 Nueva Inspección Preoperacional - ${placa} - ${conductorNombre}`,
                html: getInspectionNotificationTemplate(empresaNombre, placa, conductorNombre, tipoVehiculo, fechaInspeccion, kilometraje, observaciones, inspectionId)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Notificación de inspección enviada al administrador:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar notificación de inspección:', error);
            return false;
        }
    }

    // Método para enviar notificación de cambio de estado
    async sendStatusUpdateNotification(conductorEmail, estado, placa, conductorNombre, comentario = null) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: conductorEmail,
                subject: `Actualización de Inspección - ${placa} - ${estado.toUpperCase()}`,
                html: getStatusUpdateTemplate(estado, placa, conductorNombre, comentario)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Notificación de cambio de estado enviada al conductor:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar notificación de cambio de estado:', error);
            return false;
        }
    }

    // Método para enviar notificación simple de nueva inspección
    async sendNewInspectionNotification(adminEmail, empresaNombre, placa, conductorNombre, tipoVehiculo) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmail,
                subject: `Nueva Inspección Preoperacional - ${placa}`,
                html: getNewInspectionTemplate(empresaNombre, placa, conductorNombre, tipoVehiculo)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Notificación de nueva inspección enviada:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar notificación de nueva inspección:', error);
            return false;
        }
    }

    // Método para verificar la configuración del servicio de correo
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Servicio de correo configurado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error en la configuración del servicio de correo:', error);
            return false;
        }
    }
}

module.exports = EmailService; 