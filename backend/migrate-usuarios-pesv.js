const mysql = require('mysql2');
require('dotenv').config();

// Configuración de la conexión a MySQL (usando las mismas credenciales que el proyecto)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'DavidB',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pesv_db'
});

async function migrateUsuariosPESV() {
    try {
        console.log('🚀 Iniciando migración de tabla usuarios para PESV...\n');

        // Conectar a la base de datos
        await new Promise((resolve, reject) => {
            db.connect((err) => {
                if (err) {
                    console.error('❌ Error conectando a la base de datos:', err);
                    reject(err);
                } else {
                    console.log('✅ Conectado a la base de datos MySQL');
                    resolve();
                }
            });
        });

        // Verificar estructura actual de la tabla
        console.log('🔍 Verificando estructura actual de la tabla usuarios...');
        const currentStructure = await new Promise((resolve, reject) => {
            db.query('DESCRIBE usuarios', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        console.log('📋 Campos actuales en la tabla usuarios:');
        currentStructure.forEach(field => {
            console.log(`  - ${field.Field} (${field.Type})`);
        });

        // Verificar si los campos ya existen
        const existingFields = currentStructure.map(field => field.Field);
        const newFields = [
            'numero_licencia',
            'categoria_licencia', 
            'fecha_vencimiento_licencia',
            'fecha_ingreso_empresa',
            'estado_capacitacion_pesv',
            'fecha_ultima_capacitacion',
            'fecha_proxima_capacitacion'
        ];

        const missingFields = newFields.filter(field => !existingFields.includes(field));

        if (missingFields.length === 0) {
            console.log('\n✅ Todos los campos PESV ya existen en la tabla usuarios');
            console.log('No es necesario ejecutar la migración.');
            return;
        }

        console.log(`\n📝 Campos faltantes: ${missingFields.join(', ')}`);

        // Ejecutar migración paso a paso
        console.log('\n🔧 Ejecutando migración...\n');

        // 1. Agregar campos específicos para conductores (usando rol_id en lugar de rol)
        console.log('1️⃣ Agregando campos específicos para conductores...');
        
        for (const field of missingFields) {
            let alterQuery = '';
            switch (field) {
                case 'numero_licencia':
                    alterQuery = 'ADD COLUMN `numero_licencia` varchar(20) DEFAULT NULL AFTER `rol_id`';
                    break;
                case 'categoria_licencia':
                    alterQuery = 'ADD COLUMN `categoria_licencia` varchar(10) DEFAULT NULL AFTER `numero_licencia`';
                    break;
                case 'fecha_vencimiento_licencia':
                    alterQuery = 'ADD COLUMN `fecha_vencimiento_licencia` date DEFAULT NULL AFTER `categoria_licencia`';
                    break;
                case 'fecha_ingreso_empresa':
                    alterQuery = 'ADD COLUMN `fecha_ingreso_empresa` date DEFAULT NULL AFTER `fecha_vencimiento_licencia`';
                    break;
                case 'estado_capacitacion_pesv':
                    alterQuery = 'ADD COLUMN `estado_capacitacion_pesv` enum(\'pendiente\',\'en_proceso\',\'completada\',\'vencida\') DEFAULT \'pendiente\' AFTER `fecha_ingreso_empresa`';
                    break;
                case 'fecha_ultima_capacitacion':
                    alterQuery = 'ADD COLUMN `fecha_ultima_capacitacion` date DEFAULT NULL AFTER `estado_capacitacion_pesv`';
                    break;
                case 'fecha_proxima_capacitacion':
                    alterQuery = 'ADD COLUMN `fecha_proxima_capacitacion` date DEFAULT NULL AFTER `fecha_ultima_capacitacion`';
                    break;
            }

            if (alterQuery) {
                await new Promise((resolve, reject) => {
                    db.query(`ALTER TABLE usuarios ${alterQuery}`, (err, result) => {
                        if (err) {
                            console.error(`❌ Error agregando campo ${field}:`, err.message);
                            reject(err);
                        } else {
                            console.log(`✅ Campo ${field} agregado correctamente`);
                            resolve(result);
                        }
                    });
                });
            }
        }

        // 2. Agregar índices para mejorar el rendimiento
        console.log('\n2️⃣ Agregando índices para optimizar consultas...');
        
        const indexes = [
            { name: 'numero_licencia', query: 'ADD UNIQUE KEY `numero_licencia` (`numero_licencia`)' },
            { name: 'idx_rol_id', query: 'ADD KEY `idx_rol_id` (`rol_id`)' },
            { name: 'idx_estado_capacitacion', query: 'ADD KEY `idx_estado_capacitacion` (`estado_capacitacion_pesv`)' },
            { name: 'idx_fecha_vencimiento_licencia', query: 'ADD KEY `idx_fecha_vencimiento_licencia` (`fecha_vencimiento_licencia`)' }
        ];

        for (const index of indexes) {
            try {
                await new Promise((resolve, reject) => {
                    db.query(`ALTER TABLE usuarios ${index.query}`, (err, result) => {
                        if (err) {
                            if (err.code === 'ER_DUP_KEYNAME') {
                                console.log(`ℹ️  Índice ${index.name} ya existe`);
                                resolve();
                            } else {
                                reject(err);
                            }
                        } else {
                            console.log(`✅ Índice ${index.name} agregado correctamente`);
                            resolve(result);
                        }
                    });
                });
            } catch (error) {
                console.error(`❌ Error agregando índice ${index.name}:`, error.message);
            }
        }

        // 3. Verificar si existe la tabla roles y crear roles básicos si es necesario
        console.log('\n3️⃣ Verificando tabla de roles...');
        
        const rolesExist = await new Promise((resolve, reject) => {
            db.query('SHOW TABLES LIKE "roles"', (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0);
            });
        });

        if (!rolesExist) {
            console.log('ℹ️  Tabla roles no existe, creando roles básicos...');
            
            // Crear tabla roles
            await new Promise((resolve, reject) => {
                db.query(`
                    CREATE TABLE roles (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        nombre VARCHAR(50) NOT NULL UNIQUE,
                        descripcion TEXT,
                        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            // Insertar roles básicos
            const roles = [
                { nombre: 'superadmin', descripcion: 'Super administrador del sistema' },
                { nombre: 'admin_empresa', descripcion: 'Administrador de empresa' },
                { nombre: 'conductor', descripcion: 'Conductor de vehículos' }
            ];

            for (const role of roles) {
                await new Promise((resolve, reject) => {
                    db.query(
                        'INSERT INTO roles (nombre, descripcion) VALUES (?, ?)',
                        [role.nombre, role.descripcion],
                        (err, result) => {
                            if (err && err.code !== 'ER_DUP_ENTRY') reject(err);
                            else resolve(result);
                        }
                    );
                });
            }
            console.log('✅ Roles básicos creados');
        } else {
            console.log('✅ Tabla roles ya existe');
        }

        // 4. Verificar la migración
        console.log('\n4️⃣ Verificando migración...');
        
        const finalStructure = await new Promise((resolve, reject) => {
            db.query('DESCRIBE usuarios', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        console.log('\n📋 Estructura final de la tabla usuarios:');
        finalStructure.forEach(field => {
            console.log(`  - ${field.Field} (${field.Type})`);
        });

        // 5. Estadísticas finales
        const stats = await new Promise((resolve, reject) => {
            db.query(`
                SELECT 
                    COUNT(*) as total_usuarios,
                    COUNT(CASE WHEN rol_id = 3 THEN 1 END) as conductores,
                    COUNT(CASE WHEN rol_id = 2 THEN 1 END) as admins_empresa,
                    COUNT(CASE WHEN rol_id = 1 THEN 1 END) as superadmins
                FROM usuarios
            `, (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        console.log('\n📊 Estadísticas finales:');
        console.log(`  - Total usuarios: ${stats.total_usuarios}`);
        console.log(`  - Conductores: ${stats.conductores}`);
        console.log(`  - Admins empresa: ${stats.admins_empresa}`);
        console.log(`  - Superadmins: ${stats.superadmins}`);

        console.log('\n✅ ¡Migración completada exitosamente!');
        console.log('\n🎯 Próximos pasos:');
        console.log('  1. Ejecutar: node insert-test-data-mejorado.js');
        console.log('  2. Probar formularios de inspección');
        console.log('  3. Verificar que los nuevos campos funcionen correctamente');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        console.error('Detalles:', error.message);
    } finally {
        db.end();
    }
}

// Ejecutar migración
migrateUsuariosPESV(); 