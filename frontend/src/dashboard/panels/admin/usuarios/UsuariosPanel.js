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
                if(val === 'toggle') {
                    toggleEstado(id, e.target.dataset.activo === 'true');
                } else if(val === 'editar') {
                    abrirModal(id);
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
        } catch(err) {
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
        } catch(err) {
            mostrarAlerta('Fallo de red', true);
        }
    };

    filtroUsuarios.addEventListener('input', renderTabla);
    selectFiltroEstado.addEventListener('change', renderTabla);

    // Iniciar carga
    await cargarUsuarios();
}
