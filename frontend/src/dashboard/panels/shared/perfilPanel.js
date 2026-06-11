/**
 * perfilPanel.js — Panel de Perfil Físico del Dashboard SPA.
 * 
 * Renderiza los datos del perfil físico del usuario en modo lectura,
 * con la opción de habilitar edición y guardar cambios.
 * 
 * Endpoints consumidos:
 *   GET  /api/perfil/datos → Recuperar perfil completo
 *   PUT  /api/perfil/datos → Actualizar perfil
 */

import { sessionStore } from '../../../store/sessionStore.js';
const URL_BASE = 'http://localhost:8080/RebootBackend/api';

/**
 * Función de renderizado del panel de perfil.
 * Se registra en el dashboardRouter y se invoca al navegar.
 * @param {HTMLElement} container - Contenedor #dashboard-view
 */
export async function renderPerfilPanel(container) {
    // 1. Mostrar loader mientras se cargan los datos
    container.innerHTML = `
        <section class="panel">
            <h2 class="panel__titulo">Mi Perfil Físico</h2>
            <div class="panel__loader">Cargando datos del perfil...</div>
        </section>
    `;

    try {
        // 2. Fetch de los datos del perfil
        const respuesta = await fetch(`${URL_BASE}/perfil/datos`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const json = await respuesta.json();

        if (!json.ok || !json.data) {
            container.innerHTML = `
                <section class="panel">
                    <h2 class="panel__titulo">Mi Perfil Físico</h2>
                    <div class="panel__alerta panel__alerta--error">No se encontraron datos de perfil.</div>
                </section>
            `;
            return;
        }

        const perfil = json.data;
        const usuario = sessionStore.getUsuario();
        const isPro = usuario.idPaquete === 2;

        // 3. Renderizar formulario en modo lectura
        container.innerHTML = _construirFormulario(perfil, false, isPro);

        // 4. Asociar eventos
        _asociarEventos(container, perfil, isPro);

    } catch (error) {
        console.error('[PerfilPanel] Error:', error);
        container.innerHTML = `
            <section class="panel">
                <h2 class="panel__titulo">Mi Perfil Físico</h2>
                <div class="panel__alerta panel__alerta--error">Error al cargar el perfil. Intenta de nuevo.</div>
            </section>
        `;
    }
}

/**
 * Construye el HTML del formulario de perfil.
 * @param {Object} perfil - Datos del perfil desde el backend
 * @param {boolean} editable - Si los campos deben estar habilitados
 */
function _construirFormulario(perfil, editable, isPro) {
    const disabled = editable ? '' : 'disabled';
    const limitacionesTexto = perfil.limitacionesDetalle && perfil.limitacionesDetalle.length > 0
        ? perfil.limitacionesDetalle.map(l => l.nombre).join(', ')
        : 'Ninguna';

    return `
        <section class="panel">
            <div class="panel__header">
                <h2 class="panel__titulo">Mi Perfil Físico</h2>
                <div style="display: flex; gap: 10px;">
                    ${isPro ? '<button type="button" class="panel__boton" id="btn-cancelar-suscripcion" style="background-color: var(--rojo); color: var(--blanco);">Cancelar Suscripción</button>' : ''}
                    ${!editable ? '<button type="button" class="panel__boton panel__boton--editar" id="btn-editar-perfil">Editar Perfil</button>' : ''}
                </div>
            </div>

            <div id="perfil-alerta"></div>

            <form id="form-perfil" class="panel__form">
                <div class="panel__grid">
                    <div class="panel__campo">
                        <label class="panel__label" for="perfil-peso">Peso (kg)</label>
                        <input class="panel__input" type="number" id="perfil-peso" step="0.1" min="20" max="300"
                               value="${perfil.peso || ''}" ${disabled}>
                    </div>

                    <div class="panel__campo">
                        <label class="panel__label" for="perfil-estatura">Estatura (cm)</label>
                        <input class="panel__input" type="number" id="perfil-estatura" step="0.1" min="50" max="250"
                               value="${perfil.estatura ? (perfil.estatura * 100).toFixed(1) : ''}" ${disabled}>
                    </div>

                    ${!isPro ? `
                    <div class="panel__campo">
                        <label class="panel__label" for="perfil-objetivo">Objetivo</label>
                        <select class="panel__input" id="perfil-objetivo" ${disabled}>
                            <option value="1" ${perfil.idObjetivo === 1 ? 'selected' : ''}>Fuerza</option>
                            <option value="2" ${perfil.idObjetivo === 2 ? 'selected' : ''}>Hipertrofia</option>
                            <option value="3" ${perfil.idObjetivo === 3 ? 'selected' : ''}>Resistencia</option>
                            <option value="4" ${perfil.idObjetivo === 4 ? 'selected' : ''}>Movilidad</option>
                        </select>
                    </div>
                    ` : ''}

                    <div class="panel__campo">
                        <label class="panel__label" for="perfil-nivel">Nivel</label>
                        <select class="panel__input" id="perfil-nivel" ${disabled}>
                            <option value="1" ${perfil.idNivel === 1 ? 'selected' : ''}>Principiante</option>
                            <option value="2" ${perfil.idNivel === 2 ? 'selected' : ''}>Intermedio</option>
                            <option value="3" ${perfil.idNivel === 3 ? 'selected' : ''}>Avanzado</option>
                        </select>
                    </div>
                </div>

                <div class="panel__campo panel__campo--full">
                    <label class="panel__label">Limitaciones Físicas</label>
                    ${editable ? _construirCheckboxLimitaciones(perfil.limitaciones || []) : 
                        `<p class="panel__texto-lectura">${limitacionesTexto}</p>`}
                </div>

                ${editable ? `
                    <div class="panel__acciones">
                        <button type="submit" class="panel__boton panel__boton--guardar">Guardar Cambios</button>
                        <button type="button" class="panel__boton panel__boton--cancelar" id="btn-cancelar-perfil">Cancelar</button>
                    </div>
                ` : ''}

                ${perfil.fechaActualizacion ? `
                    <p class="panel__meta">Última actualización: ${new Date(perfil.fechaActualizacion).toLocaleDateString('es-CO')}</p>
                ` : ''}
            </form>
        </section>
    `;
}

/**
 * Construye los checkboxes de limitaciones para modo edición.
 */
function _construirCheckboxLimitaciones(limitacionesActivas) {
    const todasLimitaciones = [
        { id: 1, nombre: 'Lesión de rodilla' },
        { id: 2, nombre: 'Lesión de hombro' },
        { id: 3, nombre: 'Lesión de muñeca' },
        { id: 4, nombre: 'Lesión de espalda baja' },
        { id: 5, nombre: 'Lesión de codo' },
        { id: 6, nombre: 'Hipertensión' }
    ];

    return `
        <div class="panel__checkboxes">
            ${todasLimitaciones.map(lim => `
                <label class="panel__checkbox-label">
                    <input type="checkbox" class="panel__checkbox" name="limitacion" value="${lim.id}"
                           ${limitacionesActivas.includes(lim.id) ? 'checked' : ''}>
                    ${lim.nombre}
                </label>
            `).join('')}
        </div>
    `;
}

/**
 * Asocia los eventos del panel (editar, cancelar, guardar).
 */
function _asociarEventos(container, perfilOriginal, isPro) {
    // Botón Editar
    const btnEditar = container.querySelector('#btn-editar-perfil');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            container.innerHTML = _construirFormulario(perfilOriginal, true, isPro);
            _asociarEventosEdicion(container, perfilOriginal, isPro);
        });
    }

    // Botón Cancelar Suscripción
    const btnCancelarSuscripcion = container.querySelector('#btn-cancelar-suscripcion');
    if (btnCancelarSuscripcion) {
        btnCancelarSuscripcion.addEventListener('click', async () => {
            if (confirm('¿Estás seguro que deseas cancelar tu suscripción? Se eliminarán todas las rutinas generadas para este plan.')) {
                try {
                    const resp = await fetch(`${URL_BASE}/suscripcion/cancelar`, { method: 'POST', credentials: 'include' });
                    const result = await resp.json();
                    
                    if (result.ok) {
                        const usuario = sessionStore.getUsuario();
                        usuario.idPaquete = 1;
                        sessionStore.setUsuario(usuario);
                        alert('Suscripción cancelada con éxito. Has vuelto al plan básico.');
                        
                        // Redirect to rutinas-basicas if they are currently on a pro-specific panel, else reload
                        if (location.hash === '#rutinas-pro') {
                            location.hash = '#rutinas-basicas';
                            location.reload();
                        } else {
                            location.reload();
                        }
                    } else {
                        alert(result.mensaje || 'Error al cancelar la suscripción.');
                    }
                } catch (e) {
                    console.error('Error cancelando suscripción:', e);
                    alert('Ocurrió un error al intentar cancelar la suscripción.');
                }
            }
        });
    }
}

/**
 * Asocia los eventos del modo edición (cancelar, submit).
 */
function _asociarEventosEdicion(container, perfilOriginal, isPro) {
    // Botón Cancelar → volver a modo lectura
    const btnCancelar = container.querySelector('#btn-cancelar-perfil');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            container.innerHTML = _construirFormulario(perfilOriginal, false, isPro);
            _asociarEventos(container, perfilOriginal, isPro);
        });
    }

    // Submit del formulario → PUT al backend
    const form = container.querySelector('#form-perfil');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await _guardarPerfil(container);
        });
    }
}

/**
 * Envía los datos actualizados del perfil al backend.
 */
async function _guardarPerfil(container) {
    const alertaEl = container.querySelector('#perfil-alerta');

    const peso = parseFloat(document.getElementById('perfil-peso').value);
    const estatura = parseFloat(document.getElementById('perfil-estatura').value);
    const perfilObjetivoEl = document.getElementById('perfil-objetivo');
    const idObjetivo = perfilObjetivoEl ? parseInt(perfilObjetivoEl.value) : null; // PRO no tiene objetivo fijo
    const idNivel = parseInt(document.getElementById('perfil-nivel').value);

    // Recolectar limitaciones seleccionadas
    const checkboxes = container.querySelectorAll('input[name="limitacion"]:checked');
    const limitaciones = Array.from(checkboxes).map(cb => parseInt(cb.value));

    // Validación client-side
    if (!peso || !estatura || (!idObjetivo && perfilObjetivoEl) || !idNivel) {
        alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--error">Completa todos los campos obligatorios.</div>';
        return;
    }

    if (isNaN(peso) || peso < 20 || peso > 300) {
        alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--error">Por favor, ingresa un peso válido (entre 20 kg y 300 kg).</div>';
        return;
    }

    if (isNaN(estatura) || estatura < 50 || estatura > 250) {
        alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--error">Por favor, ingresa una estatura válida (entre 50 cm y 250 cm).</div>';
        return;
    }

    try {
        const respuesta = await fetch(`${URL_BASE}/perfil/datos`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ peso, estatura, idObjetivo, idNivel, limitaciones })
        });

        const json = await respuesta.json();

        if (json.ok) {
            alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--exito">Perfil actualizado correctamente.</div>';
            // Recargar panel con datos actualizados después de 1.5s
            setTimeout(() => {
                renderPerfilPanel(container);
            }, 1500);
        } else {
            alertaEl.innerHTML = `<div class="panel__alerta panel__alerta--error">${json.mensaje || 'Error al guardar.'}</div>`;
        }
    } catch (error) {
        console.error('[PerfilPanel] Error guardando:', error);
        alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--error">Error de conexión al guardar.</div>';
    }
}
