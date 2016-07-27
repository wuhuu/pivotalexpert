(function() {

  angular
    .module('app.profile')
	.controller('ProfileController', ProfileController);

  ProfileController.$inject = ['$scope', '$routeParams', '$firebaseArray'];

  function ProfileController($scope, $routeParams, $firebaseArray) {
	
	$scope.profileId = $routeParams.profileId;
	console.log("Profile for :", $routeParams.profileId);
	
  };
  

})();