const { google } = require('googleapis');
const fs = require('fs').promises;
const readline = require('readline');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';
var express = require('express');
var bodyParser = require('body-parser');
const path = require('path');


var router = express.Router();
router.use(bodyParser.json());
async function loadCredentials() {
  const content = await fs.readFile('credentials.json');
  const credentials = JSON.parse(content);
  // 여기서 credentials의 형식에 맞게 접근해야 합니다.
  const { client_secret, client_id, redirect_uris } =  credentials.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('Error while trying to retrieve access token', err);
          return reject(err);
        }
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token))
          .then(() => {
            console.log('Token stored to', TOKEN_PATH);
          })
          .catch((error) => {
            console.error('Error writing to token file', error);
          });
        resolve(oAuth2Client);
      });
    });
  });
}

function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}

async function authenticate() {
  try {
    const oAuth2Client = await loadCredentials();
    let token;
    try {
      token = await fs.readFile(TOKEN_PATH);
    } catch (error) {
      return getNewToken(oAuth2Client);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (error) {
    console.error('Error authenticating:', error);
    throw error;
  }
}

router.get('/auth', async (req, res) => {
  try {
    const auth = await authenticate();
    const events = await listEvents(auth);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
router.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



module.exports = router;
