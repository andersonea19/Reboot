/**
 * dashboardRouter.js — Enrutador interno del Dashboard SPA.
 * 
 * Gestiona la navegación entre paneles sin alterar la URL del navegador.
 * Cada panel se registra con un ID y una función render(container).
 * Al navegar, limpia el contenedor principal e invoca el render del panel.
 */

export const dashboardRouter = {

    /** @type {Map<string, Function>} Registro de paneles: id → renderFn */
    _paneles: new Map(),

    /** @type {string|null} ID del panel actualmente renderizado */
    _panelActual: null,

    /**
     * Registra un panel en el router.
     * @param {string} id - Identificador único del panel (ej: 'perfil')
     * @param {Function} renderFn - Función async que recibe el container DOM
     */
    registrarPanel(id, renderFn) {
        this._paneles.set(id, renderFn);
    },

    /**
     * Navega a un panel específico:
     * 1. Limpia el contenedor principal (#dashboard-view)
     * 2. Actualiza la clase activa en el sidebar
     * 3. Ejecuta la función render del panel destino
     * 
     * @param {string} panelId - ID del panel al que navegar
     */
    async navegar(panelId) {
        const renderFn = this._paneles.get(panelId);
        if (!renderFn) {
            console.error(`[Router] Panel no registrado: ${panelId}`);
            return;
        }

        // Evitar re-renderizar el mismo panel
        if (this._panelActual === panelId) return;

        const container = document.getElementById('dashboard-view');
        if (!container) {
            console.error('[Router] Contenedor #dashboard-view no encontrado');
            return;
        }

        // 1. Limpiar el contenedor
        container.innerHTML = '';

        // 2. Actualizar estado activo en el sidebar
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.classList.remove('sidebar__link--active');
        });
        const linkActivo = document.querySelector(`[data-panel="${panelId}"]`);
        if (linkActivo) {
            linkActivo.classList.add('sidebar__link--active');
        }

        // 3. Ejecutar render del panel destino
        this._panelActual = panelId;
        


        try {
            await renderFn(container);
        } catch (error) {
            console.error(`[Router] Error renderizando panel "${panelId}":`, error);
            container.innerHTML = `
                <section class="panel panel--error">
                    <h2 class="panel__titulo">Error</h2>
                    <p>No se pudo cargar este panel. Intenta de nuevo.</p>
                </section>
            `;
        }
    },

    /**
     * Retorna el ID del panel actualmente visible.
     * @returns {string|null}
     */
    getPanelActual() {
        return this._panelActual;
    }
};
