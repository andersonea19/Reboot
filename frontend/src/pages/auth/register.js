import { modal } from '../../modules/modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('plan') === 'pro') {
        localStorage.setItem('registroPro', 'true');
    } else {
        localStorage.removeItem('registroPro');
    }

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
        // Validación de Nombre (solo letras y espacios, mín 2 caracteres)
        const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        if (!nombreRegex.test(nombre) || nombre.length < 2) {
            msgError.textContent = 'El nombre solo debe contener letras y tener al menos 2 caracteres.';
            return;
        }

        // Validación de Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            msgError.textContent = 'El correo electrónico no es válido.';
            return;
        }

        // Validación de Contraseña (mínimo 8 caracteres)
        if (contrasena.length < 8) {
            msgError.textContent = 'La contraseña debe tener al menos 8 caracteres.';
            return;
        }
        if (contrasena !== confirmarContrasena) {
            msgError.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        // Validación de Fecha de Nacimiento (Edad lógica entre 10 y 100 años)
        if (!fechaNacimiento) {
            msgError.textContent = 'Debe ingresar su fecha de nacimiento.';
            return;
        }
        const nacimientoDate = new Date(fechaNacimiento);
        const hoy = new Date();
        const edad = hoy.getFullYear() - nacimientoDate.getFullYear();
        if (edad < 10 || edad > 100 || isNaN(nacimientoDate.getTime())) {
            msgError.textContent = 'Ingrese una fecha de nacimiento válida (edad requerida entre 10 y 100 años).';
            return;
        }

        const isPro = localStorage.getItem('registroPro') === 'true';

        // 3. Armar el Objeto DTO (Debe hacer match exacto con el Java Backend)
        const dtoRegistro = {
            nombre: nombre,
            email: email,
            psswd: contrasena,
            fechaNacimiento: fechaNacimiento,
            idPaquete: isPro ? 2 : 1
        };



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
                msgError.textContent = dataError.mensaje || "Error 400: Revisa los datos de registro.";
                return;
            }

            // Convertimos la respuesta exitosa (o un 401/500 manejado por tu backend) a JSON
            const data = await respuesta.json();

            // Evaluamos la bandera booleana "ok" de tu clase JsonResponse.java
            if (data.ok) {
                await modal.info('Tu cuenta ha sido registrada exitosamente. Ahora puedes iniciar sesión.', 'Registro Exitoso');
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