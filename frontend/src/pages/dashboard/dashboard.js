/**
 * dashboard.js — Entry Point del Dashboard SPA de REBOOT.
 * 
 * Orquesta la secuencia de inicialización completa:
 * 1. SessionGuard → Valida sesión contra el backend
 * 2. Navbar → Renderiza nombre/rol del usuario y botón logout
 * 3. Sidebar → Renderiza menú de navegación según el rol
 * 4. Router → Registra paneles y navega al panel por defecto
 */

import { sessionGuard } from '../../dashboard/core/sessionGuard.js';
import { dashboardRouter } from '../../dashboard/core/dashboardRouter.js';
import { obtenerPanelDefecto } from '../../dashboard/core/rolPermisos.js';
import { navbar } from '../../dashboard/layout/navbar.js';
import { sidebar } from '../../dashboard/layout/sidebar.js';
import { sessionStore } from '../../store/sessionStore.js';

// --- Importar funciones render de los paneles ---
import { renderPerfilPanel } from '../../dashboard/panels/shared/perfilPanel.js';
import { renderConfiguracionPanel } from '../../dashboard/panels/shared/configuracionPanel.js';

/**
 * Secuencia de arranque del Dashboard SPA.
 * Se ejecuta al cargar el DOM completo.
 */
document.addEventListener('DOMContentLoaded', async () => {

    // ============================================================
    // PASO 1: Validar sesión contra el backend
    // ============================================================
    const sesionValida = await sessionGuard.init();
    if (!sesionValida) {
        return; // sessionGuard ya redirigió al login
    }

    // ============================================================
    // PASO 2: Renderizar componentes de layout
    // ============================================================
    navbar.render();
    sidebar.render();

    // ============================================================
    // PASO 3: Registrar paneles en el router
    // ============================================================
    dashboardRouter.registrarPanel('perfil', renderPerfilPanel);
    dashboardRouter.registrarPanel('configuracion', renderConfiguracionPanel);

    // ============================================================
    // PASO 4: Navegar al panel por defecto según el rol
    // ============================================================
    const usuario = sessionStore.getUsuario();
    const panelDefecto = obtenerPanelDefecto(usuario.idRol);
    dashboardRouter.navegar(panelDefecto);
});
