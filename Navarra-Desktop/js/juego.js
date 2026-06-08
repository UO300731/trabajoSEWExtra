"use strict";

class Juego {

    constructor() {

        this.preguntas = [{
                pregunta: "¿Cuál es la capital de Navarra?",
                opciones: ["Tudela", "Pamplona", "Estella", "Olite", "Burlada"],
                correcta: 1
            }, {
                pregunta: "¿Qué plato es típico de Navarra?",
                opciones: ["Paella", "Cordero al chilindrón", "Fabada", "Cocido", "Gazpacho"],
                correcta: 1
            }, {
                pregunta: "¿Qué producto es típico de Navarra?",
                opciones: ["Pimientos del piquillo", "Naranja", "Plátano", "Arroz", "Lechuga"],
                correcta: 0
            }, {
                pregunta: "¿Qué es el pacharán?",
                opciones: ["Queso", "Licor", "Carne", "Pan", "Verdura"],
                correcta: 1
            }, {
                pregunta: "¿Qué río pasa por Navarra?",
                opciones: ["Ebro", "Tajo", "Duero", "Miño", "Segura"],
                correcta: 0
            }, {
                pregunta: "¿Qué tipo de comunidad es Navarra?",
                opciones: ["Estado independiente", "Comunidad Foral", "Provincia francesa", "Isla", "Ciudad"],
                correcta: 1
            }, {
                pregunta: "¿Qué fiesta es famosa en Navarra?",
                opciones: ["San Fermín", "Fallas", "Tomatina", "Carnaval de Cádiz", "Semana Santa Sevilla"],
                correcta: 0
            }, {
                pregunta: "¿Qué actividad es típica en Navarra?",
                opciones: ["Senderismo", "Surf en desierto", "Esquí en playa", "Safari", "Submarinismo urbano"],
                correcta: 0
            }, {
                pregunta: "¿Qué producto lácteo es típico?",
                opciones: ["Queso Roncal", "Cheddar industrial", "Yogur tropical", "Leche en polvo", "Nata dulce"],
                correcta: 0
            }, {
                pregunta: "¿Qué río es importante en Navarra?",
                opciones: ["Ebro", "Nilo", "Amazonas", "Danubio", "Loira"],
                correcta: 0
            }
        ];

        const guardado = sessionStorage.getItem("juego_estado");

        if (guardado) {
            const estado = JSON.parse(guardado);
            this.indice = estado.indice;
            this.puntuacion = estado.puntuacion;
        } else {
            this.indice = 0;
            this.puntuacion = 0;
        }
    }

    guardarEstado() {
        sessionStorage.setItem("juego_estado", JSON.stringify({
            indice: this.indice,
            puntuacion: this.puntuacion
        }));
    }

    iniciar() {

        const main = document.querySelector("main");
        this.seccion = document.createElement("section");

        this.seccion.innerHTML = `
            <h2>Juego de preguntas</h2>
            <h3></h3>
            <p class="info">Responde todas las preguntas para obtener tu puntuación.</p>
            <form></form>
            <button type="button">Siguiente</button>
            <p class="mensaje"></p>
        `;

        main.appendChild(this.seccion);

        this.titulo = this.seccion.querySelector("h3");
        this.info = this.seccion.querySelector(".info");
        this.opciones = this.seccion.querySelector("form");
        this.boton = this.seccion.querySelector("button");
        this.mensaje = this.seccion.querySelector(".mensaje");

        this.boton.addEventListener("click", () => this.siguiente());

        // Si ya había terminado, mostrar resultado directamente
        if (this.indice >= this.preguntas.length) {
            this.finalizar();
        } else {
            this.mostrar();
        }
    }

    mostrar() {

        const p = this.preguntas[this.indice];
        this.titulo.textContent = p.pregunta;
        this.opciones.innerHTML = "";

        p.opciones.forEach((opcion, i) => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "respuesta";
            input.value = i;
            label.appendChild(input);
            label.appendChild(document.createTextNode(" " + opcion));
            this.opciones.appendChild(label);
            this.opciones.appendChild(document.createElement("br"));
        });
    }

    siguiente() {

        const seleccion = document.querySelector("input[name='respuesta']:checked");

        if (!seleccion) {
            this.mensaje.textContent = "Debes seleccionar una respuesta antes de continuar";
            return;
        }

        this.mensaje.textContent = "";

        if (parseInt(seleccion.value) === this.preguntas[this.indice].correcta) {
            this.puntuacion++;
        }

        this.indice++;
        this.guardarEstado(); // guardar tras cada respuesta

        if (this.indice < this.preguntas.length) {
            this.mostrar();
        } else {
            this.finalizar();
        }
    }

    finalizar() {

        sessionStorage.removeItem("juego_estado"); // limpiar al terminar

        this.seccion.innerHTML = "";

        const titulo = document.createElement("h2");
        titulo.textContent = "Resultado final";

        const resultado = document.createElement("p");
        resultado.textContent = `Puntuación: ${this.puntuacion} / ${this.preguntas.length}`;

        const reiniciar = document.createElement("button");
        reiniciar.type = "button";
        reiniciar.textContent = "Jugar de nuevo";
        reiniciar.addEventListener("click", () => {
            this.indice = 0;
            this.puntuacion = 0;
            this.seccion.innerHTML = `
                <h2>Juego de preguntas</h2>
                <h3></h3>
                <p class="info">Responde todas las preguntas para obtener tu puntuación.</p>
                <form></form>
                <button type="button">Siguiente</button>
                <p class="mensaje"></p>
            `;
            this.titulo = this.seccion.querySelector("h3");
            this.opciones = this.seccion.querySelector("form");
            this.boton = this.seccion.querySelector("button");
            this.mensaje = this.seccion.querySelector(".mensaje");
            this.boton.addEventListener("click", () => this.siguiente());
            this.mostrar();
        });

        this.seccion.appendChild(titulo);
        this.seccion.appendChild(resultado);
        this.seccion.appendChild(reiniciar);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Juego().iniciar();
});