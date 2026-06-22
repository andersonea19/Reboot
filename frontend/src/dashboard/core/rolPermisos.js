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
        icono: '👤',
        categoria: 'general'
    },
    configuracion: {
        id: 'configuracion',
        label: 'Configuración',
        icono: '⚙️',
        categoria: 'general'
    },
    'rutina-activa': {
        id: 'rutina-activa',
        label: 'Mi Rutina', // Base, se cambiará dinámicamente a "Mis Rutinas" en Pro
        icono: '🏋️',
        categoria: 'usuario'
    },
    'generar-rutina': {
        id: 'generar-rutina',
        label: 'Generar Rutina',
        icono: '⚡',
        categoria: 'usuario'
    },
    'catalogo-ejercicios': {
        id: 'catalogo-ejercicios',
        label: 'Catálogo de Ejercicios',
        icono: '📖',
        categoria: 'usuario'
    },
    'historial-rutinas': {
        id: 'historial-rutinas',
        label: 'Historial',
        icono: '📈',
        categoria: 'usuario'
    },
    monitoreo: {
        id: 'monitoreo',
        label: 'Monitoreo Global',
        icono: '',
        categoria: 'admin'
    },
    ejercicios: {
        id: 'ejercicios',
        label: 'Gestión de Ejercicios',
        icono: '',
        categoria: 'admin'
    },
    usuarios: {
        id: 'usuarios',
        label: 'Gestión de Usuarios',
        icono: '',
        categoria: 'admin'
    },
    catalogos: {
        id: 'catalogos',
        label: 'Gestión de Catálogos',
        icono: '',
        categoria: 'admin'
    }
};

/**
 * Mapeo de paneles permitidos por cada rol.
 * El orden del array determina el orden en el sidebar.
 */

// Paneles para Usuario (Rol 1) dependiendo de su paquete
const PANELES_USUARIO_POR_PAQUETE = {
    // Ambos paquetes tienen la misma base de botones; la lógica interna define las vistas y restricciones
    1: ['perfil', 'generar-rutina', 'rutina-activa', 'historial-rutinas', 'catalogo-ejercicios', 'configuracion'],
    2: ['perfil', 'generar-rutina', 'rutina-activa', 'historial-rutinas', 'catalogo-ejercicios', 'configuracion']
};

// Paneles para Administrador (Rol 2) ordenados por prioridad
const PANELES_ADMIN = [
    'monitoreo',       // 1. Monitoreo Global
    'usuarios',        // 2. Gestión de Usuarios
    'catalogos',       // 3. Gestión de Catálogos
    'ejercicios',      // 4. Gestión de Ejercicios
    'configuracion'
];

/**
 * Obtiene la lista de paneles permitidos para un rol específico y su paquete.
 * @param {number} idRol - ID del rol del usuario
 * @param {number} [idPaquete] - ID del paquete del usuario (para rol 1)
 * @returns {Array<Object>} Lista de objetos panel con su metadata
 */
export function obtenerPanelesParaRol(idRol, idPaquete = 1) {
    let idsPaneles = [];
    
    if (idRol === 2) {
        idsPaneles = PANELES_ADMIN;
    } else {
        // Fallback a paquete 1 si no se encuentra
        idsPaneles = PANELES_USUARIO_POR_PAQUETE[idPaquete] || PANELES_USUARIO_POR_PAQUETE[1];
    }
    
    return idsPaneles
        .map(id => PANELES[id])
        .filter(panel => panel !== undefined); // Filtrar paneles no definidos aún
}

/**
 * Obtiene el ID del panel por defecto para un rol y paquete (el primero de la lista).
 * @param {number} idRol 
 * @param {number} [idPaquete]
 * @returns {string}
 */
export function obtenerPanelDefecto(idRol, idPaquete = 1) {
    const paneles = obtenerPanelesParaRol(idRol, idPaquete);
    return paneles.length > 0 ? paneles[0].id : 'perfil';
}
