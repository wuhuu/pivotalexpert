(function() {

  angular
    .module('app.auth')
    .controller('AuthController', AuthController);

  AuthController.$inject = ['$scope', '$location', 'authService','navBarService','$firebaseObject'];

  function AuthController($scope, $location, authService,navBarService,$firebaseObject) {
	
	$scope.login = function (service) {
	  console.log("Logging in");
	  authService.login(service,$scope)
		.then(function() {
		//$location.path('/#/profile/'+$scope.displayName);
		//$location.path('/');
        })
	    .catch(function (error) {
          console.log("Authentication failed:", error);
        });
      
	  //method to retrieve user from db
	  //var user = authService.fetchAuthData();
	  //user.$loaded().then(function () {
        //console.log("User publicID:", user.publicId);
      //});
	}
	
	$scope.logout = function () {
	  authService.logout();
	  $location.path('/');
	}

	var check = authService.fetchAuthData();
		if(check==null) {
			$scope.logined= true;
		}else {
			$scope.logined= false;
		}
	
	
  };
  

})();