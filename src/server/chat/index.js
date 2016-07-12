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

export default (io, socket) => {

  console.log('chat:connected!');

  let room;

  socket.name = sillyname().split(' ').pop();
  socket.emit('welcome', socket.name);

  socket.on('say', (said) => {
    if (room) {
      console.log(`@${socket.name}#${room}: ${said}`);
      io.in(room).emit('said', [socket.name, said]);
      saveMessage(room, socket.name, said);
    }
  });

  socket.on('disconnect', () => {
    io.in(room).emit('leave', socket.name);
  });

  socket.on('enter', (entered) => {
    if (room !== entered) {
      console.log(`@${socket.name} /join #${entered}`);
      if (room) {
        io.in(room).emit('leave', socket.name);
        socket.leave(room);
      }
      room = entered;
      socket.join(room);
      socket.emit('history', getMessages(room));
      socket.emit('online', socketsInRoom(io, room));
      io.in(room).emit('join', socket.name);
    }
  });

};
