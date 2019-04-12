const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const cursoSchema = new Schema({
    nombre : {
        type : String,
        required : true
    },
    valor : {
        type : Number,
        default: 0,
        min: 0
    },
    descripcion : {
        type : String,
        required : true
    },
    modalidad : {
        type : String,
        required : false,
        default : '',
        enum: {values: ['','virtual', 'presencial'], message: 'No es valido'}
    },
    intensidad : {
        type : Number,
        default: 1,
        min: 1
    },
    estado : {
        type : Boolean,
        default:  true
    }
});

cursoSchema.plugin(uniqueValidator);

const Curso = mongoose.model('Curso', cursoSchema);
module.exports = Curso;