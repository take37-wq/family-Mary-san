const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Renderなどの環境に合わせてPORTを設定（ローカルなら3000）
const PORT = process.env.PORT || 3000;

// 静的ファイル配信（srcから見て一つ上の階層にpublicフォルダがある想定）
app.use(express.static(path.join(__dirname, '../public')));

// ルートアクセスでindex.htmlを返す
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/main.html'));
});
app.get('/word', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/word.html'));
});

let users = {};    // socket.id → nickname
let words = [];    // [{nickname, word}]

io.on('connection', (socket) => {
  console.log('ユーザー接続:', socket.id);

  socket.on('joinRoom', (nickname) => {
    users[socket.id] = nickname;
    console.log(`${nickname} が入室`);
    io.emit('updateWords', words);
  });

  socket.on('submitWord', ({ nickname, word }) => {
    // 既に同じニックネームの単語があれば上書き、なければ追加
    const idx = words.findIndex(w => w.nickname === nickname);
    if (idx >= 0) {
      words[idx].word = word;
    } else {
      words.push({ nickname, word });
    }
    io.emit('updateWords', words);

    // 単語が3人分揃ったら文章生成（番号順とかのルールは省略）
    if (words.length === 3) {
      const sentence = words.map(w => w.word).join(' ');
      io.emit('finalSentence', sentence);
      // 必要に応じてここでwordsリセットも可能
    }
  });

  socket.on('exitRoom', (nickname) => {
    delete users[socket.id];
    words = words.filter(w => w.nickname !== nickname);
    io.emit('updateWords', words);
    console.log(`${nickname} が退出`);
  });

  socket.on('disconnect', () => {
    const nickname = users[socket.id];
    if (nickname) {
      delete users[socket.id];
      words = words.filter(w => w.nickname !== nickname);
      io.emit('updateWords', words);
      console.log(`${nickname} が切断`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
