const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuración de CORS
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

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos desde la carpeta frontend/public
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'DavidB',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pesv_db'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        process.exit(1);
    }
    console.log('✅ Conectado a la base de datos MySQL');
});

// Manejar errores de conexión a la base de datos
db.on('error', (err) => {
    console.error('Error en la conexión a la base de datos:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        db.connect();
    } else {
        throw err;
    }
});

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Almacenamiento temporal de códigos (en producción usar una base de datos)
const verificationCodes = new Map();

// Ruta para verificar la estructura de la tabla
app.get('/api/check-table', (req, res) => {
    db.query('DESCRIBE usuarios', (err, results) => {
        if (err) {
            console.error('Error al verificar la tabla:', err);
            return res.status(500).json({ error: 'Error al verificar la tabla' });
        }
        res.json({ tableStructure: results });
    });
});

// Ruta para registrar una empresa y su administrador
app.post('/api/register-company', async (req, res) => {
    const {
        // Datos de la empresa
        nombreEmpresa,
        nit,
        direccion,
        telefonoEmpresa,
        emailEmpresa,
        // Datos del administrador
        nombreAdmin,
        identificacion,
        telefonoAdmin,
        emailAdmin,
        password
    } = req.body;

    try {
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Iniciar transacción
        db.beginTransaction((err) => {
            if (err) {
                console.error('Error al iniciar transacción:', err);
                return res.status(500).json({ error: 'Error al iniciar transacción' });
            }

            // Insertar empresa
            const empresaQuery = `
                INSERT INTO empresa (
                    nombre,
                    nit,
                    direccion,
                    telefono,
                    email
                ) VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
                empresaQuery,
                [nombreEmpresa, nit, direccion, telefonoEmpresa, emailEmpresa],
                (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error al registrar empresa:', err);
                            res.status(500).json({ 
                                error: 'Error al registrar empresa',
                                details: err.message
                            });
                        });
                    }

                    const empresaId = result.insertId;

                    // Insertar administrador
                    const adminQuery = `
                        INSERT INTO usuarios (
                            empresa_id,
                            nombre,
                            identificacion,
                            telefono,
                            email,
                            password,
                            rol_id
                        ) VALUES (?, ?, ?, ?, ?, ?, 2)
                    `;

                    db.query(
                        adminQuery,
                        [empresaId, nombreAdmin, identificacion, telefonoAdmin, emailAdmin, hashedPassword],
                        (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error('Error al registrar administrador:', err);
                                    res.status(500).json({ 
                                        error: 'Error al registrar administrador',
                                        details: err.message
                                    });
                                });
                            }

                            // Si todo sale bien, hacer commit
                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error('Error al hacer commit:', err);
                                        res.status(500).json({ error: 'Error al finalizar el registro' });
                                    });
                                }
                                res.status(201).json({ message: 'Empresa y administrador registrados exitosamente' });
                            });
                        }
                    );
                }
            );
        });
    } catch (error) {
        console.error('Error en el proceso de registro:', error);
        res.status(500).json({ 
            error: 'Error en el proceso de registro',
            details: error.message
        });
    }
});

// Ruta para registrar un conductor y su vehículo
app.post('/api/register-driver', async (req, res) => {
    const {
        empresa_id,
        nombre,
        identificacion,
        telefono,
        email,
        password,
        placa,
        marca,
        modelo,
        tipoVehiculo
    } = req.body;

    try {
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Iniciar transacción
        db.beginTransaction((err) => {
            if (err) {
                console.error('Error al iniciar transacción:', err);
                return res.status(500).json({ error: 'Error al iniciar transacción' });
            }

            // Insertar conductor
            const conductorQuery = `
                INSERT INTO usuarios (
                    empresa_id,
                    nombre,
                    identificacion,
                    telefono,
                    email,
                    password,
                    rol_id
                ) VALUES (?, ?, ?, ?, ?, ?, 3)
            `;

            db.query(
                conductorQuery,
                [empresa_id, nombre, identificacion, telefono, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error al registrar conductor:', err);
                            res.status(500).json({ 
                                error: 'Error al registrar conductor',
                                details: err.message
                            });
                        });
                    }

                    const conductorId = result.insertId;

                    // Insertar vehículo
                    const vehiculoQuery = `
                        INSERT INTO vehiculos (
                            usuario_id,
                            placa,
                            marca,
                            modelo,
                            tipo_vehiculo
                        ) VALUES (?, ?, ?, ?, ?)
                    `;

                    db.query(
                        vehiculoQuery,
                        [conductorId, placa, marca, modelo, tipoVehiculo],
                        (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error('Error al registrar vehículo:', err);
                                    res.status(500).json({ 
                                        error: 'Error al registrar vehículo',
                                        details: err.message
                                    });
                                });
                            }

                            // Si todo sale bien, hacer commit
                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error('Error al hacer commit:', err);
                                        res.status(500).json({ error: 'Error al finalizar el registro' });
                                    });
                                }
                                res.status(201).json({ message: 'Conductor y vehículo registrados exitosamente' });
                            });
                        }
                    );
                }
            );
        });
    } catch (error) {
        console.error('Error en el proceso de registro:', error);
        res.status(500).json({ 
            error: 'Error en el proceso de registro',
            details: error.message
        });
    }
});

// Ruta para enviar el código de verificación
app.post('/api/send-verification-code', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Verificar si el email existe en la base de datos
        db.query('SELECT id FROM usuarios WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Error al verificar email:', err);
                return res.status(500).json({ error: 'Error al verificar el email' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'No existe una cuenta con este email' });
            }

            // Generar código de verificación
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Guardar el código
            verificationCodes.set(email, {
                code,
                timestamp: Date.now()
            });

            // Configurar el correo
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Código de Verificación - Recuperación de Contraseña',
                html: `
                    <h1>Recuperación de Contraseña</h1>
                    <p>Tu código de verificación es: <strong>${code}</strong></p>
                    <p>Este código expirará en 10 minutos.</p>
                    <p>Si no solicitaste este código, por favor ignora este correo.</p>
                `
            };

            // Enviar el correo
            await transporter.sendMail(mailOptions);

            res.json({ message: 'Código enviado exitosamente' });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al enviar el código de verificación' });
    }
});

// Ruta para verificar el código y actualizar la contraseña
app.post('/api/verify-code-and-update-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // Verificar si el código existe y no ha expirado (10 minutos)
        const storedData = verificationCodes.get(email);
        if (!storedData || storedData.code !== code) {
            return res.status(400).json({ error: 'Código inválido' });
        }

        const codeAge = Date.now() - storedData.timestamp;
        if (codeAge > 10 * 60 * 1000) { // 10 minutos en milisegundos
            verificationCodes.delete(email);
            return res.status(400).json({ error: 'Código expirado' });
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña en la base de datos
        db.query(
            'UPDATE usuarios SET password = ? WHERE email = ?',
            [hashedPassword, email],
            (err, result) => {
                if (err) {
                    console.error('Error al actualizar contraseña:', err);
                    return res.status(500).json({ error: 'Error al actualizar la contraseña' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Usuario no encontrado' });
                }

                // Eliminar el código usado
                verificationCodes.delete(email);

                res.json({ message: 'Contraseña actualizada exitosamente' });
            }
        );
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }
});

// Importar el servicio de correo
const EmailService = require('./src/services/email-service');
const emailService = new EmailService();

// Verificar la configuración del servicio de correo al iniciar
emailService.verifyConnection().then(isConfigured => {
    if (!isConfigured) {
        console.warn('⚠️ El servicio de correo no está configurado correctamente');
    }
});

// Modificar el endpoint de nueva inspección
app.post('/api/inspections', async (req, res) => {
    console.log('📝 Recibiendo nueva inspección...');
    console.log('📋 Body completo:', JSON.stringify(req.body, null, 2));
    
    const {
        vehiculo_id,
        conductor_id,
        fecha_inspeccion,
        kilometraje,
        tipo_vehiculo,
        resultados,
        firma_base64,
        pdf_base64,
        observaciones
    } = req.body;

    console.log('📝 Datos extraídos:', {
        vehiculo_id,
        conductor_id,
        fecha_inspeccion,
        kilometraje,
        tipo_vehiculo,
        observaciones
    });

    try {
        // Validar datos requeridos
        console.log('🔍 Validando datos requeridos...');
        const requiredFields = ['vehiculo_id', 'conductor_id', 'fecha_inspeccion', 'tipo_vehiculo'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.error('❌ Datos requeridos faltantes:', missingFields);
            return res.status(400).json({
                error: 'Datos requeridos faltantes',
                missing: missingFields,
                received: req.body
            });
        }
        
        console.log('✅ Validación de datos requeridos exitosa');

        // Usar la tabla inspecciones_preoperacionales (que ya existe y está configurada)
        console.log('🔍 Preparando query de inserción...');
        
        const query = `
            INSERT INTO inspecciones_preoperacionales (
                vehiculo_id,
                conductor_id,
                fecha_inspeccion,
                kilometraje,
                tipo_vehiculo,
                resultados,
                firma_base64,
                pdf_base64,
                observaciones,
                estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
        `;

        const queryParams = [
            vehiculo_id,
            conductor_id,
            fecha_inspeccion,
            kilometraje || 0,
            tipo_vehiculo,
            JSON.stringify(resultados || {}),
            firma_base64 || null,
            pdf_base64 || null,
            observaciones || null
        ];

        console.log('🔍 Query a ejecutar:', query);
        console.log('🔍 Parámetros:', queryParams);

        db.query(query, queryParams, async (err, result) => {
            if (err) {
                console.error('❌ Error al guardar la inspección:');
                console.error('   - Código:', err.code);
                console.error('   - Mensaje:', err.message);
                console.error('   - SQL State:', err.sqlState);
                console.error('   - Query:', query);
                console.error('   - Parámetros:', queryParams);
                return res.status(500).json({
                    error: 'Error al guardar la inspección',
                    details: err.message,
                    code: err.code,
                    sqlState: err.sqlState
                });
            }

            const inspectionId = result.insertId;
            console.log('✅ Inspección guardada exitosamente, ID:', inspectionId);

            // Intentar enviar notificación por email
            try {
                console.log('🔍 Verificando configuración de email...');
                
                if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
                    console.log('✅ Configuración de email encontrada, buscando administrador...');
                    
                    // Obtener información para la notificación
                    const getInfoQuery = `
                        SELECT 
                            u.email as admin_email,
                            e.nombre as empresa_nombre,
                            v.placa,
                            c.nombre as conductor_nombre
                        FROM vehiculos v
                        JOIN usuarios c ON v.usuario_id = c.id
                        JOIN empresa e ON c.empresa_id = e.empresa_id
                        JOIN usuarios u ON u.empresa_id = e.empresa_id AND u.rol_id = 2
                        WHERE v.id = ?
                    `;

                    db.query(getInfoQuery, [vehiculo_id], async (err, infoResult) => {
                        if (err || infoResult.length === 0) {
                            console.warn('⚠️ No se encontró información del administrador');
                            return res.status(201).json({
                                message: 'Inspección guardada exitosamente. PDF almacenado en el sistema.',
                                inspection_id: inspectionId,
                                warning: 'No se pudo enviar notificación por correo'
                            });
                        }

                        const info = infoResult[0];
                        console.log('✅ Información del administrador encontrada:', info);
                        
                        // Enviar notificación sin PDF adjunto
                        const emailSent = await emailService.sendInspectionNotificationToAdmin(
                            info.admin_email,
                            info.empresa_nombre,
                            info.placa,
                            info.conductor_nombre,
                            tipo_vehiculo,
                            fecha_inspeccion,
                            kilometraje,
                            observaciones || 'Sin observaciones',
                            inspectionId
                        );

                        if (emailSent) {
                            console.log(`✅ Notificación enviada a: ${info.admin_email}`);
                            res.status(201).json({
                                message: 'Inspección guardada exitosamente. Notificación enviada al administrador.',
                                inspection_id: inspectionId
                            });
                        } else {
                            console.error('❌ Error al enviar notificación por correo');
                            res.status(201).json({
                                message: 'Inspección guardada exitosamente. PDF almacenado en el sistema.',
                                inspection_id: inspectionId,
                                warning: 'No se pudo enviar notificación por correo'
                            });
                        }
                    });
                } else {
                    console.log('⚠️ Configuración de email no encontrada');
                    res.status(201).json({
                        message: 'Inspección guardada exitosamente. PDF almacenado en el sistema.',
                        inspection_id: inspectionId,
                        warning: 'Configuración de email no disponible'
                    });
                }
            } catch (emailError) {
                console.error('❌ Error en el proceso de email:', emailError);
                res.status(201).json({
                    message: 'Inspección guardada exitosamente. PDF almacenado en el sistema.',
                    inspection_id: inspectionId,
                    warning: 'Error en el proceso de notificación por correo'
                });
            }
        });
    } catch (error) {
        console.error('❌ Error general:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

// Ruta para redirigir desde email a la página de revisiones
app.get('/admin/inspections/:id', (req, res) => {
    const { id } = req.params;
    // Redirigir a la página de revisiones con el ID de la inspección
    res.redirect(`/admin/inspections.html?inspection_id=${id}`);
});

// Obtener todas las inspecciones de una empresa
app.get('/api/inspections/company/:empresa_id', (req, res) => {
    const { empresa_id } = req.params;
    const { estado, tipo_vehiculo, fecha_inicio, fecha_fin } = req.query;

    let query = `
        SELECT 
            i.*,
            v.placa,
            v.marca,
            v.modelo,
            u.nombre as conductor_nombre,
            u.identificacion as conductor_identificacion
        FROM inspecciones_preoperacionales i
        JOIN vehiculos v ON i.vehiculo_id = v.id
        JOIN usuarios u ON i.conductor_id = u.id
        WHERE v.empresa_id = ?
    `;

    const queryParams = [empresa_id];

    if (estado) {
        query += ' AND i.estado = ?';
        queryParams.push(estado);
    }

    if (tipo_vehiculo) {
        query += ' AND i.tipo_vehiculo = ?';
        queryParams.push(tipo_vehiculo);
    }

    if (fecha_inicio) {
        query += ' AND i.fecha >= ?';
        queryParams.push(fecha_inicio);
    }

    if (fecha_fin) {
        query += ' AND i.fecha <= ?';
        queryParams.push(fecha_fin);
    }

    query += ' ORDER BY i.fecha DESC';

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error al obtener inspecciones:', err);
            return res.status(500).json({
                error: 'Error al obtener inspecciones',
                details: err.message
            });
        }

        res.json(results);
    });
});

// Modificar el endpoint de actualización de estado
app.patch('/api/inspections/:id/status', async (req, res) => {
    const { id } = req.params;
    const { estado, comentario } = req.body;

    const query = `
        UPDATE inspecciones_preoperacionales
        SET estado = ?,
            observaciones = CASE 
                WHEN observaciones IS NULL OR observaciones = '' 
                THEN ? 
                ELSE CONCAT(observaciones, '\n', ?)
            END
        WHERE id = ?
    `;

    db.query(query, [estado, comentario, comentario, id], async (err, result) => {
        if (err) {
            console.error('Error al actualizar estado de inspección:', err);
            return res.status(500).json({
                error: 'Error al actualizar estado de inspección',
                details: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Inspección no encontrada'
            });
        }

        // Obtener información para la notificación
        const getInfoQuery = `
            SELECT 
                i.*,
                v.placa,
                u.email as conductor_email,
                u.nombre as conductor_nombre
            FROM inspecciones_preoperacionales i
            JOIN vehiculos v ON i.vehiculo_id = v.id
            JOIN usuarios u ON i.conductor_id = u.id
            WHERE i.id = ?
        `;

        db.query(getInfoQuery, [id], async (err, infoResult) => {
            if (err || infoResult.length === 0) {
                return res.status(200).json({
                    message: 'Estado de inspección actualizado exitosamente'
                });
            }

            const info = infoResult[0];
            await emailService.sendStatusUpdateNotification(
                info.conductor_email,
                estado,
                info.placa,
                info.conductor_nombre,
                comentario
            );

            res.status(200).json({
                message: 'Estado de inspección actualizado exitosamente'
            });
        });
    });
});

// ===== ENDPOINTS PARA CONDUCTORES Y VEHÍCULOS =====

// Obtener todos los conductores
app.get('/api/conductores', (req, res) => {
    const query = `
        SELECT 
            u.id,
            u.nombre,
            u.identificacion,
            u.telefono,
            u.email,
            u.numero_licencia,
            u.categoria_licencia,
            u.fecha_vencimiento_licencia,
            u.fecha_ingreso_empresa,
            u.estado_capacitacion_pesv,
            u.fecha_ultima_capacitacion,
            u.fecha_proxima_capacitacion,
            u.estado,
            e.nombre as empresa_nombre
        FROM usuarios u
        JOIN empresa e ON u.empresa_id = e.empresa_id
        WHERE u.rol_id = 3
        ORDER BY u.nombre
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener conductores:', err);
            return res.status(500).json({
                error: 'Error al obtener conductores',
                details: err.message
            });
        }

        res.json(results);
    });
});

// Obtener un conductor específico
app.get('/api/conductores/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT 
            u.id,
            u.nombre,
            u.identificacion,
            u.telefono,
            u.email,
            u.numero_licencia,
            u.categoria_licencia,
            u.fecha_vencimiento_licencia,
            u.fecha_ingreso_empresa,
            u.estado_capacitacion_pesv,
            u.fecha_ultima_capacitacion,
            u.fecha_proxima_capacitacion,
            u.estado,
            e.nombre as empresa_nombre
        FROM usuarios u
        JOIN empresa e ON u.empresa_id = e.empresa_id
        WHERE u.id = ? AND u.rol_id = 3
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener conductor:', err);
            return res.status(500).json({
                error: 'Error al obtener conductor',
                details: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: 'Conductor no encontrado'
            });
        }

        res.json(results[0]);
    });
});

// Obtener vehículos de un conductor
app.get('/api/conductores/:id/vehiculos', (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT 
            v.id,
            v.placa,
            v.marca,
            v.modelo,
            v.tipo_vehiculo,
            v.activo
        FROM vehiculos v
        WHERE v.usuario_id = ?
        ORDER BY v.tipo_vehiculo, v.placa
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener vehículos del conductor:', err);
            return res.status(500).json({
                error: 'Error al obtener vehículos del conductor',
                details: err.message
            });
        }

        res.json(results);
    });
});

// Obtener todos los vehículos
app.get('/api/vehiculos', (req, res) => {
    const { tipo } = req.query;
    
    let query = `
        SELECT 
            v.id,
            v.placa,
            v.marca,
            v.modelo,
            v.tipo_vehiculo,
            v.activo,
            u.nombre as conductor_nombre,
            u.id as conductor_id
        FROM vehiculos v
        JOIN usuarios u ON v.usuario_id = u.id
        WHERE v.activo = 1
    `;
    
    const queryParams = [];
    
    if (tipo) {
        query += ' AND v.tipo_vehiculo = ?';
        queryParams.push(tipo);
    }
    
    query += ' ORDER BY v.tipo_vehiculo, v.placa';

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error al obtener vehículos:', err);
            return res.status(500).json({
                error: 'Error al obtener vehículos',
                details: err.message
            });
        }

        res.json(results);
    });
});

// Obtener un vehículo específico
app.get('/api/vehiculos/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT 
            v.id,
            v.placa,
            v.marca,
            v.modelo,
            v.tipo_vehiculo,
            v.activo,
            u.nombre as conductor_nombre,
            u.id as conductor_id
        FROM vehiculos v
        JOIN usuarios u ON v.usuario_id = u.id
        WHERE v.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener vehículo:', err);
            return res.status(500).json({
                error: 'Error al obtener vehículo',
                details: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: 'Vehículo no encontrado'
            });
        }

        res.json(results[0]);
    });
});

// Obtener estadísticas de conductores
app.get('/api/conductores/stats/empresa/:empresa_id', (req, res) => {
    const { empresa_id } = req.params;
    
    const query = `
        SELECT 
            COUNT(*) as total_conductores,
            COUNT(CASE WHEN u.estado_capacitacion_pesv = 'completada' THEN 1 END) as capacitados,
            COUNT(CASE WHEN u.estado_capacitacion_pesv = 'pendiente' THEN 1 END) as pendientes,
            COUNT(CASE WHEN u.estado_capacitacion_pesv = 'vencida' THEN 1 END) as vencidos,
            COUNT(CASE WHEN u.fecha_vencimiento_licencia <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as licencias_por_vencer,
            COUNT(CASE WHEN u.fecha_vencimiento_licencia < CURDATE() THEN 1 END) as licencias_vencidas
        FROM usuarios u
        WHERE u.empresa_id = ? AND u.rol_id = 3
    `;

    db.query(query, [empresa_id], (err, results) => {
        if (err) {
            console.error('Error al obtener estadísticas:', err);
            return res.status(500).json({
                error: 'Error al obtener estadísticas',
                details: err.message
            });
        }

        res.json(results[0]);
    });
});

// Obtener conductores con alertas
app.get('/api/conductores/alertas/empresa/:empresa_id', (req, res) => {
    const { empresa_id } = req.params;
    
    const query = `
        SELECT 
            u.id,
            u.nombre,
            u.numero_licencia,
            u.fecha_vencimiento_licencia,
            u.estado_capacitacion_pesv,
            u.fecha_proxima_capacitacion,
            DATEDIFF(u.fecha_vencimiento_licencia, CURDATE()) as dias_licencia,
            DATEDIFF(u.fecha_proxima_capacitacion, CURDATE()) as dias_capacitacion
        FROM usuarios u
        WHERE u.empresa_id = ? 
        AND u.rol_id = 3
        AND (
            u.fecha_vencimiento_licencia <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            OR u.estado_capacitacion_pesv IN ('pendiente', 'vencida')
            OR u.fecha_proxima_capacitacion <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        )
        ORDER BY u.fecha_vencimiento_licencia ASC
    `;

    db.query(query, [empresa_id], (err, results) => {
        if (err) {
            console.error('Error al obtener alertas:', err);
            return res.status(500).json({
                error: 'Error al obtener alertas',
                details: err.message
            });
        }

        res.json(results);
    });
});

// ===== FIN DE ENDPOINTS PARA CONDUCTORES Y VEHÍCULOS =====

// ===== ENDPOINTS PARA ADMINISTRACIÓN DE INSPECCIONES =====

// Obtener inspecciones pendientes
app.get('/api/admin/inspections/pending', (req, res) => {
    const query = `
        SELECT 
            i.id,
            i.fecha_inspeccion,
            i.kilometraje,
            i.tipo_vehiculo,
            i.estado,
            i.observaciones,
            i.created_at,
            v.placa,
            c.nombre as conductor_nombre,
            c.email as conductor_email,
            e.nombre as empresa_nombre
        FROM inspecciones_preoperacionales i
        JOIN vehiculos v ON i.vehiculo_id = v.id
        JOIN usuarios c ON i.conductor_id = c.id
        JOIN empresa e ON c.empresa_id = e.empresa_id
        WHERE i.estado = 'pendiente'
        ORDER BY i.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener inspecciones pendientes:', err);
            return res.status(500).json({
                error: 'Error al obtener inspecciones pendientes',
                details: err.message
            });
        }

        res.json(results);
    });
});

// Obtener detalle de una inspección específica
app.get('/api/admin/inspections/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            i.*,
            v.placa,
            c.nombre as conductor_nombre,
            c.email as conductor_email,
            e.nombre as empresa_nombre
        FROM inspecciones_preoperacionales i
        JOIN vehiculos v ON i.vehiculo_id = v.id
        JOIN usuarios c ON i.conductor_id = c.id
        JOIN empresa e ON c.empresa_id = e.empresa_id
        WHERE i.id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener inspección:', err);
            return res.status(500).json({
                error: 'Error al obtener inspección',
                details: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: 'Inspección no encontrada'
            });
        }

        const inspection = results[0];
        
        // Parsear resultados JSON si existe
        if (inspection.resultados) {
            try {
                inspection.resultados = JSON.parse(inspection.resultados);
            } catch (e) {
                console.warn('Error al parsear resultados JSON:', e);
                inspection.resultados = {};
            }
        }

        res.json(inspection);
    });
});

// Aprobar o rechazar inspección
app.put('/api/admin/inspections/:id/status', async (req, res) => {
    const { id } = req.params;
    const { estado, comentario_admin, admin_id } = req.body;

    console.log('🔄 Actualizando estado de inspección:', { id, estado, comentario_admin, admin_id });

    if (!estado || !['aprobada', 'rechazada'].includes(estado)) {
        return res.status(400).json({
            error: 'Estado inválido. Debe ser "aprobada" o "rechazada"'
        });
    }

    try {
        // Actualizar estado de la inspección
        const updateQuery = `
            UPDATE inspecciones_preoperacionales 
            SET estado = ?, 
                comentario_admin = ?, 
                admin_id = ?, 
                fecha_revision = NOW()
            WHERE id = ?
        `;

        db.query(updateQuery, [estado, comentario_admin || null, admin_id || null, id], async (err, result) => {
            if (err) {
                console.error('Error al actualizar inspección:', err);
                return res.status(500).json({
                    error: 'Error al actualizar inspección',
                    details: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Inspección no encontrada'
                });
            }

            console.log('✅ Estado de inspección actualizado');

            // Obtener información para enviar notificación al conductor
            const getInfoQuery = `
                SELECT 
                    i.id,
                    v.placa,
                    c.nombre as conductor_nombre,
                    c.email as conductor_email,
                    e.nombre as empresa_nombre
                FROM inspecciones_preoperacionales i
                JOIN vehiculos v ON i.vehiculo_id = v.id
                JOIN usuarios c ON i.conductor_id = c.id
                JOIN empresa e ON c.empresa_id = e.empresa_id
                WHERE i.id = ?
            `;

            db.query(getInfoQuery, [id], async (err, infoResult) => {
                if (err || infoResult.length === 0) {
                    console.warn('⚠️ No se pudo obtener información para notificación');
                    return res.status(200).json({
                        message: 'Estado de inspección actualizado exitosamente',
                        inspection_id: id,
                        estado: estado,
                        warning: 'No se pudo enviar notificación al conductor'
                    });
                }

                const info = infoResult[0];

                // Enviar notificación al conductor
                try {
                    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
                        const emailSent = await emailService.sendStatusUpdateNotification(
                            info.conductor_email,
                            estado,
                            info.placa,
                            info.conductor_nombre,
                            comentario_admin
                        );

                        if (emailSent) {
                            console.log(`✅ Notificación enviada al conductor: ${info.conductor_email}`);
                            res.status(200).json({
                                message: 'Estado de inspección actualizado exitosamente. Notificación enviada al conductor.',
                                inspection_id: id,
                                estado: estado
                            });
                        } else {
                            console.error('❌ Error al enviar notificación al conductor');
                            res.status(200).json({
                                message: 'Estado de inspección actualizado exitosamente',
                                inspection_id: id,
                                estado: estado,
                                warning: 'No se pudo enviar notificación al conductor'
                            });
                        }
                    } else {
                        res.status(200).json({
                            message: 'Estado de inspección actualizado exitosamente',
                            inspection_id: id,
                            estado: estado,
                            warning: 'Configuración de email no disponible'
                        });
                    }
                } catch (emailError) {
                    console.error('❌ Error en el proceso de email:', emailError);
                    res.status(200).json({
                        message: 'Estado de inspección actualizado exitosamente',
                        inspection_id: id,
                        estado: estado,
                        warning: 'Error en el proceso de notificación por correo'
                    });
                }
            });
        });
    } catch (error) {
        console.error('❌ Error general:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
});

// Obtener todas las inspecciones (con filtros opcionales)
app.get('/api/admin/inspections', (req, res) => {
    const { estado, empresa_id, fecha_inicio, fecha_fin } = req.query;
    
    let query = `
        SELECT 
            i.id,
            i.fecha_inspeccion,
            i.kilometraje,
            i.tipo_vehiculo,
            i.estado,
            i.observaciones,
            i.created_at,
            i.fecha_revision,
            v.placa,
            c.nombre as conductor_nombre,
            c.email as conductor_email,
            e.nombre as empresa_nombre,
            e.empresa_id
        FROM inspecciones_preoperacionales i
        JOIN vehiculos v ON i.vehiculo_id = v.id
        JOIN usuarios c ON i.conductor_id = c.id
        JOIN empresa e ON c.empresa_id = e.empresa_id
        WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (estado) {
        query += ' AND i.estado = ?';
        queryParams.push(estado);
    }
    
    if (empresa_id) {
        query += ' AND e.empresa_id = ?';
        queryParams.push(empresa_id);
    }
    
    if (fecha_inicio) {
        query += ' AND i.fecha_inspeccion >= ?';
        queryParams.push(fecha_inicio);
    }
    
    if (fecha_fin) {
        query += ' AND i.fecha_inspeccion <= ?';
        queryParams.push(fecha_fin);
    }
    
    query += ' ORDER BY i.created_at DESC';

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error al obtener inspecciones:', err);
            return res.status(500).json({
                error: 'Error al obtener inspecciones',
                details: err.message
            });
        }

        res.json(results);
    });
});

// ===== FIN DE ENDPOINTS PARA ADMINISTRACIÓN DE INSPECCIONES =====

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');

// Usar rutas
app.use('/api/auth', authRoutes);

// ===== RUTAS PARA SERVIR PÁGINAS HTML =====
// Ruta raíz - muestra el índice de páginas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Rutas específicas para las páginas principales
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/login_screen.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/admin_login_screen.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/register_screen.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/dashboard.html'));
});

app.get('/preoperacional-carro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/preoperacional_carro.html'));
});

app.get('/preoperacional-moto', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/preoperacional_moto.html'));
});

app.get('/password-recovery', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/password_recovery.html'));
});

// Ruta para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Ruta de prueba para el endpoint de inspecciones
app.post('/api/test-inspection', (req, res) => {
    console.log('🧪 Prueba de endpoint de inspecciones');
    console.log('Body recibido:', req.body);
    
    res.json({
        message: 'Endpoint de prueba funcionando',
        received_data: req.body,
        timestamp: new Date().toISOString()
    });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
}); 