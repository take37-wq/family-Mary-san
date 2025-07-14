document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wordForm');
  const nicknameInput = document.getElementById('nickname');
  const wordInput = document.getElementById('word');
  const myNumberDisplay = document.getElementById('myNumberDisplay');
  const sentenceDisplay = document.getElementById('sentenceDisplay');
  const status = document.getElementById('status');

  const socket = io();

  form.addEventListener('submit', async (e) => {
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
        body: JSON.stringify({ nickname, word }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || '送信失敗');
        return;
      }

      myNumberDisplay.textContent = `あなたの番号は ${result.number} です。`;
      wordInput.value = '';
    } catch (err) {
      alert('サーバーエラー');
    }
  });

  socket.on('sentence', (sentence) => {
    sentenceDisplay.textContent = `完成した文：${sentence}`;
  });

  socket.on('statusUpdate', (statusMap) => {
    const lines = Object.entries(statusMap).map(
      ([num, name]) => `番号${num}: ${name} が入力済み`
    );
    status.textContent = lines.join('\n');
  });
});
