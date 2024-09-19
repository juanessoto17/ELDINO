//****** GAME LOOP ********//

var time = new Date(); // Tiempo actual
var deltaTime = 0; // Diferencia de tiempo entre frames

// Inicializa el juego cuando la página esté lista
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(Init, 1); // Llama a Init después de 1 ms
} else {
    document.addEventListener("DOMContentLoaded", Init); // Llama a Init cuando el DOM esté listo
}

// Función de inicialización
function Init() {
    time = new Date(); // Resetea el tiempo
    Start(); // Configura todo
    Loop(); // Inicia el bucle del juego
}

// Función del bucle principal del juego
function Loop() {
    deltaTime = (new Date() - time) / 1000; // Calcula el tiempo desde el último frame
    time = new Date(); // Actualiza el tiempo
    Update(); // Actualiza el estado del juego
    requestAnimationFrame(Loop); // Llama a Loop en el siguiente frame
}

//****** GAME LOGIC ********//

var sueloY = 22; // Posición Y del suelo
var velY = 0; // Velocidad vertical del dinosaurio
var impulso = 900; // Fuerza de salto+
var gravedad = 2500; // Gravedad

var dinoPosX = 42; // Posición X del dinosaurio
var dinoPosY = sueloY; // Posición Y del dinosaurio

var sueloX = 0; // Posición X del suelo
var velEscenario = 1280 / 3; // Velocidad del suelo
var gameVel = 1; // Velocidad del juego
var score = 0; // Puntuación

var parado = false; // Estado del juego
var agachado = false//estado de agachado
var saltando = false; // Estado de salto
var muerto = false; // Estado de muerto

var tiempoHastaObstaculo = 2; // Tiempo para el próximo obstáculo
var tiempoObstaculoMin = 0.7; // Tiempo mínimo entre obstáculos
var tiempoObstaculoMax = 1.8; // Tiempo máximo entre obstáculos
var obstaculoPosY = 16; // Posición Y de los obstáculos
var obstaculos = []; // Array de obstáculos

var tiempoHastaNube = 0.5; // Tiempo para la próxima nube
var tiempoNubeMin = 0.7; // Tiempo mínimo entre nubes
var tiempoNubeMax = 2.7; // Tiempo máximo entre nubes
var maxNubeY = 270; // Altura máxima de las nubes
var minNubeY = 100; // Altura mínima de las nubes
var nubes = []; // Array de nubes
var velNube = 0.5; // Velocidad de las nubes

var contenedor; // Elemento contenedor
var dino; // Elemento dinosaurio
var textoScore; // Elemento de puntuación
var suelo; // Elemento del suelo
var gameOver; // Elemento de fin del juego

// Inicializa los elementos y eventos
function Start() {//llamamos tadas laas acciones que querenis q pasen al iniciar el juego
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    document.addEventListener("keydown", HandleKeyDown); // Escucha teclas
    document.addEventListener("keyup", HandleKeyUp);
}

// Actualiza el estado del juego
function Update() {//llamamos durante cada frame(si el juego esta parado no actualizamos durante cada frame)
    if (parado) return; // Si el juego está parado, no actualiza nada

    MoverDinosaurio(); // Mueve el dinosaurio
    MoverSuelo(); // Mueve el suelo
    DecidirCrearObstaculos(); // Decide si crear un obstáculo
    DecidirCrearNubes(); // Decide si crear una nube
    MoverObstaculos(); // Mueve los obstáculos
    MoverNubes(); // Mueve las nubes
    DetectarColision(); // Verifica colisiones

    velY -= gravedad * deltaTime; // Aplica gravedad
}

// Maneja la tecla presionada
function HandleKeyDown(ev) {
    if (ev.keyCode == 32) {
        Saltar(); // Salta si se presiona la barra espaciadora
    }
    if (ev.keyCode == 40) {
        Agacharse(); // Se agacha si se presiona flecha abajo.
    }
}

function HandleKeyUp(ev){
    if (ev.keyCode == 40) {
        DejaDeAgacharse();
    }
}

// Hace que el dinosaurio salte
function Saltar() {
    if (dinoPosY == sueloY & !agachado) {
        saltando = true;
        velY = impulso; // Aplica impulso
        dino.classList.remove("dino-corriendo"); // Detiene la animación de correr
    }
}

function Agacharse() {
    if (saltando) {
        gravedad = 8000
    }
    if (!muerto) {
        agachado = true;
        dino.classList.remove("dino-corriendo");
        dino.classList.add("dino-agachado");
    }
}

function DejaDeAgacharse() {
    agachado = false; //Resetea el estado de agachado
    if (!muerto) {
        dino.classList.add("dino-corriendo"); // Reanuda la animación de correr
    }
    dino.classList.remove("dino-agachado");
}

// Mueve el dinosaurio según su velocidad vertical
function MoverDinosaurio() {
    dinoPosY += velY * deltaTime;//pa q el dino le afecte la gravedad
    if (dinoPosY < sueloY) {
        TocarSuelo(); // Ajusta la posición si toca el suelo
    }
    dino.style.bottom = dinoPosY + "px"; // Actualiza la posición
}

// Ajusta la posición del dinosaurio al tocar el suelo
function TocarSuelo() {
    dinoPosY = sueloY;
    velY = 0; // Detiene el movimiento vertical(si esta en el suelo ya no pasa de ahi y la gravedad no afect)
    if (!saltando & !agachado) {
        dino.classList.add("dino-corriendo"); // Reanuda la animación de correr
    }
    saltando = false; // Resetea el estado de salto
    gravedad = 2500; // Resetea la gravedad por si se agacho en el aire
}

// Mueve el suelo
function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

// Calcula cuánto se desplaza el suelo
function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;//calculamos ve desp depende del puntaje
}

// Maneja la colisión del dinosaurio
function Estrellarse() {
    dino.classList.remove("dino-corriendo");
    dino.classList.remove("dino-agachado");
    dino.classList.add("dino-estrellado");
    parado = true; // Detiene el juego
    muerto = true;
}

// Decide si crear un nuevo obstáculo
function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if (tiempoHastaObstaculo <= 0) {
        CrearObstaculo(); // Crea un nuevo obstáculo
    }
}

// Decide si crear una nueva nube
function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if (tiempoHastaNube <= 0) {
        CrearNube(); // Crea una nueva nube
    }
}

// Crea un nuevo obstáculo y lo agrega al juego
function CrearObstaculo() {
    var obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if (Math.random() > 0.4) obstaculo.classList.add("cactus2");
    if (Math.random() > 0.8) {
        obstaculo.classList.add("pajaro");
        obstaculo.style.bottom = 80 + "px";
        if (Math.random() > 0.5) obstaculo.style.bottom = 30 + "px";
    } 

    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth + "px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / gameVel;
}//para q un obsta no se ponga sobre otro

// Crea una nueva nube y la agrega al juego
function CrearNube() {
    var nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth + "px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px";
    
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel;
}

// Mueve los obstáculos en el juego
function MoverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
        if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);//cada q re reumeve se suma 1 al score y movemos todo a la izq como el piso
            GanarPuntos(); // Gana puntos si se elimina un obstáculo
        } else {
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX + "px";//no hasalido de pantalla
        }
    }
}

// Mueve las nubes en el juego
function MoverNubes() {
    for (var i = nubes.length - 1; i >= 0; i--) {
        if (nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        } else {
            nubes[i].posX -= CalcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX + "px";
        }
    }
}

// Aumenta la puntuación y ajusta la velocidad del juego
function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    if (score == 10) {
        gameVel = 1.2;
        contenedor.classList.add("mediodia");
    } else if (score == 20) {
        gameVel = 1.5;
        contenedor.classList.add("tarde");
    } else if (score == 30) {
        gameVel = 2;
        contenedor.classList.add("noche");
    }
    suelo.style.animationDuration = (3 / gameVel) + "s";//definimos la duracion de la animacion del suelo
}

// Maneja el fin del juego
function GameOver() {
    Estrellarse();
    gameOver.style.display = "block";//muestra texto gameOver
}

// Detecta si el dinosaurio colisiona con algún obstáculo
function DetectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
        if (obstaculos[i].posX > dinoPosX + dino.clientWidth) {
            // Si el obstáculo está fuera del rango de colisión
            break; // No hay más colisiones posibles
        } else {
            if (IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {//distancias de tolerancia
                GameOver(); // Fin del juego si hay colisión
            }
        }
    }
}

// Verifica si dos elementos colisionan
function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}
