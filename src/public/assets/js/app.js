/* for webpack */
import angular    from 'angular';
import ngAnimate  from 'angular-animate';
import ngMaterial from 'angular-material';

/* app */
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
		$log.log('welcome', data);
		$scope.chat.push({ socketId: 'Welcome', said: data });
		$scope.socketName = data;
	});
	socket.on('said', (data) => {
		let [socketId, said] = data;
		$scope.chat.push({ socketId, said });
		$scope.message = '';
		while ($scope.chat.length > 10) {
			$scope.chat.shift();
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
