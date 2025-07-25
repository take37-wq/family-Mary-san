const socket = io();
let nickname = '';
let submitted = false;

document.getElementById('decideBtn').addEventListener('click', () => {
  const input = document.getElementById('nickname').value.trim();
  if (input && !nickname) {
    nickname = input;
    socket.emit('set nickname', nickname);
  }
});

document.getElementById('wordForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!nickname || submitted) return;

  const word = document.getElementById('word').value.trim();
  if (word) {
    socket.emit('submit word', { nickname, word });
  }
});

document.getElementById('exitBtn').addEventListener('click', () => {
  if (nickname) {
    socket.emit('exit', nickname);
  }
  window.location.href = 'index.html';
});

socket.on('status update', (nicknames) => {
  const statusList = document.getElementById('statusList');
  statusList.innerHTML = '';
  nicknames.forEach(name => {
    const li = document.createElement('li');
    li.textContent = `${name} さんが参加中`;
    statusList.appendChild(li);
  });
});

socket.on('result', (sentence) => {
  document.getElementById('result').textContent = sentence;
  submitted = true;
});

socket.on('user exited', (name) => {
  alert(`${name} さんが退出しました`);
  document.getElementById('word').value = '';
  submitted = false;
});

socket.on('nickname error', (msg) => {
  alert(msg);
  nickname = '';
});

socket.on('word error', (msg) => {
  alert(msg);
  submitted = true;
});
