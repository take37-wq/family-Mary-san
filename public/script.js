const socket = io();

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wordForm');
  const nicknameInput = document.getElementById('nickname');
  const wordInput = document.getElementById('word');
  const numberStatus = document.getElementById('numberStatus');
  const nicknamesDisplay = document.getElementById('nicknames');
  const sentenceDisplay = document.getElementById('sentence');
  const checkNumberBtn = document.getElementById('checkNumber');

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
        body: JSON.stringify({ nickname, word })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || '送信に失敗しました。');
        return;
      }

      numberStatus.textContent = `あなたの番号は「${result.number}」です`;
      wordInput.value = '';
    } catch (err) {
      console.error(err);
      alert('サーバーに接続できませんでした。');
    }
  });

  checkNumberBtn.addEventListener('click', async () => {
    const nickname = nicknameInput.value.trim();
    if (!nickname) {
      alert('先にニックネームを入力してください');
      return;
    }

    try {
      const res = await fetch('/number-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });

      const data = await res.json();
      if (res.ok) {
        numberStatus.textContent = `あなたの番号は「${data.number}」です`;
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('番号の取得に失敗しました');
    }
  });

  socket.on('statusUpdate', (data) => {
    const status = Object.entries(data)
      .map(([num, name]) => `番号${num}: ${name}`)
      .join('<br>');
    nicknamesDisplay.innerHTML = status;
  });

  socket.on('sentence', (text) => {
    sentenceDisplay.textContent = `完成した文：${text}`;
  });
});
