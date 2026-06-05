# generarSVG.py
# -*- coding: utf-8 -*-
"""
Genera archivos SVG de altimetría para cada ruta turística de Navarra
a partir del archivo rutas.xml, utilizando la clase Svg.

Los atributos SVG usan nombres con guion (stroke-width, font-family,
font-size) y version="1.1" para cumplir la validación W3C.

@author: Olai Navarro
"""

import xml.etree.ElementTree as ET


class Svg(object):

    # Dimensiones y márgenes del gráfico
    ANCHO       = 900
    ALTO        = 500
    MARGEN_IZQ  = 80
    MARGEN_DER  = 870
    MARGEN_SUP  = 60
    MARGEN_INF  = 430

    def __init__(self):
        """
        Crea el elemento raíz SVG con los atributos correctos.
        version debe ser "1.1" (SVG 2.0 no está estandarizado).
        Los atributos de presentación usan nombres con guion.
        """
        self.raiz = ET.Element('svg')
        self.raiz.set('xmlns', 'http://www.w3.org/2000/svg')
        self.raiz.set('version', '1.1')
        self.raiz.set('width',   str(self.ANCHO))
        self.raiz.set('height',  str(self.ALTO))
        self.raiz.set('viewBox', '0 0 {} {}'.format(self.ANCHO, self.ALTO))

    def addRect(self, x, y, ancho, alto, relleno, strokeWidth, stroke):
        """
        Añade un rectángulo al SVG.
        Usa stroke-width (con guion) como atributo de presentación SVG válido.
        """
        el = ET.SubElement(self.raiz, 'rect')
        el.set('x',            str(x))
        el.set('y',            str(y))
        el.set('width',        str(ancho))
        el.set('height',       str(alto))
        el.set('fill',         relleno)
        el.set('stroke-width', str(strokeWidth))
        el.set('stroke',       stroke)

    def addText(self, x, y, fontSize, fontFamily, estilo, contenido):
        """
        Añade un texto al SVG.
        Usa font-size y font-family (con guion) como atributos válidos SVG.
        """
        el = ET.SubElement(self.raiz, 'text')
        el.set('x',           str(x))
        el.set('y',           str(y))
        el.set('font-size',   str(fontSize))
        el.set('font-family', fontFamily)
        el.set('style',       estilo)
        el.text = contenido

    def addLine(self, x1, y1, x2, y2, stroke, strokeWidth):
        """
        Añade una línea al SVG.
        Usa stroke-width (con guion) como atributo de presentación SVG válido.
        """
        el = ET.SubElement(self.raiz, 'line')
        el.set('x1',           str(x1))
        el.set('y1',           str(y1))
        el.set('x2',           str(x2))
        el.set('y2',           str(y2))
        el.set('stroke',       stroke)
        el.set('stroke-width', str(strokeWidth))

    def addPolyline(self, puntos, stroke, strokeWidth, relleno):
        """
        Añade una polilínea al SVG.
        Usa stroke-width (con guion) como atributo de presentación SVG válido.
        """
        el = ET.SubElement(self.raiz, 'polyline')
        el.set('points',       puntos)
        el.set('stroke',       stroke)
        el.set('stroke-width', str(strokeWidth))
        el.set('fill',         relleno)

    def addCircle(self, cx, cy, r, relleno):
        """
        Añade un círculo al SVG.
        """
        el = ET.SubElement(self.raiz, 'circle')
        el.set('cx',   str(cx))
        el.set('cy',   str(cy))
        el.set('r',    str(r))
        el.set('fill', relleno)

    def escribir(self, nombreArchivoSVG):
        """
        Escribe el archivo SVG con declaración y codificación.
        """
        arbol = ET.ElementTree(self.raiz)
        ET.indent(arbol)
        arbol.write(nombreArchivoSVG, encoding='utf-8', xml_declaration=True)

    def ver(self):
        """
        Muestra el SVG por consola. Se utiliza para depurar.
        """
        print("\nElemento raiz = ", self.raiz.tag)
        print("Atributos = ", self.raiz.attrib)
        for hijo in self.raiz.findall('.//'): # Expresión XPath
            print("\nElemento = ", hijo.tag)
            if hijo.text is not None:
                print("Contenido = ", hijo.text.strip('\n'))
            else:
                print("Contenido = ", hijo.text)
            print("Atributos = ", hijo.attrib)


def leerRutasXML(archivoXML):
    """
    Lee el archivo rutas.xml y devuelve el árbol parseado.
    """
    try:
        arbol = ET.parse(archivoXML)
    except IOError:
        print('No se encuentra el archivo ', archivoXML)
        exit()
    except ET.ParseError:
        print('Error procesando el archivo XML = ', archivoXML)
        exit()
    return arbol


def calcularEscala(altitudes, distancias):
    """
    Calcula los parámetros de escala para mapear altitudes y distancias
    a coordenadas de píxeles del gráfico.

    Devuelve un diccionario con:
      altMin, altMax   → rango de altitudes
      distMax          → distancia total acumulada
      escalaY          → píxeles por metro de altitud
      escalaX          → píxeles por metro de distancia horizontal
    """
    altMin  = min(altitudes)
    altMax  = max(altitudes)
    distMax = sum(distancias)

    rangoAlt = altMax - altMin
    if rangoAlt == 0:
        rangoAlt = 1  # Evitar división por cero si todos los hitos tienen la misma altitud

    altoGrafico = Svg.MARGEN_INF - Svg.MARGEN_SUP
    anchoGrafico = Svg.MARGEN_DER - Svg.MARGEN_IZQ

    escalaY = altoGrafico / rangoAlt
    escalaX = anchoGrafico / distMax if distMax > 0 else anchoGrafico

    return {
        'altMin' : altMin,
        'altMax' : altMax,
        'distMax': distMax,
        'escalaY': escalaY,
        'escalaX': escalaX
    }


def altitudAPx(alt, escala):
    """
    Convierte una altitud en metros a coordenada Y en píxeles.
    Las altitudes más altas quedan más arriba (Y más pequeño).
    """
    return Svg.MARGEN_INF - (alt - escala['altMin']) * escala['escalaY']


def distanciaAPx(distAcum, escala):
    """
    Convierte una distancia acumulada en metros a coordenada X en píxeles.
    """
    return Svg.MARGEN_IZQ + distAcum * escala['escalaX']


def generarSVGdeRuta(ruta, indice):
    """
    Dado un elemento <ruta> del XML, genera su archivo SVG de altimetría.
    El gráfico muestra una polilínea cerrada con los hitos de la ruta,
    referencias a la escala horizontal y vertical en metros,
    y etiquetas de texto verticales y horizontales para cada hito.
    """
    idRuta     = ruta.get('id')
    nombreRuta = ruta.findtext('nombre')

    print('\n--- Procesando SVG para ruta id={} : {} ---'.format(idRuta, nombreRuta))

    hitos = ruta.findall('./hitos/hito')

    # Extraer altitudes y distancias
    altitudes  = []
    distancias = []
    nombres    = []

    for hito in hitos:
        alt      = float(hito.findtext('./coordenadas/altitud'))
        dist     = float(hito.findtext('distancia') or 0)
        nombre   = hito.findtext('nombre')
        altitudes.append(alt)
        distancias.append(dist)
        nombres.append(nombre)

    escala = calcularEscala(altitudes, distancias)

    nuevoSVG = Svg()

    # --- Fondo ---
    nuevoSVG.addRect(0, 0, Svg.ANCHO, Svg.ALTO, 'white', 1, '#cccccc')

    # --- Título ---
    nuevoSVG.addText(
        Svg.MARGEN_IZQ, 35,
        16, 'Verdana',
        'font-weight:bold; fill:#333333;',
        'Altimetría: ' + nombreRuta
    )

    # --- Líneas de cuadrícula horizontales y etiquetas de altitud ---
    NUM_LINEAS = 6
    for i in range(NUM_LINEAS):
        fraccion = i / (NUM_LINEAS - 1)
        altRef   = escala['altMin'] + fraccion * (escala['altMax'] - escala['altMin'])
        yPx      = altitudAPx(altRef, escala)

        # Línea de cuadrícula
        nuevoSVG.addLine(Svg.MARGEN_IZQ, yPx, Svg.MARGEN_DER, yPx, '#dddddd', 1)
        # Pequeña marca en el eje Y
        nuevoSVG.addLine(Svg.MARGEN_IZQ - 5, yPx, Svg.MARGEN_IZQ, yPx, '#555555', 1)
        # Etiqueta de altitud
        nuevoSVG.addText(
            5, yPx + 5,
            11, 'Verdana',
            'fill:#555555;',
            '{:.0f} m'.format(altRef)
        )

    # --- Eje Y (línea vertical) ---
    nuevoSVG.addLine(Svg.MARGEN_IZQ, Svg.MARGEN_SUP, Svg.MARGEN_IZQ, Svg.MARGEN_INF, '#555555', 2)

    # --- Etiqueta del eje Y (vertical) ---
    nuevoSVG.addText(
        15, 245,
        12, 'Verdana',
        'fill:#333333; writing-mode:tb; glyph-orientation-vertical:0;',
        'Altitud (m)'
    )

    # --- Marcas y etiquetas del eje X (distancia acumulada) ---
    distAcum = 0.0
    marcasX = []

    for i, dist in enumerate(distancias):
        xPx = distanciaAPx(distAcum, escala)
        marcasX.append(xPx)

        nuevoSVG.addLine(xPx, Svg.MARGEN_INF, xPx, Svg.MARGEN_INF + 5, '#555555', 1)
        nuevoSVG.addText(
            xPx - 15, Svg.MARGEN_INF + 20,
            11, 'Verdana',
            'fill:#555555;',
            '{:.0f} m'.format(distAcum)
        )
        distAcum += dist

    # Última marca (distancia total)
    xPxFinal = Svg.MARGEN_DER
    nuevoSVG.addLine(xPxFinal, Svg.MARGEN_INF, xPxFinal, Svg.MARGEN_INF + 5, '#555555', 1)
    nuevoSVG.addText(
        xPxFinal - 15, Svg.MARGEN_INF + 20,
        11, 'Verdana',
        'fill:#555555;',
        '{:.0f} m'.format(distAcum)
    )

    # --- Eje X (línea horizontal) ---
    nuevoSVG.addLine(Svg.MARGEN_IZQ, Svg.MARGEN_INF, Svg.MARGEN_DER, Svg.MARGEN_INF, '#555555', 2)

    # --- Etiqueta del eje X ---
    nuevoSVG.addText(
        435, Svg.MARGEN_INF + 50,
        12, 'Verdana',
        'fill:#333333;',
        'Distancia (m)'
    )

    # --- Polilínea cerrada del perfil de altimetría ---
    puntosPerfil = []
    distAcum = 0.0

    for i, (alt, dist) in enumerate(zip(altitudes, distancias)):
        xPx = distanciaAPx(distAcum, escala)
        yPx = altitudAPx(alt, escala)
        puntosPerfil.append('{},{}'.format(xPx, yPx))
        distAcum += dist

    # Cerrar la polilínea: bajar al eje X y volver al origen
    puntoCierre1 = '{},{}'.format(Svg.MARGEN_DER, Svg.MARGEN_INF)
    puntoCierre2 = '{},{}'.format(Svg.MARGEN_IZQ, Svg.MARGEN_INF)
    puntoInicio  = puntosPerfil[0]
    puntosPerfil += [puntoCierre1, puntoCierre2, puntoInicio]

    nuevoSVG.addPolyline(
        ' '.join(puntosPerfil),
        '#1a6bb5',
        2,
        'rgba(26,107,181,0.25)'
    )

    # --- Círculos y etiquetas de hito ---
    distAcum = 0.0
    for i, (alt, dist, nombre) in enumerate(zip(altitudes, distancias, nombres)):
        xPx = distanciaAPx(distAcum, escala)
        yPx = altitudAPx(alt, escala)

        nuevoSVG.addCircle(xPx, yPx, 5, '#c0392b')
        nuevoSVG.addText(
            xPx + 7, yPx,
            10, 'Verdana',
            'fill:#222222; writing-mode:tb; glyph-orientation-vertical:0;',
            nombre
        )
        distAcum += dist

    # --- Escribir archivo ---
    nuevoSVG.ver()
    nombreArchivo = 'altimetria_{}.svg'.format(idRuta)
    nuevoSVG.escribir(nombreArchivo)
    print('Creado el archivo: ', nombreArchivo)


def main():
    """
    Programa principal.
    Lee rutas.xml y genera un archivo SVG de altimetría por cada ruta.
    """
    print(__doc__)

    archivoXML = 'rutas.xml'

    arbol = leerRutasXML(archivoXML)
    raiz  = arbol.getroot()

    rutas = raiz.findall('ruta')
    print('Número de rutas encontradas: ', len(rutas))

    for indice, ruta in enumerate(rutas):
        generarSVGdeRuta(ruta, indice)

    print('\n¡Generación de archivos SVG completada!')


if __name__ == "__main__":
    main()