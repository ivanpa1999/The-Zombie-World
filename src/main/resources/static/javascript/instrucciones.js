// PREGUNTA

document.getElementById('interrogacion').onclick = function(){
    document.getElementById("modalInterrogacion").style.visibility = "visible"
}

document.getElementById('cerrarPregunta').onclick = function(){
    document.getElementById("modalInterrogacion").style.visibility = "hidden"
}