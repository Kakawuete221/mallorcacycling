// --- CARGA DE DATOS ---
const getPuertos = async () => {
    try {
        const response = await fetch('data/puertos.json');
        return await response.json();
    } catch (error) {
        console.error("Error al cargar los puertos:", error);
        return [];
    }
};

// --- LÓGICA DEL MODAL ---
window.showModal = (puerto) => {
    const modal = document.getElementById('puerto-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="modal-wrapper">
            <img src="media/${puerto.nombre}.jpg" 
                 alt="${puerto.nombre}" 
                 class="modal-image"
                 onerror="this.src='media/photo.jpg'">
            
            <div class="modal-body-content">
                <h2 class="modal-title">${puerto.nombre}</h2>
                <p class="modal-subtitle">${puerto.municipio} | Categoria: ${puerto.categoria}</p>
                
                <div class="stats-box">
                    <div><strong>Distancia:</strong> ${puerto.distancia_km} km</div>
                    <div><strong>Pendiente Media:</strong> ${puerto.pendiente_media_pct}%</div>
                    <div><strong>Pendiente Máx:</strong> ${puerto.pendiente_maxima_pct}%</div>
                    <div><strong>Desnivel:</strong> ${puerto.elevacion_m} m</div>
                </div>

                <h3>Strava Leaderboards</h3>
                <table class="leaderboard-table">
                    <thead>
                        <tr><th>Tipo</th><th>Nombre</th><th>Velocidad</th><th>Potencia</th><th>Tiempo</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>KOM</strong></td>
                            <td>${puerto.kom}</td>
                            <td>${puerto.velocidad_media_kom} km/h</td>
                            <td>${puerto.potencia_media_kom}W</td>
                            <td class="highlight-time">${puerto.tiempo_kom || '--:--'}</td>
                        </tr>
                        <tr>
                            <td><strong>QOM</strong></td>
                            <td>${puerto.qom}</td>
                            <td>${puerto.velocidad_media_qom} km/h</td>
                            <td>${puerto.potencia_media_qom}W</td>
                            <td class="highlight-time">${puerto.tiempo_qom || '--:--'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
};

window.closeModal = () => {
    const modal = document.getElementById('puerto-modal');
    if (modal) modal.style.display = 'none';
};

// --- EVENTOS DE CIERRE ---
window.onclick = (event) => {
    const modal = document.getElementById('puerto-modal');
    if (event.target === modal) closeModal();
};

window.onkeydown = (event) => {
    if (event.key === "Escape") closeModal();
};

// --- GENERADOR DE TARJETAS ---
const createCardHTML = (puerto) => `
    <div class="segment">
        <div class="card-img-wrapper">
            <img src="media/${puerto.nombre}.jpg" alt="${puerto.nombre}" onerror="this.src='media/photo.jpg'">
        </div>
        <div class="segment-content">
            <h3>${puerto.nombre}</h3>
            <p><strong>Categoría:</strong> ${puerto.categoria}</p>
            <p><strong>Distancia:</strong> ${puerto.distancia_km} km</p>
            <p><strong>Pendiente media:</strong> ${puerto.pendiente_media_pct}%</p>
            <p><strong>Desnivel:</strong> ${puerto.elevacion_m} m</p>
            <button class="view-details-btn" onclick='showModal(${JSON.stringify(puerto).replace(/'/g, "&apos;")})'>See more</button>
        </div>
    </div>
`;

// --- RUTAS ---
const routes = {
    "/": {
        title: "Mallorca Cycling | Inicio",
        render: async () => {
            const puertos = await getPuertos();
            const destacados = puertos.slice(0, 4).map(createCardHTML).join('');
            return `
                <section id="intro" class="section fade-in">
                    <div class="intro-container">
                        <img src="media/photo.jpeg" class="intro-photo">
                        <div class="intro-text">
                            <h1>Mallorca Cycling</h1>
                            <p>Descubre los mejores puertos de montaña de la isla.</p>
                        </div>
                    </div>
                </section>
                <section class="container">
                    <h2 class="section-title">Segmentos Destacados</h2>
                    <div class="segment-container">${destacados}</div>
                </section>
                <section class="container about-us-section">
                    <h2>About Us</h2>
                    <p>Apasionados por el ciclismo en la Tramuntana.</p>
                </section>
                <section class="container">
                    <div class="strava-connect-card">
                        <h2>Conecta con Strava</h2>
                        <button class="strava-connect-btn">CONNECT ACCOUNT</button>
                    </div>
                </section>`;
        }
    },
    "/map": {
        title: "Mapa | Mallorca Cycling",
        render: async () => `
            <section class="section fade-in">
                <div class="container">
                    <h2 class="page-header">Explora el Mapa</h2>
                    <div id="map-container">
                        <a href="https://www.strava.com/maps/segments" target="_blank">
                            <img src="media/map_example.png" class="map-photo">
                        </a>
                    </div>
                </div>
            </section>`
    },
    "/segments": {
        title: "Segmentos | Mallorca Cycling",
        render: async () => {
            const puertos = await getPuertos();
            const todos = puertos.map(createCardHTML).join('');
            return `
                <section class="section fade-in">
                    <div class="container">
                        <h2 class="page-header">Todos los Segmentos</h2>
                        <div class="segment-container">${todos}</div>
                    </div>
                </section>`;
        }
    }
};

const router = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes["/"];
    const view = await route.render();
    
    document.getElementById("app-viewport").innerHTML = view + `
        <div id="puerto-modal" class="modal" style="display:none;">
            <div class="modal-content">
                <span class="close-modal" onclick="closeModal()">&times;</span>
                <div id="modal-body"></div>
            </div>
        </div>`;
    
    document.title = route.title;
    window.scrollTo(0, 0);
};

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            window.history.pushState(null, null, e.target.href);
            router();
        }
    });
    window.addEventListener("popstate", router);
    router();
});