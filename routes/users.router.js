var express = require('express');
var router = express.Router();
const User = require('../model/users.models');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let results ={};
  try {
    results = await User.find({}, 'username password')
  } catch (error) {
    next()
  }
  res.json(results);
});

module.exports = router;
