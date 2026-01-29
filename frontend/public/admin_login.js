document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Esto es importante para manejar cookies
                body: JSON.stringify({
                    email: username,
                    password: password,
                    remember: remember
                })
            });

            if (!response.ok) {
                throw new Error('Error en la autenticación');
            }

            const data = await response.json();
            
            // Si la autenticación es exitosa, redirigir al dashboard
            if (data.success) {
                window.location.href = 'dashboard.html';
            } else {
                alert('Credenciales inválidas');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al intentar iniciar sesión. Por favor, intente nuevamente.');
        }
    });
}); 