// js/rutas.js
// -*- coding: utf-8 -*-
/**
 * Lógica de la página rutas.html
 * Carga rutas.xml, muestra información completa de cada ruta,
 * la planimetría con Google Maps y la altimetría con SVG inline.
 *
 * Clases:
 *   LectorXML        → carga y parsea rutas.xml con $.ajax()
 *   RutaDatos        → encapsula todos los datos de una ruta del XML
 *   VistaInfoRuta    → genera el bloque HTML de información + hitos + refs
 *   MapaGoogleMaps   → monta la planimetría con Google Maps API
 *   VistaSVG         → carga e inserta inline el SVG de altimetría
 *   ControladorRutas → orquesta todo (clase principal / punto de entrada)
 *
 * Selectores de contenedor usados en el JS:
 *   main section nav[role='tablist']  → barra de pestañas
 *   main section div                  → zona de contenido
 *
 * Selectores CSS permitidos para mapas dinámicos (enunciado):
 *   div.mapa-contenedor
 *
 * @author  Olai Navarro
 */

"use strict";

/*
LectorXML
leer y parsear rutas.xml usando jQuery encapsulado.
Devuelve una Promise con el array de objetos RutaDatos resultante.
 */
class LectorXML {

    constructor(rutaArchivo) {
        this.rutaArchivo = rutaArchivo;
    }

    /**
     * Carga el XML de forma asíncrona con $.ajax() y devuelve una
     * Promise resuelta con un array de objetos RutaDatos.
     *
     * @returns {Promise<RutaDatos[]>}
     */
    cargar() {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: this.rutaArchivo,
                dataType: "xml",
                success: (xmlDoc) => {
                    resolve(this._parsear(xmlDoc));
                },
                error: (xhr, estado, err) => {
                    reject(new Error(
                            "Error al cargar " + this.rutaArchivo + ": " + err));
                }
            });
        });
    }

    /**
     * Convierte el documento XML en un array de objetos RutaDatos.
     */
    _parsear(xmlDoc) {
        const resultado = [];
        $(xmlDoc).find("ruta").each(function () {
            resultado.push(new RutaDatos($(this)));
        });
        return resultado;
    }
}

/*
RutaDatos
Responsabilidad: encapsular todos los datos de una ruta leídos del XML.
No realiza operaciones de vista ni de red.
 */
class RutaDatos {

    /**
     * @param {jQuery} $ruta  Elemento jQuery <ruta> extraído del XML
     */
    constructor($ruta) {
        // Atributo de identificación
        this.id = $ruta.attr("id");

        // Campos simples de texto
        this.nombre = $ruta.children("nombre").text().trim();
        this.tipo = $ruta.children("tipo").text().trim();
        this.transporte = $ruta.children("transporte").text().trim();
        this.duracion = $ruta.children("duracion").text().trim();
        this.agencia = $ruta.children("agencia").text().trim();
        this.descripcion = $ruta.children("descripcion").text().trim();
        this.publico = $ruta.children("publico").text().trim();
        this.recomendacion = $ruta.children("recomendacion").text().trim();

        // Rutas a los archivos generados por Python
        this.planimetria = $ruta.children("planimetria").text().trim();
        this.altimetria = $ruta.children("altimetria").text().trim();

        // Punto de inicio de la ruta
        const $inicio = $ruta.find("inicio");
        this.inicio = {
            lugar: $inicio.find("lugar").text().trim(),
            direccion: $inicio.find("direccion").text().trim(),
            lat: parseFloat($inicio.find("latitud").text()),
            lon: parseFloat($inicio.find("longitud").text()),
            alt: parseFloat($inicio.find("altitud").text())
        };

        // Referencias bibliográficas (array de URLs)
        this.referencias = [];
        $ruta.find("referencias referencia").each((i, el) => {
            this.referencias.push($(el).text().trim());
        });

        // Hitos del recorrido, incluyendo fotos y vídeos opcionales
        this.hitos = [];
        $ruta.find("hitos hito").each((i, el) => {
            const $h = $(el);

            const fotos = [];
            $h.find("galeria foto").each((j, f) => {
                fotos.push($(f).text().trim());
            });

            const videos = [];
            $h.find("galeria video").each((j, v) => {
                videos.push($(v).text().trim());
            });

            this.hitos.push({
                nombre: $h.children("nombre").text().trim(),
                descripcion: $h.children("descripcion").text().trim(),
                lat: parseFloat($h.find("latitud").text()),
                lon: parseFloat($h.find("longitud").text()),
                alt: parseFloat($h.find("altitud").text()),
                distancia: parseFloat($h.find("distancia").text()),
                fotos: fotos,
                videos: videos
            });
        });
    }
}

/*
VistaInfoRuta
Responsabilidad: generar el HTML con la información completa de
una ruta (metadatos, descripción, hitos y referencias).
Solo métodos estáticos: no guarda estado propio.
 */
class VistaInfoRuta {

    /**
     * Genera el HTML completo de información de una ruta.
     *
     * @param   {RutaDatos} ruta
     * @returns {string}  HTML listo para insertar con jQuery
     */
    static generarHTML(ruta) {
        return `
            <article>
                <h2>${ruta.nombre}</h2>

                <div>
                    <span><b>Tipo:</b> ${ruta.tipo}</span>
                    <span><b>Transporte:</b> ${ruta.transporte}</span>
                    <span><b>Duración:</b> ${ruta.duracion}</span>
                    <span><b>Agencia:</b> ${ruta.agencia}</span>
                    <span><b>Público:</b> ${ruta.publico}</span>
                    <span><b>Inicio:</b> ${ruta.inicio.lugar} — ${ruta.inicio.direccion}</span>
                </div>

                <p>${ruta.descripcion}</p>

                <p><strong>&#11088; Recomendación: ${ruta.recomendacion} / 10</strong></p>

                <h3>Hitos del recorrido</h3>
                ${VistaInfoRuta._generarHitosHTML(ruta.hitos)}

                <h3>Referencias bibliográficas</h3>
                ${VistaInfoRuta._generarReferenciasHTML(ruta.referencias)}
            </article>`;
    }

    /**
     * Genera la lista de hitos en HTML incluyendo galería de fotos y vídeos.
     * Se usa <ol> para la lista numerada y elementos semánticos.
     *
     * @param   {object[]} hitos
     * @returns {string}
     */
    static _generarHitosHTML(hitos) {
        let html = "<ol>";
        hitos.forEach((h) => {
            html += `
                <li>
                    <strong>${h.nombre}</strong>
                    <p>${h.descripcion}</p>
                    <p>Altitud: ${h.alt} m — Distancia desde anterior: ${h.distancia} m</p>
                    ${VistaInfoRuta._generarFotosHTML(h.fotos, h.nombre)}
                    ${VistaInfoRuta._generarVideosHTML(h.videos, h.nombre)}
                </li>`;
        });
        html += "</ol>";
        return html;
    }

    /**
     * Genera la galería de fotos de un hito.
     * Solo se genera si hay fotos. Usa <figure> y <figcaption> para accesibilidad.
     *
     * @param   {string[]} fotos      Array de nombres de archivo de imagen
     * @param   {string}   nombreHito Nombre del hito para el atributo alt
     * @returns {string}
     */
    static _generarFotosHTML(fotos, nombreHito) {
        if (!fotos || fotos.length === 0) {
            return "";
        }
        let html = "<figure>";
        fotos.forEach((foto, i) => {
            // Alt descriptivo combinando nombre del hito e índice de foto
            const altTexto = nombreHito + " — foto " + (i + 1);
            html += `<img src="multimedia/${foto}" alt="${altTexto}">`;
        });
        html += `<figcaption>Galería de imágenes: ${nombreHito}</figcaption>`;
        html += "</figure>";
        return html;
    }

    /**
     * Genera la galería de vídeos de un hito (opcional).
     * Cada vídeo se sirve como elemento <video> con al menos 2 fuentes
     * si el archivo tiene par mp4/webm con el mismo nombre base.
     * Si solo hay un formato disponible se incluye igualmente.
     *
     * @param   {string[]} videos     Array de nombres de archivo de vídeo
     * @param   {string}   nombreHito Nombre del hito para accesibilidad
     * @returns {string}
     */
    static _generarVideosHTML(videos, nombreHito) {
        if (!videos || videos.length === 0) {
            return "";
        }
        let html = "";
        videos.forEach((video, i) => {
            // Derivar los dos formatos a partir del nombre base
            const base = video.replace(/\.[^/.]+$/, "");
            const mp4 = base + ".mp4";
            const webm = base + ".webm";
            html += `
                <figure>
                    <video controls>
                        <source src="multimedia/${mp4}"  type="video/mp4">
                        <source src="multimedia/${webm}" type="video/webm">
                        Tu navegador no soporta el elemento de vídeo.
                    </video>
                    <figcaption>${nombreHito} — vídeo ${i + 1}</figcaption>
                </figure>`;
        });
        return html;
    }

    /**
     * Genera la lista de referencias bibliográficas en HTML.
     *
     * @param   {string[]} referencias
     * @returns {string}
     */
    static _generarReferenciasHTML(referencias) {
        let html = "<ul>";
        referencias.forEach(ref => {
            html += `<li><a href="${ref}" target="_blank" rel="noopener">${ref}</a></li>`;
        });
        html += "</ul>";
        return html;
    }
}

/*
MapaGoogleMaps
Responsabilidad: mostrar la planimetría de la ruta con Google Maps.

NOTA: El enunciado permite explícitamente el uso de id en los
contenedores de mapas dinámicos y el selector div.mapa-contenedor
en las hojas de estilo CSS.
 */
class MapaGoogleMaps {

    /**
     * @param {string}    idContenedor  id del div donde montar el mapa
     * @param {RutaDatos} ruta          datos completos de la ruta
     */
    constructor(idContenedor, ruta) {
        this.idContenedor = idContenedor;
        this.ruta = ruta;
        this.mapa = null;
    }

    /**
     * Inicializa el mapa centrado en el punto de inicio, añade
     * un Marker con InfoWindow por cada hito y dibuja el recorrido
     * como Polyline cerrada.
     */
    inicializar() {
        const centroInicio = {
            lat: this.ruta.inicio.lat,
            lng: this.ruta.inicio.lon
        };

        this.mapa = new google.maps.Map(
                document.getElementById(this.idContenedor), {
                center: centroInicio,
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            });

        const bounds = new google.maps.LatLngBounds();

        this.ruta.hitos.forEach((hito, i) => {
            const posicion = {
                lat: hito.lat,
                lng: hito.lon
            };
            bounds.extend(posicion);

            const marcador = new google.maps.Marker({
                position: posicion,
                map: this.mapa,
                title: hito.nombre,
                label: String(i + 1)
            });

            const ventanaInfo = new google.maps.InfoWindow({
                content: `<strong>${hito.nombre}</strong><br>
                          ${hito.descripcion}<br>
                          <small>Alt: ${hito.alt} m | Dist: ${hito.distancia} m</small>`
            });

            marcador.addListener("click", () => {
                ventanaInfo.open(this.mapa, marcador);
            });
        });

        // Polilínea cerrada: el último punto vuelve al primero
        const coordenadas = this.ruta.hitos.map(h => ({
                    lat: h.lat,
                    lng: h.lon
                }));
        if (coordenadas.length > 0) {
            coordenadas.push(coordenadas[0]);
        }

        new google.maps.Polyline({
            path: coordenadas,
            geodesic: true,
            strokeColor: "#b5001f",
            strokeOpacity: 0.9,
            strokeWeight: 3,
            map: this.mapa
        });

        this.mapa.fitBounds(bounds);
    }
}

/*
CLASE: VistaSVG
Responsabilidad: cargar e insertar inline el SVG de altimetría
generado por el script Python.
El SVG generado por Python debe usar atributos con guion (stroke-width,
font-family, font-size) y version="1.1" para pasar la validación W3C.
 */
class VistaSVG {

    /**
     * @param {string} idContenedor  id del div donde insertar el SVG
     * @param {string} archivoSVG   nombre del archivo SVG
     * @param {string} carpetaXML   ruta a la carpeta xml/
     */
    constructor(idContenedor, archivoSVG, carpetaXML) {
        this.idContenedor = idContenedor;
        this.archivoSVG = archivoSVG;
        this.carpetaXML = carpetaXML;
    }

    /**
     * Carga el SVG con $.ajax() y lo inserta inline en el contenedor.
     */
    cargar() {
        $.ajax({
            type: "GET",
            url: this.carpetaXML + this.archivoSVG,
            dataType: "xml",
            success: (svgDoc) => {
                const serializer = new XMLSerializer();
                const svgTexto = serializer.serializeToString(
                        svgDoc.documentElement);
                $("#" + this.idContenedor).html(svgTexto);
            },
            error: () => {
                $("#" + this.idContenedor).html(
                    "<p>No se pudo cargar la altimetría: " +
                    this.archivoSVG + "</p>");
            }
        });
    }
}

/*
CLASE PRINCIPAL: ControladorRutas
Responsabilidad: orquestar la carga del XML, la generación de
pestañas de selección, y la visualización de información,
planimetría y altimetría de cada ruta.

Selectores internos (sin class ni id salvo excepciones del enunciado):
$tabs      → main section nav[role='tablist']
$contenido → main section div
 */
class ControladorRutas {

    /**
     * @param {string} rutaXML    ruta al archivo rutas.xml
     * @param {string} carpetaXML ruta a la carpeta xml/ para los SVGs
     */
    constructor(rutaXML, carpetaXML) {
        this.rutas = [];
        this.indiceActivo = 0;
        this.carpetaXML = carpetaXML;
        this.lectorXML = new LectorXML(rutaXML);

        // Cachear los dos contenedores del HTML estático usando selectores
        // de elemento + atributo, sin id ni class (salvo excepciones enunciado).
        // Se usa <nav role="tablist"> en el HTML estático para el tablist,
        // y <div> para el contenido (permitido para mapas dinámicos).
        this.$tabs = $("main section nav[role='tablist']");
        this.$contenido = $("main section div");
    }

    /**
     * Punto de entrada público.
     * Carga el XML y arranca la interfaz de usuario.
     */
    iniciar() {
        this.lectorXML.cargar()
        .then((rutas) => {
            this.rutas = rutas;
            this._crearTabs();
            this._mostrarRuta(0);
        })
        .catch((err) => {
            this.$tabs.html(
                "<p>Error cargando rutas: " + err.message + "</p>");
        });
    }

    /**
     * Genera los botones de selección de ruta en el DOM con jQuery.
     * Usa class="activo" en el botón activo y aria-selected para
     * cumplir el patrón ARIA de tablist (WCAG AAA).
     */
    _crearTabs() {
        this.$tabs.empty();

        this.rutas.forEach((ruta, i) => {
            const $btn = $("<button>")
                .text(ruta.nombre)
                .attr("type", "button")
                .attr("role", "tab")
                .attr("aria-selected", "false")
                .attr("aria-label", "Ver ruta: " + ruta.nombre);

            $btn.on("click", () => this._mostrarRuta(i));

            this.$tabs.append($btn);
        });
    }

    /**
     * Muestra la información completa de la ruta en el índice dado.
     *
     * Los divs del mapa llevan id (necesario para Google Maps API)
     * y class="mapa-contenedor" (permitido por el enunciado para
     * mapas dinámicos). El div del SVG solo lleva id, también
     * imprescindible para referenciar el elemento tras la inserción
     * del HTML dinámico.
     *
     * @param {number} indice  Posición de la ruta en el array this.rutas
     */
    _mostrarRuta(indice) {
        this.indiceActivo = indice;
        const ruta = this.rutas[indice];

        // Marcar pestaña activa:
        // - class="activo" permitido por el enunciado para el elemento activo
        // - aria-selected requerido por el patrón ARIA tablist (WCAG AAA)
        this.$tabs.find("button")
        .removeClass("activo")
        .attr("aria-selected", "false")
        .eq(indice)
        .addClass("activo")
        .attr("aria-selected", "true");

        // IDs únicos para mapa y SVG — imprescindibles para la API de Maps
        const idMapa = "mapa-ruta-" + ruta.id;
        const idSvg = "svg-ruta-" + ruta.id;

        // HTML sin class ni id salvo las excepciones justificadas arriba.
        // Se usan elementos semánticos HTML5: article, section, h2, h3, ol, ul.
        const htmlCompleto = `
            ${VistaInfoRuta.generarHTML(ruta)}

            <section>
                <h3>Planimetría — ${ruta.nombre}</h3>
                <div id="${idMapa}" class="mapa-contenedor"></div>
            </section>

            <section>
                <h3>Altimetría — ${ruta.nombre}</h3>
                <div id="${idSvg}">
                    <p>Cargando altimetría...</p>
                </div>
            </section>`;

        this.$contenido.html(htmlCompleto);

        // Inicializar Google Maps en el div recién creado
        const mapa = new MapaGoogleMaps(idMapa, ruta);
        mapa.inicializar();

        // Cargar e insertar el SVG de altimetría
        const svg = new VistaSVG(idSvg, ruta.altimetria, this.carpetaXML);
        svg.cargar();
    }
}

/*
ARRANQUE
 */
$(function () {
    const controlador = new ControladorRutas(
            "xml/rutas.xml",
            "xml/");
    controlador.iniciar();
});