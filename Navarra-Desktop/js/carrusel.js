class Carrusel {

    constructor() {

        this.imagenes = [
            "multimedia/navarra1.jpg",
            "multimedia/navarra2.jpg",
            "multimedia/navarra3.jpg",
            "multimedia/navarra4.jpg",
            "multimedia/navarra5.jpg",
            "multimedia/mapaNavarra.jpg"
        ];

        this.indice = 0;

        this.imagen = $("figure img");
    }

    siguienteImagen() {

        this.indice++;

        if (this.indice >= this.imagenes.length) {
            this.indice = 0;
        }

        this.imagen.attr("src", this.imagenes[this.indice]);
    }

    iniciar() {

        setInterval(() => {
            this.siguienteImagen();
        }, 3000);

    }

}