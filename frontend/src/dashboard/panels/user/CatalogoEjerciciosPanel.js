import { sessionStore } from '../../../store/sessionStore.js';

export async function renderCatalogoEjerciciosPanel(container) {
    const URL_BASE = 'http://localhost:8080/RebootBackend/api';
    
    // El usuario se obtiene del store de sesión (Freemium: idPaquete 1=Basic, 2=Pro)
    const usuario = sessionStore.getUsuario();
    const esPro = usuario.idPaquete === 2;

    let ejercicios = [];
    let gruposMusculares = [];

    container.innerHTML = `
        <style>
            .panel { padding: 2rem; font-family: var(--fuenteTexto); background: var(--blanco); border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .panel__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--negro); padding-bottom: 1rem; flex-wrap: wrap; gap: 15px;}

            .panel__input { font-family: var(--fuenteTexto); font-size: 0.9rem; border: 1px solid var(--gris-oscuro); padding: 0.8rem; border-radius: 8px; outline: none; }
            
            /* Grid de Ejercicios */
            .grid-ejercicios {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            .card-ejercicio {
                background: #fff;
                border: 1px solid var(--gris-claro);
                border-radius: 12px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                transition: transform 0.2s;
            }
            .card-ejercicio:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 15px rgba(0,0,0,0.1);
            }
            .card__titulo { font-family: var(--fuenteSubtitulo); font-size: 1.3rem; color: var(--negro); margin: 0; }
            .card__etiqueta { font-size: 0.8rem; background: var(--gris-claro); padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #555; display: inline-block; }
            .card__desc { font-size: 0.9rem; color: var(--gris-oscuro); line-height: 1.5; flex-grow: 1; }
            

        </style>
        
        <div class="panel" id="vistaCatalogoUser">
            <div class="panel__header">
                <h2 class="panel__titulo">Biblioteca de Ejercicios</h2>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <select id="selectGrupoMuscular" class="panel__input" style="width: 200px;">
                        <option value="">Todos los Músculos</option>
                    </select>
                    <input type="text" id="filtroEjercicioUser" placeholder="Buscar por nombre..." class="panel__input" style="width: 250px;">
                </div>
            </div>

            <!-- Cero fricción: Sin banners promocionales -->
            
            <div id="alerta-catalogo-user"></div>
            
            <div class="grid-ejercicios" id="gridEjercicios">
                <p style="text-align: center; width: 100%; grid-column: 1 / -1; color: var(--gris-oscuro);">Cargando biblioteca...</p>
            </div>
        </div>
    `;

    const selectGrupoMuscular = document.getElementById('selectGrupoMuscular');
    const filtroEjercicioUser = document.getElementById('filtroEjercicioUser');
    const gridEjercicios = document.getElementById('gridEjercicios');

    const cargarFiltros = async () => {
        try {
            const resp = await fetch(`${URL_BASE}/rutinas/catalogos`, { credentials: 'include' });
            if (resp.ok) {
                const json = await resp.json();
                if (json.ok && json.data && json.data.gruposMusculares) {
                    gruposMusculares = json.data.gruposMusculares;
                    gruposMusculares.forEach(gm => {
                        const option = document.createElement('option');
                        option.value = gm.id || gm.idMusculo || gm.idGrupoMuscular;
                        option.textContent = gm.nombre;
                        selectGrupoMuscular.appendChild(option);
                    });
                }
            }
        } catch (e) {
            console.warn("No se pudieron cargar los filtros de grupos musculares");
        }
    };

    const cargarEjercicios = async () => {
        try {
            // El usuario consulta su API específica que bloquea urlsVideo según su rol
            const resp = await fetch(`${URL_BASE}/rutinas/ejercicios/catalogo`, { credentials: 'include' });
            if (resp.ok) {
                const json = await resp.json();
                if (json.ok && json.data) {
                    // Mostrar solo ejercicios activos
                    ejercicios = json.data.filter(e => e.activo !== false); // Asumimos activos por defecto
                    renderEjercicios();
                }
            } else {
                gridEjercicios.innerHTML = `<p style="color: var(--rojo); width: 100%;">Error al cargar ejercicios.</p>`;
            }
        } catch (e) {
            gridEjercicios.innerHTML = `<p style="color: var(--rojo); width: 100%;">Fallo de red al intentar conectar.</p>`;
        }
    };

    const renderEjercicios = () => {
        const txt = filtroEjercicioUser.value.toLowerCase();
        const idGrupo = selectGrupoMuscular.value;

        const filtrados = ejercicios.filter(ej => {
            const matchTxt = ej.nombre.toLowerCase().includes(txt) || (ej.descripcion || '').toLowerCase().includes(txt);
            
            let matchGrupo = true;
            if (idGrupo !== '') {
                const nombreGrupoSel = selectGrupoMuscular.options[selectGrupoMuscular.selectedIndex].text;
                if (ej.categorias) {
                    matchGrupo = ej.categorias.includes(nombreGrupoSel);
                } else {
                    matchGrupo = false;
                }
            }

            return matchTxt && matchGrupo;
        });

        gridEjercicios.innerHTML = '';

        if (filtrados.length === 0) {
            gridEjercicios.innerHTML = `<p style="text-align: center; width: 100%; grid-column: 1 / -1; color: var(--gris-oscuro);">No se encontraron ejercicios con esos filtros.</p>`;
            return;
        }

        filtrados.forEach(ej => {
            const card = document.createElement('div');
            card.className = 'card-ejercicio';
            
            // Lista de grupos musculares como texto (ya viene en ej.categorias)
            const gruposTxt = ej.categorias || 'General';

            card.innerHTML = `
                <h3 class="card__titulo">${ej.nombre}</h3>
                <div><span class="card__etiqueta">${gruposTxt}</span></div>
                <p class="card__desc">${ej.descripcion || 'Sin descripción detallada.'}</p>
            `;
            gridEjercicios.appendChild(card);
        });
    };

    selectGrupoMuscular.addEventListener('change', renderEjercicios);
    filtroEjercicioUser.addEventListener('input', renderEjercicios);

    await cargarFiltros();
    await cargarEjercicios();
}
