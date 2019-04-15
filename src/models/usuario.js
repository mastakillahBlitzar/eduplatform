const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    documentoIdentidad : {
        type : Number,
        min: 999999
    },
    password: {
        type: String,
        required: true
    },
    nombre : {
        type : String,
        required : true,
        trim: true
    },
    correo : {
        type : String,
        required : true,
        trim: true
    },
    telefono : {
        type : String,
        required : true,
        trim: true
    },
    rol : {
        type : String,
        required : true,
        default : 'aspirante',
        enum: {values: ['aspirante', 'coordinador', 'docente'], message: 'No es valido'}
    },
});

usuarioSchema.plugin(uniqueValidator);

const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports = Usuario;