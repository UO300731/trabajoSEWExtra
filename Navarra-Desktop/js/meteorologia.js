"use strict";

class Ciudad {

    #lat;
    #lon;

    constructor(nombre, pais, gentilicio, lat, lon) {
        this.nombre = nombre;
        this.pais = pais;
        this.gentilicio = gentilicio;
        this.#lat = lat;
        this.#lon = lon;
    }

    getMeteorologia() {

        return $.ajax({
            url: "https://api.open-meteo.com/v1/forecast",
            dataType: "json",
            data: {
                latitude: this.#lat,
                longitude: this.#lon,
                current: "temperature_2m,wind_speed_10m,relative_humidity_2m",
                daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                timezone: "auto",
                forecast_days: 7
            }
        });
    }


    procesarMeteorologia(json) {

        const actual = {
            temperatura: json.current.temperature_2m,
            viento: json.current.wind_speed_10m,
            humedad: json.current.relative_humidity_2m
        };

        const previsiones = json.daily.time.map((dia, i) => ({
            dia: dia,
            max: json.daily.temperature_2m_max[i],
            min: json.daily.temperature_2m_min[i],
            lluvia: json.daily.precipitation_probability_max[i]
        }));

        return { actual, previsiones };
    }


    mostrarMeteorologia(datos, contenedor) {

        // Tiempo actual
        $(contenedor).append(`
            <section>
                <h3>Tiempo actual en ${this.nombre}</h3>
                <p>Temperatura: ${datos.actual.temperatura} °C</p>
                <p>Viento: ${datos.actual.viento} km/h</p>
                <p>Humedad: ${datos.actual.humedad} %</p>
            </section>
        `);

        // Previsión 7 días
        let html = `
            <section>
                <h3>Previsión 7 días</h3>
        `;

        datos.previsiones.forEach(d => {
            html += `
                <article>
                    <h3><strong>${d.dia}</strong></h3>
                    <p>Máx: ${d.max} °C</p>
                    <p>Mín: ${d.min} °C</p>
                    <p>Prob. lluvia: ${d.lluvia} %</p>
                </article>
            `;
        });

        html += `</section>`;

        $(contenedor).append(html);
    }
}