const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 静的ファイルのパス（public フォルダがプロジェクト直下にある想定）
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// 各ページへのルーティング
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});
app.get('/main', (req, res) => {
  res.sendFile(path.join(publicPath, 'main.html'));
});
app.get('/word', (req, res) => {
  res.sendFile(path.join(publicPath, 'word.html'));
});

// --- WebSocket（Socket.io）処理 ---
let users = {};    // socket.id → nickname
let words = [];    // { nickname, word } の配列

io.on('connection', (socket) => {
  console.log('ユーザー接続:', socket.id);

  // ニックネーム登録
  socket.on('joinRoom', (nickname) => {
    users[socket.id] = nickname;
    console.log(`${nickname} が入室`);
    io.emit('updateWords', words); // 全員に今の単語一覧を送信
  });

  // 単語を受け取る
  socket.on('submitWord', ({ nickname, word }) => {
    const idx = words.findIndex(w => w.nickname === nickname);
    if (idx >= 0) {
      words[idx].word = word;
    } else {
      words.push({ nickname, word });
    }

    io.emit('updateWords', words);

    // 3人集まったら文章生成
    if (words.length === 3) {
      const sentence = words.map(w => w.word).join(' ');
      io.emit('finalSentence', sentence);
    }
  });

  // 退出処理
  socket.on('exitRoom', (nickname) => {
    delete users[socket.id];
    words = words.filter(w => w.nickname !== nickname);
    io.emit('updateWords', words);
    console.log(`${nickname} が退出`);
  });

  // 切断処理
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

// サーバー起動
server.listen(PORT, () => {
  console.log(`サーバー起動中: http://localhost:${PORT}`);
});
