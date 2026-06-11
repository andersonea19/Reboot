import { sessionStore } from '../../../store/sessionStore.js';

/**
 * Panel de Rutina Activa — Lógica Freemium
 *
 * BASIC  (idPaquete=1):
 *   - Una sola rutina activa → sin tabs superiores (o tab único informativo).
 *   - Videos multimedia BLOQUEADOS: se muestra un botón "Ver Video (Requiere Plan Pro)"
 *     en lugar del reproductor real.
 *
 * PRO  (idPaquete=2):
 *   - Múltiples rutinas activas → sistema de Tabs superiores dinámicas.
 *   - Videos multimedia HABILITADOS: se renderiza un <iframe> o enlace del videoUrl.
 *
 * GATILLO DE FINALIZACIÓN AUTOMÁTICA:
 *   Cuando el backend detecta 100% de completitud al marcar un ejercicio,
 *   devuelve { rutinaCompletada: true } y el frontend mueve la rutina al historial.
 *
 * @param {HTMLElement} container - Contenedor del panel en el dashboard.
 */
export async function renderRutinaActivaPanel(container) {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    const usuario  = sessionStore.getUsuario();
    const isPro    = usuario && usuario.idPaquete === 2;

    // =========================================================================
    // HTML base del panel
    // =========================================================================
    container.innerHTML = `
        <style>
            /* --- Layout general --- */
            .panel { padding: 2rem; font-family: var(--fuenteTexto); background: var(--blanco); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .panel__header { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 2rem; border-bottom: 2px solid var(--negro); padding-bottom: 0; }

            /* --- Sistema de Tabs (Pro: múltiples rutinas) --- */
            .tabs-container {
                display: flex; width: 100%; gap: 6px; margin-bottom: -2px;
                padding-bottom: 2px;
            }
            .tab-btn {
                flex: 1 1 0%; background: #f1f1f1;
                border: 2px solid transparent; border-bottom: none;
                padding: 10px 8px; border-radius: 8px 8px 0 0;
                cursor: pointer; font-family: var(--fuenteBotones); color: #555;
                text-align: center; display: flex; flex-direction: column;
                align-items: center; justify-content: center; gap: 3px;
            }
            .tab-btn.tab-active { background: var(--azul); color: white; border-color: var(--negro); }

            /* --- Top bar informativa --- */
            .top-bar-box {
                display: flex; border: 2px solid var(--negro); border-radius: 25px;
                padding: 15px 0; margin-bottom: 25px; background: var(--blanco); align-items: center;
            }
            .top-bar-section { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
            .top-bar-divider { width: 2px; background: var(--negro); align-self: stretch; }
            .top-bar-label { font-family: var(--fuenteSubtitulo); font-size: 0.8rem; color: var(--gris-oscuro); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
            .top-bar-value { font-size: 1.05rem; font-weight: bold; color: var(--negro); }

            /* --- Acordeón de días --- */
            .accordion-item { border: 2px solid var(--gris-claro); border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
            .accordion-header { background: #f9f9f9; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-family: var(--fuenteSubtitulo); font-size: 1.05rem; color: var(--negro); }
            .accordion-header.active { background: #eaf0ff; }
            .accordion-content { max-height: 0; overflow: hidden; padding: 0 20px; opacity: 0; background: var(--blanco); }
            .accordion-content.active { max-height: 3000px; padding: 20px; opacity: 1; border-top: 1px solid var(--gris-claro); }
            .accordion-header.active .accordion-icon { transform: rotate(180deg); }

            /* --- Tarjeta de ejercicio --- */
            .ejercicio-card { border: 1px solid var(--gris-claro); border-radius: 8px; padding: 16px; margin-bottom: 14px; background: var(--blanco); }
            .ejercicio-card.completado { /* Sin fondo ni borde verde extra según petición */ }
            .ejercicio-card h4 { margin: 0 0 10px; font-family: var(--fuenteSubtitulo); font-size: 1.05rem; color: var(--negro); }
            .ejercicio-card .instrucciones { font-size: 0.88rem; color: var(--gris-oscuro); line-height: 1.5; margin-bottom: 12px; }
            .ejercicio-stats { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
            .ejercicio-stat { display: flex; flex-direction: column; min-width: 80px; }
            .ejercicio-stat span:first-child { font-size: 0.72rem; color: var(--gris-oscuro); text-transform: uppercase; letter-spacing: 0.5px; }
            .ejercicio-stat strong { font-size: 1.05rem; color: var(--negro); }
            .ejercicio-actions { display: block !important; text-align: left !important; margin-top: 15px !important; width: 100%; }

            /* --- Multimedia --- */
            .video-container { margin-top: 12px; border-radius: 8px; overflow: hidden; }
            .video-iframe { width: 100%; aspect-ratio: 16/9; border: none; border-radius: 8px; }
            .video-bloqueado {
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 8px; margin-top: 12px; gap: 10px; text-align: center;
                position: relative; min-height: 100px;
            }
            .video-bloqueado .lock-icon { font-size: 2rem; }
            .video-bloqueado .lock-text { color: #ccc; font-size: 0.85rem; font-family: var(--fuenteTexto); }
            .btn-upgrade {
                background: linear-gradient(135deg, #f5a623, #e8851a); color: white;
                border: none; border-radius: 6px; padding: 8px 18px; cursor: pointer;
                font-family: var(--fuenteBotones); font-size: 0.82rem; text-transform: uppercase;
                letter-spacing: 1px;
            }

            /* --- Botones de acción de rutina --- */
            .btn-completar-ej { background: var(--azul); color: var(--blanco); border: none; border-radius: 6px; padding: 6px 16px; font-size: 0.75rem; font-family: var(--fuenteBotones); text-transform: uppercase; letter-spacing: 1px; cursor: pointer; }
            .completado-badge { color: #4caf50; font-weight: bold; font-size: 0.85rem; }
            .btn-accion-rutina { font-family: var(--fuenteBotones); border: none; border-radius: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; color: var(--blanco); padding: 10px 24px; font-size: 0.8rem; }
            .btn-completar-rutina { background: var(--azul); }
            .btn-abandonar-rutina { background: var(--rojo); }
        </style>

        <div class="panel" id="vistaRutinaActiva">
            <div class="panel__header">
                <h2 class="panel__titulo">Mi Rutina Actual</h2>
                <!-- Tabs: ocultas por defecto, se muestran si hay múltiples rutinas activas (Pro) -->
                <div id="tabsContainer" class="tabs-container" style="display: none;"></div>
            </div>

            <div id="alerta-rutina"></div>
            <div id="rutinaContent">
                <p style="text-align: center; color: var(--gris-oscuro); padding: 40px 0;">
                    Buscando rutina activa...
                </p>
            </div>
        </div>
    `;

    // =========================================================================
    // Estado reactivo del panel
    // =========================================================================
    let rutinasActivas = [];   // Lista de rutinas activas del usuario

    // =========================================================================
    // CARGA PRINCIPAL
    // =========================================================================

    /**
     * Obtiene las rutinas activas del backend y orquesta el renderizado.
     * Si el backend detectó una auto-completación en la llamada anterior,
     * la rutina ya no estará en la lista → el panel la "retira" automáticamente.
     */
    const cargarRutinaActiva = async (activeAccordionId = null) => {
        try {
            const resp = await fetch(`${URL_BASE}/rutinas/activa`, { credentials: 'include' });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            const json = await resp.json();
            if (json.ok && json.data && json.data.length > 0) {
                rutinasActivas = json.data;
                renderTabs();
                renderRutina(rutinasActivas[0], activeAccordionId);
            } else {
                mostrarVacio();
            }
        } catch (err) {
            console.error('Error al cargar rutina activa:', err);
            document.getElementById('rutinaContent').innerHTML = `
                <p style="color: var(--rojo); text-align: center; padding: 40px 0;">
                    Error al cargar la rutina activa. Recarga la página.
                </p>`;
        }
    };

    // =========================================================================
    // RENDERIZADO DE TABS (Pro: múltiples rutinas por objetivo)
    // =========================================================================

    /**
     * Dibuja las pestañas superiores si hay más de una rutina activa.
     * Para usuarios Basic con una sola rutina, las tabs permanecen ocultas.
     */
    const renderTabs = () => {
        const tabsContainer = document.getElementById('tabsContainer');

        if (rutinasActivas.length <= 1) {
            // Basic o Pro con solo 1 rutina: sin tabs
            tabsContainer.style.display = 'none';
            return;
        }

        tabsContainer.style.display = 'flex';
        
        tabsContainer.innerHTML = rutinasActivas.map((r, idx) => {
            const instructor = r.instructorNombre || 'Instructor';
            const objetivo = r.objetivoNombre || r.nombreObjetivo || r.tipoRutina || 'Objetivo';
            return `
            <button class="tab-btn ${idx === 0 ? 'tab-active' : ''}" data-rutina-id="${r.id}" data-index="${idx}">
                <span style="font-weight: bold; font-size: 0.9rem;">${instructor}</span>
                <span style="font-size: 0.75rem; opacity: 0.85;">${objetivo}</span>
            </button>
            `;
        }).join('');

        // Eventos de navegación entre tabs
        tabsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-active'));
            btn.classList.add('tab-active');
            
            const idx = parseInt(btn.dataset.index);
            renderRutina(rutinasActivas[idx]);
        });
    };

    // =========================================================================
    // ESTADO VACÍO
    // =========================================================================
    const mostrarVacio = () => {
        document.getElementById('tabsContainer').style.display = 'none';
        document.getElementById('rutinaContent').innerHTML = `
            <div style="text-align: center; padding: 50px 20px;">
                <h3 style="font-family: var(--fuenteSubtitulo); font-size: 1.5rem; margin-bottom: 12px;">
                    No tienes ninguna rutina activa.
                </h3>
                <p style="color: var(--gris-oscuro); margin-bottom: 20px; font-size: 0.95rem;">
                    Ve al panel de generación para crear una rutina acorde a tu perfil.
                </p>
            </div>
        `;
    };

    // =========================================================================
    // RENDERIZADO PRINCIPAL DE UNA RUTINA
    // =========================================================================

    /**
     * Construye y monta el HTML completo de una rutina en el contenedor.
     *
     * @param {Object} rutina - Datos completos de la rutina desde el backend.
     *                          Incluye: isPremium, progreso, dias[], instrucotNombre, etc.
     */
    const renderRutina = (rutina, activeAccordionId = null) => {
        // progreso viene del backend como entero (0..100).
        // Si es 0 o falsy, usamos exactamente 0 — nunca simular un valor positivo.
        const porcentaje = (typeof rutina.progreso === 'number' && rutina.progreso > 0)
            ? rutina.progreso
            : 0;
        const progresoTexto = porcentaje === 0 ? '0%' : `${porcentaje}%`;
        const isPremiumRutina = rutina.isPremium === true;

        // Limpiar equipamiento para mostrar (ocultar "Sin equipamiento" si hay otro equipo)
        let equipamientoText = rutina.equipamiento || 'Ninguno';
        if (equipamientoText.includes('Sin equipamiento') && equipamientoText.length > 'Sin equipamiento'.length) {
            equipamientoText = equipamientoText
                .replace(', Sin equipamiento', '')
                .replace('Sin equipamiento, ', '');
        }

        // -- Top Bar --
        const topBarHtml = `
            <div class="top-bar-box">
                <div class="top-bar-section">
                    <span class="top-bar-label">Modalidad</span>
                    <span class="top-bar-value">${rutina.tipoRutina || 'N/A'}</span>
                </div>
                <div class="top-bar-divider"></div>
                <div class="top-bar-section">
                    <span class="top-bar-label">Equipamiento</span>
                    <span class="top-bar-value" style="font-size: 0.9rem; font-weight: normal;">${equipamientoText}</span>
                </div>
                <div class="top-bar-divider"></div>
                <div class="top-bar-section">
                    <span class="top-bar-label">Progreso</span>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px;">
                        <div style="width: 180px; background: var(--gris-claro); border-radius: 15px; height: 18px; overflow: hidden;">
                            <div style="width: ${porcentaje}%; background: var(--azul); height: 100%; transition: width 0.3s ease;"></div>
                        </div>
                        <span style="font-weight: bold; font-size: 1rem;">${progresoTexto}</span>
                    </div>
                </div>
            </div>
        `;

        // -- Días y Ejercicios --
        let diasHtml = '';
        if (rutina.dias && rutina.dias.length > 0) {
            diasHtml = rutina.dias.map((dia, dIdx) => {
                const ejerciciosDia = dia.ejercicios || [];
                if (ejerciciosDia.length === 0) return '';

                const todosCompletos   = ejerciciosDia.every(e => e.estado === 'Completado');
                const completadosCount = ejerciciosDia.filter(e => e.estado === 'Completado').length;

                // HTML de ejercicios del día
                const ejerciciosHtml = ejerciciosDia.map((ej) => {
                    const estaCompletado = ej.estado === 'Completado';

                    return `
                        <div class="ejercicio-card ${estaCompletado ? 'completado' : ''}" data-ejercicio-id="${ej.id}">
                            <h4>${ej.nombre || 'Ejercicio'}</h4>
                            <p class="instrucciones">
                                <strong>Instrucciones:</strong>
                                ${ej.instrucciones || ej.descripcion || 'Sigue la técnica correcta y mantén el control.'}
                            </p>
                            <div class="ejercicio-stats">
                                <div class="ejercicio-stat">
                                    <span>Series</span>
                                    <strong>${ej.series}</strong>
                                </div>
                                <div class="ejercicio-stat">
                                    <span>Repeticiones</span>
                                    <strong>${ej.repeticiones}</strong>
                                </div>
                                <div class="ejercicio-stat">
                                    <span>Descanso</span>
                                    <strong>${ej.descansoSeg}s</strong>
                                </div>
                                ${ej.categorias ? `
                                <div class="ejercicio-stat">
                                    <span>Músculo</span>
                                    <strong style="font-size: 0.85rem;">${ej.categorias}</strong>
                                </div>` : ''}
                            </div>

                            <div class="ejercicio-actions" style="margin-top: 12px; text-align: left; display: block;">
                                ${!estaCompletado
                                    ? `<button class="btn-completar-ej" data-id="${ej.id}" style="float: left; clear: both; margin-right: auto; display: inline-block;">Completar Ejercicio</button><div style="clear: both;"></div>`
                                    : `<span class="completado-badge" style="float: left; clear: both; display: inline-block; text-align: left;">✔ Completado</span><div style="clear: both;"></div>`
                                }
                            </div>
                        </div>
                    `;
                }).join('');

                const headerBadge = todosCompletos
                    ? `<span style="background: #4caf50; color: white; border-radius: 12px; padding: 2px 10px; font-size: 0.72rem; margin-left: 8px;">✔ COMPLETADO</span>`
                    : `<span style="color: var(--gris-oscuro); font-size: 0.8rem; margin-left: 8px;">(${completadosCount}/${ejerciciosDia.length})</span>`;

                return `
                    <div class="accordion-item">
                        <div class="accordion-header" data-target="dia-${dIdx}">
                            <span>
                                Día ${dia.numDia}
                                ${headerBadge}
                            </span>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                                stroke="var(--azul)" stroke-width="2.5" stroke-linecap="round"
                                stroke-linejoin="round" class="accordion-icon">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                        <div class="accordion-content" id="dia-${dIdx}">
                            ${ejerciciosHtml}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            diasHtml = `<p style="text-align: center; color: var(--gris-oscuro); padding: 20px;">Aún no hay ejercicios registrados para esta rutina.</p>`;
        }

        // -- Botones globales de rutina --
        const botonesHtml = `
            <div style="display: flex; gap: 10px; justify-content: flex-end; border-top: 2px solid var(--negro); padding-top: 20px; margin-top: 20px; flex-wrap: wrap;">
                <button class="btn-accion-rutina btn-abandonar-rutina" id="btnAbandonarRutina" data-id="${rutina.id}">
                    Abandonar Rutina
                </button>
                <button
                    class="btn-accion-rutina btn-completar-rutina"
                    id="btnCompletarRutina"
                    data-id="${rutina.id}"
                    ${porcentaje < 100 ? 'disabled style="opacity: 0.45; cursor: not-allowed; background: var(--gris-oscuro);"' : ''}
                    title="${porcentaje < 100 ? `Completa todos los ejercicios para habilitar este botón (${porcentaje}%)` : 'Marcar rutina como completada'}"
                >
                    Completar Rutina
                </button>
            </div>
        `;

        // -- Montar todo en el contenedor --
        document.getElementById('rutinaContent').innerHTML = `
            ${topBarHtml}
            <div style="margin-bottom: 20px;">${diasHtml}</div>
            ${botonesHtml}
        `;

        // =====================================================================
        // Eventos post-render
        // =====================================================================

        // -- Acordeones --
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.dataset.target;
                const content  = document.getElementById(targetId);
                const isOpen   = content.classList.contains('active');

                // Cerrar todos
                document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('active'));
                document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));

                // Abrir el seleccionado si estaba cerrado
                if (!isOpen) {
                    content.classList.add('active');
                    header.classList.add('active');
                }
            });
        });

        // Restaurar el acordeón que estaba abierto antes de recargar
        if (activeAccordionId) {
            const headerToOpen = document.querySelector(`.accordion-header[data-target="${activeAccordionId}"]`);
            if (headerToOpen && !headerToOpen.classList.contains('active')) {
                headerToOpen.click();
            }
        }

        // -- Completar ejercicio individual --
        document.querySelectorAll('.btn-completar-ej').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const idEjercicio = parseInt(btn.dataset.id);
                btn.disabled  = true;
                btn.textContent = '...';

                try {
                    const res = await fetch(`${URL_BASE}/rutinas/ejercicio/completar`, {
                        method:      'PUT',
                        headers:     { 'Content-Type': 'application/json' },
                        body:        JSON.stringify({ idRutinaEjercicio: idEjercicio }),
                        credentials: 'include'
                    });
                    const result = await res.json();

                    if (result.ok) {
                        // El backend completó la operación de ejercicio.
                        // La rutina ya no se auto-completa, por lo que el usuario deberá
                        // cerrarla manualmente con el botón global una vez llegue al 100%.
                        // Determinar qué acordeón está abierto para mantenerlo así
                        const openAccordion = document.querySelector('.accordion-header.active');
                        const targetId = openAccordion ? openAccordion.dataset.target : null;

                        // Recargar para reflejar el nuevo estado (progreso, badges, botones)
                        await cargarRutinaActiva(targetId);
                    } else {
                        alert(result.mensaje || 'No se pudo completar el ejercicio.');
                        btn.disabled  = false;
                        btn.textContent = 'Completar Ejercicio';
                    }
                } catch (err) {
                    console.error('Error al completar ejercicio:', err);
                    alert('Error de red. Inténtalo de nuevo.');
                    btn.disabled  = false;
                    btn.textContent = 'Completar Ejercicio';
                }
            });
        });

        // -- Botones globales de la rutina --
        const cambiarEstadoRutina = async (idRutina, accion) => {
            try {
                const res = await fetch(`${URL_BASE}/rutinas/estado`, {
                    method:      'POST',
                    headers:     { 'Content-Type': 'application/json' },
                    body:        JSON.stringify({ idRutina, accion }),
                    credentials: 'include'
                });
                const result = await res.json();

                if (result.ok || res.ok) {
                    const mensaje = accion === 'completar'
                        ? '🎉 ¡Rutina completada! Puedes verla en tu historial.'
                        : '🗑 Rutina abandonada. Puedes crear una nueva rutina.';
                    alert(mensaje);
                    await cargarRutinaActiva(); // Refrescar panel (la rutina ya no estará activa)
                } else {
                    alert(result.mensaje || `Error al ${accion === 'completar' ? 'completar' : 'abandonar'} la rutina.`);
                }
            } catch (err) {
                console.error(`Error al ${accion} rutina:`, err);
                alert('Error de red. Inténtalo de nuevo.');
            }
        };

        document.getElementById('btnCompletarRutina').onclick = () => {
            if (confirm('¿Confirmas que deseas marcar esta rutina como Completada?\n\nAsegúrate de haber terminado todos los ejercicios.')) {
                cambiarEstadoRutina(rutina.id, 'completar');
            }
        };

        document.getElementById('btnAbandonarRutina').onclick = () => {
            if (confirm('¿Seguro que deseas abandonar esta rutina? Esta acción no se puede deshacer.')) {
                cambiarEstadoRutina(rutina.id, 'cancelar');
            }
        };
    };

    // =========================================================================
    // ALERTA DE AUTO-COMPLETACIÓN (Gatillo del backend)
    // =========================================================================

    /**
     * Muestra una notificación temporal cuando la rutina se completó automáticamente al 100%.
     * El usuario puede navegar al historial desde aquí.
     */
    const mostrarAlertaAutoCompletado = () => {
        const alertaDiv = document.getElementById('alerta-rutina');
        alertaDiv.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1b5e20, #2e7d32); color: white;
                border-radius: 10px; padding: 16px 20px; margin-bottom: 20px;
                display: flex; align-items: center; gap: 14px; font-family: var(--fuenteTexto);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ">
                <span style="font-size: 1.8rem;">🏆</span>
                <div>
                    <strong style="font-family: var(--fuenteSubtitulo); font-size: 1.05rem; display: block;">
                        ¡Rutina Completada Automáticamente!
                    </strong>
                    <span style="font-size: 0.88rem; opacity: 0.9;">
                        Completaste el 100% de los ejercicios. Tu rutina ha sido archivada en el historial.
                    </span>
                </div>
            </div>
        `;
        // Auto-ocultar después de 6 segundos
        setTimeout(() => {
            if (alertaDiv) alertaDiv.innerHTML = '';
        }, 6000);
    };

    // =========================================================================
    // Inicialización
    // =========================================================================
    await cargarRutinaActiva();
}
