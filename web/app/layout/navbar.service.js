(function() {

  angular
    .module('app.layout')
    .factory('navBarService', navBarService);

  navBarService.$inject = ['$firebaseArray', '$firebaseObject','authService'];
  
  function navBarService($firebaseObject, $firebaseAuth, authService) {
	   
	   var service = {
	      updateNavBar: updateNavBar
	    };
	
		return service;

	   	function updateNavBar($scope,newName) {
	      //Retrieve User Display Name
		  var user = authService.fetchAuthData();
		  $scope.displayName = newName;
		  user.$loaded().then(function () {
	        $scope.displayName = user.displayName;
	      });
	  	}
  }

})();