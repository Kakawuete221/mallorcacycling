// filters.js - Lògica de filtratge actualitzada

const estatFiltres = {
    cerca: "",
    comarca: [],
    categoria: [],
    distanciaMax: 10,
    desnivellMax: 1000,
    pendentMax: 10,
    nomesCompletats: false,
    ordenacio: ""
};

export const aplicarFiltres = (ports) => {
    const filtrats = ports.filter(port => {
        if (estatFiltres.cerca) {
            const text = estatFiltres.cerca.toLowerCase();
            if (!(port.nom || "").toLowerCase().includes(text)) return false;
        }

        if (estatFiltres.comarca.length > 0) {
            const zona = port.comarca || port.municipi || "";
            if (!estatFiltres.comarca.includes(zona)) return false;
        }

        if (estatFiltres.categoria.length > 0) {
            if (!estatFiltres.categoria.includes(port.categoria.toString())) return false;
        }

        if (parseFloat(port.distancia) > estatFiltres.distanciaMax) return false;
        if (parseFloat(port.desnivell) > estatFiltres.desnivellMax) return false;
        if (parseFloat(port.pendent_mitja) > estatFiltres.pendentMax) return false;

        if (estatFiltres.nomesCompletats) {
            const cached = JSON.parse(localStorage.getItem(`segment_${port.id}`));
            if (!cached?.data?.athlete_segment_stats?.pr_elapsed_time) return false;
        }

        return true; 
    });

    if (estatFiltres.ordenacio) {
        filtrats.sort((a, b) => {
            const distA = parseFloat(a.distancia) || 0;
            const distB = parseFloat(b.distancia) || 0;
            const gradA = parseFloat(a.pendent_mitja) || 0;
            const gradB = parseFloat(b.pendent_mitja) || 0;

            switch (estatFiltres.ordenacio) {
                case "dist_asc": return distA - distB;
                case "dist_desc": return distB - distA;
                case "grad_asc": return gradA - gradB;
                case "grad_desc": return gradB - gradA;
                default: return 0;
            }
        });
    }

    return filtrats;
};

export const setCerca = (text) => { estatFiltres.cerca = text; };
export const setToggleCompletats = (actiu) => { estatFiltres.nomesCompletats = actiu; };
export const setValorSlider = (camp, valor) => { estatFiltres[camp] = parseFloat(valor); };
export const setOrdenacio = (val) => { estatFiltres.ordenacio = val; };

export const toggleFiltreGeneric = (camp, valor) => {
    const index = estatFiltres[camp].indexOf(valor);
    if (index > -1) estatFiltres[camp].splice(index, 1);
    else estatFiltres[camp].push(valor);
};

export const resetFiltres = () => {
    estatFiltres.cerca = "";
    estatFiltres.comarca = [];
    estatFiltres.categoria = [];
    estatFiltres.distanciaMax = 10;
    estatFiltres.desnivellMax = 1000;
    estatFiltres.pendentMax = 10;
    estatFiltres.nomesCompletats = false;
    estatFiltres.ordenacio = "";
};