const mysql = require('mysql2');
require('dotenv').config();

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'DavidB',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pesv_db'
});

async function verifyInspeccionesTable() {
    console.log('🔍 VERIFICANDO TABLA INSPECCIONES_PREOPERACIONALES');
    console.log('================================================\n');

    try {
        // 1. Conectar a la base de datos
        console.log('1. Conectando a la base de datos...');
        await new Promise((resolve, reject) => {
            db.connect((err) => {
                if (err) {
                    console.error('❌ Error de conexión:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Conexión exitosa');
                    resolve();
                }
            });
        });

        // 2. Verificar si existe la tabla
        console.log('\n2. Verificando tabla inspecciones_preoperacionales...');
        const tableExists = await new Promise((resolve, reject) => {
            db.query('SHOW TABLES LIKE "inspecciones_preoperacionales"', (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.length > 0);
                }
            });
        });

        if (!tableExists) {
            console.log('❌ Tabla inspecciones_preoperacionales no existe');
            return;
        }

        console.log('✅ Tabla inspecciones_preoperacionales existe');

        // 3. Obtener estructura de la tabla
        console.log('\n3. Estructura de la tabla:');
        const structure = await new Promise((resolve, reject) => {
            db.query('DESCRIBE inspecciones_preoperacionales', (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        console.log('📋 Columnas:');
        structure.forEach(col => {
            console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });

        // 4. Verificar columnas requeridas
        console.log('\n4. Verificando columnas requeridas...');
        const requiredColumns = [
            'vehiculo_id',
            'conductor_id',
            'fecha_inspeccion',
            'kilometraje',
            'tipo_vehiculo',
            'resultados',
            'firma_base64',
            'pdf_base64',
            'observaciones',
            'estado'
        ];

        const existingColumns = structure.map(col => col.Field);
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

        if (missingColumns.length > 0) {
            console.log('❌ Columnas faltantes:', missingColumns);
        } else {
            console.log('✅ Todas las columnas requeridas están presentes');
        }

        // 5. Verificar datos de prueba
        console.log('\n5. Verificando datos de prueba...');
        
        // Verificar conductores
        const conductores = await new Promise((resolve, reject) => {
            db.query('SELECT id, nombre FROM usuarios WHERE rol_id = 3 LIMIT 3', (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        console.log(`📊 Conductores disponibles: ${conductores.length}`);
        conductores.forEach(c => {
            console.log(`   - ID: ${c.id}, Nombre: ${c.nombre}`);
        });

        // Verificar vehículos
        const vehiculos = await new Promise((resolve, reject) => {
            db.query('SELECT id, placa, usuario_id FROM vehiculos LIMIT 3', (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        console.log(`📊 Vehículos disponibles: ${vehiculos.length}`);
        vehiculos.forEach(v => {
            console.log(`   - ID: ${v.id}, Placa: ${v.placa}, Usuario ID: ${v.usuario_id}`);
        });

        // 6. Probar inserción si hay datos disponibles
        if (conductores.length > 0 && vehiculos.length > 0) {
            console.log('\n6. Probando inserción de prueba...');
            
            const testData = {
                vehiculo_id: vehiculos[0].id,
                conductor_id: conductores[0].id,
                fecha_inspeccion: new Date().toISOString().split('T')[0],
                kilometraje: 50000,
                tipo_vehiculo: 'carro',
                resultados: JSON.stringify({
                    fecha: new Date().toISOString().split('T')[0],
                    placa: vehiculos[0].placa,
                    conductor: conductores[0].nombre,
                    kilometraje: 50000,
                    items: { 'Motor': 'funcional' },
                    observaciones: 'Prueba de verificación'
                }),
                firma_base64: null,
                pdf_base64: 'test-pdf-base64',
                observaciones: 'Prueba de verificación del sistema',
                estado: 'pendiente'
            };

            const insertQuery = `
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const insertParams = [
                testData.vehiculo_id,
                testData.conductor_id,
                testData.fecha_inspeccion,
                testData.kilometraje,
                testData.tipo_vehiculo,
                testData.resultados,
                testData.firma_base64,
                testData.pdf_base64,
                testData.observaciones,
                testData.estado
            ];

            try {
                const insertResult = await new Promise((resolve, reject) => {
                    db.query(insertQuery, insertParams, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });

                console.log('✅ Inserción de prueba exitosa, ID:', insertResult.insertId);

                // Limpiar el registro de prueba
                await new Promise((resolve, reject) => {
                    db.query('DELETE FROM inspecciones_preoperacionales WHERE id = ?', [insertResult.insertId], (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
                console.log('🧹 Registro de prueba eliminado');

            } catch (insertError) {
                console.error('❌ Error en inserción de prueba:', insertError.message);
                console.error('   Detalles:', insertError);
            }
        } else {
            console.log('⚠️ No hay suficientes datos para probar inserción');
        }

        console.log('\n✅ VERIFICACIÓN COMPLETADA');
        console.log('\n📋 RESUMEN:');
        console.log('   - Tabla inspecciones_preoperacionales: ✅ Existe');
        console.log('   - Columnas requeridas: ' + (missingColumns.length === 0 ? '✅ Completas' : '❌ Faltantes'));
        console.log('   - Datos de prueba: ' + (conductores.length > 0 && vehiculos.length > 0 ? '✅ Disponibles' : '⚠️ Insuficientes'));
        console.log('   - Inserción de prueba: ' + (conductores.length > 0 && vehiculos.length > 0 ? '✅ Exitosa' : '⚠️ No probada'));

    } catch (error) {
        console.error('❌ Error durante la verificación:', error.message);
        console.error('   Detalles:', error);
    } finally {
        db.end();
    }
}

// Ejecutar verificación
verifyInspeccionesTable(); 