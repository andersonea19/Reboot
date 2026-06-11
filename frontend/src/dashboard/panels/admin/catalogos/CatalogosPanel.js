export async function renderCatalogosPanel(container) {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api/admin/catalogos';
    
    const catalogos = [
        { id: 'objetivos', label: 'Objetivos', hasDesc: true, extra: 'niveles' },
        { id: 'limitaciones', label: 'Limitaciones', hasDesc: true },
        { id: 'equipamiento', label: 'Equipamiento', hasDesc: true },
        { id: 'gruposmusculares', label: 'Grupos Musculares', hasDesc: true },
        { id: 'musculos', label: 'Músculos', hasDesc: true, extra: 'grupoMuscular' },
        { id: 'niveles', label: 'Niveles', hasDesc: true },
        { id: 'dificultad', label: 'Dificultades', hasDesc: false }
    ];

    let catalogoActual = catalogos[0];
    let dataActual = [];

    // UI principal - Estilo de "contenedor dinámico"
    container.innerHTML = `
        <style>
            .panel { padding: 2rem; font-family: var(--fuenteTexto); background: var(--blanco); border-radius: 12px; }
            .panel__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--negro); padding-bottom: 1rem; flex-wrap: wrap; gap: 15px;}

            .panel__input { font-family: var(--fuenteTexto); font-size: 0.9rem; border: 1px solid var(--gris-oscuro); padding: 0.8rem; border-radius: 8px; outline: none; }
            .panel__boton { background-color: var(--azul); color: var(--blanco); font-family: var(--fuenteBotones); font-size: 1rem; padding: 0.8rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; }
            .modern-table { width: 100%; border-collapse: collapse; background: var(--blanco); border-radius: 8px; overflow: hidden; }
            .modern-table thead { background-color: var(--negro); color: var(--blanco); font-family: var(--fuenteSubtitulo); font-size: 1.1rem; }
            .modern-table th { padding: 1.2rem; text-align: left; text-transform: uppercase; letter-spacing: 1px; }
            .modern-table tbody tr { border-bottom: 1px solid var(--gris-claro); }

            .modern-table td { padding: 1rem 1.2rem; font-family: var(--fuenteTexto); font-size: 0.95rem; color: var(--negro); }
            .badge-activo { color: var(--azul); font-weight: 800; font-family: var(--fuenteTexto); }
            .badge-inactivo { color: var(--rojo); font-weight: 800; font-family: var(--fuenteTexto); }
            .select-accion { padding: 0.5rem 1rem; border-radius: 20px; border: 1px solid var(--gris-oscuro); font-family: var(--fuenteTexto); outline: none; cursor: pointer; }
            .table-responsive { width: 100%; overflow-x: auto; }
            .btn-cancelar { background-color: var(--blanco); color: var(--rojo); font-family: var(--fuenteBotones); border: 2px solid var(--rojo); border-radius: 8px; padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
            .btn-guardar { background-color: var(--azul); color: var(--blanco); font-family: var(--fuenteBotones); border: 2px solid var(--azul); border-radius: 8px; padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: bold; cursor: pointer; }
        </style>
        <div class="panel" id="vistaCatalogos">
            <div class="panel__header">
                <h2 class="panel__titulo">Gestión de Catálogos</h2>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <button id="btnNuevoRegistro" class="panel__boton" style="padding: 10px 20px;">+ Nuevo Registro</button>
                    <select id="selectCatalogo" class="panel__input" style="width: 200px; padding: 10px; border-radius: 8px;">
                        ${catalogos.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
                    </select>
                    <input type="text" id="filtroCatalogo" placeholder="Buscar por nombre..." class="panel__input" style="width: 250px; padding: 10px; border-radius: 8px;">
                </div>
            </div>
            <div id="alerta-catalogo" style="margin-bottom: 15px;"></div>
            <div class="panel__contenido">
                <div class="table-responsive">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyCatalogos">
                            <tr><td colspan="5" style="text-align:center; padding: 20px;">Cargando catálogos...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal Único para Catálogos -->
        <div id="modalCatalogo" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); justify-content: center; align-items: flex-start; overflow-y: auto; padding: 40px 0;">
            <div class="modal-content" style="background: var(--blanco); padding: 40px; border-radius: 16px; width: 90%; max-width: 500px; position: relative; margin: auto; border: 1px solid var(--gris-claro);">
                <span id="cerrarModal" style="position: absolute; right: 25px; top: 20px; font-size: 28px; cursor: pointer; color: var(--gris-oscuro);">&times;</span>
                <h3 id="modalTitulo" style="color: var(--azul); font-family: var(--fuenteTitulos); margin-bottom: 25px; font-size: 1.8rem; font-weight: 800;">Nuevo Registro</h3>
                <form id="formCatalogo" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" id="inputId">
                    
                    <label style="font-family: var(--fuenteTexto); font-weight: bold;">Nombre:</label>
                    <input type="text" id="inputNombre" class="panel__input" required>
                    
                    <div id="containerDescripcion" style="display: flex; flex-direction: column; gap: 5px;">
                        <label style="font-family: var(--fuenteTexto); font-weight: bold;">Descripción:</label>
                        <textarea id="inputDescripcion" class="panel__input" rows="3"></textarea>
                    </div>

                    <div id="containerExtra" style="display: none; flex-direction: column; gap: 5px;">
                        <label id="labelExtra" style="font-family: var(--fuenteTexto); font-weight: bold;">Extra:</label>
                        <select id="inputExtra" class="panel__input"></select>
                    </div>

                    <div style="display: flex; gap: 15px; margin-top: 30px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid var(--gris-claro);">
                        <button type="button" class="btn-cancelar" id="btnCancelarCatalogo">Cancelar</button>
                        <button type="submit" class="btn-guardar">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const selectCatalogo = document.getElementById('selectCatalogo');
    const filtroCatalogo = document.getElementById('filtroCatalogo');
    const btnNuevoRegistro = document.getElementById('btnNuevoRegistro');
    const tbodyCatalogos = document.getElementById('tbodyCatalogos');
    const alertaCatalogo = document.getElementById('alerta-catalogo');

    // Elementos del Modal
    const modalCatalogo = document.getElementById('modalCatalogo');
    const cerrarModal = document.getElementById('cerrarModal');
    const formCatalogo = document.getElementById('formCatalogo');
    const inputId = document.getElementById('inputId');
    const inputNombre = document.getElementById('inputNombre');
    const containerDescripcion = document.getElementById('containerDescripcion');
    const inputDescripcion = document.getElementById('inputDescripcion');
    const containerExtra = document.getElementById('containerExtra');
    const inputExtra = document.getElementById('inputExtra');
    const labelExtra = document.getElementById('labelExtra');
    const modalTitulo = document.getElementById('modalTitulo');

    // Grupos musculares auxiliares (para cuando editamos Músculos)
    let gruposMuscularesData = [];

    const mostrarAlerta = (msg, error = false) => {
        alertaCatalogo.innerHTML = `<div style="padding: 10px; border-radius: 8px; color: #fff; background-color: ${error ? 'var(--rojo)' : 'var(--verde)'};">${msg}</div>`;
        setTimeout(() => alertaCatalogo.innerHTML = '', 4000);
    };

    const cargarDatos = async () => {
        try {
            tbodyCatalogos.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando...</td></tr>';
            
            const estaticos = ['objetivos', 'niveles', 'dificultad'];
            if (estaticos.includes(catalogoActual.id)) {
                btnNuevoRegistro.style.display = 'none';
            } else {
                btnNuevoRegistro.style.display = 'inline-block';
            }

            const res = await fetch(`${URL_BASE}/${catalogoActual.id}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Error al cargar datos');
            const result = await res.json();
            
            if (result.ok) {
                dataActual = result.data || [];
                renderTabla();
                
                // Si el catálogo actual es grupos musculares, guardamos cache para los músculos
                if (catalogoActual.id === 'gruposmusculares') {
                    gruposMuscularesData = dataActual;
                }
            } else {
                mostrarAlerta(result.mensaje, true);
            }
        } catch (error) {
            mostrarAlerta('Fallo de conexión', true);
        }
    };

    // Si necesitamos cargar los grupos musculares explícitamente para el combo de "Músculos"
    const cargarGruposMuscularesParaSelect = async () => {
        try {
            const res = await fetch(`${URL_BASE}/gruposmusculares`, { credentials: 'include' });
            const result = await res.json();
            if (result.ok) gruposMuscularesData = result.data || [];
        } catch(e) {}
    };

    const renderTabla = () => {
        const filtro = filtroCatalogo.value.toLowerCase();
        const filtrados = dataActual.filter(item => item.nombre && item.nombre.toLowerCase().includes(filtro));

        if (filtrados.length === 0) {
            tbodyCatalogos.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No hay registros encontrados.</td></tr>';
            return;
        }

        tbodyCatalogos.innerHTML = filtrados.map(item => {
            const estadoStr = item.activo 
                ? '<span class="badge-activo">Activo</span>' 
                : '<span class="badge-inactivo">Inactivo</span>';
            
            let descStr = item.descripcion || 'N/A';
            if (catalogoActual.id === 'musculos') {
                const gm = gruposMuscularesData.find(g => g.id === item.idGrupoMuscular);
                descStr = gm ? `Grupo: ${gm.nombre}` : `ID Grupo: ${item.idGrupoMuscular}`;
            }

            const estaticosHardDelete = ['objetivos', 'niveles', 'dificultad'];
            const permiteDelete = !estaticosHardDelete.includes(catalogoActual.id);

            return `
                <tr>
                    <td>${item.id}</td>
                    <td style="font-weight: bold;">${item.nombre}</td>
                    <td style="color: var(--gris-oscuro);">${descStr}</td>
                    <td>${estadoStr}</td>
                    <td style="display: flex; gap: 10px; align-items: center;">
                        <select class="select-accion" data-id="${item.id}" data-activo="${item.activo}">
                            <option value="">Acciones...</option>
                            <option value="editar">Editar</option>
                            <option value="toggle">${item.activo ? 'Inactivar' : 'Activar'}</option>
                            ${permiteDelete ? `<option value="eliminarDefinitivo" style="color:var(--rojo);">Borrado definitivo</option>` : ''}
                        </select>
                    </td>
                </tr>
            `;
        }).join('');

        // Listeners para botones de tabla
        document.querySelectorAll('.select-accion').forEach(select => {
            select.addEventListener('change', (e) => {
                const val = e.target.value;
                const idStr = e.target.dataset.id;
                const activo = e.target.dataset.activo === 'true';
                
                if(val === 'toggle') {
                    toggleEstado(idStr, activo);
                } else if(val === 'editar') {
                    abrirModal(idStr);
                } else if(val === 'eliminarDefinitivo') {
                    if(confirm('¿Estás seguro de eliminar físicamente este registro de la base de datos? Esto no se puede deshacer.')){
                        eliminarDefinitivo(idStr);
                    }
                }
                e.target.value = '';
            });
        });
    };

    const abrirModal = async (id = null) => {
        formCatalogo.reset();
        inputId.value = '';
        containerDescripcion.style.display = catalogoActual.hasDesc ? 'flex' : 'none';
        containerExtra.style.display = 'none';
        inputDescripcion.required = catalogoActual.hasDesc;

        if (catalogoActual.id === 'musculos') {
            containerExtra.style.display = 'flex';
            labelExtra.innerText = 'Grupo Muscular:';
            inputExtra.required = true;
            if (gruposMuscularesData.length === 0) await cargarGruposMuscularesParaSelect();
            inputExtra.innerHTML = '<option value="">Seleccione un Grupo Muscular...</option>' + 
                                   gruposMuscularesData.map(g => `<option value="${g.id}">${g.nombre}</option>`).join('');
        } else {
            inputExtra.required = false;
        }

        if (id) {
            modalTitulo.innerText = `Editar ${catalogoActual.label}`;
            const item = dataActual.find(x => x.id === id);
            if (item) {
                inputId.value = item.id;
                inputNombre.value = item.nombre;
                if (catalogoActual.hasDesc) inputDescripcion.value = item.descripcion || '';
                if (catalogoActual.id === 'musculos') inputExtra.value = item.idGrupoMuscular;
            }
        } else {
            modalTitulo.innerText = `Nuevo Registro en ${catalogoActual.label}`;
        }

        modalCatalogo.style.display = 'flex';
    };

    cerrarModal.addEventListener('click', () => modalCatalogo.style.display = 'none');
    document.getElementById('btnCancelarCatalogo').addEventListener('click', () => modalCatalogo.style.display = 'none');

    formCatalogo.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            nombre: inputNombre.value.trim()
        };

        if (catalogoActual.hasDesc) {
            payload.descripcion = inputDescripcion.value.trim();
        }

        if (catalogoActual.id === 'musculos') {
            payload.idGrupoMuscular = parseInt(inputExtra.value);
        }

        if (catalogoActual.id === 'objetivos') {
            // Un objetivo por defecto requiere niveles. En un sistema unificado sin la UI compleja de niveles, enviamos uno basico.
            payload.niveles = [{ idNivel: 1, series: 3, repeticiones: 10, descansoSeg: 60 }];
        }

        const method = inputId.value ? 'PUT' : 'POST';
        const url = inputId.value ? `${URL_BASE}/${catalogoActual.id}/${inputId.value}` : `${URL_BASE}/${catalogoActual.id}`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            const result = await res.json();
            if (result.ok) {
                mostrarAlerta('Guardado correctamente');
                modalCatalogo.style.display = 'none';
                cargarDatos();
            } else {
                mostrarAlerta(result.mensaje || 'Error al guardar', true);
            }
        } catch(err) {
            mostrarAlerta('Fallo de red', true);
        }
    });

    const toggleEstado = async (id, estadoActual) => {
        try {
            const nuevoEstado = estadoActual ? 0 : 1;
            const res = await fetch(`${URL_BASE}/${catalogoActual.id}/${id}?estado=${nuevoEstado}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const result = await res.json();
            if (result.ok) {
                mostrarAlerta('Estado actualizado');
                cargarDatos();
            } else {
                mostrarAlerta(result.mensaje || 'Error al actualizar', true);
            }
        } catch(err) {
            mostrarAlerta('Fallo de red', true);
        }
    };

    const eliminarDefinitivo = async (id) => {
        try {
            const res = await fetch(`${URL_BASE}/${catalogoActual.id}/${id}?estado=hard_delete`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const result = await res.json();
            if (result.ok) {
                mostrarAlerta('Registro eliminado definitivamente');
                cargarDatos();
            } else {
                if (result.data && result.data.code === 'DEPENDENCY_EXISTS') {
                    if (confirm(result.mensaje + '\n\n¿Deseas inactivarlo en su lugar para que deje de aparecer sin afectar otras rutinas?')) {
                        toggleEstado(id, true); // True asume que actualmente está activo y lo pasará a inactivo
                    }
                } else {
                    mostrarAlerta(result.mensaje || 'Hubo un error al eliminar el registro.', true);
                }
            }
        } catch(err) {
            mostrarAlerta('Fallo de red al eliminar', true);
        }
    };

    selectCatalogo.addEventListener('change', (e) => {
        catalogoActual = catalogos.find(c => c.id === e.target.value);
        filtroCatalogo.value = '';
        cargarDatos();
    });

    filtroCatalogo.addEventListener('input', renderTabla);
    btnNuevoRegistro.addEventListener('click', () => abrirModal());

    // Inicializar
    if (gruposMuscularesData.length === 0) cargarGruposMuscularesParaSelect();
    cargarDatos();
}
