'use strict';

export default angular.module('myApp')
  .controller('ChatCtrl', 
  	['$scope', '$log', '$mdSidenav', '$mdDialog', 'chatSocket', 
  	($scope, $log, $mdSidenav, $mdDialog, chatSocket) => {

	$scope.message = '';
	$scope.newRoom = '';
	$scope.chat    = chatSocket;
	$scope.popup   = false;

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

	$scope.toggle = (name) => {
		$mdSidenav(name).toggle();
	};

	$scope.priv = ($event, name) => {
	    $mdDialog.show({
	      controller: 'PrivChatCtrl',
	      templateUrl: 'templates/dialog-priv.html',
	      parent: angular.element(document.body),
	      targetEvent: $event,
	      clickOutsideToClose: true,
	      fullscreen: false
	    });
	};

}]);
