/**
 * configuracionPanel.js — Panel de Configuración de Cuenta del Dashboard SPA.
 * 
 * Permite al usuario cambiar su contraseña. La verificación de la contraseña
 * actual y el hasheo BCrypt se ejecutan en el backend.
 * 
 * Endpoint consumido:
 *   PUT /api/auth/password → Cambio de contraseña
 */

const URL_BASE = 'http://localhost:8080/RebootBackend/api';

/**
 * Función de renderizado del panel de configuración.
 * Se registra en el dashboardRouter y se invoca al navegar.
 * @param {HTMLElement} container - Contenedor #dashboard-view
 */
export async function renderConfiguracionPanel(container) {
    container.innerHTML = `
        <section class="panel">
            <h2 class="panel__titulo">Configuración de Cuenta</h2>

            <div id="config-alerta"></div>

            <form id="form-cambio-password" class="panel__form">
                <h3 class="panel__subtitulo">Cambiar Contraseña</h3>

                <div class="panel__campo">
                    <label class="panel__label" for="password-actual">Contraseña Actual</label>
                    <input class="panel__input" type="password" id="password-actual" 
                           placeholder="Ingresa tu contraseña actual" required>
                </div>

                <div class="panel__campo">
                    <label class="panel__label" for="password-nueva">Nueva Contraseña</label>
                    <input class="panel__input" type="password" id="password-nueva" 
                           placeholder="Mínimo 8 caracteres" required minlength="8">
                </div>

                <div class="panel__campo">
                    <label class="panel__label" for="password-confirmar">Confirmar Nueva Contraseña</label>
                    <input class="panel__input" type="password" id="password-confirmar" 
                           placeholder="Repite la nueva contraseña" required minlength="8">
                </div>

                <div class="panel__acciones">
                    <button type="submit" class="panel__boton panel__boton--guardar">Cambiar Contraseña</button>
                </div>
            </form>
        </section>
    `;

    // Asociar evento de submit
    const form = container.querySelector('#form-cambio-password');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await _ejecutarCambioPassword(container);
        });
    }
}

/**
 * Ejecuta el flujo de cambio de contraseña:
 * 1. Validación client-side
 * 2. PUT /api/auth/password
 * 3. Feedback visual
 */
async function _ejecutarCambioPassword(container) {
    const alertaEl = container.querySelector('#config-alerta');
    const actual = document.getElementById('password-actual').value.trim();
    const nueva = document.getElementById('password-nueva').value.trim();
    const confirmar = document.getElementById('password-confirmar').value.trim();

    // Limpiar alertas anteriores
    alertaEl.innerHTML = '';

    // Validación client-side
    if (!actual || !nueva || !confirmar) {
        alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--error">Completa todos los campos.</div>';
        return;
    }

    if (nueva.length < 8) {
        alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--error">La nueva contraseña debe tener al menos 8 caracteres.</div>';
        return;
    }

    if (nueva !== confirmar) {
        alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--error">Las contraseñas nuevas no coinciden.</div>';
        return;
    }

    if (actual === nueva) {
        alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--error">La nueva contraseña debe ser diferente a la actual.</div>';
        return;
    }

    try {
        const respuesta = await fetch(`${URL_BASE}/auth/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ actual, nueva })
        });

        const json = await respuesta.json();

        if (json.ok) {
            alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--exito">Contraseña actualizada correctamente.</div>';
            // Limpiar formulario tras éxito
            document.getElementById('password-actual').value = '';
            document.getElementById('password-nueva').value = '';
            document.getElementById('password-confirmar').value = '';
        } else {
            alertaEl.innerHTML = `<div class="panel__alerta panel__alerta--error">${json.mensaje || 'Error al cambiar la contraseña.'}</div>`;
        }
    } catch (error) {
        console.error('[ConfigPanel] Error:', error);
        alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--error">Error de conexión. Intenta de nuevo.</div>';
    }
}
