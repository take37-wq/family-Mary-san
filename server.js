// server.js
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

let words = [];

app.post('/submit', (req, res) => {
  const { nickname, word } = req.body;

  if (!nickname || !word) {
    return res.status(400).json({ message: 'ニックネームと単語が必要です' });
  }

  words.push({ nickname, word });

  if (words.length === 3) {
    const sentence = words.map(w => w.word).join(' ');
    const result = { sentence, words: [...words] };
    words = []; // 使い終わったらリセット
    return res.json({ complete: true, result });
  }

  res.json({ complete: false, count: words.length });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
