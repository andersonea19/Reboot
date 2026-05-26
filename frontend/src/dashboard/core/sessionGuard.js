/**
 * sessionGuard.js — Módulo de protección de sesión para el Dashboard SPA.
 * 
 * Al cargar el dashboard, dispara una petición asíncrona a GET /api/usuarios/me.
 * Si el backend responde 401, limpia el store y redirige al login.
 * Si responde 200, almacena los datos del usuario en sessionStore.
 */

import { sessionStore } from '../../store/sessionStore.js';

const URL_BASE = 'http://localhost:8080/RebootBackend/api';

export const sessionGuard = {

    /**
     * Inicializa la validación de sesión del Dashboard.
     * @returns {Promise<boolean>} true si la sesión es válida, false si redirigió al login
     */
    async init() {
        try {
            const respuesta = await fetch(`${URL_BASE}/usuarios/me`, {
                method: 'GET',
                credentials: 'include' // Fundamental para enviar JSESSIONID
            });

            // Si el backend responde 401 → sesión inválida o expirada
            if (respuesta.status === 401) {
                sessionStore.limpiar();
                window.location.href = '../auth/login.html';
                return false;
            }

            // Si no es 200 OK tampoco es válido
            if (!respuesta.ok) {
                sessionStore.limpiar();
                window.location.href = '../auth/login.html';
                return false;
            }

            const data = await respuesta.json();

            // Validar que la respuesta tenga la estructura esperada
            if (!data.ok || !data.data) {
                sessionStore.limpiar();
                window.location.href = '../auth/login.html';
                return false;
            }

            // Almacenar datos del usuario en el store global
            sessionStore.setUsuario(data.data);
            return true;

        } catch (error) {
            console.error('[SessionGuard] Error validando sesión:', error);
            sessionStore.limpiar();
            window.location.href = '../auth/login.html';
            return false;
        }
    }
};
