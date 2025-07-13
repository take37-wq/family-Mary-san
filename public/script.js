const socket = io();

function submitWord() {
  const nickname = document.getElementById('nickname').value;
  const word = document.getElementById('word').value;
  const message = document.getElementById('message');
  const result = document.getElementById('result');

  if (!nickname || !word) {
    message.textContent = 'ニックネームと単語を両方入力してください。';
    return;
  }

  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, word })
  })
  .then(res => {
    if (!res.ok) {
      return res.json().then(err => { throw err; });
    }
    return res.json();
  })
  .then(data => {
    message.textContent = data.message;
    message.style.color = 'green';
    document.getElementById('word').value = '';
  })
  .catch(err => {
    message.textContent = err.message || 'エラーが発生しました';
    message.style.color = 'red';
  });
}

// サーバーから文が届いたとき表示
socket.on('sentence', (sentence) => {
  const result = document.getElementById('result');
  result.textContent = `できた文：${sentence}`;
});
