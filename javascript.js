function abrirLibro(){

    const libro = document.getElementById("book");
    const intro = document.getElementById("bookIntro");

    libro.classList.add("cerrando");

    setTimeout(() => {

        intro.classList.add("cerrando-todo");

    }, 700);

    setTimeout(() => {

        intro.style.display = "none";
        document.getElementById("contenido").style.display = "block";

    }, 1200);
}

function mostrarSeccion(id){

    const secciones =
    document.querySelectorAll(".seccion");

    secciones.forEach(seccion => {

        seccion.classList.remove("activa");

    });

    document
    .getElementById(id)
    .classList.add("activa");

    // Si hay una lectura en curso, se detiene al cambiar de sección
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        const boton = document.getElementById("botonVoz");
        if (boton) boton.classList.remove("leyendo");
        actualizarEstadoVoz("");
    }
}

// ===== COMANDO DE VOZ =====

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconocimiento = null;

if (SpeechRecognitionAPI) {

    reconocimiento = new SpeechRecognitionAPI();
    reconocimiento.lang = "es-ES";
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;

    reconocimiento.onresult = function(event){

        const texto = event.results[0][0].transcript.toLowerCase();

        if (texto.includes("leer") || texto.includes("lee")) {

            leerSeccionActiva();

        } else if (texto.includes("detener") || texto.includes("para") || texto.includes("silencio")) {

            window.speechSynthesis.cancel();
            document.getElementById("botonVoz").classList.remove("leyendo");
            actualizarEstadoVoz("");

        } else {

            actualizarEstadoVoz("No entendí. Decí \"leer\"");
            setTimeout(() => actualizarEstadoVoz(""), 2500);
        }
    };

    reconocimiento.onerror = function(){

        document.getElementById("botonVoz").classList.remove("escuchando");
        actualizarEstadoVoz("");
    };

    reconocimiento.onend = function(){

        document.getElementById("botonVoz").classList.remove("escuchando");
    };
}

function actualizarEstadoVoz(texto){

    const estado = document.getElementById("estadoVoz");

    if (estado) estado.textContent = texto;
}

function activarComandoVoz(){

    const boton = document.getElementById("botonVoz");

    // Si ya está leyendo, el botón funciona como "detener"
    if (window.speechSynthesis && window.speechSynthesis.speaking) {

        window.speechSynthesis.cancel();
        boton.classList.remove("leyendo");
        actualizarEstadoVoz("");
        return;
    }

    // Si el navegador soporta reconocimiento de voz, escuchamos un comando
    if (reconocimiento) {

        boton.classList.add("escuchando");
        actualizarEstadoVoz("🎙️ Escuchando... decí \"leer\"");

        try {
            reconocimiento.start();
        } catch (e) {
            // ya había una sesión de reconocimiento activa
        }

    } else {

        // Sin soporte de reconocimiento: el botón lee directamente
        leerSeccionActiva();
    }
}

function leerSeccionActiva(){

    const seccionActiva = document.querySelector(".seccion.activa");

    if (!seccionActiva || !window.speechSynthesis) {
        return;
    }

    const tarjetas = seccionActiva.querySelectorAll(".card");
    let texto = "";

    if (tarjetas.length > 0) {

        tarjetas.forEach(tarjeta => {
            texto += tarjeta.innerText + ". ";
        });

    } else {

        texto = seccionActiva.innerText;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-ES";
    utterance.rate = 0.95;

    const boton = document.getElementById("botonVoz");

    utterance.onstart = function(){

        boton.classList.remove("escuchando");
        boton.classList.add("leyendo");
        actualizarEstadoVoz("🔊 Leyendo el tema...");
    };

    utterance.onend = function(){

        boton.classList.remove("leyendo");
        actualizarEstadoVoz("");
    };

    window.speechSynthesis.speak(utterance);
}