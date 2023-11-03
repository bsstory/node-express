var express = require('express');
var bodyParser = require('body-parser');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

var router = express.Router();
router.use(bodyParser.json());


async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

/* GET test page. */
router.get('/test', function(req, res, next) {
  res.send('test55');
});


module.exports = router;
