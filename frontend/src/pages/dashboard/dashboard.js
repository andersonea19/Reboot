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
    
    // Importación y registro dinámico para evitar bloqueos si los archivos están en blanco (0 bytes)
    try {
        const module = await import('../../dashboard/panels/admin/monitoreo/MonitoreoPanel.js');
        dashboardRouter.registrarPanel('monitoreo', module.renderMonitoreoPanel);
    } catch (e) {
        console.warn("No se pudo cargar MonitoreoPanel.js:", e);
    }
    
    try {
        const module = await import('../../dashboard/panels/admin/catalogos/index.js');
        dashboardRouter.registrarPanel('catalogos', module.renderCatalogosPanel);
    } catch (e) {
        console.warn("No se pudo cargar CatalogosPanel.js:", e);
    }
    
    try {
        const module = await import('../../dashboard/panels/admin/ejercicios/index.js');
        dashboardRouter.registrarPanel('ejercicios', module.renderEjerciciosPanel);
    } catch (e) {
        console.warn("No se pudo cargar EjerciciosPanel.js:", e);
    }
    
    try {
        const module = await import('../../dashboard/panels/admin/usuarios/index.js');
        dashboardRouter.registrarPanel('usuarios', module.renderUsuariosPanel);
    } catch (e) {
        console.warn("No se pudo cargar UsuariosPanel.js:", e);
    }


    // Módulos de Usuario
    try {
        const moduleUser = await import('../../dashboard/panels/user/generarRutinaPanel.js');
        dashboardRouter.registrarPanel('generar-rutina', moduleUser.renderGenerarRutinaPanel);
    } catch (e) {
        console.warn("No se pudo cargar generarRutinaPanel.js:", e);
    }
    
    try {
        const moduleUser = await import('../../dashboard/panels/user/rutinaActivaPanel.js');
        dashboardRouter.registrarPanel('rutina-activa', moduleUser.renderRutinaActivaPanel);
    } catch (e) {
        console.warn("No se pudo cargar rutinaActivaPanel.js:", e);
    }

    try {
        const moduleUser = await import('../../dashboard/panels/user/CatalogoEjerciciosPanel.js');
        dashboardRouter.registrarPanel('catalogo-ejercicios', moduleUser.renderCatalogoEjerciciosPanel);
    } catch (e) {
        console.warn("No se pudo cargar CatalogoEjerciciosPanel.js:", e);
    }

    try {
        const moduleUser = await import('../../dashboard/panels/user/HistorialRutinasPanel.js');
        dashboardRouter.registrarPanel('historial-rutinas', moduleUser.renderHistorialRutinasPanel);
    } catch (e) {
        console.warn("No se pudo cargar HistorialRutinasPanel.js:", e);
    }

    // ============================================================
    // PASO 4: Navegar al panel por defecto según el rol
    // ============================================================
    const usuario = sessionStore.getUsuario();
    const panelDefecto = obtenerPanelDefecto(usuario.idRol, usuario.idPaquete);
    dashboardRouter.navegar(panelDefecto);
});
