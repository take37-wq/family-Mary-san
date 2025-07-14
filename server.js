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

const usedNumbers = new Set();
const usedNicknames = new Map();
let words = [];

function getRandomNumber() {
  const available = [1, 2, 3].filter(n => !usedNumbers.has(n));
  const rand = available[Math.floor(Math.random() * available.length)];
  usedNumbers.add(rand);
  return rand;
}

app.post('/submit', (req, res) => {
  const { nickname, word } = req.body;

  if (!nickname || !word) {
    return res.status(400).json({ message: 'ニックネームと単語は必須です。' });
  }

  if (Array.from(usedNicknames.values()).includes(nickname)) {
    return res.status(400).json({ message: 'このニックネームはすでに使われています。' });
  }

  if (usedNumbers.size >= 3) {
    return res.status(400).json({ message: 'すでに3人入力済みです。' });
  }

  const number = getRandomNumber();
  usedNicknames.set(number, nickname);
  words.push({ number, word });

  io.emit('statusUpdate', Object.fromEntries(usedNicknames));

  if (words.length === 3) {
    words.sort((a, b) => a.number - b.number);
    const sentence = words.map(w => w.word).join(' ');
    io.emit('sentence', sentence);
    usedNumbers.clear();
    usedNicknames.clear();
    words = [];
  }

  res.json({ message: '受け取りました', number });
});

io.on('connection', (socket) => {
  console.log('クライアントが接続しました');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});
