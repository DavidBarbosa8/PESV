const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando configuración del sistema...\n');

try {
    // 1. Configurar la base de datos
    console.log('📦 Configurando la base de datos...');
    execSync('node setup-database.js', { stdio: 'inherit' });
    console.log('✅ Base de datos configurada\n');

    // 2. Verificar la conexión
    console.log('🔍 Verificando la conexión...');
    execSync('node test-connection.js', { stdio: 'inherit' });
    console.log('✅ Conexión verificada\n');

    // 3. Instalar dependencias si es necesario
    console.log('📥 Verificando dependencias...');
    if (!require('fs').existsSync(path.join(__dirname, 'node_modules'))) {
        console.log('Instalando dependencias...');
        execSync('npm install', { stdio: 'inherit' });
    }
    console.log('✅ Dependencias verificadas\n');

    // 4. Iniciar el servidor
    console.log('🚀 Iniciando el servidor...');
    console.log('\nPara detener el servidor, presiona Ctrl+C\n');
    execSync('npm run dev', { stdio: 'inherit' });

} catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    process.exit(1);
} 