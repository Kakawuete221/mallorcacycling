document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.segment-container');
    container.innerHTML = '';

    try {
        const response = await fetch('data/puertos.json');
        const puertos = await response.json();

        puertos.forEach((puerto) => {
            const card = document.createElement('div');
            card.className = 'segment';

            const imgContainer = document.createElement('div');
            imgContainer.className = 'card-img-wrapper';

            const img = document.createElement('img');
            img.src = `media/${puerto.nombre}.jpg`;
            img.alt = `Puerto de montaña ${puerto.nombre}`;
            img.className = 'puerto-photo';
            
            img.onerror = function() {
                this.src = 'media/photo.jpg'; 
                this.onerror = null;
            };

            imgContainer.appendChild(img);
            card.appendChild(imgContainer);

            const infoContainer = document.createElement('div');
            infoContainer.className = 'segment-content';

            const h3 = document.createElement('h3');
            h3.textContent = puerto.nombre;

            const infoHtml = `
                <p><strong>Categoría:</strong> ${puerto.categoria}</p>
                <p><strong>Distancia:</strong> ${puerto.distancia_km} km</p>
                <p><strong>Pendiente media:</strong> ${puerto.pendiente_media_pct}%</p>
                <p><strong>Desnivel:</strong> ${puerto.elevacion_m} m</p>
            `;
            
            const btn = document.createElement('button');
            btn.textContent = 'See more';
            btn.addEventListener('click', () => showModal(puerto));

            infoContainer.appendChild(h3);
            infoContainer.insertAdjacentHTML('beforeend', infoHtml);
            infoContainer.appendChild(btn);
            
            card.appendChild(infoContainer);
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar los datos de los puertos:", error);
    }

    function showModal(puerto) {
        const modal = document.getElementById('puerto-modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <div style="position:relative">
                <img src="media/${puerto.nombre}.jpg" 
                     alt="${puerto.nombre}" 
                     style="width:100%; height:300px; object-fit:cover; display:block;"
                     onerror="this.src='media/photo.jpg'">
                
                <div style="padding: 25px;">
                    <h2 style="margin-bottom:10px; color:var(--primary-color)">${puerto.nombre}</h2>
                    <p style="margin-bottom:20px; font-weight:600;">${puerto.municipio} | Categoria: ${puerto.categoria}</p>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px; margin-bottom:30px; background:#f4f4f4; padding:15px; border-radius:8px;">
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
                                <td style="color:var(--primary-color); font-weight:bold">${puerto.tiempo_kom || '--:--'}</td>
                            </tr>
                            <tr>
                                <td><strong>QOM</strong></td>
                                <td>${puerto.qom}</td>
                                <td>${puerto.velocidad_media_qom} km/h</td>
                                <td>${puerto.potencia_media_qom}W</td>
                                <td style="color:var(--primary-color); font-weight:bold">${puerto.tiempo_qom || '--:--'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
    }

    document.getElementById('close-modal').onclick = () => { 
        document.getElementById('puerto-modal').style.display = 'none'; 
    };
    
    window.onclick = (event) => {
        const modal = document.getElementById('puerto-modal');
        if (event.target == modal) modal.style.display = 'none';
    };
});