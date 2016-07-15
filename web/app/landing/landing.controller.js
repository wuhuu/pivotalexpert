(function() {

  angular
    .module('app.landing')
    .controller('LandingController', LandingController);

  LandingController.$inject = ['$scope', 'authService'];

  function LandingController($scope, authService) {
      //Retrieve User Display Name
	  var user = authService.fetchAuthData();
	  user.$loaded().then(function () {
        $scope.displayName = user.publicId;
      });
	  
  }

})();