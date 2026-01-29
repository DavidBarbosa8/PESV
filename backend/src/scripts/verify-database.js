const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'DavidB',
    password: process.env.DB_PASSWORD || 'Davinchi88@',
    database: process.env.DB_NAME || 'pesv_db'
});

async function verifyDatabase() {
    try {
        // Verificar conexión
        await db.promise().connect();
        console.log('✅ Conexión a la base de datos establecida');

        // Verificar tabla de inspecciones
        const [inspectionsTable] = await db.promise().query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = ? 
            AND table_name = 'inspecciones_preoperacionales'
        `, [process.env.DB_NAME]);

        if (inspectionsTable[0].count === 0) {
            console.log('❌ La tabla de inspecciones no existe');
            return false;
        }

        console.log('✅ La tabla de inspecciones existe');

        // Verificar estructura de la tabla
        const [columns] = await db.promise().query(`
            DESCRIBE inspecciones_preoperacionales
        `);

        console.log('\nEstructura de la tabla:');
        columns.forEach(column => {
            console.log(`- ${column.Field}: ${column.Type}`);
        });

        return true;
    } catch (error) {
        console.error('❌ Error al verificar la base de datos:', error);
        return false;
    } finally {
        db.end();
    }
}

verifyDatabase(); 