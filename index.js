// # SimpleServer
// A simple chat bot server
var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var axios = require('axios');
var router = express();
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);
app.listen(process.env.PORT || 3000);
app.get('/', (req, res) => {
  res.send("Server chạy ngon lành.");
});
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 's1mple') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});
// Đoạn code xử lý khi có người nhắn tin cho bot
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        // Nếu người dùng gửi tin nhắn đến
        if (message.message.text) {
          // var text = message.message.text;
          // if(text == 'hi' || text == "hello")
          // {
          //   sendMessage(senderId, "Larva: " + 'Lô con C*c');
          // }
          // else{sendMessage(senderId, "Larva: " + "Xin lỗi, câu hỏi của bạn chưa có trong hệ thống, chúng tôi sẽ cập nhật sớm nhất.");}
          axios.get('https://code.junookyo.xyz/api/ncov-moh/data.json')
          .then(function(res) {
            // convertText(res);
            sendMessage(senderId, convertText(res));
          })
          .catch(function(err) {
            sendMessage(senderId, "Xảy ra lỗi");
          })
        }
      }
    }
  }
  res.status(200).send("OK");
});

function convertText(res) {
  var status = res.data;
  
  if (status.success == true) {
    var dataGlobal = status.data.global;
    var dataVN = status.data.vietnam;
    var messGlobal = 'Thế Giới: \n Ca nhiễm: ' + dataGlobal.cases + '\n Tử vong: ' + dataGlobal.deaths + ' \n Hồi phục: ' + dataGlobal.recovered;
    var messVN = 'Việt Nam: \n Ca nhiễm: ' + dataVN.cases + '\n Tử vong: ' + dataVN.deaths + ' \n Hồi phục: ' + dataVN.recovered;
    // console.log(messVN);
    return messVN + '\n\n' + messGlobal;
  } else {
    return 'Xảy ra lỗi';
  }
}

// Gửi thông tin tới REST API để Bot tự trả lời
function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: "EAAJWK4hg8hYBAMp7gAj3JHnUONDjoewI6jwRBf51aOnoVQkcmZCxF8Bj0SZBJHnalxybl9NDVvFgm3j3Uj7lydxUUXdc1fFe60wZCZB7HU1EA4eTjtZBexUPa2dJ4QcvCqWZBZBlZBIgmHPnfsnkHBqGL129dComCcEdvCk3ZAk89pwZDZD",
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}