var express = require('express');
var bodyParser = require('body-parser');
const {google} = require('googleapis');
var router = express.Router();
router.use(bodyParser.json());

const calendar = google.calendar('v3');
const oauth2Client = new google.auth.OAuth2(
  '678917972091-k3n9p26282u32mh4e7dsda6i97n449k2.apps.googleusercontent.com',
  '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',
  'https://port-0-node-express-euegqv2llofuxc6r.sel5.cloudtype.app/auth'
);
/*
oauth2Client.setCredentials({
  access_token: 'YOUR_ACCESS_TOKEN',
  refresh_token: 'YOUR_REFRESH_TOKEN'
});
*/

router.get('/auth', async function(req, res) {
  const code = req.query.code;
  if (code) {
    try {
      // 권한 부여 코드를 사용하여 액세스 토큰과 리프레시 토큰을 얻습니다.
      const {tokens} = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // 토큰을 저장하거나 사용합니다.
      // 예: res.send(tokens);
      res.send('인증 성공! 이제 API를 사용할 수 있습니다.');
    } catch (error) {
      console.error('OAuth2 인증 에러:', error);
      res.status(500).send('인증 중 에러가 발생했습니다.');
    }
  } else {
    res.status(400).send('권한 부여 코드가 없습니다.');
  }
});


router.post('/chat', async function(req, res, next) {
  const messageText = req.body.message.text;

  if (messageText.startsWith('/캘린더 ')) {
    const calendarName = messageText.replace('/캘린더 ', '').trim();
    try {
      const calendarList = await calendar.calendarList.list({
        auth: oauth2Client,
      });

      const calendarId = calendarList.data.items.find(cal => cal.summary === calendarName)?.id;

      if (!calendarId) {
        return res.json({text: '캘린더를 찾을 수 없습니다.'});
      }

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const events = await calendar.events.list({
        auth: oauth2Client,
        calendarId,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const eventTexts = events.data.items.map(event => {
        const start = event.start.dateTime || event.start.date;
        return `${start}: ${event.summary}`;
      }).join('\n');

      const replyText = eventTexts || '오늘 일정이 없습니다.';
      res.json({text: replyText});
    } catch (error) {
      console.error('Google Calendar API Error:', error);
      res.status(500).json({text: '일정을 불러오는 중 에러가 발생했습니다.'});
    }
  } else {
    // 기본적으로 메시지를 그대로 반환
    const reply = {text: messageText};
    res.json(reply);
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

/* GET test page. */
router.get('/test', function(req, res, next) {
  res.send('test55');
});


module.exports = router;
