var express = require('express');
var bodyParser = require('body-parser');
const {google} = require('googleapis');

var router = express.Router();



router.use(bodyParser.json());


/* Respond to Google Chat messages */
router.post('/chat', function(req, res, next) {
  const message = req.body.message.text;
  const reply = {
    text: message,
  };
  res.json(reply);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

/* GET test page. */
router.get('/test', function(req, res, next) {
  res.send('test33');
});


module.exports = router;
