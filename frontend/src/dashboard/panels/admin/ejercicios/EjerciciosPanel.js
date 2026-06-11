export async function renderEjerciciosPanel(container) {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api/ejercicios';
    const URL_CATALOGOS = 'http://localhost:8080/RebootBackend/api/admin/catalogos';
    
    let ejercicios = [];
    let catalogos = {
        dificultad: [],
        equipamiento: [],
        limitaciones: [],
        musculos: [],
        gruposMusculares: [],
        objetivos: []
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
            .check-container { font-family: var(--fuenteTexto); font-size: 0.85rem; background: var(--blanco); padding: 15px; border-radius: 8px; border: 1px solid var(--gris-claro); display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
        </style>
        <div class="panel" id="vistaEjercicios">
            <div class="panel__header">
                <h2 class="panel__titulo">Gestión de Ejercicios</h2>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select id="selectFiltroEstado" class="panel__input" style="width: 150px; padding: 10px; border-radius: 8px;">
                        <option value="">Todos (Estado)</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </select>
                    <select id="selectFiltroGrupo" class="panel__input" style="width: 200px; padding: 10px; border-radius: 8px;">
                        <option value="">Todos los Músculos</option>
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
                                <th>Dificultad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyEjercicios">
                            <tr><td colspan="5" style="text-align:center; padding: 20px;">Cargando ejercicios...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal de Ejercicio -->
        <div id="modalEjercicio" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); justify-content: center; align-items: flex-start; overflow-y: auto; padding: 40px 0;">
            <div class="modal-content" style="background: var(--blanco); padding: 40px; border-radius: 16px; width: 90%; max-width: 800px; position: relative; margin: auto; border: 1px solid var(--gris-claro);">
                <span id="cerrarModal" style="position: absolute; right: 25px; top: 20px; font-size: 28px; cursor: pointer; color: var(--gris-oscuro);">&times;</span>
                <h3 id="modalTitulo" style="color: var(--azul); font-family: var(--fuenteTitulos); margin-bottom: 25px; font-size: 1.8rem; font-weight: 800;">Nuevo Ejercicio</h3>
                <form id="formEjercicio" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" id="inputId">
                    
                    <label style="font-weight: bold;">Nombre:</label>
                    <input type="text" id="inputNombre" class="panel__input" required>
                    
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
                            <label style="font-weight: bold;">Dificultad:</label>
                            <select id="inputDificultad" class="panel__input" required></select>
                        </div>
                    </div>

                    <label style="font-weight: bold;">Descripción:</label>
                    <textarea id="inputDescripcion" class="panel__input" rows="2"></textarea>

                    <label style="font-weight: bold;">Instrucciones:</label>
                    <textarea id="inputInstrucciones" class="panel__input" rows="2"></textarea>

                    <div style="font-family: var(--fuenteTexto); font-weight: bold; margin-top: 10px; border-bottom: 1px solid var(--gris-claro); padding-bottom: 5px;">Relaciones</div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div>
                                <label style="font-family: var(--fuenteTexto); font-size: 0.95rem; font-weight: bold; margin-bottom: 5px; display: block;">Grupos Musculares:</label>
                                <div id="checkGrupos" class="check-container"></div>
                            </div>
                            <div>
                                <label style="font-family: var(--fuenteTexto); font-size: 0.95rem; font-weight: bold; margin-bottom: 5px; display: block;">Objetivos:</label>
                                <div id="checkObjetivos" class="check-container"></div>
                            </div>
                            <div>
                                <label style="font-family: var(--fuenteTexto); font-size: 0.95rem; font-weight: bold; margin-bottom: 5px; display: block;">Equipamiento:</label>
                                <div id="checkEquip" class="check-container"></div>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div style="height: 100%;">
                                <label style="font-family: var(--fuenteTexto); font-size: 0.95rem; font-weight: bold; margin-bottom: 5px; display: block;">Músculos:</label>
                                <div id="checkMusculos" class="check-container" style="height: calc(100% - 25px); align-content: flex-start;"></div>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 15px; margin-top: 30px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid var(--gris-claro);">
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
     * Trae todos los catálogos auxiliares (dificultad, músculos, equipos, etc.)
     * desde el backend para poder llenar los combos de opciones y los checkboxes.
     */
    const cargarCatalogos = async () => {
        try {
            const endpoints = ['dificultad', 'equipamiento', 'limitaciones', 'musculos', 'gruposmusculares', 'objetivos'];
            await Promise.all(endpoints.map(async (ep) => {
                const r = await fetch(`${URL_CATALOGOS}/${ep}`, { credentials: 'include' });
                if (r.ok) {
                    const data = await r.json();
                    if(data.ok) catalogos[ep === 'gruposmusculares' ? 'gruposMusculares' : ep] = data.data;
                }
            }));
            
            // Llenar select de dificultad
            document.getElementById('inputDificultad').innerHTML = '<option value="">Seleccione...</option>' + 
                catalogos.dificultad.map(d => `<option value="${d.id}">${d.nombre}</option>`).join('');
                
            // Llenar select de grupos musculares para filtro
            selectFiltroGrupo.innerHTML = '<option value="">Todos los Músculos</option>' + 
                catalogos.gruposMusculares.map(g => `<option value="${g.id}">${g.nombre}</option>`).join('');
                
            // Llenar checkboxes
            const llenarCheckboxes = (idContenedor, data, nameAttr) => {
                document.getElementById(idContenedor).innerHTML = data.map(item => 
                    `<label style="display:block; margin-bottom:3px;"><input type="checkbox" name="${nameAttr}" value="${item.id}"> ${item.nombre}</label>`
                ).join('');
            };
            
            llenarCheckboxes('checkGrupos', catalogos.gruposMusculares, 'cbGrupo');
            llenarCheckboxes('checkEquip', catalogos.equipamiento, 'cbEquip');
            llenarCheckboxes('checkObjetivos', catalogos.objetivos, 'cbObj');
            llenarCheckboxes('checkMusculos', catalogos.musculos, 'cbMusc');

        } catch (error) {
            console.error("Error al cargar catálogos:", error);
        }
    };

    /**
     * Consulta la lista completa de ejercicios guardados en la base de datos
     * y se la pasa a la función encargada de dibujar la tabla.
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
     * basándose en lo que el usuario haya escrito en el buscador y
     * seleccionado en los filtros (estado y grupo muscular).
     */
    const renderTabla = () => {
        const txt = filtroEjercicios.value.toLowerCase();
        const est = selectFiltroEstado.value;
        const idGrupo = selectFiltroGrupo.value;
        const nombreGrupoSel = idGrupo ? selectFiltroGrupo.options[selectFiltroGrupo.selectedIndex].text : '';

        const filtrados = ejercicios.filter(ej => {
            const matchTxt = ej.nombre.toLowerCase().includes(txt) || (ej.descripcion || '').toLowerCase().includes(txt);
            const matchEst = est === '' || (est === 'activo' && ej.activo) || (est === 'inactivo' && !ej.activo);
            
            let matchGrupo = true;
            if (idGrupo !== '') {
                if (ej.categorias) {
                    matchGrupo = ej.categorias.includes(nombreGrupoSel);
                } else {
                    matchGrupo = false;
                }
            }
            
            return matchTxt && matchEst && matchGrupo;
        });

        if (filtrados.length === 0) {
            tbodyEjercicios.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No hay ejercicios que coincidan.</td></tr>';
            return;
        }

        tbodyEjercicios.innerHTML = filtrados.map(ej => {
            const dif = catalogos.dificultad.find(d => d.id === ej.idDificultad);
            const nombreDif = dif ? dif.nombre : 'N/A';
            const estadoStr = ej.activo 
                ? '<span class="badge-activo">Activo</span>' 
                : '<span class="badge-inactivo">Inactivo</span>';
            
            return `
                <tr>
                    <td>${ej.id}</td>
                    <td style="font-weight: bold;">${ej.nombre}</td>
                    <td style="color: var(--gris-oscuro);">${nombreDif}</td>
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
                if(val === 'toggle') {
                    inactivarEjercicio(id);
                } else if(val === 'editar') {
                    abrirModal(id);
                }
                e.target.value = '';
            });
        });
    };

    /**
     * Abre la ventana flotante (modal) para crear o editar un ejercicio.
     * Si le pasamos un "id", buscará los datos de ese ejercicio en la DB
     * para rellenar los campos y checkboxes automáticamente.
     * @param {number|null} id - ID del ejercicio a editar, o null si es nuevo.
     */
    const abrirModal = async (id = null) => {
        formEjercicio.reset();
        document.getElementById('inputId').value = '';
        document.getElementById('modalTitulo').innerText = 'Nuevo Ejercicio';

        // Limpiar checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        if (id) {
            const ejBasico = ejercicios.find(x => x.id === id);
            if (ejBasico) {
                document.getElementById('modalTitulo').innerText = 'Editar Ejercicio';
                document.getElementById('inputId').value = ejBasico.id;
                document.getElementById('inputNombre').value = ejBasico.nombre;
                document.getElementById('inputDificultad').value = ejBasico.idDificultad;
                document.getElementById('inputDescripcion').value = ejBasico.descripcion || '';
                document.getElementById('inputInstrucciones').value = ejBasico.instrucciones || '';
            }

            try {
                const res = await fetch(`${URL_BASE}/${id}`, { credentials: 'include' });
                const result = await res.json();
                if (result.ok && result.data) {
                    const ej = result.data;
                    
                    if(ej.gruposMusculares) ej.gruposMusculares.forEach(gId => {
                        const cb = document.querySelector(`input[name="cbGrupo"][value="${gId}"]`);
                        if(cb) cb.checked = true;
                    });
                    if(ej.equipamientos) ej.equipamientos.forEach(eId => {
                        const cb = document.querySelector(`input[name="cbEquip"][value="${eId}"]`);
                        if(cb) cb.checked = true;
                    });
                    if(ej.objetivos) ej.objetivos.forEach(oId => {
                        const cb = document.querySelector(`input[name="cbObj"][value="${oId}"]`);
                        if(cb) cb.checked = true;
                    });
                    if(ej.musculos) ej.musculos.forEach(m => {
                        const cb = document.querySelector(`input[name="cbMusc"][value="${m.idMusculo}"]`);
                        if(cb) cb.checked = true;
                    });
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
    // Evento de guardado: Cuando el administrador le da a "Guardar Ejercicio"
    // -------------------------------------------------------------------------
    formEjercicio.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Recolectar checkboxes
        const getCheckedValues = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => parseInt(cb.value));

        const payload = {
            nombre: document.getElementById('inputNombre').value.trim(),
            idDificultad: parseInt(document.getElementById('inputDificultad').value),
            descripcion: document.getElementById('inputDescripcion').value.trim(),
            instrucciones: document.getElementById('inputInstrucciones').value.trim(),
            gruposMusculares: getCheckedValues('cbGrupo'),
            equipamientos: getCheckedValues('cbEquip'),
            objetivos: getCheckedValues('cbObj'),
            musculos: getCheckedValues('cbMusc').map(id => ({ idMusculo: id })) // El DTO requiere formato [{idMusculo: 1}]
        };

        if (payload.gruposMusculares.length === 0 || payload.equipamientos.length === 0 || payload.objetivos.length === 0 || payload.musculos.length === 0) {
            mostrarAlerta('Debes seleccionar al menos una opción en cada grupo de relaciones.', true);
            return;
        }

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
        } catch(err) {
            mostrarAlerta('Fallo de red', true);
        }
    });

    /**
     * En lugar de borrar físicamente el ejercicio, lo marcamos como inactivo.
     * Así no rompemos historiales de usuarios que lo hayan realizado.
     */
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
        } catch(err) {
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
