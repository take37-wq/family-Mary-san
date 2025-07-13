const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let words = [];
const usedNicknames = new Set(); // 使用済みニックネーム（正規化済み）

app.post('/submit', (req, res) => {
  const rawNickname = req.body.nickname;
  const rawWord = req.body.word;

  if (!rawNickname || !rawWord) {
    return res.status(400).json({ message: 'ニックネームと単語を入力してください。' });
  }

  // 正規化：trim + 小文字化
  const nickname = rawNickname.trim().toLowerCase();
  const word = rawWord.trim();

  // デバッグ出力
  console.log(`[受信] ニックネーム: "${nickname}", 単語: "${word}"`);

  if (usedNicknames.has(nickname)) {
    console.log(`[拒否] "${nickname}" はすでに使用されました`);
    return res.status(400).json({ message: 'このニックネームはすでに使用されました。' });
  }

  usedNicknames.add(nickname);
  words.push({ nickname: rawNickname.trim(), word });

  console.log(`[登録] "${nickname}" を使用済みに追加`);
  console.log(`[現在の参加者数] ${words.length}/3`);

  if (words.length === 3) {
    const sentence = words.map(w => w.word).join(' ');
    console.log(`[完成] 文: ${sentence}`);
    io.emit('sentence', sentence);
    words = [];
    usedNicknames.clear();
    console.log(`[リセット] wordsとニックネームを初期化`);
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
