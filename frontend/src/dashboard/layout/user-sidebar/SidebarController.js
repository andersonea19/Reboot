/**
 * SidebarController.js
 * Controlador del Sidebar para la aplicación REBOOT.
 * 
 * Gestiona el menú lateral dinámico según el modelo Freemium:
 * - idPaquete = 1 (Básico)
 * - idPaquete = 2 (Pro)
 */

export class SidebarController {
    /**
     * @param {number} idPaquete - El ID del paquete del usuario actual (1 = Básico, 2 = Pro).
     * @param {string} sidebarContainerId - El ID del elemento contenedor del sidebar.
     */
    constructor(idPaquete = 1, sidebarContainerId = 'user-sidebar') {
        this.idPaquete = idPaquete;
        this.sidebarEl = document.getElementById(sidebarContainerId);
        
        if (!this.sidebarEl) {
            console.error(`[SidebarController] No se encontró el contenedor con ID: ${sidebarContainerId}`);
            return;
        }

        // Obtener todos los botones del sidebar
        this.buttons = Array.from(this.sidebarEl.querySelectorAll('.sidebar__btn'));
        
        this.init();
    }

    /**
     * Inicializa la lógica del sidebar.
     */
    init() {
        this.aplicarRestriccionesPorPaquete();
        this.asignarEventos();
        
        // Simular clic en el primer botón por defecto (Mi Perfil)
        if (this.buttons.length > 0) {
            const btnPerfil = this.buttons.find(b => b.dataset.target === 'perfil');
            if (btnPerfil) this.manejarClick(null, btnPerfil);
        }
    }

    /**
     * Aplica la lógica estricta de visualización y textos dinámicos
     * basándose en el idPaquete.
     */
    aplicarRestriccionesPorPaquete() {
        const textRutinas = document.getElementById('text-rutinas');
        const btnUpgrade = document.getElementById('btn-upgrade');

        if (this.idPaquete === 1) {
            // REGLAS BÁSICO
            if (textRutinas) textRutinas.textContent = 'Mi Rutina';
            if (btnUpgrade) btnUpgrade.style.display = 'flex'; // Mostrar opción de Suscripción (Upgrade)
        } else if (this.idPaquete === 2) {
            // REGLAS PRO
            if (textRutinas) textRutinas.textContent = 'Mis Rutinas';
            if (btnUpgrade) btnUpgrade.style.display = 'none'; // Ocultar opción de Suscripción
        }
    }

    /**
     * Asigna los manejadores de eventos a todos los botones.
     */
    asignarEventos() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => this.manejarClick(e, btn));
        });
    }

    /**
     * Maneja el clic en un botón, cambia su estado visual y delega 
     * el renderizado al router SPA (simulado aquí).
     * 
     * @param {Event} e - Evento del clic
     * @param {HTMLElement} btn - Botón clickeado
     */
    manejarClick(e, btn) {
        if (e) e.preventDefault();

        // Limpiar el estado activo de todos los botones
        this.buttons.forEach(b => b.classList.remove('sidebar__btn--active'));
        
        // Asignar el estado activo al botón actual (Color primario definido en CSS)
        btn.classList.add('sidebar__btn--active');

        // Extraer el target (módulo a renderizar)
        const target = btn.dataset.target;
        
        // Ejecutar router SPA
        this.renderizarVista(target);
    }

    /**
     * Simula el router de la Single Page Application y aplica/imprime
     * las restricciones según el paquete al cargar cada vista.
     * 
     * @param {string} target - Identificador de la vista/módulo
     */
    renderizarVista(target) {
        console.log(`\n======================================================`);
        console.log(`[SPA Router] Renderizando vista: "${target.toUpperCase()}"`);
        
        switch (target) {
            case 'perfil':
                if (this.idPaquete === 1) {
                    console.log(' -> [BÁSICO] Renderizando datos físicos.');
                    console.log(' -> [BÁSICO] Renderizando "Objetivo Único" (Inmutable).');
                } else {
                    console.log(' -> [PRO] Renderizando datos físicos.');
                    console.log(' -> [PRO] Modo libre elección de objetivo habilitado (Asociado a instructor predefinido).');
                }
                break;

            case 'generar-rutina':
                if (this.idPaquete === 1) {
                    console.log(' -> [BÁSICO] Renderizando flujo simple de creación.');
                    console.log(' -> [BÁSICO] Restricción activa: Máximo 3 grupos musculares.');
                } else {
                    console.log(' -> [PRO] Renderizando "Tarjetas de Instructores Virtuales" temáticos.');
                }
                break;

            case 'mis-rutinas':
                if (this.idPaquete === 1) {
                    console.log(' -> [BÁSICO] Accediendo a la única rutina activa.');
                } else {
                    console.log(' -> [PRO] Renderizando sistema de Tabs con múltiples rutinas.');
                }
                break;

            case 'historial':
                console.log(' -> [COMÚN] Renderizando pestañas internas:');
                console.log('    1. Historial Físico.');
                console.log('    2. Historial de Rutinas.');
                break;

            case 'catalogo-ejercicios':
                console.log(' -> [COMÚN] Renderizando Diccionario Anatómico de Ejercicios.');
                break;

            case 'suscripcion':
                console.log(' -> [BÁSICO ONLY] Renderizando vista discreta de Upgrade a paquete Pro.');
                break;

            case 'configuracion':
                console.log(' -> [COMÚN] Opciones de Configuración y Seguridad (Cambio de contraseña).');
                break;

            case 'logout':
                console.log(' -> [COMÚN] Ejecutando cierre de sesión. Limpiando LocalStorage/Session...');
                // Aquí iría el cierre de sesión real
                break;

            default:
                console.warn(` -> [ATENCIÓN] Vista no mapeada: ${target}`);
        }
        console.log(`======================================================`);
    }
}

// Ejemplo de inicialización (descomentar al integrar):
// import { SidebarController } from './SidebarController.js';
// document.addEventListener('DOMContentLoaded', () => {
//    // Simulación: obtener idPaquete de sesión/localStorage
//    const userSession = JSON.parse(localStorage.getItem('usuario')) || { idPaquete: 1 };
//    const sidebarCtrl = new SidebarController(userSession.idPaquete);
// });
