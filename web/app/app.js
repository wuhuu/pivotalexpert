(function() { // Wrap in an IIFE

  angular
    .module('app', [
      // Angular modules.
      'ngRoute',

      // Third party modules.
      'firebase',

      // Custom modules.
      'app.layout',
	  'app.landing',
	  'app.auth',
	  'app.profile',

    ])
    .config(configFunction)
	

  configFunction.$inject = ['$locationProvider', '$routeProvider'];

  function configFunction($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('');
	$routeProvider.otherwise({
      redirectTo: '/'
    });
  }
  

})();
