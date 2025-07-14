let assignedNumber = null;
let nickname = "";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wordForm');
  const nicknameInput = document.getElementById('nickname');
  const wordInput = document.getElementById('word');
  const numberDisplay = document.getElementById('myNumber');

  const socket = io();

  nicknameInput.addEventListener('blur', async () => {
    nickname = nicknameInput.value.trim();
    if (!nickname || assignedNumber) return;

    try {
      const res = await fetch('/preassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });
      const data = await res.json();
      if (res.ok) {
        assignedNumber = data.number;
        numberDisplay.textContent = `あなたの番号は ${assignedNumber} です`;
      } else {
        numberDisplay.textContent = data.message || "エラーが発生しました";
      }
    } catch (err) {
      numberDisplay.textContent = "サーバーに接続できません";
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const word = wordInput.value.trim();
    if (!nickname || !word) {
      alert("ニックネームと単語を入力してください。");
      return;
    }

    try {
      const res = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, word })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "送信に失敗しました");
        return;
      }
      wordInput.value = '';
    } catch {
      alert("サーバーに接続できません");
    }
  });

  socket.on('statusUpdate', (status) => {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const name = status[i] || '未入力';
      statusDiv.innerHTML += `番号${i}：${name}<br>`;
    }
  });

  socket.on('sentence', (sentence) => {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = `完成した文：${sentence}`;
  });
});
