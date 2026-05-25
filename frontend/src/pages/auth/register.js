document.addEventListener('DOMContentLoaded', () => {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    const formRegister = document.getElementById('form-register');
    const msgError = document.getElementById('error-registro');

    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        msgError.textContent = ''; // Limpiamos errores previos

        // 1. Recolectar datos del DOM
        const nombre = document.getElementById('nombre').value.trim();
        const fechaNacimiento = document.getElementById('fechaNacimiento').value;
        const email = document.getElementById('email').value.trim();
        const contrasena = document.getElementById('contrasena').value;
        const confirmarContrasena = document.getElementById('confirmarContrasena').value;

        // 2. Validación frontend rápida
        if (contrasena !== confirmarContrasena) {
            msgError.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        // 3. Armar el Objeto DTO (Debe hacer match exacto con el Java Backend)
        const dtoRegistro = {
            nombre: nombre,
            email: email,
            psswd: contrasena,
            fechaNacimiento: fechaNacimiento
        };

        console.log("JSON que se está enviando al backend:", JSON.stringify(dtoRegistro));

        // 4. Iniciar el Fetch dentro del try-catch
        try {
            // AQUÍ se define "respuesta"
            const respuesta = await fetch(`${URL_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dtoRegistro)
            });

            // Si el backend lanza error 400 (Bad Request), lo capturamos antes de que explote
            if (!respuesta.ok && respuesta.status === 400) {
                const dataError = await respuesta.json();
                console.error("El backend rechazó los datos (400):", dataError);
                msgError.textContent = "Error 400: El formato de los datos no coincide. Revisa la consola.";
                return;
            }

            // Convertimos la respuesta exitosa (o un 401/500 manejado por tu backend) a JSON
            const data = await respuesta.json();

            // Evaluamos la bandera booleana "ok" de tu clase JsonResponse.java
            if (data.ok) {
                alert('Registro exitoso. Ahora inicia sesión.');
                window.location.href = 'login.html';
            } else {
                // El backend respondió correctamente pero con un mensaje de error (ej. "El email ya existe")
                msgError.textContent = data.mensaje || 'Error al registrar el usuario.';
            }

        } catch (error) {
            // Este bloque atrapa errores como que Tomcat esté apagado o que CorsFilter haya fallado
            console.error('Error crítico de red o fetch:', error);
            msgError.textContent = 'Error de conexión con el servidor.';
        }
    });
});