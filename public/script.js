document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wordForm');
  const nicknameInput = document.getElementById('nickname');
  const wordInput = document.getElementById('word');
  const numberStatus = document.getElementById('numberStatus');
  const sentenceArea = document.getElementById('sentenceArea');

  const socket = io();

  socket.on('statusUpdate', (data) => {
    const lines = Object.entries(data)
      .sort((a, b) => a[0] - b[0])
      .map(([num, name]) => `番号 ${num}: ${name}`);
    numberStatus.textContent = `入力済み：\n${lines.join('\n')}`;
  });

  socket.on('sentence', (sentence) => {
    sentenceArea.textContent = `完成した文：${sentence}`;
  });

  socket.on('yourNumber', ({ number, nickname }) => {
    const existing = numberStatus.textContent;
    numberStatus.textContent = `あなた（${nickname}）の番号は ${number} です\n` + existing;
  });

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

      wordInput.value = '';
    } catch (err) {
      console.error('エラー:', err);
      alert('サーバーに接続できませんでした。');
    }
  });
});
