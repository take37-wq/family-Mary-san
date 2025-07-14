const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

const users = {};               // socket.id => nickname
const nicknameToId = {};        // nickname => socket.id
const submittedIds = new Set(); // 投稿済み socket.id
const words = {};               // nickname => word

app.use(express.static(path.join(__dirname, '.')));

io.on('connection', (socket) => {
  console.log('接続されました');

  socket.on('set nickname', (name) => {
    if (Object.values(users).includes(name) || nicknameToId[name]) {
      socket.emit('nickname error', 'このニックネームは既に使われています');
      return;
    }
    users[socket.id] = name;
    nicknameToId[name] = socket.id;
    socket.nickname = name;
    updateStatus();
  });

  socket.on('submit word', ({ nickname, word }) => {
    if (!nickname || !word) return;

    const id = nicknameToId[nickname];
    if (!id || submittedIds.has(id)) {
      socket.emit('word error', '入力できません：すでに投稿済みです');
      return;
    }

    submittedIds.add(id);
    words[nickname] = word;

    if (Object.keys(words).length === 3) {
      const ordered = Object.entries(words).sort().map(([_, w]) => w);
      const sentence = ordered.join(' ');
      io.emit('result', sentence);
    }
  });

  socket.on('exit', (name) => {
    removeUser(socket.id, name);
  });

  socket.on('disconnect', () => {
    removeUser(socket.id, users[socket.id]);
  });

  function removeUser(id, name) {
    delete users[id];
    delete words[name];
    submittedIds.delete(id);
    delete nicknameToId[name];
    io.emit('user exited', name);
    updateStatus();
  }

  function updateStatus() {
    const nicknames = Object.values(users);
    io.emit('status update', nicknames);
  }
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
