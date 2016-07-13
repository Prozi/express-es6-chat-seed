import sillyname from 'sillyname';

let messages = {};
let privateMessages = {};

function saveMessage (room, person, message) {
  if (!messages[room]) {
    messages[room] = [];
  }
  messages[room].push([person, message]);
}

function getMessagesForRoom (room) {
  return messages[room];
}

function getSocketsInRoom (io, room) {
  let res = [];
  for (let id in io.sockets.adapter.rooms[room].sockets) {
    if (io.sockets.connected.hasOwnProperty(id)) {
      res.push(io.sockets.connected[id].name);
    }
  }
  return res;
}

function getRooms (io) {
  let res = [];
  for (let room in io.sockets.adapter.rooms) {
    if (room[0] !== '/') {
      res.push(room);
    }
  }
  return res;
}

function getFakeRoom (who, target) {
  return who < target ? `${who}-${target}` : `${target}-${who}`;
}

function savePrivateMessage (who, target, said) {
  let fakeRoom = getFakeRoom(who, target);
  if (!privateMessages[fakeRoom]) {
    privateMessages[fakeRoom] = [];
  }
  privateMessages[fakeRoom].push([who, said]);
  // console.log(JSON.stringify(privateMessages, null, 2));
}

function getPrivateMessages (who, target) {
  let fakeRoom = getFakeRoom(who, target);
  return privateMessages[fakeRoom] || [];
}

function speakTo (io, target, who, said) {
  for (let id in io.sockets.connected) {
    if (io.sockets.connected.hasOwnProperty(id)) {
      if (io.sockets.connected[id].name === target) {
        io.sockets.connected[id].emit('prived', [who, said]);
        savePrivateMessage(who, target, said);
      }
    }
  }  
}

export default (io, socket) => {

  console.log('chat:connected!');

  socket.name = sillyname().split(' ').pop();
  socket.emit('welcome', socket.name);

  socket.on('say', (said) => {
    if (socket.room) {
      console.log(`@${socket.name}#${socket.room}: ${said}`);
      io.in(socket.room).emit('said', [socket.name, said]);
      saveMessage(socket.room, socket.name, said);
    }
  });

  socket.on('priv', (array) => {
    let [target, said] = array;
    if (socket.room) {
      console.log(`@${socket.name} to @${target}: ${said}`);
      socket.emit('prived', [socket.name, said]);
      speakTo(io, target, socket.name, said);
    }
  });

  socket.on('requestPrivate', (who) => {
    socket.emit('privHistory', getPrivateMessages(who, socket.name));
  });

  socket.on('disconnect', () => {
    io.in(socket.room).emit('leave', socket.name);
  });

  socket.on('join', (entered) => {
    if (socket.room !== entered) {
      console.log(`@${socket.name} /join #${entered}`);
      if (socket.room) {
        io.in(socket.room).emit('leave', socket.name);
        socket.leave(socket.room);
      }
      socket.room = entered;
      socket.join(socket.room);
      socket.emit('history', getMessagesForRoom(socket.room));
      socket.emit('online', getSocketsInRoom(io, socket.room));
      io.emit('rooms', getRooms(io));
      io.in(socket.room).emit('joined', socket.name);
    }
  });

};
