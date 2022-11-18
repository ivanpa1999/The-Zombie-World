import {onGetTasks, updateTask} from './firebase.js'

var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)

var nombre = urlParams.get('nombre')
var mail = urlParams.get('mail')
var id = urlParams.get('id')

var auxNombre
var auxCorreo

tablaEN.value = nombre
tablaEC.value = mail

document.getElementById('botonEditar').onclick = function() {

    onGetTasks((querySnapshot) => {   //Cada vez que se produzca un cambio, actualizamos los datos
    
        querySnapshot.forEach((doc) => {    //Listamos los datos
            const task = doc.data()  //Con data-id = ... Guardamos en el boton con la variable id la id del dato en la base de datos
                    if(id == doc.id){
                        updateTask(id, {nombre: tablaEN.value, correo : tablaEC.value})
                        correo = tablaEN.value
                        nombre = tablaEC.value
                    }
        });
        })
    auxNombre = tablaEN.value
    auxCorreo = tablaEC.value
    document.getElementById("editarUsuario").style.visibility = "hidden";
    document.getElementById("cuadroConfirmacionEditar").style.visibility = "visible";   
}

document.getElementById('aceptar').onclick = function() {
    window.location.href = "menuEstudiante.html?nameT=" + auxNombre + "&mail=" + auxCorreo + "&comprobador=editar"
}

document.getElementById('volverEditarPerfil').onclick = function() {
    window.location.href = "menuEstudiante.html?nameT=" + nombre + "&mail=" + mail + "&comprobador=editar"
}
