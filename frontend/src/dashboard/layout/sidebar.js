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
        const paneles = obtenerPanelesParaRol(usuario.idRol, usuario.idPaquete);

        // Limpiar navegación existente
        navContainer.innerHTML = '';

        // Generar un botón por cada panel permitido
        paneles.forEach(panel => {
            const item = document.createElement('div');
            item.classList.add('sidebar__item');

            // --- Lógica Condicional Eliminada: Cero Upsells (Regla Estricta) ---
            // Se elimina la inyección de botones de "Suscripción" o "Upgrade a Pro"


            const boton = document.createElement('button');
            boton.classList.add('sidebar__link');
            boton.setAttribute('data-panel', panel.id);
            boton.setAttribute('type', 'button');

            // --- Lógica Dinámica de Textos e Iconos según Paquete ---
            if (usuario.idRol === 1) {
                // Quitar los iconos completamente para el panel del usuario
                if (panel.id === 'rutina-activa') {
                    if (usuario.idPaquete === 1) {
                        boton.innerHTML = `Mi Rutina`;
                    } else {
                        boton.innerHTML = `Mis Rutinas`;
                    }
                } else if (panel.id === 'catalogo-ejercicios' && usuario.idPaquete === 1) {
                    boton.innerHTML = `${panel.label}`;
                } else {
                    boton.textContent = `${panel.label}`;
                }
            } else {
                boton.textContent = `${panel.label}`;
            }

            // Evento de navegación SPA
            boton.addEventListener('click', () => {
                dashboardRouter.navegar(panel.id);
            });

            item.appendChild(boton);
            navContainer.appendChild(item);
        });
    }
};


