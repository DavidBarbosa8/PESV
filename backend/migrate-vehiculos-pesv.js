const mysql = require('mysql2');
require('dotenv').config();

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'DavidB',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pesv_db'
});

async function migrateVehiculosPESV() {
    try {
        console.log('🚀 Iniciando migración de tabla vehiculos para PESV...\n');

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

        // Verificar si los campos ya existen
        const checkFieldsQuery = `
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'pesv_db' 
            AND TABLE_NAME = 'vehiculos' 
            AND COLUMN_NAME IN ('empresa_id', 'anio', 'color', 'numero_motor')
        `;

        const [existingFields] = await db.promise().query(checkFieldsQuery);
        
        if (existingFields.length > 0) {
            console.log('⚠️  Algunos campos ya existen en la tabla vehiculos');
            console.log('   Campos encontrados:', existingFields.map(f => f.COLUMN_NAME).join(', '));
            console.log('   Continuando con la migración...\n');
        }

        // Ejecutar migración paso a paso
        const migrationSteps = [
            {
                name: 'Agregando campos básicos del vehículo',
                queries: [
                    'ALTER TABLE vehiculos ADD COLUMN empresa_id int DEFAULT NULL AFTER usuario_id',
                    'ALTER TABLE vehiculos ADD COLUMN anio int DEFAULT NULL AFTER modelo',
                    'ALTER TABLE vehiculos ADD COLUMN color varchar(30) DEFAULT NULL AFTER anio',
                    'ALTER TABLE vehiculos ADD COLUMN numero_motor varchar(50) DEFAULT NULL AFTER color',
                    'ALTER TABLE vehiculos ADD COLUMN numero_chasis varchar(50) DEFAULT NULL AFTER numero_motor',
                    'ALTER TABLE vehiculos ADD COLUMN cilindraje varchar(20) DEFAULT NULL AFTER numero_chasis'
                ]
            },
            {
                name: 'Agregando campos de capacidad',
                queries: [
                    'ALTER TABLE vehiculos ADD COLUMN capacidad_pasajeros int DEFAULT NULL AFTER cilindraje',
                    'ALTER TABLE vehiculos ADD COLUMN capacidad_carga decimal(8,2) DEFAULT NULL AFTER capacidad_pasajeros'
                ]
            },
            {
                name: 'Agregando fechas de mantenimiento',
                queries: [
                    'ALTER TABLE vehiculos ADD COLUMN fecha_adquisicion date DEFAULT NULL AFTER capacidad_carga',
                    'ALTER TABLE vehiculos ADD COLUMN fecha_ultimo_mantenimiento date DEFAULT NULL AFTER fecha_adquisicion',
                    'ALTER TABLE vehiculos ADD COLUMN proximo_mantenimiento date DEFAULT NULL AFTER fecha_ultimo_mantenimiento'
                ]
            },
            {
                name: 'Agregando estados de documentación',
                queries: [
                    'ALTER TABLE vehiculos ADD COLUMN estado_tecnomecanica enum(\'vigente\',\'por_vencer\',\'vencida\',\'no_aplica\') DEFAULT \'no_aplica\' AFTER proximo_mantenimiento',
                    'ALTER TABLE vehiculos ADD COLUMN fecha_vencimiento_tecnomecanica date DEFAULT NULL AFTER estado_tecnomecanica',
                    'ALTER TABLE vehiculos ADD COLUMN estado_soat enum(\'vigente\',\'por_vencer\',\'vencido\',\'no_aplica\') DEFAULT \'no_aplica\' AFTER fecha_vencimiento_tecnomecanica',
                    'ALTER TABLE vehiculos ADD COLUMN fecha_vencimiento_soat date DEFAULT NULL AFTER estado_soat',
                    'ALTER TABLE vehiculos ADD COLUMN estado_seguro enum(\'vigente\',\'por_vencer\',\'vencido\',\'no_aplica\') DEFAULT \'no_aplica\' AFTER fecha_vencimiento_soat',
                    'ALTER TABLE vehiculos ADD COLUMN fecha_vencimiento_seguro date DEFAULT NULL AFTER estado_seguro'
                ]
            },
            {
                name: 'Agregando campos de seguimiento',
                queries: [
                    'ALTER TABLE vehiculos ADD COLUMN kilometraje_actual decimal(10,2) DEFAULT \'0.00\' AFTER fecha_vencimiento_seguro',
                    'ALTER TABLE vehiculos ADD COLUMN ultima_inspeccion date DEFAULT NULL AFTER kilometraje_actual',
                    'ALTER TABLE vehiculos ADD COLUMN observaciones text DEFAULT NULL AFTER ultima_inspeccion',
                    'ALTER TABLE vehiculos ADD COLUMN creado_en timestamp NULL DEFAULT CURRENT_TIMESTAMP AFTER observaciones',
                    'ALTER TABLE vehiculos ADD COLUMN actualizado_en timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER creado_en'
                ]
            }
        ];

        // Ejecutar cada paso de la migración
        for (const step of migrationSteps) {
            console.log(`🔄 ${step.name}...`);
            for (const query of step.queries) {
                try {
                    await db.promise().query(query);
                } catch (error) {
                    if (error.code === 'ER_DUP_FIELDNAME') {
                        console.log(`   ⚠️  Campo ya existe, continuando...`);
                    } else {
                        console.log(`   ❌ Error: ${error.message}`);
                        throw error;
                    }
                }
            }
            console.log(`   ✅ ${step.name} completado`);
        }

        // Agregar índices
        console.log('\n🔄 Agregando índices para mejorar rendimiento...');
        const indexQueries = [
            'CREATE INDEX idx_empresa_id ON vehiculos (empresa_id)',
            'CREATE INDEX idx_tipo_vehiculo ON vehiculos (tipo_vehiculo)',
            'CREATE INDEX idx_activo ON vehiculos (activo)',
            'CREATE INDEX idx_estado_tecnomecanica ON vehiculos (estado_tecnomecanica)',
            'CREATE INDEX idx_estado_soat ON vehiculos (estado_soat)',
            'CREATE INDEX idx_fecha_vencimiento_tecnomecanica ON vehiculos (fecha_vencimiento_tecnomecanica)',
            'CREATE INDEX idx_fecha_vencimiento_soat ON vehiculos (fecha_vencimiento_soat)'
        ];

        for (const query of indexQueries) {
            try {
                await db.promise().query(query);
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log('   ⚠️  Índice ya existe, continuando...');
                } else {
                    console.log(`   ⚠️  Error al crear índice: ${error.message}`);
                }
            }
        }

        // Verificar estructura final
        console.log('\n🔍 Verificando estructura final de la tabla...');
        const [columns] = await db.promise().query('DESCRIBE vehiculos');
        
        console.log('\n📋 Estructura actualizada de la tabla vehiculos:');
        columns.forEach(column => {
            console.log(`   - ${column.Field} (${column.Type})`);
        });

        console.log('\n✅ Migración de tabla vehiculos completada exitosamente!');
        console.log('\n📊 Campos agregados:');
        console.log('   • Información básica: empresa_id, año, color, motor, chasis, cilindraje');
        console.log('   • Capacidades: pasajeros, carga');
        console.log('   • Mantenimiento: fechas de adquisición, mantenimiento');
        console.log('   • Documentación: tecnomecánica, SOAT, seguro');
        console.log('   • Seguimiento: kilometraje, inspecciones, observaciones');
        console.log('   • Trazabilidad: timestamps de creación y actualización');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    } finally {
        db.end();
    }
}

// Ejecutar migración
migrateVehiculosPESV()
    .then(() => {
        console.log('\n🎉 Migración completada exitosamente!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error en la migración:', error);
        process.exit(1);
    }); 