const hbs = require('hbs');

hbs.registerHelper('mostrar', (Listado) => {
    let texto = `<form action="/eliminar" method="POST" > 
                    <table class="table table-striped table-hover">
                            <thead class="thead-dark">
                            <th>Nombre</th>
                            <th>Matemáticas</th>
                            <th>Ingles</th>
                            <th>Programacion</th>
                            <th></th>
                        </thead>
                    <tbody>`;

    Listado.forEach(element => {
        texto += `<tr>
                <td> ${element.nombre} </td>
                <td> ${element.matematicas} </td>
                <td> ${element.ingles} </td>
                <td> ${element.programacion} </td>
                <td><button class="btn btn-danger" name="nombre" value="${element.nombre}">Eliminar</button></td>
                </tr>`
    });

    texto += `</tbody></table></form>`;

    return texto;

});