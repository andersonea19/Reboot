/**
 * navbar.js — Componente superior del Dashboard.
 * 
 * Muestra el nombre del usuario, su rol y gestiona el botón de Logout.
 * El logout hace POST a /api/auth/logout, limpia el sessionStore
 * y redirige al login.
 */

import { sessionStore } from '../../store/sessionStore.js';

const URL_BASE = 'http://localhost:8080/RebootBackend/api';

export const navbar = {

    /**
     * Renderiza la información del usuario en la barra superior
     * y asocia el evento de logout al botón correspondiente.
     */
    render() {
        const usuario = sessionStore.getUsuario();

        // Inyectar nombre del usuario
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = usuario.nombre || 'Usuario';
        }

        // Inyectar rol del usuario
        const userRoleEl = document.getElementById('user-role');
        if (userRoleEl) {
            userRoleEl.textContent = sessionStore.getNombreRol();
        }

        // Asociar evento de Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            // Remover listeners previos clonando el nodo
            const nuevoBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(nuevoBtn, logoutBtn);

            nuevoBtn.addEventListener('click', async () => {
                await this._ejecutarLogout();
            });
        }
    },

    /**
     * Ejecuta el proceso de logout:
     * 1. POST /api/auth/logout para destruir la sesión en Tomcat
     * 2. Limpia el sessionStore del cliente
     * 3. Redirige al login
     */
    async _ejecutarLogout() {
        try {
            await fetch(`${URL_BASE}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('[Navbar] Error durante logout:', error);
        } finally {
            // Siempre limpiar y redirigir, incluso si el fetch falla
            sessionStore.limpiar();
            window.location.href = '../auth/login.html';
        }
    }
};
