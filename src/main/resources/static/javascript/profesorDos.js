import {updateUsoPersonaje, updateUsoObjeto, updateObjeto, updatePregunta, updateRespuesta, onGetTasks, updateTask, saveBD, onGetTasksBD, idBD, updateTaskBD, documentosEstudiantes, deleteTaskJugadorActual, deleteTask, docChatActuales, docChatZActuales, deleteTaskChat, deleteTaskChatZ, docEstudiantesActuales} from './firebase.js'
import { getDocs} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";

//Variable para dividir a los alumnos entre los equipos humano y zombie
let equipo = "humano"
//Variable para saber cuantos alumnos hay
let contador = 0
//Variable para guardar los IDs de los alumnos
let alumnos = []
//Si es cero, es que no hay ninguna partida
let comprobadorPartida = 0
// Array para saber las casillas donde están los objetos
let arrayObj = []

//FUNCION ENCARGADA DE OBTENER LAS SIETE CASILLAS ALEATORIAS PARA LA DISTRIBUCION DE LOS OBJETOS

function generarObjetos(){
    let contador = 0
    while(contador < 7){
        let contiene = false
        let valorAux = Math.floor(Math.random() * (106 - 1) + 1)
        if(valorAux == 105){
            valorAux = 115
        } 
        if(contador == 0){
            arrayObj.push(valorAux)
        }else{
            arrayObj.forEach((numero) => {
                if(numero == valorAux){
                    contiene = true
                }
            })
            if(contiene == false){
                arrayObj.push(valorAux)
            }
        }
        contador = arrayObj.length
    }
}

generarObjetos()

async function reiniciarPartida(){ 
    updateTaskBD(idBD, {numAlumnos : 0, jugadoresActuales : [], alumnos : [], posHumano : 46, posZombie : 46, objetosHumanos : [false, false, false, false, false, false, false], objetosZombies : [false, false, false, false, false, false, false], partidaEnJuego : false, equipoEstudiante : "humano", diasJugados : 0, idTurno : "", equipoHumano : [], equipoZombie : [], preguntas : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ,18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 39, 44, 47, 50], haRespondido : false, tipoPregunta: "", posObjetos : arrayObj, idTurnoAnterior : "", partidaNueva : true})
    const estudiantes = await getDocs(documentosEstudiantes)
    estudiantes.forEach((estudiante) => {
        deleteTask(estudiante.id)
    })
    docChatActuales.forEach((chat) => {
        deleteTaskChat(chat.id)
    })
    docChatZActuales.forEach((chat) => {
        deleteTaskChatZ(chat.id)
    })
    docEstudiantesActuales.forEach((estudiante) => {
        deleteTaskJugadorActual(estudiante.id)
    })
    updateObjeto("amplificador", {activo : false, equipo : "", id : "", respuesta : ""})
    updateObjeto("botiquin", {activo : false, jugador : "", id : "", respuesta : ""})
    updateObjeto("medalla", {jugador : ""})
    updateObjeto("monedas", {activo : false, equipo : "", id : "", respuesta : "", jugador : ""})
    updateObjeto("movil", {activo : false, equipo : ""})
    updateObjeto("pegamento", {equipo : ""})
    updateObjeto("vitaminas", {equipo : "", turnos : 0})
    updateObjeto("vitaminasZ", {equipo : "", turnos : 0})

    updatePregunta("7LsaJmUMUKmhu3f0JUAO", {id : "", pregunta : "", tipo : ""})
    updateRespuesta("XevQjS0IcDVoxSVyxDr4", {id : "", resultado : ""})

    updateUsoObjeto("objetos", {booleano : [false, false, false, false, false, false, false]})
    updateUsoPersonaje("personajes", {personajes : [false, false, false, false, false, false]})
}

document.getElementById('interrogacion').onclick = function(){
    document.getElementById("modalInterrogacion").style.visibility = "visible"
}

document.getElementById('cerrarInterrogacion').onclick = function(){
    document.getElementById("modalInterrogacion").style.visibility = "hidden"
} 

document.getElementById('play').onclick = function() {
    dividirEquipos() 
} 

document.getElementById('jugar').onclick = function() {
    dividirEquipos()
} 

document.getElementById('reiniciar').onclick = function(){
    document.getElementById("preguntaReinicio").style.visibility = "visible"
    document.getElementById("reiniciar").style.visibility = "hidden"
    document.getElementById("usuarios").style.visibility = "hidden"
    document.getElementById("play").style.visibility = "hidden"
}

document.getElementById('no').onclick = function(){
    document.getElementById("preguntaReinicio").style.visibility = "hidden"
    document.getElementById("reiniciar").style.visibility = "visible"
    document.getElementById("usuarios").style.visibility = "visible"
    document.getElementById("play").style.visibility = "visible"
}

document.getElementById('si').onclick = function(){
    document.getElementById("preguntaReinicio").style.visibility = "hidden"
    document.getElementById("confirmacionReincio").style.visibility = "visible"
    reiniciarPartida()
}

document.getElementById('aceptar').onclick = function(){
    document.getElementById("reiniciar").style.visibility = "visible"
    document.getElementById("usuarios").style.visibility = "visible"
    document.getElementById("play").style.visibility = "visible"
    document.getElementById("confirmacionReincio").style.visibility = "hidden"
}

//FUNCION ENCARGADA DE DIVIDIR A LOS JUGADORES EN DOS EQUIPOS

function dividirEquipos(){

    onGetTasks((querySnapshot) => {   //Cada vez que se produzca un cambio, actualizamos los datos
        querySnapshot.forEach((doc) => {    //Listamos los datos
            if(equipo == "humano"){
                equipo = "zombie"
            }else{
                equipo = "humano"
            }
            contador++
            const task = doc.data()  //Con data-id = ... Guardamos en el boton con la variable id la id del dato en la base de datos          
            updateTask(doc.id, {equipo : equipo})
            alumnos.push(doc.id)
            aux = "hola"
        });                    
    })
   
    onGetTasksBD((querySnapshot) => {   //Cada vez que se produzca un cambio, actualizamos los datos
        querySnapshot.forEach((doc) => {    
            comprobadorPartida++    //Si ya hay una partida en la base de datos, aumentamos en uno el comprobador
        });
        if(comprobadorPartida == 0){
            saveBD(contador, alumnos, 46, 46, [false, false, false, false, false, false, false], [false, false, false, false, false, false, false], false, "humano", "", [], [])
        }
        window.location.href = "tablero.html?profesor=true" 
    })
    
}