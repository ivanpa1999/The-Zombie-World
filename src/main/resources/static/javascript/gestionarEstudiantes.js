import {onGetTasks, deleteTask, partida, updateTaskBD, docEstudiantesActuales, deleteTaskJugadorActual, updateTaskJugadorActual} from './firebase.js'

const taskContainer = document.getElementById("task-container")
let idBD = "c2HU0emMDxdqb6kdJkT4"
 
function cargar(){
    onGetTasks((querySnapshot) => {   //Cada vez que se produzca un cambio, actualizamos los datos

        let html = ''
        querySnapshot.forEach((doc) => {    //Listamos los datos
            const task = doc.data()  //Con data-id = ... Guardamos en el boton con la variable id la id del dato en la base de datos
            html += ` 
                    <div>
                        <p class = 'estudiante'> Correo: ${task.correo} &nbsp;&nbsp;&nbsp;&nbsp;Nombre:${task.nombre} <button class = 'btn-delete' data-id="${doc.id}">Eliminar</button><p>                           
                    </div>`
        });
    
        taskContainer.innerHTML = html
    
        const btnsDelete = taskContainer.querySelectorAll('.btn-delete')
        
        btnsDelete.forEach(btn => {
            btn.addEventListener('click', ({target : {dataset}}) => {   //Extraigo el id del boton
                deleteTask(dataset.id)
                let alumnos = partida.data().alumnos
                for(let i = 0; i < alumnos.length; i++){
                    if(dataset.id == alumnos[i]){
                        alumnos.splice(i, 1)
                    }
                }
                updateTaskBD(idBD, {alumnos : alumnos})
                docEstudiantesActuales.forEach((estudiante) => {
                    let ids = estudiante.data().ids
                    for(let i = 0; i < ids.length; i++){
                        if(ids[i] == dataset.id){
                            ids.splice(i, 1)
                            updateTaskJugadorActual(estudiante.id, {ids : ids})
                        }
                    }

                })
            })
        })
    
        })
}

cargar()



