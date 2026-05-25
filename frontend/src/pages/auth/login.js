document.addEventListener('DOMContentLoaded', () => {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    const formLogin = document.getElementById('form-login');
    const msgError = document.getElementById('error-login');

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        msgError.textContent = '';

        // 1. Capturamos el EMAIL en lugar del nombre
        const email = document.getElementById('email').value.trim();
        const contrasena = document.getElementById('contrasena').value;

        // 2. DTO con las claves EXACTAS que tu Java espera
        const dtoLogin = {
            email: email, 
            psswd: contrasena  // es psswd
        };

        try {
            const respuesta = await fetch(`${URL_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // ¡VITAL para la cookie JSESSIONID!
                body: JSON.stringify(dtoLogin)
            });

            // Capturar el 400 por si acaso
            if (!respuesta.ok && respuesta.status === 400) {
                const dataError = await respuesta.json();
                console.error("Error 400:", dataError);
                msgError.textContent = "Datos incorrectos. Revisa tu email o contraseña.";
                return;
            }

            const data = await respuesta.json();

            if (data.ok) {
                // ¡BINGO! Login exitoso. Nos vamos al Onboarding.
                window.location.href = '../onboarding/onboarding.html';
            } else {
                msgError.textContent = data.mensaje || 'Credenciales incorrectas.';
            }
        } catch (error) {
            console.error('Error en login:', error);
            msgError.textContent = 'Error de conexión con el servidor.';
        }
    });
});