(function() {

  angular
	.module('app.auth', [])
    .config(configFunction);
  
  configFunction.$inject = ['$routeProvider'];
  
  function configFunction($routeProvider) {
    $routeProvider.
	when('/login', {
      templateUrl: 'app/auth/login.html',
		
    });
  }

})();