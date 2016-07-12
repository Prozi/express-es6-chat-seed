'use strict';

export default angular.module('myApp')
  .controller('ChatCtrl', ['$scope', '$log', 'chatSocket', ($scope, $log, chatSocket) => {

	$scope.message = '';
	$scope.newRoom = '';
	$scope.chat    = chatSocket;

	$scope.say = () => {
		$scope.chat.say($scope.message);
		$scope.message = '';
	};

	$scope.createNewRoom = () => {
		let newRoom = $scope.newRoom.trim();
		if (newRoom) {
			$scope.chat.emit('enter', newRoom);
		}
		$scope.newRoom = '';
	};

	$scope.enterRoom = (room) => {
		$scope.chat.emit('enter', room);
	};

}]);