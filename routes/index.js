var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Probando express y mongoDB' });
  // En vez de renderizar una pagina mandamos un mensaje json
  res.json({
    message: 'Hola mundo'
  })

});

module.exports = router;
