
var myApp = angular.module('myApp', []);

myApp.config(($interpolateProvider) => {
	$interpolateProvider.startSymbol('[[');
	$interpolateProvider.endSymbol(']]');
});

myApp.directive('happyface', () => ({ template: '(╯°□°）╯' }));

myApp.factory('socket', ['$rootScope', ($rootScope) => {
	var socket = io.connect();
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
