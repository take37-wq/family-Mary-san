const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let words = [];

// POSTエンドポイント：単語を受け取って処理
app.post('/submit', (req, res) => {
  const { nickname, word } = req.body;

  if (!nickname || !word) {
    return res.status(400).json({ message: 'ニックネームと単語が必要です' });
  }

  // 単語とニックネームを配列に追加
  words.push({ nickname, word });

  // 3人集まったら文を作って返す
  if (words.length === 3) {
    const sentence = words.map(w => w.word).join(' ');
    const result = { sentence, words: [...words] };
    words = []; // 単語リストをリセット
    return res.json({ complete: true, result });
  }

  // まだ3人に達していない場合
  res.json({ complete: false, count: words.length });
});

// ポート設定（Render用）
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
