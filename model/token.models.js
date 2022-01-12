const Mongoose = require('mongoose')

//cremos el scheema del token que solo guarda un string
// este sting es el token en si

const TokenSchema = new Mongoose.Schema({
    token: {type: String}
})

module.exports = Mongoose.model('Token',TokenSchema)