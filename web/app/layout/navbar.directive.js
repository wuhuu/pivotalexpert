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
 
  NavbarController.$inject = ['$firebaseObject','$scope', 'authService'];

  function NavbarController($firebaseObject,$scope, authService) {
      //Retrieve User Display Name
	  var user = authService.fetchAuthData();
    user.$loaded().then(function(){
      $scope.displayName = user.displayName;
    });
  }
  

})();