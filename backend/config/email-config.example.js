// Configuración de Correo Electrónico - Ejemplo
// Copia este archivo como email-config.js y configura tus credenciales

module.exports = {
    // Configuración para Gmail
    service: 'gmail',
    auth: {
        user: 'tu_correo@gmail.com',
        pass: 'tu_contraseña_de_aplicacion'
    }
};

/*
INSTRUCCIONES PARA CONFIGURAR GMAIL:

1. Habilita la verificación en dos pasos en tu cuenta de Google:
   - Ve a https://myaccount.google.com/security
   - Activa "Verificación en dos pasos"

2. Genera una contraseña de aplicación:
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Correo" como aplicación
   - Genera la contraseña

3. Usa esa contraseña en lugar de tu contraseña normal

4. Configura las variables de entorno en tu archivo .env:
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASSWORD=tu_contraseña_de_aplicacion

5. Reinicia el servidor después de configurar las variables de entorno

NOTA: Nunca subas tus credenciales reales al repositorio.
*/ 