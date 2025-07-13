document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wordForm');
  const nicknameInput = document.getElementById('nickname');
  const wordInput = document.getElementById('word');
  const status = document.getElementById('status');
  const result = document.getElementById('result');

  const socket = io();

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nickname = nicknameInput.value.trim();
    const word = wordInput.value.trim();

    if (!nickname || !word) {
      alert('ニックネームと単語を入力してください。');
      return;
    }

    try {
      const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, word })
      });

      const resultJson = await response.json();

      if (!response.ok) {
        alert(resultJson.message || '送信に失敗しました。');
        return;
      }

      status.textContent = '送信しました！';
      wordInput.value = '';
    } catch (err) {
      console.error('エラー:', err);
      alert('サーバーに接続できませんでした。');
    }
  });

  socket.on('sentence', (sentence) => {
    result.textContent = `完成した文：${sentence}`;
    result.classList.remove('hidden');
  });
});
