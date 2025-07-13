const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let words = [];
let usedNicknames = new Set();

app.post('/submit', (req, res) => {
  const { nickname, word } = req.body;

  if (!nickname || !word) {
    return res.status(400).json({ message: 'ニックネームと単語を入力してください。' });
  }

  const trimmedNickname = nickname.trim().toLowerCase();
  if (usedNicknames.has(trimmedNickname)) {
    return res.status(400).json({ message: 'このニックネームはすでに使用されました。' });
  }

  usedNicknames.add(trimmedNickname);
  words.push({ nickname, word });

  if (words.length === 3) {
    const sentence = words.map(w => w.word).join(' ');
    io.emit('sentence', sentence);
    words = [];
    usedNicknames.clear();
  }

  res.json({ message: '受け取りました' });
});

io.on('connection', (socket) => {
  console.log('クライアントが接続しました');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});
