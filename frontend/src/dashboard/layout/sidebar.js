/**
 * sidebar.js — Generador dinámico del menú lateral del Dashboard.
 * 
 * Lee el idRol del usuario desde sessionStore, consulta rolPermisos
 * para saber qué paneles le corresponden, y genera los botones
 * de navegación dentro de #sidebar-nav.
 */

import { sessionStore } from '../../store/sessionStore.js';
import { obtenerPanelesParaRol } from '../core/rolPermisos.js';
import { dashboardRouter } from '../core/dashboardRouter.js';

export const sidebar = {

    /**
     * Renderiza los ítems de navegación del sidebar según el rol del usuario.
     * Cada botón dispara dashboardRouter.navegar(panelId) al hacer click.
     */
    render() {
        const navContainer = document.getElementById('sidebar-nav');
        if (!navContainer) {
            console.error('[Sidebar] Contenedor #sidebar-nav no encontrado');
            return;
        }

        const usuario = sessionStore.getUsuario();
        const paneles = obtenerPanelesParaRol(usuario.idRol);

        // Limpiar navegación existente
        navContainer.innerHTML = '';

        // Generar un botón por cada panel permitido
        paneles.forEach(panel => {
            const item = document.createElement('div');
            item.classList.add('sidebar__item');

            const boton = document.createElement('button');
            boton.classList.add('sidebar__link');
            boton.setAttribute('data-panel', panel.id);
            boton.setAttribute('type', 'button');
            boton.textContent = `${panel.icono}  ${panel.label}`;

            // Evento de navegación SPA
            boton.addEventListener('click', () => {
                dashboardRouter.navegar(panel.id);
            });

            item.appendChild(boton);
            navContainer.appendChild(item);
        });
    }
};
