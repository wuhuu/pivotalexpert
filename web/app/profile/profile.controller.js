(function() {

  angular
    .module('app.profile')
	.controller('ProfileController', ProfileController);

  ProfileController.$inject = ['$scope', '$routeParams', '$firebaseArray','authService','$location','navBarService'];

  function ProfileController($scope, $routeParams, $firebaseArray,authService,$location,navBarService) {
	
	$scope.displayName = $routeParams.displayName;

	$scope.updateDisplayName = function (newName,$firebaseAuth) {
		console.log("updating");
		var ref = new Firebase("https://pivotal-expert.firebaseio.com");
		var usersRef = ref.child('auth').child('users');
		var user = authService.fetchAuthData();

		usersRef.child(user.$id).update({displayName:newName});
		navBarService.updateNavBar($scope,newName);
		$location.path('/#/');
		window.location.reload();
	}
	
  };
  

})();