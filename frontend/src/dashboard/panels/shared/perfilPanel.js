/**
 * perfilPanel.js — Panel de Perfil Físico del Dashboard SPA.
 * 
 * Esquema desnormalizado:
 *   - idLimitacion es un solo campo (select, no checkboxes).
 *
 * Endpoints consumidos:
 *   GET  /api/perfil/datos → Recuperar perfil completo
 *   PUT  /api/perfil/datos → Actualizar perfil
 */

import { sessionStore } from '../../../store/sessionStore.js';
import { modal } from '../../../modules/modal.js';
const URL_BASE = 'http://localhost:8080/RebootBackend/api';

/**
 * Función de renderizado del panel de perfil.
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
 * Esquema aplanado: limitaciones es un arreglo de selección múltiple.
 */
function _construirFormulario(perfil, editable, isPro) {
    const disabled = editable ? '' : 'disabled';
    const limitacionTexto = (perfil.limitaciones && perfil.limitaciones.length > 0)
        ? perfil.limitaciones.map(l => l.nombreLimitacion).join(', ')
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
                            <option value="1" ${perfil.idObjetivo === 1 ? 'selected' : ''}>Hipertrofia</option>
                            <option value="2" ${perfil.idObjetivo === 2 ? 'selected' : ''}>Resistencia</option>
                            <option value="3" ${perfil.idObjetivo === 3 ? 'selected' : ''}>Fuerza</option>
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

                <div class="panel__grid">
                    <div class="panel__campo">
                        <label class="panel__label">Limitaciones Físicas</label>
                        ${editable ? _construirCheckboxesLimitacion(perfil.limitaciones) :
                            `<p class="panel__texto-lectura">${limitacionTexto}</p>`}
                    </div>
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
 * Construye los botones de selección múltiple para limitaciones en modo edición.
 */
function _construirCheckboxesLimitacion(limitacionesActivas) {
    const limitaciones = [
        { id: 1, nombre: 'Lesión de muñeca' },
        { id: 2, nombre: 'Lesión de hombro' },
        { id: 3, nombre: 'Lesión de codo' },
        { id: 4, nombre: 'Lesión de rodilla' },
        { id: 5, nombre: 'Lesión lumbar' }
    ];

    const idsActivos = limitacionesActivas ? limitacionesActivas.map(l => l.idLimitacion) : [];

    return `
        <div id="perfil-limitaciones-container" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 5px;">
            ${limitaciones.map(lim => `
                <button type="button" class="botones botones--nivel boton-limitacion ${idsActivos.includes(lim.id) ? 'seleccionado' : ''}" data-id="${lim.id}">${lim.nombre}</button>
            `).join('')}
        </div>
    `;
}

/**
 * Asocia los eventos del panel (editar, cancelar, guardar).
 */
function _asociarEventos(container, perfilOriginal, isPro) {
    const btnEditar = container.querySelector('#btn-editar-perfil');
    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            container.innerHTML = _construirFormulario(perfilOriginal, true, isPro);
            _asociarEventosEdicion(container, perfilOriginal, isPro);
        });
    }

    const btnCancelarSuscripcion = container.querySelector('#btn-cancelar-suscripcion');
    if (btnCancelarSuscripcion) {
        btnCancelarSuscripcion.addEventListener('click', async () => {
            const ok = await modal.confirmar('¿Estás seguro que deseas cancelar tu suscripción? Se eliminarán todas las rutinas generadas para este plan.');
            if (!ok) return;
            try {
                const resp = await fetch(`${URL_BASE}/suscripcion/cancelar`, { method: 'POST', credentials: 'include' });
                const result = await resp.json();

                if (result.ok) {
                    const usuario = sessionStore.getUsuario();
                    usuario.idPaquete = 1;
                    sessionStore.setUsuario(usuario);
                    await modal.info('Suscripción cancelada con éxito. Has vuelto al plan básico.');

                    if (location.hash === '#rutinas-pro') {
                        location.hash = '#rutinas-basicas';
                        location.reload();
                    } else {
                        location.reload();
                    }
                } else {
                    await modal.error(result.mensaje || 'Error al cancelar la suscripción.');
                }
            } catch (e) {
                console.error('Error cancelando suscripción:', e);
                await modal.error('Ocurrió un error al intentar cancelar la suscripción.');
            }
        });
    }
}

/**
 * Asocia los eventos del modo edición (cancelar, submit).
 */
function _asociarEventosEdicion(container, perfilOriginal, isPro) {
    const btnCancelar = container.querySelector('#btn-cancelar-perfil');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            container.innerHTML = _construirFormulario(perfilOriginal, false, isPro);
            _asociarEventos(container, perfilOriginal, isPro);
        });
    }

    const form = container.querySelector('#form-perfil');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await _guardarPerfil(container);
        });
    }

    const botonesLimitacion = container.querySelectorAll('#perfil-limitaciones-container .boton-limitacion');
    botonesLimitacion.forEach(btn => {
        btn.addEventListener('click', async () => {
            const isSelected = btn.classList.contains('seleccionado');
            if (!isSelected) {
                const seleccionados = container.querySelectorAll('#perfil-limitaciones-container .boton-limitacion.seleccionado');
                if (seleccionados.length >= 3) {
                    await modal.error('Por tu seguridad, solo puedes seleccionar un máximo de 3 limitaciones físicas. Si presentas más condiciones, te sugerimos consultar con un especialista.');
                    return;
                }
            }
            btn.classList.toggle('seleccionado');
        });
    });
}

/**
 * Envía los datos actualizados del perfil al backend.
 * Esquema aplanado: envía idLimitacion (int o null).
 */
async function _guardarPerfil(container) {
    const alertaEl = container.querySelector('#perfil-alerta');

    const peso = parseFloat(document.getElementById('perfil-peso').value);
    const estatura = parseFloat(document.getElementById('perfil-estatura').value);
    const perfilObjetivoEl = document.getElementById('perfil-objetivo');
    const idObjetivo = perfilObjetivoEl ? parseInt(perfilObjetivoEl.value) : null;
    const idNivel = parseInt(document.getElementById('perfil-nivel').value);

    // Limitaciones (múltiple)
    const limitacionBtns = container.querySelectorAll('#perfil-limitaciones-container .boton-limitacion.seleccionado');
    const idsLimitaciones = Array.from(limitacionBtns).map(b => parseInt(b.dataset.id));

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
            body: JSON.stringify({ peso, estatura, idObjetivo, idNivel, idsLimitaciones })
        });

        const json = await respuesta.json();

        if (json.ok) {
            alertaEl.innerHTML = '<div class="panel__alerta panel__alerta--exito">Perfil actualizado correctamente.</div>';
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
