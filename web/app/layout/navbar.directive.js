(function() {

  angular
    .module('app.layout')
    .directive('mvNavbar', mvNavbar);

  function mvNavbar() {
    return {
      templateUrl: 'app/layout/navbar.html',
      restrict: 'E',
	  //Add controllers method if there any assoicate with it
	  controller: NavbarController
    };
  }
 
  NavbarController.$inject = ['$firebaseObject','$scope', '$location','authService'];

  function NavbarController($firebaseObject,$scope,$location, authService) {
      //Retrieve User Display Name
	  var user = authService.fetchAuthData();
	  console.log("Nav Bar");
	  if (user != null) {
		user.$loaded().then(function(){
		  $scope.displayName = user.displayName;
	    });
		  
	  } else {
		console.log("Not login, from Nav Bar");
		//$location.path('/login/');
	  }
  }
  

})();