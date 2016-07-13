'use strict';

export default angular.module('myApp')
  .controller('PrivChatCtrl', 
	['$rootScope', '$scope', '$log', '$mdSidenav', '$mdDialog', 'chatSocket', 
	($rootScope, $scope, $log, $mdSidenav, $mdDialog, chatSocket) => {

	$scope.chat    = chatSocket;
	$scope.popup   = true;
	$scope.message = '';

	$scope.chat.requestPrivate($rootScope.privPartner);

	$scope.getMessages = () => $scope.chat.private;

	$scope.say = () => {
		$scope.chat.priv($rootScope.privPartner, $scope.message);
		$scope.message = '';
	};

}]);
