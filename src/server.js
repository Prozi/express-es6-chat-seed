import express   from 'express';
import swig      from 'swig';
import io        from 'socket.io';
import path      from 'path';
import http      from 'http';
import sillyname from 'sillyname';
import routes    from './routes/main.routes';

const app = express();
let dir = (part) => path.join(__dirname, part);

// use jade
const templateEngine = new swig.Swig();
app.engine('html', templateEngine.renderFile);
app.set('view engine', 'html');

// views dir
app.use(express.static(dir('public')));
app.set('views', dir('public/views'));

// npm js dir for frontend
app.use(express.static(dir('../node_modules')));

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
const sockets = io.listen(server);
sockets.on('connect', (socket) => {
	socket.id = sillyname().split(' ').pop();
	socket.emit('welcome', socket.id);
	socket.on('say', (data) => {
		sockets.emit('said', [socket.id, data])
	});
});
