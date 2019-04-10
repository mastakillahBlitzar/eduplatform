const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const estudianteSchema = new Schema({
    nombre : {
        type : String,
        required : true,
        trim: true
        //enum: {values: ['Jay', 'George', 'Theresa', 'Mai', 'David'], message: 'No es valido'}
    },
    password: {
        type: String,
        required: true
    },
    matematicas : {
        type : Number,
        default: 0,
        min: 0,
        max: [5, 'Ingrese un numero menor']
    },
    ingles : {
        type : Number,
        default: 0,
        min: 0,
        max: [5, 'Ingrese un numero menor']
    },
    programacion : {
        type : Number,
        default: 0,
        min: 0,
        max: [5, 'Ingrese un numero menor']
    },
});

estudianteSchema.plugin(uniqueValidator);

const Estudiante = mongoose.model('Estudiante', estudianteSchema);
module.exports = Estudiante;