'use strict';

import io from 'socket.io-client';

export default angular.module('myApp')
  .factory('chatSocket', ['$rootScope', '$log', ($rootScope, $log) => {

	let chat   = {};
	let socket = io.connect();

	chat.private  = []; // priv messages
	chat.messages = [];
	chat.online   = [];
	chat.rooms    = ['public'];
	chat.username = '';

	chat.on = (eventName, callback) => {
		socket.on(eventName, function () {
			let args = arguments;
			$rootScope.$apply(() => {
				if (callback) {
					callback.apply(socket, args);
				}
			});
		});
	};

	chat.emit = (eventName, data, callback) => {
		socket.emit(eventName, data, function () {
			let args = arguments;
			$rootScope.$apply(() => {
				if (callback) {
					callback.apply(socket, args);
				}
			});
		})
	};

	chat.say = (message) => {
		if (message) {
			let trimmed = message.trim();
			if (trimmed) {
				chat.emit('say', trimmed);
				chat.messages.push({ username: chat.username, message: trimmed });
			}
		}
	};

	chat.priv = (target, message) => {
		if (message) {
			let trimmed = message.trim();
			if (trimmed) {
				chat.emit('priv', [target, trimmed]);
				chat.private.push({ username: chat.username, message: trimmed });
			}
		}
	};

	chat.trim = (array) => {
		while (array.length > 10) {
			array.shift();
		}
	};

	chat.requestPrivate = (who) => {
		chat.emit('requestPrivate', who);
	};

	chat.on('history', (data) => {
		chat.messages = [];
		if (Array.isArray(data)) {
			data.map((element) => {
				chat.messages.push({ username: element[0], message: element[1] });
			});
		}
	});

	chat.on('privHistory', (data) => {
		chat.private = [];
		if (Array.isArray(data)) {
			data.map((element) => {
				chat.private.push({ username: element[0], message: element[1] });
			});
		}
	});

	chat.on('rooms', (data) => {
		if (Array.isArray(data)) {
			chat.rooms = data;
		}
	});

	chat.on('welcome', (data) => {
		chat.username = data;
		chat.online.push(data);
	});

	chat.on('said', (data) => {
		let [username, message] = data;
		chat.messages.push({ username, message });
		chat.trim(chat.messages);
	});

	chat.on('prived', (data) => {
		let [username, message] = data;
		chat.private.push({ username, message });
		chat.trim(chat.private);
	});

	chat.on('leave', (data) => {
		let index = chat.online.indexOf(data);
		if (index !== -1) {
			chat.online.splice(index, 1);
		}
	});

	chat.on('joined', (data) => {
		if (chat.online.indexOf(data) === -1) {
			chat.online.push(data);
		}
	});

	chat.on('online', (data) => {
		if (Array.isArray(data)) {
			chat.online = data;
		}
	});

	chat.emit('handshake:chat');
	chat.emit('join', 'public');

	return chat;

}]);
