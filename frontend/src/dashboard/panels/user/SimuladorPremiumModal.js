export function abrirSimuladorPremiumModal(onExito) {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    
    // Crear el overlay y el modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" style="max-width: 450px; background: var(--blanco); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: var(--fuenteTexto);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="font-family: var(--fuenteTitulos); font-size: 1.5rem; color: var(--rojo); margin: 0;">Simulador Premium</h3>
                <p style="color: var(--gris-oscuro); font-size: 0.95rem;">Avanza el tiempo para probar la caducidad del paquete Pro.</p>
            </div>

            <div id="simulador-alerta" style="text-align: center; margin-bottom: 15px;"></div>

            <div style="display: flex; gap: 10px;">
                <button type="button" id="btn-cerrar-simulador" style="flex: 1; padding: 12px; border: 1px solid var(--gris-claro); background: transparent; border-radius: 4px; cursor: pointer; color: var(--negro);">Cerrar</button>
                <button type="button" id="btn-simular-tiempo" style="flex: 1; padding: 12px; border: none; background: var(--rojo); color: var(--blanco); border-radius: 4px; cursor: pointer; font-weight: bold;">Adelantar 35 días</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnCerrar = overlay.querySelector('#btn-cerrar-simulador');
    const btnSimular = overlay.querySelector('#btn-simular-tiempo');
    const alertaEl = overlay.querySelector('#simulador-alerta');

    // Cerrar modal
    btnCerrar.addEventListener('click', () => overlay.remove());

    // Ejecutar simulación
    btnSimular.addEventListener('click', async () => {
        alertaEl.innerHTML = '<span style="color: var(--gris-oscuro);">Simulando...</span>';
        btnSimular.disabled = true;

        try {
            const respuesta = await fetch(`${URL_BASE}/test/simular-dias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            const json = await respuesta.json();

            if (json.ok) {
                alertaEl.innerHTML = `<span style="color: var(--azul); font-weight: bold;">${json.mensaje}</span>`;
                setTimeout(() => {
                    overlay.remove();
                    if (onExito) onExito();
                }, 3000);
            } else {
                alertaEl.innerHTML = `<span style="color: var(--rojo);">${json.mensaje}</span>`;
                btnSimular.disabled = false;
            }

        } catch (error) {
            console.error('Error simulando tiempo:', error);
            alertaEl.innerHTML = '<span style="color: var(--rojo);">Error de conexión. Inténtalo de nuevo.</span>';
            btnSimular.disabled = false;
        }
    });
}
