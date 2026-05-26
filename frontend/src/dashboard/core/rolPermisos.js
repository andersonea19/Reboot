/**
 * rolPermisos.js — Configuración centralizada de paneles por rol.
 * 
 * Define qué paneles ve cada rol en el sidebar y su metadata
 * (label visible, icono emoji, categoría de agrupación).
 * 
 * Roles del sistema (tabla Roles en Reboot.txt):
 *   1 = Usuario
 *   2 = Administrador
 */

/** 
 * Definición de todos los paneles disponibles en el sistema.
 * Cada panel tiene: id, label, icono y categoría.
 */
const PANELES = {
    perfil: {
        id: 'perfil',
        label: 'Mi Perfil',
        icono: '',
        categoria: 'general'
    },
    configuracion: {
        id: 'configuracion',
        label: 'Configuración',
        icono: '',
        categoria: 'general'
    }
};

/**
 * Mapeo de paneles permitidos por cada rol.
 * El orden del array determina el orden en el sidebar.
 */
const PANELES_POR_ROL = {
    // Rol 1: Usuario — Solo paneles de perfil personal
    1: ['perfil', 'configuracion'],

    // Rol 2: Administrador — Paneles personales + paneles de administración
    2: ['perfil', 'configuracion']
    // En fases futuras se añadirán: 'admin-usuarios', 'admin-ejercicios', etc.
};

/**
 * Obtiene la lista de paneles permitidos para un rol específico.
 * @param {number} idRol - ID del rol del usuario
 * @returns {Array<Object>} Lista de objetos panel con su metadata
 */
export function obtenerPanelesParaRol(idRol) {
    const idsPaneles = PANELES_POR_ROL[idRol] || PANELES_POR_ROL[1]; // Fallback a usuario
    return idsPaneles
        .map(id => PANELES[id])
        .filter(panel => panel !== undefined); // Filtrar paneles no definidos aún
}

/**
 * Obtiene el ID del panel por defecto para un rol (el primero de la lista).
 * @param {number} idRol 
 * @returns {string}
 */
export function obtenerPanelDefecto(idRol) {
    const paneles = obtenerPanelesParaRol(idRol);
    return paneles.length > 0 ? paneles[0].id : 'perfil';
}
