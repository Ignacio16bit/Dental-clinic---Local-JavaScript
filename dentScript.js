
document.addEventListener("DOMContentLoaded", cargarEntradas);

function error(mensaje){
    alert(mensaje);
}
//RegEx para validar campos:
function validDNI(DNI){
    const dniRegex = /^\d{8}[A-Za-z]$/;
    return dniRegex.test(DNI);
}
function validTlf(tlf){
    const tlfRegex = /^(\+34|0034|34)?[ -]*(6|7)[ -]*([0-9][ -]*){8}/;
    return tlfRegex.test(tlf);
}
function validText(text){
    const textRegex = /^[a-zA-Z\s]+$/;
    return textRegex.test(text);
}
function generarID(Cita) {
    let dia = document.getElementById("diaCita").value;
    let hora = document.getElementById("horaCita").value
    let id = "CID_" + dia+ "/"+hora;
    return id;;
    }
    
function auth(){
    //Recojo los valores a autorizar
    let name = document.getElementById("name").value;
    let surname = document.getElementById("apellido").value;
    let tlf = document.getElementById("tlf").value;
    let DNI = document.getElementById("dni").value;

    console.log('Autorizando campos');
    //Que los campos estén completos
    if(!name || !surname || !tlf || !DNI){
        error('Complete los campos obligatorios');
        return false;
    }
    //Que el nombre sea válido
    if(name.length<2){
        error('El nombre debe tener más de dos caracteres');
        return false;
    }
    if (!validText(name)){
        error('El formato del nombre no es válido')
        return false;
    }
    if (!validText(surname)){
        error('El formato del apellido no es válido')
        return false;
    }
    //Compruebo el DNI con un Regex que lo valide
    if(!validDNI(DNI)){
        error('Formato de DNI incorrecto, revíselo.');
        return false;
    }
    //Compruebo el número con regex
    if(!validTlf(tlf)){
        error('Formato de teléfono incorrecto. (Sólo número español)');
        return false;
    }
    console.log('Campos autorizados');
    //Si cumple las condiciones devuelve "autorizado"
    return true;
}

document.getElementById('create').addEventListener('click', function(e){
    e.preventDefault();
    if (auth()){
        console.log('Entrada autorizada, creando tabla...');
        crearEntrada();
    } else {
        console.log('Error en creación');
        error('Algo fue mal durante la creación de la cita. Revise consola o contacte a IT');
    }
})

function crearEntrada(){
    let Cita = {
        pacName: document.getElementById("name").value,
        pacSurname: document.getElementById("apellido").value,
        pacDNI: document.getElementById("dni").value,
        pacTlf: document.getElementById("tlf").value,
        pacBirth: document.getElementById("birth").value,
        citaDate: document.getElementById("diaCita").value,
        citaTime: document.getElementById("horaCita").value,
    };

    //Compruebo que no haya solape
    if(Duplicate(Cita)){
        error('Esa franja está ocupada. Las citas duran al menos 15 minutos');
        return false;
    }

    //Añadimos el identificador único
    Cita.id = generarID(Cita);

    console.log('Guardando datos en almacenamiento local...');
    let citaStorage = JSON.parse(localStorage.getItem('citaStorage')) || [];
    citaStorage.push(Cita);
    localStorage.setItem('citaStorage', JSON.stringify(citaStorage));
    console.log('Datos guardados con éxito.');


    document.getElementById("formulario").reset();

    //Llamo a cargar entradas para que ordene las entradas por fecha/hora
    document.getElementById("tabla-citas").innerHTML = `
                <thead>
                    <tr>
                        <th>Orden de cita</th>
                        <th>Nombre paciente</th>
                        <th>DNI</th>
                        <th>Teléfono</th>
                        <th>Fecha de nacimiento</th>
                        <th>Día de la cita</th>
                        <th>Hora de la cita</th>
                        <th>Editar entrada</th>
                    </tr>
                </thead>`;

    cargarEntradas();
}

function cargarEntradas(){
    let citas = JSON.parse(localStorage.getItem('citaStorage')) || [];

    //Ordeno las citas por fecha y horas antes de mostrarlas
    citas.sort((a,b) =>{
        //Fecha
        if (a.citaDate!==b.citaDate){
            return a.citaDate.localeCompare(b.citaDate);
        } else if(a.citaDate === b.citaDate) {
            //Si es la misma fecha compara horas
            return a.citaTime.localeCompare(b.citaTime);
        }
    });

    citas.forEach((cita, index) => { let citaArray = [
        (index+1).toString(),
        cita.pacName +" "+ cita.pacSurname,
        cita.pacDNI,
        cita.pacTlf,
        cita.pacBirth,
        cita.citaDate,
        cita.citaTime
    ];
    let entrada = document.createElement("tr");
    entrada.id=cita.id;
    for (let i = 0; i<citaArray.length; i++){
        let td = document.createElement("td");
        td.textContent = citaArray[i];
        entrada.appendChild(td);
    };
    document.getElementById("tabla-citas").appendChild(entrada);
    
    let botonBorrar = document.createElement("button");
    botonBorrar.innerHTML = 'Borrar';
    botonBorrar.className = 'ui red button';
    botonBorrar.style='margin-left:5%;';
    botonBorrar.onclick = function (){
        borrarEntrada(cita.id);
    };
    let botonEditar = document.createElement("button");
    botonEditar.innerHTML = 'Editar';
    botonEditar.className = 'ui button';
    botonEditar.id = 'editButton';
    botonEditar.style='margin-left:5%;';
    botonEditar.onclick = function (){
        editarEntrada(cita.id);
    };

    entrada.appendChild(botonBorrar);
    entrada.appendChild(botonEditar);
    });
}
//Función para evitar duplicados de citas
//Si las citas coinciden en dia y hora se genera el mismo ID y no se puede manipular
function Duplicate(nuevaCita, duracion=15){
    let citas = JSON.parse(localStorage.getItem('citaStorage')) || [];

    //paso las horas a minutos
    let [horaNueva, minutoNueva] =nuevaCita.citaTime.split(':').map(Number);
    let inicioNueva = horaNueva*60+minutoNueva;
    let finNueva = inicioNueva+duracion;

    for(let cita of citas){
        if(cita.citaDate === nuevaCita.citaDate){
            let [horaExist, minExist] = cita.citaTime.split(':').map(Number);
            let inicioExist = horaExist*60+minExist;
            let finExist = inicioExist+duracion;

            //Compruebo si coincide con alguna
            if(inicioNueva < finExist && finNueva>inicioExist){
                return true;
            }
        }
    }
    return false;
}
