const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

const users = {};
const words = {};

app.use(express.static(path.join(__dirname, '.')));

io.on('connection', (socket) => {
  console.log('接続されました');

  socket.on('set nickname', (name) => {
    users[socket.id] = name;
    socket.nickname = name;
    updateStatus();
  });

  socket.on('submit word', ({ nickname, word }) => {
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
