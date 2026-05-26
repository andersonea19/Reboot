/**
 * sessionStore.js — Módulo Singleton que gestiona el estado de la sesión
 * del usuario autenticado en memoria del lado del cliente.
 * 
 * Los datos que almacena provienen de GET /api/usuarios/me y son:
 * { usuarioId, idRol, nombre }
 * 
 * Uso: import { sessionStore } from '../../store/sessionStore.js';
 */

const _state = {
    usuarioId: null,
    idRol: null,
    nombre: null
};

export const sessionStore = {

    /**
     * Almacena los datos del usuario recuperados del backend.
     * @param {Object} data - { usuarioId, idRol, nombre }
     */
    setUsuario(data) {
        _state.usuarioId = data.usuarioId || null;
        _state.idRol = data.idRol || null;
        _state.nombre = data.nombre || null;
    },

    /**
     * Retorna una copia inmutable de los datos del usuario.
     * @returns {{ usuarioId: number|null, idRol: number|null, nombre: string|null }}
     */
    getUsuario() {
        return { ..._state };
    },

    /**
     * Retorna el nombre legible del rol basado en el idRol.
     * @returns {string}
     */
    getNombreRol() {
        switch (_state.idRol) {
            case 1: return 'Usuario';
            case 2: return 'Administrador';
            default: return 'Desconocido';
        }
    },

    /**
     * Limpia completamente el estado de sesión en memoria.
     * Debe invocarse al cerrar sesión (logout).
     */
    limpiar() {
        _state.usuarioId = null;
        _state.idRol = null;
        _state.nombre = null;
    }
};
