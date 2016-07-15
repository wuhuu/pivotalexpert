(function() {

  angular
    .module('app.layout')
    .controller('NavbarController', NavbarController);

  NavbarController.$inject = ['$scope', 'authService'];

  function NavbarController($scope, authService) {
      //Retrieve User Display Name
	  var user = authService.fetchAuthData();
	  user.$loaded().then(function () {
        $scope.publicId = user.publicId;
      });
	  
  }
  

})();