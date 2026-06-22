export async function renderUsuariosPanel(container) {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api/admin/usuarios';

    let usuarios = [];

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
        </style>
        <div class="panel" id="vistaUsuarios">
            <div class="panel__header">
                <h2 class="panel__titulo">Gestión de Usuarios</h2>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select id="selectFiltroEstado" class="panel__input" style="width: 150px; padding: 10px; border-radius: 8px;">
                        <option value="">Todos</option>
                        <option value="activo">Activos</option>
                        <option value="inactivo">Inactivos</option>
                    </select>
                    <input type="text" id="filtroUsuarios" placeholder="Buscar por nombre o correo..." class="panel__input" style="width: 250px; padding: 10px; border-radius: 8px;">
                </div>
            </div>
            <div id="alerta-usuarios" style="margin-bottom: 15px;"></div>
            <div class="panel__contenido">
                <div class="table-responsive">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Paquete</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyUsuarios">
                            <tr><td colspan="6" style="text-align:center; padding: 20px;">Cargando usuarios...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal de Edición de Usuario -->
        <div id="modalUsuario" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); justify-content: center; align-items: flex-start; overflow-y: auto; padding: 40px 0;">
            <div class="modal-content" style="background: var(--blanco); padding: 40px; border-radius: 16px; width: 90%; max-width: 600px; position: relative; margin: auto; border: 1px solid var(--gris-claro);">
                <span id="cerrarModal" style="position: absolute; right: 25px; top: 20px; font-size: 28px; cursor: pointer; color: var(--gris-oscuro);">&times;</span>
                <h3 style="color: var(--azul); font-family: var(--fuenteTitulos); margin-bottom: 25px; font-size: 1.8rem; font-weight: 800;">Editar Usuario</h3>
                <form id="formUsuario" style="display: flex; flex-direction: column; gap: 15px;">
                    <input type="hidden" id="inputId">
                    
                    <label style="font-family: var(--fuenteTexto); font-weight: bold;">Nombre:</label>
                    <input type="text" id="inputNombre" class="panel__input" required>
                    
                    <label style="font-family: var(--fuenteTexto); font-weight: bold;">Correo:</label>
                    <input type="email" id="inputCorreo" class="panel__input" required>

                    <div style="display: flex; gap: 15px; margin-top: 30px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid var(--gris-claro);">
                        <button type="button" class="btn-cancelar" id="btnCancelarUsuario">Cancelar</button>
                        <button type="submit" class="btn-guardar">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Vista de Expediente de Usuario (Oculta por defecto) -->
        <div class="panel" id="vistaExpedienteUsuario" style="display: none; margin-top: 20px;">
            <div class="panel__header">
                <h2 class="panel__titulo">Expediente Físico del Usuario</h2>
                <button id="btnVolverMonitoreo" class="btn-cancelar">Cerrar Expediente</button>
            </div>
            
            <div style="display: flex; gap: 20px; padding: 20px 0 0 0; flex-wrap: wrap;">
                <!-- Tarjeta de Perfil Actual -->
                <div style="flex: 0 0 300px; background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
                    <h3 style="color: var(--negro); font-family: var(--fuenteSubtitulo); margin-bottom: 15px; font-size: 1.3rem;">Perfil Actual</h3>
                    <div id="perfilActualInfo" style="color: #555; line-height: 1.6; font-family: var(--fuenteTexto); font-size: 0.9rem;">
                        Cargando perfil...
                    </div>
                </div>

                <!-- Historial Evolutivo -->
                <div style="flex: 1; min-width: 400px; background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
                    <h3 style="color: var(--negro); font-family: var(--fuenteSubtitulo); margin-bottom: 15px; font-size: 1.5rem;">Historial Evolutivo</h3>
                    <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                        <table class="modern-table">
                            <thead>
                                <tr>
                                    <th>Peso</th>
                                    <th>Estatura</th>
                                    <th id="th-objetivo">Objetivo</th>
                                    <th>Nivel</th>
                                </tr>
                            </thead>
                            <tbody id="historialTableBody">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    const tbodyUsuarios = document.getElementById('tbodyUsuarios');
    const filtroUsuarios = document.getElementById('filtroUsuarios');
    const selectFiltroEstado = document.getElementById('selectFiltroEstado');
    const alertaUsuarios = document.getElementById('alerta-usuarios');
    const modalUsuario = document.getElementById('modalUsuario');
    const formUsuario = document.getElementById('formUsuario');

    const mostrarAlerta = (msg, error = false) => {
        alertaUsuarios.innerHTML = `<div style="padding: 10px; border-radius: 8px; color: #fff; background-color: ${error ? 'var(--rojo)' : 'var(--verde)'};">${msg}</div>`;
        setTimeout(() => alertaUsuarios.innerHTML = '', 4000);
    };

    /**
     * Llama al backend para traer la lista de todos los usuarios registrados en la plataforma.
     * Si todo sale bien, guarda la lista y manda a dibujar la tabla.
     */
    const cargarUsuarios = async () => {
        try {
            const res = await fetch(URL_BASE, { credentials: 'include' });
            if (!res.ok) throw new Error('Error de red');
            const result = await res.json();
            if (result.ok) {
                usuarios = result.data;
                renderTabla();
            } else {
                mostrarAlerta(result.mensaje, true);
            }
        } catch (error) {
            mostrarAlerta('Fallo al obtener usuarios', true);
        }
    };

    /**
     * Se encarga de pintar las filas de la tabla de usuarios. 
     * Además, aplica los filtros de búsqueda (por nombre o correo) y de estado (activos/inactivos).
     */
    const renderTabla = () => {
        const txt = filtroUsuarios.value.toLowerCase();
        const est = selectFiltroEstado.value;

        const filtrados = usuarios.filter(u => {
            const matchTxt = (u.nombre || '').toLowerCase().includes(txt) || (u.email || '').toLowerCase().includes(txt);
            const matchEst = est === '' || (est === 'activo' && u.activo) || (est === 'inactivo' && !u.activo);
            return matchTxt && matchEst;
        });

        if (filtrados.length === 0) {
            tbodyUsuarios.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No hay usuarios encontrados.</td></tr>';
            return;
        }

        tbodyUsuarios.innerHTML = filtrados.map(u => {
            const estadoStr = u.activo
                ? '<span class="badge-activo">Activo</span>'
                : '<span class="badge-inactivo">Inactivo</span>';
            const paqueteStr = u.paquete || 'N/A';

            return `
                <tr>
                    <td>${u.id}</td>
                    <td style="font-weight: bold;">${u.nombre || 'N/A'}</td>
                    <td style="color: var(--gris-oscuro);">${u.email}</td>
                    <td style="color: var(--gris-oscuro);">${paqueteStr}</td>
                    <td>${estadoStr}</td>
                    <td style="display: flex; gap: 10px; align-items: center;">
                        <select class="select-accion" data-id="${u.id}" data-activo="${u.activo}">
                            <option value="">Acciones...</option>
                            <option value="ver-perfil">Ver Perfil Físico</option>
                            <option value="editar">Editar</option>
                            <option value="toggle">${u.activo ? 'Inactivar' : 'Activar'}</option>
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
                    toggleEstado(id, e.target.dataset.activo === 'true');
                } else if (val === 'editar') {
                    abrirModal(id);
                } else if (val === 'ver-perfil') {
                    verExpediente(id);
                }
                e.target.value = '';
            });
        });
    };

    /**
     * Abre el modal (la ventanita flotante) para editar el nombre y correo del usuario.
     * @param {number} id - Identificador único del usuario a editar.
     */
    const abrirModal = (id) => {
        const u = usuarios.find(x => x.id === id);
        if (u) {
            document.getElementById('inputId').value = u.id;
            document.getElementById('inputNombre').value = u.nombre || '';
            document.getElementById('inputCorreo').value = u.email || '';
            modalUsuario.style.display = 'flex';
        }
    };

    document.getElementById('cerrarModal').addEventListener('click', () => modalUsuario.style.display = 'none');
    document.getElementById('btnCancelarUsuario').addEventListener('click', () => modalUsuario.style.display = 'none');

    formUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('inputId').value;
        const u = usuarios.find(x => x.id == id);
        const payload = {
            nombre: document.getElementById('inputNombre').value.trim(),
            email: document.getElementById('inputCorreo').value.trim(),
            idRol: u ? u.idRol : 1
        };

        try {
            const res = await fetch(`${URL_BASE}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            const result = await res.json();
            if (result.ok) {
                mostrarAlerta('Usuario actualizado con éxito');
                modalUsuario.style.display = 'none';
                cargarUsuarios();
            } else {
                mostrarAlerta(result.mensaje || 'Error al actualizar', true);
            }
        } catch (err) {
            mostrarAlerta('Fallo de red', true);
        }
    });

    /**
     * Cambia el estado de acceso de un usuario.
     * Si está activo, lo desactiva (no podrá iniciar sesión). Si está inactivo, lo activa de nuevo.
     * @param {number} id - ID del usuario.
     * @param {boolean} estadoActual - true si está activo, false si está inactivo.
     */
    const toggleEstado = async (id, estadoActual) => {
        try {
            const nuevoEstado = estadoActual ? 0 : 1;
            const res = await fetch(`${URL_BASE}/${id}?estado=${nuevoEstado}`, { method: 'DELETE', credentials: 'include' });
            const result = await res.json();
            if (result.ok) {
                mostrarAlerta('Estado del usuario actualizado');
                cargarUsuarios();
            } else {
                mostrarAlerta(result.mensaje || 'Error al actualizar estado', true);
            }
        } catch (err) {
            mostrarAlerta('Fallo de red', true);
        }
    };

    filtroUsuarios.addEventListener('input', renderTabla);
    selectFiltroEstado.addEventListener('change', renderTabla);

    document.getElementById('btnVolverMonitoreo').addEventListener('click', () => {
        document.getElementById('vistaExpedienteUsuario').style.display = 'none';
    });

    const API_MONITOREO = 'http://localhost:8080/RebootBackend/api/admin/monitoreo';

    /**
     * Muestra la información física actual del usuario y su historial.
     * @param {number} idUsuario - A quién pertenece el expediente.
     */
    const verExpediente = async (idUsuario) => {
        document.getElementById('vistaExpedienteUsuario').style.display = 'block';

        // Cargar Perfil Actual
        const infoDiv = document.getElementById('perfilActualInfo');
        infoDiv.innerHTML = `<em>Consultando perfil...</em>`;

        const userObj = usuarios.find(u => u.id === idUsuario);
        let esPro = userObj ? userObj.paquete === 'Pro' : false;

        try {
            const resp = await fetch(`${API_MONITOREO}/perfil/${idUsuario}`, { credentials: 'include' });
            if (!resp.ok) {
                if (resp.status === 404) {
                    infoDiv.innerHTML = `<em>El usuario no tiene un perfil físico registrado.</em>`;
                } else {
                    infoDiv.innerHTML = `<span style="color: red;">Error HTTP ${resp.status} al cargar perfil.</span>`;
                }
            } else {
                const json = await resp.json();
                if (json.ok && json.data) {
                    const p = json.data;
                    esPro = p.idPaquete === 2 || !p.objetivo;

                    const formatoFecha = (fechaHora) => {
                        if (!fechaHora || fechaHora === 'N/A') return 'N/A';
                        const d = new Date(fechaHora);
                        if (!isNaN(d.getTime())) {
                            const dia = String(d.getDate()).padStart(2, '0');
                            const mes = String(d.getMonth() + 1).padStart(2, '0');
                            const anio = d.getFullYear();
                            return `${dia}/${mes}/${anio}`;
                        }
                        return fechaHora;
                    };

                    infoDiv.innerHTML = `
                        <p><strong>Peso:</strong> ${p.peso} kg</p>
                        <p><strong>Estatura:</strong> ${p.estatura} cm</p>
                        <p><strong>Nivel:</strong> <span style="text-transform: capitalize;">${p.nivel}</span></p>
                        ${esPro ? '' : `<p><strong>Objetivo:</strong> ${p.objetivo}</p>`}
                        <p><strong>Última Actualización:</strong> ${formatoFecha(p.fechaActualizacion)}</p>
                    `;
                } else {
                    infoDiv.innerHTML = `<span style="color: red;">${json.mensaje || 'Perfil no encontrado'}</span>`;
                }
            }
        } catch (e) {
            infoDiv.innerHTML = `<span style="color: red;">Error de red al intentar cargar perfil.</span>`;
        }

        // Cargar Historial
        const tbodyH = document.getElementById('historialTableBody');
        const thObjetivo = document.getElementById('th-objetivo');

        if (esPro) {
            thObjetivo.style.display = 'none';
        } else {
            thObjetivo.style.display = '';
        }

        tbodyH.innerHTML = `<tr><td colspan="${esPro ? 3 : 4}" style="padding:10px;">Cargando historial...</td></tr>`;

        try {
            const resp = await fetch(`${API_MONITOREO}/historial/${idUsuario}`, { credentials: 'include' });
            if (!resp.ok) {
                if (resp.status === 404 || resp.status === 500) {
                    tbodyH.innerHTML = `<tr><td colspan="${esPro ? 3 : 4}" style="padding:10px;">El usuario no tiene historial previo registrado.</td></tr>`;
                } else {
                    tbodyH.innerHTML = `<tr><td colspan="${esPro ? 3 : 4}" style="padding:10px; color:red;">Error HTTP ${resp.status} al cargar historial.</td></tr>`;
                }
            } else {
                const json = await resp.json();

                tbodyH.innerHTML = '';
                if (json.ok && json.data && json.data.length > 0) {
                    json.data.forEach(h => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${h.peso} kg</td>
                            <td>${h.estatura} cm</td>
                            ${esPro ? '' : `<td>${h.objetivo}</td>`}
                            <td style="text-transform: capitalize;">${h.nivel}</td>
                        `;
                        tbodyH.appendChild(tr);
                    });
                } else {
                    tbodyH.innerHTML = `<tr><td colspan="${esPro ? 3 : 4}" style="padding:10px;">El usuario no tiene historial previo registrado.</td></tr>`;
                }
            }
        } catch (e) {
            tbodyH.innerHTML = `<tr><td colspan="${esPro ? 3 : 4}" style="padding:10px; color:red;">Error de red al cargar historial.</td></tr>`;
        }

        document.getElementById('vistaExpedienteUsuario').scrollIntoView({ behavior: 'smooth' });
    };

    // Iniciar carga
    await cargarUsuarios();
}
