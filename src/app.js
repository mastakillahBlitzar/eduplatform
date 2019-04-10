require('./config/config');
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');

if( typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

const dirPublic = path.join(__dirname, '../public');
const dirNode_modules = path.join(__dirname, '../node_modules');

app.use(express.static(dirPublic));
app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));

/* app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
 */
app.use((req, res, next) => {
    const token = localStorage.getItem('token');
    if(token) {
        jwt.verify(token, 'tdea-virtual', (err, decoded) => {
            if(err) {
                return console.log(err);
            }
            console.log(decoded);
            res.locals.sesion = true;
            res.locals.nombre = decoded.data.nombre;
            req.usuario = decoded.data._id;
            return next();
        });
    } else {
        next();
    }
    /* if(req.session.usuario) {
        res.locals.sesion = true
        res.locals.nombre = req.session.nombre
    } */
});

app.use(bodyParser.urlencoded({extended : false}));

app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, {useNewUrlParser : true}), (err, result) => {
    if(err){
        return console.log(err);
    }

    console.log('conectado');
};

app.listen(process.env.PORT, () => {
    console.log('servidor por el puerto ' + process.env.PORT);
})