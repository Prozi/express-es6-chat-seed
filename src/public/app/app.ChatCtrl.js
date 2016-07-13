'use strict';

export default angular.module('myApp')
  .controller('ChatCtrl', 
	['$rootScope', '$scope', '$log', '$mdSidenav', '$mdDialog', 'chatSocket', 
	($rootScope, $scope, $log, $mdSidenav, $mdDialog, chatSocket) => {

	$scope.newRoom = '';
	$scope.chat    = chatSocket;
	$scope.message = '';
	$scope.popup   = false;

	$scope.getMessages = () => $scope.chat.messages;

	$scope.say = () => {
		$scope.chat.say($scope.message);
		$scope.message = '';
	};

	$scope.createNewRoom = () => {
		let newRoom = $scope.newRoom.trim();
		if (newRoom) {
			$scope.chat.emit('join', newRoom);
		}
		$scope.newRoom = '';
	};

	$scope.joinRoom = (room) => {
		$scope.chat.emit('join', room);
	};

	$scope.toggle = (name) => {
		$mdSidenav(name).toggle();
	};

	$scope.priv = ($event, name) => {
		$rootScope.privPartner = name;
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
