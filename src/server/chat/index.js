import sillyname from 'sillyname';

let messages = {};

function saveMessage (room, person, message) {
  if (!messages[room]) {
    messages[room] = [];
  }
  messages[room].push([person, message]);
}

function getMessages (room) {
  return messages[room];
}

function socketsInRoom (io, room) {
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

function speakTo (io, target, who, said) {
  for (let id in io.sockets.connected) {
    if (io.sockets.connected.hasOwnProperty(id)) {
      if (io.sockets.connected[id].name === target) {
        return io.sockets.connected[id].emit('said', [who, said]);
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
      socket.emit('said', [socket.name, said]);
      speakTo(io, target, socket.name, said);
    }
  });

  socket.on('disconnect', () => {
    io.in(socket.room).emit('leave', socket.name);
  });

  socket.on('enter', (entered) => {
    if (socket.room !== entered) {
      console.log(`@${socket.name} /join #${entered}`);
      if (socket.room) {
        io.in(socket.room).emit('leave', socket.name);
        socket.leave(socket.room);
      }
      socket.room = entered;
      socket.join(socket.room);
      socket.emit('history', getMessages(socket.room));
      socket.emit('online', socketsInRoom(io, socket.room));
      io.in(socket.room).emit('join', socket.name);
      io.emit('rooms', getRooms(io));
    }
  });

};
