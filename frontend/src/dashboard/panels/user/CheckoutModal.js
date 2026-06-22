export function abrirCheckoutModal(onExito) {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    
    // Crear el overlay y el modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" style="max-width: 450px; background: var(--blanco); border-radius: 8px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: var(--fuenteTexto);">
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="font-family: var(--fuenteTitulos); font-size: 1.8rem; color: var(--azul); margin: 0;">Suscripción Pro</h3>
                <p style="color: var(--gris-oscuro); font-size: 0.95rem;">Desbloquea rutinas simultáneas.</p>
            </div>
            
            <div style="background: #f8f9fa; border: 1px solid var(--gris-claro); border-radius: 6px; padding: 15px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong>Plan Pro (30 Días)</strong>
                    <span>$99.90 USD</span>
                </div>
                <hr style="border: 0; border-top: 1px solid var(--gris-claro);">
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <strong>Total a pagar</strong>
                    <span style="color: var(--azul); font-weight: bold;">$99.90 USD</span>
                </div>
            </div>

            <div id="checkout-alerta" style="text-align: center; margin-bottom: 15px;"></div>

            <div style="display: flex; gap: 10px;">
                <button type="button" id="btn-cancelar-checkout" style="flex: 1; padding: 12px; border: 1px solid var(--gris-claro); background: transparent; border-radius: 4px; cursor: pointer; color: var(--negro);">Cancelar</button>
                <button type="button" id="btn-pagar-checkout" style="flex: 1; padding: 12px; border: none; background: var(--azul); color: var(--blanco); border-radius: 4px; cursor: pointer; font-weight: bold;">Simular Pago</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnCancelar = overlay.querySelector('#btn-cancelar-checkout');
    const btnPagar = overlay.querySelector('#btn-pagar-checkout');
    const alertaEl = overlay.querySelector('#checkout-alerta');

    // Cerrar modal
    btnCancelar.addEventListener('click', () => overlay.remove());

    // Ejecutar pago
    btnPagar.addEventListener('click', async () => {
        alertaEl.innerHTML = '<span style="color: var(--gris-oscuro);">Procesando pago...</span>';
        btnPagar.disabled = true;

        try {
            const respuesta = await fetch(`${URL_BASE}/checkout`, {
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
                }, 2000);
            } else {
                alertaEl.innerHTML = `<span style="color: var(--rojo);">${json.mensaje}</span>`;
                btnPagar.disabled = false;
            }

        } catch (error) {
            console.error('Error en checkout:', error);
            alertaEl.innerHTML = '<span style="color: var(--rojo);">Error de conexión. Inténtalo de nuevo.</span>';
            btnPagar.disabled = false;
        }
    });
}
