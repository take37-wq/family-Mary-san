document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wordForm');
  const nicknameInput = document.getElementById('nickname');
  const wordInput = document.getElementById('word');

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, word }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || '送信に失敗しました。');
        return;
      }

      alert('送信が完了しました！');
      wordInput.value = ''; // 入力欄リセット
    } catch (err) {
      console.error('エラー:', err);
      alert('サーバーに接続できませんでした。');
    }
  });

  socket.on('sentence', (sentence) => {
    alert(`完成した文：${sentence}`);
  });
});
