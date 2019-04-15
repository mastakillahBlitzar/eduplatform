const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const Estudiante = require('../models/estudiante');
const Usuario = require('../models/usuario');
const Curso = require('../models/curso');
const Inscripcion = require('../models/inscripcion');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const dirViews = path.join(__dirname, '../../template/views');
const dirPartials = path.join(__dirname, '../../template/partial');

require('../helpers/helpers');

app.set('view engine', 'hbs');
app.set('views', dirViews);
hbs.registerPartials(dirPartials);

app.get('/', (req, res) => {
    res.render('index', {
        titulo: 'Inicio'
    });
});

app.get('/index', (req, res) => {
    res.render('index', {
        titulo: 'Inicio'
    });
});

app.post('/', (req, res) => {
    let estudiante = new Estudiante({
        nombre: req.body.nombre,
        matematicas: req.body.matematicas,
        ingles: req.body.ingles,
        programacion: req.body.programacion,
        password: bcrypt.hashSync(req.body.password, 10)
    });

    estudiante.save((err, resultado) => {
        if (err) {
            res.render('indexpost', {
                mostrar: err
            });
        }

        res.render('indexpost', {
            listado: resultado
        })
    });
});

app.get('/vernotas', (req, res) => {
    Estudiante.find({}).exec((err, respuesta) => {
        if (err) {
            return console.log('error' + err);
        }
        res.render('vernotas', {
            listado: respuesta
        });
    });
});

app.get('/actualizar', (req, res) => {
    Estudiante.findById(req.usuario, (err, user) => {
        if (err) {
            return console.log(err);
        }

        if (!!user) {
            return res.render('actualizar', {
                nombre: user.nombre,
                matematicas: user.matematicas,
                ingles: user.ingles,
                programacion: user.programacion
            });
        }
        return res.redirect('/');
    });
});

app.post('/actualizar', (req, res) => {
    Estudiante.findOneAndUpdate({ nombre: req.body.nombre },
        req.body, { new: true, runValidators: true, context: 'query' }, (err, resultado) => {
            if (err) {
                return console.log('error');
            }
            res.render('actualizar', {
                nombre: resultado.nombre,
                matematicas: resultado.matematicas,
                ingles: resultado.ingles,
                programacion: resultado.programacion
            });
        });
});

app.post('/eliminar', (req, res) => {
    Estudiante.findOneAndDelete({ nombre: req.body.nombre },
        req.body, (err, resultado) => {
            if (err) {
                return console.log('error');
            }

            if (!!resultado) {
                return res.render('eliminar', {
                    nombre: resultado.nombre,
                });
            }
            return res.render('eliminar', {
                nombre: 'nombre no encontrado',
            });
        });
});

app.post('/ingresar', (req, res) => {   
    Usuario.findOne({ correo: req.body.correo }, (err, resultado) => {
        if (err) {
            return console.log('error');
        }

        if (!!resultado) {
            if (bcrypt.compareSync(req.body.password, resultado.password)) {

                const token = jwt.sign({
                    data: resultado
                }, 'tdea-virtual', { expiresIn: '1h' });

                localStorage.setItem('token', token);

                res.locals.sesion = true;

                if(resultado.rol == 'coordinador')
                    res.locals.isCoordinador = true;
                else
                    res.locals.isCoordinador = false;

                if(resultado.rol == 'aspirante')
                    res.locals.isAspirante = true;
                else
                    res.locals.isAspirante = false;

                res.locals.nombre = resultado.nombre;
                req.usuario = resultado._id;


                return res.render('index', {
                    titulo: 'Inicio',
                    nombre: resultado.nombre,
                    alert : true,
                    alertType : 'alert-success', 
                    mensaje : 'Bienvenido ' + resultado.nombre
                });
            }

            return res.render('index', {
                Titulo: 'Inicio',
                alert : true,
                alertType : 'alert-danger', 
                mensaje : 'El usuario no existe.'
            });
        }

        return res.render('index', {
            mensaje: 'usuario no existe',
        });
    });
});

app.get('/salir', (req, res) => {
    localStorage.removeItem('token');
    res.redirect('/');
})


app.get('/usuario', (req, res) => {
    return res.render('usuario', 
    {
        titulo : 'Crear usuario', 
        alert : false,
        alertType : 'alert-primary', 
        mensaje : 'Este es el mensaje que se debe mostrar en el inicio'
    });
});

app.post('/usuario', (req, res) => {

    Usuario.findOne({documentoIdentidad : req.body.documento}, (err, resultado) => {
        if(err) {
            return res.render('indexpost', {
                titulo: 'Error 404'
            });
        }   

        if(resultado){
            return res.render('indexpost', {
                titulo : 'Crear usuario', 
                alert : true,
                alertType : 'alert-danger', 
                mensaje : 'El usuario ya existe en la base de datos. Por favor, compruebe el número de cédula.',
                'documentoIdentidad' : req.body.documento,
                'nombre' : req.body.nombre,
                'correo' : req.body.correo,
                'telefono' : req.body.telefono,
                'rol' : req.body.rol,
                'password': bcrypt.hashSync(req.body.password, 10)
            });
        }


        let usuario  = new Usuario({
            'documentoIdentidad' : req.body.documento,
            'nombre' : req.body.nombre,
            'correo' : req.body.correo,
            'telefono' : req.body.telefono,
            'rol' : req.body.rol,
            'password': bcrypt.hashSync(req.body.password, 10)
        });

        usuario.save((err, resultado) => {
            if (err) {
                return res.render('usuario', {
                    titulo : 'Crear usuario', 
                    alert : true,
                    alertType : 'alert-danger', 
                    mensaje : 'Ocurrió un errro mientras se creaba el usuario. ' + err
                });
            }
    
            return res.render('usuario', {
                titulo : 'Crear usuario', 
                alert : true,
                alertType : 'alert-success', 
                mensaje : 'Se ha creado el usuario correctamente.'
            })
        });
    });
}); 


app.get('/curso', (req, res) => {
    cursoMethod(req, res);
});

function cursoMethod(req, res){
    Curso.find({estado : true}, function(err, cursos) {

        console.log('cursos:' + cursos);
        

        if(err){
            return res.render('curso', {
                titulo : 'Curso', 
                alert : true,
                alertType : 'alert-danger', 
                mensaje : 'Ocurrió un error en la consulta de los cursos'
            });
        }

        if(res.locals.isAspirante){
            let incripcionCursos = [];

            Inscripcion.find({idUsuario : req.usuario}).exec((err, inscripciones) => {

                if(err) {
                    return res.render('curso', {
                        titulo : 'Curso', 
                        alert : false,
                        cursosArray : cursos
                    });
                }

               function recursividadInscripciones(arreglo, index){
                Curso.findOne({_id : arreglo[index].idCurso}).exec((err, cursoEncontrado) => {
                    if(err){
                        return console.log('error en la consulta');    
                    }

                    cursoEncontrado.idInscripcion = arreglo[index]._id;

                    incripcionCursos.push(cursoEncontrado); 
                    
                    index++;

                    if(index < arreglo.length){
                        recursividadInscripciones(arreglo, index);
                    } else {
                        return res.render('curso', {
                            titulo : 'Curso', 
                            alert : false,
                            cursosArray : cursos,
                            cursosInscritosArray : incripcionCursos
                        });
                    }
                });
             };

             if(inscripciones.length == 0){
                return res.render('curso', {
                    titulo : 'Curso', 
                    alert : false,
                    cursosArray : cursos,
                    cursosInscritosArray : []
                });
             } else 
                recursividadInscripciones(inscripciones, 0);
             
           }); 
        } else {
            return res.render('curso', {
                titulo : 'Curso', 
                alert : false,
                cursosArray : cursos
            });
        } 
    });
}

app.post('/curso', (req, res) => {
    let modalidad = '';
    let body = JSON.parse(JSON.stringify(req.body));

    if(body.hasOwnProperty('modalidad')){
        console.log('tiene modalidad');        
         modalidad = body.modalidad;
    }

    let curso = new Curso({
        nombre: body.nombre,
        descripcion: body.descripcion,
        valor: body.valor,
        intensidadHoraria: body.intensidadHoraria,
        modalidad : modalidad 
    });
    
    curso.save((err, curso) => {
        if(err){
            return res.render('curso', {
                titulo : 'Curso', 
                alert : true,
                alertType : 'alert-danger', 
                mensaje : 'Ocirrió un error mientras se creaba el curso. ' + err
            });
        }

        return res.render('curso', {
            titulo : 'Curso', 
            alert : true,
            alertType : 'alert-success', 
            mensaje : 'Se creó el curso correctamente'
        });
    });
});

app.get('/cursoIniciar', (req, res) => {
    return res.redirect('/curso');
});


app.post('/cursoIniciar', (req, res) => {
    Usuario.find({rol : 'docente'}).exec((err, docentes) => {

        let arregloDocentes = [];

        function recursividadDocente(arreglo, index){
            if(arreglo.length == 0){

            } 

            arregloDocentes.push({
                nombre : arreglo[index].nombre,
                idDocente : arreglo[index]._id
            });

            index++;

            if(index < arreglo.length){
                recursividadDocente(arreglo, index);
            } else {
                return res.render('iniciarCurso', {
                    titulo : 'Curso',
                    alert : false,
                    alertType : 'alert-danger',
                    mensaje : '',
                    docentes : arregloDocentes,
                    idCurso : req.body.id
                });
            }
        }

        recursividadDocente(docentes, 0);
    });
});

app.post('/cursoInscribir', (req, res) => {
    Inscripcion.findOne({ idCurso : req.body.id, idUsuario : req.usuario },(err, inscripcion) =>{
        if(err){
            return res.render('curso', {
                titulo : 'Curso', 
                alert : true,
                alertType : 'alert-danger', 
                mensaje : 'No se pudo hacer la inscripción del usuario. ' + err
            });
        }

        if(!!inscripcion){
            return res.render('curso', {
                titulo : 'Curso', 
                alert : true,
                alertType : 'alert-warning', 
                mensaje : 'El usuario ya está iscrito.'
            });
        }

        inscripcion = new Inscripcion({
            idCurso : req.body.id,
            idUsuario : req.usuario
        });

        inscripcion.save((err, inscrito) => {
            if(err){
                return res.render('curso', {
                    titulo : 'Curso', 
                    alert : true,
                    alertType : 'alert-danger', 
                    mensaje : 'No se pudo hacer la inscripción del usuario. ' + err
                });
            }

            return cursoMethod(req, res);
        })
    });
});


app.post('/verInscritos', (req, res) => {
    var estudiantesInscritos = [];
    Curso.findOne({_id : req.body.id}, function(err, curso) {
        Inscripcion.find({idCurso : req.body.id}, function(err, inscripciones) {
            if(err){
                return res.render('curso', {
                    titulo : 'Curso', 
                    alert : true,
                    alertType : 'alert-danger', 
                    mensaje : 'Ocurrió un error en la consulta de los estudiantes inscritos'
                });
            }

            if(!Object.keys(inscripciones).length){
                return res.render('curso', {
                    titulo : 'Curso', 
                    alert : true,
                    alertType : 'alert-danger', 
                    mensaje : 'No hay estudiantes inscritos al curso'
                });
            }
            
            function recursive(items, index) {
                Usuario.findOne({_id : items[index].idUsuario}, (err, usuario) => {
                    estudiantesInscritos.push({
                        documentoIdentidad : usuario.documentoIdentidad,
                        nombre : usuario.nombre,
                        inscripcion : items[index]._id
                    });
                    
                    index++;
                    
                    if(index < inscripciones.length){
                        recursive(items, index)
                    } else {
                        return res.render('estudiantesInscritos', {
                            titulo : 'Estudiantes inscritos a: ' + curso.nombre,
                            alert : false,
                            alertType : 'alert-success',
                            incripcionArray : estudiantesInscritos,
                            mensaje : 'El ususario ha sido inscrito correctamente'
                        });
                    }
                });
            }
            
            recursive(inscripciones, 0);
        });
    });
});

app.post('/eliminarInscripcion', (req, res) => {
    Inscripcion.deleteOne({ _id : req.body.id}, (err) => {
        console.log('ingresa err' + err);
        
        if(err){
            return res.render('curso', {
                titulo : 'Curso',
                alert : false,
                alertType : 'alert-danger',
                mensaje : 'Ocurrió un error al borrar la inscripción.'
            });
        }

        return cursoMethod(req, res);
    });
});

app.post('/cursoIniciarDocente', (req, res) => {

    console.log('req.body prueba: ' + JSON.stringify(req.body));
    
    Curso.findOneAndUpdate({ _id: req.body.idCurso },
        {$set:{ estado : false, docente: req.body.idDocente }}, { new: true, runValidators: true, context: 'query' }, (err, resultado) => {
            if (err) {
                return res.render('curso', {
                    titulo : 'Curso', 
                    alert : true,
                    alertType : 'alert-danger', 
                    mensaje : 'Ocurrió un error durante la actualización. ' + err
                });
            }

            return cursoMethod(req, res);
        });
});



app.get('*', (req, res) => {
    res.render('indexpost', {
        titulo: 'Error 404'
    });
});


module.exports = app;