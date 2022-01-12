require('dotenv').config()

// coneccion a mongo
const Mongoose = require('mongoose')

//libreria de encriptacion
const bcrypt=require('bcrypt')

//implementacion de jasonwebtoken
const jwt = require('jsonwebtoken')

// son dos variables de entorno que son el token y refresh token
// El token nos permite acceder a los recursos de la api
// pero tiene que tener un vencimiento
// el refresh token es para solicitar un nuevo token
//  cuando es acces se vence. El access token tiene un tiempo de vida
// mucho mayor para que no tengamos que hacer login siempre
const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = process.env;

const Token = require('./token.models')

// Creamos el schema que va a ir en nuestra base
// el id es automatico asiq ue no hay que especificarlo
const UserSchema = new Mongoose.Schema({
    username:{
        type: String, 
        required: true, 
        unique: true
    },
    password:{
        type: String,
        required:true,
        unique: true,
    },
    name:{type: String}
})

// pre es un metodo, parecido a un eventlistener tambien
// en este caso se va a triggerear cuando guardamos
UserSchema.pre('save', function(next){
    //Preguntamos antes de guardar si cambiamos
    //la contraseña o si es nuevo
    if(this.isModified('password') ||
        this.isNew){
            // asigno this a una variable 
            // ya que dentro de un callback 
            // puede cambiar su valor
            const document=this;


            bcrypt.hash(document.password, 10, (err,hash)=>{
                if(err){
                    //si da error paso el error a next
                    next(err);
                }else{
                    // si es exitoso guardo el hash del password
                    // en la base y hago next()
                    document.password=hash;
                    next();
                }
            })
        }else{
            //si no es nuevo ni es un cambio de contraseña 
            // hacemos next() y que lo guarde sin ningun cambio
            next();
        }
})

// Podemos asociar metodos a un schema en particular
UserSchema.methods.userNameExists= async function(username){
    try {
        let result = await Mongoose.model('User').find({username:username})
        //verificamos que el resultado no este vacio
        return result.length>0;
    } catch (ex) {
        return false;
    }
};

UserSchema.methods.isCorrectPassword= async function(password, hash){
    try {
        const same= await bcrypt.compare(password, hash);
        return same;
    } catch (ex) {
        return false;
    }
    
}

UserSchema.methods.createAccessToken = function (){
    const {id, username}= this;
    // en el accessToken esta encriptada la informacion del id y username
    // por lo que cuando se hace una llamada se tiene que enviar el token
    // el backend lo desencripta y sabe quien hizo la llamada
    // Le paso tambien el access_token_secret definido en las variables de entorno 
    const accessToken = jwt.sign(
        {users: {id, username}},
        ACCESS_TOKEN_SECRET,
        {expiresIn: '1d'}
    );
    return accessToken;
}

UserSchema.methods.createRefreshToken = async function (){
    const {id, username}= this;
    //hacemos lo mismo para el refresh token solo 
    // que con expiracion en 20 dias 
    
    // este refresh token lo tenemos que guardar en la base de datos
    // para poder saber a quien pertence cuando le tenemos que renovar
    // el token
    const refreshToken = jwt.sign(
        {users: {id, username}},
        REFRESH_TOKEN_SECRET,
        {expiresIn: '20d'}
    );

    try{
        await new Token({token: refreshToken})
    }catch(ex){
        next(new Error('Error creating refresh token'));
    }
    return refreshToken;
}