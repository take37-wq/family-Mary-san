document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wordForm');
  const nicknameInput = document.getElementById('nickname');
  const wordInput = document.getElementById('word');
  const statusList = document.getElementById('statusList');

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
        body: JSON.stringify({ nickname, word }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || '送信に失敗しました。');
        return;
      }

      alert(`送信が完了しました！ あなたの番号は${result.number}です`);
      wordInput.value = '';
    } catch (err) {
      console.error('エラー:', err);
      alert('サーバーに接続できませんでした。');
    }
  });

  socket.on('sentence', (sentence) => {
    alert(`完成した文：${sentence}`);
    statusList.innerHTML = '';
  });

  socket.on('statusUpdate', (statusMap) => {
    statusList.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const li = document.createElement('li');
      li.textContent = statusMap[i] ? `番号${i}：${statusMap[i]}` : `番号${i}：未入力`;
      statusList.appendChild(li);
    }
  });
});
