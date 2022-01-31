let cliente = {
    mesa: '',
    hora: '',
    pedido: [],
}

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}


const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', ()=>{
    guardarCliente();
});

const resuemenDia = document.querySelector('#btn-resuemen-dia')
resuemenDia.addEventListener('click', ()=>{
    cierreDeDia()
})

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // Campos Vacios
    const camposVacios = [mesa, hora].some( campo => campo == '' );
    if(camposVacios) {

        // Msj Error Modal
        const existeAlerta = document.querySelector('.invalid-feedback');
        if(!existeAlerta) {
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);
            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
        
    } else {
        getJsonObject();
        cliente = { ...cliente, mesa, hora };

        // Ocultar el modal
        var modalFormulario = document.querySelector('#formulario');
        var modal = bootstrap.Modal.getInstance(modalFormulario);
        modal.hide();

        mostrarSecciones();
        obtenerplatos();

        let btnNuevaOrden =  document.querySelector('#btn-crear-orden');
        btnNuevaOrden.classList.add('d-none')
    }
}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
}

function obtenerplatos() {
    fetch('../db.json')
        .then( response => response.json())
        .then( resultado => mostrarplatos(resultado))
        .catch(error => console.log(error))
}

function mostrarplatos(platos) {
    const contenido = document.querySelector('#platos .contenido');

    platos.platos.forEach(plato => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'border-top' );

        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4', 'py-3');
        nombre.textContent = plato.nombre;

        const precio = document.createElement('DIV');
        precio.classList.add('col-md-4', 'py-3', 'fw-bold');
        precio.textContent = `$${plato.precio}`;

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${plato.id}`;
        inputCantidad.classList.add('form-control');
        inputCantidad.onchange = function() {
            const cantidad = parseInt( inputCantidad.value );
            agregarplato({...plato, cantidad});
        }

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2', 'py-3');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(agregar);

        contenido.appendChild(row);
    })
}

function agregarplato(producto) {
    let { pedido } = cliente;

    if (producto.cantidad > 0 ) {
        // Comprobar si el plato ya esta en el carrito...
        if(pedido.some( articulo =>  articulo.id === producto.id )) {
            const pedidoActualizado = pedido.map( articulo => {
                if( articulo.id === producto.id ) {
                    articulo.cantidad = producto.cantidad;
                } 
                return articulo;
            });
            cliente.pedido  = [...pedidoActualizado];
        } else {
            cliente.pedido = [...pedido, producto];
        }
    } else {
        const resultado = pedido.filter(articulo => articulo.id !== producto.id);
        cliente.pedido = resultado;       
    }

    limpiarHTML();
    if(cliente.pedido.length) {
        actualizarResumen();
    }  else {
        mensajePedidoVacio();
    }
}

function actualizarResumen() {

    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    // Mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');
    mesa.appendChild(mesaSpan);

    // Hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');
    hora.appendChild(horaSpan);

    // Platos
    const heading = document.createElement('H3');
    heading.textContent = 'platos Pedidos';
    heading.classList.add('my-4');
    

    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    // Producto pedido
    const { pedido } = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('h4');
        nombreEl.classList.add('text-center', 'my-4');
        nombreEl.textContent = nombre;

        const cantidadEl = document.createElement('P');        
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(articulo);

        // Btn Eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar Pedido';

        // Fn Eliminar platos
        btnEliminar.onclick = function() {
            eliminarProducto( id );
        }
        
        cantidadEl.appendChild(cantidadValor)
        precioEl.appendChild(precioValor)
        subtotalEl.appendChild(subtotalValor);

        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        grupo.appendChild(lista);
    })

    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(heading);
    resumen.appendChild(grupo);
    
    // agregar al contenido
    contenido.appendChild(resumen)

    // Form Propinas
    formularioPropinas();
}

function limpiarHTMLPlatos() {
    const contenido = document.querySelector('#platos');
    while(contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');
    while(contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(articulo) {
    const {cantidad, precio} = articulo;
    return `$ ${cantidad * precio}`;
}

function eliminarProducto(id) {
    const { pedido } = cliente;
    cliente.pedido = pedido.filter( articulo => articulo.id !== id); 

    limpiarHTML();

    if(cliente.pedido.length) {
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }
    
    const productoEliminado = `#producto-${id}`; 
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio () {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade Productos al Pedido';

    contenido.appendChild(texto);
}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const heading = document.createElement('H3');
    heading.classList.add('my-4');
    heading.textContent = 'Propina';

    // Sin Propina
    const checkBoxSn = document.createElement('INPUT');
    checkBoxSn.type = "radio";
    checkBoxSn.name = 'propina';
    checkBoxSn.value = "0";
    checkBoxSn.classList.add('form-check-input');
    checkBoxSn.onclick = calcularPropina;
    
    const checkLabelSn = document.createElement('LABEL');
    checkLabelSn.textContent = 'Sin Propina';
    checkLabelSn.classList.add('form-check-label');
    
    const checkDivSn = document.createElement('DIV');
    checkDivSn.classList.add('form-check');
    
    checkDivSn.appendChild(checkBoxSn);
    checkDivSn.appendChild(checkLabelSn);

    // Propina 10%
    const checkBox10 = document.createElement('INPUT');
    checkBox10.type = "radio";
    checkBox10.name = 'propina';
    checkBox10.value = "10";
    checkBox10.classList.add('form-check-input');
    checkBox10.onclick = calcularPropina;

    const checkLabel10 = document.createElement('LABEL');
    checkLabel10.textContent = '10%';
    checkLabel10.classList.add('form-check-label');

    const checkDiv10 = document.createElement('DIV');
    checkDiv10.classList.add('form-check');

    checkDiv10.appendChild(checkBox10);
    checkDiv10.appendChild(checkLabel10);

    // Propina 25%
    const checkBox25 = document.createElement('INPUT');
    checkBox25.type = "radio";
    checkBox25.name = 'propina';
    checkBox25.value = "25";
    checkBox25.classList.add('form-check-input');
    checkBox25.onclick = calcularPropina;

    const checkLabel25 = document.createElement('LABEL');
    checkLabel25.textContent = '25%';
    checkLabel25.classList.add('form-check-label');

    const checkDiv25 = document.createElement('DIV');
    checkDiv25.classList.add('form-check');

    checkDiv25.appendChild(checkBox25);
    checkDiv25.appendChild(checkLabel25);

    // Añadirlos a los formularios
    formulario.appendChild(heading);
    formulario.appendChild(checkDivSn);
    formulario.appendChild(checkDiv10);
    formulario.appendChild(checkDiv25);

    contenido.appendChild(formulario);

}

function calcularPropina() {
    const radioSeleccionado = document.querySelector('[name="propina"]:checked').value;
    const { pedido } = cliente;

    let subtotal = 0;
    pedido.forEach(articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar');

    // Propina
    const propina = ((subtotal * parseInt(radioSeleccionado)) / 100) ;
    const total = propina + subtotal;

    // Subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-5');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;
    subtotalParrafo.appendChild(subtotalSpan);

    // Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-3', 'fw-bold');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;
    propinaParrafo.appendChild(propinaSpan);

    // Total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-3', 'fw-bold');
    totalParrafo.textContent = 'Total a Pagar: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv) {
        totalPagarDiv.remove();
    }

    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario');
    formulario.appendChild(divTotales);

        // Agrego Boton de pedido pago
        const btnPago = document.createElement("BUTTON");
        btnPago.classList.add("btn", "btn-success", "btn-pedido-abonado");
        btnPago.textContent = "Pedido Pago";
        btnPago.onclick = function () {
            limpiarHTML();
            setItem(cliente)
            actualizarLaPagina()
        };
        formulario.appendChild(btnPago);
}

function actualizarLaPagina(){
    location.reload(true);
} 

function getJsonObject(){
    var lsSting = localStorage.getItem('clientes');
    var nuevoCliente = [];
    if(lsSting){
        nuevoCliente = JSON.parse(lsSting);
    }
    return nuevoCliente;
}

function setItem(cliente){
var nuevoCliente = getJsonObject();
    nuevoCliente.push(cliente);
localStorage.setItem('clientes',JSON.stringify(nuevoCliente))
}

function cierreDeDia() {
    JSON.parse(localStorage.getItem('clientes'))
    let respuesta = confirm('¿Esta Seguro que desea cerrar el turno?')
    if (respuesta) {
        localStorage.removeItem('clientes');
    }
    actualizarLaPagina();
};

