const URL_BASE = 'http://localhost:8080/RebootBackend/api';

export function renderMonitoreoPanel(container) {
    container.innerHTML = `
        <style>
            .panel { padding: 2rem; font-family: var(--fuenteTexto); background: var(--blanco); border-radius: 12px; }
            .panel__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--negro); padding-bottom: 1rem; flex-wrap: wrap; gap: 15px;}

            .panel__input { font-family: var(--fuenteTexto); font-size: 0.8rem; border: 2px solid var(--gris-claro); padding: 0.5rem 0.8rem; border-radius: 8px; outline: none; width: auto; max-width: 100%; }
            .panel__input:focus { border-color: var(--azul); }
            .panel__boton { background-color: var(--azul); color: var(--blanco); font-family: var(--fuenteBotones); font-size: 0.9rem; padding: 0.6rem 1.2rem; border: none; border-radius: 8px; cursor: pointer; text-transform: uppercase; }
            
            .modern-table { width: 100%; border-collapse: collapse; background: var(--blanco); border-radius: 8px; overflow: hidden; min-width: 600px; }
            .modern-table thead { background-color: var(--negro); color: var(--blanco); font-family: var(--fuenteSubtitulo); font-size: 1.1rem; }
            .modern-table th { padding: 1.2rem; text-align: left; text-transform: uppercase; letter-spacing: 1px; }
            .modern-table tbody tr { border-bottom: 1px solid var(--gris-claro); }

            .modern-table td { padding: 1rem 1.2rem; font-family: var(--fuenteTexto); font-size: 0.95rem; color: #333; }
            .btn-editar { background-color: var(--azul); color: var(--blanco); font-family: var(--fuenteBotones); border: none; border-radius: 20px; padding: 0.5rem 1.5rem; font-size: 0.9rem; cursor: pointer; text-transform: uppercase; }
            .btn-ver-perfil { background-color: var(--azul); color: var(--blanco); padding: 0.3rem 0.8rem; font-size: 0.7rem; }
            .btn-cerrar-expediente { background-color: var(--blanco); color: var(--rojo); font-family: var(--fuenteBotones); border: 2px solid var(--rojo); border-radius: 8px; padding: 0.4rem 1rem; font-size: 0.8rem; cursor: pointer; text-transform: uppercase; }
            .badge-activa { color: #00a650; font-weight: 800; font-family: var(--fuenteTexto); }
            .badge-abandonada { color: var(--rojo); font-weight: 800; font-family: var(--fuenteTexto); }
            .badge-completada { color: var(--azul); font-weight: 800; font-family: var(--fuenteTexto); }
        </style>
        <div class="panel" id="vistaRutinasGlobales">
            <div class="panel__header">
                <h2 class="panel__titulo">Supervisión y Monitoreo Global</h2>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <select id="selectFiltroEstado" class="panel__input">
                        <option value="">Todos los Estados</option>
                        <option value="Activa">Activa</option>
                        <option value="Completada">Completada</option>
                        <option value="Abandonada">Abandonada</option>
                    </select>
                    <input type="text" id="filtroMonitoreo" placeholder="Buscar por usuario..." class="panel__input">
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>ID Rutina</th>
                            <th>Usuario</th>
                            <th>Tipo</th>
                            <th>Inicio / Fin</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="rutinasTableBody">
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 20px;">Cargando rutinas globales...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Vista de Expediente de Usuario (Oculta por defecto) -->
        <div class="panel" id="vistaExpedienteUsuario" style="display: none; margin-top: 20px;">
            <div class="panel__header">
                <h2 class="panel__titulo">Expediente Físico del Usuario</h2>
                <button id="btnVolverMonitoreo" class="btn-cerrar-expediente">Cerrar Expediente</button>
            </div>
            
            <div style="display: flex; gap: 20px; padding: 20px 0 0 0; flex-wrap: wrap;">
                <!-- Tarjeta de Perfil Actual -->
                <div style="flex: 0 0 300px; background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
                    <h3 style="color: var(--negro); font-family: var(--fuenteSubtitulo); margin-bottom: 15px; font-size: 1.5rem;">Perfil Actual</h3>
                    <div id="perfilActualInfo" style="color: #555; line-height: 1.8; font-family: var(--fuenteTexto);">
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
                                    <th>Fecha</th>
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

    let rutinasData = [];

    /**
     * Trae de la base de datos todas las rutinas (activas, completadas o abandonadas)
     * de todos los usuarios, para que el administrador pueda supervisarlas.
     */
    const cargarRutinas = async () => {
        const estado = document.getElementById('selectFiltroEstado').value;
        const tbody = document.getElementById('rutinasTableBody');
        tbody.innerHTML = `<tr class="ejercicios-panel__fila"><td colspan="6" class="ejercicios-panel__celda ejercicios-panel__celda--vacio">Cargando...</td></tr>`;

        let url = `${URL_BASE}/admin/monitoreo/rutinas`;
        if (estado) url += `?estado=${estado}`;

        try {
            const resp = await fetch(url, { credentials: 'include' });
            if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
            const json = await resp.json();

            if (json.ok && json.data) {
                rutinasData = json.data;
                renderRutinas();
            } else {
                tbody.innerHTML = `<tr class="ejercicios-panel__fila"><td colspan="6" class="ejercicios-panel__celda ejercicios-panel__celda--vacio">No se encontraron rutinas</td></tr>`;
            }
        } catch (e) {
            tbody.innerHTML = `<tr class="ejercicios-panel__fila"><td colspan="6" class="ejercicios-panel__celda ejercicios-panel__celda--vacio" style="color: red;">Error al cargar rutinas</td></tr>`;
        }
    };

    /**
     * Pinta en pantalla la lista de rutinas. Si el administrador escribe en el buscador,
     * esta misma función filtra las rutinas para mostrar solo las que coincidan.
     */
    const renderRutinas = () => {
        const tbody = document.getElementById('rutinasTableBody');
        const filtroTexto = document.getElementById('filtroMonitoreo').value.toLowerCase();
        
        const filtradas = rutinasData.filter(r => 
            r.nombreUsuario && r.nombreUsuario.toLowerCase().includes(filtroTexto)
        );

        tbody.innerHTML = '';
        if (filtradas.length > 0) {
            filtradas.forEach(r => {
                const tr = document.createElement('tr');
                
                const estadoStr = (r.estado || '').toLowerCase();
                let badgeClass = 'badge-completada';
                if (estadoStr === 'activa') badgeClass = 'badge-activa';
                if (estadoStr === 'abandonada') badgeClass = 'badge-abandonada';
                
                const formatoFecha = (fechaHora) => {
                    if (!fechaHora || fechaHora === 'N/A') return 'N/A';
                    return fechaHora.split(' ')[0].split('T')[0];
                };

                let startDate = r.fechaInicio || r.fechaCreacion;
                let endDate = r.fechaFin;
                
                if (!endDate && (estadoStr === 'completada' || estadoStr === 'abandonada')) {
                    endDate = r.fechaActualizacion || r.fechaCancelacion || r.fechaFinalizacion || r.fechaTermino;
                }

                const fechas = `${formatoFecha(startDate)} / ${formatoFecha(endDate)}`;

                tr.innerHTML = `
                    <td>${r.id}</td>
                    <td><strong>${r.nombreUsuario}</strong></td>
                    <td style="text-transform: capitalize; color: var(--gris-oscuro);">${r.tipoRutina || '—'}</td>
                    <td>${fechas}</td>
                    <td><span class="${badgeClass}">${(r.estado || '').toUpperCase()}</span></td>
                    <td style="display: flex; gap: 10px; align-items: center;">
                        <button class="btn-editar btn-ver-perfil" data-idusuario="${r.idUsuario}" data-rutinaid="${r.id}">
                            Ver Perfil Físico
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No se encontraron rutinas coincidentes</td></tr>`;
        }
    };

    /**
     * Al hacer clic en "Ver Perfil Físico", esta función abre una ventana debajo de la tabla
     * que muestra la información física actual del usuario (peso, estatura, nivel) y 
     * un historial de cómo han ido cambiando esos datos.
     * @param {number} idUsuario - A quién pertenece el expediente.
     * @param {Object} rutina - Datos de la rutina asociada.
     */
    const verExpediente = async (idUsuario, rutina) => {
        document.getElementById('vistaExpedienteUsuario').style.display = 'block';
        
        // Cargar Perfil Actual
        const infoDiv = document.getElementById('perfilActualInfo');
        infoDiv.innerHTML = `<em>Consultando perfil...</em>`;
        
        let esPro = false;
        if (rutina) {
            esPro = rutina.idPaquete === 2 || !rutina.idObjetivo;
        }

        try {
            const resp = await fetch(`${URL_BASE}/admin/monitoreo/perfil/${idUsuario}`, { credentials: 'include' });
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
                        return fechaHora.split(' ')[0].split('T')[0];
                    };

                    infoDiv.innerHTML = `
                        <p><strong>Peso:</strong> ${p.peso} kg</p>
                        <p><strong>Estatura:</strong> ${p.estatura} m</p>
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

        tbodyH.innerHTML = `<tr class="ejercicios-panel__fila"><td colspan="${esPro ? 4 : 5}" class="ejercicios-panel__celda ejercicios-panel__celda--vacio">Cargando historial...</td></tr>`;
        
        try {
            const resp = await fetch(`${URL_BASE}/admin/monitoreo/historial/${idUsuario}`, { credentials: 'include' });
            if (!resp.ok) {
                if (resp.status === 404 || resp.status === 500) {
                    tbodyH.innerHTML = `<tr class="ejercicios-panel__fila"><td colspan="${esPro ? 4 : 5}" class="ejercicios-panel__celda ejercicios-panel__celda--vacio">El usuario no tiene historial previo registrado.</td></tr>`;
                } else {
                    tbodyH.innerHTML = `<tr class="ejercicios-panel__fila"><td colspan="${esPro ? 4 : 5}" class="ejercicios-panel__celda ejercicios-panel__celda--vacio" style="color:red;">Error HTTP ${resp.status} al cargar historial.</td></tr>`;
                }
            } else {
                const json = await resp.json();
                
                tbodyH.innerHTML = '';
                if (json.ok && json.data && json.data.length > 0) {
                    json.data.forEach(h => {
                        const tr = document.createElement('tr');
                        tr.className = 'ejercicios-panel__fila';
                        tr.innerHTML = `
                            <td>${h.fechaRegistro ? h.fechaRegistro.split(' ')[0].split('T')[0] : ''}</td>
                            <td>${h.peso} kg</td>
                            <td>${h.estatura} m</td>
                            ${esPro ? '' : `<td>${h.objetivo}</td>`}
                            <td style="text-transform: capitalize;">${h.nivel}</td>
                        `;
                        tbodyH.appendChild(tr);
                    });
                } else {
                    tbodyH.innerHTML = `<tr class="ejercicios-panel__fila"><td colspan="${esPro ? 4 : 5}" class="ejercicios-panel__celda ejercicios-panel__celda--vacio">El usuario no tiene historial previo registrado.</td></tr>`;
                }
            }
        } catch (e) {
            tbodyH.innerHTML = `<tr class="ejercicios-panel__fila"><td colspan="${esPro ? 4 : 5}" class="ejercicios-panel__celda ejercicios-panel__celda--vacio" style="color:red;">Error de red al cargar historial.</td></tr>`;
        }
    };

    // Eventos
    document.getElementById('selectFiltroEstado').addEventListener('change', cargarRutinas);
    document.getElementById('filtroMonitoreo').addEventListener('input', renderRutinas);
    
    document.getElementById('btnVolverMonitoreo').addEventListener('click', () => {
        document.getElementById('vistaExpedienteUsuario').style.display = 'none';
    });

    document.getElementById('rutinasTableBody').addEventListener('click', (e) => {
        const btnVer = e.target.closest('.btn-ver-perfil');
        if (btnVer) {
            const idUsuario = parseInt(btnVer.dataset.idusuario);
            const rutinaId = parseInt(btnVer.dataset.rutinaid);
            const rutina = rutinasData.find(r => r.id === rutinaId);
            
            verExpediente(idUsuario, rutina);
            // Scroll suave hacia el expediente
            document.getElementById('vistaExpedienteUsuario').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Carga inicial
    cargarRutinas();
}
