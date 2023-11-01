
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('/google-chat-webhook', (req, res) => {
  // Google Chat에서 메시지 이벤트를 받음
  const message = req.body.message.text;

  // 답장 메시지 생성
  const reply = {
    text: `You said: ${message}`
  };

  // 답장 메시지를 Google Chat으로 보냄
  res.json(reply);
});

app.listen(port, () => {
  console.log(`Server is running`);
});
