'use strict';

export default angular.module('myApp')
  .controller('PrivChatCtrl', 
  	['$scope', '$log', '$mdSidenav', '$mdDialog', 'chatSocket', 
  	($scope, $log, $mdSidenav, $mdDialog, chatSocket) => {

	$scope.message = '';
	$scope.newRoom = '';
	$scope.chat    = chatSocket;
	$scope.popup   = true;

	$scope.say = () => {
		$scope.chat.priv($scope.message);
		$scope.message = '';
	};

}]);
