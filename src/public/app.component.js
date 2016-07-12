'use strict';

/* for webpack */
import io         from 'socket.io-client';
import angular    from 'angular';
import ngAnimate  from 'angular-animate';
import ngMaterial from 'angular-material';

let myApp = angular.module('myApp', [ngAnimate, ngMaterial]);

myApp.directive('happyface', () => ({ template: '(╯°□°）╯' }));

myApp.factory('socket', ['$rootScope', ($rootScope) => {
	var socket = io.connect();
	socket.emit('handshake:chat');
	socket.emit('enter', 'public');
	return {
		on: (eventName, callback) => {
			socket.on(eventName, function () {
				var args = arguments;
				$rootScope.$apply(() => {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		},
		emit: (eventName, data, callback) => {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(() => {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
}]);

myApp.controller('ChatCtrl', ['$scope', '$log', 'socket', ($scope, $log, socket) => {
	$scope.chat = [];
	$scope.online = [];
	$scope.message = '';
	socket.on('history', (data) => {
		$log.log('history');
		if (Array.isArray(data)) {
			data.map((element) => {
				$scope.chat.push({ socketId: element[0], said: element[1] });
			});
		}
	});
	socket.on('welcome', (data) => {
		$scope.socketName = data;
		$scope.online.push(data);
	});
	socket.on('said', (data) => {
		let [socketId, said] = data;
		$scope.chat.push({ socketId, said });
		$scope.message = '';
		while ($scope.chat.length > 10) {
			$scope.chat.shift();
		}
	});
	socket.on('leave', (data) => {
		let index = $scope.online.indexOf(data);
		if (index !== -1) {
			$scope.online.splice(index, 1);
		}
	});
	socket.on('join', (data) => {
		if ($scope.online.indexOf(data) === -1) {
			$scope.online.push(data);
		}
	});
	socket.on('online', (data) => {
		if (Array.isArray(data)) {
			$scope.online = data;
		}
	});
	$scope.send = () => {
		var msg = $scope.message.trim();
		if (msg) {
			socket.emit('say', msg);
		}
	};
}]);

myApp.directive('chat', () => ({ templateUrl: 'templates/chat.html' }));
