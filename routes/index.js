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

fs.readFile('credentials.json')
  .then((content) => {
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    return fs.readFile(TOKEN_PATH)
      .then((token) => {
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
      })
      .catch(() => {
        return getNewToken(oAuth2Client);
      });
  })
  .then((oAuth2Client) => {
    // List events after successful auth
    listEvents(oAuth2Client);
  })
  .catch((error) => console.error('Error:', error));

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
module.exports = router;
