var express = require('express');
var bodyParser = require('body-parser');
const {google} = require('googleapis');
var router = express.Router();
router.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

/* GET test page. */
router.get('/test', function(req, res, next) {
  res.send('test55');
});


module.exports = router;
