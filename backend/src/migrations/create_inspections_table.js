const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'DavidB',
    password: process.env.DB_PASSWORD || 'Davinchi88@',
    database: process.env.DB_NAME || 'pesv_db'
});

const createInspectionsTable = `
CREATE TABLE IF NOT EXISTS inspecciones_preoperacionales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    conductor_id INT NOT NULL,
    fecha_inspeccion DATETIME NOT NULL,
    kilometraje INT,
    tipo_vehiculo ENUM('carro', 'moto') NOT NULL,
    resultados JSON NOT NULL,
    firma_base64 LONGTEXT NOT NULL,
    pdf_base64 LONGTEXT NOT NULL,
    observaciones TEXT,
    estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
    FOREIGN KEY (conductor_id) REFERENCES usuarios(id)
)`;

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        process.exit(1);
    }
    console.log('✅ Conectado a la base de datos MySQL');

    db.query(createInspectionsTable, (err, result) => {
        if (err) {
            console.error('Error creando la tabla de inspecciones:', err);
            process.exit(1);
        }
        console.log('✅ Tabla de inspecciones creada exitosamente');
        process.exit(0);
    });
}); 