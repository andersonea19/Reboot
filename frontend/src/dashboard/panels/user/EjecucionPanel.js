/**
 * Dibuja el panel de ejecución de una rutina específica (el "Día X").
 * Aquí el usuario ve su lista de ejercicios para hoy y los va marcando como completados.
 * 
 * @param {HTMLElement} container - El cajón donde se inyectará la vista.
 * @param {Object} diaRutina - Los datos del día actual (ejercicios, series, reps).
 */
export async function renderEjecucionPanel(container, diaRutina) {
    if (!diaRutina) {
        container.innerHTML = '<div style="color: var(--rojo); padding: 20px;">Error: No se recibió la información del día.</div>';
        return;
    }

    let ejerciciosHTML = '';
    if (!diaRutina.ejercicios || diaRutina.ejercicios.length === 0) {
        ejerciciosHTML = '<p style="color: var(--gris-oscuro);">Este es un día de descanso o no hay ejercicios programados.</p>';
    } else {
        ejerciciosHTML = diaRutina.ejercicios.map((ej, index) => {
            const isCompletado = ej.estado === 'Completado';
            const cardOpacity = isCompletado ? '0.6' : '1';
            const btnText = isCompletado ? 'Completado' : 'Marcar Completado';
            
            return `
                <div class="ejercicio-card" id="ejercicio-${ej.id}" style="background: var(--blanco); border: 1px solid var(--gris-claro); border-radius: 8px; padding: 15px; margin-bottom: 15px; opacity: ${cardOpacity}; transition: all 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: var(--azul); font-family: var(--fuenteTitulos);">${index + 1}. ${ej.nombre}</h4>
                    </div>
                    <p style="margin: 0 0 10px 0; color: var(--negro); font-size: 0.95rem;">${ej.instrucciones || 'Sigue la técnica correcta.'}</p>
                    <div style="display: flex; gap: 15px; margin-bottom: 15px; font-weight: bold; color: var(--gris-oscuro); font-size: 0.9rem;">
                        <span>Series: ${ej.series}</span>
                        <span>Reps: ${ej.repeticiones}</span>
                        <span>Descanso: ${ej.descansoSeg}s</span>
                    </div>
                    <button class="btn-completar" data-id="${ej.id}" ${isCompletado ? 'disabled' : ''} style="width: 100%; padding: 10px; background: ${isCompletado ? 'var(--gris-claro)' : 'var(--azul)'}; color: ${isCompletado ? 'var(--gris-oscuro)' : 'var(--blanco)'}; border: none; border-radius: 4px; cursor: ${isCompletado ? 'not-allowed' : 'pointer'};">
                        ${btnText}
                    </button>
                </div>
            `;
        }).join('');
    }

    container.innerHTML = `
        <div class="panel" style="background: var(--blanco); border: 1px solid var(--gris-claro); border-radius: 8px; max-width: 800px; margin: 0 auto; padding: 30px; font-family: var(--fuenteTexto);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--gris-claro); padding-bottom: 10px;">
                <h2 class="panel__titulo">Día ${diaRutina.numDia}</h2>
                <button id="btn-volver-rutinas" style="padding: 8px 15px; background: transparent; border: 1px solid var(--gris-claro); border-radius: 4px; cursor: pointer;">Volver</button>
            </div>
            
            <div id="ejercicios-container">
                ${ejerciciosHTML}
            </div>
        </div>
    `;

    container.querySelector('#btn-volver-rutinas').addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('navegar-rutinas-activas'));
    });

    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    
    // -------------------------------------------------------------------------
    // Lógica para marcar ejercicios como completados
    // -------------------------------------------------------------------------
    const botones = container.querySelectorAll('.btn-completar');
    botones.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const idEj = btn.getAttribute('data-id');
            const card = container.querySelector(`#ejercicio-${idEj}`);
            
            btn.disabled = true;
            btn.innerText = 'Marcando...';

            try {
                const respuesta = await fetch(`${URL_BASE}/rutinas/ejecucion/${idEj}`, {
                    method: 'PUT',
                    credentials: 'include'
                });

                const json = await respuesta.json();

                if (json.ok) {
                    btn.innerText = 'Completado';
                    btn.style.background = 'var(--gris-claro)';
                    btn.style.color = 'var(--gris-oscuro)';
                    btn.style.cursor = 'not-allowed';
                    card.style.opacity = '0.6';
                } else {
                    alert('Error: ' + json.mensaje);
                    btn.disabled = false;
                    btn.innerText = 'Marcar Completado';
                }
            } catch (error) {
                console.error(error);
                alert('Error de red al marcar como completado.');
                btn.disabled = false;
                btn.innerText = 'Marcar Completado';
            }
        });
    });
}
