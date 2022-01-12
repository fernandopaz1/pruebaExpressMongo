const mongoose = require('mongoose')

//cremos el scheema del token que solo guarda un string
// este sting es el token en si

const TokenSchema = new mongoose.Mongoose.Schema({
    token: {type: String}
})

module.exports = mongoose.model('Token',TokenSchema)