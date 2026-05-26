document.addEventListener('DOMContentLoaded', async () => {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    const FETCH_CONFIG = { method: 'GET', credentials: 'include' };

    // 1. GUARD: Verificar si ya tiene perfil 
    try {
        const resExiste = await fetch(`${URL_BASE}/perfil/existe`, FETCH_CONFIG);
        if (resExiste.status === 401) {
            window.location.href = '../auth/login.html';
            return;
        }
        const dataExiste = await resExiste.json();
        // Si ya completó el onboarding, redirigir al dashboard
        if (dataExiste.ok && dataExiste.data === true) {
            window.location.href = '../dashboard/dashboard.html';
            return;
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

    // 3. LÓGICA MULTI-PASO (SPA)
    let pasoActual = 1;
    const totalPasos = 4;
    
    // Objeto base DTO exacto
    const dtoPerfil = { peso: null, estatura: null, idObjetivo: null, idNivel: null, limitaciones: [] };

    const btnSiguiente = document.getElementById('btn-siguiente');
    const btnAtras = document.getElementById('btn-atras');
    const btnGuardar = document.getElementById('btn-guardar');
    const formulario = document.getElementById('form-onboarding');

    btnSiguiente.addEventListener('click', () => {
        // window.validarPasoActual se encarga internamente de los parseFloat/parseInt y de popular dtoPerfil
        if (window.validarPasoActual(pasoActual, dtoPerfil)) {
            document.getElementById(`paso-${pasoActual}`).style.display = 'none';
            pasoActual++;
            actualizarVista();
        }
    });

    btnAtras.addEventListener('click', () => {
        document.getElementById(`paso-${pasoActual}`).style.display = 'none';
        pasoActual--;
        actualizarVista();
    });

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Recolectar limpiamente el arreglo de enteros desde los checkboxes
        const checkboxes = document.querySelectorAll('#contenedor-limitaciones input[type="checkbox"]:checked');
        dtoPerfil.limitaciones = Array.from(checkboxes).map(cb => parseInt(cb.value));

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
                window.location.href = '../dashboard/dashboard.html';
            } else {
                alert("Error: " + data.mensaje);
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
