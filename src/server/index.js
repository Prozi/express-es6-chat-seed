import express   from 'express';
import ejs       from 'ejs';
import socketio  from 'socket.io';
import path      from 'path';
import http      from 'http';
import sillyname from 'sillyname';
import routes    from './routes';
import chat      from './chat';

const app = express();
let dir = (part) => path.join(__dirname, part);

// view engine
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// views dir
app.use(express.static(dir('../public')));
app.use(express.static(dir('../../dist')));
app.set('views', dir('../public/views'));

// npm js dir for frontend
app.use(express.static(dir('../../node_modules')));

// cors, rest
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

// route handler
app.use('/', routes);

// start http server
const server = http.createServer(app).listen(3000, () => {
	const {address, port} = server.address();
	console.log(`Chat app listening at http://${address}:${port}`);
});

// start socket
const io = socketio.listen(server);

io.on('connect', (socket) => {
  console.log('socket:connect');
  socket.on('handshake:chat', (data) => {
  	chat(io, socket);
  });
});
