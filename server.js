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

app.post('/preassign', (req, res) => {
  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ message: 'ニックネームを入力してください。' });
  if (Array.from(usedNicknames.values()).includes(nickname)) {
    return res.status(400).json({ message: 'このニックネームはすでに使われています。' });
  }
  if (usedNumbers.size >= 3) {
    return res.status(400).json({ message: 'すでに3人が入力済みです。' });
  }
  const number = getRandomNumber();
  usedNicknames.set(number, nickname);
  io.emit('statusUpdate', Object.fromEntries(usedNicknames));
  res.json({ number });
});

app.post('/submit', (req, res) => {
  const { nickname, word } = req.body;

  if (!nickname || !word) {
    return res.status(400).json({ message: 'ニックネームと単語を入力してください。' });
  }

  if (Array.from(usedNicknames.values()).includes(nickname)) {
    const number = [...usedNicknames.entries()].find(([k, v]) => v === nickname)?.[0];
    words.push({ number, word });
  } else {
    return res.status(400).json({ message: '事前に番号が割り当てられていません。' });
  }

  if (words.length === 3) {
    words.sort((a, b) => a.number - b.number);
    const sentence = words.map(w => w.word).join(' ');
    io.emit('sentence', sentence);
    usedNumbers.clear();
    usedNicknames.clear();
    words = [];
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
