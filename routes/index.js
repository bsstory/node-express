var express = require('express');
var bodyParser = require('body-parser');
const {google} = require('googleapis');
var router = express.Router();
router.use(bodyParser.json());

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
  res.send('auth 진입');
  
  const code = req.query.code;
  if (code) {
    try {
      // 권한 부여 코드를 사용하여 액세스 토큰과 리프레시 토큰을 얻습니다.
      const {tokens} = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // 토큰을 저장하거나 사용합니다.
      // 예: res.send(tokens);
      res.send('인증 성공! 이제 API를 사용할  있습니다.');
    } catch (error) {
      console.error('OAuth2 인증 에러:', error);
      res.status(500).send('인증 중 에러가 발생했습니다.');
    }
  } else {
    res.status(400).send('권한 부여 코드가 없습니다.');
  }
});



router.post('/chat', async function(req, res) {
  const messageText = req.body.message.text;

  if (messageText.startsWith('/캘린더 ')) {
    const calendarName = messageText.replace('/캘린더 ', '').trim();

    try {
      const code = req.query.code;
      // 권한 부여 코드를 사용하여 액세스 토큰과 리프레시 토큰을 얻습니다.
      if (!code) {
      // 권한 부여 코드가 없을 경우 사용자에게 인증을 요청하는 응답을 보내야 합니다.
      return res.status(400).json({text: '권한 부여 코드가 필요합니다.'});
    }
      const {tokens} = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      // Google Calendar API 인스턴스 생성
      const calendar = google.calendar({version: 'v3', auth: oauth2Client});
      // 사용자의 캘린더 목록 가져오기
      const calendarList = await calendar.calendarList.list();

      // 요청한 캘린더 이름과 일치하는 캘린더 찾기
      const calendarItem = calendarList.data.items.find(cal => cal.summary === calendarName);
      const calendarId = calendarItem ? calendarItem.id : null;

      if (!calendarId) {
        return res.json({text: '캘린더를 찾을 수 없습니다.'});
      }

      // 캘린더 ID로 일정 목록 가져오기
      // 여기서는 예시로 현재 날짜의 일정만 가져옵니다.
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const events = await calendar.events.list({
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
    // res.json(reply);
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
