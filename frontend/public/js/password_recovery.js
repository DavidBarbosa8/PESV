// Función para generar un código de verificación aleatorio de 6 dígitos
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Función para enviar el código de verificación
async function sendVerificationCode(email) {
    try {
        const response = await fetch('/api/send-verification-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            throw new Error('Error al enviar el código de verificación');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Función para verificar el código y actualizar la contraseña
async function verifyCodeAndUpdatePassword(email, code, newPassword) {
    try {
        const response = await fetch('/api/verify-code-and-update-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code, newPassword })
        });

        if (!response.ok) {
            throw new Error('Error al verificar el código y actualizar la contraseña');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Función para validar la contraseña
function validatePassword(password) {
    // Mínimo 8 caracteres, al menos una letra mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
}

// Función para mostrar mensajes de error
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline">${message}</span>
    `;
    
    const form = document.querySelector('form');
    form.parentNode.insertBefore(errorDiv, form.nextSibling);
    
    // Remover el mensaje después de 5 segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4';
    successDiv.role = 'alert';
    successDiv.innerHTML = `
        <strong class="font-bold">¡Éxito!</strong>
        <span class="block sm:inline">${message}</span>
    `;
    
    const form = document.querySelector('form');
    form.parentNode.insertBefore(successDiv, form.nextSibling);
    
    // Remover el mensaje después de 5 segundos
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
} 