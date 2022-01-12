var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoose = require('mongoose');

// importamos las variables de entorno antes de usarlas para
// conectarnos a la base de datos 
require('dotenv').config();

/** Conexion a base de datos usando el string de .env**/
mongoose.connect(process.env.CONNECTION_STRING)

const connection = mongoose.connection;

// Agregamos un eventListener a la conexion
// para hacer console.log si hay un error
connection.on('error',()=>{
  console.log('Error conection to database')
})

// es un eventListener que solo corre una unica vez
connection.once('open', ()=>{
  console.log('Connected to dabase')
})



// aca importamos los archivos que tienen
// el codigo de nuestros endpoints y se lo asignamos
// a variables que luego van a asignarse con url
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.router');
var productsRouter = require('./routes/products.router');
var ordersRouter = require('./routes/orders.router');
var authRouter = require('./routes/auth.router');
 

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Estas son las rutas padres de la api
// el primer parametro es la url
// el segundo es la variable que tiene las importaciones
// arriba importamos archivos y lo asignameos a
// variables que en este paso asignamos a url
app.use('/', indexRouter);
// app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
// app.use('/api/products', productsRouter);
// app.use('/api/orders', ordersRouter);



// catch 404 and forward to error handler
// cada vez que surge un error va parar al error handler
// que es la seccion de codigo de abajo
app.use(function(req, res, next) {
  next(createError(404, 'El endpoint no existe'));
});


// error handler
// Esta parte maneja el error. Por default va a renderizar una pagina de error
// si queremos podemos cambiar el comportamiento y que en vez de renderizar una pagina
// conteste con un json que tenga un mensaje de error
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  
  //En vez de renderizar una vista
  // enviamos un mensaje con el codigo de error
  // por default el codigo lo ponemos en 500
  res.json({
    errorcode: err.status || 500,
    message: res.locals.message
  })
});

module.exports = app;
