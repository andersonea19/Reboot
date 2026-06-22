import { sessionStore } from '../../../store/sessionStore.js';

export async function renderHistorialRutinasPanel(container) {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    const usuario = sessionStore.getUsuario();

    container.innerHTML = `
        <style>
            .panel { padding: 2rem; font-family: var(--fuenteTexto); background: var(--blanco); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .panel__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--negro); padding-bottom: 1rem; flex-wrap: wrap; gap: 15px;}

            .table-responsive { width: 100%; overflow-x: auto; }
            .modern-table { width: 100%; border-collapse: collapse; background: var(--blanco); border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05); min-width: 600px; }
            .modern-table thead { background-color: var(--negro); color: var(--blanco); font-family: var(--fuenteSubtitulo); font-size: 1.1rem; }
            .modern-table th { padding: 1.2rem; text-align: left; text-transform: uppercase; letter-spacing: 1px; }
            .modern-table tbody tr { border-bottom: 1px solid var(--gris-claro); transition: 0.2s; }
            .modern-table tbody tr:hover { background-color: #fafafa; }
            .modern-table td { padding: 1rem 1.2rem; font-family: var(--fuenteTexto); font-size: 0.95rem; color: #333; }
            .badge-abandonada { color: var(--rojo); font-weight: 800; font-family: var(--fuenteTexto); }
            .badge-completada { color: var(--azul); font-weight: 800; font-family: var(--fuenteTexto); }
        </style>
        
        <div class="panel" id="vistaHistorial">
            <div class="panel__header">
                <h2 class="panel__titulo">Historial Evolutivo</h2>
                <select id="filtroEstado" style="padding: 10px; border-radius: 8px; border: 2px solid var(--gris-claro); font-family: var(--fuenteTexto); outline: none;">
                    <option value="todas">Todas las Rutinas</option>
                    <option value="completada">Completadas</option>
                    <option value="abandonada">Abandonadas</option>
                </select>
            </div>

            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>ID Rutina</th>
                            <th>Tipo de Rutina</th>
                            <th>${usuario.idPaquete === 2 ? 'Objetivo / Coach' : 'Objetivo'}</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Estado Final</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyHistorial">
                        <tr><td colspan="6" style="text-align:center; padding:20px;">Cargando historial...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    let todasMisRutinas = [];

    const cargarHistorial = async () => {
        try {
            const resp = await fetch(`${URL_BASE}/rutinas/historial`, { credentials: 'include' });
            if (!resp.ok) throw new Error('Error al obtener rutinas');
            
            const json = await resp.json();
            if (json.ok && json.data) {
                // Filtrar rutinas que no estén activas (solo completadas o abandonadas)
                todasMisRutinas = json.data.filter(r => 
                    (r.estado || '').toLowerCase() !== 'activa' &&
                    (r.estado || '').toLowerCase() !== 'en progreso'
                );
                
                renderTabla(todasMisRutinas);
            }
        } catch (e) {
            document.getElementById('tbodyHistorial').innerHTML = 
                `<tr><td colspan="6" style="text-align:center; padding:20px; color: var(--rojo);">No se pudo cargar el historial.</td></tr>`;
        }
    };

    const renderTabla = (rutinas) => {
        const tbody = document.getElementById('tbodyHistorial');
        
        tbody.innerHTML = '';

        if (rutinas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Aún no tienes rutinas completadas o abandonadas.</td></tr>`;
            return;
        }

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

        rutinas.sort((a, b) => b.id - a.id).forEach(r => {
            const tr = document.createElement('tr');
            
            const estadoStr = (r.estado || '').toLowerCase();
            let badgeClass = 'badge-completada';
            if (estadoStr === 'abandonada') badgeClass = 'badge-abandonada';
            
            let startDate = r.fechaInicio || r.fechaCreacion;
            let endDate = r.fechaCulminacion || r.fechaFin || r.fechaActualizacion || r.fechaCancelacion;
            
            // Fallback si no hay fechaFin y la rutina fue completada o abandonada, mostramos la de inicio
            if (!endDate || endDate === 'N/A') {
                endDate = startDate;
            }

            const isPro = usuario.idPaquete === 2;
            let objetivoHtml = '';
            
            if (isPro) {
                const nombreCoach = r.instructorNombre || 'N/A';
                const nombreObj = r.nombreObjetivo || r.objetivoNombre || 'N/A';
                objetivoHtml = `
                    <div style="font-size: 0.75rem;">
                        <span style="color: var(--azul); font-weight: bold; text-transform: capitalize;">${nombreCoach}</span> 
                        <span style="color: var(--negro); font-weight: bold;">/</span> 
                        <span style="color: var(--gris-oscuro); text-transform: capitalize;">${nombreObj}</span>
                    </div>
                `;
            } else {
                objetivoHtml = `<span style="font-size: 0.75rem;">${r.nombreObjetivo || r.objetivoNombre || 'N/A'}</span>`;
            }

            tr.innerHTML = `
                <td>${r.id}</td>
                <td style="text-transform: capitalize; font-weight: bold;">${r.tipoRutina || 'Automática'}</td>
                <td>${objetivoHtml}</td>
                <td>${formatoFecha(startDate)}</td>
                <td>${formatoFecha(endDate)}</td>
                <td><span class="${badgeClass}">${(r.estado || '').toUpperCase()}</span></td>
            `;
            tbody.appendChild(tr);
        });
    };

    await cargarHistorial();

    document.getElementById('filtroEstado').addEventListener('change', (e) => {
        const estadoFiltro = e.target.value;
        if (estadoFiltro === 'todas') {
            renderTabla(todasMisRutinas);
        } else {
            const filtradas = todasMisRutinas.filter(r => (r.estado || '').toLowerCase() === estadoFiltro);
            renderTabla(filtradas);
        }
    });
}
