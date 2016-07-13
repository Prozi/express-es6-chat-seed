'use strict';

export default angular.module('myApp')
  .controller('PrivChatCtrl', 
	['$rootScope', '$scope', '$log', '$mdSidenav', '$mdDialog', 'chatSocket', 
	($rootScope, $scope, $log, $mdSidenav, $mdDialog, chatSocket) => {

	let messages = [];

	$scope.chat    = chatSocket;
	$scope.popup   = true;
	$scope.message = '';

	$scope.getMessages = () => messages;

	$scope.say = () => {
		$scope.chat.priv($rootScope.privPartner, $scope.message);
		$scope.message = '';
	};

}]);
