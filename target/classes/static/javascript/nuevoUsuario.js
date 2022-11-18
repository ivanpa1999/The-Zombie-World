import {saveTask, docRef, documentosEstudiantes, updateTaskBD, idBD} from './firebase.js'
import { getDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js"

var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)

var nombre = ""
var correo = ""
var id = ""



var error = urlParams.get('error')
var error2 = urlParams.get('error2')


if(error){
    document.getElementById("ventanaError").style.visibility = "visible"
}

if(error2){
    document.getElementById("ventanaError2").style.visibility = "visible"
}

function errorr(){
    window.location.href = "nuevoUsuario.html?error=true"
}

function errorr2(){
    window.location.href = "nuevoUsuario.html?error2=true"
}

async function crearUsuario(nombre, correo){
    const partida = await getDoc(docRef)
    var partidaDatos = partida.data()
    var equipo = partidaDatos.equipoEstudiante
    saveTask(nombre, correo, equipo, 500, "", 1, false)
    
    let arrayAlumnos = partida.data().alumnos
    let numAlumnos = partida.data().numAlumnos
    numAlumnos++
    const estudiantes = await getDocs(documentosEstudiantes)
    id = ""
    estudiantes.forEach((estudiante) => {
        if(estudiante.data().correo == correo){
            id = estudiante.id
        }
    })

    if(equipo == "humano"){
        var equipo = partidaDatos.equipoHumano
        equipo.push(id)
        console.log(equipo)
        updateTaskBD(idBD, {equipoEstudiante : "zombie", equipoHumano : equipo})
    }else{
        var equipo = partidaDatos.equipoZombie
        equipo.push(id)
        console.log(equipo)
        updateTaskBD(idBD, {equipoEstudiante : "humano", equipoZombie : equipo})
    }
    
    arrayAlumnos.push(id)
    updateTaskBD(idBD, {alumnos : arrayAlumnos, numAlumnos : numAlumnos})
    document.getElementById("usuarioCreado").style.visibility = "visible" 
}

document.getElementById('boton').onclick = async function(){
    nombre = nameT.value
    correo = mail.value
    
    if(nombre == "" || correo == ""){
        errorr()
    }
    const estudiantes = await getDocs(documentosEstudiantes)
    estudiantes.forEach((estudiante) => {
        if(estudiante.data().correo == correo){
            errorr2()
        }
    })
    crearUsuario(nombre, correo)

}

document.getElementById('aceptar').onclick = async function() {
    window.location.href = "menuEstudiante.html?nombre=" + nombre + "&mail=" + correo + "&id=" + id
}

document.getElementById('aceptarError').onclick = function(){
    document.getElementById("ventanaError").style.visibility = "hidden"
    window.location.href = "nuevoUsuario.html"
}

document.getElementById('aceptarError2').onclick = function(){
    document.getElementById("ventanaError2").style.visibility = "hidden"
}