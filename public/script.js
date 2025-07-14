const socket = io();

const form = document.getElementById('wordForm');
const nicknameInput = document.getElementById('nickname');
const wordInput = document.getElementById('word');
const statusList = document.getElementById('statusList');
const result = document.getElementById('result');
const numberDisplay = document.getElementById('numberDisplay');

let myNumber = null;

document.getElementById('decideBtn').addEventListener('click', async () => {
  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    alert('ニックネームを入力してください。');
    return;
  }

  try {
    const response = await fetch('/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'エラーが発生しました');
      return;
    }

    myNumber = data.number;
    numberDisplay.textContent = `あなたの番号は「${myNumber}」です`;
  } catch (err) {
    alert('サーバーに接続できませんでした。');
  }
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, word }),
    });

    const resultData = await response.json();
    if (!response.ok) {
      alert(resultData.message || '送信に失敗しました。');
      return;
    }

    wordInput.value = '';
  } catch (err) {
    alert('サーバーに接続できませんでした。');
  }
});

socket.on('statusUpdate', (data) => {
  statusList.innerHTML = '';
  for (let i = 1; i <= 3; i++) {
    const li = document.createElement('li');
    if (data[i]) {
      li.textContent = `${i}番: ${data[i]}`;
    } else {
      li.textContent = `${i}番: （未入力）`;
    }
    statusList.appendChild(li);
  }
});

socket.on('sentence', (sentence) => {
  result.textContent = sentence;
});