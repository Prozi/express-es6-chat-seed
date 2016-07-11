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

export default (sockets, socket) => {

  console.log('chat:connected!');

  let room;

  socket.name = sillyname().split(' ').pop();
  socket.emit('welcome', socket.name);

  socket.on('say', (said) => {
    if (room) {
      console.log(`@${socket.name}#${room}: ${said}`);
      sockets.in(room).emit('said', [socket.name, said]);
      saveMessage(room, socket.name, said);
    }
  });

  socket.on('enter', (entered) => {
    if (room !== entered) {
      console.log(`@${socket.name} /join #${entered}`);
      if (room) {
        socket.leave(room);
      }
      room = entered;
      socket.join(room);
      let history = getMessages(room);
      socket.emit('history', history);
    }
  });

};
