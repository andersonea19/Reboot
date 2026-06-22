import { modal } from '../../modules/modal.js';

document.addEventListener('DOMContentLoaded', async () => {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    const FETCH_CONFIG = { method: 'GET', credentials: 'include' };

    // 1. GUARD: Verificar si ya tiene perfil 
    let isPro = localStorage.getItem('registroPro') === 'true';

    try {
        const resExiste = await fetch(`${URL_BASE}/perfil/existe`, FETCH_CONFIG);
        if (resExiste.status === 401) {
            window.location.href = '../auth/login.html';
            return;
        }
        const dataExiste = await resExiste.json();
        // Si ya completó el onboarding, redirigir al dashboard
        if (dataExiste.ok && dataExiste.data.existe === true) {
            window.location.href = '../dashboard/dashboard.html';
            return;
        }
        // Determinar si es Pro desde el backend (fuente de verdad)
        if (dataExiste.ok && dataExiste.data.idPaquete === 2) {
            isPro = true;
        }
    } catch (error) {
        console.error("Error validando sesión:", error);
    }

    // 2. CONFIGURAR COMPORTAMIENTO DE SELECCIÓN DINÁMICA
    document.querySelectorAll('#contenedor-objetivos .boton-seleccion').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#contenedor-objetivos .boton-seleccion').forEach(b => b.classList.remove('seleccionado'));
            btn.classList.add('seleccionado');
        });
    });

    document.querySelectorAll('#contenedor-niveles .boton-seleccion').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#contenedor-niveles .boton-seleccion').forEach(b => b.classList.remove('seleccionado'));
            btn.classList.add('seleccionado');
        });
    });



    // Selección de limitaciones (múltiple)
    document.querySelectorAll('#contenedor-limitaciones .boton-limitacion').forEach(btn => {
        btn.addEventListener('click', async () => {
            const isSelected = btn.classList.contains('seleccionado');
            if (!isSelected) {
                const seleccionadas = document.querySelectorAll('#contenedor-limitaciones .boton-limitacion.seleccionado');
                if (seleccionadas.length >= 3) {
                    await modal.error('Por tu seguridad, solo puedes seleccionar un máximo de 3 limitaciones físicas. Si presentas más condiciones, te sugerimos consultar con un especialista.');
                    return;
                }
            }
            btn.classList.toggle('seleccionado');
        });
    });

    // 3. LÓGICA MULTI-PASO (SPA)
    let pasoActual = 1;
    const totalPasos = 4;
    
    // Objeto DTO actualizado: idsLimitaciones (array)
    const dtoPerfil = { peso: null, estatura: null, idObjetivo: null, idNivel: null, idsLimitaciones: [] };

    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnAtras = document.getElementById('btn-atras');
    const btnGuardar = document.getElementById('btn-guardar');
    const formulario = document.getElementById('form-onboarding');

    btnSiguiente.addEventListener('click', () => {
        // window.validarPasoActual se encarga internamente de los parseFloat/parseInt y de popular dtoPerfil
        if (window.validarPasoActual(pasoActual, dtoPerfil)) {
            document.getElementById(`paso-${pasoActual}`).style.display = 'none';
            if (isPro && pasoActual === 1) {
                pasoActual = 3; // Pro salta el paso de Objetivo
            } else {
                pasoActual++;
            }
            actualizarVista();
        }
    });

    btnAtras.addEventListener('click', () => {
        document.getElementById(`paso-${pasoActual}`).style.display = 'none';
        if (isPro && pasoActual === 3) {
            pasoActual = 1; // Pro regresa directamente al paso 1
        } else {
            pasoActual--;
        }
        actualizarVista();
    });

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Recoger las limitaciones (múltiples opcionales)
        const seleccionadas = document.querySelectorAll('#contenedor-limitaciones .boton-limitacion.seleccionado');
        dtoPerfil.idsLimitaciones = Array.from(seleccionadas).map(btn => parseInt(btn.dataset.id));

        // El tipo de rutina se selecciona al generar la rutina.

        try {
            const respuesta = await fetch(`${URL_BASE}/perfil/onboarding`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Vital para que fluya JSESSIONID
                body: JSON.stringify(dtoPerfil)
            });

            const data = await respuesta.json();
            
            // Redirección limpia tras éxito de persistencia
            if (data.ok) {
                localStorage.removeItem('registroPro');
                window.location.href = '../dashboard/dashboard.html';
            } else {
                await modal.error("Error: " + data.mensaje);
            }
        } catch (error) {
            console.error("Error enviando onboarding:", error);
        }
    });

    function actualizarVista() {
        document.getElementById(`paso-${pasoActual}`).style.display = 'block';
        btnAtras.style.display = pasoActual > 1 ? 'inline-block' : 'none';
        
        if (pasoActual === totalPasos) {
            btnSiguiente.style.display = 'none';
            btnGuardar.style.display = 'inline-block';
        } else {
            btnSiguiente.style.display = 'inline-block';
            btnGuardar.style.display = 'none';
        }
    }
});
