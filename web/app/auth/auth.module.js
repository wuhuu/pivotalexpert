(function() {

  angular
	.module('app.auth', [])
    .config(configFunction);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	when('/login', {
      templateUrl: 'app/auth/login.html',
      controller: 'AuthController'
    }).when('/changeDisplayName',{
      templateUrl: 'app/auth/changeDisplayName.html',
      controller: 'AuthController'
    }).when('/createProfileLink',{
      templateUrl: 'app/auth/createProfileLink.html',
      controller: 'AuthController'
    });
  }

})();