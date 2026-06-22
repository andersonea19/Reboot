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
                            <th>Objetivo</th>
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
                    const d = new Date(fechaHora);
                    if (!isNaN(d.getTime())) {
                        const dia = String(d.getDate()).padStart(2, '0');
                        const mes = String(d.getMonth() + 1).padStart(2, '0');
                        const anio = d.getFullYear();
                        return `${dia}/${mes}/${anio}`;
                    }
                    return fechaHora;
                };

                let startDate = r.fechaInicio || r.fechaCreacion;
                let endDate = r.fechaFin;
                
                if (!endDate && (estadoStr === 'completada' || estadoStr === 'abandonada')) {
                    endDate = r.fechaCulminacion || r.fechaActualizacion || r.fechaCancelacion || r.fechaFinalizacion || r.fechaTermino;
                }

                let textoObjetivo = 'Sin objetivo';
                if (r.objetivo) {
                    // idPaquete === 2 es PRO
                    if (r.idPaquete === 2 && r.instructor) {
                        textoObjetivo = `${r.objetivo} <br><small style="color:var(--gris-oscuro); text-transform:none;">Instructor: ${r.instructor}</small>`;
                    } else {
                        textoObjetivo = r.objetivo;
                    }
                }

                const fechas = `${formatoFecha(startDate)} / ${formatoFecha(endDate)}`;

                tr.innerHTML = `
                    <td>${r.id}</td>
                    <td><strong>${r.nombreUsuario}</strong></td>
                    <td style="text-transform: capitalize; color: var(--gris-oscuro);">${r.tipoRutina || '—'}</td>
                    <td>${fechas}</td>
                    <td><span class="${badgeClass}">${(r.estado || '').toUpperCase()}</span></td>
                    <td style="text-transform: capitalize;">${textoObjetivo}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No se encontraron rutinas coincidentes</td></tr>`;
        }
    };



    // Eventos
    document.getElementById('selectFiltroEstado').addEventListener('change', cargarRutinas);
    document.getElementById('filtroMonitoreo').addEventListener('input', renderRutinas);
    


    // Carga inicial
    cargarRutinas();
}
