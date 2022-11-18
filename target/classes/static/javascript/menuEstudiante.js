import {docRef, updateTaskBD, idBD} from './firebase.js'
import { getDoc} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js"

var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)

var nombre = urlParams.get('nombre')
var correo = urlParams.get('mail')
var id = urlParams.get('id')


const partida = await getDoc(docRef)
var partidaDatos = partida.data()

var jugadoresActuales = partidaDatos.jugadoresActuales
if(jugadoresActuales.includes(id) == false){
    jugadoresActuales.push(id)
    updateTaskBD(idBD, {jugadoresActuales : jugadoresActuales})
}

/* BOTONES */

document.getElementById('perfil').onclick = function() { 
    window.location.href = "editarPerfil.html?nombre=" + nombre + "&mail=" + correo +"&id=" + id
}

document.getElementById('jugar').onclick = function() { 
    window.location.href = "tablero.html?estudianteID=" + id
}

