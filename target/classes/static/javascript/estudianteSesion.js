import {documentosEstudiantes, idBD, updateTaskBD, idBD} from './firebase.js'
import {getDocs} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js"

var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)

var error3 = urlParams.get('error3')

if(error3){
    document.getElementById("ventanaError3").style.visibility = "visible"
}

function errorr3(){
    window.location.href = "estudianteSesion.html?error3=true"
}


document.getElementById('boton2').onclick = async function(){
    let nombre = nameT.value
    let correo = mail.value   
    let name = ""
    let email = ""
    let id = ""
    let equipo = ""

    const estudiantes = await getDocs(documentosEstudiantes)
    estudiantes.forEach((estudiante) => {
        let task = estudiante.data()
        if(task.correo == correo && nombre == task.nombre){
            name = nombre
            email = correo
            id = estudiante.id
            equipo = task.equipo
        }
    })
    if(name == "" || email == ""){
        errorr3()
    }

    const partida = await getDoc(docRef)
    let task = partida.data()
    if(equipo == "humano"){
        let jugadoresEquipo = task.equipoHumano
        jugadoresEquipo.push(id)
        updateTaskBD(idBD, {equipoHumano : jugadoresEquipo})
    }else{
        let jugadoresEquipo = task.equipoZombie
        jugadoresEquipo.push(id)
        updateTaskBD(idBD, {equipoZombie : jugadoresEquipo})
    }

    document.getElementById("usuarioCreado").style.visibility = "visible"
}

document.getElementById('aceptar').onclick = function(){
    window.location.href = "menuEstudiante.html?nombre=" + name + "&mail=" + email + "&id=" + id
}

document.getElementById('aceptarError3').onclick = function(){
    document.getElementById("ventanaError3").style.visibility = "hidden"
}