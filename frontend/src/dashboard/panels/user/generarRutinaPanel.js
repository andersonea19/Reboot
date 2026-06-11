import { sessionStore } from '../../../store/sessionStore.js';

/**
 * Panel de Generación de Rutinas — Lógica Freemium
 *
 * BASIC  (idPaquete=1):
 *   - NO se muestran tarjetas de instructores.
 *   - Máximo 3 grupos musculares (Semanal) / 1 grupo (Diaria).
 *   - El idObjetivo se extrae automáticamente del perfilFisico.
 *   - Si no tiene objetivo configurado, se bloquea la interfaz con alerta.
 *
 * PRO  (idPaquete=2):
 *   - Se renderiza un catálogo dinámico de tarjetas de Instructores Virtuales.
 *   - DEBE seleccionar un instructor antes de generar.
 *   - Mismo límite de grupos musculares que Basic (3 máximo Semanal).
 *   - El idObjetivo seleccionado se envía al backend como payload.
 *
 * @param {HTMLElement} container - Contenedor del panel en el dashboard.
 */
export async function renderGenerarRutinaPanel(container) {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';

    // -------------------------------------------------------------------------
    // Estructura HTML del panel con estilos encapsulados
    // -------------------------------------------------------------------------
    container.innerHTML = `
        <style>
            .gen-panel { font-family: var(--fuenteTexto); background: var(--blanco); border-radius: 12px; border: 2px solid var(--negro); padding: 2rem; max-width: 1000px; margin: 0 auto; }
            .gen-subtitulo { font-family: var(--fuenteSubtitulo); font-size: 1.2rem; color: var(--negro); border-bottom: 2px solid var(--negro); padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase; }
            .gen-label { display: block; font-weight: bold; margin-bottom: 10px; color: var(--negro); font-family: var(--fuenteSubtitulo); font-size: 1rem; }
            .gen-select { width: 100%; padding: 12px; border-radius: 8px; border: 2px solid var(--gris-claro); font-family: var(--fuenteTexto); font-size: 0.95rem; outline: none; }
            .gen-btn { display: block; margin: 0 auto; min-width: 250px; padding: 12px 30px; background: var(--azul); color: var(--blanco); border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; font-family: var(--fuenteBotones); text-transform: uppercase; letter-spacing: 2px; }
            .gen-btn:disabled { opacity: 0.6; cursor: not-allowed; }

            /* Tarjetas de Instructor (Objetivos) — Solo Pro */
            .instructor-card {
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                gap: 6px; padding: 1rem 1.2rem; border-radius: 10px; border: 2px solid var(--gris-claro);
                background: var(--blanco); cursor: pointer; min-width: 160px; flex: 1 1 160px;
                text-align: center;
                font-family: var(--fuenteTexto);
            }
            .instructor-card.selected { border-color: var(--azul); }
            .instructor-card .card-instructor { color: var(--azul); font-weight: bold; font-size: 1rem; font-family: var(--fuenteSubtitulo); }
            .instructor-card .card-objetivo { color: var(--negro); font-size: 0.82rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

            /* Selector de grupos musculares */
            .muscle-selector { width: 100%; background-color: var(--blanco); border-radius: 8px; padding: 1.5rem; border: 1px solid var(--gris-claro); box-sizing: border-box; margin-bottom: 30px; }
            .muscle-selector__header { margin-bottom: 1.2rem; text-align: center; }
            .muscle-selector__title { font-size: 1.4rem; color: var(--negro); margin: 0 0 6px; font-family: var(--fuenteTitulos); text-transform: uppercase; }
            .muscle-selector__grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.8rem; }
            .muscle-selector__btn { background: var(--blanco); color: var(--negro); border: 2px solid var(--gris-claro); border-radius: 8px; padding: 0.85rem 0.6rem; font-size: 0.95rem; font-family: var(--fuenteBotones); font-weight: bold; text-align: center; cursor: pointer; flex: 1 1 130px; max-width: 150px; min-width: 130px; }
            .muscle-selector__btn--active { color: var(--azul); border-color: var(--azul); }
            .muscle-selector__btn:disabled { opacity: 0.45; cursor: not-allowed; text-decoration: line-through; }

            /* Indicador de selección */
            .muscle-counter { text-align: center; font-family: var(--fuenteSubtitulo); font-size: 0.9rem; color: var(--gris-oscuro); margin-bottom: 10px; }

            /* Alerta de bloqueo para Basic sin objetivo */
            .alerta-bloqueo { background: #fff3f3; border: 2px solid var(--rojo); border-radius: 8px; padding: 1.2rem; margin-bottom: 1.5rem; font-family: var(--fuenteTexto); font-size: 0.95rem; color: var(--rojo); }
        </style>

        <section class="gen-panel">
            <h2 class="panel__titulo" style="text-align: center;">Crear Nueva Rutina</h2>

            <!-- Área de alertas y mensajes del sistema -->
            <div id="generar-alerta" style="margin-bottom: 20px; text-align: center; font-family: var(--fuenteSubtitulo); font-size: 1.1rem;"></div>

            <!-- PASO 1: Selección de Instructor (EXCLUSIVO PARA PRO) -->
            <div id="paso-instructor" style="display: none; margin-bottom: 30px;">
                <h3 class="gen-subtitulo">Instructor</h3>
                <div id="instructores-grid" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; width: 100%; margin-bottom: 5px;"></div>
                <input type="hidden" id="idObjetivoSeleccionado" value="">
            </div>

            <!-- PASO 2: Configuración de Rutina (Tipo, Equipamiento, Músculos) -->
            <div id="paso-configuracion" style="display: none;">
                <h3 class="gen-subtitulo" id="titulo-paso-config">Configura tu Rutina</h3>

                <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 240px;">
                        <label class="gen-label" for="tipoRutina">Tipo de Rutina:</label>
                        <select id="tipoRutina" class="gen-select">
                            <option value="Diaria">Diaria</option>
                            <option value="Semanal">Semanal</option>
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 240px;">
                        <label class="gen-label" for="equipamientoSelect">Equipamiento Disponible:</label>
                        <select id="equipamientoSelect" class="gen-select" disabled style="background-color: #f5f5f5;">
                            <option value="">— Selecciona músculos primero —</option>
                        </select>
                    </div>
                </div>

                <!-- Selector de grupos musculares -->
                <div class="muscle-selector">
                    <header class="muscle-selector__header">
                        <h3 class="muscle-selector__title">Grupos Musculares</h3>
                    </header>
                    <p class="muscle-counter" id="muscle-counter">Selecciona 1 grupo muscular.</p>
                    <div id="grupos-musculares-container" class="muscle-selector__grid"></div>
                </div>

                <button id="btn-generar" class="gen-btn">GENERAR RUTINA</button>
            </div>
        </section>
    `;

    // -------------------------------------------------------------------------
    // Referencias al DOM
    // -------------------------------------------------------------------------
    const alertaDiv          = document.getElementById('generar-alerta');
    const pasoInstructor     = document.getElementById('paso-instructor');
    const pasoConfiguracion  = document.getElementById('paso-configuracion');
    const instructoresGrid   = document.getElementById('instructores-grid');
    const idObjetivoInput    = document.getElementById('idObjetivoSeleccionado');
    const gruposContainer    = document.getElementById('grupos-musculares-container');
    const equipamientoSelect = document.getElementById('equipamientoSelect');
    const tipoRutinaSelect   = document.getElementById('tipoRutina');
    const btnGenerar         = document.getElementById('btn-generar');
    const descMusculo        = document.getElementById('desc-musculo');
    const muscleCounter      = document.getElementById('muscle-counter');

    // -------------------------------------------------------------------------
    // Estado del usuario
    // -------------------------------------------------------------------------
    const usuario = sessionStore.getUsuario();
    const isPro   = usuario && usuario.idPaquete === 2;

    // Mostrar sección de instructores SOLO para Pro
    if (isPro) {
        pasoInstructor.style.display = 'block';
    }
    // La configuración siempre es visible (la carga se controla por el flujo de datos)
    pasoConfiguracion.style.display = 'block';

    // -------------------------------------------------------------------------
    // Mapeos de negocio (frontend)
    //   MAPA_LIMITACIONES: lesión → grupos musculares a bloquear
    //   MAPA_EQUIPO_MUSCULO: equipo → grupos musculares compatibles
    // -------------------------------------------------------------------------
    const MAPA_LIMITACIONES = {
        1: [6, 7],      // Muñeca → Bíceps, Tríceps
        2: [1, 2, 4],   // Hombro → Pecho, Espalda, Hombros
        3: [6, 7],      // Codo   → Bíceps, Tríceps
        4: [3],         // Rodilla → Pierna
        5: [3, 5]       // Lumbar  → Pierna, Core
    };

    const MAPA_EQUIPO_MUSCULO = {
        1: null,             // Sin equipamiento (siempre disponible)
        2: [2, 6, 5],        // Barra de dominadas → Espalda, Bíceps, Core
        3: [1, 4, 7, 5],     // Paralelas → Pecho, Hombros, Tríceps, Core
        4: [1, 3, 4, 7]      // Banco/silla → Pecho, Pierna, Hombros, Tríceps
    };

    let catalogosData   = null;  // Cache de catálogos del backend
    let gruposBloqueados = new Set(); // IDs de grupos bloqueados por limitaciones

    // -------------------------------------------------------------------------
    // Helpers de UI
    // -------------------------------------------------------------------------

    /**
     * Actualiza el contador de grupos musculares según el tipo de rutina.
     */
    function actualizarMensajeMusculos() {
        const maxAllowed = tipoRutinaSelect.value === 'Diaria' ? 1 : 3;
        actualizarContadorMusculos(maxAllowed);
    }

    /**
     * Reescribe el texto del contador con la instrucción directa.
     * Formato: "Selecciona X grupos musculares."
     */
    function actualizarContadorMusculos(maxAllowed) {
        const seleccionados = document.querySelectorAll(
            '.muscle-selector__btn--active:not(.obj-selector-btn)').length;
        const restantes = maxAllowed - seleccionados;
        muscleCounter.textContent = restantes > 0
            ? `Selecciona ${restantes} grupo${restantes !== 1 ? 's' : ''} muscular${restantes !== 1 ? 'es' : ''}.`
            : `Límite alcanzado.`;
    }

    /**
     * Habilita/deshabilita los botones de grupos musculares según el límite actual.
     * Nunca deshabilita los que ya están bloqueados por limitación física.
     */
    function evaluarLimitesBotones() {
        const maxAllowed = tipoRutinaSelect.value === 'Diaria' ? 1 : 3;
        const seleccionados = document.querySelectorAll(
            '.muscle-selector__btn--active:not(.obj-selector-btn)').length;

        document.querySelectorAll('.muscle-selector__btn:not(.obj-selector-btn)').forEach(btn => {
            if (gruposBloqueados.has(parseInt(btn.dataset.value))) {
                // Siempre bloqueado por limitación física
                btn.disabled = true;
                return;
            }
            // Deshabilitar los no seleccionados si ya se alcanzó el límite
            const esActivo = btn.classList.contains('muscle-selector__btn--active');
            btn.disabled = !esActivo && seleccionados >= maxAllowed;
        });

        actualizarContadorMusculos(maxAllowed);
    }

    // -------------------------------------------------------------------------
    // Carga de catálogos desde el backend
    // -------------------------------------------------------------------------
    async function cargarCatalogos() {
        try {
            const [resCat, resPerf] = await Promise.all([
                fetch(`${URL_BASE}/rutinas/catalogos`, { credentials: 'include' }),
                fetch(`${URL_BASE}/perfil/datos`, { credentials: 'include' })
            ]);

            // -- Verificación de perfil y objetivo para usuario Basic --
            if (resPerf.ok) {
                const jsonPerf = await resPerf.json();
                if (jsonPerf.ok && jsonPerf.data) {
                    const limitaciones = jsonPerf.data.limitaciones || [];

                    // Construir set de grupos bloqueados por limitaciones físicas
                    limitaciones.forEach(limId => {
                        if (MAPA_LIMITACIONES[limId]) {
                            MAPA_LIMITACIONES[limId].forEach(gId => gruposBloqueados.add(gId));
                        }
                    });

                    // Validación crítica para Basic: debe tener objetivo configurado
                    if (!isPro && (!jsonPerf.data.idObjetivo || jsonPerf.data.idObjetivo === 0)) {
                        alertaDiv.innerHTML = `
                            <div class="alerta-bloqueo">
                                ⚠️ <strong>Atención:</strong> Para generar rutinas como usuario Basic, necesitas
                                configurar tu <strong>Objetivo Principal</strong> en tu
                                <a href="#perfil" style="color: var(--azul); text-decoration: underline;">Perfil Físico</a>.
                            </div>`;
                        pasoConfiguracion.style.display = 'none';
                        return; // Bloquear la interfaz
                    }
                }
            }

            // -- Renderizar catálogos de músculos y equipamiento --
            if (resCat.ok) {
                const json = await resCat.json();
                if (json.ok && json.data) {
                    catalogosData = json.data;
                    renderizarGruposMusculares(catalogosData.gruposMusculares || []);

                    // Instructores Virtuales: SOLO para usuarios Pro
                    if (isPro && catalogosData.objetivos && catalogosData.objetivos.length > 0) {
                        renderizarInstructores(catalogosData.objetivos);
                    }
                }
            }

            // Inicializar estado visual
            actualizarMensajeMusculos();

        } catch (err) {
            console.error('Error al cargar catálogos:', err);
            alertaDiv.innerHTML = `<span style="color: var(--rojo);">Error al conectar con el servidor. Recarga la página.</span>`;
        }
    }

    /**
     * Renderiza los botones de grupos musculares en el grid.
     * Los grupos bloqueados por limitaciones se muestran pero permanecen deshabilitados.
     */
    function renderizarGruposMusculares(grupos) {
        gruposContainer.innerHTML = grupos.map(g => {
            const gId      = parseInt(g.id || g.idGrupoMuscular);
            const bloqueado = gruposBloqueados.has(gId);
            return `
                <button
                    class="muscle-selector__btn${bloqueado ? '' : ''}"
                    type="button"
                    data-value="${gId}"
                    ${bloqueado ? 'disabled title="Bloqueado por tu limitación física registrada"' : ''}
                    ${bloqueado ? 'style="opacity:0.45; cursor:not-allowed; text-decoration:line-through;"' : ''}
                >
                    ${g.nombre}
                </button>
            `;
        }).join('');

        // Asignar eventos a los botones habilitados
        document.querySelectorAll('.muscle-selector__btn').forEach(btn => {
            btn.addEventListener('click', function () {
                if (this.disabled) return;
                this.classList.toggle('muscle-selector__btn--active');
                evaluarLimitesBotones();
                actualizarEquipamiento();
            });
        });

        evaluarLimitesBotones();
    }

    /**
     * Renderiza las tarjetas de Instructores Virtuales (solo para Pro).
     * Solo uno puede estar seleccionado a la vez (radio-like behavior).
     */
    function renderizarInstructores(objetivos) {
        instructoresGrid.innerHTML = objetivos.map(obj => `
            <div
                class="instructor-card"
                data-id="${obj.id || obj.idObjetivo}"
                role="button"
                tabindex="0"
                aria-label="${obj.instructorNombre || 'Coach'} — ${obj.nombre || 'Objetivo'}"
            >
                <span class="card-instructor">${obj.instructorNombre || 'Coach'}</span>
                <span class="card-objetivo">${obj.nombre || 'Objetivo'}</span>
            </div>
        `).join('');

        // Comportamiento radio: un solo instructor activo
        document.querySelectorAll('.instructor-card').forEach(card => {
            const seleccionarCard = () => {
                const yaSeleccionado = card.classList.contains('selected');
                document.querySelectorAll('.instructor-card').forEach(c => c.classList.remove('selected'));
                if (!yaSeleccionado) {
                    card.classList.add('selected');
                    idObjetivoInput.value = card.dataset.id;
                } else {
                    idObjetivoInput.value = '';
                }
            };
            card.addEventListener('click', seleccionarCard);
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') seleccionarCard(); });
        });
    }

    /**
     * Filtra el equipamiento disponible según los músculos seleccionados.
     * "Sin equipamiento" (ID=1) siempre está disponible.
     */
    function actualizarEquipamiento() {
        const seleccionados = Array.from(
            document.querySelectorAll('.muscle-selector__btn--active:not(.obj-selector-btn)')
        ).map(btn => parseInt(btn.dataset.value));

        if (seleccionados.length === 0) {
            equipamientoSelect.disabled = true;
            equipamientoSelect.style.backgroundColor = '#f5f5f5';
            equipamientoSelect.innerHTML = '<option value=""></option>';
            return;
        }

        equipamientoSelect.disabled = false;
        equipamientoSelect.style.backgroundColor = '#fff';

        let opcionesFiltradas = '';
        if (catalogosData && catalogosData.equipamiento) {
            catalogosData.equipamiento.forEach(eq => {
                const idEq = eq.id || eq.idEquipamiento;
                // ID=1 ("Sin equipamiento") siempre aparece
                const musculosCompatibles = MAPA_EQUIPO_MUSCULO[idEq];
                const esCompatible = musculosCompatibles === null
                    || seleccionados.some(gId => musculosCompatibles.includes(gId));

                if (esCompatible) {
                    opcionesFiltradas += `<option value="${idEq}">${eq.nombre}</option>`;
                }
            });
        }

        // Fallback: si no hay opciones, mostrar "Sin equipamiento"
        if (!opcionesFiltradas && catalogosData && catalogosData.equipamiento) {
            const sinEq = catalogosData.equipamiento.find(e => (e.id || e.idEquipamiento) === 1);
            if (sinEq) opcionesFiltradas = `<option value="1">${sinEq.nombre}</option>`;
        }

        equipamientoSelect.innerHTML = opcionesFiltradas;
    }

    // -------------------------------------------------------------------------
    // Evento: Cambio en tipo de rutina
    // -------------------------------------------------------------------------
    tipoRutinaSelect.addEventListener('change', () => {
        // Limpiar selecciones de músculos al cambiar tipo
        document.querySelectorAll('.muscle-selector__btn--active:not(.obj-selector-btn)').forEach(btn => {
            btn.classList.remove('muscle-selector__btn--active');
        });
        actualizarMensajeMusculos();
        evaluarLimitesBotones();
        actualizarEquipamiento();
    });

    // -------------------------------------------------------------------------
    // Evento: Click en "GENERAR RUTINA"
    // -------------------------------------------------------------------------
    btnGenerar.addEventListener('click', async () => {
        alertaDiv.innerHTML = '';

        const tipoRutina = tipoRutinaSelect.value;
        const gruposArray = Array.from(
            document.querySelectorAll('.muscle-selector__btn--active:not(.obj-selector-btn)')
        ).map(btn => parseInt(btn.dataset.value));

        const equipoId    = parseInt(equipamientoSelect.value);
        const equiposArray = isNaN(equipoId) ? [] : [equipoId];

        // -- Validaciones de frontend (pre-vuelo) --

        // Pro: DEBE haber seleccionado un instructor
        if (isPro && !idObjetivoInput.value) {
            alertaDiv.innerHTML = `<span style="color: var(--rojo); font-weight: bold;">⚠ Por favor selecciona un Instructor Virtual antes de generar.</span>`;
            return;
        }

        // Sin músculos seleccionados
        if (gruposArray.length === 0) {
            alertaDiv.innerHTML = `<span style="color: var(--rojo);">Por favor selecciona al menos 1 grupo muscular.</span>`;
            return;
        }

        // Rutina Diaria: exactamente 1 músculo
        if (tipoRutina === 'Diaria' && gruposArray.length !== 1) {
            alertaDiv.innerHTML = `<span style="color: var(--rojo);">Una Rutina Diaria requiere exactamente 1 grupo muscular.</span>`;
            return;
        }

        // Rutina Semanal: máximo 3 músculos (aplica para todos los planes)
        if (tipoRutina === 'Semanal' && gruposArray.length > 3) {
            alertaDiv.innerHTML = `<span style="color: var(--rojo);">Máximo 3 grupos musculares para una Rutina Semanal.</span>`;
            return;
        }

        // Construir payload para el backend
        const payload = {
            tipoRutina:       tipoRutina,
            gruposMusculares: gruposArray,
            equipamiento:     equiposArray
        };

        // Pro: incluir el idObjetivo seleccionado
        if (isPro) {
            payload.idObjetivo = parseInt(idObjetivoInput.value);
        }

        // -- Ejecutar la solicitud --
        btnGenerar.disabled = true;
        btnGenerar.textContent = 'GENERANDO...';

        try {
            const res = await fetch(`${URL_BASE}/rutinas/solicitud`, {
                method:      'POST',
                headers:     { 'Content-Type': 'application/json' },
                body:        JSON.stringify(payload),
                credentials: 'include'
            });

            const result = await res.json();

            if (result.ok || res.ok) {
                // Éxito: navegar al panel de rutina activa
                alert('¡Rutina generada con éxito! Ahora puedes verla en tu panel.');
                const linkRutinas = document.querySelector('[data-panel="rutina-activa"]');
                if (linkRutinas) {
                    linkRutinas.click();
                } else {
                    window.location.reload();
                }
            } else {
                // Error bloqueante del backend (límites, validaciones, etc.)
                alertaDiv.innerHTML = `
                    <div class="alerta-bloqueo" style="margin-bottom: 0;">
                        ❌ <strong>Error:</strong> ${result.mensaje || 'No se pudo generar la rutina.'}
                    </div>`;
                btnGenerar.disabled = false;
                btnGenerar.textContent = 'GENERAR RUTINA';
            }
        } catch (err) {
            console.error('Error de red al generar rutina:', err);
            alertaDiv.innerHTML = `<span style="color: var(--rojo);">Error de red. Verifica tu conexión e inténtalo de nuevo.</span>`;
            btnGenerar.disabled = false;
            btnGenerar.textContent = 'GENERAR RUTINA';
        }
    });

    // -------------------------------------------------------------------------
    // Inicialización
    // -------------------------------------------------------------------------
    await cargarCatalogos();
}
