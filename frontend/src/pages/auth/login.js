document.addEventListener('DOMContentLoaded', () => {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    const formLogin = document.getElementById('form-login');
    const msgError = document.getElementById('error-login');

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Los IDs coinciden exactamente con login.html (#email, #contrasena)
            const email = document.getElementById('email').value.trim();
            const psswd = document.getElementById('contrasena').value.trim();

            // Validación mínima en cliente antes de llamar al servidor
            if (!email || !psswd) {
                msgError.textContent = "Por favor ingrese su correo y contraseña.";
                return;
            }

            try {
                const response = await fetch(`${URL_BASE}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // Obligatorio: permite que el navegador reciba y reenvíe la cookie JSESSIONID de Tomcat
                    credentials: 'include',
                    // Las claves email y psswd coinciden con LoginRequest.java en el backend
                    body: JSON.stringify({ email, psswd })
                });

                const data = await response.json();

                if (data.ok) {
                    if (data.data && data.data.idRol === 2) {
                        window.location.replace('../dashboard/dashboard.html');
                    } else {
                        // Redirección limpia al Onboarding; la cookie JSESSIONID ya quedó guardada
                        window.location.replace('../onboarding/onboarding.html');
                    }
                } else {
                    msgError.textContent = data.mensaje || "Credenciales incorrectas.";
                }
            } catch (error) {
                console.error("Error en la conexión de login:", error);
                msgError.textContent = "Error al conectar con el servidor.";
            }
        });
    }
});