# generarKML.py
# -*- coding: utf-8 -*-
"""
Genera archivos KML de planimetría para cada ruta turística de Navarra
a partir del archivo rutas.xml, utilizando la clase Kml.

@author: Olai Navarro
"""

import xml.etree.ElementTree as ET


class Kml(object):


    def __init__(self):
        """
        Crea el elemento raíz y el espacio de nombres
        """
        self.raiz = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
        self.doc = ET.SubElement(self.raiz, 'Document')

    def addPlacemark(self, nombre, descripcion, long, lat, alt, modoAltitud):
        """
        Añade un elemento <Placemark> con puntos <Point>
        """
        pm = ET.SubElement(self.doc, 'Placemark')
        ET.SubElement(pm, 'name').text = nombre
        ET.SubElement(pm, 'description').text = descripcion
        punto = ET.SubElement(pm, 'Point')
        ET.SubElement(punto, 'coordinates').text = '{},{},{}'.format(long, lat, alt)
        ET.SubElement(punto, 'altitudeMode').text = modoAltitud

    def addLineString(self, nombre, extrude, tesela, listaCoordenadas, modoAltitud, color, ancho):
        """
        Añade un elemento <Placemark> con líneas <LineString>
        """
        ET.SubElement(self.doc, 'name').text = nombre
        pm = ET.SubElement(self.doc, 'Placemark')
        ls = ET.SubElement(pm, 'LineString')
        ET.SubElement(ls, 'extrude').text = extrude
        ET.SubElement(ls, 'tessellation').text = tesela
        ET.SubElement(ls, 'coordinates').text = listaCoordenadas
        ET.SubElement(ls, 'altitudeMode').text = modoAltitud

        estilo = ET.SubElement(pm, 'Style')
        linea = ET.SubElement(estilo, 'LineStyle')
        ET.SubElement(linea, 'color').text = color
        ET.SubElement(linea, 'width').text = ancho

    def escribir(self, nombreArchivoKML):
        """
        Escribe el archivo KML con declaración y codificación
        """
        arbol = ET.ElementTree(self.raiz)
        ET.indent(arbol)
        arbol.write(nombreArchivoKML, encoding='utf-8', xml_declaration=True)

    def ver(self):
        """
        Muestra el archivo KML. Se utiliza para depurar
        """
        print("\nElemento raiz = ", self.raiz.tag)

        if self.raiz.text is not None:
            print("Contenido = ", self.raiz.text.strip('\n'))
        else:
            print("Contenido = ", self.raiz.text)

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


def generarKMLdeRuta(ruta, indice):
    """
    Dado un elemento <ruta> del XML, genera su archivo KML de planimetría.
    Crea un Placemark por cada hito y una LineString con el recorrido completo.
    """
    idRuta     = ruta.get('id')
    nombreRuta = ruta.findtext('nombre')

    print('\n--- Procesando KML para ruta id={} : {} ---'.format(idRuta, nombreRuta))

    nuevoKML = Kml()

    # Nombre del documento KML
    ET.SubElement(nuevoKML.doc, 'name').text = nombreRuta

    listaCoordenadas = ""
    hitos = ruta.findall('./hitos/hito')

    for hito in hitos:
        nombreHito  = hito.findtext('nombre')
        descHito    = hito.findtext('descripcion')
        long        = hito.findtext('./coordenadas/longitud')
        lat         = hito.findtext('./coordenadas/latitud')
        alt         = hito.findtext('./coordenadas/altitud')

        print('  Hito: {} ({}, {}, {})'.format(nombreHito, long, lat, alt))

        # Añadir Placemark para este hito
        nuevoKML.addPlacemark(
            nombreHito,
            descHito,
            long, lat, alt,
            'relativeToGround'
        )

        # Acumular coordenadas para la línea de recorrido
        if listaCoordenadas != "":
            listaCoordenadas += "\n"
        listaCoordenadas += '{},{},{}'.format(long, lat, alt)

    # Cerrar la polilínea volviendo al primer hito (ruta circular)
    primerHito = hitos[0]
    long0 = primerHito.findtext('./coordenadas/longitud')
    lat0  = primerHito.findtext('./coordenadas/latitud')
    alt0  = primerHito.findtext('./coordenadas/altitud')
    listaCoordenadas += "\n{},{},{}".format(long0, lat0, alt0)

    # Añadir la LineString con el recorrido completo de la ruta
    nuevoKML.addLineString(
        nombreRuta,
        "1",
        "1",
        listaCoordenadas,
        'relativeToGround',
        '#ff0000ff',
        "4"
    )

    # Nombre del archivo de salida: planimetria_r1.kml, planimetria_r2.kml...
    nombreArchivo = 'planimetria_{}.kml'.format(idRuta)

    nuevoKML.ver()
    nuevoKML.escribir(nombreArchivo)
    print('Creado el archivo: ', nombreArchivo)


def main():
    """
    Programa principal.
    Lee rutas.xml y genera un archivo KML de planimetría por cada ruta.
    """
    print(__doc__)

    archivoXML = 'rutas.xml'

    arbol = leerRutasXML(archivoXML)
    raiz  = arbol.getroot()

    rutas = raiz.findall('ruta')
    print('Número de rutas encontradas: ', len(rutas))

    for indice, ruta in enumerate(rutas):
        generarKMLdeRuta(ruta, indice)

    print('\n¡Generación de archivos KML completada!')


if __name__ == "__main__":
    main()
