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
const usedNicknames = new Map(); // Map<number, nickname>
let words = []; // { number, word }

function getRandomNumber() {
  const available = [1, 2, 3].filter(n => !usedNumbers.has(n));
  const rand = available[Math.floor(Math.random() * available.length)];
  usedNumbers.add(rand);
  return rand;
}

// ニックネームから番号を取得して事前に登録
app.post('/join', (req, res) => {
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: 'ニックネームが必要です。' });
  }

  if (Array.from(usedNicknames.values()).includes(nickname)) {
    return res.status(400).json({ message: 'このニックネームはすでに使われています。' });
  }

  if (usedNumbers.size >= 3) {
    return res.status(400).json({ message: 'すでに3人参加しています。' });
  }

  const number = getRandomNumber();
  usedNicknames.set(number, nickname);

  io.emit('statusUpdate', Object.fromEntries(usedNicknames));

  res.json({ message: '番号が割り当てられました', number });
});

// 単語送信
app.post('/submit', (req, res) => {
  const { nickname, word } = req.body;

  if (!nickname || !word) {
    return res.status(400).json({ message: 'ニックネームと単語を入力してください。' });
  }

  const entry = Array.from(usedNicknames.entries()).find(([, name]) => name === nickname);
  if (!entry) {
    return res.status(400).json({ message: 'まずニックネームを入力して番号を取得してください。' });
  }

  const [number] = entry;

  // 重複送信を防止
  if (words.some(w => w.number === number)) {
    return res.status(400).json({ message: 'すでに単語が入力されています。' });
  }

  words.push({ number, word });

  if (words.length === 3) {
    words.sort((a, b) => a.number - b.number);
    const sentence = words.map(w => w.word).join(' ');
    io.emit('sentence', sentence);

    // リセット
    usedNumbers.clear();
    usedNicknames.clear();
    words = [];
  }

  res.json({ message: '単語を受け取りました' });
});

io.on('connection', (socket) => {
  console.log('クライアントが接続しました');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});
