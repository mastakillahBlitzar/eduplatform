const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const inscripcionSchema = new Schema({
    idUsuario : {
        type : String,
        required : true
    },
    idCurso: {
        type: String,
        required: true
    }
});

inscripcionSchema.plugin(uniqueValidator);

const Inscripcion = mongoose.model('Inscripcion', inscripcionSchema);
module.exports = Inscripcion;