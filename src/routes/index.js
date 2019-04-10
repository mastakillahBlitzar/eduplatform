const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const Estudiante = require('../models/estudiante');
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
    Estudiante.findOne({ nombre: req.body.usuario }, (err, resultado) => {
        if (err) {
            return console.log('error');
        }

        if (!!resultado) {
            if (bcrypt.compareSync(req.body.password, resultado.password)) {


                /* req.session.usuario = resultado._id;
                req.session.nombre = resultado.nombre; */

                const token = jwt.sign({
                    data: resultado
                }, 'tdea-virtual', { expiresIn: '1h' });
                localStorage.setItem('token', token);
                res.render('ingresar', {
                    mensaje: 'Bienvenido ' + resultado.nombre,
                    //sesion: true,
                    nombre: resultado.nombre
                });
            }
            return res.render('ingresar', {
                mensaje: 'password incorrecto',
            });
        }

        return res.render('ingresar', {
            mensaje: 'usuario no existe',
        });
    });
});

app.get('/salir', (req, res) => {
    /* req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
    }); */
    localStorage.removeItem('token');
    res.redirect('/');
})

app.get('*', (req, res) => {
    res.render('indexpost', {
        titulo: 'Error 404'
    });
});

module.exports = app;