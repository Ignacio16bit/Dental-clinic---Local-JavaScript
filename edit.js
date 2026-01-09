//Editar entradas
let edicion;
function editarEntrada(id){
    let citas = JSON.parse(localStorage.getItem("citaStorage")) || [];
    edicion = citas.find(cita=> cita.id === id);
    
    if (edicion){
        $('#modalEdit').modal('show');

        document.getElementById("nameEdit").value = edicion.pacName;
        document.getElementById("apellidoEdit").value = edicion.pacSurname;
        document.getElementById("dniEdit").value = edicion.pacDNI;
        document.getElementById("tlfEdit").value = edicion.pacTlf;
        document.getElementById("birthEdit").value = edicion.pacBirth;
        document.getElementById("diaCitaEdit").value = edicion.citaDate;
        document.getElementById("horaCitaEdit").value = edicion.citaTime;
    };
}
function guardarEdit(){
    edicion.pacName = document.getElementById("nameEdit").value;
    edicion.pacSurname = document.getElementById("apellidoEdit").value;
    edicion.pacDNI = document.getElementById("dniEdit").value;
    edicion.pacTlf = document.getElementById("tlfEdit").value;
    edicion.pacBirth = document.getElementById("birthEdit").value;
    edicion.citaDate = document.getElementById("diaCitaEdit").value;
    edicion.citaTime = document.getElementById("horaCitaEdit").value;
    //Guardo en local 
    let citas = JSON.parse(localStorage.getItem("citaStorage")) || [];
    citas = citas.map(c => c.id === edicion.id ? edicion :c) //Reemplazo solo si coincide el ID
    localStorage.setItem('citaStorage', JSON.stringify(citas));

    guardarDOM(edicion);
    //Llamo a cargar entradas para que muestre la información correcta
    document.getElementById("tabla-citas").innerHTML = "";
    cargarEntradas();

    //cierro modal
    $('#modalEdit').modal('hide');
}
function guardarDOM(cita){
    //Paso los nuevos contenidos por argumento
    //Como las filas comparten el ID las referencio por el, es decir:
    let filas = document.getElementById(cita.id);
    if (filas){
        //Convierto cada celda en un índice de array
        let celdas = filas.getElementsByTagName("td");
        celdas[1].textContent = cita.pacName + " " + cita.pacSurname;
        celdas[1].textContent = cita.pacDNI;
        celdas[2].textContent = cita.pacTlf;
        celdas[3].textContent = cita.pacBirth;
        celdas[4].textContent = cita.citaDate;
        celdas[5].textContent = cita.citaTime;
    };
}


function borrarEntrada(id){
    if (confirm(`Va a eliminar la entrada con id: ${id}`)){
        //Borrado del DOM
        let borrar = document.getElementById(id);
        if (borrar){
            borrar.remove();
        }

        //Borrado del localStorage
        try{
            let citaStorage = JSON.parse(localStorage.getItem("citaStorage"));
            citaStorage = citaStorage.filter((Cita)=>Cita.id !== id);
            localStorage.setItem("citaStorage", JSON.stringify(citaStorage));
            console.log('Elemento eliminado del almacenamiento local');
        }catch{
            console.error('No se pudo borrar la entrada del elemento local', error);
        }
        alert('Entrada eliminada');
    } else {
        console.log('Borrado cancelado');
    }

}
