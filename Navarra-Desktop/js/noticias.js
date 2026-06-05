"use strict";

class Noticias {
    constructor(busqueda) {
        this.busqueda = busqueda;
        this.apiKey = "ayaUHELiElZxzDBNx5tddcfqasMo74aqUykHElks";
        this.url = `https://api.thenewsapi.com/v1/news/all?api_token=${this.apiKey}&search=${encodeURIComponent(this.busqueda)}&language=es`;
    }

    // Obtener noticias con fetch
    buscar() {
        return fetch(this.url)
            .then(response => {
                if (!response.ok) throw new Error("Error al obtener las noticias");
                return response.json();
            });
    }

    // Procesar JSON para extraer solo los datos importantes
    procesarInformacion(json) {
        if (!json.data) return [];
        return json.data.map(noticia => ({
            titular: noticia.title,
            entradilla: noticia.description,
            enlace: noticia.url,
            fuente: noticia.source
        }));
    }

    mostrarNoticias(noticias, contenedor) {
    noticias.forEach(n => {
        const articulo = document.createElement("article");

        articulo.innerHTML = `
            <h3>${n.titular}</h3>
            <p>${n.entradilla}</p>
            <p>Fuente: ${n.fuente}</p>
            <a href="${n.enlace}" target="_blank" rel="noopener">Leer más</a>
        `;

        contenedor.appendChild(articulo);
    });
}

}
