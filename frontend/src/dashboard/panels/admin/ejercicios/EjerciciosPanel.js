export async function renderEjerciciosPanel(container) {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api/ejercicios';
    const URL_CATALOGOS = 'http://localhost:8080/RebootBackend/api/admin/catalogos';

    let ejercicios = [];
    let catalogos = {
        dificultades: [],
        equipamientos: [],
        limitaciones: [],
        gruposMusculares: [],
        objetivos: [] // Si es necesario, aunque en el nuevo schema no se asocia al ejercicio
    };

    container.innerHTML = `
        <style>
            .panel { padding: 2rem; font-family: var(--fuenteTexto); background: var(--blanco); border-radius: 12px; }
            .panel__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--negro); padding-bottom: 1rem; flex-wrap: wrap; gap: 15px;}

            .panel__input { font-family: var(--fuenteTexto); font-size: 0.9rem; border: 1px solid var(--gris-oscuro); padding: 0.8rem; border-radius: 8px; outline: none; }
            .panel__boton { background-color: var(--azul); color: var(--blanco); font-family: var(--fuenteBotones); font-size: 1rem; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; }
            .modern-table { width: 100%; border-collapse: collapse; background: var(--blanco); border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px var(--gris-claro); }
            .modern-table thead { background-color: var(--negro); color: var(--blanco); font-family: var(--fuenteSubtitulo); font-size: 1.1rem; }
            .modern-table th { padding: 1.2rem; text-align: left; text-transform: uppercase; letter-spacing: 1px; }
            .modern-table tbody tr { border-bottom: 1px solid var(--gris-claro); transition: 0.2s; }

            .modern-table td { padding: 1rem 1.2rem; font-family: var(--fuenteTexto); font-size: 0.95rem; color: var(--negro); }
            .badge-activo { color: var(--azul); font-weight: 800; font-family: var(--fuenteTexto); }
            .badge-inactivo { color: var(--rojo); font-weight: 800; font-family: var(--fuenteTexto); }
            .select-accion { padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid var(--gris-oscuro); font-family: var(--fuenteTexto); outline: none; cursor: pointer; }
            .table-responsive { width: 100%; overflow-x: auto; }
            .btn-cancelar { background-color: var(--blanco); color: var(--rojo); font-family: var(--fuenteBotones); border: 2px solid var(--rojo); border-radius: 8px; padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
            .btn-guardar { background-color: var(--azul); color: var(--blanco); font-family: var(--fuenteBotones); border: 2px solid var(--azul); border-radius: 8px; padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
            .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        </style>
        <div class="panel" id="vistaEjercicios">
            <div class="panel__header">
                <h2 class="panel__titulo">Gestión de Ejercicios</h2>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select id="selectFiltroEstado" class="panel__input" style="width: 150px; padding: 10px; border-radius: 8px;">
                        <option value="">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </select>
                    <select id="selectFiltroGrupo" class="panel__input" style="width: 200px; padding: 10px; border-radius: 8px;">
                        <option value="">Todos los Grupos</option>
                    </select>
                    <input type="text" id="filtroEjercicios" placeholder="Buscar por nombre..." class="panel__input" style="width: 250px; padding: 10px; border-radius: 8px;">
                    <button id="btnNuevoEjercicio" class="panel__boton" style="padding: 10px 20px; margin-left: 20px;">+ Nuevo Ejercicio</button>
                </div>
            </div>
            <div id="alerta-ejercicios" style="margin-bottom: 15px;"></div>
            <div class="panel__contenido">
                <div class="table-responsive">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Dificultad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyEjercicios">
                            <tr><td colspan="6" style="text-align:center; padding: 20px;">Cargando ejercicios...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal de Ejercicio -->
        <div id="modalEjercicio" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); justify-content: center; align-items: center;">
            <div class="modal-content" style="background: var(--blanco); padding: 25px; border-radius: 16px; width: 90%; max-width: 800px; position: relative; margin: auto; border: 1px solid var(--gris-claro); max-height: 90vh; overflow-y: auto;">
                <span id="cerrarModal" style="position: absolute; right: 25px; top: 20px; font-size: 28px; cursor: pointer; color: var(--gris-oscuro);">&times;</span>
                <h3 id="modalTitulo" style="color: var(--azul); font-family: var(--fuenteTitulos); margin-bottom: 15px; font-size: 1.6rem; font-weight: 800;">Nuevo Ejercicio</h3>
                <form id="formEjercicio" style="display: flex; flex-direction: column; gap: 12px; font-family: var(--fuenteTexto);">
                    <input type="hidden" id="inputId">
                    
                    <label style="font-weight: bold; font-family: var(--fuenteTexto);">Nombre:</label>
                    <input type="text" id="inputNombre" class="panel__input" required>
                    
                    <div class="form-grid">
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-weight: bold; font-family: var(--fuenteTexto);">Dificultad:</label>
                            <select id="inputDificultad" class="panel__input" required></select>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-weight: bold; font-family: var(--fuenteTexto);">Grupo Muscular:</label>
                            <select id="inputGrupoMuscular" class="panel__input" required></select>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-weight: bold; font-family: var(--fuenteTexto);">Equipamiento:</label>
                            <select id="inputEquipamiento" class="panel__input" required></select>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-weight: bold; font-family: var(--fuenteTexto);">Limitación Incompatible:</label>
                            <select id="inputLimitacion" class="panel__input">
                                <option value="">Ninguna</option>
                            </select>
                        </div>
                    </div>

                    <label style="font-weight: bold; font-family: var(--fuenteTexto);">Descripción Corta:</label>
                    <input type="text" id="inputDescripcion" class="panel__input" required>

                    <label style="font-weight: bold; font-family: var(--fuenteTexto);">Instrucciones:</label>
                    <textarea id="inputInstrucciones" class="panel__input" rows="2"></textarea>

                    <div style="display: flex; gap: 15px; margin-top: 20px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid var(--gris-claro);">
                        <button type="button" class="btn-cancelar" id="btnCancelarEjercicio">Cancelar</button>
                        <button type="submit" class="btn-guardar">Guardar Ejercicio</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const tbodyEjercicios = document.getElementById('tbodyEjercicios');
    const filtroEjercicios = document.getElementById('filtroEjercicios');
    const selectFiltroEstado = document.getElementById('selectFiltroEstado');
    const selectFiltroGrupo = document.getElementById('selectFiltroGrupo');
    const alertaEjercicios = document.getElementById('alerta-ejercicios');
    const modalEjercicio = document.getElementById('modalEjercicio');
    const formEjercicio = document.getElementById('formEjercicio');

    const mostrarAlerta = (msg, error = false) => {
        alertaEjercicios.innerHTML = `<div style="padding: 10px; border-radius: 8px; color: #fff; background-color: ${error ? 'var(--rojo)' : 'var(--verde)'};">${msg}</div>`;
        setTimeout(() => alertaEjercicios.innerHTML = '', 4000);
    };

    /**
     * Trae todos los catálogos auxiliares
     */
    const cargarCatalogos = async () => {
        try {
            // Fetch múltiple paralelo
            const reqs = [
                fetch(`${URL_CATALOGOS}/gruposmusculares`, { credentials: 'include' }),
                fetch(`${URL_CATALOGOS}/equipamiento`, { credentials: 'include' }),
                fetch(`${URL_CATALOGOS}/limitaciones`, { credentials: 'include' })
            ];
            const [resGM, resEq, resLim] = await Promise.all(reqs);
            if (resGM.ok) catalogos.gruposMusculares = (await resGM.json()).data;
            if (resEq.ok) catalogos.equipamientos = (await resEq.json()).data;
            if (resLim.ok) catalogos.limitaciones = (await resLim.json()).data;

            // Llenar select de dificultad (ahora strings estáticos en BD)
            document.getElementById('inputDificultad').innerHTML = `
                <option value="">Seleccione...</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
            `;

            // Llenar selects
            const llenarSelect = (id, cat, placeholder = 'Seleccione...') => {
                document.getElementById(id).innerHTML = `<option value="">${placeholder}</option>` +
                    (cat || []).map(item => `<option value="${item.id}">${item.nombre}</option>`).join('');
            };

            llenarSelect('inputGrupoMuscular', catalogos.gruposMusculares);
            llenarSelect('inputEquipamiento', catalogos.equipamientos);

            document.getElementById('inputLimitacion').innerHTML = '<option value="">Ninguna</option>' +
                (catalogos.limitaciones || []).map(item => `<option value="${item.id}">${item.nombre}</option>`).join('');

            selectFiltroGrupo.innerHTML = '<option value="">Todos los Grupos</option>' +
                (catalogos.gruposMusculares || []).map(g => `<option value="${g.id}">${g.nombre}</option>`).join('');

        } catch (error) {
            console.error("Error al cargar catálogos:", error);
        }
    };

    /**
     * Consulta la lista completa de ejercicios guardados
     */
    const cargarEjercicios = async () => {
        try {
            const res = await fetch(URL_BASE, { credentials: 'include' });
            if (!res.ok) throw new Error('Error de red');
            const result = await res.json();
            if (result.ok) {
                ejercicios = result.data;
                renderTabla();
            } else {
                mostrarAlerta(result.mensaje, true);
            }
        } catch (error) {
            mostrarAlerta('Fallo al obtener ejercicios', true);
        }
    };

    /**
     * Dibuja la tabla de ejercicios filtrando los datos en tiempo real
     */
    const renderTabla = () => {
        const txt = filtroEjercicios.value.toLowerCase();
        const est = selectFiltroEstado.value;
        const idGrupo = selectFiltroGrupo.value;

        const filtrados = ejercicios.filter(ej => {
            const matchTxt = ej.nombre.toLowerCase().includes(txt) || (ej.instrucciones || '').toLowerCase().includes(txt) || (ej.descripcion || '').toLowerCase().includes(txt);
            const matchEst = est === '' || (est === 'activo' && ej.activo) || (est === 'inactivo' && !ej.activo);
            const matchGrupo = idGrupo === '' || ej.idGrupoMuscular == idGrupo;

            return matchTxt && matchEst && matchGrupo;
        });

        if (filtrados.length === 0) {
            tbodyEjercicios.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No hay ejercicios que coincidan.</td></tr>';
            return;
        }

        tbodyEjercicios.innerHTML = filtrados.map(ej => {
            const estadoStr = ej.activo
                ? '<span class="badge-activo">Activo</span>'
                : '<span class="badge-inactivo">Inactivo</span>';

            return `
                <tr>
                    <td>${ej.id}</td>
                    <td style="font-weight: bold;">${ej.nombre}</td>
                    <td style="color: var(--gris-oscuro); font-size: 0.9em; max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${ej.descripcion || ''}">${ej.descripcion || 'Sin descripción'}</td>
                    <td style="color: var(--gris-oscuro);">${ej.dificultad}</td>
                    <td>${estadoStr}</td>
                    <td>
                        <select class="select-accion" data-id="${ej.id}" data-activo="${ej.activo}">
                            <option value="">Acciones...</option>
                            <option value="editar">Editar</option>
                            <option value="toggle">${ej.activo ? 'Inactivar' : 'Activar'}</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        document.querySelectorAll('.select-accion').forEach(select => {
            select.addEventListener('change', (e) => {
                const val = e.target.value;
                const id = parseInt(e.target.dataset.id);
                if (val === 'toggle') {
                    inactivarEjercicio(id);
                } else if (val === 'editar') {
                    abrirModal(id);
                }
                e.target.value = '';
            });
        });
    };

    /**
     * Abre la ventana flotante (modal) para crear o editar un ejercicio.
     */
    const abrirModal = async (id = null) => {
        formEjercicio.reset();
        document.getElementById('inputId').value = '';
        document.getElementById('modalTitulo').innerText = 'Nuevo Ejercicio';

        if (id) {
            document.getElementById('modalTitulo').innerText = 'Editar Ejercicio';
            try {
                const res = await fetch(`${URL_BASE}/${id}`, { credentials: 'include' });
                const result = await res.json();
                if (result.ok && result.data) {
                    const ej = result.data;
                    document.getElementById('inputId').value = ej.id;
                    document.getElementById('inputNombre').value = ej.nombre;
                    document.getElementById('inputDificultad').value = ej.dificultad;
                    document.getElementById('inputGrupoMuscular').value = ej.idGrupoMuscular;
                    document.getElementById('inputEquipamiento').value = ej.idEquipamiento;
                    document.getElementById('inputLimitacion').value = (ej.idsLimitaciones && ej.idsLimitaciones.length > 0) ? ej.idsLimitaciones[0] : '';
                    document.getElementById('inputDescripcion').value = ej.descripcion || '';
                    document.getElementById('inputInstrucciones').value = ej.instrucciones || '';
                }
            } catch (error) {
                console.error("Error cargando detalles del ejercicio:", error);
            }
        }
        modalEjercicio.style.display = 'flex';
    };

    document.getElementById('cerrarModal').addEventListener('click', () => modalEjercicio.style.display = 'none');
    document.getElementById('btnCancelarEjercicio').addEventListener('click', () => modalEjercicio.style.display = 'none');

    // -------------------------------------------------------------------------
    // Evento de guardado
    // -------------------------------------------------------------------------
    formEjercicio.addEventListener('submit', async (e) => {
        e.preventDefault();

        const limitacionVal = document.getElementById('inputLimitacion').value;

        const payload = {
            nombre: document.getElementById('inputNombre').value.trim(),
            dificultad: document.getElementById('inputDificultad').value,
            idGrupoMuscular: parseInt(document.getElementById('inputGrupoMuscular').value),
            idEquipamiento: parseInt(document.getElementById('inputEquipamiento').value),
            idsLimitaciones: limitacionVal ? [parseInt(limitacionVal)] : [],
            descripcion: document.getElementById('inputDescripcion').value.trim(),
            instrucciones: document.getElementById('inputInstrucciones').value.trim()
        };

        const id = document.getElementById('inputId').value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${URL_BASE}/${id}` : URL_BASE;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            const result = await res.json();
            if (result.ok) {
                mostrarAlerta('Ejercicio guardado con éxito');
                modalEjercicio.style.display = 'none';
                cargarEjercicios();
            } else {
                mostrarAlerta(result.mensaje || 'Error al guardar', true);
            }
        } catch (err) {
            mostrarAlerta('Fallo de red', true);
        }
    });

    const inactivarEjercicio = async (id) => {
        if (!confirm('¿Seguro que deseas inactivar este ejercicio?')) return;
        try {
            const res = await fetch(`${URL_BASE}/${id}`, { method: 'DELETE', credentials: 'include' });
            const result = await res.json();
            if (result.ok) {
                mostrarAlerta('Ejercicio inactivado');
                cargarEjercicios();
            } else {
                mostrarAlerta(result.mensaje || 'Error al inactivar', true);
            }
        } catch (err) {
            mostrarAlerta('Fallo de red', true);
        }
    };

    filtroEjercicios.addEventListener('input', renderTabla);
    selectFiltroEstado.addEventListener('change', renderTabla);
    selectFiltroGrupo.addEventListener('change', renderTabla);
    document.getElementById('btnNuevoEjercicio').addEventListener('click', () => abrirModal());

    // Iniciar carga
    await cargarCatalogos();
    await cargarEjercicios();
}
