const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'DavidB',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pesv_db'
});

async function setupDatabase() {
    try {
        // Conectar a la base de datos
        await db.promise().connect();
        console.log('✅ Conectado a la base de datos MySQL');

        // Crear tabla roles si no existe
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL UNIQUE,
                descripcion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla roles verificada/creada');

        // Insertar roles básicos si no existen
        await db.promise().query(`
            INSERT IGNORE INTO roles (nombre, descripcion) VALUES 
            ('admin_empresa', 'Administrador de empresa'),
            ('conductor', 'Conductor de vehículo')
        `);
        console.log('✅ Roles básicos verificados/creados');

        // Verificar estructura de la tabla usuarios
        const [columns] = await db.promise().query('SHOW COLUMNS FROM usuarios');
        const columnNames = columns.map(col => col.Field);

        // Agregar rol_id si no existe
        if (!columnNames.includes('rol_id')) {
            await db.promise().query(`
                ALTER TABLE usuarios 
                ADD COLUMN rol_id INT,
                ADD FOREIGN KEY (rol_id) REFERENCES roles(id)
            `);
            console.log('✅ Columna rol_id agregada a usuarios');
        }

        console.log('\n✅ Base de datos configurada correctamente');
        console.log('\nPuedes crear un administrador usando el endpoint:');
        console.log('POST /api/register-company');
        console.log('\nEjemplo de datos:');
        console.log(JSON.stringify({
            nombreEmpresa: "Mi Empresa",
            nit: "123456789",
            direccion: "Calle Principal 123",
            telefonoEmpresa: "1234567890",
            emailEmpresa: "empresa@ejemplo.com",
            nombreAdmin: "Admin",
            identificacion: "123456789",
            telefonoAdmin: "0987654321",
            emailAdmin: "admin@ejemplo.com",
            password: "contraseña123"
        }, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        db.end();
    }
}

setupDatabase(); 