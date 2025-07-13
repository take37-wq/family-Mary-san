// script.js
async function submitWord() {
  const nickname = document.getElementById('nickname').value.trim();
  const word = document.getElementById('word').value.trim();
  const message = document.getElementById('message');
  const result = document.getElementById('result');

  if (!nickname || !word) {
    message.textContent = 'ニックネームと単語を入力してください';
    return;
  }

  const response = await fetch('http://localhost:3000/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, word })
  });

  const data = await response.json();

  if (data.complete) {
    message.textContent = '3人の単語が揃いました！';
    result.textContent = `できた文：「${data.result.sentence}」`;
  } else {
    message.textContent = `単語を受け付けました（${data.count}/3）`;
    result.textContent = '';
  }

  document.getElementById('word').value = '';
}
