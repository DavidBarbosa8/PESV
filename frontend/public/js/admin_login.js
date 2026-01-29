document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('adminLoginForm').addEventListener('submit', async function(event) {
      event.preventDefault();
  
      const email = document.getElementById('username').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
  
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('El servidor no está disponible. Por favor, intente más tarde.');
          }
          const data = await response.json();
          throw new Error(data.error || 'Error al iniciar sesión');
        }
  
        const data = await response.json();
  
        if (data.token) {
          // Guardar el token y la información del usuario
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Redirigir al dashboard
          window.location.href = 'dashboard.html';
        } else {
          throw new Error('No se recibió el token de autenticación');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error de conexión con el servidor. Por favor, intente nuevamente.');
      }
    });
  });