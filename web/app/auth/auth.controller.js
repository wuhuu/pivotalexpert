(function() {

  angular
    .module('app.auth')
    .controller('AuthController', AuthController);

  AuthController.$inject = ['$scope', '$location', 'authService'];

  function AuthController($scope, $location, authService) {
	
	$scope.login = function (service) {
	  console.log("Logging in");
	  authService.login(service)
		.then(function() {
          $location.path('/');
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
	}
	
  };
  

})();