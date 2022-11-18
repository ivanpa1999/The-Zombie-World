document.getElementById('interrogacion').onclick = function(){
    document.getElementById("modalInterrogacion").style.visibility = "visible"
}

document.getElementById('cerrarInterrogacion').onclick = function(){
    document.getElementById("modalInterrogacion").style.visibility = "hidden"
}

document.getElementById('profesor').onclick = function(){
    document.getElementById("profesor").style.visibility = "hidden"
    document.getElementById("estudiante").style.visibility = "hidden"
    document.getElementById("contrasenaProfesor").style.visibility = "visible"
}

document.getElementById('enviar').onclick = function(){
    document.getElementById("contrasenaProfesor").style.visibility = "hidden"
    if(contrasena.value == "ProfesorTFG2022"){
        window.location.href = "profesorDos.html"
    }else{
        document.getElementById("error").style.visibility = "visible"
    }
}

document.getElementById('aceptar').onclick = function(){
    document.getElementById("error").style.visibility = "hidden"
    document.getElementById("contrasenaProfesor").style.visibility = "visible"
}

document.getElementById('cancelar').onclick = function(){
    document.getElementById("contrasenaProfesor").style.visibility = "hidden"
    document.getElementById("profesor").style.visibility = "visible"
    document.getElementById("estudiante").style.visibility = "visible"
}