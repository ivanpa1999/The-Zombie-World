import {usoObjetosDocumento, usoPersonajesDocumento, onGetUsoObjeto, onGetUsoPersonaje, updateUsoObjeto, updateUsoPersonaje, vitaminasZDocumento, updateObjeto, onGetObjeto, amplificadorDocumento, monedasDocumento, movilDocumento, vitaminasDocumento, updateTask, idPregunta, idRespuesta, docRefe, pregunta, updateRespuesta, onGetRespuesta, saveTaskChatZ, onGetPregunta, onGetTasksChat, docEstudiantes, saveTaskChat, onGetTasks, onGetTasksBD, updateTaskBD, saveJugadoresActuales, docRef, documentosEstudiantes, onGetTasksChatZ, updatePregunta} from './firebase.js'
import { getDoc, getDocs} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";  //IMPORTAR LOS METODOS DE LA BASE DE DATOS DE FIREBASE

var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)

const coleccion = ["pantallaJugadores", "pantallaObjetos", "pantallaChat", "ventanaPersonajes", "pantallaInterrogacion"]
const todasPreguntas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ,18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 39, 44, 47, 50]
const todosPersonsajes = ["personaje1Texto", "personaje2Texto", "personaje3Texto", "personaje4Texto", "personaje5Texto", "personaje6Texto"]
const todosObjetos = ["confirmacionMovil", "confirmacionVitaminas", "confirmacionPegamento", "confirmacionAmplificador", "confirmacionMonedas", "confirmacionBotiquin"]
const usoObjetos = ["Movil", "Medalla", "Vitaminas", "Pegamento", "Amplificador", "Monedas", "Botiquin"]
const usoPersonajes = ["ComisarioFred", "PilotoBrus", "Emy", "Lix", "Jow", "Sargento"]
const objetosTexto = ["objeto1Texto", "objeto2Texto", "objeto3Texto", "objeto4Texto", "objeto5Texto", "objeto6Texto", "objeto7Texto"]

//Variable para saber si ha accedido un profesor o un alumno
var profesor = urlParams.get('profesor')
var idEstudiante = urlParams.get('estudianteID')
let valor = 0

let equipoZombie
let equipoHumano

//Variable para poder cerrar la pregunta
let valorPregunta

let idBD = "c2HU0emMDxdqb6kdJkT4"

let valorOculto = 1
let activado = true
let pausa = false
let intAct = true
let turno = "humano"    //Variable que dice de quien es el turno, va cambiando por cada movimiento
let turnoAux
let posElegida = 0
let preguntasDisponibles 
let partidaEnJuego = false
let jugadoresJugando

//Variables para mostrar los objetos que tienen los diferentes equipos
let objetos = ["movil", "medalla", "vitaminas", "pegamento", "amplificador", "monedas", "botiquin"]
let objetosHumanos 
let objetosZombies 

//Variable para bloquear la tirada
let tirada = false

let posZombie = 46
let posHumano = 46

let posicionesNegras = []
let posicionesBlancas = []

// Variable para guardar el chat
let mensajesChat = []
// Variable para saber si el chat esta abierto
let chatAbierto = false
// Variable para saber si un usuario es profesor
let esProfesor = false
// Variable que guarda el id del jugador que le toca en ese momento
let idTurno
//Variable que guarda las posibles opciones de casillas a las que moverse
let casillas = []


//BOTONES

const dado1 = document.getElementById("dado1")
const dado2 = document.getElementById("dado2")
const dado3 = document.getElementById("dado3")
const dado4 = document.getElementById("dado4")
const dado5 = document.getElementById("dado5")
const dado6 = document.getElementById("dado6")

const personaje1 = document.getElementById("personaje1")
const personaje2 = document.getElementById("personaje2")
const personaje3 = document.getElementById("personaje3")
const personaje4 = document.getElementById("personaje4")
const personaje5 = document.getElementById("personaje5")
const personaje6 = document.getElementById("personaje6")

const botonObjetos = document.getElementById("botonObjetos")
const botonJugadores = document.getElementById("botonJugadores")
const botonChat = document.getElementById("botonChat")

//CONTENEDORES QUE CARGAN A LOS USUARIOS EN LOS DIFERENTES EQUIPOS
const taskHumano = document.getElementById("task-humano")
const taskZombie = document.getElementById("task-zombie")

//CONTENEDOR PARA EL CHAT
const taskChat = document.getElementById("task-chat")

//CONTENEDOR PARA NUEVO TURNO
const taskTurno = document.getElementById("task-turno")

//CONTENEDOR PARA LA FUNCIONALIDAD DE LOS OBJETOS
const taskAmplificador = document.getElementById("contenedorAmplificador")
const taskMonedas = document.getElementById("contenedorMonedas")

//CONTENEDORES DEL PERFIL DE USUARIO
const taskTop = document.getElementById("task-top")
const taskPerfil = document.getElementById("task-perfil")

//CONTENEDORES DE PERSONAJES ESPECIALES
const taskEmy = document.getElementById("contenedorEmy")
const taskJow = document.getElementById("contenedorJow")

//CONTENEDORES PARA QUE EL PROFESOR REPARTA LOS PERSONAJES ESPECIALES
const taskPersonajes = document.getElementById("task-seleccionerPersonajes")

const estudiantes = await getDocs(documentosEstudiantes)

// FUNCION PARA CERRAR LAS DEMAS PESTAÑAS CUANDO ABRES UNA

function cerrarResto(modal, coleccion){
   coleccion.forEach((icono) => {
       if(icono != modal){
           document.getElementById(icono).style.visibility = "hidden"
       }
   })
}

// FUNCION PARA CERRAR UNA PESTAÑA AL PULSAR FUERA DE ESTA

function cerrarPestana(id){
   $("html").click(function(){
      var obj = $(id);
      if (!obj.is(event.target) && !obj.has(event.target).length) {
         document.getElementById(id).style.visibility = "hidden"
      }
   });
}

//FUNCION PARA RELLENAR LOS DOS EQUIPOS

async function rellenarEquipos(){
   const partida = await getDoc(docRef)
   const task = partida.data()
   equipoZombie = task.equipoZombie
   equipoHumano = task.equipoHumano
   return task.turno
}

async function subirEquipos(){
   const partida = await getDoc(docRef)
   const task = partida.data()
   let jugadoresActuales = task.jugadoresActuales
   let equipoHumano = []
   let equipoZombie = []
   const estudiantes = await getDocs(documentosEstudiantes)
   estudiantes.forEach((doc) => {
      let equipo = doc.data().equipo
      if(equipo == "humano" && jugadoresActuales.includes(doc.id)){
         equipoHumano.push(doc.id)
      }
      if(equipo == "zombie" && jugadoresActuales.includes(doc.id)){
         equipoZombie.push(doc.id)
      }
   })
   updateTaskBD(idBD, {equipoHumano : equipoHumano, equipoZombie : equipoZombie})
}

onGetTasksBD((querySnapshot) => {   
   querySnapshot.forEach(async (doc) => {    
         const task = doc.data()  
         if(doc.partidaEnJuego){
            mensajeNuevoTurno(task.partidaEnJuego)
         }
         if(task.turno != turnoAux){
            turnoAux = task.turno
            mensajeNuevoTurno(task.partidaEnJuego)
         }
         // COLOCAR LAS POSICIONES
         posHumano = task.posHumano
         posZombie = task.posZombie
         turno = task.turno
         moverFichasComienzo(posHumano, posZombie)
         // COLOCAR OBJETOS
         objetosHumanos = task.objetosHumanos
         objetosZombies = task.objetosZombies 
         colocarObjetos()   
         // PREGUNATS DISPONIBLES
         preguntasDisponibles = task.preguntasDisponibles 
         // ACTUALIZAR PUNTOS DE LOS OBJETOS
         task.posObjetos.forEach((num) => {
            colocarPuntoNegro(num)
         })  
         // PARA SABER SI UN USUARIO HA RESPONDIDO A UNA PREGUNTA
         if(task.haRespondido && esProfesor){
            const pregunta = await getDoc(docRefe);
            document.getElementById("confirmacionRespuesta").style.visibility = "visible"
            let numero = pregunta.data().pregunta
            document.getElementById(numero).style.visibility = "visible"
         }
         if(task.haRespondido == false){
            if(task.tipoPregunta == "grupal"){
               ocultarGrupales()
            }else{
               ocultarIndividuales()
            } 
         }
         if(task.haRespondido == false && esProfesor){
            mensajeNuevoTurno()
         }            
   });
})

turnoAux = rellenarEquipos()

function vaciarEquipos(){
   let equipoHumano = []
   let equipoZombie = []
   updateTaskBD(idBD, {equipoHumano : equipoHumano, equipoZombie : equipoZombie})
}

//FUNCION PARA LOS TURNOS

function comprobadorPlay(partidaEnJuego) {  //FUNCION PARA QUE GIRE EL DADO SOLO
   if(partidaEnJuego == false)
      setTimeout(comprobadorPlay, 2000);
   else{
      mensajeNuevoTurno()
   }
}

if(activado)
   setTimeout(comprobadorPlay, 2000)

function actualizarTurno(turnoEquipo, eqHum, eqZom){
   if(turnoEquipo == "humano"){
      let equipoHumano = eqHum
      let aux = equipoHumano[0]   
      let longitud = equipoHumano.length
      if(longitud != 1){
         for(let i = 0; i < longitud-1; i++){
            equipoHumano[i] = equipoHumano[i+1]
         }
         equipoHumano[longitud] = aux
         idTurno = equipoHumano[0]
         equipoHumano.shift()
      }else{
         idTurno = equipoHumano[0]
      }
      
      updateTaskBD(idBD, {idTurno : idTurno, equipoHumano : equipoHumano})
      mensajeNuevoTurno()
   }else{
      let equipoZombie = eqZom
      let aux = equipoZombie[0]
      let longitud = equipoZombie.length
      if(longitud != 1){
         for(let i = 0; i < longitud-1; i++){
            equipoZombie[i] = equipoZombie[i+1]
         }
         equipoZombie[longitud] = aux
         idTurno = equipoZombie[0] 
         equipoZombie.shift()
      }else{
         idTurno = equipoZombie[0]
      }      
      updateTaskBD(idBD, {idTurno : idTurno, equipoZombie : equipoZombie})
      mensajeNuevoTurno()
   } 
}

async function mensajeNuevoTurno(){
   const estudiantes = await getDocs(documentosEstudiantes)
   const partida = await getDoc(docRef)
   const task = partida.data()
   let enJuego = task.partidaEnJuego
   if(enJuego){
      let turnoEquipo = task.turno
      let nombre = ""
      let id = task.idTurno
      estudiantes.forEach((doc) => {
         if(id == doc.id){
            nombre = doc.data().nombre
         }
      })
      document.getElementById("pantallaNuevoTurno").style.visibility = "visible"
      cerrarPestana("pantallaNuevoTurno")
      let html= `<p class = 'chatTurno' id = 'equipoTurno'> Es el turno del equipo:`
      if(turnoEquipo == "humano"){
         html+= `&nbsp LA RESISTENCIA`
      }else{
         html+=`&nbsp ZOMBIE`
      }
      html+=`<br></p><p class = 'chatTurno' id = 'jugadorTurno'> Estudiante: ${nombre} es tu turno.`
      taskTurno.innerHTML = html
   }
}

//SI EL USUARIO ES PROFESOR

if (profesor == "true"){
   document.getElementById("play").style.visibility = "visible"
   esProfesor = true
}

async function repartirComisarioFred(equipoHumano){
   const estudiantes = await getDocs(documentosEstudiantes)
   let equipoZombie = []
   let equipoPosible = []
   let html = ''
   taskPersonajes.innerHTML = html
   let nombrePosible = []

   estudiantes.forEach((doc) => {
      let task = doc.data()
      if(task.equipo == "zombie"){
         equipoZombie.push(doc.id)
      }
   })

   estudiantes.forEach((doc) => {
      let task = doc.data()
      if(task.personaje == "" && equipoHumano.includes(doc.id)){
         equipoPosible.push(doc.id)
         nombrePosible.push(task.nombre)
      }
   })

   let contador = 0
   html+= `<p class = 'repartirPersonajesEspeciales'> Selecciona el jugador que va a recibir al personaje Comisario Fred <p>`
   equipoPosible.forEach((estudiante) => {
      html+=`<div>
               <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombrePosible[contador]} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
            </div>
      `
      contador++
   })
   taskPersonajes.innerHTML = html

   const botones = taskPersonajes.querySelectorAll('.boton-jugador')
   botones.forEach(btn => {
      btn.addEventListener('click', ({target : {dataset}}) => {
         estudiantes.forEach((estudiante) => {
            if(estudiante.id == dataset.id){        
               updateTask(estudiante.id, {personaje : "Comisario Fred"})
               repartirPilotoBrus(equipoHumano, equipoZombie)
            }
         })
         html = ''
         taskPersonajes.innerHTML = html
      })
   })
}

async function repartirPilotoBrus(equipoHumano, equipoZombie){
   const estudiantes = await getDocs(documentosEstudiantes)
   let equipoPosible = []
   let html = ''
   taskPersonajes.innerHTML = html
   let nombrePosible = []
   estudiantes.forEach((doc) => {
      let task = doc.data()
      if(task.personaje == "" && equipoHumano.includes(doc.id)){
         equipoPosible.push(doc.id)
         nombrePosible.push(task.nombre)
      }
   })

   let contador = 0
   html+= `<p class = 'repartirPersonajesEspeciales'> Selecciona el jugador que va a recibir al personaje Piloto Brus <p>`
   equipoPosible.forEach((estudiante) => {
      html+=`<div>
               <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombrePosible[contador]} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
            </div>
      `
      contador++
   })
   taskPersonajes.innerHTML = html

   const botones = taskPersonajes.querySelectorAll('.boton-jugador')
   botones.forEach(btn => {
      btn.addEventListener('click', ({target : {dataset}}) => {
         estudiantes.forEach((estudiante) => {
            if(estudiante.id == dataset.id){        
               updateTask(estudiante.id, {personaje : "Piloto Brus"})
               repartirEmy(equipoHumano, equipoZombie)
            }
         })
         html = ''
         taskPersonajes.innerHTML = html
      })
   })
}

async function repartirEmy(equipoHumano, equipoZombie){
   const estudiantes = await getDocs(documentosEstudiantes)
   let equipoPosible = []
   let html = ''
   taskPersonajes.innerHTML = html
   let nombrePosible = []
   estudiantes.forEach((doc) => {
      let task = doc.data()
      if(task.personaje == "" && equipoHumano.includes(doc.id)){
         equipoPosible.push(doc.id)
         nombrePosible.push(task.nombre)
      }
   })

   let contador = 0
   html+= `<p class = 'repartirPersonajesEspeciales'> Selecciona el jugador que va a recibir al personaje Emy <p>`
   equipoPosible.forEach((estudiante) => {
      html+=`<div>
               <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombrePosible[contador]} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
            </div>
      `
      contador++
   })
   taskPersonajes.innerHTML = html

   const botones = taskPersonajes.querySelectorAll('.boton-jugador')
   botones.forEach(btn => {
      btn.addEventListener('click', ({target : {dataset}}) => {
         estudiantes.forEach((estudiante) => {
            if(estudiante.id == dataset.id){        
               updateTask(estudiante.id, {personaje : "Emy"})
               repartirLix(equipoZombie)
            }
         })
         html = ''
         taskPersonajes.innerHTML = html
      })
   })
}

async function repartirLix(equipoZombie){
   const estudiantes = await getDocs(documentosEstudiantes)
   let equipoPosible = []
   let html = ''
   taskPersonajes.innerHTML = html
   let nombrePosible = []
   estudiantes.forEach((doc) => {
      let task = doc.data()
      if(task.personaje == "" && equipoZombie.includes(doc.id)){
         equipoPosible.push(doc.id)
         nombrePosible.push(task.nombre)
      }
   })

   let contador = 0
   html+= `<p class = 'repartirPersonajesEspeciales'> Selecciona el jugador que va a recibir al personaje Srta. Lix <p>`
   equipoPosible.forEach((estudiante) => {
      html+=`<div>
               <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombrePosible[contador]} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
            </div>
      `
      contador++
   })
   taskPersonajes.innerHTML = html

   const botones = taskPersonajes.querySelectorAll('.boton-jugador')
   botones.forEach(btn => {
      btn.addEventListener('click', ({target : {dataset}}) => {
         estudiantes.forEach((estudiante) => {
            if(estudiante.id == dataset.id){        
               updateTask(estudiante.id, {personaje : "Srta. Lix"})
               repartirJow(equipoZombie)
            }
         })
         html = ''
         taskPersonajes.innerHTML = html
      })
   })
}

async function repartirJow(equipoZombie){
   const estudiantes = await getDocs(documentosEstudiantes)
   let equipoPosible = []
   let html = ''
   taskPersonajes.innerHTML = html
   let nombrePosible = []
   estudiantes.forEach((doc) => {
      let task = doc.data()
      if(task.personaje == "" && equipoZombie.includes(doc.id)){
         equipoPosible.push(doc.id)
         nombrePosible.push(task.nombre)
      }
   })

   let contador = 0
   html+= `<p class = 'repartirPersonajesEspeciales'> Selecciona el jugador que va a recibir al personaje Dr. Jow <p>`
   equipoPosible.forEach((estudiante) => {
      html+=`<div>
               <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombrePosible[contador]} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
            </div>
      `
      contador++
   })
   taskPersonajes.innerHTML = html

   const botones = taskPersonajes.querySelectorAll('.boton-jugador')
   botones.forEach(btn => {
      btn.addEventListener('click', ({target : {dataset}}) => {
         estudiantes.forEach((estudiante) => {
            if(estudiante.id == dataset.id){        
               updateTask(estudiante.id, {personaje : "Dr. Jow"})
               repartirSargentoDelis(equipoZombie)
            }
         })
         html = ''
         taskPersonajes.innerHTML = html
      })
   })
}

async function repartirSargentoDelis(equipoZombie){
   const estudiantes = await getDocs(documentosEstudiantes)
   let equipoPosible = []
   let html = ''
   taskPersonajes.innerHTML = html
   let nombrePosible = []
   estudiantes.forEach((doc) => {
      let task = doc.data()
      if(task.personaje == "" && equipoZombie.includes(doc.id)){
         equipoPosible.push(doc.id)
         nombrePosible.push(task.nombre)
      }
   })

   let contador = 0
   html+= `<p class = 'repartirPersonajesEspeciales'> Selecciona el jugador que va a recibir al personaje Sargento Delis <p>`
   equipoPosible.forEach((estudiante) => {
      html+=`<div>
               <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombrePosible[contador]} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
            </div>
      `
      contador++
   })
   taskPersonajes.innerHTML = html

   const botones = taskPersonajes.querySelectorAll('.boton-jugador')
   botones.forEach(btn => {
      btn.addEventListener('click', ({target : {dataset}}) => {
         estudiantes.forEach((estudiante) => {
            if(estudiante.id == dataset.id){        
               updateTask(estudiante.id, {personaje : "Sargento Delis"})
            }
         })
         html = ''
         taskPersonajes.innerHTML = html
         document.getElementById("pantallaSeleccionarPersonajes").style.visibility = "hidden"
      })
   })
   
   
}

document.getElementById('play').onclick = async function() {      
   document.getElementById("pausa").style.visibility = "visible"
   document.getElementById("play").style.visibility = "hidden"
   const partida = await getDoc(docRef)
   const task = partida.data()
   jugadoresJugando = task.jugadoresActuales
   let dias = task.diasJugados
   dias++
   const equipoHumano  = task.equipoHumano
   const equipoZombie = task.equipoZombie
   idTurno = equipoHumano[0]
   if(idTurno == ""){
      idTurno = equipoHumano[equipoHumano.length-1]
   }
   if(task.partidaNueva){
      repartirComisarioFred(equipoHumano)
      updateTaskBD(idBD, {partidaNueva : false})
   }
   saveJugadoresActuales(jugadoresJugando, dias)
   partidaEnJuego = true
   updateTaskBD(idBD, {partidaEnJuego : partidaEnJuego, diasJugados : dias})
   subirEquipos()
   rellenarEquipos()
   if(turno == "humano"){
      actualizarTurno("humano", equipoHumano, equipoZombie)
   }else{
      actualizarTurno("zombie", equipoHumano, equipoZombie)
   }
   updateTaskBD(idBD, {idTurno : idTurno})
   mensajeNuevoTurno()
}

document.getElementById('pausa').onclick = async function() {      
   document.getElementById("pausa").style.visibility = "hidden"
   document.getElementById("play").style.visibility = "visible"
   const partida = await getDoc(docRef)
   const task = partida.data()
   jugadoresJugando = task.jugadoresActuales
   for(let i = 0; i < jugadoresJugando.length; i++){
      docEstudiantes.forEach((doc) => {
         let alumnoID = doc.id
         let diasAlumno = doc.data().dias
         if(jugadoresJugando[i] == alumnoID){
            diasAlumno++
            updateTask(alumnoID, {dias : diasAlumno})
         }
      })
   }
   let jugadoresActuales = []
   partidaEnJuego = false
   updateTaskBD(idBD, {jugadoresActuales : jugadoresActuales, turno : turno, objetosHumanos : objetosHumanos, objetosZombies : objetosZombies, partidaEnJuego : partidaEnJuego, posHumano : posHumano, posZombie : posZombie})
   vaciarEquipos()
}

//PERFIL DEL USUARIO CUANDO NO ES EL PROFESOR

async function cargarTop(){
   const partida = await getDoc(docRef)
   const task = partida.data()
   if(task.partidaNueva == false){
      let arrayEstudiantes = []
   docEstudiantes.forEach((doc) => {
      arrayEstudiantes.push(doc.data())
   })
   arrayEstudiantes.sort(function (a, b){
      return b.puntos - a.puntos
   })
   let html = '<p id = top>'
   for(let i = 0; i <= 2; i++){
      html+= (i + 1) + `. ` + arrayEstudiantes[i].nombre + `<br>&nbsp&nbsp&nbsp&nbsp` + arrayEstudiantes[i].puntos + ` puntos<br>&nbsp;&nbsp;&nbsp;&nbsp;Equipo : ` 
      if(arrayEstudiantes[i].equipo == "humano"){
         html+=` La resistencia<br></p>`
      }else{
         html+= `Zombies<br></p>`
      }
   }
   taskTop.innerHTML = html
   }
}

function cargarPerfil(){
   let html = `<p id = "perfilUsuario">`
   docEstudiantes.forEach((doc) => {
      if(doc.id == idEstudiante){
         let datos = doc.data()
         html+= `&nbspNombre: ` + datos.nombre + " <br> &nbspPuntos: " + datos.puntos + "<br> &nbspEquipo :"
         if(datos.equipo == "humano"){
            html+= ` La resistencia</p>`
         }else{
            html+= ` Zombies<br></p>`
         }
         
         switch(datos.personaje){
            case "Srta. Lix":
               html+= `<a><img src="css/imagenes/lix.png" id="lix"></a>`
            break;
            case "Emy":
               html+= `<a><img src="css/imagenes/emy.png" id="emy"></a>`
            break
            case "Dr. Jow":
               html+= `<a><img src="css/imagenes/jow.png" id="jow"></a>`
            break;
            case "Piloto Brus":
               html+= `<a><img src="css/imagenes/piloto.png" id="brus"></a>`
            break;
            case "Sargento Delis":
               html+= `<a><img src="css/imagenes/delis.png" id="delis"></a>`
            break;
            case "Comisario Fred":
               html+= `<a><img src="css/imagenes/comisarioFred.png" id="fred"></a>`
            break;
         }
         taskPerfil.innerHTML = html
      }
   })
}

//CÓDIGO QUE SE EJECUTAN AL CARGAR LA PÁGINA

function repeatingFunc() {  //FUNCION PARA QUE GIRE EL DADO SOLO
   let valorAux = Math.floor(Math.random() * (7 - 1) + 1)
   if(!activado){
      valor = valorAux
   }
   girarDado(valorOculto)
   valorOculto = valorAux
   dado(valorAux)
   if(activado)
      setTimeout(repeatingFunc, 400);
}

if(activado)
   setTimeout(repeatingFunc, 400)

//FUNCIONES DE USO GENERAL

function mostrar(nombre){
   document.getElementById(nombre).style.visibility = "visible";
}

function ocultar(nombre){
   document.getElementById(nombre).style.visibility = "hidden";
}

function desactivarDados(){
   dado1.disabled = true
   dado2.disabled = true
   dado3.disabled = true
   dado4.disabled = true
   dado5.disabled = true
   dado6.disabled = true
}

function activarDados(){
   dado1.disabled = false
   dado2.disabled = false
   dado3.disabled = false
   dado4.disabled = false
   dado5.disabled = false
   dado6.disabled = false 
}

function desactivarBotones(){
   desactivarDados()
   botonObjetos.disabled = true
   botonJugadores.disabled = true
   botonChat.disabled = true
   intAct = false
   pausa = true
}

function activarBotones(){
   activarDados() 
   botonObjetos.disabled = false
   botonJugadores.disabled = false
   botonChat.disabled = false
   intAct = true
   pausa = false
}

//FUNCIONAMIENTO DEL DADO

function cambiarDado(){
   let valorAux = Math.floor(Math.random() * (7 - 1) + 1)
   if(!activado){
      valor = valorAux
   }
   dado(valorAux)
}

function girarDado(numero){
   ocultar("dado" + numero)
}

//FUNCIONES QUE UTILIZAN LA BASE DE DATOS DE LA PARTIDA

function cargarPosObjetos(posiciones){
   let posObjetos = posiciones
   posObjetos.forEach((num) => {
      colocarPuntoNegro(num)
   })
}

function cargarObjetos(objH, objZ){
   objetosHumanos = objH
   objetosZombies = objZ 
   colocarObjetos() 
}

function cargarPreguntas(preguntas){
   preguntasDisponibles = preguntas 
}

function cargarPosiciones(pH, pZ, turnoActual){
   posHumano = pH
   posZombie = pZ
   turno = turnoActual
   moverFichasComienzo(posHumano, posZombie)
}

async function cargarDatosInicio(){
   const partida = await getDoc(docRef)
   const task = partida.data()
   idTurno = task.idTurno
   const objH = task.objetosHumanos
   const objZ = task.objetosZombies
   const preguntas = task.preguntasDisponibles 
   const pH = task.posHumano
   const pZ = task.posZombie
   const turno = task.turno
   const posObjetos = task.posObjetos
   
   cargarPosiciones(pH, pZ, turno)   
   cargarPosObjetos(posObjetos)
   cargarObjetos(objH, objZ)
   cargarPreguntas(preguntas)
   cargarTop()
   if(esProfesor != "true"){
      cargarPerfil()
   }
}

window.onload = cargarDatosInicio()

//FUNCION DE APOYO AL DADO

function apoyo(milliseconds){
   var start = new Date().getTime();
   var end=0;
   while( (end-start) < milliseconds){
       end = new Date().getTime();
   }
}

function ocultarTodos(){
   ocultar("dado1")
   ocultar("dado2")
   ocultar("dado3")
   ocultar("dado4")
   ocultar("dado5")
   ocultar("dado6")
}

function ocultarTodosE(){
   ocultar("dado1E")
   ocultar("dado2E")
   ocultar("dado3E")
   ocultar("dado4E")
   ocultar("dado5E")
   ocultar("dado6E")
}

//FUNCION QUE REALIZA LA ACCIÓN DEPENDIENDO QUE NÚMERO SALGA EN LA TIRADA

function dado(numero){
   mostrar("dado" + numero)
   if(!activado){    
      let numeros = [1, 2, 3, 4, 5, 6]
      numeros.forEach((num) => {
         if(num != numero){
            ocultar("dado" + num)
         }
      })
      if(tirada == false){  
         let aux = Math.floor(Math.random() * (7 - 1) + 1)     
         if(turno == "humano"){     
            tirada = true
            apoyo(500)
            mostrar("dado" + aux + "E")
            elegirPosicion(aux, posHumano, numero)
         }else{
            apoyo(500)
            tirada = true
            mostrar("dado" + aux + "E")
            elegirPosicion(aux, posZombie, numero)
         }
      }   
   }     
}

async function dadoImagen(imagen){
   const partida = await getDoc(docRef)
   const task = partida.data()
   partidaEnJuego = task.partidaEnJuego  
   idTurno = task.idTurno
   if(!pausa && tirada == false && partidaEnJuego && esProfesor == false && idTurno == idEstudiante){
      ocultar(imagen)
      activado = false
      cambiarDado()
   }
}

document.getElementById('dado1').onclick = function() { 
   dadoImagen("dado1")
}

document.getElementById('dado2').onclick = function() { 
   dadoImagen("dado2")
}

document.getElementById('dado3').onclick = function() {   
   dadoImagen("dado3")
}

document.getElementById('dado4').onclick = function() {  
   dadoImagen("dado4")
}

document.getElementById('dado5').onclick = function() { 
   dadoImagen("dado5")
}

document.getElementById('dado6').onclick = function() {  
   dadoImagen("dado6")
}

//OBJETOS

function colocarObjetos(){
   let aux = (document.getElementById("pantallaObjetos").style.visibility == "visible")
   for(let i = 0; i < 7; i++){
      if(aux){
         document.getElementById(objetos[i] + "H").style.visibility = "visible"
      }    
   }
}

document.getElementById('botonObjetos').onclick = function() {
   document.getElementById("pantallaObjetos").style.visibility = "visible"
   cerrarResto("pantallaObjetos", coleccion)
   colocarObjetos()
   desactivarBotones()
}

document.getElementById('aceptarObjetos').onclick = function() {
   document.getElementById("pantallaObjetos").style.visibility = "hidden"
   document.getElementById("aceptarObjetosTexto").style.visibility = "hidden"
   for(let i = 0; i < objetos.length; i++){
      document.getElementById(objetos[i] + "H").style.visibility = "hidden"
      document.getElementById(objetos[i] + "Z").style.visibility = "hidden"
   }
   activarBotones()
}

document.getElementById('aceptarObjetosTexto').onclick = function() {
   document.getElementById("aceptarObjetosTexto").style.visibility = "hidden"
   for(let i = 1; i < 8; i++){
      document.getElementById("objeto" + i + "Texto").style.visibility = "hidden"
      document.getElementById("objeto" + i + "Texto").style.position = "absolute"
   }
   activarBotones()
}

function verObjetos(numero){
   cerrarResto("objeto" + numero, objetosTexto)
   document.getElementById("aceptarObjetosTexto").style.visibility = "visible"
   document.getElementById("pantallaObjetos").style.visibility = "visible"
   document.getElementById("objeto" + numero + "Texto").style.visibility = "visible"
   document.getElementById("objeto" + numero + "Texto").style.position = "absolute"
   desactivarBotones() 
}

//INTERROGACION

document.getElementById('interrogacion').onclick = function() {
      document.getElementById("pantallaInterrogacion").style.visibility = "visible"
      cerrarResto("pantallaInterrogacion", coleccion)
      desactivarBotones()
}

document.getElementById('aceptarInterrogacion').onclick = function() {
   document.getElementById("pantallaInterrogacion").style.visibility = "hidden"
   activarBotones()
}

//PERSONAJES

document.getElementById('personajesBoton').onclick = function() {
   document.getElementById("ventanaPersonajes").style.visibility = "visible"
   cerrarResto("ventanaPersonajes", coleccion)
}

document.getElementById('cerrarPersonajes').onclick = function() {
   document.getElementById("ventanaPersonajes").style.visibility = "hidden"
   document.getElementById("pantallaPersonajes").style.visibility = "hidden"
}

function verPersonaje(numero){
   cerrarResto("personaje" + numero, todosPersonsajes)
   document.getElementById("pantallaPersonajes").style.visibility = "visible"
   document.getElementById("personaje" + numero + "Texto").style.visibility = "visible"
   document.getElementById("personaje" + numero + "Texto").style.position = "absolute"
   desactivarBotones() 
}

document.getElementById('personaje1').onclick = function() {
   verPersonaje(1)
}

document.getElementById('personaje2').onclick = function() {
   verPersonaje(2)
}

document.getElementById('personaje3').onclick = function() {
   verPersonaje(3)  
}

document.getElementById('personaje4').onclick = function() {
   verPersonaje(4)
}

document.getElementById('personaje5').onclick = function() {
   verPersonaje(5)
}

document.getElementById('personaje6').onclick = function() {
   verPersonaje(6)
}

document.getElementById('aceptarPersonajes').onclick = function() {
   document.getElementById("pantallaPersonajes").style.visibility = "hidden"
   for(let i = 1; i < 7; i++){
      document.getElementById("personaje" + i + "Texto").style.visibility = "hidden"
      document.getElementById("personaje" + i + "Texto").style.position = "absolute"
   }
   activarBotones()
}

//VER JUGADORES

document.getElementById('botonJugadores').onclick = function() {
   cerrarResto("pantallaJugadores", coleccion)
   document.getElementById("pantallaJugadores").style.visibility = "visible"
   let equipoZombie = []
   let equipoHumano = []
   let equipoZombiePersonajes = []
   let equipoHumanoPersonajes = []
   let htmlHumano = `<p class = 'estudianteTask' id = 'taskHumano'>`
   let htmlZombie = `<p class = 'estudianteTask' id = 'taskZombie'>`
   onGetTasks((querySnapshot) => {   //Cada vez que se produzca un cambio, actualizamos los datos
      querySnapshot.forEach((doc) => {    //Listamos los datos
         const task = doc.data() 
         const nombreAlumno = task.nombre 
         const personajeAlumno = task.personaje
         const puntos = task.puntos
         let estudiante = {nombreAlumno : nombreAlumno, puntos : puntos}
         let personajePuntos = {personajeAlumno : personajeAlumno, puntos : puntos}
         if(task.equipo == "humano"){
              equipoHumano.push(estudiante)
              equipoHumanoPersonajes.push(personajePuntos)
          }else{
              equipoZombie.push(estudiante)
              equipoZombiePersonajes.push(personajePuntos)
          }                   
      }); 

      equipoHumano.sort(function (a, b){
         return b.puntos - a.puntos
      })

      equipoHumanoPersonajes.sort(function (a, b){
         return b.puntos - a.puntos
      })

      equipoZombie.sort(function (a, b){
         return b.puntos - a.puntos
      })

      equipoZombiePersonajes.sort(function (a, b){
         return b.puntos - a.puntos
      })

      for(let i = 0; i < equipoHumano.length; i++){
         htmlHumano+=`${equipoHumano[i].nombreAlumno}`
         if(equipoHumanoPersonajes[i].personajeAlumno != ""){
            switch(equipoHumanoPersonajes[i].personajeAlumno){
               case "personaje2":
                  htmlHumano+=`&nbsp -- &nbsp Personaje: &nbsp Emy &nbsp`
               break;
               case "personaje4":
                  htmlHumano+=`&nbsp -- &nbsp Personaje: &nbsp Piloto Brus &nbsp`
               break;
               case "personaje6":
                  htmlHumano+=`&nbsp -- &nbsp Personaje: &nbsp Comisario Fred &nbsp`
               break;
            }
         }
         htmlHumano+=` Puntos: ${equipoHumano[i].puntos}<br>`
      }
      htmlHumano +=`</p>`

      for(let i = 0; i < equipoZombie.length; i++){
         htmlZombie+=`${equipoZombie[i].nombreAlumno}`
         if(equipoZombiePersonajes[i].personajeAlumno != ""){
            switch(equipoZombiePersonajes[i].personajeAlumno){
               case "personaje1":
                  htmlZombie+=`&nbsp -- &nbsp Personaje: &nbsp Srta. Lix &nbsp`
               break;
               case "personaje3":
                  htmlZombie+=`&nbsp -- &nbsp Personaje: &nbsp Dr. Jow &nbsp`
               break;
               case "personaje5":
                  htmlZombie+=`&nbsp -- &nbsp Personaje: &nbsp Sargento Delis &nbsp`
               break;
            }
         }
         htmlZombie+=` Puntos: ${equipoZombie[i].puntos}<br>`
      }
      htmlZombie+= `</p>`

      taskHumano.innerHTML = htmlHumano
      taskZombie.innerHTML = htmlZombie
  })
  
}

document.getElementById('aceptarPersonas').onclick = function() {
   document.getElementById("pantallaJugadores").style.visibility = "hidden"
   activarBotones()
}

// CHAT

document.getElementById('botonChat').onclick = async function(){
   cerrarResto("pantallaChat", coleccion)
   desactivarBotones()

   let chatEquipo = ""
   const estudiantes = await getDocs(documentosEstudiantes)
   
   estudiantes.forEach((doc) => {
   let datos = doc.data()
   if(doc.id == idEstudiante)
      chatEquipo = datos.equipo
   })

   if(profesor == "true"){
      const partida = await getDoc(docRef)
      chatEquipo = partida.turno
   }

   chatAbierto = true
   document.getElementById("pantallaChat").style.visibility = "visible"
   let html= `<p class = 'chatTask'>`

   if(chatEquipo == "humano"){
      onGetTasksChat((querySnapshot) => {   //Cada vez que se produzca un cambio, actualizamos los datos
         querySnapshot.forEach((doc) => {    //Listamos los datos
            const task = doc.data() 
            mensajesChat.push({nombre: task.nombre, mensaje: task.frase, fecha: task.fecha})                
         });
         mensajesChat.sort(function(a, b){
            if(a.fecha < b.fecha){
               return 1
            }
            if(a.fecha > b.fecha){
               return -1
            }
            return 0
         }) 
         if(mensajesChat.length > 18){
            for(let i = 17; i >= 0; i--){
               html+= `<p class = 'lineasChat'>${mensajesChat[i].nombre}:&nbsp${mensajesChat[i].mensaje}</p>`
            }
         }else{
            for(let i = mensajesChat.length-1; i >= 0; i--){
               html+= `<p class = 'lineasChat'>${mensajesChat[i].nombre}:&nbsp${mensajesChat[i].mensaje}</p>`
            }
         }
      
      
         html+= `</p>`
         taskChat.innerHTML = html
         mensajesChat = []
         html = ``
      })
   }

   if(chatEquipo == "zombie"){
      onGetTasksChatZ((querySnapshot) => {   //Cada vez que se produzca un cambio, actualizamos los datos
         querySnapshot.forEach((doc) => {    //Listamos los datos
            const task = doc.data() 
            mensajesChat.push({nombre: task.nombre, mensaje: task.frase, fecha: task.fecha})                
         });
         mensajesChat.sort(function(a, b){
            if(a.fecha < b.fecha){
               return 1
            }
            if(a.fecha > b.fecha){
               return -1
            }
            return 0
         }) 
         if(mensajesChat.length > 18){
            for(let i = 17; i >= 0; i--){
               html+= `<p class = 'lineasChat'>${mensajesChat[i].nombre}:&nbsp${mensajesChat[i].mensaje}</p>`
            }
         }else{
            for(let i = mensajesChat.length-1; i >= 0; i--){
               html+= `<p class = 'lineasChat'>${mensajesChat[i].nombre}:&nbsp${mensajesChat[i].mensaje}</p>`
            }
         }
      
      
         html+= `</p>`
         taskChat.innerHTML = html
         mensajesChat = []
         html = ``
      })
   }

  
}

async function enviarMensaje(){
   let cuadroTexto = document.getElementById('chatIntroducido')
   let texto = cuadroTexto.value
   var hoy = new Date()
   var mes = ( hoy.getMonth() + 1 ).toString()
   var dia = hoy.getDate().toString()
   var hora = hoy.getHours().toString()
   var minuto = hoy.getMinutes().toString()
   var segundo = hoy.getSeconds().toString()

   let chatEquipo = ""
   let nombre = ""
   const estudiantes = await getDocs(documentosEstudiantes)
   
   estudiantes.forEach((doc) => {
   let datos = doc.data()
   if(doc.id == idEstudiante)
      chatEquipo = datos.equipo
      nombre = datos.nombre
   })

   if(dia.length == 1){
      dia = "0" + dia
   }
   if(mes.length == 1){
      mes = "0" + mes
   }
   if(hora.length == 1){
      hora = "0" + hora
   }
   if(minuto.length == 1){
      minuto = "0" + minuto
   }
   if(segundo.length == 1){
      segundo = "0" + segundo
   }

   var fecha = hoy.getFullYear().toString() + mes + dia
   var hora = hora + minuto + segundo
   var fechaYHora = fecha +  hora

   if(chatEquipo == "humano"){
      saveTaskChat(nombre, texto, fechaYHora)
   }
   if(chatEquipo == "zombie"){
      saveTaskChatZ(nombre, texto, fechaYHora)
   }
   cuadroTexto.value = ""
}

document.addEventListener('keydown', (event) => {
   if (event.which == 13 && chatAbierto) {
      event.preventDefault()
      enviarMensaje()
   }
})

document.getElementById('botonEnviarChat').onclick = function(){
   enviarMensaje()
}

document.getElementById('cerrarChat').onclick = function(){
   activarBotones()
   chatAbierto = false
   document.getElementById("pantallaChat").style.visibility = "hidden"
}

//MOVER FICHAS

//FUNCION QUE SE ENCARGA DE DECIR SI LAS DOS FICHAS SE ENCUENTRAN EN LA MISMA POSICION

function comprobarZH(){
   if(posHumano == posZombie){
      return true
   }else{
      return false
   }
}

//FUNCIONES ENCARGADAS DE MOVER LAS FICHAS

function moverFichasComienzo(humano, zombie){
   switch(humano){
      case 1:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "21.5%"
            document.getElementById("fichaHumano").style.top = "94%"
         }else{
            moverFichasIguales(1)
         }
         break;
      case 2:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "19%"
            document.getElementById("fichaHumano").style.top = "91%"
         }else{
            moverFichasIguales(2)
         }
         break;
      case 3:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "16.6%"
            document.getElementById("fichaHumano").style.top = "87.8%"

         }else{
            moverFichasIguales(3)
         }
         break;
      case 4:
            if(comprobarZH() == false){
                  document.getElementById("fichaHumano").style.left = "16.6%"
                  document.getElementById("fichaHumano").style.top = "80.9%"
            }else{
               moverFichasIguales(4)
            }
            break;
      case 5:
            if(comprobarZH() == false){
               document.getElementById("fichaHumano").style.left = "18.5%"
               document.getElementById("fichaHumano").style.top = "75.5%"
            }else{
               moverFichasIguales(5)
            }
            break;
      case 6:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.8%"
            document.getElementById("fichaHumano").style.top = "72%"
         }else{
            moverFichasIguales(6)
         }
         break;
      case 7:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.2%"
            document.getElementById("fichaHumano").style.top = "69%"
         }else{
            moverFichasIguales(7)
         }
         break;
      case 8:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.2%"
            document.getElementById("fichaHumano").style.top = "62.2%"
         }else{
            moverFichasIguales(8)
         }
         break;
      case 9:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.9%"
            document.getElementById("fichaHumano").style.top = "59%"
         }else{
            moverFichasIguales(9)
         }
         break;
      case 10:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "18.5%"
            document.getElementById("fichaHumano").style.top = "55.8%"
         }else{
            moverFichasIguales(10)
         }
         break;
      case 11:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "18.5%"
            document.getElementById("fichaHumano").style.top = "49.1%"
         }else{
            moverFichasIguales(11)
         }
         break;
      case 12:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "18.5%"
            document.getElementById("fichaHumano").style.top = "42.4%"
         }else{
            moverFichasIguales(12)
         }
         break;
      case 13:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.85%"
            document.getElementById("fichaHumano").style.top = "39.5%"
         }else{
            moverFichasIguales(13)
         }
         break;
      case 14:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.85%"
            document.getElementById("fichaHumano").style.top = "46%"
         }else{
            moverFichasIguales(14)
            }
         break;
      case 15:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.2%"
            document.getElementById("fichaHumano").style.top = "49%"
         }else{
            moverFichasIguales(15)
         }
         break;
      case 16:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.2%"
            document.getElementById("fichaHumano").style.top = "36.5%"
         }else{
            moverFichasIguales(16)
         }
         break;
      case 17:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "25.6%"
            document.getElementById("fichaHumano").style.top = "33.6%"
         }else{
            moverFichasIguales(17)
         }
         break;
      case 18:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "25.6%"
            document.getElementById("fichaHumano").style.top = "27%"
         }else{
            moverFichasIguales(18)
         }
         break;
      case 19:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "25.6%"
            document.getElementById("fichaHumano").style.top = "20.5%"
         }else{
            moverFichasIguales(19)
         }
         break;
      case 20:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.3%"
            document.getElementById("fichaHumano").style.top = "23.5%"
         }else{
            moverFichasIguales(20)
         }
         break;
      case 21:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.9%"
            document.getElementById("fichaHumano").style.top = "26.5%"
         }else{
            moverFichasIguales(21)
         }
         break;
      case 22:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "25.6%"
            document.getElementById("fichaHumano").style.top = "14%"
         }else{
            moverFichasIguales(22)
         }
         break;
      case 23:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.2%"
            document.getElementById("fichaHumano").style.top = "11%"
         }else{
            moverFichasIguales(23)
         }
         break;
      case 24:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.9%"
            document.getElementById("fichaHumano").style.top = "7.5%"
         }else{
            moverFichasIguales(24)
         }
         break;
      case 25:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "28%"
            document.getElementById("fichaHumano").style.top = "11%"
         }else{
            moverFichasIguales(25)
         }
         break;
      case 26:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "30.5%"
            document.getElementById("fichaHumano").style.top = "14%"
         }else{
            moverFichasIguales(26)
         }
         break;
      case 27:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "32.8%"
            document.getElementById("fichaHumano").style.top = "17%"
         }else{
            moverFichasIguales(27)
         }
         break;
      case 28:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "35.1%"
            document.getElementById("fichaHumano").style.top = "20.2%"
         }else{
            moverFichasIguales(28)
         }
         break;
      case 29:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "35.1%"
            document.getElementById("fichaHumano").style.top = "27%"
         }else{
            moverFichasIguales(29)
         }
         break;
      case 30:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "35.1%"
            document.getElementById("fichaHumano").style.top = "34%"
         }else{
            moverFichasIguales(30)
         }
         break;
      case 31:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "25.6%"
            document.getElementById("fichaHumano").style.top = "52%"
         }else{
            moverFichasIguales(31)
         }
         break;
      case 32:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "27.9%"
            document.getElementById("fichaHumano").style.top = "48.5%"
         }else{
            moverFichasIguales(32)
         }
         break;
      case 33:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "30.4%"
            document.getElementById("fichaHumano").style.top = "45.4%"
         }else{
            moverFichasIguales(33)
         }
         break;
      case 34:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "37.5%"
            document.getElementById("fichaHumano").style.top = "30.8%"
         }else{
            moverFichasIguales(34)
         }
         break;
      case 35:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "39.9%"
            document.getElementById("fichaHumano").style.top = "27.8%"
         }else{
            moverFichasIguales(35)
         }
         break;
      case 36:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "42.4%"
            document.getElementById("fichaHumano").style.top = "30.8%"
         }else{
            moverFichasIguales(36)
         }
         break;
      case 37:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "44.8%"
            document.getElementById("fichaHumano").style.top = "27.8%"
         }else{
            moverFichasIguales(37)
         }
         break;
      case 38:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47%"
            document.getElementById("fichaHumano").style.top = "24%"
         }else{
            moverFichasIguales(38)
         }
         break;
      case 39:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "37.4%"
            document.getElementById("fichaHumano").style.top = "37.8%"
         }else{
            moverFichasIguales(39)
         }
         break;
      case 40:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "39.6%"
            document.getElementById("fichaHumano").style.top = "41.5%"
         }else{
            moverFichasIguales(40)
         }
         break;
      case 41:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "42.2%"
            document.getElementById("fichaHumano").style.top = "44%"
         }else{
            moverFichasIguales(41)
         }
         break;
      case 42:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "44.6%"
            document.getElementById("fichaHumano").style.top = "47%"
         }else{
            moverFichasIguales(42)
         }
         break;
      case 43:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "32.9%"
            document.getElementById("fichaHumano").style.top = "48%"
         }else{
            moverFichasIguales(43)
         }
         break;
      case 44:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "35.4%"
            document.getElementById("fichaHumano").style.top = "50.9%"
         }else{
            moverFichasIguales(44)
         }
         break;
      case 45:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "37.7%"
            document.getElementById("fichaHumano").style.top = "47%"
         }else{
            moverFichasIguales(45)
         }
         break;
      case 46:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47%"
            document.getElementById("fichaHumano").style.top = "50%"
         }else{
            moverFichasIguales(46)
         }
         break;
      case 47:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "49.5%"
            document.getElementById("fichaHumano").style.top = "47%"
         }else{
            moverFichasIguales(47)
         }
         break;
      case 48:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "51.7%"
            document.getElementById("fichaHumano").style.top = "43.2%"
         }else{
            moverFichasIguales(48)
         }
         break;
      case 49:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "54.1%"
            document.getElementById("fichaHumano").style.top = "40.3%"
         }else{
            moverFichasIguales(49)
         }
         break;
      case 50:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.5%"
            document.getElementById("fichaHumano").style.top = "37.5%"
         }else{
            moverFichasIguales(50)
         }
         break;
      case 51:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.5%"
            document.getElementById("fichaHumano").style.top = "31%"
         }else{
            moverFichasIguales(51)
         }
         break;
      case 52:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.5%"
            document.getElementById("fichaHumano").style.top = "24.5%"
         }else{
            moverFichasIguales(52)
         }
         break;
      case 53:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.5%"
            document.getElementById("fichaHumano").style.top = "18.1%"
         }else{
            moverFichasIguales(53)
         }
         break;
      case 54:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.5%"
            document.getElementById("fichaHumano").style.top = "11.5%"
         }else{
            moverFichasIguales(54)
         }
         break;
      case 55:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "54.2%"
            document.getElementById("fichaHumano").style.top = "8%"
         }else{
            moverFichasIguales(55)
         }
         break;
      case 56:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "51.8%"
            document.getElementById("fichaHumano").style.top = "11.5%"
         }else{
            moverFichasIguales(56)
         }
         break;
      case 57:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "49.5%"
            document.getElementById("fichaHumano").style.top = "8%"
         }else{
            moverFichasIguales(57)
         }
         break;
      case 58:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47.2%"
            document.getElementById("fichaHumano").style.top = "11.5%"
         }else{
            moverFichasIguales(58)
         }
         break;
      case 59:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "44.8%"
            document.getElementById("fichaHumano").style.top = "8%"
         }else{
            moverFichasIguales(59)
         }
         break;
      case 60:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "42.4%"
            document.getElementById("fichaHumano").style.top = "11.5%"
         }else{
            moverFichasIguales(60)
         }
         break;
      case 61:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "40%"
            document.getElementById("fichaHumano").style.top = "8%"
         }else{
            moverFichasIguales(61)
         }
         break;
      case 62:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "58.8%"
            document.getElementById("fichaHumano").style.top = "8%"
         }else{
            moverFichasIguales(62)
         }
         break;
      case 63:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "61.1%"
            document.getElementById("fichaHumano").style.top = "11.5%"
         }else{
            moverFichasIguales(63)
         }
         break;
      case 64:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "63.3%"
            document.getElementById("fichaHumano").style.top = "8%"
         }else{
            moverFichasIguales(64)
         }
         break;
      case 65:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "65.5%"
            document.getElementById("fichaHumano").style.top = "11.5%"
         }else{
            moverFichasIguales(65)
         }
         break;
      case 66:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "67.7%"
            document.getElementById("fichaHumano").style.top = "8%"
         }else{
            moverFichasIguales(66)
         }
         break;
      case 67:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "70%"
            document.getElementById("fichaHumano").style.top = "11.5%"
         }else{
            moverFichasIguales(67)
         }
         break;
      case 68:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "58.8%"
            document.getElementById("fichaHumano").style.top = "34%"
         }else{
            moverFichasIguales(68)
         }
         break;
      case 69:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "61.2%"
            document.getElementById("fichaHumano").style.top = "36.8%"
         }else{
            moverFichasIguales(69)
         }
         break;
      case 70:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "63.6%"
            document.getElementById("fichaHumano").style.top = "34%"
         }else{
            moverFichasIguales(70)
         }
         break;
      case 71:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "54%"
            document.getElementById("fichaHumano").style.top = "47%"
         }else{
            moverFichasIguales(71)
         }
         break;
      case 72:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.2%"
            document.getElementById("fichaHumano").style.top = "51%"
         }else{
            moverFichasIguales(72)
         }
         break;
      case 73:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "60.8%"
            document.getElementById("fichaHumano").style.top = "43.5%"
         }else{
            moverFichasIguales(73)
         }
         break;
      case 74:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "58.5%"
            document.getElementById("fichaHumano").style.top = "47%"
         }else{
            moverFichasIguales(74)
         }
         break;
      case 75:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.2%"
            document.getElementById("fichaHumano").style.top = "57.6%"
         }else{
            moverFichasIguales(75)
         }
         break;
      case 76:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "58.7%"
            document.getElementById("fichaHumano").style.top = "60.5%"
         }else{
            moverFichasIguales(76)
         }
         break;
      case 77:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "61%"
            document.getElementById("fichaHumano").style.top = "64%"
         }else{
            moverFichasIguales(77)
         }
         break;
      case 78:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "63.3%"
            document.getElementById("fichaHumano").style.top = "67%"
         }else{
            moverFichasIguales(78)
         }
         break;
      case 79:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "65.7%"
            document.getElementById("fichaHumano").style.top = "64%"
         }else{
            moverFichasIguales(79)
         }
         break;
      case 80:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "68.2%"
            document.getElementById("fichaHumano").style.top = "66.5%"
         }else{
            moverFichasIguales(80)
         }
         break;
      case 81:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "70.5%"
            document.getElementById("fichaHumano").style.top = "63%"
         }else{
            moverFichasIguales(81)
         }
         break;
      case 82:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "61.1%"
            document.getElementById("fichaHumano").style.top = "70.6%"
         }else{
            moverFichasIguales(82)
         }
         break;
      case 83:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "58.8%"
            document.getElementById("fichaHumano").style.top = "73.5%"
         }else{
            moverFichasIguales(83)
         }
         break;
      case 84:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47%"
            document.getElementById("fichaHumano").style.top = "56.5%"
         }else{
            moverFichasIguales(84)
         }
         break;
      case 85:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47%"
            document.getElementById("fichaHumano").style.top = "63.2%"
         }else{
            moverFichasIguales(85)
         }
         break;
      case 86:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47%"
            document.getElementById("fichaHumano").style.top = "70%"
         }else{
            moverFichasIguales(86)
         }
         break;
      case 87:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "49.1%"
            document.getElementById("fichaHumano").style.top = "73%"
         }else{
            moverFichasIguales(87)
         }
         break;
      case 88:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "51.5%"
            document.getElementById("fichaHumano").style.top = "76%"
         }else{
            moverFichasIguales(88)
         }
         break;
      case 89:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "54%"
            document.getElementById("fichaHumano").style.top = "78.25%"
         }else{
            moverFichasIguales(89)
         }
         break;
      case 90:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.45%"
            document.getElementById("fichaHumano").style.top = "76%"
         }else{
            moverFichasIguales(90)
         }
         break;
      case 91:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "46%"
            document.getElementById("fichaHumano").style.top = "76.5%"
         }else{
            moverFichasIguales(91)
         }
         break;
      case 92:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "40.5%"
            document.getElementById("fichaHumano").style.top = "80%"
         }else{
            moverFichasIguales(92)
         }
         break;
      case 93:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "39.5%"
            document.getElementById("fichaHumano").style.top = "73%"
         }else{
            moverFichasIguales(93)
         }
         break;
      case 94:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "37.4%"
            document.getElementById("fichaHumano").style.top = "69%"
         }else{
            moverFichasIguales(94)
         }
         break;
      case 95:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "37.4%"
            document.getElementById("fichaHumano").style.top = "62.4%"
         }else{
            moverFichasIguales(95)
         }
         break;
      case 96:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "35.5%"
            document.getElementById("fichaHumano").style.top = "57.5%"
         }else{
            moverFichasIguales(96)
         }
         break;
      case 97:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "73.1%"
            document.getElementById("fichaHumano").style.top = "66.5%"
         }else{
            moverFichasIguales(97)
         }
      break;
      case 98:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "73.1%"
            document.getElementById("fichaHumano").style.top = "73.2%"
         }else{
            moverFichasIguales(98)
         }
      break;
      case 99:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "75.3%"
            document.getElementById("fichaHumano").style.top = "76.9%"
         }else{
            moverFichasIguales(99)
         }
      break;
      case 100:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "66.1%"
            document.getElementById("fichaHumano").style.top = "37%"
         }else{
            moverFichasIguales(100)
         }
      break;
      case 101:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "68.4%"
            document.getElementById("fichaHumano").style.top = "33.5%"
         }else{
            moverFichasIguales(101)
         }
      break;
      case 102:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "70.8%"
            document.getElementById("fichaHumano").style.top = "36.6%"
         }else{
            moverFichasIguales(102)
         }
      break;
      case 103:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "73.2%"
            document.getElementById("fichaHumano").style.top = "33.5%"
         }else{
            moverFichasIguales(103)
         }
      break;
      case 104:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "75.6%"
            document.getElementById("fichaHumano").style.top = "36.6%"
         }else{
            moverFichasIguales(104)
         }
      break;
      case 105:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "80.6%"
            document.getElementById("fichaHumano").style.top = "36.6%"
         }else{
            moverFichasIguales(105)
         }
      break;
      case 106:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "30.6%"
            document.getElementById("fichaHumano").style.top = "35%"
         }else{
            moverFichasIguales(106)
         }
      break;
      case 107:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "27.6%"
            document.getElementById("fichaHumano").style.top = "70%"
         }else{
            moverFichasIguales(107)
         }
      break;
      case 108:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "51.6%"
            document.getElementById("fichaHumano").style.top = "24%"
         }else{
            moverFichasIguales(108)
         }
      break;
      case 109:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "36%"
            document.getElementById("fichaHumano").style.top = "8%"
         }else{
            moverFichasIguales(109)
         }
      break;
      case 110:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "79.5%"
            document.getElementById("fichaHumano").style.top = "85%"
         }else{
            moverFichasIguales(110)
         }
      break;
      case 111:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "74.5%"
            document.getElementById("fichaHumano").style.top = "11%"
         }else{
            moverFichasIguales(111)
         }
      break;
      case 112:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "16%"
            document.getElementById("fichaHumano").style.top = "10%"
         }else{
            moverFichasIguales(112)
         }
      break;
      case 113:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "16%"
            document.getElementById("fichaHumano").style.top = "30%"
         }else{
            moverFichasIguales(113)
         }
      break;
      case 114:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "26.5%"
            document.getElementById("fichaHumano").style.top = "92%"
         }else{
            moverFichasIguales(114)
         }
      break;
      case 115:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "43.5%"
            document.getElementById("fichaHumano").style.top = "80%"
         }else{
            moverFichasIguales(115)
         }
      break;
   }
   switch(zombie){
      case 1:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "21.5%"
            document.getElementById("fichaZombie").style.top = "94%"
         }else{
            moverFichasIguales(1)
         }
         break;
      case 2:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "19%"
            document.getElementById("fichaZombie").style.top = "91%"
         }else{
            moverFichasIguales(2)
         }
         break;
      case 3:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "16.6%"
            document.getElementById("fichaZombie").style.top = "87.8%"
         }else{
            moverFichasIguales(3)
         }
         break;
      case 4:
            if(comprobarZH() == false){
                  document.getElementById("fichaZombie").style.left = "16.6%"
                  document.getElementById("fichaZombie").style.top = "80.9%"
               }else{
                  moverFichasIguales(4)
               }
               break;
      case 5:
            if(comprobarZH() == false){
               document.getElementById("fichaZombie").style.left = "18.5%"
               document.getElementById("fichaZombie").style.top = "75.5%"
            }else{
               moverFichasIguales(5)
            }
            break;
      case 6:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.8%"
            document.getElementById("fichaZombie").style.top = "72%"
         }else{
            moverFichasIguales(6)
         }
         break;
      case 7:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.2%"
            document.getElementById("fichaZombie").style.top = "69%"
         }else{
            moverFichasIguales(7)
         }
         break;
      case 8:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.2%"
            document.getElementById("fichaZombie").style.top = "62.2%"
         }else{
            moverFichasIguales(8)
         }
         break;
      case 9:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.9%"
            document.getElementById("fichaZombie").style.top = "59%"
         }else{
            moverFichasIguales(9)
         }
         break;
      case 10:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "18.5%"
            document.getElementById("fichaZombie").style.top = "55.8%"
         }else{
            moverFichasIguales(10)
         }
         break;
      case 11:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "18.5%"
            document.getElementById("fichaZombie").style.top = "49.1%"
         }else{
            moverFichasIguales(11)
         }
         break;
      case 12:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "18.5%"
            document.getElementById("fichaZombie").style.top = "42.4%"
         }else{
            moverFichasIguales(12)
         }
         break;
      case 13:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.85%"
            document.getElementById("fichaZombie").style.top = "39.5%"
         }else{
            moverFichasIguales(13)
         }
         break;
      case 14:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.85%"
            document.getElementById("fichaZombie").style.top = "46%"
         }else{
            moverFichasIguales(14)
         }
         break;
      case 15:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.2%"
            document.getElementById("fichaZombie").style.top = "49%"
         }else{
            moverFichasIguales(15)
         }
         break;
      case 16:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.2%"
            document.getElementById("fichaZombie").style.top = "36.5%"
         }else{
            moverFichasIguales(16)
         }
         break;
      case 17:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "25.6%"
            document.getElementById("fichaZombie").style.top = "33.6%"
         }else{
            moverFichasIguales(17)
         }
         break;
      case 18:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "25.6%"
            document.getElementById("fichaZombie").style.top = "27%"
         }else{
            moverFichasIguales(18)
         }
         break;
      case 19:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "25.6%"
            document.getElementById("fichaZombie").style.top = "20.5%"
         }else{
            moverFichasIguales(19)
         }
         break;
      case 20:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.3%"
            document.getElementById("fichaZombie").style.top = "23.5%"
         }else{
            moverFichasIguales(20)
         }
         break;
      case 21:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.9%"
            document.getElementById("fichaZombie").style.top = "26.5%"
         }else{
            moverFichasIguales(21)
         }
         break;
      case 22:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "25.6%"
            document.getElementById("fichaZombie").style.top = "14%"
         }else{
            moverFichasIguales(22)
         }
         break;
      case 23:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.2%"
            document.getElementById("fichaZombie").style.top = "11%"
         }else{
            moverFichasIguales(23)
         }
         break;
      case 24:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.9%"
            document.getElementById("fichaZombie").style.top = "7.5%"
         }else{
            moverFichasIguales(24)
         }
         break;
      case 25:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "28%"
            document.getElementById("fichaZombie").style.top = "11%"
         }else{
            moverFichasIguales(25)
         }
         break;
      case 26:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "30.5%"
            document.getElementById("fichaZombie").style.top = "14%"
         }else{
            moverFichasIguales(26)
         }
         break;
      case 27:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "32.8%"
            document.getElementById("fichaZombie").style.top = "17%"
         }else{
            moverFichasIguales(27)
         }
         break;
      case 28:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "35.1%"
            document.getElementById("fichaZombie").style.top = "20.2%"
         }else{
            moverFichasIguales(28)
         }
         break;
      case 29:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "35.1%"
            document.getElementById("fichaZombie").style.top = "27%"
         }else{
            moverFichasIguales(29)
         }
         break;
      case 30:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "35.1%"
            document.getElementById("fichaZombie").style.top = "34%"
         }else{
            moverFichasIguales(30)
         }
         break;
      case 31:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "25.6%"
            document.getElementById("fichaZombie").style.top = "52%"
         }else{
            moverFichasIguales(31)
         }
         break;
      case 32:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "27.9%"
            document.getElementById("fichaZombie").style.top = "48.5%"
         }else{
            moverFichasIguales(32)
         }
         break;
      case 33:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "30.4%"
            document.getElementById("fichaZombie").style.top = "45.4%"
         }else{
            moverFichasIguales(33)
         }
         break;
      case 34:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "37.5%"
            document.getElementById("fichaZombie").style.top = "30.8%"
         }else{
            moverFichasIguales(34)
         }
         break;
      case 35:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "39.9%"
            document.getElementById("fichaZombie").style.top = "27.8%"
         }else{
            moverFichasIguales(35)
         }
         break;
      case 36:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "42.4%"
            document.getElementById("fichaZombie").style.top = "30.8%"
         }else{
            moverFichasIguales(36)
         }
         break;
      case 37:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "44.8%"
            document.getElementById("fichaZombie").style.top = "27.8%"
         }else{
            moverFichasIguales(37)
         }
         break;
      case 38:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "24%"
         }else{
            moverFichasIguales(38)
         }
         break;
      case 39:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "37.4%"
            document.getElementById("fichaZombie").style.top = "37.8%"
         }else{
            moverFichasIguales(39)
         }
         break;
      case 40:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "39.6%"
            document.getElementById("fichaZombie").style.top = "41.5%"
         }else{
            moverFichasIguales(40)
         }
         break;
      case 41:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "42.2%"
            document.getElementById("fichaZombie").style.top = "44%"
         }else{
            moverFichasIguales(41)
         }
         break;
      case 42:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "44.6%"
            document.getElementById("fichaZombie").style.top = "47%"
         }else{
            moverFichasIguales(42)
         }
         break;
      case 43:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "32.9%"
            document.getElementById("fichaZombie").style.top = "48%"
         }else{
            moverFichasIguales(43)
         }
         break;
      case 44:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "35.4%"
            document.getElementById("fichaZombie").style.top = "50.9%"
         }else{
            moverFichasIguales(44)
         }
         break;
      case 45:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "37.7%"
            document.getElementById("fichaZombie").style.top = "47%"
         }else{
            moverFichasIguales(45)
         }
         break;
      case 46:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "50%"
         }else{
            moverFichasIguales(46)
         }
         break;
      case 47:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "49.5%"
            document.getElementById("fichaZombie").style.top = "47%"
         }else{
            moverFichasIguales(47)
         }
         break;
      case 48:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "51.7%"
            document.getElementById("fichaZombie").style.top = "43.2%"
         }else{
            moverFichasIguales(48)
         }
         break;
      case 49:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "54.1%"
            document.getElementById("fichaZombie").style.top = "40.3%"
         }else{
            moverFichasIguales(49)
         }
         break;
      case 50:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.5%"
            document.getElementById("fichaZombie").style.top = "37.5%"
         }else{
            moverFichasIguales(50)
         }
         break;
      case 51:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.5%"
            document.getElementById("fichaZombie").style.top = "31%"
         }else{
            moverFichasIguales(51)
         }
         break;
      case 52:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.5%"
            document.getElementById("fichaZombie").style.top = "24.5%"
         }else{
            moverFichasIguales(52)
         }
         break;
      case 53:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.5%"
            document.getElementById("fichaZombie").style.top = "18.1%"
         }else{
            moverFichasIguales(53)
         }
         break;
      case 54:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.5%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         }else{
            moverFichasIguales(54)
         }
         break;
      case 55:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "54.2%"
            document.getElementById("fichaZombie").style.top = "8%"
         }else{
            moverFichasIguales(55)
         }
         break;
      case 56:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "51.8%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         }else{
            moverFichasIguales(56)
         }
         break;
      case 57:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "49.5%"
            document.getElementById("fichaZombie").style.top = "8%"
         }else{
            moverFichasIguales(57)
         }
         break;
      case 58:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47.2%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         }else{
            moverFichasIguales(58)
         }
         break;
      case 59:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "44.8%"
            document.getElementById("fichaZombie").style.top = "8%"
         }else{
            moverFichasIguales(59)
         }
         break;
      case 60:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "42.4%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         }else{
            moverFichasIguales(60)
         }
         break;
      case 61:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "40%"
            document.getElementById("fichaZombie").style.top = "8%"
         }else{
            moverFichasIguales(61)
         }
         break;
      case 62:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "58.8%"
            document.getElementById("fichaZombie").style.top = "8%"
         }else{
            moverFichasIguales(62)
         }
         break;
      case 63:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "61.1%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         }else{
            moverFichasIguales(63)
         }
         break;
      case 64:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "63.3%"
            document.getElementById("fichaZombie").style.top = "8%"
         }else{
            moverFichasIguales(64)
         }
         break;
      case 65:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "65.5%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         }else{
            moverFichasIguales(65)
         }
         break;
      case 66:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "67.7%"
            document.getElementById("fichaZombie").style.top = "8%"
         }else{
            moverFichasIguales(66)
         }
         break;
      case 67:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "70%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         }else{
            moverFichasIguales(67)
         }
         break;
      case 68:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "58.8%"
            document.getElementById("fichaZombie").style.top = "34%"
         }else{
            moverFichasIguales(68)
         }
         break;
      case 69:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "61.2%"
            document.getElementById("fichaZombie").style.top = "36.8%"
         }else{
            moverFichasIguales(69)
         }
         break;
      case 70:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "63.6%"
            document.getElementById("fichaZombie").style.top = "34%"
         }else{
            moverFichasIguales(70)
         }
         break;
      case 71:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "54%"
            document.getElementById("fichaZombie").style.top = "47%"
         }else{
            moverFichasIguales(71)
         }
         break;
      case 72:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.2%"
            document.getElementById("fichaZombie").style.top = "51%"
         }else{
            moverFichasIguales(72)
         }
         break;
      case 73:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "60.8%"
            document.getElementById("fichaZombie").style.top = "43.5%"
         }else{
            moverFichasIguales(73)
         }
         break;
      case 74:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "58.5%"
            document.getElementById("fichaZombie").style.top = "47%"
         }else{
            moverFichasIguales(74)
         }
         break;
      case 75:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.2%"
            document.getElementById("fichaZombie").style.top = "57.6%"
         }else{
            moverFichasIguales(75)
         }
         break;
      case 76:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "58.7%"
            document.getElementById("fichaZombie").style.top = "60.5%"
         }else{
            moverFichasIguales(76)
         }
         break;
      case 77:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "61%"
            document.getElementById("fichaZombie").style.top = "64%"
         }else{
            moverFichasIguales(77)
         }
         break;
      case 78:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "63.3%"
            document.getElementById("fichaZombie").style.top = "67%"
         }else{
            moverFichasIguales(78)
         }
         break;
      case 79:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "65.7%"
            document.getElementById("fichaZombie").style.top = "64%"
         }else{
            moverFichasIguales(79)
         }
         break;
      case 80:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "68.2%"
            document.getElementById("fichaZombie").style.top = "66.5%"
         }else{
            moverFichasIguales(80)
         }
         break;
      case 81:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "70.5%"
            document.getElementById("fichaZombie").style.top = "63%"
         }else{
            moverFichasIguales(81)
         }
         break;
      case 82:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "61.1%"
            document.getElementById("fichaZombie").style.top = "70.6%"
         }else{
            moverFichasIguales(82)
         }
         break;
      case 83:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "58.8%"
            document.getElementById("fichaZombie").style.top = "73.5%"
         }else{
            moverFichasIguales(83)
         }
         break;
      case 84:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "56.5%"
         }else{
            moverFichasIguales(84)
         }
         break;
      case 85:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "63.2%"
         }else{
            moverFichasIguales(85)
         }
         break;
      case 86:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "70%"
         }else{
            moverFichasIguales(86)
         }
         break;
      case 87:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "49.1%"
            document.getElementById("fichaZombie").style.top = "73%"
         }else{
            moverFichasIguales(87)
         }
         break;
      case 88:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "51.5%"
            document.getElementById("fichaZombie").style.top = "76%"
         }else{
            moverFichasIguales(88)
         }
         break;
      case 89:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "54%"
            document.getElementById("fichaZombie").style.top = "78.25%"
         }else{
            moverFichasIguales(89)
         }
         break;
      case 90:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.45%"
            document.getElementById("fichaZombie").style.top = "76%"
         }else{
            moverFichasIguales(90)
         }
         break;
      case 91:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "46%"
            document.getElementById("fichaZombie").style.top = "76.5%"
         }else{
            moverFichasIguales(91)
         }
         break;
      case 92:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "40.5%"
            document.getElementById("fichaZombie").style.top = "80%"
         }else{
            moverFichasIguales(92)
         }
         break;
      case 93:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "39.5%"
            document.getElementById("fichaZombie").style.top = "73%"
         }else{
            moverFichasIguales(93)
         }
         break;
      case 94:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "37.4%"
            document.getElementById("fichaZombie").style.top = "69%"
         }else{
            moverFichasIguales(94)
         }
         break;
      case 95:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "37.4%"
            document.getElementById("fichaZombie").style.top = "62.4%"
         }else{
            moverFichasIguales(95)
         }
         break;
      case 96:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "35.5%"
            document.getElementById("fichaZombie").style.top = "57.5%"
         }else{
            moverFichasIguales(96)
         }
         break;
      case 97:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "73.1%"
            document.getElementById("fichaZombie").style.top = "66.5%"
         }else{
            moverFichasIguales(97)
         }
      break;
      case 98:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "73.1%"
            document.getElementById("fichaZombie").style.top = "73.2%"
         }else{
            moverFichasIguales(98)
         }
      break;
      case 99:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "75.3%"
            document.getElementById("fichaZombie").style.top = "76.9%"
         }else{
            moverFichasIguales(99)
         }
      break;
      case 100:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "66.1%"
            document.getElementById("fichaZombie").style.top = "37%"
         }else{
            moverFichasIguales(100)
         }
      break;
      case 101:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "68.4%"
            document.getElementById("fichaZombie").style.top = "33.5%"
         }else{
            moverFichasIguales(101)
         }
      break;
      case 102:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "70.8%"
            document.getElementById("fichaZombie").style.top = "36.6%"
         }else{
            moverFichasIguales(102)
         }
      break;
      case 103:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "73.2%"
            document.getElementById("fichaZombie").style.top = "33.5%"
         }else{
            moverFichasIguales(103)
         }
      break;
      case 104:
            if(comprobarZH() == false){
               document.getElementById("fichaZombie").style.left = "75.6%"
               document.getElementById("fichaZombie").style.top = "36.6%"
            }else{
               moverFichasIguales(104)
            }
         break;
      case 105:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "80.6%"
            document.getElementById("fichaZombie").style.top = "36.6%"
         }else{
            moverFichasIguales(105)
         }
      break;
      case 106:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "30.6%"
            document.getElementById("fichaZombie").style.top = "35%"
         }else{
            moverFichasIguales(106)
         }
      break;
      case 107:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "27.6%"
            document.getElementById("fichaZombie").style.top = "70%"
         }else{
            moverFichasIguales(107)
         }
      break;
      case 108:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "51.6%"
            document.getElementById("fichaZombie").style.top = "24%"
         }else{
            moverFichasIguales(108)
         }
      break;
      case 109:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "36%"
            document.getElementById("fichaZombie").style.top = "8%"
         }else{
            moverFichasIguales(109)
         }
      break;
      case 110:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "79.5%"
            document.getElementById("fichaZombie").style.top = "85%"
         }else{
            moverFichasIguales(110)
         }
      break;
      case 111:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "74.5%"
            document.getElementById("fichaZombie").style.top = "11%"
         }else{
            moverFichasIguales(111)
         }
      break;
      case 112:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "16%"
            document.getElementById("fichaZombie").style.top = "10%"
         }else{
            moverFichasIguales(112)
         }
      break;
      case 113:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "16%"
            document.getElementById("fichaZombie").style.top = "30%"
         }else{
            moverFichasIguales(113)
         }
      break;
      case 114:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "26.5%"
            document.getElementById("fichaZombie").style.top = "92%"

         }else{
            moverFichasIguales(114)
         }
      break;
      case 115:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "43.5%"
            document.getElementById("fichaZombie").style.top = "80%"
         }else{
            moverFichasIguales(115)
         }
      break;
   }
   posHumano = humano
   posZombie = zombie
}

function moverFichasIguales(casilla){
   switch(casilla){
      case 1:
            document.getElementById("fichaHumano").style.left = "20.5%"
            document.getElementById("fichaHumano").style.top = "94%"
            document.getElementById("fichaZombie").style.left = "22.5%"
            document.getElementById("fichaZombie").style.top = "94%"
         break;
      case 2:
            document.getElementById("fichaHumano").style.left = "19%"
            document.getElementById("fichaHumano").style.top = "91%"
            document.getElementById("fichaZombie").style.left = "20%"
            document.getElementById("fichaZombie").style.top = "91%"
         break;
      case 3:
            document.getElementById("fichaHumano").style.left = "15.6%"
            document.getElementById("fichaHumano").style.top = "87.8%"
            document.getElementById("fichaZombie").style.left = "17.6%"
            document.getElementById("fichaZombie").style.top = "87.8%"
            break;
      case 4:
            document.getElementById("fichaHumano").style.left = "15.6%"
            document.getElementById("fichaHumano").style.top = "80.9%"
            document.getElementById("fichaZombie").style.left = "17.6%"
            document.getElementById("fichaZombie").style.top = "80.9%"
            break;
      case 5:
            document.getElementById("fichaHumano").style.left = "17.5%"
            document.getElementById("fichaHumano").style.top = "75.5%"
            document.getElementById("fichaZombie").style.left = "19.5%"
            document.getElementById("fichaZombie").style.top = "75.5%"
            break;
      case 6:
            document.getElementById("fichaHumano").style.left = "19.8%"
            document.getElementById("fichaHumano").style.top = "72%"
            document.getElementById("fichaZombie").style.left = "21.8%"
            document.getElementById("fichaZombie").style.top = "72%"
         break;
      case 7:
            document.getElementById("fichaHumano").style.left = "22.2%"
            document.getElementById("fichaHumano").style.top = "69%"
            document.getElementById("fichaZombie").style.left = "24.2%"
            document.getElementById("fichaZombie").style.top = "69%"
         break;
      case 8:
            document.getElementById("fichaHumano").style.left = "22.2%"
            document.getElementById("fichaHumano").style.top = "62.2%"
            document.getElementById("fichaZombie").style.left = "24.2%"
            document.getElementById("fichaZombie").style.top = "62.2%"
         break;
      case 9:
            document.getElementById("fichaHumano").style.left = "19.9%"
            document.getElementById("fichaHumano").style.top = "59%"
            document.getElementById("fichaZombie").style.left = "21.9%"
            document.getElementById("fichaZombie").style.top = "59%"
         break;
      case 10:
            document.getElementById("fichaHumano").style.left = "17.5%"
            document.getElementById("fichaHumano").style.top = "55.8%"
            document.getElementById("fichaZombie").style.left = "19.5%"
            document.getElementById("fichaZombie").style.top = "55.8%"
         break;
      case 11:
            document.getElementById("fichaHumano").style.left = "17.5%"
            document.getElementById("fichaHumano").style.top = "49.1%"
            document.getElementById("fichaZombie").style.left = "19.5%"
            document.getElementById("fichaZombie").style.top = "49.1%"
         break;
      case 12:
            document.getElementById("fichaHumano").style.left = "17.5%"
            document.getElementById("fichaHumano").style.top = "42.4%"
            document.getElementById("fichaZombie").style.left = "19.5%"
            document.getElementById("fichaZombie").style.top = "42.4%"
         break;
      case 13:
            document.getElementById("fichaHumano").style.left = "19.85%"
            document.getElementById("fichaHumano").style.top = "39.5%"
            document.getElementById("fichaZombie").style.left = "21.85%"
            document.getElementById("fichaZombie").style.top = "39.5%"
         break;
      case 14:
            document.getElementById("fichaHumano").style.left = "19.85%"
            document.getElementById("fichaHumano").style.top = "46%"
            document.getElementById("fichaZombie").style.left = "21.85%"
            document.getElementById("fichaZombie").style.top = "46%"
         break;
      case 15:
            document.getElementById("fichaHumano").style.left = "22.2%"
            document.getElementById("fichaHumano").style.top = "49%"
            document.getElementById("fichaZombie").style.left = "24.2%"
            document.getElementById("fichaZombie").style.top = "49%"
         break;
      case 16:
            document.getElementById("fichaHumano").style.left = "22.2%"
            document.getElementById("fichaHumano").style.top = "36.5%"
            document.getElementById("fichaZombie").style.left = "24.2%"
            document.getElementById("fichaZombie").style.top = "36.5%"
         break;
      case 17:
            document.getElementById("fichaHumano").style.left = "24.6%"
            document.getElementById("fichaHumano").style.top = "33.6%"
            document.getElementById("fichaZombie").style.left = "26.6%"
            document.getElementById("fichaZombie").style.top = "33.6%"
         break;
      case 18:
            document.getElementById("fichaHumano").style.left = "24.6%"
            document.getElementById("fichaHumano").style.top = "27%"
            document.getElementById("fichaZombie").style.left = "26.6%"
            document.getElementById("fichaZombie").style.top = "27%"
         break;
      case 19:
            document.getElementById("fichaHumano").style.left = "24.6%"
            document.getElementById("fichaHumano").style.top = "20.5%"
            document.getElementById("fichaZombie").style.left = "26.6%"
            document.getElementById("fichaZombie").style.top = "20.5%"
         break;
      case 20:
            document.getElementById("fichaHumano").style.left = "22.3%"
            document.getElementById("fichaHumano").style.top = "23.5%"
            document.getElementById("fichaZombie").style.left = "24.3%"
            document.getElementById("fichaZombie").style.top = "23.5%"
         break;
      case 21:
            document.getElementById("fichaHumano").style.left = "19.9%"
            document.getElementById("fichaHumano").style.top = "26.5%"
            document.getElementById("fichaZombie").style.left = "21.9%"
            document.getElementById("fichaZombie").style.top = "26.5%"
         break;
      case 22:
            document.getElementById("fichaHumano").style.left = "24.6%"
            document.getElementById("fichaHumano").style.top = "14%"
            document.getElementById("fichaZombie").style.left = "26.6%"
            document.getElementById("fichaZombie").style.top = "14%"
         break;
      case 23:
            document.getElementById("fichaHumano").style.left = "22.2%"
            document.getElementById("fichaHumano").style.top = "11%"
            document.getElementById("fichaZombie").style.left = "24.2%"
            document.getElementById("fichaZombie").style.top = "11%"
         break;
      case 24:
            document.getElementById("fichaHumano").style.left = "19.9%"
            document.getElementById("fichaHumano").style.top = "7.5%"
            document.getElementById("fichaZombie").style.left = "21.9%"
            document.getElementById("fichaZombie").style.top = "7.5%"
         break;
      case 25:
            document.getElementById("fichaHumano").style.left = "27%"
            document.getElementById("fichaHumano").style.top = "11%"
            document.getElementById("fichaZombie").style.left = "29%"
            document.getElementById("fichaZombie").style.top = "11%"
         break;
      case 26:
            document.getElementById("fichaHumano").style.left = "29.5%"
            document.getElementById("fichaHumano").style.top = "14%"
            document.getElementById("fichaZombie").style.left = "31.5%"
            document.getElementById("fichaZombie").style.top = "14%"
         break;
      case 27:
            document.getElementById("fichaHumano").style.left = "31.8%"
            document.getElementById("fichaHumano").style.top = "17%"
            document.getElementById("fichaZombie").style.left = "33.8%"
            document.getElementById("fichaZombie").style.top = "17%"
         break;
      case 28:
            document.getElementById("fichaHumano").style.left = "34.1%"
            document.getElementById("fichaHumano").style.top = "20.2%"
            document.getElementById("fichaZombie").style.left = "36.1%"
            document.getElementById("fichaZombie").style.top = "20.2%"
         break;
      case 29:
            document.getElementById("fichaHumano").style.left = "34.1%"
            document.getElementById("fichaHumano").style.top = "27%"
            document.getElementById("fichaZombie").style.left = "36.1%"
            document.getElementById("fichaZombie").style.top = "27%"
         break;
      case 30:
            document.getElementById("fichaHumano").style.left = "34.1%"
            document.getElementById("fichaHumano").style.top = "34%"
            document.getElementById("fichaZombie").style.left = "36.1%"
            document.getElementById("fichaZombie").style.top = "34%"
         break;
      case 31:
            document.getElementById("fichaHumano").style.left = "24.6%"
            document.getElementById("fichaHumano").style.top = "52%"
            document.getElementById("fichaZombie").style.left = "26.6%"
            document.getElementById("fichaZombie").style.top = "52%"
         break;
      case 32:
            document.getElementById("fichaHumano").style.left = "26.9%"
            document.getElementById("fichaHumano").style.top = "48.5%"
            document.getElementById("fichaZombie").style.left = "28.9%"
            document.getElementById("fichaZombie").style.top = "48.5%"
         break;
      case 33:
            document.getElementById("fichaHumano").style.left = "29.4%"
            document.getElementById("fichaHumano").style.top = "45.4%"
            document.getElementById("fichaZombie").style.left = "31.4%"
            document.getElementById("fichaZombie").style.top = "45.4%"
         break;
      case 34:
            document.getElementById("fichaHumano").style.left = "36.5%"
            document.getElementById("fichaHumano").style.top = "30.8%"
            document.getElementById("fichaZombie").style.left = "38.5%"
            document.getElementById("fichaZombie").style.top = "30.8%"
         break;
      case 35:
            document.getElementById("fichaHumano").style.left = "38.9%"
            document.getElementById("fichaHumano").style.top = "27.8%"
            document.getElementById("fichaZombie").style.left = "40.9%"
            document.getElementById("fichaZombie").style.top = "27.8%"
         break;
      case 36:
            document.getElementById("fichaHumano").style.left = "41.2%"
            document.getElementById("fichaHumano").style.top = "30.8%"
            document.getElementById("fichaZombie").style.left = "43.2%"
            document.getElementById("fichaZombie").style.top = "30.8%"
         break;
      case 37:
            document.getElementById("fichaHumano").style.left = "43.8%"
            document.getElementById("fichaHumano").style.top = "27.8%"
            document.getElementById("fichaZombie").style.left = "45.8%"
            document.getElementById("fichaZombie").style.top = "27.8%"
         break;
      case 38:
            document.getElementById("fichaHumano").style.left = "46%"
            document.getElementById("fichaHumano").style.top = "24%"
            document.getElementById("fichaZombie").style.left = "48%"
            document.getElementById("fichaZombie").style.top = "24%"
         break;
      case 39:
            document.getElementById("fichaHumano").style.left = "36.4%"
            document.getElementById("fichaHumano").style.top = "37.8%"
            document.getElementById("fichaZombie").style.left = "38.4%"
            document.getElementById("fichaZombie").style.top = "37.8%"
         break;
      case 40:
            document.getElementById("fichaHumano").style.left = "38.6%"
            document.getElementById("fichaHumano").style.top = "41.5%"
            document.getElementById("fichaZombie").style.left = "40.6%"
            document.getElementById("fichaZombie").style.top = "41.5%"
         break;
      case 41:
            document.getElementById("fichaHumano").style.left = "41.2%"
            document.getElementById("fichaHumano").style.top = "44%"
            document.getElementById("fichaZombie").style.left = "43.2%"
            document.getElementById("fichaZombie").style.top = "44%"
         break;
      case 42:
            document.getElementById("fichaHumano").style.left = "43.6%"
            document.getElementById("fichaHumano").style.top = "47%"
            document.getElementById("fichaZombie").style.left = "45.6%"
            document.getElementById("fichaZombie").style.top = "47%"
         break;
      case 43:
            document.getElementById("fichaHumano").style.left = "31.9%"
            document.getElementById("fichaHumano").style.top = "48%"
            document.getElementById("fichaZombie").style.left = "33.9%"
            document.getElementById("fichaZombie").style.top = "48%"
         break;
      case 44:
            document.getElementById("fichaHumano").style.left = "34.4%"
            document.getElementById("fichaHumano").style.top = "50.9%"
            document.getElementById("fichaZombie").style.left = "36.4%"
            document.getElementById("fichaZombie").style.top = "50.9%"
         break;
      case 45:
            document.getElementById("fichaHumano").style.left = "36.7%"
            document.getElementById("fichaHumano").style.top = "47%"
            document.getElementById("fichaZombie").style.left = "38.7%"
            document.getElementById("fichaZombie").style.top = "47%"
         break;
      case 46:
            document.getElementById("fichaHumano").style.left = "46%"
            document.getElementById("fichaHumano").style.top = "50%"
            document.getElementById("fichaZombie").style.left = "48%"
            document.getElementById("fichaZombie").style.top = "50%"
         break;
      case 47:
            document.getElementById("fichaHumano").style.left = "48.5%"
            document.getElementById("fichaHumano").style.top = "47%"
            document.getElementById("fichaZombie").style.left = "50.5%"
            document.getElementById("fichaZombie").style.top = "47%"
         break;
      case 48:
            document.getElementById("fichaHumano").style.left = "50.7%"
            document.getElementById("fichaHumano").style.top = "43.2%"
            document.getElementById("fichaZombie").style.left = "52.7%"
            document.getElementById("fichaZombie").style.top = "43.2%"
         break;
      case 49:
            document.getElementById("fichaHumano").style.left = "53.1%"
            document.getElementById("fichaHumano").style.top = "40.3%"
            document.getElementById("fichaZombie").style.left = "55.1%"
            document.getElementById("fichaZombie").style.top = "40.3%"
         break;
      case 50:
            document.getElementById("fichaHumano").style.left = "55.5%"
            document.getElementById("fichaHumano").style.top = "37.5%"
            document.getElementById("fichaZombie").style.left = "57.5%"
            document.getElementById("fichaZombie").style.top = "37.5%"
         break;
      case 51:
            document.getElementById("fichaHumano").style.left = "55.5%"
            document.getElementById("fichaHumano").style.top = "31%"
            document.getElementById("fichaZombie").style.left = "57.5%"
            document.getElementById("fichaZombie").style.top = "31%"
         break;
      case 52:
            document.getElementById("fichaHumano").style.left = "55.5%"
            document.getElementById("fichaHumano").style.top = "24.5%"
            document.getElementById("fichaZombie").style.left = "57.5%"
            document.getElementById("fichaZombie").style.top = "24.5%"
         break;
      case 53:
            document.getElementById("fichaHumano").style.left = "55.5%"
            document.getElementById("fichaHumano").style.top = "18.1%"
            document.getElementById("fichaZombie").style.left = "57.5%"
            document.getElementById("fichaZombie").style.top = "18.1%"
         break;
      case 54:
            document.getElementById("fichaHumano").style.left = "55.5%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            document.getElementById("fichaZombie").style.left = "57.5%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         break;
      case 55:
            document.getElementById("fichaHumano").style.left = "53.2%"
            document.getElementById("fichaHumano").style.top = "8%"
            document.getElementById("fichaZombie").style.left = "55.2%"
            document.getElementById("fichaZombie").style.top = "8%"
         break;
      case 56:
            document.getElementById("fichaHumano").style.left = "50.8%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            document.getElementById("fichaZombie").style.left = "52.8%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         break;
      case 57:
            document.getElementById("fichaHumano").style.left = "48.5%"
            document.getElementById("fichaHumano").style.top = "8%"
            document.getElementById("fichaZombie").style.left = "50.5%"
            document.getElementById("fichaZombie").style.top = "8%"
         break;
      case 58:
            document.getElementById("fichaHumano").style.left = "46.2%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            document.getElementById("fichaZombie").style.left = "48.2%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         break;
      case 59:
            document.getElementById("fichaHumano").style.left = "43.8%"
            document.getElementById("fichaHumano").style.top = "8%"
            document.getElementById("fichaZombie").style.left = "45.8%"
            document.getElementById("fichaZombie").style.top = "8%"
         break;
      case 60:
            document.getElementById("fichaHumano").style.left = "41.4%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            document.getElementById("fichaZombie").style.left = "43.4%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         break;
      case 61:
            document.getElementById("fichaHumano").style.left = "39%"
            document.getElementById("fichaHumano").style.top = "8%"
            document.getElementById("fichaZombie").style.left = "41%"
            document.getElementById("fichaZombie").style.top = "8%"
         break;
      case 62:
            document.getElementById("fichaHumano").style.left = "57.8%"
            document.getElementById("fichaHumano").style.top = "8%"
            document.getElementById("fichaZombie").style.left = "59.8%"
            document.getElementById("fichaZombie").style.top = "8%"
         break;
      case 63:
            document.getElementById("fichaHumano").style.left = "60.1%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            document.getElementById("fichaZombie").style.left = "62.1%"
            document.getElementById("fichaZombie").style.top = "11.5%"
      case 64:
            document.getElementById("fichaHumano").style.left = "62.3%"
            document.getElementById("fichaHumano").style.top = "8%"
            document.getElementById("fichaZombie").style.left = "64.3%"
            document.getElementById("fichaZombie").style.top = "8%"
         break;
      case 65:
            document.getElementById("fichaHumano").style.left = "64.5%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            document.getElementById("fichaZombie").style.left = "66.5%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         break;
      case 66:
            document.getElementById("fichaHumano").style.left = "66.7%"
            document.getElementById("fichaHumano").style.top = "8%"
            document.getElementById("fichaZombie").style.left = "68.7%"
            document.getElementById("fichaZombie").style.top = "8%"
         break;
      case 67:
            document.getElementById("fichaHumano").style.left = "69%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            document.getElementById("fichaZombie").style.left = "71%"
            document.getElementById("fichaZombie").style.top = "11.5%"
         break;
      case 68:
            document.getElementById("fichaHumano").style.left = "57.8%"
            document.getElementById("fichaHumano").style.top = "34%"
            document.getElementById("fichaZombie").style.left = "59.8%"
            document.getElementById("fichaZombie").style.top = "34%"
         break;
      case 69:
            document.getElementById("fichaHumano").style.left = "60.2%"
            document.getElementById("fichaHumano").style.top = "36.8%"
            document.getElementById("fichaZombie").style.left = "62.2%"
            document.getElementById("fichaZombie").style.top = "36.8%"
         break;
      case 70:
            document.getElementById("fichaHumano").style.left = "62.6%"
            document.getElementById("fichaHumano").style.top = "34%"
            document.getElementById("fichaZombie").style.left = "64.6%"
            document.getElementById("fichaZombie").style.top = "34%"
         break;
      case 71:
            document.getElementById("fichaHumano").style.left = "53%"
            document.getElementById("fichaHumano").style.top = "47%"
            document.getElementById("fichaZombie").style.left = "55%"
            document.getElementById("fichaZombie").style.top = "47%"
         break;
      case 72:
            document.getElementById("fichaHumano").style.left = "55.2%"
            document.getElementById("fichaHumano").style.top = "51%"
            document.getElementById("fichaZombie").style.left = "57.2%"
            document.getElementById("fichaZombie").style.top = "51%"
         break;
      case 73:
            document.getElementById("fichaHumano").style.left = "59.8%"
            document.getElementById("fichaHumano").style.top = "43.5%"
            document.getElementById("fichaZombie").style.left = "61.8%"
            document.getElementById("fichaZombie").style.top = "43.5%"
         break;
      case 74:
            document.getElementById("fichaHumano").style.left = "57.5%"
            document.getElementById("fichaHumano").style.top = "47%"
            document.getElementById("fichaZombie").style.left = "59.5%"
            document.getElementById("fichaZombie").style.top = "47%"
         break;
      case 75:
            document.getElementById("fichaHumano").style.left = "55.2%"
            document.getElementById("fichaHumano").style.top = "57.6%"
            document.getElementById("fichaZombie").style.left = "57.2%"
            document.getElementById("fichaZombie").style.top = "57.6%"
         break;
      case 76:
            document.getElementById("fichaHumano").style.left = "57.7%"
            document.getElementById("fichaHumano").style.top = "60.5%"
            document.getElementById("fichaZombie").style.left = "59.7%"
            document.getElementById("fichaZombie").style.top = "60.5%"
         break;
      case 77:
            document.getElementById("fichaHumano").style.left = "60%"
            document.getElementById("fichaHumano").style.top = "64%"
            document.getElementById("fichaZombie").style.left = "62%"
            document.getElementById("fichaZombie").style.top = "64%"
         break;
      case 78:
            document.getElementById("fichaHumano").style.left = "62.3%"
            document.getElementById("fichaHumano").style.top = "67%"
            document.getElementById("fichaZombie").style.left = "64.3%"
            document.getElementById("fichaZombie").style.top = "67%"
         break;
      case 79:
            document.getElementById("fichaHumano").style.left = "64.7%"
            document.getElementById("fichaHumano").style.top = "64%"
            document.getElementById("fichaZombie").style.left = "66.7%"
            document.getElementById("fichaZombie").style.top = "64%"
         break;
      case 80:
            document.getElementById("fichaHumano").style.left = "67.2%"
            document.getElementById("fichaHumano").style.top = "66.5%"
            document.getElementById("fichaZombie").style.left = "69.2%"
            document.getElementById("fichaZombie").style.top = "66.5%"
         break;
      case 81:
            document.getElementById("fichaHumano").style.left = "69.5%"
            document.getElementById("fichaHumano").style.top = "63%"
            document.getElementById("fichaZombie").style.left = "71.5%"
            document.getElementById("fichaZombie").style.top = "63%"
         break;
      case 82:
            document.getElementById("fichaHumano").style.left = "60.1%"
            document.getElementById("fichaHumano").style.top = "70.6%"
            document.getElementById("fichaZombie").style.left = "62.1%"
            document.getElementById("fichaZombie").style.top = "70.6%"
         break;
      case 83:
            document.getElementById("fichaHumano").style.left = "57.8%"
            document.getElementById("fichaHumano").style.top = "73.5%"
            document.getElementById("fichaZombie").style.left = "59.8%"
            document.getElementById("fichaZombie").style.top = "73.5%"
         break;
      case 84:
            document.getElementById("fichaHumano").style.left = "46%"
            document.getElementById("fichaHumano").style.top = "56.5%"
            document.getElementById("fichaZombie").style.left = "48%"
            document.getElementById("fichaZombie").style.top = "56.5%"
         break;
      case 85:
            document.getElementById("fichaHumano").style.left = "46%"
            document.getElementById("fichaHumano").style.top = "63.2%"
            document.getElementById("fichaZombie").style.left = "48%"
            document.getElementById("fichaZombie").style.top = "63.2%"
         break;
      case 86:
            document.getElementById("fichaHumano").style.left = "46%"
            document.getElementById("fichaHumano").style.top = "70%"
            document.getElementById("fichaZombie").style.left = "48%"
            document.getElementById("fichaZombie").style.top = "70%"
         break;
      case 87:
            document.getElementById("fichaHumano").style.left = "48.1%"
            document.getElementById("fichaHumano").style.top = "73%"
            document.getElementById("fichaZombie").style.left = "50.1%"
            document.getElementById("fichaZombie").style.top = "73%"
         break;
      case 88:
            document.getElementById("fichaHumano").style.left = "50.5%"
            document.getElementById("fichaHumano").style.top = "76%"
            document.getElementById("fichaZombie").style.left = "52.5%"
            document.getElementById("fichaZombie").style.top = "76%"
         break;
      case 89:
            document.getElementById("fichaHumano").style.left = "53%"
            document.getElementById("fichaHumano").style.top = "78.25%"
            document.getElementById("fichaZombie").style.left = "55%"
            document.getElementById("fichaZombie").style.top = "78.25%"
         break;
      case 90:
            document.getElementById("fichaHumano").style.left = "55.45%"
            document.getElementById("fichaHumano").style.top = "76%"
            document.getElementById("fichaZombie").style.left = "57.45%"
            document.getElementById("fichaZombie").style.top = "76%"
         break;
      case 91:
            document.getElementById("fichaHumano").style.left = "45%"
            document.getElementById("fichaHumano").style.top = "76.5%"
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "76.5%"
         break;
      case 92:
            document.getElementById("fichaHumano").style.left = "40.5%"
            document.getElementById("fichaHumano").style.top = "80%"
            document.getElementById("fichaZombie").style.left = "42.5%"
            document.getElementById("fichaZombie").style.top = "80%"
         break;
      case 93:
            document.getElementById("fichaHumano").style.left = "38.5%"
            document.getElementById("fichaHumano").style.top = "73%"
            document.getElementById("fichaZombie").style.left = "40.5%"
            document.getElementById("fichaZombie").style.top = "73%"
         break;
      case 94:
            document.getElementById("fichaHumano").style.left = "36.4%"
            document.getElementById("fichaHumano").style.top = "69%"
            document.getElementById("fichaZombie").style.left = "38.4%"
            document.getElementById("fichaZombie").style.top = "69%"
         break;
      case 95:
            document.getElementById("fichaHumano").style.left = "36.4%"
            document.getElementById("fichaHumano").style.top = "62.4%"
            document.getElementById("fichaZombie").style.left = "38.4%"
            document.getElementById("fichaZombie").style.top = "62.4%"
         break;
      case 96:
         document.getElementById("fichaHumano").style.left = "34.5%"
         document.getElementById("fichaHumano").style.top = "57.5%"
         document.getElementById("fichaZombie").style.left = "36.5%"
         document.getElementById("fichaZombie").style.top = "57.5%"
      break;
      case 97:
         document.getElementById("fichaHumano").style.left = "72.1%"
         document.getElementById("fichaHumano").style.top = "66.5%"
         document.getElementById("fichaZombie").style.left = "74.5%"
         document.getElementById("fichaZombie").style.top = "66.5%"
      break;
      case 98:
         document.getElementById("fichaHumano").style.left = "72.1%"
         document.getElementById("fichaHumano").style.top = "73.2%"
         document.getElementById("fichaZombie").style.left = "74.5%"
         document.getElementById("fichaZombie").style.top = "73.2%"
      break;
      case 99:
         document.getElementById("fichaHumano").style.left = "74.3%"
         document.getElementById("fichaHumano").style.top = "76.9%"
         document.getElementById("fichaZombie").style.left = "76.3%"
         document.getElementById("fichaZombie").style.top = "76.9%"
      break;
      case 100:
         document.getElementById("fichaHumano").style.left = "65.1%"
         document.getElementById("fichaHumano").style.top = "37%"
         document.getElementById("fichaZombie").style.left = "67.1%"
         document.getElementById("fichaZombie").style.top = "37%"
      break;
      case 101:
         document.getElementById("fichaHumano").style.left = "67.4%"
         document.getElementById("fichaHumano").style.top = "33.5%"
         document.getElementById("fichaZombie").style.left = "69.4%"
         document.getElementById("fichaZombie").style.top = "33.5%"
      break;
      case 102:
         document.getElementById("fichaHumano").style.left = "69.8%"
         document.getElementById("fichaHumano").style.top = "36.6%"
         document.getElementById("fichaZombie").style.left = "71.8%"
         document.getElementById("fichaZombie").style.top = "36.6%"
      break;
      case 103:
         document.getElementById("fichaHumano").style.left = "72.2%"
         document.getElementById("fichaHumano").style.top = "33.5%"
         document.getElementById("fichaZombie").style.left = "74.2%"
         document.getElementById("fichaZombie").style.top = "33.5%"
      break;
      case 104:
         document.getElementById("fichaHumano").style.left = "74.6%"
         document.getElementById("fichaHumano").style.top = "36.6%"
         document.getElementById("fichaZombie").style.left = "76.6%"
         document.getElementById("fichaZombie").style.top = "36.6%"
      break;
      case 105:
         document.getElementById("fichaHumano").style.left = "79.6%"
         document.getElementById("fichaHumano").style.top = "36.6%"
         document.getElementById("fichaZombie").style.left = "81.6%"
         document.getElementById("fichaZombie").style.top = "36.6%"
      break;
      case 106:
         document.getElementById("fichaHumano").style.left = "29.6%"
         document.getElementById("fichaHumano").style.top = "35%"
         document.getElementById("fichaZombie").style.left = "31.6%"
         document.getElementById("fichaZombie").style.top = "35%"
      break;
      case 107:
         document.getElementById("fichaHumano").style.left = "26.6%"
         document.getElementById("fichaHumano").style.top = "70%"
         document.getElementById("fichaZombie").style.left = "28.6%"
         document.getElementById("fichaZombie").style.top = "70%"
      break;
      case 108:
         document.getElementById("fichaHumano").style.left = "50.6%"
         document.getElementById("fichaHumano").style.top = "24%"
         document.getElementById("fichaZombie").style.left = "52.6%"
         document.getElementById("fichaZombie").style.top = "24%"
      break;
      case 109:
         document.getElementById("fichaHumano").style.left = "35%"
         document.getElementById("fichaHumano").style.top = "8%"
         document.getElementById("fichaZombie").style.left = "37%"
         document.getElementById("fichaZombie").style.top = "8%"
      break;
      case 110:
         document.getElementById("fichaHumano").style.left = "78.5%"
         document.getElementById("fichaHumano").style.top = "85%"
         document.getElementById("fichaZombie").style.left = "80.5%"
         document.getElementById("fichaZombie").style.top = "85%"
      break;
      case 111:
         document.getElementById("fichaHumano").style.left = "73.5%"
         document.getElementById("fichaHumano").style.top = "11%"
         document.getElementById("fichaZombie").style.left = "75.5%"
         document.getElementById("fichaZombie").style.top = "11%"
      break;
      case 112:
         document.getElementById("fichaHumano").style.left = "15%"
         document.getElementById("fichaHumano").style.top = "10%"
         document.getElementById("fichaZombie").style.left = "17%"
         document.getElementById("fichaZombie").style.top = "10%"
      break;
      case 113:
         document.getElementById("fichaHumano").style.left = "15%"
         document.getElementById("fichaHumano").style.top = "30%"
         document.getElementById("fichaZombie").style.left = "17%"
         document.getElementById("fichaZombie").style.top = "30%"
      break;
      case 114:
         document.getElementById("fichaHumano").style.left = "25.5%"
         document.getElementById("fichaHumano").style.top = "92%"
         document.getElementById("fichaZombie").style.left = "27.5%"
         document.getElementById("fichaZombie").style.top = "92%"
      break;
      case 115:
         document.getElementById("fichaHumano").style.left = "42.5%"
         document.getElementById("fichaHumano").style.top = "80%"
         document.getElementById("fichaZombie").style.left = "44.5%"
         document.getElementById("fichaZombie").style.top = "80%"
      break;
   }
}

function moverFichaHumano(posHumanoAux){
   var anterior = comprobarZH()
   posHumano = posHumanoAux
   //105 -> Ayuntamiento
   //106 -> Estación de tren
   //107 -> Gym
   //108 -> Hospital
   //109 -> Laboratorio
   //110 -> Museo
   //111 -> Piso Franco
   //112 -> Restaurante
   //113 -> Sala de Música
   //114 -> Supermercado
   switch(posHumanoAux){
      case 1:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "21.5%"
            document.getElementById("fichaHumano").style.top = "94%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(1)
         }
         break;
      case 2:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "19%"
            document.getElementById("fichaHumano").style.top = "91%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(2)
         }
         break;
      case 3:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "16.6%"
            document.getElementById("fichaHumano").style.top = "87.8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(3)
         }
         break;
      case 4:
            if(comprobarZH() == false){
                  document.getElementById("fichaHumano").style.left = "16.6%"
                  document.getElementById("fichaHumano").style.top = "80.9%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
            }else{
               moverFichasIguales(4)
            }
            break;
      case 5:
            if(comprobarZH() == false){
               document.getElementById("fichaHumano").style.left = "18.5%"
               document.getElementById("fichaHumano").style.top = "75.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
            }else{
               moverFichasIguales(5)
            }
            break;
      case 6:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.8%"
            document.getElementById("fichaHumano").style.top = "72%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(6)
         }
         break;
      case 7:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.2%"
            document.getElementById("fichaHumano").style.top = "69%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(7)
         }
         break;
      case 8:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.2%"
            document.getElementById("fichaHumano").style.top = "62.2%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(8)
         }
         break;
      case 9:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.9%"
            document.getElementById("fichaHumano").style.top = "59%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(9)
         }
         break;
      case 10:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "18.5%"
            document.getElementById("fichaHumano").style.top = "55.8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(10)
         }
         break;
      case 11:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "18.5%"
            document.getElementById("fichaHumano").style.top = "49.1%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(11)
         }
         break;
      case 12:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "18.5%"
            document.getElementById("fichaHumano").style.top = "42.4%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(12)
         }
         break;
      case 13:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.85%"
            document.getElementById("fichaHumano").style.top = "39.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(13)
         }
         break;
      case 14:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.85%"
            document.getElementById("fichaHumano").style.top = "46%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(14)
            }
         break;
      case 15:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.2%"
            document.getElementById("fichaHumano").style.top = "49%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(15)
         }
         break;
      case 16:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.2%"
            document.getElementById("fichaHumano").style.top = "36.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(16)
         }
         break;
      case 17:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "25.6%"
            document.getElementById("fichaHumano").style.top = "33.6%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(17)
         }
         break;
      case 18:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "25.6%"
            document.getElementById("fichaHumano").style.top = "27%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(18)
         }
         break;
      case 19:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "25.6%"
            document.getElementById("fichaHumano").style.top = "20.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(19)
         }
         break;
      case 20:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.3%"
            document.getElementById("fichaHumano").style.top = "23.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(20)
         }
         break;
      case 21:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.9%"
            document.getElementById("fichaHumano").style.top = "26.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(21)
         }
         break;
      case 22:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "25.6%"
            document.getElementById("fichaHumano").style.top = "14%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(22)
         }
         break;
      case 23:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "23.2%"
            document.getElementById("fichaHumano").style.top = "11%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(23)
         }
         break;
      case 24:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "20.9%"
            document.getElementById("fichaHumano").style.top = "7.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(24)
         }
         break;
      case 25:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "28%"
            document.getElementById("fichaHumano").style.top = "11%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(25)
         }
         break;
      case 26:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "30.5%"
            document.getElementById("fichaHumano").style.top = "14%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(26)
         }
         break;
      case 27:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "32.8%"
            document.getElementById("fichaHumano").style.top = "17%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(27)
         }
         break;
      case 28:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "35.1%"
            document.getElementById("fichaHumano").style.top = "20.2%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(28)
         }
         break;
      case 29:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "35.1%"
            document.getElementById("fichaHumano").style.top = "27%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(29)
         }
         break;
      case 30:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "35.1%"
            document.getElementById("fichaHumano").style.top = "34%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(30)
         }
         break;
      case 31:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "25.6%"
            document.getElementById("fichaHumano").style.top = "52%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(31)
         }
         break;
      case 32:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "27.9%"
            document.getElementById("fichaHumano").style.top = "48.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(32)
         }
         break;
      case 33:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "30.4%"
            document.getElementById("fichaHumano").style.top = "45.4%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(33)
         }
         break;
      case 34:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "37.5%"
            document.getElementById("fichaHumano").style.top = "30.8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(34)
         }
         break;
      case 35:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "39.9%"
            document.getElementById("fichaHumano").style.top = "27.8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(35)
         }
         break;
      case 36:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "42.4%"
            document.getElementById("fichaHumano").style.top = "30.8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(36)
         }
         break;
      case 37:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "44.8%"
            document.getElementById("fichaHumano").style.top = "27.8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(37)
         }
         break;
      case 38:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47%"
            document.getElementById("fichaHumano").style.top = "24%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(38)
         }
         break;
      case 39:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "37.4%"
            document.getElementById("fichaHumano").style.top = "37.8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(39)
         }
         break;
      case 40:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "39.6%"
            document.getElementById("fichaHumano").style.top = "41.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(40)
         }
         break;
      case 41:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "42.2%"
            document.getElementById("fichaHumano").style.top = "44%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(41)
         }
         break;
      case 42:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "44.6%"
            document.getElementById("fichaHumano").style.top = "47%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(42)
         }
         break;
      case 43:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "32.9%"
            document.getElementById("fichaHumano").style.top = "48%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(43)
         }
         break;
      case 44:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "35.4%"
            document.getElementById("fichaHumano").style.top = "50.9%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(44)
         }
         break;
      case 45:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "37.7%"
            document.getElementById("fichaHumano").style.top = "47%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(45)
         }
         break;
      case 46:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47%"
            document.getElementById("fichaHumano").style.top = "50%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(46)
         }
         break;
      case 47:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "49.5%"
            document.getElementById("fichaHumano").style.top = "47%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(47)
         }
         break;
      case 48:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "51.7%"
            document.getElementById("fichaHumano").style.top = "43.2%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(48)
         }
         break;
      case 49:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "54.1%"
            document.getElementById("fichaHumano").style.top = "40.3%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(49)
         }
         break;
      case 50:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.5%"
            document.getElementById("fichaHumano").style.top = "37.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(50)
         }
         break;
      case 51:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.5%"
            document.getElementById("fichaHumano").style.top = "31%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(51)
         }
         break;
      case 52:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.5%"
            document.getElementById("fichaHumano").style.top = "24.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(52)
         }
         break;
      case 53:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.5%"
            document.getElementById("fichaHumano").style.top = "18.1%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(53)
         }
         break;
      case 54:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.5%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(54)
         }
         break;
      case 55:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "54.2%"
            document.getElementById("fichaHumano").style.top = "8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(55)
         }
         break;
      case 56:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "51.8%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(56)
         }
         break;
      case 57:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "49.5%"
            document.getElementById("fichaHumano").style.top = "8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(57)
         }
         break;
      case 58:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47.2%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(58)
         }
         break;
      case 59:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "44.8%"
            document.getElementById("fichaHumano").style.top = "8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(59)
         }
         break;
      case 60:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "42.4%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(60)
         }
         break;
      case 61:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "40%"
            document.getElementById("fichaHumano").style.top = "8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(61)
         }
         break;
      case 62:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "58.8%"
            document.getElementById("fichaHumano").style.top = "8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(62)
         }
         break;
      case 63:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "61.1%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(63)
         }
         break;
      case 64:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "63.3%"
            document.getElementById("fichaHumano").style.top = "8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(64)
         }
         break;
      case 65:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "65.5%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(65)
         }
         break;
      case 66:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "67.7%"
            document.getElementById("fichaHumano").style.top = "8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(66)
         }
         break;
      case 67:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "70%"
            document.getElementById("fichaHumano").style.top = "11.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(67)
         }
         break;
      case 68:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "58.8%"
            document.getElementById("fichaHumano").style.top = "34%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(68)
         }
         break;
      case 69:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "61.2%"
            document.getElementById("fichaHumano").style.top = "36.8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(69)
         }
         break;
      case 70:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "63.6%"
            document.getElementById("fichaHumano").style.top = "34%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(70)
         }
         break;
      case 71:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "54%"
            document.getElementById("fichaHumano").style.top = "47%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(71)
         }
         break;
      case 72:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.2%"
            document.getElementById("fichaHumano").style.top = "51%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(72)
         }
         break;
      case 73:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "60.8%"
            document.getElementById("fichaHumano").style.top = "43.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(73)
         }
         break;
      case 74:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "58.5%"
            document.getElementById("fichaHumano").style.top = "47%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(74)
         }
         break;
      case 75:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.2%"
            document.getElementById("fichaHumano").style.top = "57.6%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(75)
         }
         break;
      case 76:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "58.7%"
            document.getElementById("fichaHumano").style.top = "60.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(76)
         }
         break;
      case 77:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "61%"
            document.getElementById("fichaHumano").style.top = "64%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(77)
         }
         break;
      case 78:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "63.3%"
            document.getElementById("fichaHumano").style.top = "67%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(78)
         }
         break;
      case 79:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "65.7%"
            document.getElementById("fichaHumano").style.top = "64%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(79)
         }
         break;
      case 80:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "68.2%"
            document.getElementById("fichaHumano").style.top = "66.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(80)
         }
         break;
      case 81:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "70.5%"
            document.getElementById("fichaHumano").style.top = "63%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(81)
         }
         break;
      case 82:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "61.1%"
            document.getElementById("fichaHumano").style.top = "70.6%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(82)
         }
         break;
      case 83:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "58.8%"
            document.getElementById("fichaHumano").style.top = "73.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(83)
         }
         break;
      case 84:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47%"
            document.getElementById("fichaHumano").style.top = "56.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(84)
         }
         break;
      case 85:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47%"
            document.getElementById("fichaHumano").style.top = "63.2%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(85)
         }
         break;
      case 86:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "47%"
            document.getElementById("fichaHumano").style.top = "70%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(86)
         }
         break;
      case 87:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "49.1%"
            document.getElementById("fichaHumano").style.top = "73%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(87)
         }
         break;
      case 88:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "51.5%"
            document.getElementById("fichaHumano").style.top = "76%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(88)
         }
         break;
      case 89:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "54%"
            document.getElementById("fichaHumano").style.top = "78.25%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(89)
         }
         break;
      case 90:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "56.45%"
            document.getElementById("fichaHumano").style.top = "76%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(90)
         }
         break;
      case 91:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "46%"
            document.getElementById("fichaHumano").style.top = "76.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(91)
         }
         break;
      case 92:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "40.5%"
            document.getElementById("fichaHumano").style.top = "80%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(92)
         }
         break;
      case 93:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "39.5%"
            document.getElementById("fichaHumano").style.top = "73%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(93)
         }
         break;
      case 94:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "37.4%"
            document.getElementById("fichaHumano").style.top = "69%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(94)
         }
         break;
      case 95:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "37.4%"
            document.getElementById("fichaHumano").style.top = "62.4%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(95)
         }
         break;
      case 96:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "35.5%"
            document.getElementById("fichaHumano").style.top = "57.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(96)
         }
         break;
      case 97:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "73.1%"
            document.getElementById("fichaHumano").style.top = "66.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(97)
         }
      break;
      case 98:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "73.1%"
            document.getElementById("fichaHumano").style.top = "73.2%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(98)
         }
      break;
      case 99:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "75.3%"
            document.getElementById("fichaHumano").style.top = "76.9%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(99)
         }
      break;
      case 100:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "66.1%"
            document.getElementById("fichaHumano").style.top = "37%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(100)
         }
      break;
      case 101:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "68.4%"
            document.getElementById("fichaHumano").style.top = "33.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(101)
         }
      break;
      case 102:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "70.8%"
            document.getElementById("fichaHumano").style.top = "36.6%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(102)
         }
         break;
      case 103:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "73.2%"
            document.getElementById("fichaHumano").style.top = "33.5%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(103)
         }
      break;
      case 104:
      if(comprobarZH() == false){
         document.getElementById("fichaHumano").style.left = "75.6%"
         document.getElementById("fichaHumano").style.top = "36.6%"
         if(anterior == true){
            moverFichaZombie(posZombie)
         }
      }else{
         moverFichasIguales(104)
      }
      break;
      case 105:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "80.6%"
            document.getElementById("fichaHumano").style.top = "36.6%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(105)
         }
      break;
      case 106:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "30.6%"
            document.getElementById("fichaHumano").style.top = "35%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(106)
         }
      break;
      case 107:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "27.6%"
            document.getElementById("fichaHumano").style.top = "70%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(107)
         }
      break;
      case 108:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "51.6%"
            document.getElementById("fichaHumano").style.top = "24%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(108)
         }
      break;
      case 109:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "36%"
            document.getElementById("fichaHumano").style.top = "8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(109)
         }
      break;
      case 110:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "79.5%"
            document.getElementById("fichaHumano").style.top = "85%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(110)
         }
      break;
      case 111:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "74.5%"
            document.getElementById("fichaHumano").style.top = "11%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(111)
         }
      break;
      case 112:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "16%"
            document.getElementById("fichaHumano").style.top = "10%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(112)
         }
      break;
      case 113:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "16%"
            document.getElementById("fichaHumano").style.top = "30%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(113)
         }
      break;
      case 114:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "26.5%"
            document.getElementById("fichaHumano").style.top = "92%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(114)
         }
      break;
      case 115:
         if(comprobarZH() == false){
            document.getElementById("fichaHumano").style.left = "43.5%"
            document.getElementById("fichaHumano").style.top = "80%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(115)
         }
      break;
   }
   updateTaskBD(idBD, {posHumano : posHumano})
   turno = "zombie"
}

function moverFichaZombie(posZombieAux){
   var anterior = comprobarZH()
   posZombie = posZombieAux
   switch(posZombieAux){
      case 1:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "21.5%"
            document.getElementById("fichaZombie").style.top = "94%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(1)
         }
         break;
      case 2:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "19%"
            document.getElementById("fichaZombie").style.top = "91%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(2)
         }
         break;
      case 3:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "16.6%"
            document.getElementById("fichaZombie").style.top = "87.8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(3)
         }
         break;
      case 4:
            if(comprobarZH() == false){
                  document.getElementById("fichaZombie").style.left = "16.6%"
                  document.getElementById("fichaZombie").style.top = "80.9%"
                  if(anterior == true){
                     moverFichaHumano(posHumano)
                  }
               }else{
                  moverFichasIguales(4)
               }
               break;
      case 5:
            if(comprobarZH() == false){
               document.getElementById("fichaZombie").style.left = "18.5%"
               document.getElementById("fichaZombie").style.top = "75.5%"
               if(anterior == true){
                  moverFichaHumano(posHumano)
               }
            }else{
               moverFichasIguales(5)
            }
            break;
      case 6:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.8%"
            document.getElementById("fichaZombie").style.top = "72%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(6)
         }
         break;
      case 7:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.2%"
            document.getElementById("fichaZombie").style.top = "69%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(7)
         }
         break;
      case 8:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.2%"
            document.getElementById("fichaZombie").style.top = "62.2%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(8)
         }
         break;
      case 9:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.9%"
            document.getElementById("fichaZombie").style.top = "59%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(9)
         }
         break;
      case 10:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "18.5%"
            document.getElementById("fichaZombie").style.top = "55.8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(10)
         }
         break;
      case 11:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "18.5%"
            document.getElementById("fichaZombie").style.top = "49.1%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(11)
         }
         break;
      case 12:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "18.5%"
            document.getElementById("fichaZombie").style.top = "42.4%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(12)
         }
         break;
      case 13:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.85%"
            document.getElementById("fichaZombie").style.top = "39.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(13)
         }
         break;
      case 14:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.85%"
            document.getElementById("fichaZombie").style.top = "46%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(14)
         }
         break;
      case 15:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.2%"
            document.getElementById("fichaZombie").style.top = "49%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(15)
         }
         break;
      case 16:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.2%"
            document.getElementById("fichaZombie").style.top = "36.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(16)
         }
         break;
      case 17:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "25.6%"
            document.getElementById("fichaZombie").style.top = "33.6%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(17)
         }
         break;
      case 18:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "25.6%"
            document.getElementById("fichaZombie").style.top = "27%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(18)
         }
         break;
      case 19:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "25.6%"
            document.getElementById("fichaZombie").style.top = "20.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(19)
         }
         break;
      case 20:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.3%"
            document.getElementById("fichaZombie").style.top = "23.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(20)
         }
         break;
      case 21:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.9%"
            document.getElementById("fichaZombie").style.top = "26.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(21)
         }
         break;
      case 22:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "25.6%"
            document.getElementById("fichaZombie").style.top = "14%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(22)
         }
         break;
      case 23:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "23.2%"
            document.getElementById("fichaZombie").style.top = "11%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(23)
         }
         break;
      case 24:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "20.9%"
            document.getElementById("fichaZombie").style.top = "7.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(24)
         }
         break;
      case 25:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "28%"
            document.getElementById("fichaZombie").style.top = "11%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(25)
         }
         break;
      case 26:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "30.5%"
            document.getElementById("fichaZombie").style.top = "14%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(26)
         }
         break;
      case 27:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "32.8%"
            document.getElementById("fichaZombie").style.top = "17%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(27)
         }
         break;
      case 28:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "35.1%"
            document.getElementById("fichaZombie").style.top = "20.2%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(28)
         }
         break;
      case 29:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "35.1%"
            document.getElementById("fichaZombie").style.top = "27%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(29)
         }
         break;
      case 30:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "35.1%"
            document.getElementById("fichaZombie").style.top = "34%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(30)
         }
         break;
      case 31:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "25.6%"
            document.getElementById("fichaZombie").style.top = "52%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(31)
         }
         break;
      case 32:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "27.9%"
            document.getElementById("fichaZombie").style.top = "48.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(32)
         }
         break;
      case 33:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "30.4%"
            document.getElementById("fichaZombie").style.top = "45.4%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(33)
         }
         break;
      case 34:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "37.5%"
            document.getElementById("fichaZombie").style.top = "30.8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(34)
         }
         break;
      case 35:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "39.9%"
            document.getElementById("fichaZombie").style.top = "27.8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(35)
         }
         break;
      case 36:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "42.4%"
            document.getElementById("fichaZombie").style.top = "30.8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(36)
         }
         break;
      case 37:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "44.8%"
            document.getElementById("fichaZombie").style.top = "27.8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(37)
         }
         break;
      case 38:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "24%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(38)
         }
         break;
      case 39:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "37.4%"
            document.getElementById("fichaZombie").style.top = "37.8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(39)
         }
         break;
      case 40:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "39.6%"
            document.getElementById("fichaZombie").style.top = "41.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(40)
         }
         break;
      case 41:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "42.2%"
            document.getElementById("fichaZombie").style.top = "44%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(41)
         }
         break;
      case 42:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "44.6%"
            document.getElementById("fichaZombie").style.top = "47%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(42)
         }
         break;
      case 43:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "32.9%"
            document.getElementById("fichaZombie").style.top = "48%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(43)
         }
         break;
      case 44:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "35.4%"
            document.getElementById("fichaZombie").style.top = "50.9%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(44)
         }
         break;
      case 45:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "37.7%"
            document.getElementById("fichaZombie").style.top = "47%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(45)
         }
         break;
      case 46:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "50%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(46)
         }
         break;
      case 47:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "49.5%"
            document.getElementById("fichaZombie").style.top = "47%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(47)
         }
         break;
      case 48:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "51.7%"
            document.getElementById("fichaZombie").style.top = "43.2%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(48)
         }
         break;
      case 49:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "54.1%"
            document.getElementById("fichaZombie").style.top = "40.3%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(49)
         }
         break;
      case 50:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.5%"
            document.getElementById("fichaZombie").style.top = "37.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(50)
         }
         break;
      case 51:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.5%"
            document.getElementById("fichaZombie").style.top = "31%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(51)
         }
         break;
      case 52:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.5%"
            document.getElementById("fichaZombie").style.top = "24.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(52)
         }
         break;
      case 53:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.5%"
            document.getElementById("fichaZombie").style.top = "18.1%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(53)
         }
         break;
      case 54:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.5%"
            document.getElementById("fichaZombie").style.top = "11.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(54)
         }
         break;
      case 55:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "54.2%"
            document.getElementById("fichaZombie").style.top = "8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(55)
         }
         break;
      case 56:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "51.8%"
            document.getElementById("fichaZombie").style.top = "11.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(56)
         }
         break;
      case 57:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "49.5%"
            document.getElementById("fichaZombie").style.top = "8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(57)
         }
         break;
      case 58:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47.2%"
            document.getElementById("fichaZombie").style.top = "11.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(58)
         }
         break;
      case 59:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "44.8%"
            document.getElementById("fichaZombie").style.top = "8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(59)
         }
         break;
      case 60:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "42.4%"
            document.getElementById("fichaZombie").style.top = "11.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(60)
         }
         break;
      case 61:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "40%"
            document.getElementById("fichaZombie").style.top = "8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(61)
         }
         break;
      case 62:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "58.8%"
            document.getElementById("fichaZombie").style.top = "8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(62)
         }
         break;
      case 63:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "61.1%"
            document.getElementById("fichaZombie").style.top = "11.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(63)
         }
         break;
      case 64:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "63.3%"
            document.getElementById("fichaZombie").style.top = "8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(64)
         }
         break;
      case 65:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "65.5%"
            document.getElementById("fichaZombie").style.top = "11.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(65)
         }
         break;
      case 66:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "67.7%"
            document.getElementById("fichaZombie").style.top = "8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(66)
         }
         break;
      case 67:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "70%"
            document.getElementById("fichaZombie").style.top = "11.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(67)
         }
         break;
      case 68:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "58.8%"
            document.getElementById("fichaZombie").style.top = "34%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(68)
         }
         break;
      case 69:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "61.2%"
            document.getElementById("fichaZombie").style.top = "36.8%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(69)
         }
         break;
      case 70:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "63.6%"
            document.getElementById("fichaZombie").style.top = "34%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(70)
         }
         break;
      case 71:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "54%"
            document.getElementById("fichaZombie").style.top = "47%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(71)
         }
         break;
      case 72:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.2%"
            document.getElementById("fichaZombie").style.top = "51%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(72)
         }
         break;
      case 73:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "60.8%"
            document.getElementById("fichaZombie").style.top = "43.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(73)
         }
         break;
      case 74:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "58.5%"
            document.getElementById("fichaZombie").style.top = "47%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(74)
         }
         break;
      case 75:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.2%"
            document.getElementById("fichaZombie").style.top = "57.6%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(75)
         }
         break;
      case 76:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "58.7%"
            document.getElementById("fichaZombie").style.top = "60.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(76)
         }
         break;
      case 77:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "61%"
            document.getElementById("fichaZombie").style.top = "64%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(77)
         }
         break;
      case 78:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "63.3%"
            document.getElementById("fichaZombie").style.top = "67%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(78)
         }
         break;
      case 79:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "65.7%"
            document.getElementById("fichaZombie").style.top = "64%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(79)
         }
         break;
      case 80:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "68.2%"
            document.getElementById("fichaZombie").style.top = "66.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(80)
         }
         break;
      case 81:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "70.5%"
            document.getElementById("fichaZombie").style.top = "63%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(81)
         }
         break;
      case 82:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "61.1%"
            document.getElementById("fichaZombie").style.top = "70.6%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(82)
         }
         break;
      case 83:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "58.8%"
            document.getElementById("fichaZombie").style.top = "73.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(83)
         }
         break;
      case 84:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "56.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(84)
         }
         break;
      case 85:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "63.2%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(85)
         }
         break;
      case 86:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "47%"
            document.getElementById("fichaZombie").style.top = "70%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(86)
         }
         break;
      case 87:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "49.1%"
            document.getElementById("fichaZombie").style.top = "73%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(87)
         }
         break;
      case 88:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "51.5%"
            document.getElementById("fichaZombie").style.top = "76%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(88)
         }
         break;
      case 89:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "54%"
            document.getElementById("fichaZombie").style.top = "78.25%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(89)
         }
         break;
      case 90:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "56.45%"
            document.getElementById("fichaZombie").style.top = "76%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(90)
         }
         break;
      case 91:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "46%"
            document.getElementById("fichaZombie").style.top = "76.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(91)
         }
         break;
      case 92:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "40.5%"
            document.getElementById("fichaZombie").style.top = "80%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(92)
         }
         break;
      case 93:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "39.5%"
            document.getElementById("fichaZombie").style.top = "73%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(93)
         }
         break;
      case 94:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "37.4%"
            document.getElementById("fichaZombie").style.top = "69%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(94)
         }
         break;
      case 95:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "37.4%"
            document.getElementById("fichaZombie").style.top = "62.4%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(95)
         }
         break;
      case 96:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "35.5%"
            document.getElementById("fichaZombie").style.top = "57.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(96)
         }
         break;
      case 97:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "73.1%"
            document.getElementById("fichaZombie").style.top = "66.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(97)
         }
      break;
      case 98:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "73.1%"
            document.getElementById("fichaZombie").style.top = "73.2%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(98)
         }
      break;
      case 99:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "75.3%"
            document.getElementById("fichaZombie").style.top = "76.9%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(99)
         }
      break;
      case 100:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "66.1%"
            document.getElementById("fichaZombie").style.top = "37%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(100)
         }
      break;
      case 101:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "68.4%"
            document.getElementById("fichaZombie").style.top = "33.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(101)
         }
      break;
      case 102:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "70.8%"
            document.getElementById("fichaZombie").style.top = "36.6%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(102)
         }
      break;
      case 103:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "73.2%"
            document.getElementById("fichaZombie").style.top = "33.5%"
            if(anterior == true){
               moverFichaHumano(posHumano)
            }
         }else{
            moverFichasIguales(103)
         }
      break;
      case 104:
               if(comprobarZH() == false){
                  document.getElementById("fichaZombie").style.left = "75.6%"
                  document.getElementById("fichaZombie").style.top = "36.6%"
                  if(anterior == true){
                     moverFichaHumano(posHumano)
                  }
               }else{
                  moverFichasIguales(104)
               }
            break;
      case 105:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "80.6%"
            document.getElementById("fichaZombie").style.top = "36.6%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(105)
         }
      break;
      case 106:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "30.6%"
            document.getElementById("fichaZombie").style.top = "35%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(106)
         }
      break;
      case 107:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "27.6%"
            document.getElementById("fichaZombie").style.top = "70%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(107)
         }
      break;
      case 108:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "51.6%"
            document.getElementById("fichaZombie").style.top = "24%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(108)
         }
      break;
      case 109:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "36%"
            document.getElementById("fichaZombie").style.top = "8%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(109)
         }
      break;
      case 110:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "79.5%"
            document.getElementById("fichaZombie").style.top = "85%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(110)
         }
      break;
      case 111:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "74.5%"
            document.getElementById("fichaZombie").style.top = "11%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(111)
         }
      break;
      case 112:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "16%"
            document.getElementById("fichaZombie").style.top = "10%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(112)
         }
      break;
      case 113:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "16%"
            document.getElementById("fichaZombie").style.top = "30%"
            if(anterior == true){
               moverFichaZombie(posZombie)
            }
         }else{
            moverFichasIguales(113)
         }
      break;
      case 114:
               if(comprobarZH() == false){
                  document.getElementById("fichaZombie").style.left = "26.5%"
                  document.getElementById("fichaZombie").style.top = "92%"
                  if(anterior == true){
                     moverFichaZombie(posZombie)
                  }
               }else{
                  moverFichasIguales(114)
               }
            break;
      case 115:
         if(comprobarZH() == false){
            document.getElementById("fichaZombie").style.left = "43.5%"
            document.getElementById("fichaZombie").style.top = "80%"
            if(anterior == true){
               moverFichaZombie(posHumano)
            }
         }else{
            moverFichasIguales(115)
         }
      break;
   }
   updateTaskBD(idBD, {posZombie : posZombie})
   turno = "zombie"
}

function elegirPosicion(tirada, posAnterior, numero){
   mostrar("dado" + numero)
   switch(posAnterior){
      case 1:
         switch(tirada){
            case 1:
               ponerNegras([2, 114])
               break;
            case 2:
               ponerNegras([3])
               break;
            case 3:
               ponerNegras([4])
               break;
            case 4:
               ponerNegras([5])
               break;
            case 5:
               ponerNegras([6])
               break;
            case 6:
               ponerNegras([7])
               break;
         }
         break;
      case 2:
         switch(tirada){
            case 1:
               ponerNegras([1, 3])
               break;
            case 2:
               ponerNegras([4, 114])
               break;
            case 3:
               ponerNegras([5])
               break;
            case 4:
               ponerNegras([6])
               break;
            case 5:
               ponerNegras([7])
            break;
            case 6:
               ponerNegras([8, 107])
            break;
         }

            break;
      case 3:
         switch(tirada){
            case 1:
               ponerNegras([4, 2])
            break;
            case 2:
               ponerNegras([1, 5])
            break;
            case 3:
               ponerNegras([6, 114])
            break;
            case 4:
               ponerNegras([7])
            break;
            case 5:
               ponerNegras([8, 107])
            break;
            case 6:
               ponerNegras([9])
            break;
         }
         
            break;
      case 4:
            switch(tirada){
               case 1:
                  ponerNegras([3, 5])
               break;
               case 2:
                  ponerNegras([2, 6])
               break;
               case 3:
                  ponerNegras([1, 7])
               break;
               case 4:
                  ponerNegras([8, 107, 114])
               break;
               case 5:
                  ponerNegras([9])
               break;
               case 6:
                  ponerNegras([10])
               break;
            }
            break;
      case 5:
            switch(tirada){
               case 1:
                  ponerNegras([4, 6])
               break;
               case 2:
                  ponerNegras([3, 7])
               break;
               case 3:
                  ponerNegras([2, 8, 107])
               break;
               case 4:
                  ponerNegras([1, 9])
               break;
               case 5:
                  ponerNegras([10, 114])
               break;
               case 6:
                  ponerNegras([11])
               break;
            }
            break;
      case 6:
         switch(tirada){
            case 1:
               ponerNegras([5, 7])
            break;
            case 2:
               ponerNegras([4, 8, 107])
            break;
            case 3:
               ponerNegras([3, 9])
            break;
            case 4:
               ponerNegras([2, 10])
            break;
            case 5:
               ponerNegras([1, 11])
            break;
            case 6:
               ponerNegras([12, 114])
            break;
         }
         
         break;
      case 7:
         switch(tirada){
            case 1:
               ponerNegras([6, 8, 107])
            break;
            case 2:
               ponerNegras([5, 9])
            break;
            case 3:
               ponerNegras([4, 10])
            break;
            case 4:
               ponerNegras([3, 11])
            break;
            case 5:
               ponerNegras([2, 12])
            break;
            case 6:
               ponerNegras([1, 13, 14])
            break;
         }
         break;
      case 8:
         switch(tirada){
            case 1:
               ponerNegras([7, 9])
            break;
            case 2:
               ponerNegras([6, 10, 107])
            break;
            case 3:
               ponerNegras([5, 11])
            break;
            case 4:
               ponerNegras([4, 12])
            break;
            case 5:
               ponerNegras([3, 13, 14])
            break;
            case 6:
               ponerNegras([2, 15, 16])
            break;
         } 
         break;
      case 9:
         switch(tirada){
            case 1:
               ponerNegras([8, 10])
            break;
            case 2:
               ponerNegras([7, 11])
            break;
            case 3:
               ponerNegras([6, 12, 107])
            break;
            case 4:
               ponerNegras([5, 13, 14])
            break;
            case 5:
               ponerNegras([4, 15, 16])
            break;
            case 6:
               ponerNegras([3, 17, 31])
            break;
         }
         break;
      case 10:
         switch(tirada){
            case 1:
               ponerNegras([9, 11])
            break;
            case 2:
               ponerNegras([8, 12])
            break;
            case 3:
               ponerNegras([7, 13, 14])
            break;
            case 4:
               ponerNegras([6, 15, 16, 107])
            break;
            case 5:
               ponerNegras([5, 17, 31])
            break;
            case 6:
               ponerNegras([4, 18, 32])
            break;
         }
         break;
      case 11:
         switch(tirada){
            case 1:
               ponerNegras([10, 12])
            break;
            case 2:
               ponerNegras([9, 13, 14])
            break;
            case 3:
               ponerNegras([8, 15, 16])
            break;
            case 4:
               ponerNegras([7, 17, 31])
            break;
            case 5:
               ponerNegras([6, 18, 32, 107])
            break;
            case 6:
               ponerNegras([5, 19, 33])
            break;
         }
         
         break;
      case 12:
            switch(tirada){
               case 1:
                  ponerNegras([11, 13, 14])
               break;
               case 2:
                  ponerNegras([10, 15, 16])
               break;
               case 3:
                  ponerNegras([9, 17, 31])
               break;
               case 4:
                  ponerNegras([8, 18, 32])
               break;
               case 5:
                  ponerNegras([7, 19, 33])
               break;
               case 6:
                  ponerNegras([6, 20, 22, 43, 106, 107])
               break;
            }
         break;
      case 13:
            switch(tirada){
               case 1:
                  ponerNegras([12, 16])
               break;
               case 2:
                  ponerNegras([11, 14, 17])
               break;
               case 3:
                  ponerNegras([10, 15, 18])
               break;
               case 4:
                  ponerNegras([9, 19, 31])
               break;
               case 5:
                  ponerNegras([8, 20, 22, 32])
               break;
               case 6:
                  ponerNegras([7, 21, 23, 25, 33])
               break;
            }
         break;
      case 14:
         switch(tirada){
            case 1:
               ponerNegras([12, 15])
            break;
            case 2:
               ponerNegras([11, 13, 31])
            break;
            case 3:
               ponerNegras([10, 16, 32])
            break;
            case 4:
               ponerNegras([9, 17, 33])
            break;
            case 5:
               ponerNegras([8, 18, 43, 106])
            break;
            case 6:
               ponerNegras([7, 19, 44])
            break;
         }
         break;
      case 15:
            switch(tirada){
               case 1:
                  ponerNegras([14, 31])
               break;
               case 2:
                  ponerNegras([12, 32])
               break;
               case 3:
                  ponerNegras([11, 13, 33])
               break;
               case 4:
                  ponerNegras([10, 16, 43, 106])
               break;
               case 5:
                  ponerNegras([9, 17, 44])
               break;
               case 6:
                  ponerNegras([8, 18, 45, 96])
               break;
            }
         break;
      case 16:
         switch(tirada){
            case 1:
               ponerNegras([13, 17])
            break;
            case 2:
               ponerNegras([12, 18])
            break;
            case 3:
               ponerNegras([11, 19, 14])
            break;
            case 4:
               ponerNegras([10, 15, 20, 22])
            break;
            case 5:
               ponerNegras([9, 21, 23, 25, 31])
            break;
            case 6:
               ponerNegras([8, 24, 26, 32, 113])
            break;
         }
         break;
      case 17:
         switch(tirada){
            case 1:
               ponerNegras([16, 18])
            break;
            case 2:
               ponerNegras([13, 19])
            break;
            case 3:
               ponerNegras([12, 20, 22])
            break;
            case 4:
               ponerNegras([11, 14, 21, 23, 25])
            break;
            case 5:
               ponerNegras([10, 15, 24, 26, 113])
            break;
            case 6:
               ponerNegras([9, 27, 31, 112])
            break;
         }
         break;
      case 18:
         switch(tirada){
            case 1:
               ponerNegras([17, 19])
            break;
            case 2:
               ponerNegras([16, 20, 22])
            break;
            case 3:
               ponerNegras([13, 21, 23, 25])
            break;
            case 4:
               ponerNegras([12, 24, 26, 113])
            break;
            case 5:
               ponerNegras([11, 14, 27, 112])
            break;
            case 6:
               ponerNegras([10, 15, 28, 109])
            break;
         }
         break;
      case 19:
            switch(tirada){
               case 1:
                  ponerNegras([18, 20, 22])
               break;
               case 2:
                  ponerNegras([17, 21, 23, 25])
               break;
               case 3:
                  ponerNegras([16, 24, 26, 113])
               break;
               case 4:
                  ponerNegras([13, 27, 112])
               break;
               case 5:
                  ponerNegras([12, 28, 109])
               break;
               case 6:
                  ponerNegras([11, 14, 29])
               break;
            }
         break;
      case 20:
            switch(tirada){
               case 1:
                  ponerNegras([19, 21])
               break;
               case 2:
                  ponerNegras([18, 22, 113])
               break;
               case 3:
                  ponerNegras([17, 23, 25])
               break;
               case 4:
                  ponerNegras([16, 24, 26])
               break;
               case 5:
                  ponerNegras([13, 27, 112])
               break;
               case 6:
                  ponerNegras([12, 28, 109])
               break;
            }
         break;
      case 21:
            switch(tirada){
               case 1:
                  ponerNegras([20, 113])
               break;
               case 2:
                  ponerNegras([19])
               break;
               case 3:
                  ponerNegras([18, 22])
               break;
               case 4:
                  ponerNegras([17, 23, 25])
               break;
               case 5:
                  ponerNegras([16, 24, 26])
               break;
               case 6:
                  ponerNegras([13, 27, 112])
               break;
            }
         break;
      case 22:
            switch(tirada){
               case 1:
                  ponerNegras([19, 23, 25])
               break;
               case 2:
                  ponerNegras([18, 20, 24, 26])
               break;
               case 3:
                  ponerNegras([17, 21, 27, 112])
               break;
               case 4:
                  ponerNegras([16, 28, 109, 113])
               break;
               case 5:
                  ponerNegras([13, 29])
               break;
               case 6:
                  ponerNegras([12, 30])
               break;
            }
         break;
      case 23:
            switch(tirada){
               case 1:
                  ponerNegras([22, 24])
               break;
               case 2:
                  ponerNegras([19, 25, 112])
               break;
               case 3:
                  ponerNegras([18, 20, 26])
               break;
               case 4:
                  ponerNegras([17, 21, 27])
               break;
               case 5:
                  ponerNegras([16, 28, 109, 113])
               break;
               case 6:
                  ponerNegras([13, 29])
               break;
            }
         break;
      case 24:
         switch(tirada){
            case 1:
               ponerNegras([23, 112])
            break;
            case 2:
               ponerNegras([22])
            break;
            case 3:
               ponerNegras([19, 25])
            break;
            case 4:
               ponerNegras([18, 20, 26])
            break;
            case 5:
               ponerNegras([17, 21, 27])
            break;
            case 6:
               ponerNegras([16, 28, 109, 113])
            break;
         }
         break;
      case 25:
         switch(tirada){
            case 1:
               ponerNegras([22, 26])
            break;
            case 2:
               ponerNegras([19, 23, 27])
            break;
            case 3:
               ponerNegras([18, 20, 24, 28, 109])
            break;
            case 4:
               ponerNegras([17, 21, 29, 112])
            break;
            case 5:
               ponerNegras([16, 30, 113])
            break;
            case 6:
               ponerNegras([13, 34, 39])
            break;
         }
         break;
      case 26:
         switch(tirada){
            case 1:
               ponerNegras([25, 27])
            break;
            case 2:
               ponerNegras([22, 28, 109])
            break;
            case 3:
               ponerNegras([19, 23, 29])
            break;
            case 4:
               ponerNegras([18, 20, 24, 30])
            break;
            case 5:
               ponerNegras([17, 21, 34, 39, 112])
            break;
            case 6:
               ponerNegras([16, 35, 40, 113])
            break;
         }
         break;
      case 27:
         switch(tirada){
            case 1:
               ponerNegras([26, 28, 109])
            break;
            case 2:
               ponerNegras([25, 29])
            break;
            case 3:
               ponerNegras([22, 30])
            break;
            case 4:
               ponerNegras([19, 23, 34, 39])
            break;
            case 5:
               ponerNegras([18, 20, 24, 35, 40])
            break;
            case 6:
               ponerNegras([17, 21, 36, 41, 45, 112])
            break;
         }
         break;
      case 28:
         switch(tirada){
            case 1:
               ponerNegras([27, 29])
            break;
            case 2:
               ponerNegras([26, 30, 109])
            break;
            case 3:
               ponerNegras([25, 34, 39])
            break;
            case 4:
               ponerNegras([22, 35, 40])
            break;
            case 5:
               ponerNegras([19, 23, 36, 41, 45])
            break;
            case 6:
               ponerNegras([18, 20, 24, 37, 42, 44])
            break;
         }
         break;
      case 29:
         switch(tirada){
            case 1:
               ponerNegras([28, 30])
            break;
            case 2:
               ponerNegras([27, 34, 39])
            break;
            case 3:
               ponerNegras([26, 35, 40, 109])
            break;
            case 4:
               ponerNegras([25, 36, 41, 45])
            break;
            case 5:
               ponerNegras([22, 37, 42, 44])
            break;
            case 6:
               ponerNegras([19, 23, 38, 43, 46, 96])
            break;
         }
         break;
      case 30:
         switch(tirada){
            case 1:
               ponerNegras([29, 34, 39])
            break;
            case 2:
               ponerNegras([28, 35, 40])
            break;
            case 3:
               ponerNegras([27, 36, 41, 45])
            break;
            case 4:
               ponerNegras([26, 37, 42, 44, 109])
            break;
            case 5:
               ponerNegras([25, 38, 43, 46, 96])
            break;
            case 6:
               ponerNegras([22, 33, 47, 84, 95, 108])
            break;
         }
         break;
      case 31:
         switch(tirada){
            case 1:
               ponerNegras([15, 32])
            break;
            case 2:
               ponerNegras([14, 33])
            break;
            case 3:
               ponerNegras([12, 43, 106])
            break;
            case 4:
               ponerNegras([11, 13, 44])
            break;
            case 5:
               ponerNegras([10, 16, 45, 96])
            break;
            case 6:
               ponerNegras([9, 17, 40, 95])
            break;
         }
         break;
      case 32:
         switch(tirada){
            case 1:
               ponerNegras([31, 33])
            break;
            case 2:
               ponerNegras([15, 43, 106])
            break;
            case 3:
               ponerNegras([14, 44])
            break;
            case 4:
               ponerNegras([12, 45, 96])
            break;
            case 5:  
               ponerNegras([11, 13, 40, 95])
            break;
            case 6:
               ponerNegras([10, 16, 39, 41, 94])
            break;
         }
         break;
      case 33:
         switch(tirada){
            case 1:
               ponerNegras([32, 43, 106])
            break;
            case 2:
               ponerNegras([31, 44])
            break;
            case 3:
               ponerNegras([15, 45, 96])
            break;
            case 4:
               ponerNegras([14, 40, 95])
            break;
            case 5:
               ponerNegras([12, 39, 41, 94])
            break;
            case 6:
               ponerNegras([11, 13, 30, 42, 93])
            break;
         }
         break;
      case 34:
         switch(tirada){
            case 1:
               ponerNegras([30, 35])
            break;
            case 2:
               ponerNegras([29, 36, 39])
            break;
            case 3:
               ponerNegras([28, 37, 40])
            break;
            case 4:
               ponerNegras([27, 38, 41, 45])
            break;
            case 5:
               ponerNegras([26, 42, 44, 108, 109])
            break;
            case 6:
               ponerNegras([25, 43, 46, 96])
            break;
         }
         break;
      case 35:
         switch(tirada){
            case 1:
               ponerNegras([34, 36])
            break;
            case 2:
               ponerNegras([30, 37])
            break;
            case 3:
               ponerNegras([29, 38, 39])
            break;
            case 4:
               ponerNegras([28, 40, 108])
            break;
            case 5:
               ponerNegras([27, 41, 45])
            break;
            case 6:
               ponerNegras([26, 42, 44, 109])
            break;
         }
         break;
      case 36:
         switch(tirada){
            case 1:
               ponerNegras([35, 37])
            break;
            case 2:
               ponerNegras([34, 38])
            break;
            case 3:
               ponerNegras([30, 108])
            break;
            case 4:
               ponerNegras([29, 39])
            break;
            case 5:
               ponerNegras([28, 40])
            break;
            case 6:
               ponerNegras([27, 41, 45])
            break;
         }         
         break;
      case 37:
         switch(tirada){
            case 1:
               ponerNegras([36, 38])
            break;
            case 2:
               ponerNegras([35, 108])
            break;
            case 3:
               ponerNegras([34])
            break;
            case 4:
               ponerNegras([30])
            break;
            case 5:
               ponerNegras([29, 39])
            break;
            case 6:
               ponerNegras([28, 40])
            break;
         }       
         break;
      case 38:
         switch(tirada){
            case 1:
               ponerNegras([37, 108])
            break;
            case 2:
               ponerNegras([36])
            break;
            case 3:
               ponerNegras([35])
            break;
            case 4:
               ponerNegras([34])
            break;
            case 5:
               ponerNegras([30])
            break;
            case 6:
               ponerNegras([29, 39])
            break;
         }
         break;
      case 39:
         switch(tirada){
            case 1:
               ponerNegras([30, 40])
            break;
            case 2:
               ponerNegras([29, 34, 41, 45])
            break;
            case 3:
               ponerNegras([28, 35, 42, 44])
            break;
            case 4:
               ponerNegras([27, 36, 43, 46, 96])
            break;
            case 5:
               ponerNegras([26, 33, 37, 47, 84, 95, 109])
            break;
            case 6:
               ponerNegras([25, 32, 38, 48, 85, 94, 106])
            break;
         }
         break;
      case 40:
         switch(tirada){
            case 1:
               ponerNegras([39, 41, 45])
            break;
            case 2:
               ponerNegras([30, 42, 44])
            break;
            case 3:
               ponerNegras([29, 34, 43, 46, 96])
            break;
            case 4:
               ponerNegras([28, 33, 35, 47, 84, 95])
            break;
            case 5:
               ponerNegras([27, 32, 36, 48, 85, 94, 106])
            break;
            case 6:
               ponerNegras([26, 32, 37, 49, 71, 86, 93, 109])
            break;
         }
         break;
      case 41:
         switch(tirada){
            case 1:
               ponerNegras([40, 42])
            break;
            case 2:
               ponerNegras([39, 45, 46])
            break;
            case 3:
               ponerNegras([30, 44, 47, 84])
            break;
            case 4:
               ponerNegras([29, 34, 43, 48, 85, 96])
            break;
            case 5:
               ponerNegras([28, 33, 35, 49, 71, 86, 95])
            break;
            case 6:
               ponerNegras([27, 32, 36, 50, 72, 87, 91, 94, 106])
            break;
         }
         break;
      case 42:
         switch(tirada){
            case 1:
               ponerNegras([41, 46])
            break;
            case 2:
               ponerNegras([40, 47, 84])
            break;
            case 3:
               ponerNegras([39, 45, 48, 85])
            break;
            case 4:
               ponerNegras([30, 44, 49, 71, 86])
            break;
            case 5:
               ponerNegras([29, 34, 43, 50, 72, 87, 91, 96])
            break;
            case 6:
               ponerNegras([28, 33, 35, 51, 68, 74, 75, 88, 95, 115])
            break;
         }
         break;
      case 43:
         switch(tirada){
            case 1:
               ponerNegras([33, 44])
            break;
            case 2:
               ponerNegras([32, 45, 96, 106])
            break;
            case 3:
               ponerNegras([31, 40, 95])
            break;
            case 4:
               ponerNegras([15, 39, 41, 94])
            break;
            case 5:
               ponerNegras([14, 30, 42, 93])
            break;
            case 6:
               ponerNegras([12, 29, 34, 46, 92])
            break;
         }
         break;
      case 44:
         switch(tirada){
            case 1:
               ponerNegras([43, 45, 96])
            break;
            case 2:
               ponerNegras([33, 40, 95])
            break;
            case 3:
               ponerNegras([32, 39, 41, 94, 106])
            break;
            case 4:
               ponerNegras([31, 30, 42, 93])
            break;
            case 5:
               ponerNegras([15, 29, 34, 46, 92])
            break;
            case 6:
               ponerNegras([14, 28, 35, 47, 84, 115])
            break;
         }
         break;
      case 45:
         switch(tirada){
            case 1:
               ponerNegras([44, 40])
            break;
            case 2:
               ponerNegras([43, 39, 41, 96])
            break;
            case 3:
               ponerNegras([33, 30, 42, 95])
            break;
            case 4:
               ponerNegras([32, 29, 34, 46, 94, 106])
            break;
            case 5:
               ponerNegras([31, 28, 35, 47, 84, 93])
            break;
            case 6:
               ponerNegras([15, 27, 36, 48, 85, 92])
            break;
         }
         break;
      case 46:
         switch(tirada){
            case 1:
               ponerNegras([42, 47, 84])
            break;
            case 2:
               ponerNegras([41, 48, 85])
            break;
            case 3:
               ponerNegras([40, 49, 71, 86])
            break;
            case 4:
               ponerNegras([39, 45, 50, 72, 87, 91])
            break;
            case 5:
               ponerNegras([30, 44, 51, 68, 74, 75, 88, 115])
            break;
            case 6:
               ponerNegras([29, 34, 43, 52, 69, 73, 74, 89, 96])
            break;
         }
         break;
      case 47:
         switch(tirada){
            case 1:
               ponerNegras([46, 48])
            break;
            case 2:
               ponerNegras([42, 49, 71, 84])
            break;
            case 3:
               ponerNegras([41, 50, 72, 85])
            break;
            case 4:
               ponerNegras([40, 51, 68, 74, 75, 86])
            break;
            case 5:
               ponerNegras([39, 45, 52, 69, 73, 76, 87, 91])
            break;
            case 6:
               ponerNegras([30, 44, 53, 70, 77, 88, 115])
            break;
         }
         break;
      case 48:
         switch(tirada){
            case 1:
               ponerNegras([47, 49, 71])
            break;
            case 2:
               ponerNegras([46, 50, 72])
            break;
            case 3:
               ponerNegras([42, 51, 68, 74, 84])
            break;
            case 4:
               ponerNegras([41, 52, 69, 73, 76, 85])
            break;
            case 5:
               ponerNegras([40, 53, 69, 70, 73, 77, 86])
            break;
            case 6:
               ponerNegras([39, 45, 54, 68, 70, 74, 78, 82, 87, 91, 100])
            break;
         }
         break;
      case 49:
         switch(tirada){
            case 1:
               ponerNegras([48, 50])
            break;
            case 2:
               ponerNegras([47, 51, 68, 71])
            break;
            case 3:
               ponerNegras([46, 52, 69, 72])
            break;
            case 4:
               ponerNegras([42, 53, 70, 73, 74, 75, 84])
            break;
            case 5:
               ponerNegras([41, 54, 73, 74, 76, 85, 100])
            break;
            case 6:
               ponerNegras([40, 55, 62, 69, 72, 77, 86, 101])
            break;
         }
         break;
      case 50:
         switch(tirada){
            case 1:
               ponerNegras([49, 51, 68])
            break;
            case 2:
               ponerNegras([48, 52, 69])
            break;
            case 3:
               ponerNegras([47, 53, 70, 71, 73])
            break;
            case 4:
               ponerNegras([46, 54, 72, 74, 100])
            break;
            case 5:
               ponerNegras([42, 55, 62, 72, 74, 75, 84, 101])
            break;
            case 6:
               ponerNegras([41, 56, 63, 71, 73, 75, 76, 85, 102])
            break;
         }
         break;
      case 51:
         switch(tirada){
            case 1:
               ponerNegras([50, 52, 68])
            break;
            case 2:
               ponerNegras([49, 53, 69])
            break;
            case 3:
               ponerNegras([48, 54, 70, 73])
            break;
            case 4:
               ponerNegras([47, 55, 62, 71, 74, 100])
            break;
            case 5:
               ponerNegras([46, 56, 63, 72, 101])
            break;
            case 6:
               ponerNegras([42, 57, 64, 71, 74, 75, 84, 102])
            break;
         }
         break;
      case 52:
         switch(tirada){
            case 1:
               ponerNegras([51, 53])
            break;
            case 2:
               ponerNegras([50, 54, 68])
            break;
            case 3:
               ponerNegras([49, 55, 62, 69])
            break;
            case 4:
               ponerNegras([48, 56, 63, 70, 73])
            break;
            case 5:
               ponerNegras([47, 57, 64, 71, 74, 100])
            break;
            case 6:
               ponerNegras([46, 58, 65, 72, 101])
            break;
         }
         break;
      case 53:
         switch(tirada){
            case 1:
               ponerNegras([52, 54])
            break;
            case 2:
               ponerNegras([51, 55, 62])
            break;
            case 3:
               ponerNegras([50, 56, 63, 68])
            break;
            case 4:
               ponerNegras([49, 57, 64, 69])
            break;
            case 5:
               ponerNegras([48, 58, 65, 70, 73])
            break;
            case 6:
               ponerNegras([47, 59, 66, 71, 74, 100])
            break;
         }
         break;
      case 54:
         switch(tirada){
            case 1:
               ponerNegras([53, 55, 62])
            break;
            case 2:
               ponerNegras([52, 56, 63])
            break;
            case 3:
               ponerNegras([51, 57, 64])
            break;
            case 4:
               ponerNegras([50, 58, 65, 68])
            break;
            case 5:
               ponerNegras([49, 59, 66, 69])
            break;
            case 6:
               ponerNegras([48, 60, 67, 70, 73])
            break;
         }
         break;
      case 55:
         switch(tirada){
            case 1:
               ponerNegras([54, 56])
            break;
            case 2:
               ponerNegras([53, 57, 62])
            break;
            case 3:
               ponerNegras([52, 58, 63])
            break;
            case 4:
               ponerNegras([51, 59, 64])
            break;
            case 5:
               ponerNegras([50, 60, 65, 68])
            break;
            case 6:
               ponerNegras([49, 61, 66, 69])
            break;
         }
         break;
      case 56:
         switch(tirada){
            case 1:
               ponerNegras([55, 57])
            break;
            case 2:
               ponerNegras([54, 58])
            break;
            case 3:
               ponerNegras([53, 59, 62])
            break;
            case 4:
               ponerNegras([52, 60, 63])
            break;
            case 5:
               ponerNegras([51, 61, 64])
            break;
            case 6:
               ponerNegras([50, 65, 68, 109])
            break;
         }
         break;
      case 57:
         switch(tirada){
            case 1:
               ponerNegras([56, 58])
            break;
            case 2:
               ponerNegras([55, 59])
            break;
            case 3:
               ponerNegras([54, 60])
            break;
            case 4:
               ponerNegras([53, 61, 62])
            break;
            case 5:
               ponerNegras([52, 63, 109])
            break;
            case 6:
               ponerNegras([51, 64])
            break;
         }
         break;
      case 58:
         switch(tirada){
            case 1:
               ponerNegras([57, 59])
            break;
            case 2:
               ponerNegras([56, 60])
            break;
            case 3:
               ponerNegras([55, 61])
            break;
            case 4:
               ponerNegras([54, 109])
            break;
            case 5:
               ponerNegras([53, 62])
            break;
            case 6:
               ponerNegras([52, 63])
            break;
         }
         break;
      case 59:
         switch(tirada){
            case 1:
               ponerNegras([58, 60])
            break;
            case 2:
               ponerNegras([57, 61])
            break;
            case 3:
               ponerNegras([56, 109])
            break;
            case 4:
               ponerNegras([55])
            break;
            case 5:
               ponerNegras([54])
            break;
            case 6:
               ponerNegras([53, 62])
            break;
         }
         break;
      case 60:
         switch(tirada){
            case 1:
               ponerNegras([59, 61])
            break;
            case 2:
               ponerNegras([58, 109])
            break;
            case 3:
               ponerNegras([57])
            break;
            case 4:
               ponerNegras([56])
            break;
            case 5:
               ponerNegras([55])
            break;
            case 6:
               ponerNegras([54])
            break;
         }
         break;
      case 61:
         switch(tirada){
            case 1:
               ponerNegras([60, 109])
            break;
            case 2:
               ponerNegras([59])
            break;
            case 3:
               ponerNegras([58])
            break;
            case 4:
               ponerNegras([57])
            break;
            case 5:
               ponerNegras([56])
            break;
            case 6:
               ponerNegras([55])
            break;
         }
         break;
      case 62:
         switch(tirada){
            case 1:
               ponerNegras([54, 63])
            break;
            case 2:
               ponerNegras([53, 55, 64])
            break;
            case 3:
               ponerNegras([52, 56, 65])
            break;
            case 4:
               ponerNegras([51, 57, 66])
            break;
            case 5:
               ponerNegras([50, 58, 67, 68])
            break;
            case 6:
               ponerNegras([49, 59, 69, 111])
            break;
         }
         break;
      case 63:
         switch(tirada){
            case 1:
               ponerNegras([62, 64])
            break;
            case 2:
               ponerNegras([54, 65])
            break;
            case 3:
               ponerNegras([53, 55, 66])
            break;
            case 4:
               ponerNegras([52, 56, 67])
            break;
            case 5:
               ponerNegras([51, 57, 111])
            break;
            case 6:
               ponerNegras([50, 58, 68])
            break;
         }
         break;
      case 64:
         switch(tirada){
            case 1:
               ponerNegras([63, 65])
            break;
            case 2:
               ponerNegras([62, 66])
            break;
            case 3:
               ponerNegras([54, 67])
            break;
            case 4:
               ponerNegras([53, 55, 111])
            break;
            case 5:
               ponerNegras([52, 56])
            break;
            case 6:
               ponerNegras([51, 67])
            break;
         }
         break;
      case 65:
         switch(tirada){
            case 1:
               ponerNegras([64, 66])
            break;
            case 2:
               ponerNegras([63, 67])
            break;
            case 3:
               ponerNegras([62, 111])
            break;
            case 4:
               ponerNegras([54])
            break;
            case 5:
               ponerNegras([53, 55])
            break;
            case 6:
               ponerNegras([52, 56])
            break;
         }
         break;
      case 66:
         switch(tirada){
            case 1:
               ponerNegras([65, 67])
            break;
            case 2:
               ponerNegras([64, 111])
            break;
            case 3:
               ponerNegras([63])
            break;
            case 4:
               ponerNegras([62])
            break;
            case 5:
               ponerNegras([54])
            break;
            case 6:
               ponerNegras([53, 55])
            break;
         }
         break;
      case 67:
         switch(tirada){
            case 1:
               ponerNegras([66, 111])
            break;
            case 2:
               ponerNegras([65])
            break;
            case 3:
               ponerNegras([64])
            break;
            case 4:
               ponerNegras([63])
            break;
            case 5:
               ponerNegras([62])
            break;
            case 6:
               ponerNegras([54])
            break;
         }
         break;
      case 68:
         switch(tirada){
            case 1:
               ponerNegras([50, 51, 69])
            break;
            case 2:
               ponerNegras([49, 52, 70, 73])
            break;
            case 3:
               ponerNegras([48, 53, 74, 100])
            break;
            case 4:
               ponerNegras([47, 54, 71, 72, 101])
            break;
            case 5:
               ponerNegras([46, 55, 62, 71, 72, 75, 102])
            break;
            case 6:
               ponerNegras([42, 48, 56, 63, 74, 75, 84, 103])
            break;
         }
         break;
      case 69:
         switch(tirada){
            case 1:
               ponerNegras([68, 70, 73])
            break;
            case 2:
               ponerNegras([50, 51, 74, 100])
            break;
            case 3:
               ponerNegras([49, 52, 72, 101])
            break;
            case 4:
               ponerNegras([48, 53, 71, 75, 102])
            break;
            case 5:
               ponerNegras([47, 48, 54, 71, 76, 103])
            break;
            case 6:
               ponerNegras([46, 47, 49, 55, 62, 72, 77, 104])
            break;
         }
         break;
      case 70:
         switch(tirada){
            case 1:
               ponerNegras([69, 100])
            break;
            case 2:
               ponerNegras([68, 73, 101])
            break;
            case 3:
               ponerNegras([50, 51, 74, 102])
            break;
            case 4:
               ponerNegras([49, 52, 72, 103])
            break;
            case 5:
               ponerNegras([48, 53, 71, 75, 104])
            break;
            case 6:
               ponerNegras([47, 48, 54, 71, 76, 105])
            break;
         }
         break;
      case 71:
         switch(tirada){
            case 1:
               ponerNegras([48, 72])
            break;
            case 2:
               ponerNegras([47, 49, 74, 75])
            break;
            case 3:
               ponerNegras([46, 50, 73, 76])
            break;
            case 4:
               ponerNegras([42, 84, 51, 68, 69, 77])
            break;
            case 5:
               ponerNegras([41, 52, 68, 69, 70, 78, 82, 85])
            break;
            case 6:
               ponerNegras([40, 51, 50, 53, 73, 79, 83, 86, 100])
            break;
         }
         break;
      case 72:
         switch(tirada){
            case 1:
               ponerNegras([71, 74, 75])
            break;
            case 2:
               ponerNegras([48, 73, 76])
            break;
            case 3:
               ponerNegras([47, 49, 69, 77])
            break;
            case 4:
               ponerNegras([46, 50, 68, 70, 78, 82])
            break;
            case 5:
               ponerNegras([42, 50, 51, 68, 79, 83, 84, 100])
            break;
            case 6:
               ponerNegras([41, 49, 52, 69, 80, 85, 90, 101])
            break;
         }
         break;
      case 73:
         switch(tirada){
            case 1:
               ponerNegras([69, 74])
            break;
            case 2:
               ponerNegras([68, 70, 72])
            break;
            case 3:
               ponerNegras([50, 51, 71, 75, 100])
            break;
            case 4:
               ponerNegras([48, 49, 52, 76, 101])
            break;
            case 5:
               ponerNegras([47, 48, 49, 53, 77, 102])
            break;
            case 6:
               ponerNegras([46, 50, 54, 71, 78, 82, 103])
            break;
         }
         break;
      case 74:
         switch(tirada){
            case 1:
               ponerNegras([72, 73])
            break;
            case 2:
               ponerNegras([69, 71, 75])
            break;
            case 3:
               ponerNegras([48, 68, 70, 76])
            break;
            case 4:
               ponerNegras([47, 49, 50, 51, 77, 100])
            break;
            case 5:
               ponerNegras([46, 49, 50, 52, 78, 82, 101])
            break;
            case 6:
               ponerNegras([42, 48, 51, 53, 68, 83, 84, 79, 102])
            break;
         }
         break;
      case 75:
         switch(tirada){
            case 1:
               ponerNegras([72, 76])
            break;
            case 2:
               ponerNegras([71, 74, 77])
            break;
            case 3:
               ponerNegras([48, 73, 78, 82])
            break;
            case 4:
               ponerNegras([47, 49, 69, 79, 83])
            break;
            case 5:
               ponerNegras([46, 50, 68, 70, 80, 90])
            break;
            case 6:
               ponerNegras([42, 50, 51, 68, 81, 84, 89, 100])
            break;
         }
         break;
      case 76:
         switch(tirada){
            case 1:
               ponerNegras([75, 77])
            break;
            case 2:
               ponerNegras([72, 78, 82])
            break;
            case 3:
               ponerNegras([71, 74, 79, 83])
            break;
            case 4:
               ponerNegras([48, 73, 80, 90])
            break;
            case 5:
               ponerNegras([47, 49, 69, 81, 89])
            break;
            case 6:
               ponerNegras([46, 50, 68, 70, 88, 97])
            break;
         }
         break;
      case 77:
         switch(tirada){
            case 1:
               ponerNegras([76, 78, 82])
            break;
            case 2:
               ponerNegras([75, 79, 83])
            break;
            case 3:
               ponerNegras([72, 80, 90])
            break;
            case 4:
               ponerNegras([71, 74, 81, 89])
            break;
            case 5:
               ponerNegras([48, 73, 88, 97])
            break;
            case 6:
               ponerNegras([47, 49, 69, 87, 98])
            break;
         }
         break;
      case 78:
         switch(tirada){
            case 1:
               ponerNegras([77, 79, 82])
            break;
            case 2:
               ponerNegras([76, 80, 83])
            break;
            case 3:
               ponerNegras([75, 81, 90])
            break;
            case 4:
               ponerNegras([72, 89, 97])
            break;
            case 5:
               ponerNegras([71, 74, 88, 98])
            break;
            case 6:
               ponerNegras([48, 73, 87, 99])
            break;
         }
         break;
      case 79:
         switch(tirada){
            case 1:
               ponerNegras([78, 80])
            break;
            case 2:
               ponerNegras([77, 81, 82])
            break;
            case 3:
               ponerNegras([76, 83, 97])
            break;
            case 4:
               ponerNegras([75, 90, 98])
            break;
            case 5:
               ponerNegras([72, 89, 99])
            break;
            case 6:
               ponerNegras([71, 74, 88, 110])
            break;
         }
         break;
      case 80:
         switch(tirada){
            case 1:
               ponerNegras([79, 81])
            break;
            case 2:
               ponerNegras([78, 97])
            break;
            case 3:
               ponerNegras([77, 82, 98])
            break;
            case 4:
               ponerNegras([76, 83, 99])
            break;
            case 5:
               ponerNegras([75, 90, 110])
            break;
            case 6:
               ponerNegras([72, 89])
            break;
         }
         break;
      case 81:
         switch(tirada){
            case 1:
               ponerNegras([80, 97])
            break;
            case 2:
               ponerNegras([79, 98])
            break;
            case 3:
               ponerNegras([78, 99])
            break;
            case 4:
               ponerNegras([77, 82, 110])
            break;
            case 5:
               ponerNegras([76, 83])
            break;
            case 6:
               ponerNegras([75, 90])
            break;
         }
         break;
      case 82:
         switch(tirada){
            case 1:
               ponerNegras([77, 78, 83])
            break;
            case 2:
               ponerNegras([76, 79, 90])
            break;
            case 3:
               ponerNegras([75, 80, 89])
            break;
            case 4:
               ponerNegras([72, 81, 88])
            break;
            case 5:
               ponerNegras([71, 74, 87, 97])
            break;
            case 6:
               ponerNegras([48, 73, 86, 91, 98])
            break;
         }
         break;
      case 83:
         switch(tirada){
            case 1:
               ponerNegras([82, 90])
            break;
            case 2:
               ponerNegras([77, 78, 89])
            break;
            case 3:
               ponerNegras([76, 79, 88])
            break;
            case 4:
               ponerNegras([75, 80, 87])
            break;
            case 5:
               ponerNegras([72, 81, 86, 91])
            break;
            case 6:
               ponerNegras([71, 74, 85, 97])
            break;
         }
         break;
      case 84:
         switch(tirada){
            case 1:
               ponerNegras([46, 85])
            break;
            case 2:
               ponerNegras([42, 47, 86])
            break;
            case 3:
               ponerNegras([41, 48, 87, 91])
            break;
            case 4:
               ponerNegras([40, 49, 71, 88, 115])
            break;
            case 5:
               ponerNegras([39, 45, 50, 72, 89])
            break;
            case 6:
               ponerNegras([30, 44, 51, 68, 74, 75, 90])
            break;
         }
         break;
      case 85:
         switch(tirada){
            case 1:
               ponerNegras([84, 86])
            break;
            case 2:
               ponerNegras([46, 87, 91])
            break;
            case 3:
               ponerNegras([42, 47, 88, 115])
            break;
            case 4:
               ponerNegras([41, 48, 89])
            break;
            case 5:
               ponerNegras([40, 49, 71, 90])
            break;
            case 6:
               ponerNegras([39, 45, 50, 72, 83])
            break;
         }
         break;
      case 86:
         switch(tirada){
            case 1:
               ponerNegras([85, 87, 91])
            break;
            case 2:
               ponerNegras([84, 88, 115])
            break;
            case 3:
               ponerNegras([46, 89])
            break;
            case 4:
               ponerNegras([42, 47, 90])
            break;
            case 5:
               ponerNegras([41, 48, 83])
            break;
            case 6:
               ponerNegras([40, 49, 71, 82])
            break;
         }
         break;
      case 87:
         switch(tirada){
            case 1:
               ponerNegras([86, 88])
            break;
            case 2:
               ponerNegras([85, 89, 91])
            break;
            case 3:
               ponerNegras([84, 90, 115])
            break;
            case 4:
               ponerNegras([46, 83])
            break;
            case 5:
               ponerNegras([42, 47, 82])
            break;
            case 6:
               ponerNegras([41, 48, 77, 78])
            break;
         }
         break;
      case 88:
         switch(tirada){
            case 1:
               ponerNegras([87, 89])
            break;
            case 2:
               ponerNegras([86, 90])
            break;
            case 3:
               ponerNegras([85, 83, 91])
            break;
            case 4:
               ponerNegras([84, 82, 115])
            break;
            case 5:
               ponerNegras([46, 77, 78])
            break;
            case 6:
               ponerNegras([42, 47, 76, 79])
            break;
         }
         break;
      case 89:
         switch(tirada){
            case 1:
               ponerNegras([88, 90])
            break;
            case 2:
               ponerNegras([87, 83])
            break;
            case 3:
               ponerNegras([86, 82])
            break;
            case 4:
               ponerNegras([85, 77, 78, 91])
            break;
            case 5:
               ponerNegras([84, 76, 79, 115])
            break;
            case 6:
               ponerNegras([46, 75, 80])
            break;
         }
         break;
      case 90:
         switch(tirada){
            case 1:
               ponerNegras([89, 83])
            break;
            case 2:
               ponerNegras([88, 82])
            break;
            case 3:
               ponerNegras([87, 77, 78])
            break;
            case 4:
               ponerNegras([86, 76, 79, 91])
            break;
            case 5:
               ponerNegras([85, 75, 80])
            break;
            case 6:
               ponerNegras([84, 72, 81, 115])
            break;
         }
         break;
      case 91:
         switch(tirada){
            case 1:
               ponerNegras([86, 115])
            break;
            case 2:
               ponerNegras([85, 87])
            break;
            case 3:
               ponerNegras([84, 88])
            break;
            case 4:
               ponerNegras([46, 89])
            break;
            case 5:
               ponerNegras([42, 47, 90])
            break;
            case 6:
               ponerNegras([41, 48, 83])
            break;
         }
         break;
      case 92:
         switch(tirada){
            case 1:
               ponerNegras([93, 115])
            break;
            case 2:
               ponerNegras([94])
            break;
            case 3:
               ponerNegras([95])
            break;
            case 4:
               ponerNegras([96])
            break;
            case 5:
               ponerNegras([44])
            break;
            case 6:
               ponerNegras([43, 45])
            break;
         }
         break;
      case 93:
         switch(tirada){
            case 1:
               ponerNegras([92, 94])
            break;
            case 2:
               ponerNegras([95, 115])
            break;
            case 3:
               ponerNegras([96])
            break;
            case 4:
               ponerNegras([44])
            break;
            case 5:
               ponerNegras([43, 45])
            break;
            case 6:
               ponerNegras([33, 40])
            break;
         }
         break;
      case 94:
         switch(tirada){
            case 1:
               ponerNegras([93, 95])
            break;
            case 2:
               ponerNegras([92, 96])
            break;
            case 3:
               ponerNegras([44, 115])
            break;
            case 4:
               ponerNegras([43, 45])
            break;
            case 5:
               ponerNegras([33, 40])
            break;
            case 6:
               ponerNegras([32, 39, 41, 106])
            break;
         }
         break;
      case 95:
         switch(tirada){
            case 1:
               ponerNegras([94, 96])
            break;
            case 2:
               ponerNegras([93, 44])
            break;
            case 3:
               ponerNegras([92, 43, 45])
            break;
            case 4:
               ponerNegras([33, 40, 115])
            break;
            case 5:
               ponerNegras([32, 39, 41, 106])
            break;
            case 6:
               ponerNegras([31, 30, 42])
            break;
         }
         break;
      case 96:
         switch(tirada){
            case 1:
               ponerNegras([95, 44])
            break;
            case 2:
               ponerNegras([94, 43, 45])
            break;
            case 3:
               ponerNegras([93, 33, 40])
            break;
            case 4:
               ponerNegras([92, 32, 39, 41, 106])
            break;
            case 5:
               ponerNegras([31, 30, 42, 115])
            break;
            case 6:
               ponerNegras([15, 29, 34, 46])
            break;
         }
         break;
      case 97:
         switch(tirada){
            case 1:
               ponerNegras([81, 98])
            break;
            case 2:
               ponerNegras([80, 99])
            break;
            case 3:
               ponerNegras([79, 110])
            break;
            case 4:
               ponerNegras([78])
            break;
            case 5:
               ponerNegras([77, 82])
            break;
            case 6:
               ponerNegras([76, 83])
            break;
         }
      break;
      case 98:
         switch(tirada){
            case 1:
               ponerNegras([97, 99])
            break;
            case 2:
               ponerNegras([81, 110])
            break;
            case 3:
               ponerNegras([80])
            break;
            case 4:
               ponerNegras([79])
            break;
            case 5:
               ponerNegras([78])
            break;
            case 6:
               ponerNegras([77, 82])
            break;
         }
      break;
      case 99:
         switch(tirada){
            case 1:
               ponerNegras([98, 110])
            break;
            case 2:
               ponerNegras([97])
            break;
            case 3:
               ponerNegras([81])
            break;
            case 4:
               ponerNegras([80])
            break;
            case 5:
               ponerNegras([79])
            break;
            case 6:
               ponerNegras([78])
            break;
         }
      break;
      case 100:
         switch(tirada){
            case 1:
               ponerNegras([70, 101])
            break;
            case 2:
               ponerNegras([69, 102])
            break;
            case 3:
               ponerNegras([68, 73, 103])
            break;
            case 4:
               ponerNegras([50, 51, 74, 104])
            break;
            case 5:
               ponerNegras([49, 52, 72, 105])
            break;
            case 6:
               ponerNegras([48, 53, 71, 75])
            break;
         }
      break;
      case 101:
         switch(tirada){
            case 1:
               ponerNegras([100, 102])
            break;
            case 2:
               ponerNegras([70, 103])
            break;
            case 3:
               ponerNegras([69, 104])
            break;
            case 4:
               ponerNegras([68, 73, 105])
            break;
            case 5:
               ponerNegras([50, 51, 74])
            break;
            case 6:
               ponerNegras([49, 52, 72])
            break;
         }
      break;
      case 102:
         switch(tirada){
            case 1:
               ponerNegras([101, 103])
            break;
            case 2:
               ponerNegras([100, 104])
            break;
            case 3:
               ponerNegras([70, 105])
            break;
            case 4:
               ponerNegras([69])
            break;
            case 5:
               ponerNegras([68, 73])
            break;
            case 6:
               ponerNegras([50, 51, 74])
            break;
         }
      break;
      case 103:
         switch(tirada){
            case 1:
               ponerNegras([102, 104])
            break;
            case 2:
               ponerNegras([101, 105])
            break;
            case 3:
               ponerNegras([100])
            break;
            case 4:
               ponerNegras([70])
            break;
            case 5:
               ponerNegras([69])
            break;
            case 6:
               ponerNegras([68, 73])
            break;
         }
      break;
      case 104:
         switch(tirada){
            case 1:
               ponerNegras([103, 105])
            break;
            case 2:
               ponerNegras([102])
            break;
            case 3:
               ponerNegras([101])
            break;
            case 4:
               ponerNegras([100])
            break;
            case 5:
               ponerNegras([70])
            break;
            case 6:
               ponerNegras([69])
            break;
         }
      break;
      case 105:
         switch(tirada){
            case 1:
               ponerNegras([104])
            break;
            case 2:
               ponerNegras([103])
            break;
            case 3:
               ponerNegras([102])
            break;
            case 4:
               ponerNegras([101])
            break;
            case 5:
               ponerNegras([100])
            break;
            case 6:
               ponerNegras([70])
            break; 
         }
      break;
      case 106:
         switch(tirada){
            case 1:
               ponerNegras([33])
            break;
            case 2:
               ponerNegras([32, 43])
            break;
            case 3:
               ponerNegras([31, 44])
            break;
            case 4:
               ponerNegras([15, 45, 96])
            break;
            case 5:
               ponerNegras([14, 40, 95])
            break;
            case 6:
               ponerNegras([12, 39, 41, 94])
            break; 
         }
      break;
      case 107:
         switch(tirada){
            case 1:
               ponerNegras([7])
            break;
            case 2:
               ponerNegras([6, 8])
            break;
            case 3:
               ponerNegras([5, 9])
            break;
            case 4:
               ponerNegras([4, 10])
            break;
            case 5:
               ponerNegras([3, 11])
            break;
            case 6:
               ponerNegras([2, 12])
            break; 
         }
      break;
      case 108:
         switch(tirada){
            case 1:
               ponerNegras([38])
            break;
            case 2:
               ponerNegras([37])
            break;
            case 3:
               ponerNegras([36])
            break;
            case 4:
               ponerNegras([35])
            break;
            case 5:
               ponerNegras([34])
            break;
            case 6:
               ponerNegras([30])
            break; 
         }
      break;
      case 109:
         switch(tirada){
            case 1:
               ponerNegras([27, 61])
            break;
            case 2:
               ponerNegras([26, 28, 60])
            break;
            case 3:
               ponerNegras([25, 29, 59])
            break;
            case 4:
               ponerNegras([22, 30, 58])
            break;
            case 5:
               ponerNegras([19, 23, 34, 39, 57])
            break;
            case 6:
               ponerNegras([18, 20, 24, 35, 40, 56])
            break; 
         }
      break;
      case 110:
         switch(tirada){
            case 1:
               ponerNegras([99])
            break;
            case 2:
               ponerNegras([98])
            break;
            case 3:
               ponerNegras([97])
            break;
            case 4:
               ponerNegras([81])
            break;
            case 5:
               ponerNegras([80])
            break;
            case 6:
               ponerNegras([79])
            break; 
         }
      break;
      case 111:
         switch(tirada){
            case 1:
               ponerNegras([67])
            break;
            case 2:
               ponerNegras([66])
            break;
            case 3:
               ponerNegras([65])
            break;
            case 4:
               ponerNegras([64])
            break;
            case 5:
               ponerNegras([63])
            break;
            case 6:
               ponerNegras([62])
            break; 
         }
      break;
      case 112:
         switch(tirada){
            case 1:
               ponerNegras([24])
            break;
            case 2:
               ponerNegras([23])
            break;
            case 3:
               ponerNegras([22])
            break;
            case 4:
               ponerNegras([19, 25])
            break;
            case 5:
               ponerNegras([18, 20, 26])
            break;
            case 6:
               ponerNegras([17, 21, 27])
            break; 
         }
      break;
      case 113:
         switch(tirada){
            case 1:
               ponerNegras([21])
            break;
            case 2:
               ponerNegras([20])
            break;
            case 3:
               ponerNegras([19])
            break;
            case 4:
               ponerNegras([18, 22])
            break;
            case 5:
               ponerNegras([17, 23, 25])
            break;
            case 6:
               ponerNegras([16, 24, 26])
            break; 
         }
      break;
      case 114:
         switch(tirada){
            case 1:
               ponerNegras([1])
            break;
            case 2:
               ponerNegras([2])
            break;
            case 3:
               ponerNegras([3])
            break;
            case 4:
               ponerNegras([4])
            break;
            case 5:
               ponerNegras([5])
            break;
            case 6:
               ponerNegras([6])
            break; 
         }
      break;
      case 115:
         switch(tirada){
            case 1:
               ponerNegras([91, 92])
            break;
            case 2:
               ponerNegras([86, 93])
            break;
            case 3:
               ponerNegras([85, 87, 94])
            break;
            case 4:
               ponerNegras([84, 88, 95])
            break;
            case 5:
               ponerNegras([46, 89, 96])
            break;
            case 6:
               ponerNegras([42, 44, 47, 90])
            break; 
         }
      break;
   }
}

// FUNCION ENCARGADA DE PONER LAS MARCAS DE LAS CASILLAS QUE TIENEN OBJETOS

function colocarPuntoNegro(numero){
   document.getElementById("o" + numero).style.visibility = "visible";
}

function ocultarPuntoNegro(numero){
   document.getElementById("o" + numero).style.visibility = "hidden";
}

async function ocultarTodosNegros(){
   const partida = await getDoc(docRef)
   const task = partida.data()
   const puntosNegros = task.posObjetos
   if(puntosNegros.includes(115) == false){
      ocultarPuntoNegro(115)
   }
   for(let i = 1; i <= 104; i++){
      if(puntosNegros.includes(i) == false){
         ocultarPuntoNegro(i)
      }
   }
}

//FUNCIONES QUE SE ENCARGAN DE LO QUE PASA CUANDO SE PULSA UN HEXAGONO NEGRO

function seleccionarCasillaVerde(numero){
   if(turno == "humano")
      moverFichaHumano(numero)
   else
      moverFichaZombie(numero)
   seleccionPreguntaIndividual()
   fichas()
}

function seleccionarCasillaObjeto(numero){
   if(casillas.includes(numero)){
      if(turno == "humano")
      moverFichaHumano(numero)
   else
      moverFichaZombie(numero)
      seleccionPreguntaIndividual()
      fichas()
   }
}

document.getElementById('hn1').onclick = function(){
   seleccionarCasillaVerde(1)
}

document.getElementById('hn2').onclick = function(){
   seleccionarCasillaVerde(2)
}

document.getElementById('hn3').onclick = function(){
   seleccionarCasillaVerde(3)
}

document.getElementById('hn4').onclick = function(){
   seleccionarCasillaVerde(4)
}

document.getElementById('hn5').onclick = function(){
   seleccionarCasillaVerde(5)
}

document.getElementById('hn6').onclick = function(){
   seleccionarCasillaVerde(6)
}

document.getElementById('hn7').onclick = function(){
   seleccionarCasillaVerde(7)
}

document.getElementById('hn8').onclick = function(){
   seleccionarCasillaVerde(8)
}

document.getElementById('hn9').onclick = function(){
   seleccionarCasillaVerde(9)
}

document.getElementById('hn10').onclick = function(){
   seleccionarCasillaVerde(10)
}

document.getElementById('hn11').onclick = function(){
   seleccionarCasillaVerde(11)
}

document.getElementById('hn12').onclick = function(){
   seleccionarCasillaVerde(12)
}

document.getElementById('hn13').onclick = function(){
   seleccionarCasillaVerde(13)
}

document.getElementById('hn14').onclick = function(){
   seleccionarCasillaVerde(14)
}

document.getElementById('hn15').onclick = function(){
   seleccionarCasillaVerde(15)
}

document.getElementById('hn16').onclick = function(){
   seleccionarCasillaVerde(16)
}

document.getElementById('hn17').onclick = function(){
   seleccionarCasillaVerde(17)
}

document.getElementById('hn18').onclick = function(){
   seleccionarCasillaVerde(18)
}

document.getElementById('hn19').onclick = function(){
   seleccionarCasillaVerde(19)
}

document.getElementById('hn20').onclick = function(){
   seleccionarCasillaVerde(20)
}

document.getElementById('hn21').onclick = function(){
   seleccionarCasillaVerde(21)
}

document.getElementById('hn22').onclick = function(){
   seleccionarCasillaVerde(22)
}

document.getElementById('hn23').onclick = function(){
   seleccionarCasillaVerde(23)
}

document.getElementById('hn24').onclick = function(){
   seleccionarCasillaVerde(24)
}

document.getElementById('hn25').onclick = function(){
   seleccionarCasillaVerde(25)
}

document.getElementById('hn26').onclick = function(){
   seleccionarCasillaVerde(26)
}

document.getElementById('hn27').onclick = function(){
   seleccionarCasillaVerde(27)
}

document.getElementById('hn28').onclick = function(){
   seleccionarCasillaVerde(28)
}

document.getElementById('hn29').onclick = function(){
   seleccionarCasillaVerde(29)
}

document.getElementById('hn30').onclick = function(){
   seleccionarCasillaVerde(30)
}

document.getElementById('hn31').onclick = function(){
   seleccionarCasillaVerde(31)
}

document.getElementById('hn32').onclick = function(){
   seleccionarCasillaVerde(32)
}

document.getElementById('hn33').onclick = function(){
   seleccionarCasillaVerde(33)
}

document.getElementById('hn34').onclick = function(){
   seleccionarCasillaVerde(34)
}

document.getElementById('hn35').onclick = function(){
   seleccionarCasillaVerde(35)
}

document.getElementById('hn36').onclick = function(){
   seleccionarCasillaVerde(36)
}

document.getElementById('hn37').onclick = function(){
   seleccionarCasillaVerde(37)
}

document.getElementById('hn38').onclick = function(){
   seleccionarCasillaVerde(38)
}

document.getElementById('hn39').onclick = function(){
   seleccionarCasillaVerde(39)
}

document.getElementById('hn40').onclick = function(){
   seleccionarCasillaVerde(40)
}

document.getElementById('hn41').onclick = function(){
   seleccionarCasillaVerde(41)
}

document.getElementById('hn42').onclick = function(){
   seleccionarCasillaVerde(42)
}

document.getElementById('hn43').onclick = function(){
   seleccionarCasillaVerde(43)
}

document.getElementById('hn44').onclick = function(){
   seleccionarCasillaVerde(44)
}

document.getElementById('hn45').onclick = function(){
   seleccionarCasillaVerde(45)
}

document.getElementById('hn46').onclick = function(){
   seleccionarCasillaVerde(46)
}

document.getElementById('hn47').onclick = function(){
   seleccionarCasillaVerde(47)
}

document.getElementById('hn48').onclick = function(){
   seleccionarCasillaVerde(48)
}

document.getElementById('hn49').onclick = function(){
   seleccionarCasillaVerde(49)
}

document.getElementById('hn50').onclick = function(){
   seleccionarCasillaVerde(50)
}

document.getElementById('hn51').onclick = function(){
   seleccionarCasillaVerde(51)
}

document.getElementById('hn52').onclick = function(){
   seleccionarCasillaVerde(52)
}

document.getElementById('hn53').onclick = function(){
   seleccionarCasillaVerde(53)
}

document.getElementById('hn54').onclick = function(){
   seleccionarCasillaVerde(54)
}

document.getElementById('hn55').onclick = function(){
   seleccionarCasillaVerde(55)
}

document.getElementById('hn56').onclick = function(){
   seleccionarCasillaVerde(56)
}

document.getElementById('hn57').onclick = function(){
   seleccionarCasillaVerde(57)
}

document.getElementById('hn58').onclick = function(){
   seleccionarCasillaVerde(58)
}

document.getElementById('hn59').onclick = function(){
   seleccionarCasillaVerde(59)
}

document.getElementById('hn60').onclick = function(){
   seleccionarCasillaVerde(60)
}

document.getElementById('hn61').onclick = function(){
   seleccionarCasillaVerde(61)
}

document.getElementById('hn62').onclick = function(){
   seleccionarCasillaVerde(62)
}

document.getElementById('hn63').onclick = function(){
   seleccionarCasillaVerde(63)
}

document.getElementById('hn64').onclick = function(){
   seleccionarCasillaVerde(64)
}

document.getElementById('hn65').onclick = function(){
   seleccionarCasillaVerde(65)
}

document.getElementById('hn66').onclick = function(){
   seleccionarCasillaVerde(66)
}

document.getElementById('hn67').onclick = function(){
   seleccionarCasillaVerde(67)
}

document.getElementById('hn68').onclick = function(){
   seleccionarCasillaVerde(68)
}

document.getElementById('hn69').onclick = function(){
   seleccionarCasillaVerde(69)
}

document.getElementById('hn70').onclick = function(){
   seleccionarCasillaVerde(70)
}

document.getElementById('hn71').onclick = function(){
   seleccionarCasillaVerde(71)
}

document.getElementById('hn72').onclick = function(){
   seleccionarCasillaVerde(72)
}

document.getElementById('hn73').onclick = function(){
   seleccionarCasillaVerde(73)
}

document.getElementById('hn74').onclick = function(){
   seleccionarCasillaVerde(74)
}

document.getElementById('hn75').onclick = function(){
   seleccionarCasillaVerde(75)
}

document.getElementById('hn76').onclick = function(){
   seleccionarCasillaVerde(76)
}

document.getElementById('hn77').onclick = function(){
   seleccionarCasillaVerde(77)
}

document.getElementById('hn78').onclick = function(){
   seleccionarCasillaVerde(78)
}

document.getElementById('hn79').onclick = function(){
   seleccionarCasillaVerde(79)
}

document.getElementById('hn80').onclick = function(){
   seleccionarCasillaVerde(80)
}

document.getElementById('hn81').onclick = function(){
   seleccionarCasillaVerde(81)
}

document.getElementById('hn82').onclick = function(){
   seleccionarCasillaVerde(82)
}

document.getElementById('hn83').onclick = function(){
   seleccionarCasillaVerde(83)
}

document.getElementById('hn84').onclick = function(){
   seleccionarCasillaVerde(84)
}

document.getElementById('hn85').onclick = function(){
   seleccionarCasillaVerde(85)
}

document.getElementById('hn86').onclick = function(){
   seleccionarCasillaVerde(86)
}

document.getElementById('hn87').onclick = function(){
   seleccionarCasillaVerde(87)
}

document.getElementById('hn88').onclick = function(){
   seleccionarCasillaVerde(88)
}

document.getElementById('hn89').onclick = function(){
   seleccionarCasillaVerde(89)
}

document.getElementById('hn90').onclick = function(){
   seleccionarCasillaVerde(90)
}

document.getElementById('hn91').onclick = function(){
   seleccionarCasillaVerde(91)
}

document.getElementById('hn92').onclick = function(){
   seleccionarCasillaVerde(92)
}

document.getElementById('hn93').onclick = function(){
   seleccionarCasillaVerde(93)
}

document.getElementById('hn94').onclick = function(){
   seleccionarCasillaVerde(94)
}

document.getElementById('hn95').onclick = function(){
   seleccionarCasillaVerde(95)
}

document.getElementById('hn96').onclick = function(){
   seleccionarCasillaVerde(96)
}

document.getElementById('hn97').onclick = function(){
   seleccionarCasillaVerde(97)
}

document.getElementById('hn98').onclick = function(){
   seleccionarCasillaVerde(98)
}

document.getElementById('hn99').onclick = function(){
   seleccionarCasillaVerde(99)
}

document.getElementById('hn100').onclick = function(){
   seleccionarCasillaVerde(100)
}

document.getElementById('hn101').onclick = function(){
   seleccionarCasillaVerde(101)
}

document.getElementById('hn102').onclick = function(){
   seleccionarCasillaVerde(102)
}

document.getElementById('hn103').onclick = function(){
   seleccionarCasillaVerde(103)
}

document.getElementById('hn115').onclick = function(){
   seleccionarCasillaVerde(115)
}

document.getElementById('hn104').onclick = function(){
   seleccionarCasillaVerde(104)
}

document.getElementById('hAyuntamiento2').onclick = function(){
   if(turno == "humano")
      moverFichaHumano(105)
   else
      moverFichaZombie(105)
   document.getElementById("ayuntamiento").style.visibility = "visible"
   document.getElementById("primero1").style.visibility = "visible"
   document.getElementById("ojo1").style.visibility = "visible"
   updateTaskBD(idBD, {haRespondido : true, tipoPregunta : "grupal"})
   updatePregunta(idPregunta, {pregunta : "ayuntamiento", tipo : "grupal"})
   fichas() 
}

document.getElementById('hEstacion2').onclick = function(){
   if(turno == "humano")
      moverFichaHumano(106)
   else
      moverFichaZombie(106)
   document.getElementById("estacion").style.visibility = "visible" 
   document.getElementById("primero2").style.visibility = "visible"
   document.getElementById("ojo2").style.visibility = "visible"
   updateTaskBD(idBD, {haRespondido : true, tipoPregunta : "grupal"}) 
   updatePregunta(idPregunta, {pregunta : "estacion", tipo : "grupal"}) 
   fichas()
}

document.getElementById('hGym2').onclick = function(){
   if(turno == "humano")
      moverFichaHumano(107)
   else
      moverFichaZombie(107)
   document.getElementById("gym").style.visibility = "visible"
   document.getElementById("primero3").style.visibility = "visible"
   document.getElementById("ojo3").style.visibility = "visible"
   updateTaskBD(idBD, {haRespondido : true, tipoPregunta : "grupal"})
   updatePregunta(idPregunta, {pregunta : "gym", tipo : "grupal"})
   fichas()
}

document.getElementById('hHospital2').onclick = function(){
   if(turno == "humano")
      moverFichaHumano(108)
   else
      moverFichaZombie(108)
   document.getElementById("hospital").style.visibility = "visible"
   document.getElementById("primero5").style.visibility = "visible"
   document.getElementById("ojo5").style.visibility = "visible"
   updateTaskBD(idBD, {haRespondido : true, tipoPregunta : "grupal"})
   updatePregunta(idPregunta, {pregunta : "hospital", tipo : "grupal"})
   fichas()
}

document.getElementById('hLaboratorio2').onclick = function(){
   if(turno == "humano")
      moverFichaHumano(109)
   else
      moverFichaZombie(109)
   document.getElementById("laboratorio").style.visibility = "visible"
   document.getElementById("primero6").style.visibility = "visible"
   document.getElementById("ojo6").style.visibility = "visible"
   updateTaskBD(idBD, {haRespondido : true, tipoPregunta : "grupal"})
   updatePregunta(idPregunta, {pregunta : "laboratorio", tipo : "grupal"})
   fichas()
}

document.getElementById('hMuseo2').onclick = function(){
   if(turno == "humano")
      moverFichaHumano(110)
   else
      moverFichaZombie(110)
   document.getElementById("museo").style.visibility = "visible"
   document.getElementById("primero7").style.visibility = "visible"
   document.getElementById("ojo7").style.visibility = "visible"
   updateTaskBD(idBD, {haRespondido : true, tipoPregunta : "grupal"})
   updatePregunta(idPregunta, {pregunta : "museo", tipo : "grupal"})
   fichas()
}

document.getElementById('hPisoFranco2').onclick = function(){
   if(turno == "humano")
      moverFichaHumano(111)
   else
      moverFichaZombie(111)
   document.getElementById("pisoFranco").style.visibility = "visible"
   document.getElementById("primero8").style.visibility = "visible"
   document.getElementById("ojo8").style.visibility = "visible"
   updateTaskBD(idBD, {haRespondido : true, tipoPregunta : "grupal"})
   updatePregunta(idPregunta, {pregunta : "pisoFranco", tipo : "grupal"})
   fichas()
}

document.getElementById('hRestaurante2').onclick = function(){
   if(turno == "humano")
      moverFichaHumano(112)
   else
      moverFichaZombie(112)
   document.getElementById("restaurante").style.visibility = "visible"
   document.getElementById("primero9").style.visibility = "visible"
   document.getElementById("ojo9").style.visibility = "visible"
   updateTaskBD(idBD, {haRespondido : true, tipoPregunta : "grupal"})
   updatePregunta(idPregunta, {pregunta : "restaurante", tipo : "grupal"})
   fichas()
}

document.getElementById('hSalaMusica2').onclick = function(){
   if(turno == "humano")
      moverFichaHumano(113)
   else
      moverFichaZombie(113)
   document.getElementById("salaMusica").style.visibility = "visible"
   document.getElementById("primero10").style.visibility = "visible"
   document.getElementById("ojo10").style.visibility = "visible"
   updateTaskBD(idBD, {haRespondido : true, tipoPregunta : "grupal"})
   updatePregunta(idPregunta, {pregunta : "salaMusica", tipo : "grupal"})
   fichas()
}

document.getElementById('hSupermercado2').onclick = function(){
   if(turno == "humano")
      moverFichaHumano(114)
   else
      moverFichaZombie(114)
   document.getElementById("supermercado").style.visibility = "visible"
   document.getElementById("primero11").style.visibility = "visible"
   document.getElementById("ojo11").style.visibility = "visible"
   updateTaskBD(idBD, {haRespondido : true, tipoPregunta : "grupal"})
   updatePregunta(idPregunta, {pregunta : "supermercado", tipo : "grupal"})
   fichas()
}

document.getElementById('o1').onclick = function(){
   seleccionarCasillaObjeto(1)
}

document.getElementById('o2').onclick = function(){
   seleccionarCasillaObjeto(2)
}

document.getElementById('o3').onclick = function(){
   seleccionarCasillaObjeto(3)
}

document.getElementById('o4').onclick = function(){
   seleccionarCasillaObjeto(4)
}

document.getElementById('o5').onclick = function(){
   seleccionarCasillaObjeto(5)
}

document.getElementById('o6').onclick = function(){
   seleccionarCasillaObjeto(6)
}

document.getElementById('o7').onclick = function(){
   seleccionarCasillaObjeto(7)
}

document.getElementById('o8').onclick = function(){
   seleccionarCasillaObjeto(8)
}

document.getElementById('o9').onclick = function(){
   seleccionarCasillaObjeto(9)
}

document.getElementById('o10').onclick = function(){
   seleccionarCasillaObjeto(10)
}

document.getElementById('o11').onclick = function(){
   seleccionarCasillaObjeto(11)
}

document.getElementById('o12').onclick = function(){
   seleccionarCasillaObjeto(12)
}

document.getElementById('o13').onclick = function(){
   seleccionarCasillaObjeto(13)
}

document.getElementById('o14').onclick = function(){
   seleccionarCasillaObjeto(14)
}

document.getElementById('o15').onclick = function(){
   seleccionarCasillaObjeto(15)
}

document.getElementById('o16').onclick = function(){
   seleccionarCasillaObjeto(16)
}

document.getElementById('o17').onclick = function(){
   seleccionarCasillaObjeto(17)
}

document.getElementById('o18').onclick = function(){
   seleccionarCasillaObjeto(18)
}

document.getElementById('o19').onclick = function(){
   seleccionarCasillaObjeto(19)
}

document.getElementById('o20').onclick = function(){
   seleccionarCasillaObjeto(20)
}

document.getElementById('o21').onclick = function(){
   seleccionarCasillaObjeto(21)
}

document.getElementById('o22').onclick = function(){
   seleccionarCasillaObjeto(22)
}

document.getElementById('o23').onclick = function(){
   seleccionarCasillaObjeto(23)
}

document.getElementById('o24').onclick = function(){
   seleccionarCasillaObjeto(24)
}

document.getElementById('o25').onclick = function(){
   seleccionarCasillaObjeto(25)
}

document.getElementById('o26').onclick = function(){
   seleccionarCasillaObjeto(26)
}

document.getElementById('o27').onclick = function(){
   seleccionarCasillaObjeto(27)
}

document.getElementById('o28').onclick = function(){
   seleccionarCasillaObjeto(28)
}

document.getElementById('o29').onclick = function(){
   seleccionarCasillaObjeto(29)
}

document.getElementById('o30').onclick = function(){
   seleccionarCasillaObjeto(30)
}

document.getElementById('o31').onclick = function(){
   seleccionarCasillaObjeto(31)
}

document.getElementById('o32').onclick = function(){
   seleccionarCasillaObjeto(32)
}

document.getElementById('o33').onclick = function(){
   seleccionarCasillaObjeto(33)
}

document.getElementById('o34').onclick = function(){
   seleccionarCasillaObjeto(34)
}

document.getElementById('o35').onclick = function(){
   seleccionarCasillaObjeto(35)
}

document.getElementById('o36').onclick = function(){
   seleccionarCasillaObjeto(36)
}

document.getElementById('o37').onclick = function(){
   seleccionarCasillaObjeto(37)
}

document.getElementById('o38').onclick = function(){
   seleccionarCasillaObjeto(38)
}

document.getElementById('o39').onclick = function(){
   seleccionarCasillaObjeto(39)
}

document.getElementById('o40').onclick = function(){
   seleccionarCasillaObjeto(40)
}

document.getElementById('o41').onclick = function(){
   seleccionarCasillaObjeto(41)
}

document.getElementById('o42').onclick = function(){
   seleccionarCasillaObjeto(42)
}

document.getElementById('o43').onclick = function(){
   seleccionarCasillaObjeto(43)
}

document.getElementById('o44').onclick = function(){
   seleccionarCasillaObjeto(44)
}

document.getElementById('o45').onclick = function(){
   seleccionarCasillaObjeto(45)
}

document.getElementById('o46').onclick = function(){
   seleccionarCasillaObjeto(46)
}

document.getElementById('o47').onclick = function(){
   seleccionarCasillaObjeto(47)
}

document.getElementById('o48').onclick = function(){
   seleccionarCasillaObjeto(48)
}

document.getElementById('o49').onclick = function(){
   seleccionarCasillaObjeto(49)
}

document.getElementById('o50').onclick = function(){
   seleccionarCasillaObjeto(50)
}

document.getElementById('o51').onclick = function(){
   seleccionarCasillaObjeto(51)
}

document.getElementById('o52').onclick = function(){
   seleccionarCasillaObjeto(52)
}

document.getElementById('o53').onclick = function(){
   seleccionarCasillaObjeto(53)
}

document.getElementById('o54').onclick = function(){
   seleccionarCasillaObjeto(54)
}

document.getElementById('o55').onclick = function(){
   seleccionarCasillaObjeto(55)
}

document.getElementById('o56').onclick = function(){
   seleccionarCasillaObjeto(56)
}

document.getElementById('o57').onclick = function(){
   seleccionarCasillaObjeto(57)
}

document.getElementById('o58').onclick = function(){
   seleccionarCasillaObjeto(58)
}

document.getElementById('o59').onclick = function(){
   seleccionarCasillaObjeto(59)
}

document.getElementById('o60').onclick = function(){
   seleccionarCasillaObjeto(60)
}

document.getElementById('o61').onclick = function(){
   seleccionarCasillaObjeto(61)
}

document.getElementById('o62').onclick = function(){
   seleccionarCasillaObjeto(62)
}

document.getElementById('o63').onclick = function(){
   seleccionarCasillaObjeto(63)
}

document.getElementById('o64').onclick = function(){
   seleccionarCasillaObjeto(64)
}

document.getElementById('o65').onclick = function(){
   seleccionarCasillaObjeto(65)
}

document.getElementById('o66').onclick = function(){
   seleccionarCasillaObjeto(66)
}

document.getElementById('o67').onclick = function(){
   seleccionarCasillaObjeto(67)
}

document.getElementById('o68').onclick = function(){
   seleccionarCasillaObjeto(68)
}

document.getElementById('o69').onclick = function(){
   seleccionarCasillaObjeto(69)
}

document.getElementById('o70').onclick = function(){
   seleccionarCasillaObjeto(70)
}

document.getElementById('o71').onclick = function(){
   seleccionarCasillaObjeto(71)
}

document.getElementById('o72').onclick = function(){
   seleccionarCasillaObjeto(72)
}

document.getElementById('o73').onclick = function(){
   seleccionarCasillaObjeto(73)
}

document.getElementById('o74').onclick = function(){
   seleccionarCasillaObjeto(74)
}

document.getElementById('o75').onclick = function(){
   seleccionarCasillaObjeto(75)
}

document.getElementById('o76').onclick = function(){
   seleccionarCasillaObjeto(76)
}

document.getElementById('o77').onclick = function(){
   seleccionarCasillaObjeto(77)
}

document.getElementById('o78').onclick = function(){
   seleccionarCasillaObjeto(78)
}

document.getElementById('o79').onclick = function(){
   seleccionarCasillaObjeto(79)
}

document.getElementById('o80').onclick = function(){
   seleccionarCasillaObjeto(80)
}

document.getElementById('o81').onclick = function(){
   seleccionarCasillaObjeto(81)
}

document.getElementById('o82').onclick = function(){
   seleccionarCasillaObjeto(82)
}

document.getElementById('o83').onclick = function(){
   seleccionarCasillaObjeto(83)
}

document.getElementById('o84').onclick = function(){
   seleccionarCasillaObjeto(84)
}

document.getElementById('o85').onclick = function(){
   seleccionarCasillaObjeto(85)
}

document.getElementById('o86').onclick = function(){
   seleccionarCasillaObjeto(86)
}

document.getElementById('o87').onclick = function(){
   seleccionarCasillaObjeto(87)
}

document.getElementById('o88').onclick = function(){
   seleccionarCasillaObjeto(88)
}

document.getElementById('o89').onclick = function(){
   seleccionarCasillaObjeto(89)
}

document.getElementById('o90').onclick = function(){
   seleccionarCasillaObjeto(90)
}

document.getElementById('o91').onclick = function(){
   seleccionarCasillaObjeto(91)
}

document.getElementById('o92').onclick = function(){
   seleccionarCasillaObjeto(92)
}

document.getElementById('o93').onclick = function(){
   seleccionarCasillaObjeto(93)
}

document.getElementById('o94').onclick = function(){
   seleccionarCasillaObjeto(94)
}

document.getElementById('o95').onclick = function(){
   seleccionarCasillaObjeto(95)
}

document.getElementById('o96').onclick = function(){
   seleccionarCasillaObjeto(96)
}

document.getElementById('o97').onclick = function(){
   seleccionarCasillaObjeto(97)
}

document.getElementById('o98').onclick = function(){
   seleccionarCasillaObjeto(98)
}

document.getElementById('o99').onclick = function(){
   seleccionarCasillaObjeto(99)
}

document.getElementById('o100').onclick = function(){
   seleccionarCasillaObjeto(100)
}

document.getElementById('o101').onclick = function(){
   seleccionarCasillaObjeto(101)
}

document.getElementById('o102').onclick = function(){
   seleccionarCasillaObjeto(102)
}

document.getElementById('o103').onclick = function(){
   seleccionarCasillaObjeto(103)
}

document.getElementById('o115').onclick = function(){
   seleccionarCasillaObjeto(115)
}

document.getElementById('o104').onclick = function(){
   seleccionarCasillaObjeto(104)
}

//FUNCIONES PARA DEJAR LAS FICHAS EN LA NORMALIDAD Y REALIZAR FUNCIONES UNA VEZ SE PULSE A UNA FICHA NEGRA

async function fichas(){
   const partida = await getDoc(docRef)
   const task = partida.data()
   
   for(let i = 0; i < posicionesNegras.length; i++)
      document.getElementById(posicionesNegras[i]).style.visibility = "hidden"
   for(let j = 0; j < posicionesBlancas.length; j++)
   document.getElementById(posicionesBlancas[j]).style.visibility = "visible"
   document.getElementById("pantallaMoverFicha").style.visibility = "hidden";
   posicionesBlancas = []
   posicionesNegras = []
   tirada = false

   updateTaskBD(idBD, {idTurnoAnterior : task.idTurno, posHumano : posHumano, posZombie : posZombie}) 

   let posicionesObjetos = task.posObjetos
   let posH = task.posHumano
   let posZ = task.posZombie
   let objH = task.objetosHumanos
   let objZ = task.objetosZombies
   let turno = task.turno
   let equipoHumano = task.equipoHumano
   let equipoZombie = task.equipoZombie

   comprobarObjetos(posicionesObjetos, posH, posZ, objH, objZ)
   
   if(turno == "humano"){
      actualizarTurno("zombie", equipoHumano, equipoZombie)
      updateTaskBD(idBD, {turno : "zombie"})
      if(objH[3]){
         objH[3] = false
         actualizarTurno("humano", equipoHumano, equipoZombie)
         updateTaskBD(idBD, {turno : "humano", objetosHumanos : objH})
      }
   }else{
      if(objZ[3]){
         objZ[3] = false
         actualizarTurno("zombie", equipoHumano, equipoZombie)
         updateTaskBD(idBD, {turno : "zombie", objetosHumanos : objZ})
      }
      actualizarTurno("humano", equipoHumano, equipoZombie)
      updateTaskBD(idBD, {turno : "humano"})
   }

   ocultarTodosE()

   activado = true
   repeatingFunc()

   if(activado)
   setTimeout(repeatingFunc, 500)
}

function ponerNegras(array){
   casillas = array
   for(let i = 0; i < array.length; i++){
      if(array[i] < 105){
         document.getElementById("hn" + array[i]).style.visibility = "visible"
         document.getElementById("h" + array[i]).style.visibility = "hidden"
         posicionesNegras.push("hn" + array[i])
         posicionesBlancas.push("h" + array[i])
         document.getElementById("pantallaMoverFicha").style.visibility = "visible"
      }else{
         switch(array[i]){
            case 105:
               auxPonerNegras("hAyuntamiento")
            break;
            case 106:
               auxPonerNegras("hEstacion")
            break;
            case 107:
               auxPonerNegras("hGym")
            break;
            case 108:
               auxPonerNegras("hHospital")
            break;
            case 109:
               auxPonerNegras("hLaboratorio")
            break;
            case 110:
               auxPonerNegras("hMuseo")
            break;
            case 111:
               auxPonerNegras("hPisoFranco")
            break;
            case 112:
               auxPonerNegras("hRestaurante")
            break;
            case 113:
               auxPonerNegras("hSalaMusica")
            break;
            case 114:
               auxPonerNegras("hSupermercado")
            break;
         }
      }    
   } 
}

function auxPonerNegras(string){
   document.getElementById(string + "2").style.visibility = "visible"
   document.getElementById(string).style.visibility = "hidden"
   posicionesNegras.push(string + "2")
   posicionesBlancas.push(string)
}

function comprobarObjetos(posObj, posH, posZ, objH, objZ){
   let contador = 0

   posObj.forEach(async (num) => {

      if(posH == num){
         let objetos = objH
         objetos[contador] = true
         if(contador == 1){
            vitaminasNuevas("humano")
         }
         updateTaskBD(idBD, {objetosHumanos : objetos})

         actualizarPosObjetos(contador, posH, posZ, posObj)
      }
      if(posZ == num){
         let objetos = objZ
         objetos[contador] = true
         if(contador == 1){
            vitaminasNuevas("zombie")
         }
         updateTaskBD(idBD, {objetosZombies : objetos})

         actualizarPosObjetos(contador, posH, posZ, posObj)
      }
      contador++
   })
} 

function actualizarPosObjetos(posicion, posH, posZ, posObj){
   let listo = false
   while(listo == false){
      let confirmacion = true
      let valorAux = Math.floor(Math.random() * (106 - 1) + 1)
      if(valorAux == 105){{
         valorAux = 115
      }}
      posObj.forEach((num) =>{
         if(valorAux == posH || valorAux == posZ || num == valorAux){
            confirmacion == false
         }
      })
      if(confirmacion){
         posObj[posicion] = valorAux
         listo = true
         updateTaskBD(idBD, {posObjetos : posObj})
         ocultarTodosNegros()
      }
   }
}

//FUNCIONAMIENTO DE LAS PREGUNTAS

function pulsarOjo(numero){
   document.getElementById("primero" + numero).style.visibility = "hidden";
   document.getElementById("segundo" + numero).style.visibility = "visible";
   document.getElementById("ojo" + numero).style.visibility = "hidden";
}

document.getElementById('ojo1').onclick = function() { 
   pulsarOjo(1)
}

document.getElementById('ojo2').onclick = function() { 
   pulsarOjo(2)
}

document.getElementById('ojo3').onclick = function() {
   document.getElementById("fondoPregunta3").style.visibility = "hidden"
   document.getElementById("excel").style.visibility = "visible"
   document.getElementById("ojo3").style.visibility = "hidden";
}

document.getElementById('ojo4').onclick = function() { 
   pulsarOjo(4)
}

document.getElementById('ojo5').onclick = function() { 
   pulsarOjo(5)
}

document.getElementById('ojo6').onclick = function() { 
   pulsarOjo(6)
}

document.getElementById('ojo7').onclick = function() { 
   pulsarOjo(7)
}

document.getElementById('ojo8').onclick = function() { 
   pulsarOjo(8)
}

document.getElementById('ojo9').onclick = function() { 
   pulsarOjo(9)
}

document.getElementById('ojo10').onclick = function() { 
   pulsarOjo(10)
}

document.getElementById('ojo11').onclick = function() { 
   pulsarOjo(11)
}

async function seleccionPreguntaIndividual(){
   const partida = await getDoc(docRef)
   const task = partida.data()
   let preguntas = task.preguntas
   let id = task.idTurno
   let longitud = preguntas.length
   const documentoEstudiantes = await getDocs(documentosEstudiantes)

   if(longitud == 1){
      updateTaskBD(idBD, {haRespondido : true})
      let pregunta = "fondoPregunta" + preguntas[0]
      documentoEstudiantes.forEach((estudiante) => {
         if(estudiante.data().personaje == "Srta. Lix" && estudiante.id == idEstudiante){
            srtaLix(idEstudiante, estudiante.data().equipo)
         }
      })   
      document.getElementById(pregunta).style.visibility = "visible"
      updateTaskBD(idBD, {preguntas : todasPreguntas, tipoPregunta : "individual"})
      updatePregunta(idPregunta, {pregunta : pregunta, tipo : "individual", id : id})
   }else{
      updateTaskBD(idBD, {haRespondido : true})
      let valorAux = Math.floor(Math.random() * (longitud - 1) + 1)
      let pregunta = preguntas[valorAux]
      let numeroPregunta = "fondoPregunta" + pregunta
      documentoEstudiantes.forEach((estudiante) => {
         if(estudiante.data().personaje == "Srta. Lix" && estudiante.id == idEstudiante){
            srtaLix(idEstudiante, estudiante.data().equipo)
         }
      })
      document.getElementById(numeroPregunta).style.visibility = "visible"
      preguntas.splice(valorAux, 1)
      updateTaskBD(idBD, {preguntas : preguntas, tipoPregunta : "individual"})
      updatePregunta(idPregunta, {pregunta : numeroPregunta, tipo : "individual", id : id})
   }    
}

function ocultarIndividuales(){
   todasPreguntas.forEach((numero) => {
      document.getElementById("fondoPregunta" + numero).style.visibility = "hidden"
   })
   document.getElementById("excel").style.visibility = "hidden"
}

function ocultarGrupales(){
   for(let i = 1; i < 12; i++){
      if(i != 3){
         document.getElementById("segundo" + i).style.visibility = "hidden";
      }    
   }
}

// PARA SABER SI UN USUARIO HA RESPONDIDO LA PREGUNTA

onGetRespuesta((querySnapshot) => {   
   apoyo(200)
   querySnapshot.forEach(async (doc) => {    
         const task = doc.data()
         let documentoEstudiantes = await getDocs(documentosEstudiantes)
         documentoEstudiantes.forEach((estudiante) => {
            if(task.resultado == "mal" && idEstudiante == pregunta.data().id && estudiante.data().vidaExtra > 0){
               document.getElementById("confirmacionVida").style.visibility = "visible"
            }
            if(task.resultado == "bien" && idEstudiante == task.id && estudiante.personaje == "Emy"){
               emy(documentoEstudiantes, task.id)         
            }
            if(task.resultado == "bien" && idEstudiante == task.id && estudiante.personaje == "Doctor Jow"){
               drJow(documentoEstudiantes, task.id)         
            } 
         })
                       
   });
})

onGetPregunta((querySnapshot) => {   
   querySnapshot.forEach(async (doc) => {    
         const task = doc.data()
         const partida = await getDoc(docRef)
         const taskP = partida.data()
         const idJugador = taskP.idTurno      
         const equipoPartida = taskP.equipoEstudiante
         const estudiantes = await getDocs(documentosEstudiantes)
         const pregunta = await getDoc(docRefe);
         let equipo = ""
         let equipo2 = "" 
          
         if(task.tipo == "individual" && esProfesor){
            document.getElementById(task.pregunta).style.visibility = "visible"
            estudiantes.forEach((est) => {
               let datos = doc.data()
               if(est.data().personaje == "Srta. Lix" && pregunta.data().id == est.id && (esProfesor || idEstudiante == est.id)){
                  srtaLix(idEstudiante, est.data().equipo)
               }
               if(est.id == idJugador)
                  equipo = datos.equipo
               if(est.id == idEstudiante){
                  equipo2 = datos.equipo
               }
            })
         }

         if(equipo2 == equipoPartida || esProfesor){
            switch(task.pregunta){
               case "ayuntamiento":
                  document.getElementById(task.pregunta).style.visibility = "visible"
                  document.getElementById("primero1").style.visibility = "visible"
                  document.getElementById("ojo1").style.visibility = "visible"
               break;
               case "estacion":
                  document.getElementById(task.pregunta).style.visibility = "visible"
                  document.getElementById("primero2").style.visibility = "visible"
                  document.getElementById("ojo2").style.visibility = "visible"
               break;
               case "gym":
                  document.getElementById(task.pregunta).style.visibility = "visible"
                  document.getElementById("primero3").style.visibility = "visible"
                  document.getElementById("ojo3").style.visibility = "visible"
               break;
               case "hospital":
                  document.getElementById(task.pregunta).style.visibility = "visible"
                  document.getElementById("primero5").style.visibility = "visible"
                  document.getElementById("ojo5").style.visibility = "visible"
               break;
               case "laboratorio":
                  document.getElementById(task.pregunta).style.visibility = "visible"
                  document.getElementById("primero6").style.visibility = "visible"
                  document.getElementById("ojo6").style.visibility = "visible"
               break;
               case "museo":
                  document.getElementById(task.pregunta).style.visibility = "visible"
                  document.getElementById("primero7").style.visibility = "visible"
                  document.getElementById("ojo7").style.visibility = "visible"
               break;
               case "pisoFranco":
                  document.getElementById(task.pregunta).style.visibility = "visible"
                  document.getElementById("primero8").style.visibility = "visible"
                  document.getElementById("ojo8").style.visibility = "visible"
               break;
               case "restaurante":
                  document.getElementById(task.pregunta).style.visibility = "visible"
                  document.getElementById("primero9").style.visibility = "visible"
                  document.getElementById("ojo9").style.visibility = "visible"
               break;
               case "salaMusica":
                  document.getElementById(task.pregunta).style.visibility = "visible"
                  document.getElementById("primero10").style.visibility = "visible"
                  document.getElementById("ojo10").style.visibility = "visible"
               break;
               case "supermercado":
                  document.getElementById(task.pregunta).style.visibility = "visible"
                  document.getElementById("primero11").style.visibility = "visible"
                  document.getElementById("ojo11").style.visibility = "visible"
               break;
            }
         }
                           
   });
})

function obtenerVida(id, task) {
   if(task.puntos == 1000 && task.haTenidoVidaExtra == false){
      let vidas = task.vidaExtra
      vidas++
      updateTask(id, {haTenidoVidaExtra : true, vidaExtra : vidas})
   }
}

document.getElementById('siVida').onclick = async function() {
   let documentoEstudiantes = await getDocs(documentosEstudiantes)
   documentoEstudiantes.forEach((doc) => {
      if(doc.id == idEstudiante){
         let puntos = doc.data().puntos
         let vidaExtra = doc.data().vidaExtra
         vidaExtra = vidaExtra - 1
         puntos = puntos + 100
         updateTask(idEstudiante, {puntos : puntos, vidaExtra : vidaExtra})
         updateRespuesta(idRespuesta, {resultado : ""})
      }
   })
   document.getElementById("confirmacionVida").style.visibility = "hidden"
}

document.getElementById('noVida').onclick = async function() {
   document.getElementById("confirmacionVida").style.visibility = "hidden"
   updateRespuesta(idRespuesta, {resultado : ""})
}

document.getElementById('si').onclick = async function() {
   document.getElementById("confirmacionRespuesta").style.visibility = "hidden"
   const partida = await getDoc(docRef)
   const task = partida.data()
   const idJugador = task.idTurnoAnterior
   const tipoPregunta = task.tipoPregunta
   const estudiantes = await getDocs(documentosEstudiantes)
   const movil = await getDoc(movilDocumento)
   const datosMovil = movil.data()

   if(datosMovil.activo){
      let objetos = []
      if(datosMovil.equipo == "humano"){
         objetos = task.objetosHumanos
         objetos[0] = true
         updateTaskBD(idBD, {objetosHumanos : objetos})
         updateObjeto("movil", {activo : false, equipo : ""})
      }else{
         objetos = task.objetosZombies
         objetos[0] = true
         updateTaskBD(idBD, {objetosZombies : objetos})
         updateObjeto("movil", {activo : false, equipo : ""})
      }      
   }

   let equipo = ""
   estudiantes.forEach((doc) => {
      if(idJugador == doc.id){
         equipo = doc.data().equipo
      }
   })

   
   if(tipoPregunta == "individual"){
      aciertoIndividual(idJugador, estudiantes)
      let contadorH = 0
      let objetosHumanos = task.objetosHumanos
      objetosHumanos.forEach((num) => {
         if(num == true && task.turno == "zombie"){
            switch(contadorH){
               case 1:
                  medalla(equipo, "acierto")
                  objetosHumanos[1] = false
                  updateTaskBD(idBD, {objetosHumanos : objetosHumanos, haRespondido : false})
               break;
               case 2:
                  vitaminas("acierto", idJugador)
               break;
               case 3:
                  pegamento(equipo, "acierto")
               break;
               case 4:
                  updateObjeto("amplificador", {activo : true, id : idJugador, respuesta : "acierto", equipo : "humano"})
               break;
               case 5:
                  updateObjeto("monedas", {activo : true, id : idJugador, respuesta : "acierto"})
               break;
               case 6:
                  updateObjeto("botiquin", {activo : true, id : idJugador, respuesta : "acierto"})
               break;
            }
         }
         contadorH++
      })
      let contadorZ = 0
      let objetosZombies = task.objetosZombies
      objetosZombies.forEach((num) => {
         if(num == true && task.turno == "humano"){
            switch(contadorZ){
               case 1:
                  medalla(equipo, "acierto")
                  objetosZombies[1] = false
                  updateTaskBD(idBD, {objetosZombies : objetosZombies, haRespondido  : false})
               break;
               case 2:
                  vitaminas("acierto", idJugador)
               break;
               case 3:
                  pegamento(equipo, "acierto")
               break;
               case 4:            
                  updateObjeto("amplificador", {activo : true, id : idJugador, respuesta : "acierto", equipo : "zombie"})
               break;
               case 5:
                  updateObjeto("monedas", {activo : true, id : idJugador, respuesta : "acierto"})
               break;
               case 6:
                  updateObjeto("botiquin", {activo : true, id : idJugador, respuesta : "acierto"})
               break;
            } 
         }
         contadorZ++
      })            
      updateRespuesta(idRespuesta, {id : idJugador, resultado : "bien"})
   }else{
      let equipo = ""
      estudiantes.forEach((doc) => {
         let datos = doc.data()
         if(doc.id == idJugador)
            equipo = datos.equipo
      })
      aciertoGrupal(equipo, estudiantes)
   }
   updateTaskBD(idBD, {haRespondido : false})
   cargarTop()
}

document.getElementById('no').onclick = async function() {
   document.getElementById("confirmacionRespuesta").style.visibility = "hidden"
   const partida = await getDoc(docRef)
   const task = partida.data()
   const idJugador = task.idTurnoAnterior
   const tipoPregunta = task.tipoPregunta
   const estudiantes = await getDocs(documentosEstudiantes)
   let equipo = ""
   estudiantes.forEach((doc) => {
      if(idJugador == doc.id){
         equipo = doc.data().equipo
      }
   })

   if(tipoPregunta == "individual"){
      falloIndividual(idJugador, estudiantes)
      let contadorH = 0
      let objetosHumanos = task.objetosHumanos
      objetosHumanos.forEach((num) => {
         if(num == true){
            switch(contadorH){
               case 1:
                  medalla(equipo, "error")
                  objetosHumanos[1] = false
                  updateTaskBD(idBD, {objetosHumanos : objetosHumanos, haRespondido : false})
               break;
               case 2:
                  vitaminas("error", idJugador)
               break;
               case 3:
                  pegamento(equipo, "error")
               break;
               case 4:
                  updateObjeto("amplificador", {activo : true, id : idJugador, respuesta : "error"})
               break;
               case 5:
                  updateObjeto("monedas", {activo : true, id : idJugador, respuesta : "error"})
               break;
               case 6:
                  updateObjeto("botiquin", {activo : true, id : idJugador, respuesta : "error"})
               break;
            }
         }
         contadorH++
      })
      let contadorZ = 0
      let objetosZombies = task.objetosZombies
      objetosZombies.forEach((num) => {
         if(num == true){
            switch(contadorZ){
               case 1:
                  medalla(equipo, "error")
                  objetosZombies[1] = false
                  updateTaskBD(idBD, {objetosZombies : objetosZombies, haRespondido  : false})
               break;
               case 2:
                  vitaminas("error", idJugador)
               break;
               case 3:
                  pegamento(equipo, "error")
               break;
               case 4:
                  updateObjeto("amplificador", {activo : true, id : idJugador, respuesta : "error"})
               break;
               case 5:
                  updateObjeto("monedas", {activo : true, id : idJugador, respuesta : "error"})
               break;
               case 6:
                  updateObjeto("botiquin", {activo : true, id : idJugador, respuesta : "error"})
               break;
            }
         }
         contadorZ++
      })            
      updateRespuesta(idRespuesta, {id : idJugador, resultado : "mal"})
   }else{
      let equipo = ""
      estudiantes.forEach((doc) => {
         let datos = doc.data()
         if(doc.id == idJugador)
            equipo = datos.equipo
      })
      falloGrupal(equipo, estudiantes)
   }
   updateTaskBD(idBD, {haRespondido : false})
   cargarTop()
}

function aciertoIndividual(idAlumnos, documentoEstudiantes){
   documentoEstudiantes.forEach((doc) => {
      let alumnoID = doc.id
      
      if(idAlumnos == alumnoID){
         const task = doc.data()
         let equipo = task.equipo
         switch(task.personaje){
            case "Comisario Fred":
               comisarioFred(equipo, alumnoID)
            break;
            case "Piloto Brus":
               pilotoBrus(idAlumnos, equipo)
            break;
         }
         
         let puntos = task.puntos
         if(puntos < 900){
            puntos = puntos + 100
         }else{
            puntos = 1000
         }
         updateTask(idAlumnos, {puntos : puntos})
         obtenerVida(idAlumnos, task)
         cargarTop()
      }
   })
}

async function falloIndividual(idAlumnos, documentoEstudiantes){
   const partida = await getDoc(docRef)
   const task = partida.data()
   documentoEstudiantes.forEach((doc) => {
      let alumnoID = doc.id
      if(idAlumnos == alumnoID){
         let equipo = doc.data().equipo
         let puntos = doc.data().puntos
         puntos = puntos - 100
         if(puntos < 0){
            puntos = 0
         }
         if(doc.data().personaje == "Sargento Delis"){
            sargentoDelis(alumnoID, puntos, equipo)
         }
         let objetos = []
         if(equipo == "humano"){
            objetos = task.objetosHumanos
         }else{
            objetos = task.objetosZombies
         }
         updateTask(idAlumnos, {puntos : puntos})
         updateTaskBD(idBD, {haRespondido : false})
         if(objetos[2]){
            vitaminas("error", alumnoID, equipo)
         }    
         cargarTop()
      }
   })
}

async function aciertoGrupal(equipo, estudiantes){
   let contador = 0
   let equipoGan = []
   const partida = await getDoc(docRef)
   const datos = partida.data()
   if(equipo == "humano"){      
      equipoGan = datos.equipoHumano
      contador = equipoGan.length
   }else{
      equipoGan = datos.equipoZombie
      contador = equipoGan.length
   }
   let repartir = Math.round(200 / contador)
   equipoGan.forEach((doc) => {
      estudiantes.forEach((docEs) => {
         if(doc == docEs.id){
            let puntos = docEs.data().puntos
            puntos = puntos + repartir
            if(puntos > 1000){
               puntos = 1000
            }
            updateTask(docEs.id, {puntos : puntos})
            cargarTop()
         }
      })
   })
}

function falloGrupal(equipo, estudiantes){
   let contador = 0
   let equipoPer = []
   if(equipo == "humano"){      
      equipoPer = datos.equipoHumano
      contador = equipoPer.length
   }else{
      equipoPer = datos.equipoZombie
      contador = equipoPer.length
   }
   let repartir = Math.round(200 / contador)
   equipoPer.forEach((doc) => {
      estudiantes.forEach((docEs) => {
         if(doc == docEs.id){
            let puntos = docEs.data().puntos
            puntos = puntos - repartir
            if(puntos < 0){
               puntos = 0
            }
            updateTask(docEs.id, {puntos : puntos})
            cargarTop()
         }
      })
   })
}

// FUNCIONES DE LOS OBJETOS

onGetObjeto((querySnapshot) => {   
   querySnapshot.forEach((doc) => {    
         const task = doc.data()  
         if(doc.id == "amplificador" && task.activo && idEstudiante == task.id){
            amplificador(task.respuesta)       
         } 
         if(doc.id == "monedas" && task.activo && idEstudiante == task.id){
            monedas(task.respuesta)
            updateObjeto("monedas", {activo : false, id : "", respuesta : ""})
         }
         if(doc.id == "botiquin" && task.activo && idEstudiante == task.id){
            botiquin(task.respuesta)
            updateObjeto("botiquin", {activo : false, id : "", respuesta : ""})
         }     
   })
})

async function movil(){ 
   let chatEquipo = ""
   const estudiantes = await getDocs(documentosEstudiantes)
   const partida = await getDoc(docRef)
   const task = partida.data()

   estudiantes.forEach((doc) => {
   let datos = doc.data()
   if(doc.id == idEstudiante)
      chatEquipo = datos.equipo
      let objetos = []
      if(chatEquipo == "humano"){
         objetos = task.objetosHumanos 
         objetos[0] = false
         updateTaskBD(idBD, {objetosHumanos : objetos})
      }else{
         objetos = task.objetosZombies
         objetos[0] = false
         updateTaskBD(idBD, {objetosZombies : objetos})
      }
   })

   if(profesor == "true"){
      const partida = await getDoc(docRef)
      chatEquipo = partida.turno
   }

   chatAbierto = true
   document.getElementById("pantallaChat").style.visibility = "visible"
   let html= `<p class = 'chatTask'>`

   if(chatEquipo == "humano"){
      onGetTasksChat((querySnapshot) => {   
         querySnapshot.forEach((doc) => {   
            const task = doc.data() 
            mensajesChat.push({nombre: task.nombre, mensaje: task.frase, fecha: task.fecha})                
         });
         mensajesChat.sort(function(a, b){
            if(a.fecha < b.fecha){
               return 1
            }
            if(a.fecha > b.fecha){
               return -1
            }
            return 0
         }) 
         if(mensajesChat.length > 18){
            for(let i = 17; i >= 0; i--){
               html+= `<p class = 'lineasChat'>${mensajesChat[i].nombre}:&nbsp${mensajesChat[i].mensaje}</p>`
            }
         }else{
            for(let i = mensajesChat.length-1; i >= 0; i--){
               html+= `<p class = 'lineasChat'>${mensajesChat[i].nombre}:&nbsp${mensajesChat[i].mensaje}</p>`
            }
         }
      
      
         html+= `</p>`
         taskChat.innerHTML = html
         mensajesChat = []
         html = ``

         
         let objetos =task.objetosHumanos
         objetos[0] = false
         updateTaskBD(idBD, {objetosHumanos : objetos})
      })
   }

   if(chatEquipo == "zombie"){
      onGetTasksChatZ((querySnapshot) => {   
         querySnapshot.forEach((doc) => {    
            const task = doc.data() 
            mensajesChat.push({nombre: task.nombre, mensaje: task.frase, fecha: task.fecha})                
         });
         mensajesChat.sort(function(a, b){
            if(a.fecha < b.fecha){
               return 1
            }
            if(a.fecha > b.fecha){
               return -1
            }
            return 0
         }) 
         if(mensajesChat.length > 18){
            for(let i = 17; i >= 0; i--){
               html+= `<p class = 'lineasChat'>${mensajesChat[i].nombre}:&nbsp${mensajesChat[i].mensaje}</p>`
            }
         }else{
            for(let i = mensajesChat.length-1; i >= 0; i--){
               html+= `<p class = 'lineasChat'>${mensajesChat[i].nombre}:&nbsp${mensajesChat[i].mensaje}</p>`
            }
         }
      
      
         html+= `</p>`
         taskChat.innerHTML = html
         mensajesChat = []
         html = ``

         
         let objetos = task.objetosZombies
         objetos[0] = false
         updateTaskBD(idBD, {objetosZombies : objetos})
      })
   }
   let usoObjetos = await getDoc(usoObjetosDocumento)
   usoObjetos = usoObjetos.data().booleano
   usoObjetos[0] = true
   updateUsoObjeto("objetos", {booleano : usoObjetos})
}

function abrirMovil(equipo, task){
   const enJuego = task.partidaEnJuego
   const turno = task.turno
   const idTurno = task.idTurno
   if(idEstudiante == idTurno && enJuego && equipo == turno){
      document.getElementById("confirmacionMovil").style.visibility = "visible"
      cerrarResto("confirmacionMovil", todosObjetos)
   } 
}

document.getElementById('movilH').onclick =  async function(){
   const partida = await getDoc(docRef)
   const task = partida.data()
   const estudiantes = await getDocs(documentosEstudiantes)
   let equipo
   verObjetos(1)
   estudiantes.forEach((doc) => {
      const taskEstudiante = doc.data()
      if(doc.id == idEstudiante){
         if(taskEstudiante.equipo == "humano"){
            abrirMovil("humano", task)
         }else{
            abrirMovil("zombie", task)
         }
      }
   })
}

document.getElementById('movilZ').onclick = async function(){
   const partida = await getDoc(docRef)
   const task = partida.data()
   if(task.objetosZombies[0]){
      abrirMovil("zombie", task)
   } 
}

document.getElementById('siMovil').onclick = function(){
   document.getElementById("confirmacionMovil").style.visibility = "hidden"
   document.getElementById("pantallaObjetos").style.visibility = "hidden"
   movil()
}

document.getElementById('noMovil').onclick = function() {
   document.getElementById("confirmacionMovil").style.visibility = "hidden"
}

document.getElementById('medallaH').onclick =  async function(){
   verObjetos(2)
}

async function medalla(equipo, respuesta){ // Inmediato -- Si se acierta la pregunta, cada miembro del equipo sumará 50 puntos. En el caso de fallar la pregunta, cada miembro restará 50 puntos.
   // Poner en la pregunta individual un if, y en caso de que este, escribir
   // en esta función una función como la de equipos en esta
   let equipoJuga = []
   const partida = await getDoc(docRef)
   let datos = partida.data()
   let estudiantes = await getDocs(documentosEstudiantes)


   if(equipo == "humano"){      
      equipoJuga = datos.equipoHumano
   }else{
      equipoJuga = datos.equipoZombie
   }
   
   if(respuesta == "acierto"){
      equipoJuga.forEach((doc) => {
         estudiantes.forEach((docEs) => {
            if(doc == docEs.id){
               
               let puntos = docEs.data().puntos
               puntos = puntos + 50
               if(puntos > 1000){
                  puntos = 1000
               }
               updateTask(docEs.id, {puntos : puntos})
               cargarTop()
            }
         })
      })
   }else{
      equipoJuga.forEach((doc) => {
         estudiantes.forEach((docEs) => {
            if(doc == docEs.id){
               let puntos = docEs.data().puntos
               puntos = puntos - 50
               if(puntos < 0){
                  puntos = 0
               }
               updateTask(docEs.id, {puntos : puntos})
               cargarTop()
            }
         })
      })
   }
   let usoObjetos = await getDoc(usoObjetosDocumento)
   usoObjetos = usoObjetos.data().booleano
   usoObjetos[1] = true
   updateUsoObjeto("objetos", {booleano : usoObjetos})
}

document.getElementById('vitaminasH').onclick =  async function(){
   verObjetos(3)
}

async function vitaminas(respuesta, id, equipo){ // Inmediato -- Las vitaminas hacen inmune al poseedor. Estará activo durante 2 turnos, en el que no se restarán puntos si se falla la pregunta.
   const vitaminas = await getDoc(vitaminasDocumento)
   const vitaminasZ = await getDoc(vitaminasZDocumento)
   const taskVitaminas = vitaminas.data()
   const taskVitaminasZ = vitaminasZ.data()

   let usos
   if(equipo == "humano"){
      usos = taskVitaminas.turnos
   }else{
      usos = taskVitaminasZ.turnos
   }
   if(usos == 0){
      const partida = await getDoc(docRef)
      const datos = partida.data()
      if(equipo == "humano"){
         let aux = datos.objetosHumanos
         aux[2] = false
         updateTaskBD(idBD, {objetosHumanos : aux})
      }else{
         let aux = datos.objetosZombies
         aux[2] = false
         updateTaskBD(idBD, {objetosZombies : aux})
      }
   }else{
      if(respuesta == "error"){
         const estudiantes = await getDocs(documentosEstudiantes)
         estudiantes.forEach((doc) => {
            if(doc.id == id && doc.data().equipo == equipo){
               let puntos = doc.data().puntos
               puntos = puntos + 100
               updateTask(id, {puntos : puntos})
               usos = usos - 1 
               if(equipo == "humano"){
                  updateObjeto("vitaminas", {turnos : usos})
               }else{
                  updateObjeto("vitaminasZ", {turnos : usos})
               }         
            }
         })
      } 
      let usoObjetos = await getDoc(usoObjetosDocumento)
      usoObjetos = usoObjetos.data().booleano
      usoObjetos[2] = true
      updateUsoObjeto("objetos", {booleano : usoObjetos})
   }
}

async function vitaminasNuevas(equipo){  // INICIALIZAR VITAMINAS
   const partida = await getDoc(docRef)
   const task = partida.data()
   let objeto = []
   if(equipo == "humano"){
      objeto = task.objetosHumanos
   }else{
      objeto = task.objetosZombies
   }
   objeto[1] = true
   if(equipo == "humano"){
      updateTaskBD(idBD, {objetosHumanos : objeto})
      updateObjeto("vitaminas", {turnos : 2})
   }else{
      updateTaskBD(idBD, {objetosZombies : objeto})
      updateObjeto("vitaminasZ", {turnos : 2})
   }
}

document.getElementById('pegamentoH').onclick =  async function(){
   verObjetos(4)
}

async function pegamento(equipo, respuesta){ // Inmediato --  Si te haces con el pegamento, el siguiente turno el equipo contrario no mueve ficha.
   if(respuesta == "acierto"){
      const partida = await getDoc(docRef)
      const task = partida.data()
      if(equipo == "humano"){
         let aux = task.objetosHumanos
         aux[3] = false
         updateTaskBD(idBD, {objetosHumanos : aux, turno : "humano"})
      }else{
         let aux = task.objetosZombies
         aux[3] = false
         updateTaskBD(idBD, {objetosZombies : aux, turno : "zombie"})
      }
   } 
   let usoObjetos = await getDoc(usoObjetosDocumento)
   usoObjetos = usoObjetos.data().booleano
   usoObjetos[3] = true
   updateUsoObjeto("objetos", {booleano : usoObjetos}) 
}

document.getElementById('amplificadorH').onclick =  async function(){
   verObjetos(5)
}

async function amplificador(respuesta){ // Inmediato -- Quita 100 puntos a un jugador del equipo contrario a la eleccion
   if(respuesta == "acierto"){
      const amplificador = await getDoc(amplificadorDocumento)
      const task = amplificador.data()
      const partida = await getDoc(docRef)
      const taskP = partida.data()
      let documentoEstudiantes = await getDocs(documentosEstudiantes)
      document.getElementById("elegirJugador").style.visibility = "visible"
      let html = ''
      updateObjeto("amplificador", {activo : true}) 
      
      if(task.equipo == "humano"){
            taskP.equipoZombie.forEach((estudiante) => {
            let nombre = ""
            documentoEstudiantes.forEach((doc) => {
               if(doc.id == estudiante){
                  nombre = doc.data().nombre
               }
            })

            html+=`<div>
                     <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombre} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
                  </div>
            `
         })

         taskAmplificador.innerHTML = html
         const botones = taskAmplificador.querySelectorAll('.boton-jugador')
         
         botones.forEach(btn => {
            btn.addEventListener('click', ({target : {dataset}}) => {
               documentoEstudiantes.forEach((estudiante) => {
                  if (estudiante.id == dataset.id){
                     let aux = estudiante.data().puntos
                     aux = aux - 100
                     updateTask(estudiante.id, {puntos : aux})
                  }
               })
               document.getElementById("elegirJugador").style.visibility = "hidden"
            })
         })

         let objetos = taskP.objetosHumanos
         objetos[4] = false
         updateTaskBD(idBD, {objetosHumanos : objetos})
      }else{
         taskP.equipoHumano.forEach((estudiante) => {
            let nombre = ""
            documentoEstudiantes.forEach((doc) => {
               if(doc.id == estudiante){
                  nombre = doc.data().nombre
               }
            })

            html+=`<div>
                     <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombre} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
                  </div>
            `
         })

         taskAmplificador.innerHTML = html
         const botones = taskAmplificador.querySelectorAll('.boton-jugador')
         
         botones.forEach(btn => {
            btn.addEventListener('click', ({target : {dataset}}) => {
               documentoEstudiantes.forEach((estudiante) => {
                  if (estudiante.id == dataset.id){
                     let aux = estudiante.data().puntos
                     aux = aux - 100
                     updateTask(estudiante.id, {puntos : aux})
                  }
               })
               document.getElementById("elegirJugador").style.visibility = "hidden"
            })
         })

         let objetos = taskP.objetosZombies
         objetos[4] = false
         updateTaskBD(idBD, {objetosZombies : objetos})
      }
   } 
   let usoObjetos = await getDoc(usoObjetosDocumento)
   usoObjetos = usoObjetos.data().booleano
   usoObjetos[4] = true
   updateUsoObjeto("objetos", {booleano : usoObjetos})
   updateObjeto("amplificador", {activo : false, equipo : "", id : "", respuesta : ""}) 
}

document.getElementById('monedasH').onclick =  async function(){
   verObjetos(6)
}

async function monedas(respuesta){ // Inmediato -- Dona 100 puntos a un jugador de tu equipo, hay un botón para no donar los puntos
   if(respuesta == "acierto"){

      updateObjeto("monedas", {activo : true})
      const monedas = await getDoc(monedasDocumento)
      const task = monedas.data()
      let documentoEstudiantes = await getDocs(documentosEstudiantes)
      const partida = await getDoc(docRef)
      const taskP = partida.data()
      let id
      let equipo
      if(taskP.turno == "humano"){
         id =taskP.equipoZombie[taskP.equipoZombie.length - 1]
         equipo = "zombie"
      }else{
         id = taskP.equipoHumano[taskP.equipoHumano.length - 1]
         equipo = "humano"
      }
      let html = ''
      document.getElementById("donar").style.visibility = "visible"
     
      if(equipo == "humano"){
         taskP.equipoHumano.forEach((estudiante) => {
            if(estudiante != id){
               let nombre = ""
               documentoEstudiantes.forEach((doc) => {
                  if(doc.id == estudiante){
                     nombre = doc.data().nombre
                  }
            })

            html+=`<div>
                     <p class = 'monedasEstudiante'> Nombre:&nbsp${nombre} <button class = 'boton-jugador' data-id="${estudiante}">Donar</button><p>
                  </div>
            `
            }   
         })

         html+=`<div>
                  <p class = 'monedasEstudiante'> No donar 100 puntos <button class = 'boton-no'>No donar</button><p>
               </div>
               `

         taskMonedas.innerHTML = html
         const botones = taskMonedas.querySelectorAll('.boton-jugador')
         const bot = taskMonedas.querySelectorAll('.boton-no')

         botones.forEach(btn => {
            btn.addEventListener('click', ({target : {dataset}}) => {
               documentoEstudiantes.forEach((estudiante) => {
                  if (estudiante.id == dataset.id){
                     let aux = estudiante.data().puntos
                     aux = aux + 100
                     updateTask(estudiante.id, {puntos : aux})
                  }
                  if(estudiante.id == task.jugador){
                     let aux = estudiante.data().puntos
                     aux = aux - 100
                     updateTask(estudiante.id, {puntos : aux})
                  }
               })
               let objetos = taskP.objetosHumanos
               objetos[5] = false
               updateTaskBD(idBD, {objetosHumanos : objetos})
               document.getElementById("donar").style.visibility = "hidden"
            })
         })

         bot.forEach(btn => {
            btn.addEventListener('click', () => {
               let objetos = taskP.objetosHumanos
               objetos[5] = false
               updateTaskBD(idBD, {objetosHumanos : objetos})
               document.getElementById("donar").style.visibility = "hidden"
            })
         })
      }else{
         taskP.equipoZombie.forEach((estudiante) => {
            if(estudiante != id){
               let nombre = ""
               documentoEstudiantes.forEach((doc) => {
                  if(doc.id == estudiante){
                     nombre = doc.data().nombre
                  }
            })

            html+=`<div>
                     <p class = 'monedasEstudiante'> Nombre:&nbsp${nombre} <button class = 'boton-jugador' data-id="${estudiante}">Donar</button><p>
                  </div>
            `
            }   
         })

         html+=`<div>
                  <p class = 'monedasEstudiante'> No donar 100 puntos <button class = 'boton-no'>No donar</button><p>
               </div>
               `

         taskMonedas.innerHTML = html
         const botones = taskMonedas.querySelectorAll('.boton-jugador')
         const bot = taskMonedas.querySelectorAll('.boton-no')

         botones.forEach(btn => {
            btn.addEventListener('click', ({target : {dataset}}) => {
               documentoEstudiantes.forEach((estudiante) => {
                  if (estudiante.id == dataset.id){
                     let aux = estudiante.data().puntos
                     aux = aux + 100
                     updateTask(estudiante.id, {puntos : aux})
                  }
                  if(estudiante.id == task.jugador){
                     let aux = estudiante.data().puntos
                     aux = aux - 100
                     updateTask(estudiante.id, {puntos : aux})
                  }
               })
               let objetos = taskP.objetosZombies
               objetos[5] = false
               updateTaskBD(idBD, {objetosZombies : objetos})
               document.getElementById("donar").style.visibility = "hidden"
            })
         })

         bot.forEach(btn => {
            btn.addEventListener('click', () => {
               let objetos = taskP.objetosZombies
               
               objetos[5] = false
               updateTaskBD(idBD, {objetosZombies : objetos})
               document.getElementById("donar").style.visibility = "hidden"
            })
         })
      }
      let usoObjetos = await getDoc(usoObjetosDocumento)
      usoObjetos = usoObjetos.data().booleano
      usoObjetos[5] = true
      updateUsoObjeto("objetos", {booleano : usoObjetos})
   }
}

document.getElementById('botiquinH').onclick =  async function(){
   verObjetos(7)
}

async function botiquin(respuesta){ // Inmediato -- +200 puntos o vida extra. Si se falla, el objeto se pierde sin ningún beneficio ni desventaja.
   const partida = await getDoc(docRef)
   const task = partida.data()
   updateObjeto("botiquin", {activo : true})
   let id
   let equipo
   if(task.turno == "humano"){
      id = task.equipoZombie[task.equipoZombie.length - 1]
      equipo = "zombie"
   }else{
      id = task.equipoHumano[task.equipoHumano.length - 1]
      equipo = "humano"
   }
   if(respuesta == "acierto" && id == idEstudiante){
      document.getElementById("confirmacionBotiquin").style.visibility = "visible"
   }
}

document.getElementById('puntosBotiquin').onclick =  async function() {
   const estudiantes = await getDocs(documentosEstudiantes)
   const partida = await getDoc(docRef)
   const task = partida.data()
   let usoObjetos = await getDoc(usoObjetosDocumento)
   usoObjetos = usoObjetos.data().booleano
   usoObjetos[6] = true
   
   estudiantes.forEach((doc) =>{
      if(doc.id == idEstudiante){
         let puntos = doc.data().puntos
         if(puntos > 1000){
            puntos = 1000
         }
         updateTask(idEstudiante, {puntos : puntos})
         let equipo = doc.data().equipo
         
         if(equipo == "humano"){
            let objetos = task.objetosHumanos
            objetos[6] = false
            updateUsoObjeto("objetos", {booleano : usoObjetos})
            updateTaskBD(idBD, {objetosHumanos : objetos})
         }else{
            let objetos = task.objetosZombies
            objetos[6] = false
            updateUsoObjeto("objetos", {booleano : usoObjetos})
            updateTaskBD(idBD, {objetosZombies : objetos})
         }
      }
   })

   document.getElementById("confirmacionBotiquin").style.visibility = "hidden"
}

document.getElementById('vidaBotiquin').onclick =  async function(){
   const estudiantes = await getDocs(documentosEstudiantes)
   const partida = await getDoc(docRef)
   const task = partida.data()
   let usoObjetos = await getDoc(usoObjetosDocumento)
   usoObjetos = usoObjetos.data().booleano
   usoObjetos[6] = true
   
   estudiantes.forEach((doc) =>{
      if(doc.id == idEstudiante){
         let vidas = doc.data().vidaExtra
         vidas = vidas + 1
         updateTask(idEstudiante, {vidaExtra : vidas})
         let equipo = doc.data().equipo
         
         if(equipo == "humano"){
            let objetos = task.objetosHumanos
            objetos[6] = false
            updateUsoObjeto("objetos", {booleano : usoObjetos})
            updateTaskBD(idBD, {objetosHumanos : objetos})
         }else{
            let objetos = task.objetosZombies
            objetos[6] = false
            updateUsoObjeto("objetos", {booleano : usoObjetos})
            updateTaskBD(idBD, {objetosZombies : objetos})
         }
      }
   })

   document.getElementById("confirmacionBotiquin").style.visibility = "hidden"
}

// FUNCIONES DE LOS HUMANOS

async function comisarioFred(equipo, alumnoID){ // Restringe el movimiento al equipo contrario cuando acierta una pregunta durante el siguiente turno.
   let personajes = await getDoc(usoPersonajesDocumento)
   personajes = personajes.data().personajes
   personajes[0] = false
   updateUsoPersonaje("personajes", {personajes : personajes})
   repartirUnPersonajes(alumnoID, equipo, "Comisario Fred", personajes)
   updateTaskBD(idBD, {turno : equipo})
}

async function pilotoBrus(id, equipo){ // Si acierta correctamente sin ayuda vuelve a tirar el dado.
   let personajes = await getDoc(usoPersonajesDocumento)
   personajes = personajes.data().personajes
   personajes[1] = false
   updateUsoPersonaje("personajes", {personajes : personajes})
   repartirUnPersonajes(id, equipo, "Piloto Brus", personajes)
   updateTaskBD(idBD, {idTurno : id, turno : equipo})
}

async function emy(documentoEstudiantes, idE){ // Quita 100 puntos si acierta a un jugador del equipo contrario
   const partida = await getDoc(docRef)
   const task = partida.data()
   let personajes = await getDoc(usoPersonajesDocumento)
   personajes = personajes.data().personajes
   personajes[2] = false
   updateUsoPersonaje("personajes", {personajes : personajes})
   let html = ''
   let equipo
   document.getElementById("pantallaEmy").style.visibility = "visible"

   documentoEstudiantes.forEach((doc) => {
      if(doc.id == idE){
         equipo = doc.data().equipo
      }
   })

   if(equipo == "zombie"){
      task.equipoHumano.forEach((estudiante) => {
      let nombre = ""
      documentoEstudiantes.forEach((doc) => {
         if(doc.id == estudiante){
            nombre = doc.data().nombre
         }
      })

      html+=`<div>
               <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombre} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
            </div>
      `
   })

   taskEmy.innerHTML = html
   const botones = taskEmy.querySelectorAll('.boton-jugador')
   
   botones.forEach(btn => {
      btn.addEventListener('click', ({target : {dataset}}) => {
         documentoEstudiantes.forEach((estudiante) => {
            if (estudiante.id == dataset.id){
               let aux = estudiante.data().puntos
               aux = aux - 100
               updateTask(estudiante.id, {puntos : aux})
            }
         })
         document.getElementById("pantallaEmy").style.visibility = "hidden"
      })
   })

   }else{
      task.equipoZombie.forEach((estudiante) => {
         let nombre = ""
         documentoEstudiantes.forEach((doc) => {
            if(doc.id == estudiante){
               nombre = doc.data().nombre
            }
         })

         html+=`<div>
                  <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombre} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
               </div>
         `
      })

      taskEmy.innerHTML = html
      const botones = taskEmy.querySelectorAll('.boton-jugador')
      
      botones.forEach(btn => {
         btn.addEventListener('click', ({target : {dataset}}) => {
            documentoEstudiantes.forEach((estudiante) => {
               if (estudiante.id == dataset.id){
                  let aux = estudiante.data().puntos
                  aux = aux - 100
                  updateTask(estudiante.id, {puntos : aux})
               }
            })
            document.getElementById("pantallaEmy").style.visibility = "hidden"
         })
      })
   }

   repartirUnPersonajes(idE, equipo, "Emy", personajes)

}

// FUNCIONES DE LOS ZOMBIES

async function srtaLix(id, equipo){ // Tiene dos oportunidades para responder a la pregunta
   let personajes = await getDoc(usoPersonajesDocumento)
   personajes = personajes.data().personajes
   personajes[3] = false
   updateUsoPersonaje("personajes", {personajes : personajes})
   repartirUnPersonajes(id, equipo, "Señorita Lix", personajes)
   document.getElementById("pantallaLix").style.visibility = "visible"
   cerrarPestana("pantallaLix")
}

async function drJow(documentoEstudiantes, idE){ // Cuando acierta pregunta, roba 50 puntos extra al jugador que quiera de la Resistencia
   const partida = await getDoc(docRef)
   const task = partida.data()
   let personajes = await getDoc(usoPersonajesDocumento)
   personajes = personajes.data().personajes
   let html = ''
   let equipo
   document.getElementById("pantallaJow").style.visibility = "visible"

   personajes[4] = false
   updateUsoPersonaje("personajes", {personajes : personajes})

   documentoEstudiantes.forEach((doc) => {
      if(doc.id == idE){
         equipo = doc.data().equipo
      }
   })

   if(equipo == "zombie"){
      task.equipoHumano.forEach((estudiante) => {
      let nombre = ""
      documentoEstudiantes.forEach((doc) => {
         if(doc.id == estudiante){
            nombre = doc.data().nombre
         }
      })

      html+=`<div>
               <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombre} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
            </div>
      `
   })

   taskJow.innerHTML = html
   const botones = taskJow.querySelectorAll('.boton-jugador')
   
   botones.forEach(btn => {
      btn.addEventListener('click', ({target : {dataset}}) => {
         documentoEstudiantes.forEach((estudiante) => {
            if (estudiante.id == dataset.id){
               let aux = estudiante.data().puntos
               aux = aux - 50
               updateTask(estudiante.id, {puntos : aux})
            }
            if(estudiante.id == idE){
               let aux = estudiante.data().puntos
               aux = aux + 50
               updateTask(idE, {puntos : aux})
            }
         })
         document.getElementById("pantallaJow").style.visibility = "hidden"
      })
   })

}else{
   task.equipoZombie.forEach((estudiante) => {
      let nombre = ""
      documentoEstudiantes.forEach((doc) => {
         if(doc.id == estudiante){
            nombre = doc.data().nombre
         }
      })

      html+=`<div>
               <p class = 'amplificadorEstudiante'> Nombre:&nbsp${nombre} <button class = 'boton-jugador' data-id="${estudiante}">Seleccionar</button><p>
            </div>
      `
   })

   taskJow.innerHTML = html
   const botones = taskJow.querySelectorAll('.boton-jugador')
   
   botones.forEach(btn => {
      btn.addEventListener('click', ({target : {dataset}}) => {
         documentoEstudiantes.forEach((estudiante) => {
            if (estudiante.id == dataset.id){
               let aux = estudiante.data().puntos
               aux = aux - 50
               updateTask(estudiante.id, {puntos : aux})
            }
            if(estudiante.id == idE){
               let aux = estudiante.data().puntos
               aux = aux + 50
               updateTask(idE, {puntos : aux})
            }
         })
         document.getElementById("pantallaJow").style.visibility = "hidden"
      })
   })
   }


   repartirUnPersonajes(idE, equipo, "Doctor Jow", personajes)
}

async function sargentoDelis(id, puntos, equipo){ // puede desarrollar un escudo protector. El escudo permite no perder puntos ante una pregunta fallada.
   let personajes = await getDoc(usoPersonajesDocumento)
   personajes = personajes.data().personajes
   personajes[5] = false
   updateUsoPersonaje("personajes", {personajes : personajes})
   let punt = puntos + 100
   repartirUnPersonajes(id, equipo, "Sargento Delis", personajes)
   updateTask(id, {puntos : punt})
}

// FUNCION PARA REPARTIR UN PERSONAJE USADO

async function repartirUnPersonajes(id, equipo, personaje, personajes){
   const partida = await getDoc(docRef)
   const task = partida.data()
   const estudiantes = await getDocs(documentosEstudiantes)
   let equipoEstudiantes

   if(equipo == "humano"){
      equipoEstudiantes = task.equipoHumano
   }else{
      equipoEstudiantes = task.equipoZombie
   }
   
   let posiblesEstudiantes = []

   if(equipoEstudiantes.length == 1){
      posiblesEstudiantes.push(equipoEstudiantes[0])
   }else{
      equipoEstudiantes.forEach((estudiante) => {
         estudiantes.forEach((idE) => {
            if(estudiante == idE.id && idE.data().personaje == "" && idE.id != id){
               posiblesEstudiantes.push(estudiante)
            }
         })
      })
   }  

   switch(personaje){
      case "ComisarioFred":
         personajes[0] = true
         updateUsoPersonaje("personajes", {personajes : personajes})
      break;
      case "PilotoBrus":
         personajes[1] = true
         updateUsoPersonaje("personajes", {personajes : personajes})
      break;
      case "Emy":
         personajes[2] = true
         updateUsoPersonaje("personajes", {personajes : personajes})
      break;
      case "Lix":
         personajes[3] = true
         updateUsoPersonaje("personajes", {personajes : personajes})
      break;
      case "Jow":
         personajes[4] = true
         updateUsoPersonaje("personajes", {personajes : personajes})
      break;
      case "Sargento":
         personajes[5] = true
         updateUsoPersonaje("personajes", {personajes : personajes})
      break;
   }

   let valorAux = Math.floor(Math.random() * posiblesEstudiantes.length)
   updateTask(posiblesEstudiantes[valorAux], {personaje : personaje})
   updateTask(id, {personaje : ""})
}

// FUNCIONES PARA SALTAR LOS MENSAJES AL USAR UN PERSONAJE O UN OBJETO

async function notificacionObjeto(objeto, listaObj, num){
   const partida = await getDoc(docRef)
   const task = partida.data()
   if(task.enJuego){
      document.getElementById("uso" + objeto).style.visibility = "visible"
      cerrarPestana("uso" + usoObjetos[num])
      listaObj[num] = false
      updateUsoObjeto("objetos", {booleano : listaObj}) 
   }  
}

onGetUsoObjeto((querySnapshot) => {   
   querySnapshot.forEach(async (doc) => {    
      const task = doc.data()  
      let objetos = task.booleano
      let contador = 0
      objetos.forEach((objeto) => {
         if(objeto){
            notificacionObjeto(usoObjetos[contador], objetos, contador)
         }
         contador++
      })              
   });
})

async function notificacionPersonaje(personaje, listaPer, num){
   const partida = await getDoc(docRef)
   const task = partida.data()
   if(task.enJuego){
      document.getElementById("uso" + personaje).style.visibility = "visible"   
      cerrarPestana("uso" + usoPersonajes[num])
      listaPer[num] = true
      updateUsoPersonaje("personajes", {personajes : listaPer})
   }
}

onGetUsoPersonaje((querySnapshot) => {   
   querySnapshot.forEach(async (doc) => {    
      const task = doc.data()  
      let personajes = task.personajes
      let contador = 0
      personajes.forEach((personaje) => {
         if(personaje == false){
            notificacionPersonaje(usoPersonajes[contador], personajes, contador)
         }
         contador++
      })              
   });
})

//PRUEBAS

document.getElementById('fichaHumano').onclick = async function() {
   document.getElementById("confirmacionBotiquin").style.visibility = "visible"
   botiquin("acierto")
}

let contador = 1
document.getElementById('hHospital').onclick = async function() {
   const partida = await getDoc(docRef)
   const task = partida.data()

   let posicionesObjetos = task.posObjetos
   elegirPosicion(1, posicionesObjetos[1] + 1 , 3)
   let posH = task.posHumano
   let posZ = task.posZombie
   let objH = task.objetosHumanos
   let objZ = task.objetosZombies

   comprobarObjetos(posicionesObjetos, posH, posZ, objH, objZ)
}

//recordar borrar en seleccionarPreguntaCasilla