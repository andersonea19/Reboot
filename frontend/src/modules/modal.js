/**
 * modal.js — Sistema de Modales del Dashboard Reboot.
 *
 * Componente Vanilla JS puro que reemplaza los window.alert() nativos.
 * Diseñado con las variables CSS del :root del proyecto.
 * Sin íconos, sin librerías externas, sin colores hardcodeados.
 *
 * API pública:
 *   modal.info(mensaje)             — Modal informativo / éxito
 *   modal.error(mensaje)            — Modal de error
 *   modal.confirmar(mensaje)        — Modal de confirmación → Promise<boolean>
 */

const MODAL_CSS = `
.rb-modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.55);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.2s ease;
}
.rb-modal-overlay.rb-modal--visible {
    opacity: 1;
}
.rb-modal {
    background-color: var(--blanco);
    color: var(--negro);
    border: 2px solid var(--negro);
    border-radius: 8px;
    padding: 2rem 2.5rem;
    max-width: 440px;
    width: 90%;
    font-family: var(--fuenteTexto);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    transform: translateY(-12px);
    transition: transform 0.2s ease;
}
.rb-modal-overlay.rb-modal--visible .rb-modal {
    transform: translateY(0);
}
.rb-modal__tipo {
    font-family: var(--fuenteTitulos);
    font-size: 1.2rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--negro);
    margin: 0;
    text-align: center;
}
.rb-modal__mensaje {
    font-family: var(--fuenteTexto);
    font-size: 0.85rem;
    color: var(--negro);
    line-height: 1.6;
    margin: 0;
    text-align: center;
}
.rb-modal__mensaje--error {
    color: var(--rojo);
}
.rb-modal__divider {
    border: none;
    border-top: 1px solid var(--gris-claro);
    margin: 0;
}
.rb-modal__acciones {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 0.6rem;
}
.rb-modal__btn {
    font-family: var(--fuenteBotones);
    font-size: 0.6rem;
    font-weight: bold;
    padding: 0.55rem 1.4rem;
    border: 2px solid transparent;
    border-radius: 15px;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.rb-modal__btn--primario {
    background-color: var(--negro);
    color: var(--blanco);
}
.rb-modal__btn--primario:hover {
    background-color: var(--blanco);
    color: var(--negro);
    border-color: var(--negro);
}
.rb-modal__btn--secundario {
    background-color: var(--gris-oscuro);
    color: var(--blanco);
}
.rb-modal__btn--secundario:hover {
    background-color: var(--blanco);
    color: var(--gris-oscuro);
    border-color: var(--gris-oscuro);
}


`;

function _inyectarEstilos() {
    if (document.getElementById('rb-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'rb-modal-styles';
    style.textContent = MODAL_CSS;
    document.head.appendChild(style);
}

function _crearOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'rb-modal-overlay';
    document.body.appendChild(overlay);
    // Forzar reflow para que la animación de entrada funcione
    void overlay.offsetWidth;
    overlay.classList.add('rb-modal--visible');
    return overlay;
}

function _cerrar(overlay) {
    overlay.classList.remove('rb-modal--visible');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}

/**
 * Muestra un modal informativo simple (un solo botón: Aceptar).
 * @param {string} mensaje
 * @param {'info'|'error'} tipo
 * @param {string} [tituloPersonalizado]
 * @returns {Promise<void>}
 */
function _mostrarSimple(mensaje, tipo, tituloPersonalizado) {
    return new Promise((resolve) => {
        _inyectarEstilos();
        const overlay = _crearOverlay();
        const etiqueta = tituloPersonalizado || (tipo === 'error' ? 'Error' : 'Aviso');
        const clsMensaje = tipo === 'error' ? 'rb-modal__mensaje rb-modal__mensaje--error' : 'rb-modal__mensaje';

        overlay.innerHTML = `
            <div class="rb-modal" role="dialog" aria-modal="true">
                <p class="rb-modal__tipo">${etiqueta}</p>
                <p class="${clsMensaje}">${mensaje}</p>
                <hr class="rb-modal__divider">
                <div class="rb-modal__acciones">
                    <button class="rb-modal__btn rb-modal__btn--primario" id="rb-btn-aceptar">Aceptar</button>
                </div>
            </div>
        `;

        overlay.querySelector('#rb-btn-aceptar').addEventListener('click', () => {
            _cerrar(overlay);
            resolve();
        });
    });
}

/**
 * Muestra un modal de confirmación con dos botones.
 * @param {string} mensaje
 * @returns {Promise<boolean>} — true si el usuario confirma, false si cancela
 */
function confirmar(mensaje) {
    return new Promise((resolve) => {
        _inyectarEstilos();
        const overlay = _crearOverlay();

        overlay.innerHTML = `
            <div class="rb-modal" role="dialog" aria-modal="true">
                <p class="rb-modal__tipo">Confirmación</p>
                <p class="rb-modal__mensaje">${mensaje}</p>
                <hr class="rb-modal__divider">
                <div class="rb-modal__acciones">
                    <button class="rb-modal__btn rb-modal__btn--secundario" id="rb-btn-cancelar">Cancelar</button>
                    <button class="rb-modal__btn rb-modal__btn--primario" id="rb-btn-confirmar">Confirmar</button>
                </div>
            </div>
        `;

        overlay.querySelector('#rb-btn-confirmar').addEventListener('click', () => {
            _cerrar(overlay);
            resolve(true);
        });
        overlay.querySelector('#rb-btn-cancelar').addEventListener('click', () => {
            _cerrar(overlay);
            resolve(false);
        });
    });
}


export const modal = {
    /**
     * Modal informativo / aviso.
     * @param {string} mensaje
     * @param {string} [titulo]
     */
    info: (mensaje, titulo) => _mostrarSimple(mensaje, 'info', titulo),

    /**
     * Modal de error.
     * @param {string} mensaje
     */
    error: (mensaje) => _mostrarSimple(mensaje, 'error'),

    /**
     * Modal de confirmación.
     * @param {string} mensaje
     * @returns {Promise<boolean>}
     */
    confirmar,

};
