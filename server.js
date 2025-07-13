const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 静的ファイルを public フォルダから提供
app.use(express.static(path.join(__dirname, 'public')));

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
    words = [];
    return res.json({ complete: true, result });
  }

  res.json({ complete: false, count: words.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
