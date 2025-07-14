document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wordForm');
  const nicknameInput = document.getElementById('nickname');
  const wordInput = document.getElementById('word');
  const myNumberDisplay = document.getElementById('myNumberDisplay');
  const sentenceDisplay = document.getElementById('sentenceDisplay');
  const status = document.getElementById('status');

  const socket = io();

  let assignedNumber = null;
  let assignedNickname = '';

  nicknameInput.addEventListener('blur', async () => {
    const nickname = nicknameInput.value.trim();
    if (!nickname || nickname === assignedNickname) return;

    try {
      const response = await fetch('/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || '参加できませんでした');
        nicknameInput.value = '';
        return;
      }

      assignedNumber = result.number;
      assignedNickname = nickname;
      myNumberDisplay.textContent = `あなたの番号は ${assignedNumber} です。`;
    } catch (err) {
      alert('サーバーに接続できませんでした。');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nickname = nicknameInput.value.trim();
    const word = wordInput.value.trim();

    if (!nickname || !word || assignedNumber === null) {
      alert('ニックネームを入力して番号を取得してください。');
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
        alert(result.message || '送信に失敗しました');
        return;
      }

      wordInput.value = '';
    } catch (err) {
      alert('サーバーエラー');
    }
  });

  socket.on('statusUpdate', (statusMap) => {
    const lines = Object.entries(statusMap).map(
      ([num, name]) => `番号${num}: ${name} が入力済み`
    );
    status.textContent = lines.join('\n');
  });

  socket.on('sentence', (sentence) => {
    sentenceDisplay.textContent = `完成した文：${sentence}`;
  });
});
