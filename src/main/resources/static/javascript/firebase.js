// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs, onSnapshot, deleteDoc, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";  //IMPORTAR LOS METODOS DE LA BASE DE DATOS DE FIREBASE

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZyqGHaExnk0ppk0MhL3-PNoOIlJrpjjo",
  authDomain: "thezombieworld-91a95.firebaseapp.com",
  projectId: "thezombieworld-91a95",
  storageBucket: "thezombieworld-91a95.appspot.com",
  messagingSenderId: "120738154873",
  appId: "1:120738154873:web:a7edc421ac8f7bbcc847a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore()   //Este objeto es la conexion a la base de datos

// CONSTANTES A EXPORTAR

export const idPregunta = "7LsaJmUMUKmhu3f0JUAO"
export const idRespuesta = "XevQjS0IcDVoxSVyxDr4"

// DATOS DE ALUMNOS

export const saveTask = (nombre, correo, equipo, puntos, personaje, vidaExtra, haTenidoVidaExtra) => {  //Guarda un Nombre y un correo de un alumno
    addDoc(collection(db, 'estudiante'), {nombre, correo, equipo, puntos, personaje, vidaExtra, haTenidoVidaExtra})  //Agregamos un dato a la base estudiante
    console.log("Dentro")
  }
 
export const getTasks = () => getDocs(collection(db, "estudiante"));   //Traer los datos de la base de datos

export const onGetTasks = (callback) => onSnapshot(collection(db, 'estudiante'), callback)    //Actualiza los datos segun haya cambios

export const deleteTask = (id) => deleteDoc(doc(db, 'estudiante', id))    //Eliminar un dato de la base de datos

export const getTask = (id) => getDoc(doc(db, 'estudiante', id))    //Extraemos un solo dato de la base de datos

export const updateTask = (id, newFields) => 
  updateDoc(doc(db, 'estudiante', id), newFields)

// DATOS DE LA PARTIDA

export const idBD = "c2HU0emMDxdqb6kdJkT4"

export const saveBD = (numAlumnos, alumnos, posHumano, posZombie, objetosHumanos, objetosZombies, partidaEnJuego, equipoEstudiante, diasJugados, idTurno, equipoHumano, equipoZombie, preguntas, haRespondido, tipoPregunta, posObjetos, idTurnoAnterior, partidaNueva) => {
  addDoc(collection(db, 'partida'), {numAlumnos, alumnos, posHumano, posZombie, objetosHumanos, objetosZombies, partidaEnJuego, equipoEstudiante, diasJugados, idTurno, equipoHumano, equipoZombie, preguntas, haRespondido, tipoPregunta, posObjetos, idTurnoAnterior, partidaNueva})
}

export const getTasksBD = () => getDocs(collection(db, 'partida'))

export const onGetTasksBD = (callback) => onSnapshot(collection(db, 'partida'), callback)

export const updateTaskBD = (id, newFields) =>
  updateDoc(doc(db, 'partida', id), newFields)

// CHAT

export const saveTaskChat = (nombre, frase, fecha) => {
  addDoc(collection(db, 'chat'), {nombre, frase, fecha})
}

export const getTasksChat = () => getDocs(collection(db, 'chat'))

export const onGetTasksChat = (callback) => onSnapshot(collection(db, 'chat'), callback)

export const getTaskChat = (id) => getDoc(doc(db, 'chat', id))

export const deleteTaskChat = (id) => deleteDoc(doc(db, 'chat', id))


export const saveTaskChatZ = (nombre, frase, fecha) => {
  addDoc(collection(db, 'chatZombie'), {nombre, frase, fecha})
}

export const getTasksChatZ = () => getDocs(collection(db, 'chatZombie'))

export const onGetTasksChatZ = (callback) => onSnapshot(collection(db, 'chatZombie'), callback)

export const getTaskChatZ = (id) => getDoc(doc(db, 'chatZombie', id))

export const deleteTaskChatZ = (id) => deleteDoc(doc(db, 'chatZombie', id))

//FUNCIONES PARA OBTENER JUGADORES ACTUALES

export const saveJugadoresActuales = (ids, dias) => {
  addDoc(collection(db, 'jugadoresActuales'), {ids, dias})
}

export const getTasksJugadoresActuales = () => getDocs(collection(db, "jugadoresActuales"));

export const deleteTaskJugadorActual = (id) => deleteDoc(doc(db, 'jugadoresActuales', id))    //Eliminar un dato de la base de datos

export const updateTaskJugadorActual = (id, newFields) => 
  updateDoc(doc(db, 'jugadoresActuales', id), newFields)

// FUNCIONES PARA LAS PREGUNTAS

export const savePregunta = (preguntaActual, tipo, id) => {  //Guarda un Nombre y un correo de un alumno
  addDoc(collection(db, 'pregunta'), {preguntaActual, tipo, id})  //Agregamos un dato a la base estudiante
}

export const getTasksPregunta = () => getDocs(collection(db, "pregunta"))

export const getTaskPregunta = (id) => getDoc(doc(db, 'pregunta', id))

export const onGetPregunta = (callback) => onSnapshot(collection(db, 'pregunta'), callback)

export const updatePregunta = (id, newFields) => 
  updateDoc(doc(db, 'pregunta', id), newFields)

export const saveRespuesta = (resultado) => {  //Guarda un Nombre y un correo de un alumno
    addDoc(collection(db, 'pregunta'), {resultado})  //Agregamos un dato a la base estudiante
}

export const updateRespuesta = (id, newFields) => 
  updateDoc(doc(db, 'respuesta', id), newFields)

 export const getTasksRespuesta = () => getDocs(collection(db, "respuesta"))

export const getTaskRespuesta = (id) => getDoc(doc(db, 'respuesta', id))

export const onGetRespuesta = (callback) => onSnapshot(collection(db, 'respuesta'), callback)

//OBJETOS

export const getTasksObjetos = () => getDocs(collection(db, "objetos"))

export const getTaskObjeto = (id) => getDoc(doc(db, 'objetos', id))

export const updateObjeto = (id, newFields) => 
  updateDoc(doc(db, 'objetos', id), newFields)

export const onGetObjeto = (callback) => onSnapshot(collection(db, 'objetos'), callback)

// PARA LAS PANTALLAS DE USO OBJETOS Y USO PERSONAJES

export const getUsoObjetos = () => getDocs(collection(db, "usoObjetos"))

export const getsUsoObjeto = (id) => getDoc(doc(db, 'usoObjetos', id))

export const updateUsoObjeto = (id, newFields) => 
  updateDoc(doc(db, 'usoObjetos', id), newFields)

export const onGetUsoObjeto = (callback) => onSnapshot(collection(db, 'usoObjetos'), callback)



export const onGetUsoPersonaje = (callback) => onSnapshot(collection(db, 'usoPersonajes'), callback)

export const getUsoPersonaje = () => getDocs(collection(db, "usoPersonajes"))

export const getsUsoPersonaje = (id) => getDoc(doc(db, 'usoPersonajes', id))

export const updateUsoPersonaje = (id, newFields) => 
  updateDoc(doc(db, 'usoPersonajes', id), newFields)



//EXPORTAR

export const docRef = doc(db, "partida", "c2HU0emMDxdqb6kdJkT4");
export const partida = await getDoc(docRef);

export const docRefe = doc(db, "pregunta", idPregunta);
export const pregunta = await getDoc(docRefe);

export const docRespuesta = doc(db, "respuesta", idRespuesta);
export const respuesta = await getDoc(docRespuesta);

export const documentosEstudiantes = collection(db, "estudiante")
export const docEstudiantes = await getDocs(documentosEstudiantes)

export const documentosEstudiantesActuales = collection(db, "jugadoresActuales")
export const docEstudiantesActuales = await getDocs(documentosEstudiantesActuales)

export const documentosChat = collection(db, "chat")
export const docChatActuales = await getDocs(documentosChat) 

export const documentosChatZ = collection(db, "chatZombie")
export const docChatZActuales = await getDocs(documentosChatZ)


export const amplificadorDocumento = doc(db, "objetos", "amplificador")
export const botiquinDocumento = doc(db, "objetos", "botiquin")
export const medallaDocumento = doc(db, "objetos", "medalla")
export const monedasDocumento = doc(db, "objetos", "monedas")
export const movilDocumento = doc(db, "objetos", "movil")
export const pegamentoDocumento = doc(db, "objetos", "pegamento")
export const vitaminasDocumento = doc(db, "objetos", "vitaminas")
export const vitaminasZDocumento = doc(db, "objetos", "vitaminasZ")

export const usoPersonajesDocumento = doc(db, "usoPersonajes", "personajes")
export const usoObjetosDocumento = doc(db, "usoObjetos", "objetos")